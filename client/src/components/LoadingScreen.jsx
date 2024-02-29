import { useProgress } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useAnimate, motion, AnimatePresence } from "framer-motion";

import useGame from "../store/useGame";
import "../css/loadingScreen.css";

export default function LoadingScreen() {
  const { progress, total, loaded, item } = useProgress();

  // const ready = useGame((state) => state.loaded);
  const setReady = useGame((state) => state.setLoaded);

  const started = useGame((state) => state.started);
  const setStarted = useGame((state) => state.setStarted);

  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (progress === 100) {
      setReady();
      setTimeout(() => {
        setStarted();
      }, 100);
    }
  }, [progress, total, loaded, item]);

  useEffect(() => {
    if (started) {
      animate([
        [
          ".default-text",
          // { x: 20, color: "rgba(92, 135, 129, 0.1)" },
          // { color: "#e6d48c" },
          { color: "#ffe4a1fc" },
          // { x: 10 },
          { duration: 0.4 },
        ],
      ]);
      animate(".progress-bar", { opacity: "0" }, { duration: 0.2 });
    }
  }, [started]);

  return (
    <motion.div
      ref={scope}
      className="loading-screen"
      exit={{
        opacity: 0,
        transition: {
          duration: 1.4,
          // type: "spring",
        },
      }}
    >
      <div className="loading-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}>
          CHESS GAME
        </div>
        <div className="default-text">CHESS GAME</div>
      </div>
    </motion.div>
  );
}
