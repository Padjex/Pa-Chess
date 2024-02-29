import {
  animate,
  motion,
  stagger,
  useAnimate,
  useAnimation,
} from "framer-motion";
import "../../css/gameInfo.css";
import useGame from "../../store/useGame";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

export default function GameInfo({ name }) {
  const { players } = useGame((state) => state.players);
  const playerSockedID = useGame((state) => state.playerSockedID);
  const [opponentName, setOpponentName] = useState(null);

  const playerColor = useGame((state) => state.playerColor);

  const [leftContainer, animateLeft] = useAnimate();
  const [rightContainer, animateRight] = useAnimate();

  useEffect(() => {
    if (players) {
      setOpponentName(players.find((n) => n.socketId !== playerSockedID)?.name);
    }
  }, [players]);

  useEffect(() => {
    if (playerColor === "black") {
      animateLeft([
        [
          leftContainer.current,
          {
            background: `linear-gradient(to right, rgb(29, 0, 0), rgba(162, 22, 22, 0.5))`,
            color: "#ffebb8fc",
            "-webkit-text-stroke": "0px #ffebb8fc",
            // borderColor: "rgba(255,222,151,0.862)",
          },
          { duration: 0.04, delay: 1.4 },
        ],
      ]);
      animateRight([
        [
          rightContainer.current,
          {
            background: `linear-gradient(to left, rgba(255, 225, 148, 0.9),
          rgba(236, 151, 72, 0.639))`,
            color: "#2e0101",
            "-webkit-text-stroke": " 1.5px #2e0101",
            // borderColor: "rgb(62,6,6)",
          },
          { duration: 0.04, delay: 1.4 },
        ],
      ]);
    }
  }, [playerColor]);

  return (
    <div className="game-info-wrapper">
      <div className="game-container">
        <motion.div
          ref={leftContainer}
          className="left-container name-con"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          // initial={{ x: "100vw" }}
          // animate={{ x: 0 }}
          transition={{
            duration: 1.4,
            delay: 0.54,
            ease: "circOut",
            type: "spring",
          }}
        >
          {name}
        </motion.div>
        <TimerNew />
        <motion.div
          ref={rightContainer}
          className="right-container name-con"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          // initial={{ x: "100vw" }}
          // animate={{ x: 0 }}
          transition={{
            // duration: 1.24,
            duration: 1.4,
            delay: 0.74,
            ease: "circOut",
            type: "spring",
          }}
        >
          {players ? opponentName : <WaitingAnimation />}
        </motion.div>
      </div>
    </div>
  );
}

function TimerNew() {
  const playerTimer = useGame((state) => state.playerTimer);
  const opponenetTimer = useGame((state) => state.opponentTimer);

  const playerColor = useGame((state) => state.playerColor);

  const [leftContainer, animateLeft] = useAnimate();
  const [rightContainer, animateRight] = useAnimate();

  useEffect(() => {
    if (playerColor === "black") {
      animateLeft([
        [
          leftContainer.current,
          {
            background: `linear-gradient(to right, rgb(29, 0, 0), rgba(162, 22, 22, 0.5))`,
            color: "#ffebb8fc",
            "-webkit-text-stroke": "0px #ffebb8fc",
            // borderColor: "rgba(255,222,151,0.862)",
          },
          { duration: 0.14, delay: 1.4 },
        ],
      ]);
      animateRight([
        [
          rightContainer.current,
          {
            background: `linear-gradient(to left, rgba(255, 225, 148, 0.9),
        rgba(236, 151, 72, 0.639))`,
            color: "#2e0101",
            "-webkit-text-stroke": " 1.5px #2e0101",
            // borderColor: "rgb(62,6,6)",
          },
          { duration: 0.14, delay: 1.4 },
        ],
      ]);
    }
  }, [playerColor]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${String(minutes).padStart(2, "0")} : ${String(seconds).padStart(
      2,
      "0"
    )}`;
  };
  return (
    <>
      <motion.div
        className="timer-wrapper"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        // initial={{ x: "100vw" }}
        // animate={{ x: "-50%" }}
        transition={{
          // duration: 1.84,
          duration: 1.4,
          delay: 0.64,
          ease: "circOut",
          type: "spring",
        }}
      >
        <div ref={leftContainer} className="time-left">
          {formatTime(playerTimer)}
        </div>
        <div ref={rightContainer} className="time-right">
          {formatTime(opponenetTimer)}
        </div>
      </motion.div>
    </>
  );
}

export const WaitingAnimation = () => {
  const [scope, animate] = useAnimate();

  useEffect(() => {
    const dotsAnimationOptions = [
      [
        "span",
        { opacity: [0, 1] },
        {
          duration: 0.5,
          delay: stagger(0.5),
        },
      ],
    ];

    const dotsRepeatAnimation = {
      repeat: Infinity,
      repeatDelay: 0.44,
    };

    animate(dotsAnimationOptions, dotsRepeatAnimation);
  }, []);

  return (
    <>
      <div className="waiting-dots-container" ref={scope}>
        <div>waiting</div>
        <span>.</span>
        <span>.</span>
        <span>.</span>
      </div>
    </>
  );
};
