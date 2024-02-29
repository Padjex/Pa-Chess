import { AnimatePresence, motion } from "framer-motion";
import "../../css/interface.css";
import useGame from "../../store/useGame";

import ChooseNewPiece from "./ChooseNewPiece";
import { useState } from "react";

import { useControls } from "leva";
import iconSrc from "../../../public/gameLogo.png";
import GameInfo from "./GameInfo";

export default function Interface() {
  const [name, setName] = useState("");

  const [roomName, setRoomName] = useState("");

  const setRoom = useGame((state) => state.setRoom);
  const setFindPlayer = useGame((state) => state.setFindPlayer);
  const room = useGame((state) => state.room);
  const chooseNewPiece = useGame((state) => state.chooseNewPiece);

  const findMakeRoom = () => {
    if (roomName !== "") {
      let playerName = "";
      if (name === "") {
        const randomNubers = [];
        for (let i = 0; i < 4; i++) {
          randomNubers.push(Math.floor(Math.random() * 10) + 1);
        }
        playerName = "Player-" + randomNubers.join("");
      } else {
        playerName = name;
      }

      const data = { name: playerName, room: roomName };
      setName(playerName);
      setRoom(data);
    } else {
      console.log("enter a room name");
    }
  };

  const findPlayer = () => {
    let playerName = "";
    if (name === "") {
      const randomNubers = [];
      for (let i = 0; i < 4; i++) {
        randomNubers.push(Math.floor(Math.random() * 10) + 1);
      }
      playerName = "Player-" + randomNubers.join("");
      setName(playerName);
    } else {
      playerName = name;
    }
    setFindPlayer(playerName);
  };

  return (
    <>
      {chooseNewPiece && <ChooseNewPiece />}
      {room && <GameInfo name={name} />}
      <AnimatePresence>
        {!room && (
          <motion.div
            className="interface"
            initial={{
              width: 0,
            }}
            animate={{
              width: "130%",
              // width: "100%",
            }}
            transition={{
              duration: 1.4,
              delay: 0.34,
              ease: "circOut",
              type: "spring",
            }}
            exit={{
              // width: 0,
              left: "110%",
              transition: {
                left: {
                  delay: 0.2,
                  type: "bounce",

                  ease: "anticipate",
                  duration: 1.6,
                },
              },
            }}
          >
            <div className="interface-container">
              <img src={iconSrc} alt="Icon" className="icon" />
              <motion.h1
                initial={{
                  opacity: 0,
                  y: -50,
                }}
                animate={{
                  opacity: 100,
                  y: 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: 0.794,
                  ease: "circOut",
                  type: "spring",
                }}
              >
                {/* Chess game */}
                Pa Chess
              </motion.h1>
              <div className="form-container">
                <motion.div
                  className="name-container"
                  initial={{
                    opacity: 0,
                    y: -50,
                  }}
                  animate={{
                    opacity: 100,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.4,
                    delay: 0.894,
                    ease: "circOut",
                    type: "spring",
                  }}
                >
                  <h2>Enter your name</h2>
                  <input
                    id="playerName"
                    onChange={(e) => {
                      setName(e.target.value);
                    }}
                    placeholder="Guest"
                  />
                </motion.div>
                <div className="play-container">
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -50,
                    }}
                    animate={{
                      opacity: 100,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.4,
                      delay: 0.994,
                      ease: "circOut",
                      type: "spring",
                    }}
                  >
                    <h2>Find a player</h2>
                    <button
                      className="button"
                      role="button"
                      onClick={findPlayer}
                    >
                      Play
                    </button>
                  </motion.div>
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -50,
                    }}
                    animate={{
                      opacity: 100,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.4,
                      delay: 1.094,
                      ease: "circOut",
                      type: "spring",
                    }}
                  >
                    <h2 className="h2-play-friend">Play with friend</h2>
                    <input
                      id="roomId"
                      onChange={(e) => {
                        setRoomName(e.target.value);
                      }}
                      placeholder="Enter Room"
                    />
                    <button
                      className="button"
                      // role="button"
                      onClick={findMakeRoom}
                    >
                      Play
                    </button>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
