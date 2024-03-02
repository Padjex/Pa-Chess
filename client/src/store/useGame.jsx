import { create } from "zustand";
import { io } from "socket.io-client";
import { attackedSquare } from "../components/game/chessCheck/chessHelper";
import { checkAvailableSquares } from "../components/game/chessCheck/chessHelper";

export default create((set, get) => {
  ////
  /////// SOCKET IO
  ////
  const socket = io.connect("http://localhost:3001");

  socket.on("connect", () => {
    // if (
    //   localStorage.getItem("socketID") &&
    //   localStorage.getItem("room") &&
    //   localStorage.getItem("lastTimeOnLine")
    // ) {
    //   const lastTimeOnLine = localStorage.getItem("lastTimeOnLine");
    //   const currentTime = new Date().getTime();
    //   const elapsedTime = currentTime - parseInt(lastTimeOnLine);
    //   const oneMinut = 1 * 60 * 1000;
    //   if (elapsedTime > oneMinut) {
    //     localStorage.clear();
    //     set({ playerSockedID: socket.id });
    //   } else {
    //     const dataToSend = {
    //       room: localStorage.getItem("room"),
    //       oldSocketID: localStorage.getItem("socketID"),
    //     };
    //     console.log(elapsedTime);
    //     socket.emit("try_recconection", dataToSend);
    //   }
    // } else {
    //   localStorage.clear();
    //   set({ playerSockedID: socket.id });
    // }
  });

  // Socket event triggered when the opponent player successfully reconnects and requests data back
  // socket.on("try_recconection", (data) => {
  //   console.log(data);
  //   const dataToSend = {
  //     success: false,
  //     room: get().room,
  //     newSocketID: data.newSocketID,
  //   };
  //   // ovde pokupiti podatke i poslati na server

  //   // socket.emit("reponse_try_reconection", dataToSend);
  // });

  // // Socket event that occurs when the opponent player successfully sends the state of chessboard
  // socket.on("reponse_try_reconection", (data) => {
  //   console.log(data + "respone");
  //   if (data.success) {
  //     // ako su podati u redu, onda ovde setavati sve stateove kako bi se partija nastvavila
  //     console.log("reconnected");
  //   } else {
  //     localStorage.clear();
  //     console.log("reconnect failed");
  //   }
  // });

  // Socket event handler for when a player has joined a room
  socket.on("room_joined", (room, callback) => {
    set({ room: room, playerSockedID: socket.id });

    // For manages reconnection
    localStorage.setItem("socketID", socket.id);
    localStorage.setItem("room", room);
    callback();
  });

  // Socket event handler triggered when both players are in the room,
  // informing that the game is starting in 3 seconds
  socket.on("game_starting", (data) => {
    const opponenet = data.players.players.find(
      (player) => player.socketId !== socket.id
    );

    set({ players: data.players, opponenetSocketID: opponenet.socketId });

    if (data.firstMove === get().playerSockedID) {
      set({ playerColor: "white", opponentColor: "black" });
    } else {
      set({ playerColor: "black", opponentColor: "white" });
    }
  });

  // Socket event handler for when the game starts
  socket.on("start_game", (data) => {
    if (data.firstMove === get().playerSockedID) {
      set({
        onMove: true,
        opponentOnMove: false,
      });
    } else {
      set({
        opponentOnMove: true,
      });
    }
  });

  // Socket event handler for when the opponent makes a move
  socket.on("opponent_move", (data) => {
    const { moveData } = data;

    const currentMatrix = get().chessMatrix;

    // const opponenetMoves = get().opponenetMoves;
    // console.log(opponenetMoves);

    // save data for reconnection
    localStorage.setItem("lastTimeOnLine", new Date().getTime());
    // localStorage.setItem("opponentMoves", opponenetMoves);

    const { newMatrix, captured } = updateMatrix(
      currentMatrix,
      moveData.tableLocationTo,
      moveData.figure,
      moveData.castling,
      moveData.enPassantPlayed
    );

    const x = moveData.tableLocationTo[0];
    const y = moveData.tableLocationTo[1];
    const move = newMatrix[x][y];

    const opponentMove = {
      figure: moveData.figure,
      tableLocationFrom: moveData.tableLocationFrom,
      tableLocationTo: moveData.tableLocationTo,
      captured: moveData.captured,
    };
    if (moveData.enPassantPlayed) {
      opponentMove.enPassantPlayed = moveData.enPassantPlayed;
    }

    const newStates = {
      chessMatrix: newMatrix,
      applyMove: move,
      opponentMoves: [...get().opponentMoves, opponentMove],
      opponentOnMove: false,
      onMove: true,
    };

    if (moveData.checkKingOpponent) {
      newStates.checkKingPlayer = true;
      opponentMove.checkKingOpponent = true;
    }

    if (get().checkKingOpponent) {
      newStates.checkKingOpponent = false;
    }

    if (captured !== "empty") {
      newStates.applyCapture = [...get().applyCapture, captured];
    }

    if (moveData.enPassant) {
      newStates.enPassantPossibility = [x, y];
    }

    if (moveData.castling) {
      newStates.castling = moveData.castling;
      const applyCastling = {};
      const opponentColor = get().opponentColor;
      let positionY = 0;
      if (opponentColor === "black") {
        positionY = 7;
      }
      if (moveData.castling.includes("Queen")) {
        applyCastling.figure = opponentColor + " rook 1";
        applyCastling.position = newMatrix[3][positionY].position;
        newStates.applyCastling = applyCastling;
      } else {
        applyCastling.figure = opponentColor + " rook 0";
        applyCastling.position = newMatrix[3][positionY].position;
        newStates.applyCastling = applyCastling;
      }
    }

    // Pawn on last squre
    if (moveData.newPiece) {
      // The pawn that needs to be removed from the game.
      const pawn = newStates.chessMatrix[x][y].figure;

      // Pawn replacement with a new piece.
      newStates.chessMatrix[x][y].figure = moveData.newPiece;
      newStates.playarNewPiece = moveData.newPiece;
      newStates.confirmedNewPiece = true;
      newStates.removePawn = [...get().removePawn, pawn];
    }

    set(newStates);
  });

  // Socket event handler for updating the timer
  socket.on("update_timer", (data) => {
    if (data.socketId === get().playerSockedID) {
      set({ playerTimer: data.time });
    } else {
      set({ opponentTimer: data.time });
    }
  });

  // Socket event triggered when one of the players runs out of time.
  socket.on("time_up", (data) => {
    const winner = get().players.players.find(
      (player) => player.socketId !== data.socketId
    );
    const result = get().playerSockedID === winner.socketId ? "win" : "lose";
    set({
      endGame: {
        result: result,
        winner: winner.socketId,
        confirm: true,
      },
    });
  });

  // Socket event triggered when the opposing player emits a win or a draw; this event will check if the results match and then respond whether everything is fine.
  socket.on("end_game_confirmation", (data) => {
    const playerColor = get().playerColor;
    const chessMatrix = get().chessMatrix;
    const room = get().room;

    const playerFigures = chessMatrix
      .flat()
      .filter((square) => square.figure.includes(playerColor));

    const isAvailableSquare = checkAvailableSquares(
      playerFigures,
      chessMatrix,
      playerColor
    );

    const dataToSend = {
      room: room,
    };

    if (!isAvailableSquare) {
      if (get().checkKingPlayer && data.type === "win") {
        dataToSend.result = "win";
        socket.emit("end_game_confirmed", dataToSend);
        set({
          endGame: {
            result: "lose",
            winner: get().opponenetSocketID,
            confirmed: true,
          },
        });
      } else if (!get().checkKingPlayer && data.type === "stalemate") {
        dataToSend.result = "stalemate";
        socket.emit("end_game_confirmed", dataToSend);
        set({
          endGame: {
            result: "stalemate",
            winner: false,
            confirmed: true,
          },
        });
      } else {
        console.log("something_wrong");
      }
    } else {
      console.log("something_wrong");
    }
  });

  socket.on("play_again_prompt", () => {
    const endGame = get().endGame;
    if (!endGame.confirmed) {
      set({ endGame: { ...endGame, confirmed: true } });
    }
  });

  // Socket event handler for when the room is full
  socket.on("room_full", () => {
    console.log("room is full");
  });

  // Generate matrix with squares positions
  const generateChessMatrix = () => {
    const squares = [];
    for (let i = 0; i < 8; i++) {
      let squaresArray = [];
      for (let y = 0; y < 8; y++) {
        squaresArray.push({
          tableLocation: [i, y],
          position: [0.814 - 0.23225 * i, -0.814 + 0.23225 * y],
          figure: "empty",
        });
      }
      squares.push(squaresArray);
    }

    return squares;
  };
  const initalMatrix = generateChessMatrix();

  // Update matrix for each move
  const updateMatrix = (
    currentMatrix,
    newMove,
    figureName,
    castling,
    enPassantPlayed
  ) => {
    const xT = newMove[0];
    const yT = newMove[1];
    const newMatrix = currentMatrix;

    let playerColor = "white";

    if (figureName.includes("black")) {
      playerColor = "black";
    }

    let captured = "empty";

    const currentField = newMatrix
      .flat()
      .find((square) => square.figure === figureName);

    if (castling) {
      if (castling.includes("Queen")) {
        currentField.figure = playerColor + " rook 1";
      } else {
        currentField.figure = playerColor + " rook 0";
      }
    } else {
      currentField.figure = "empty";
      if (enPassantPlayed) {
        let y = playerColor === "white" ? -1 : 1;
        captured = newMatrix[xT][yT + y].figure;
      } else {
        captured = newMatrix[xT][yT].figure;
      }
    }
    newMatrix[xT][yT].figure = figureName;

    return { newMatrix, captured };
  };

  return {
    playerTimer: 600,
    opponentTimer: 600,

    playerName: "",
    playerSockedID: null,
    opponenetSocketID: null,
    // It's not false only when the player creates a room
    room: false,
    setRoom: (data) => {
      const { name } = data;
      socket.emit("join_make_room", data);
      set({ playerName: name });
    },

    setFindPlayer: (data) => {
      socket.emit("find_player", { name: data });
    },

    // It's not empty only if both players are in the room
    players: [],

    loaded: false,
    setLoaded: () => set(() => ({ loaded: true })),

    // when start button is pressed started is true
    started: false,
    setStarted: () => set(() => ({ started: true })),

    //  Only if both players are in the room, this is not null
    playerColor: "null",
    opponentColor: "null",

    chessMatrix: initalMatrix,
    // setSquaresMatrix for setGame, to add all figures on matrix
    setSquaresMatrix: (newSquares) => set({ chessMatrix: newSquares }),

    // activeFigure for click on playar's figures
    activeFigure: "empty",
    setActiveFigure: (figure) => set({ activeFigure: figure }),
    deactivateFigure: () => set({ activeFigure: "empty" }),

    // The final array of player's moves
    playerMoves: [],

    // The final array of opponent's moves
    opponentMoves: [],

    // All caprute for opponent figure
    applyCapture: [],

    // The available square, when clicked, contains information about the move and the position of the piece that needs to be moved.
    applyMove: false,

    applyCastling: false,

    // For castling
    kingMoved: false,
    rook0Moved: false,
    rook1Moved: false,
    castlingKingSide: true,
    castlingQueenSide: true,

    // En passant
    enPassantPossibility: false,

    // Check king for player
    checkKingPlayer: false,
    // Check king for opponent
    checkKingOpponent: false,

    setApplyMove: (
      screenPosition,
      tableLocationTo,
      figureName,
      tableLocationFrom,
      castling,
      enPassant,
      enPassantPlayed
    ) => {
      const currentMatrix = get().chessMatrix;
      const { newMatrix, captured } = updateMatrix(
        currentMatrix,
        tableLocationTo,
        figureName,
        castling,
        enPassantPlayed
      );
      const x = tableLocationTo[0];
      const y = tableLocationTo[1];
      const move = newMatrix[x][y];

      const playarMove = {
        figure: figureName,
        tableLocationFrom: tableLocationFrom,
        tableLocationTo: tableLocationTo,
        captured: captured,
      };

      if (enPassant) {
        playarMove.enPassant = enPassant;
      }
      if (enPassantPlayed) {
        playarMove.enPassantPlayed = enPassantPlayed;
      }

      // Check for opponenet king check
      const playerColor = get().playerColor;
      const opponentColor = playerColor === "white" ? "black" : "white";

      const { tableLocation: opponenetKingTableLocation } = newMatrix
        .flat()
        .find((square) => square.figure === "king " + opponentColor);

      const kingCheck = attackedSquare(
        opponenetKingTableLocation[0],
        opponenetKingTableLocation[1],
        newMatrix,
        playerColor,
        "none"
      );

      const newStates = {
        screenPosition: screenPosition,
        applyMove: move,
        chessMatrix: newMatrix,
        activeFigure: "empty",

        playerMoves: [...get().playerMoves, playarMove],
        onMove: false,
      };

      if (kingCheck) {
        playarMove.checkKingOpponent = true;
        newStates.checkKingOpponent = true;
      }

      // "If 'checkkingPlayer' is true, uncheck it."
      if (get().checkKingPlayer) {
        newStates.checkKingPlayer = false;
      }

      if (captured !== "empty") {
        newStates.applyCapture = [...get().applyCapture, captured];
      }

      // CASTLING
      if (castling) {
        playarMove.castling = castling;
        const applyCastling = {};

        let positionY = 0;
        if (playerColor === "black") {
          positionY = 7;
        }
        if (castling.includes("Queen")) {
          applyCastling.figure = playerColor + " rook 1";

          applyCastling.position = newMatrix[3][positionY].position;
          newStates.applyCastling = applyCastling;
        } else {
          applyCastling.figure = playerColor + " rook 0";

          applyCastling.position = newMatrix[3][positionY].position;
          newStates.applyCastling = applyCastling;
        }
      }

      if (figureName.includes("king") && !get().kingMoved) {
        newStates.kingMoved = true;
      }
      if (figureName.includes("rook 0") && !get().rook0Moved) {
        newStates.rook0Moved = true;
      }
      if (figureName.includes("rook 1") && !get().rook1Moved) {
        newStates.rook1Moved = true;
      }

      // Pawn on last square
      if (figureName.includes(playerColor + " pawn")) {
        // const yLastSquare = get().playerColor === "white" ? 7 : 0;
        const yLastSquare = get().playerColor === "white" ? 4 : 3;
        if (tableLocationTo[1] === yLastSquare) {
          newStates.selectedNewPiece = false;
          newStates.chooseNewPiece = tableLocationTo;
        }
      }

      set(newStates);
    },

    screenPosition: false,

    // When it's the player's turn, onMove is true
    onMove: false,

    // State indicating whether the opponent is on the move. Before the start of the game, its initial value is true, due to ControlsButton
    opponentOnMove: true,

    // State that briefly becomes true after each confirmed move.
    checkForMate: false,
    setCheckForMate: () => set({ checkForMate: false }),

    // A method that is called when the user presses the confirm button
    // The confirm button is only available if the player has already made a move
    onMoveConfirm: () => {
      const room = get().room;
      const playerMoves = get().playerMoves;

      const playerMove = playerMoves[playerMoves.length - 1];

      const newStates = {
        onMove: false,
        opponentOnMove: true,
        enPassantPossibility: false,
      };

      ////
      ////// Pawn on last square
      ////
      const playarNewPiece = get().playarNewPiece;

      if (playarNewPiece) {
        const chessMatrix = get().chessMatrix;
        const tableLocation = get().chooseNewPiece;
        const x = tableLocation[0];
        const y = tableLocation[1];

        // The pawn that needs to be removed from the game.
        const pawn = chessMatrix[x][y].figure;

        // Checking for the same pieces
        const newPieces = chessMatrix
          .flat()
          .filter((square) => square.figure.includes("new"));

        const finalPieceName = playarNewPiece + newPieces.length;

        // Update matrix
        chessMatrix[x][y].figure = finalPieceName;

        // Send new figure
        playerMove.newPiece = finalPieceName;

        // Updating state
        newStates.chessMatrix = chessMatrix;
        newStates.removePawn = [...get().removePawn, pawn];
        newStates.chooseNewPiece = false;
        newStates.selectedNewPiece = true;
        newStates.playarNewPiece = finalPieceName;
        newStates.confirmedNewPiece = true;
      }

      const data = {
        moveData: playerMove,
        room: room,
      };

      // send move
      socket.emit("player_move", data);

      if (playerMoves.length > 1) {
        newStates.checkForMate = true;
      }

      // CASTLING
      if (playerMove.figure.includes("king")) {
        if (get().castlingKingSide) newStates.castlingKingSide = false;
        if (get().castlingQueenSide) newStates.castlingQueenSide = false;
      }

      if (playerMove.figure.includes("rook 0") && get().castlingKingSide) {
        newStates.castlingKingSide = false;
      }
      if (playerMove.figure.includes("rook 1") && get().castlingQueenSide) {
        newStates.castlingQueenSide = false;
      }

      set(newStates);
    },

    // Only for undo captured figures
    applyUndoCaptured: false,

    onMoveUndo: () => {
      const currentMatrix = get().chessMatrix;
      const playerMoves = get().playerMoves;

      const moveToUndo = playerMoves[playerMoves.length - 1];

      const previusTableLocation = moveToUndo.tableLocationFrom;
      const figureName = moveToUndo.figure;

      const x = previusTableLocation[0];
      const y = previusTableLocation[1];

      const previousPosition = currentMatrix[x][y].position;

      const { newMatrix } = updateMatrix(
        currentMatrix,
        previusTableLocation,
        figureName,
        moveToUndo.castling
      );

      const previousMove = {
        tableLocation: previusTableLocation,
        position: previousPosition,
        figure: figureName,
      };

      playerMoves.pop();

      const newStates = {
        onMove: true,
        chessMatrix: newMatrix,
        applyMove: previousMove,
        playerMoves: playerMoves,
      };

      if (moveToUndo.checkKingOpponent) {
        newStates.checkKingOpponent = false;
      }

      let opponentMoves = get().opponentMoves;

      if (opponentMoves.length > 1) {
        const opponentLastMove = opponentMoves[opponentMoves.length - 1];

        if (opponentLastMove.checkKingOpponent) {
          newStates.checkKingPlayer = true;
        }
      }

      // Undo capture
      if (moveToUndo.captured !== "empty") {
        let x = moveToUndo.tableLocationTo[0];
        let y = moveToUndo.tableLocationTo[1];

        if (moveToUndo.enPassantPlayed) {
          x = moveToUndo.enPassantPlayed[0];
          y = moveToUndo.enPassantPlayed[1];
        }

        const capturedFigures = get().applyCapture;
        const length = capturedFigures.length - 1;
        const figure = capturedFigures[length];

        newMatrix[x][y].figure = figure;

        const position = currentMatrix[x][y].position;

        capturedFigures.pop();
        newStates.applyCapture = capturedFigures;
        newStates.applyUndoCaptured = {
          position: position,
          figure: figure,
        };
      }

      // CASTLING
      if (moveToUndo.castling) {
        const applyCastling = {};
        const playerColor = get().playerColor;
        let positionY = 0;
        if (playerColor === "black") {
          positionY = 7;
        }
        if (moveToUndo.castling.includes("Queen")) {
          applyCastling.figure = playerColor + " rook 1";
          applyCastling.position = newMatrix[7][positionY].position;
          newStates.applyCastling = applyCastling;
        } else {
          applyCastling.figure = playerColor + " rook 0";
          applyCastling.position = newMatrix[0][positionY].position;
          newStates.applyCastling = applyCastling;
        }
        applyCastling.undo = true;
      }

      if (figureName.includes("king") && get().kingMoved) {
        newStates.kingMoved = false;
      }
      if (
        figureName.includes("rook 0") &&
        get().castlingKingSide &&
        get().rook0Moved
      ) {
        newStates.rook1Moved = false;
      }
      if (
        figureName.includes("rook 1") &&
        get().castlingQueenSide &&
        get().rook1Moved
      ) {
        newStates.rook0Moved = false;
      }

      // Pawn on last square
      if (get().chooseNewPiece) {
        newStates.chooseNewPiece = false;
        newStates.selectedNewPiece = true;
        // ////
        newStates.playarNewPiece = false;
        // ////
      }

      set(newStates);
    },

    // PAWN ON THE LAST SQUARE

    // A state that becomes true to allow the player to choose a new piece when a pawn reaches the last square. After the 'confirm' button is clicked, it becomes false again.
    chooseNewPiece: false,

    // A state for confirming a move is true by default. It becomes false when 'chooseNewPiece' becomes true, and it returns to false again when a new figure is selected
    selectedNewPiece: true,

    // A state for new Piece, contains selected piece by user,
    playarNewPiece: false,
    setPlayerNewPiece: (piece) => {
      const newStates = {
        playarNewPiece: piece,
      };
      if (!get().selectedNewPiece) {
        newStates.selectedNewPiece = true;
      }
      set(newStates);
    },

    // The state that becomes true only if a new figurine is selected and the confirm move button is pressed.
    confirmedNewPiece: false,
    newPieceAdded: () =>
      set({ playarNewPiece: false, confirmedNewPiece: false }),

    removePawn: [],

    endGame: false,
    setEndGame: (endGameStatus) => {
      const room = get().room;
      let dataToSend = { room: room };
      if (endGameStatus === "win") {
        dataToSend.result = "win";
        set({
          endGame: {
            result: "win",
            winner: get().playerSockedID,
            confirmed: false,
          },
        });
      } else if (endGameStatus === "stalemate") {
        set({
          endGame: {
            result: "stalemate",
            winner: false,
            confirmed: false,
          },
        });
        dataToSend.result = "stalemate";
      }
      socket.emit("end_game", dataToSend);
    },
  };
});
