import { useEffect, useRef, useState } from "react";
import useGame from "../../store/useGame";
import { checkAvailableSquares } from "./chessCheck/chessHelper.js";

export default function CheckMateChecker() {
  const checkKingOpponent = useGame((state) => state.checkKingOpponent);
  const playerColor = useGame((state) => state.playerColor);
  const checkForMate = useGame((state) => state.checkForMate);
  const chessMatrix = useGame((state) => state.chessMatrix);
  const setCheckForMate = useGame((state) => state.setCheckForMate);

  const setEndGame = useGame((state) => state.setEndGame);

  const opponentColor = playerColor === "white" ? "black" : "white";

  // useEffect that checks whether the game is over, i.e., whether the player has won or it's a stalemate position
  useEffect(() => {
    if (checkForMate) {
      const opponenetFigures = chessMatrix
        .flat()
        .filter((square) => square.figure.includes(opponentColor));

      const isAvailableSquare = checkAvailableSquares(
        opponenetFigures,
        chessMatrix,
        opponentColor
      );

      if (!isAvailableSquare) {
        if (checkKingOpponent) {
          setEndGame("win");
          // alert("win");
        } else {
          setEndGame("stalemate");
          // alert("stalemate");
        }
      }
    }
    return () => {
      setCheckForMate();
    };
  }, [checkForMate]);

  return null;
}
