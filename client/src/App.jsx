import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import useGame from "./store/useGame";

import Experience from "./Experience";

// import Interface from "./components/interface/Interface";

import ControlButtons from "./components/interface/ControlButton";
import Console from "./components/interface/Console";
import { AnimatePresence } from "framer-motion";

import LoadingScreen from "./components/LoadingScreen";

import { Leva } from "leva";
import Interface from "./components/interface/Interface";
import GameInfo from "./components/interface/GameInfo";
import ChooseNewFigure from "./components/interface/ChooseNewPiece";

import { PerspectiveCamera } from "@react-three/drei";

function App() {
  const ready = useGame((state) => state.loaded);
  const started = useGame((state) => state.started);

  const [start, setStart] = useState(false);

  useEffect(() => {
    if (started) {
      const timer = setTimeout(() => {
        setStart(true);
      }, 900);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [started]);

  return (
    <>
      <Leva />
      <AnimatePresence>{!start && <LoadingScreen />}</AnimatePresence>

      {start && <Interface />}
      {start && <ControlButtons />}

      {start && <Console />}

      <Canvas shadows>
        {/* <PerspectiveCamera
          // zoom={1}
          fov={45}
          far={100}
          near={0.05}
          position={[-3, 2, 0]}
          shadows
        /> */}
        <Suspense>{ready && <Experience />}</Suspense>
      </Canvas>
    </>
  );
}

export default App;
