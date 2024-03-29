import { useEffect, useState } from "react";
import { Sparkles, Text } from "@react-three/drei";
import useGame from "../../store/useGame";
import { useFrame } from "@react-three/fiber";
import useResponsive from "../../store/useResponsive";

export default function EndGame() {
  const endGame = useGame((state) => state.endGame);
  const players = useGame((state) => state.players);
  const playerSockedID = useGame((state) => state.playerSockedID);
  const [confirmedEnd, setConfirmedEnd] = useState(false);
  const [winner, setWinner] = useState(false);

  const isMobile = useResponsive((state) => state.isMobile);

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

  const winnerPlayer = players.players.find(
    (player) => player.socketId === endGame.winner
  );

  const winnerName = winnerPlayer ? winnerPlayer.name : false;

  const text = winner === "stalemate" ? "stalemate" : winnerName + "  wins";

  // Temporary solution!
  useEffect(() => {
    if (endGame) {
      setTimeout(() => {
        localStorage.clear();
        window.location.reload();
      }, 10000);
    }
  }, [endGame]);

  const positionY = isMobile ? 0.5 : 0.9;

  return (
    <>
      {endGame && (
        <>
          <Sparkles
            count={40}
            size={4}
            scale={[5, 2, 5]}
            position-y={1}
            speed={0.24}
            color="#fae364"
          />
          <Text
            scale={isMobile ? 0.2 : 0.4}
            position={[0, positionY, 0]}
            color="#f5ecba"
            font="./Italiana_Regular.json"
          >
            {text}
          </Text>
        </>
      )}
    </>
  );
}
