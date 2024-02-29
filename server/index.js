const express = require("express");
const app = express();

const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { start } = require("repl");
const { log } = require("console");
const e = require("express");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://192.168.0.13:5173"],
    methods: ["GET", "POST"],
  },
  connectionStateRecovery: {
    maxDisconnectionDuration: 2 * 60 * 1000,
    skipMiddlewares: true,
  },
});

const waitingPlayers = {};
const players = {};
const rooms = {};
const playarTime = {};

const playAgainTimeouts = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("try_recconection", (data) => {
    // Here, request the opponent player's state of the chessboard, and also return the time, player names... etc., in order to restore the game.
    // console.log(data);
    const { room, oldSocketID } = data;

    if (rooms[room]) {
      const playerReconnected = rooms[room].players.find(
        (player) => player.socketId === oldSocketID
      );

      if (playerReconnected) {
        playerReconnected.newSocketID = socket.id;
        const opponenet = rooms[room].players.find(
          (player) => player.socketId !== oldSocketID
        );
        if (opponenet) {
          io.to(opponenet.socketId).emit("try_recconection", {
            newSocketID: socket.id,
          });
        } else {
          console.log("reconnect failed");
        }
      } else {
        console.log("reconnect failed");
      }
    } else {
      console.log("reconnect failed");
    }
  });

  socket.on("reponse_try_reconection", (data) => {
    const { room, newSocketID } = data;
    // ovde poslati sve potrebne informacije za nastavak partije samo igracu koji je dobio novi socketID
    const reconnectPlayer = rooms[room].players.find(
      (player) => player.newSocketID === newSocketID
    );

    if (reconnectPlayer) {
      const dataToSend = {
        success: false,
        room: room,
        newSocketID: newSocketID,
      };

      // ovde zameniti stari socket.id sa novim socket.id
      io.to(reconnectPlayer.newSocketID).emit(
        "reponse_try_reconection",
        dataToSend
      );
    }
  });

  // Find player
  socket.on("find_player", (data) => {
    if (Object.keys(waitingPlayers).length === 0) {
      waitingPlayers[socket.id] = { socketId: socket.id, name: data.name };
      const room = gemerateRoomName();
      rooms[room] = {
        players: [
          {
            socketId: socket.id,
            name: data.name,
            draw: 0,
            victories: 0,
            defeats: 0,
          },
        ],
      };
      players[socket.id] = { name: data.name, room, onMove: false };

      socket.emit("room_joined", room, (err) => {
        if (err) {
          socket.emit("error_room_enter");
        } else {
          socket.join(room);
          console.log(`room: ${room} name: ${players[socket.id].name} joined.`);
        }
      });
    } else {
      const keys = Object.keys(waitingPlayers);
      const firstKey = keys[0];

      delete waitingPlayers[firstKey];

      const room = players[firstKey].room;

      if (rooms[room].players.length < 2) {
        rooms[room].players.push({
          socketId: socket.id,
          name: data.name,
          draw: 0,
          victories: 0,
          defeats: 0,
        });
        players[socket.id] = { name: data.name, room: room, onMove: false };

        socket.emit("room_joined", room, (err) => {
          if (err) {
            socket.emit("error_room_enter");
          } else {
            socket.join(room);
            console.log(
              `room: ${room} name: ${players[socket.id].name} joined.`
            );
            const firstMove = Math.round(Math.random());

            rooms[room].players[firstMove].onMove = true;

            players[rooms[room].players[0].socketId].timeRemaining = 600;
            players[rooms[room].players[1].socketId].timeRemaining = 600;

            const dataToSend = {
              players: rooms[room],
              firstMove: rooms[room].players[firstMove].socketId,
            };

            io.in(room).emit("game_starting", dataToSend);

            setTimeout(() => {
              io.in(room).emit("start_game", dataToSend);
              startPlayerTimer(rooms[room].players[firstMove].socketId);
            }, 3000);
          }
        });
      }
    }
  });

  // Friend connection
  socket.on("join_make_room", (data) => {
    const { name, room } = data;
    if (rooms[room]) {
      const roomPlayers = rooms[room].players;
      if (roomPlayers.length < 2) {
        roomPlayers.push({
          socketId: socket.id,
          name,
          draw: 0,
          victories: 0,
          defeats: 0,
        });
        players[socket.id] = { name, room, onMove: false };
        socket.emit("room_joined", room, (err) => {
          if (err) {
            socket.emit("error_room_enter");
          } else {
            console.log(`room: ${room} name: ${name} joined..`);
            socket.join(room);
            if (rooms[room].players.length === 2) {
              const firstMove = Math.round(Math.random());
              roomPlayers[firstMove].onMove = true;

              players[roomPlayers[0].socketId].timeRemaining = 600;
              players[roomPlayers[1].socketId].timeRemaining = 600;

              const dataToSend = {
                players: rooms[room],
                firstMove: roomPlayers[firstMove].socketId,
              };
              console.log(rooms[room]);
              io.in(room).emit("game_starting", dataToSend);

              setTimeout(() => {
                startPlayerTimer(roomPlayers[firstMove].socketId);
                io.in(room).emit("start_game", dataToSend);
              }, 3000);
              console.log("start_game");
            }
          }
        });
      } else {
        socket.emit("room_full");
        console.log("room_full");
      }
    } else {
      rooms[room] = {
        players: [
          {
            socketId: socket.id,
            name,
            draw: 0,
            victories: 0,
            defeats: 0,
          },
        ],
      }; //

      players[socket.id] = { name, room, onMove: false };
      socket.emit("room_joined", room, (err) => {
        if (err) {
          socket.emit("error_room_enter");
        } else {
          socket.join(room);
          console.log(`room: ${room} name: ${name} joined.`);
        }
      });
    }
  });

  // passing moves between players
  socket.on("player_move", (data) => {
    const { room } = data;

    const roomPlayers = rooms[room].players;
    const currentPlayer = roomPlayers.find((player) => player.onMove);
    if (currentPlayer && currentPlayer.socketId === socket.id) {
      const opponent = roomPlayers.find(
        (player) => player.socketId !== socket.id
      );

      if (opponent) {
        io.to(opponent.socketId).emit("opponent_move", data);
        currentPlayer.onMove = false;
        opponent.onMove = true;

        stopPlayerTimer(socket.id);

        startPlayerTimer(opponent.socketId);
      }
    }
  });

  // Socket event that occurs when one of the players declares the conclusion of the game, either a victory or a stalemate position.
  socket.on("end_game", (data) => {
    const { room, result } = data;
    const opponent = rooms[room].players.find(
      (player) => player.socketId !== socket.id
    );
    const dataToSend = {
      type: result,
    };
    if (opponent) {
      io.to(opponent.socketId).emit("end_game_confirmation", dataToSend);
      stopPlayerTimer(opponent.socketId);
    } else {
      socket.emit("opponent_left");
    }
  });

  // Socket event that occurs when the second player confirms defeat or a stalemate position.
  socket.on("end_game_confirmed", (data) => {
    const { room, result } = data;

    if (rooms[room]) {
      const roomPlayers = rooms[room].players;
      const opponent = roomPlayers.find(
        (player) => player.socketId !== socket.id
      );
      const currentPlayer = roomPlayers.find(
        (player) => player.socketId === socket.id
      );

      if (result === "win") {
        opponent.victories++;
        currentPlayer.defeats++;
      } else {
        opponent.draw++;
        currentPlayer.draw++;
      }

      io.to(room).emit("play_again_prompt");
    }
  });

  socket.on("play_again", (data) => {
    const { room, response } = data;
    if (rooms[room]) {
      const player = rooms[room].players.find(
        (player) => player.socketId === socket.id
      );
      player.playAgainResponse = response;

      const responses = rooms[room].players.map(
        (player) => player.playAgainResponse
      );

      if (responses.every((response) => response === "yes")) {
        // Both players want to play again
        const firstMove = Math.round(Math.random());
        rooms[room].players.forEach((player) => {
          player.onMove = false;
          player.playAgainResponse = undefined;
        });
        rooms[room].players[firstMove].onMove = true;

        players[rooms[room].players[0].socketId].timeRemaining = 600;
        players[rooms[room].players[1].socketId].timeRemaining = 600;

        const dataToSend = {
          players: rooms[room],
          firstMove: rooms[room].players[firstMove].socketId,
        };
        io.in(room).emit("game_starting", dataToSend);

        if (playAgainTimeouts[room]) {
          clearTimeout(playAgainTimeouts[room]);
          delete playAgainTimeouts[room];
        }

        setTimeout(() => {
          startPlayerTimer(rooms[room].players[firstMove].socketId);
          io.in(room).emit("start_game", dataToSend);
        }, 3000);
      } else if (responses.some((response) => response === "no")) {
        if (playAgainTimeouts[room]) {
          clearTimeout(playAgainTimeouts[room]);
          delete playAgainTimeouts[room];
        }
        const playerToSend = rooms[room].players.find(
          (player) => player.playAgainResponse !== "no"
        );
        if (playerToSend) {
          io.to(playerToSend.socketId).emit("opponent_left");
        }
      } else if (response === "yes") {
        const opponenetTime = setTimeout(() => {
          if (rooms[room]) {
            io.to(socket.id).emit("opponent_left");
          }
        }, 3 * 60 * 1000);
        playAgainTimeouts[room] = opponenetTime;
      }
    }
  });

  // socekt on user disconnected
  socket.on("disconnect", () => {
    setTimeout(() => {
      clearData(socket.id);
    }, 10000);

    console.log(`User disconnected: ${socket.id}`);
  });
});

server.listen(3001, () => {
  console.log("SERVER IS RUNNING");
});

// Player time
function startPlayerTimer(socketId) {
  playarTime[socketId] = setInterval(() => {
    players[socketId].timeRemaining -= 1;
    io.in(players[socketId].room).emit("update_timer", {
      time: players[socketId].timeRemaining,
      socketId: socketId,
    });

    if (players[socketId].timeRemaining <= 0) {
      // Vreme je isteklo, igrač je izgubio ili nešto drugo
      clearInterval(playarTime[socketId]);
      // Dodajte logiku za kraj igre ili bilo šta što želite
      console.log("Time is up");
    }
  }, 1000);
}

function stopPlayerTimer(socketId) {
  clearInterval(playarTime[socketId]);
}

// Room name generator
function gemerateRoomName() {
  let roomName;

  do {
    roomName = Math.random().toString(16).substring(2, 12);
  } while (rooms[roomName]);

  return roomName;
}

function clearData(socketID) {
  if (players[socketID]) {
    if (playarTime[socketID]) {
      stopPlayerTimer(socketID);
      delete playarTime[socketID];
    }

    const room = players[socketID].room;

    if (rooms[room]) {
      const index = rooms[room].players.findIndex(
        (player) => player.socketId === socketID
      );
      if (index !== -1) {
        rooms[room].players.splice(index, 1);
        delete players[socketID];

        if (rooms[room].players.length === 0) {
          delete rooms[room];
          console.log("Room is deleted: " + room);
        }
      }
    }
  }
}
