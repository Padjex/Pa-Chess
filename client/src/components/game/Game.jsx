import { useEffect, useState } from "react";
import { useTexture, useGLTF } from "@react-three/drei";

import SetGame from "./SetGame";
import useGame from "../../store/useGame";
import MoveFigures from "./MoveFigures";
import CheckMateChecker from "./CheckMateChecker";
import SetNewPieces from "./SetNewPieces";
import EndGame from "./EndGame";

export default function Game() {
  const started = useGame((state) => state.started);
  const { players } = useGame((state) => state.players);

  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    if (players && players.length === 2) {
      setGameStarted(true);
    }
  }, [players]);

  return (
    <>
      {started && (
        <>
          <SetGame />
          <MoveFigures />
        </>
      )}
      {gameStarted && (
        <>
          <CheckMateChecker />
          <SetNewPieces />
          <EndGame />
        </>
      )}
    </>
  );
}

useGLTF.preload("./blender/figure/kingWhite.glb");
useGLTF.preload("./blender/figure/kingBlack.glb");
useGLTF.preload("./blender/figure/queenWhite.glb");
useGLTF.preload("./blender/figure/queenBlack.glb");
useGLTF.preload("./blender/figure/pawnWhite.glb");
useGLTF.preload("./blender/figure/pawnBlack.glb");
useGLTF.preload("./blender/figure/bishopWhite.glb");
useGLTF.preload("./blender/figure/bishopBlack.glb");
useGLTF.preload("./blender/figure/knightWhite.glb");
useGLTF.preload("./blender/figure/knightBlack.glb");
useGLTF.preload("./blender/figure/rookWhite.glb");
useGLTF.preload("./blender/figure/rookBlack.glb");
useGLTF.preload("./blender/table/chessTable4.glb");
// useTexture.preload("./blender/table/bake12345.jpg");
// useTexture.preload("./blender/table/bake1234.jpg");
useTexture.preload("./blender/table/bakeFin.png");
