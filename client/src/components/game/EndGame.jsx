import { useEffect, useState } from "react";
import { Sparkles } from "@react-three/drei";
import useGame from "../../store/useGame";
import { useFrame } from "@react-three/fiber";

export default function EndGame() {
  const endGame = useGame((state) => state.endGame);
  const playerSockedID = useGame((state) => state.playerSockedID);
  const [confirmedEnd, setConfirmedEnd] = useState(false);
  const [winner, setWinner] = useState(false);

  useEffect(() => {
    if (endGame) {
      if (endGame.result === "win") {
        setWinner(true);
      } else if (endGame.result === "stalemate") {
        setWinner("stalemate");
      } else if (endGame.result === "lose") {
        setWinner(false);
      }

      if (endGame.confirmed) {
        setConfirmedEnd(true);
      }
    }
  }, [endGame]);

  return (
    <>
      {endGame && (
        <>
          <Sparkles
            count={40}
            size={4}
            scale={[5, 2, 5]}
            position-y={1}
            speed={0.4}
            color="#dddddd"
          />
        </>
      )}
    </>
  );
}
