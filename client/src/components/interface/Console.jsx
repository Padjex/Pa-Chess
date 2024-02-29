import { useEffect } from "react";
import useGame from "../../store/useGame";
import useResponsive from "../../store/useResponsive";

export default function Console() {
  // const checkKingOpponent = useGame((state) => state.checkKingOpponent);
  // const checkKingPlayer = useGame((state) => state.checkKingPlayer);

  const endGame = useGame((state) => state.endGame);
  useEffect(() => {
    // console.log(endGame);
  }, [endGame]);

  // console.log(isMobile);

  // useEffect(() => {
  //   console.log("mobile: " + isMobile);
  // }, [isMobile]);

  // useEffect(() => {
  //   console.log("width: " + isWidth);
  // }, [isWidth]);

  return null;
}
