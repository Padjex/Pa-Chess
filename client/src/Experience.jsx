import { OrbitControls, ScrollControls } from "@react-three/drei";

import ChessTable from "./components/ChessTable";
import Lights from "./components/Lights";
import Background from "./components/Background";
import Game from "/components/game/Game";

import { CameraAnimation } from "./components/CameraAnimation";

import { Perf } from "r3f-perf";

export default function Experience() {
  return (
    <>
      {/* <Perf /> */}
      {/* <OrbitControls /> */}

      <ChessTable />
      <Game />

      <Lights />
      <Background />
      <ScrollControls
        // damping={0.243}
        damping={0.344}
        pages={3}
        style={{
          scrollbarWidth: " none",
        }}
      >
        <CameraAnimation />
      </ScrollControls>
    </>
  );
}
