import { useEffect, useLayoutEffect, useState } from "react";
import { motion } from "framer-motion";
import "../../css/newFigureMenu.css";
import useGame from "../../store/useGame";

export default function ChooseNewFigure() {
  const playerColor = useGame((state) => state.playerColor);

  const setPlayerNewPiece = useGame((state) => state.setPlayerNewPiece);

  const [activeNew, setActiveNew] = useState(false);

  const screenPosition = useGame((state) => state.screenPosition);

  const onSelectedNewPiece = (piece) => {
    setActiveNew(piece);
    setPlayerNewPiece(piece);
  };

  const color1 =
    playerColor === "white" ? "rgba(255, 228, 201, 1)" : "rgba(150, 45, 27, 1)";

  const color2 =
    playerColor === "white" ? "rgba(121, 90, 58, 1)" : "rgba(58, 9, 7, 1)";

  const figureProps = [
    {
      figure: "queen " + playerColor + " new",
      unicode: "&#9819;",
      // unicode: playerColor === "white" ? "&#9813;" : "&#9819;",
      // unicode: playerColor === "white" ? "&#9819;" : "&#9813;",
      // color1: color1,
      active: activeNew,
      onClick: onSelectedNewPiece,
      index: 1,
    },
    {
      figure: playerColor + " rook" + " new",
      unicode: "&#9820;",
      // unicode: playerColor === "white" ? "&#9814;" : "&#9820;",
      // unicode: playerColor === "white" ? "&#9820;" : "&#9814;",
      // color1: color1,
      active: activeNew,
      onClick: onSelectedNewPiece,
      index: 2,
    },
    {
      figure: playerColor + " bishop" + " new",
      unicode: "&#9821;",
      // unicode: playerColor === "white" ? "&#9815;" : "&#9821;",
      // unicode: playerColor === "white" ? "&#9821;" : "&#9815;",
      // color1: color1,
      active: activeNew,
      onClick: onSelectedNewPiece,
      index: 3,
    },
    {
      figure: playerColor + " knight" + " new",
      unicode: "&#9822;",
      // unicode: playerColor === "white" ? "&#9816;" : "&#9822;",
      // unicode: playerColor === "white" ? "&#9822;" : "&#9816;",
      // color1: color1,
      active: activeNew,
      onClick: onSelectedNewPiece,
      index: 4,
    },
  ];

  return (
    <>
      <motion.div
        className="wrapper-menu"
        style={{ top: screenPosition[1] - 90, left: screenPosition[0] - 90 }}
        initial={{
          scale: 0,
        }}
        animate={{
          scale: 1,
        }}
        transition={{
          duration: 0.4,
          // delay: 0.4,
          ease: "circOut",
          type: "spring",
        }}
      >
        {figureProps.map((props, index) => (
          <CardPieces key={index} props={props} />
        ))}
      </motion.div>
    </>
  );
}

const CardPieces = ({ props }) => {
  const { figure, unicode, active, onClick, index } = props;

  return (
    <motion.span
      onClick={() => onClick(figure)}
      style={{
        transition: active === figure ? "all 0.2s" : "",
        backgroundColor: active === figure ? "white" : "transparent",
        color: active === figure ? "#fffba6" : "",
        borderColor: active === figure ? "#fffba6" : "",
        scale: active === figure ? "1.07" : "1",
      }}
      dangerouslySetInnerHTML={{ __html: `${unicode}` }}
      initial={{
        x: -20,
        opacity: 0,
      }}
      animate={{
        opacity: 100,
        x: 0,
      }}
      transition={{
        duration: 0.4,
        delay: 0.4 + index * 0.05,
        ease: "circOut",
        type: "spring",
      }}
    ></motion.span>
  );
};
