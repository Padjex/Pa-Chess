import { OrbitControls } from "@react-three/drei";

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
      <CameraAnimation />
    </>
  );
}
