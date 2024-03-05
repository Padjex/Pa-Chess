import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { useGLTF } from "@react-three/drei";
import { AnimatePresence } from "framer-motion";
import useGame from "../../store/useGame";
import useResponsive from "../../store/useResponsive";
import { Pawn, King, Bishop, Knight, Rook, Queen } from "./Figures";

export default function SetGame() {
  const chessMatrix = useGame((state) => state.chessMatrix);
  const setSquaresMatrix = useGame((state) => state.setSquaresMatrix);

  const isMobile = useResponsive((state) => state.isMobile);
  const isWidth = useResponsive((state) => state.isWidth);

  const groupRef = useRef();

  useEffect(() => {
    const scaleValue = isWidth ? 1 : isMobile ? 0.44 : 0.7;

    let ctx = gsap.context(() => {
      gsap.from(groupRef.current.scale, {
        duration: 0.4,
        x: 0.6,
        y: 0.6,
        z: 0.6,
        ease: "power2.out",
      });
      gsap.to(groupRef.current.scale, {
        duration: 0.4,
        x: scaleValue,
        y: scaleValue,
        z: scaleValue,
        ease: "power2.out",
      });
    });
    return () => {
      ctx.revert();
    };
  }, [isMobile, isWidth]);

  return (
    <group ref={groupRef}>
      <SetWhiteKing
        chessMatrix={chessMatrix}
        setSquaresMatrix={setSquaresMatrix}
      />
      <SetBlackKing
        chessMatrix={chessMatrix}
        setSquaresMatrix={setSquaresMatrix}
      />
      <SetWhiteQueen
        chessMatrix={chessMatrix}
        setSquaresMatrix={setSquaresMatrix}
      />
      <SetBlackQueen
        chessMatrix={chessMatrix}
        setSquaresMatrix={setSquaresMatrix}
      />
      <SetWhitePawns
        chessMatrix={chessMatrix}
        setSquaresMatrix={setSquaresMatrix}
      />
      <SetBlackPawns
        chessMatrix={chessMatrix}
        setSquaresMatrix={setSquaresMatrix}
      />
      <SetWhiteBishops
        chessMatrix={chessMatrix}
        setSquaresMatrix={setSquaresMatrix}
      />
      <SetBlackBishops
        chessMatrix={chessMatrix}
        setSquaresMatrix={setSquaresMatrix}
      />
      <SetWhiteKnight
        chessMatrix={chessMatrix}
        setSquaresMatrix={setSquaresMatrix}
      />
      <SetBlackKnight
        chessMatrix={chessMatrix}
        setSquaresMatrix={setSquaresMatrix}
      />
      <SetWhiteRook
        chessMatrix={chessMatrix}
        setSquaresMatrix={setSquaresMatrix}
      />
      <SetBlackRook
        chessMatrix={chessMatrix}
        setSquaresMatrix={setSquaresMatrix}
      />
    </group>
  );
}

////
//// SET WHITE KING
////
const SetWhiteKing = ({ chessMatrix, setSquaresMatrix }) => {
  const { nodes } = useGLTF("./blender/figure/kingWhite.glb");
  const props = {
    nodes: nodes,
    positionX: chessMatrix[4][0].position[0],
    positionZ: chessMatrix[4][0].position[1],
    figureName: "king white",
  };
  chessMatrix[4][0].figure = "king white";
  useEffect(() => {
    setSquaresMatrix(chessMatrix);
  }, []);
  return <King props={props} />;
};

////
//// SET BLACK KING
////
const SetBlackKing = ({ chessMatrix, setSquaresMatrix }) => {
  const { nodes } = useGLTF("./blender/figure/kingBlack.glb");
  const props = {
    nodes: nodes,
    positionX: chessMatrix[4][7].position[0],
    positionZ: chessMatrix[4][7].position[1],
    figureName: "king black",
  };
  chessMatrix[4][7].figure = "king black";

  useEffect(() => {
    setSquaresMatrix(chessMatrix);
  }, []);

  return <King props={props} />;
};

////
//// SET WHITE QUEEN
////
const SetWhiteQueen = ({ chessMatrix, setSquaresMatrix }) => {
  const { nodes } = useGLTF("./blender/figure/queenWhite.glb");
  const props = {
    nodes: nodes,
    positionX: chessMatrix[3][0].position[0],
    positionZ: chessMatrix[3][0].position[1],
    figureName: "queen white",
  };
  chessMatrix[3][0].figure = "queen white";
  useEffect(() => {
    setSquaresMatrix(chessMatrix);
  }, []);
  return <Queen props={props} />;
};

////
//// SET Black QUEEN
////
const SetBlackQueen = ({ chessMatrix, setSquaresMatrix }) => {
  const { nodes } = useGLTF("./blender/figure/queenBlack.glb");
  const props = {
    nodes: nodes,
    positionX: chessMatrix[3][7].position[0],
    positionZ: chessMatrix[3][7].position[1],
    figureName: "queen black",
  };

  chessMatrix[3][7].figure = "queen black";
  useEffect(() => {
    setSquaresMatrix(chessMatrix);
  }, []);
  return <Queen props={props} />;
};

////
//// SET WHITE PAWNS
////
const SetWhitePawns = ({ chessMatrix, setSquaresMatrix }) => {
  const { nodes } = useGLTF("./blender/figure/pawnWhite.glb");

  const removePawn = useGame((state) => state.removePawn);

  const generateProps = useMemo(() => {
    const generateProps = [];
    for (let i = 0; i < 8; i++) {
      generateProps[i] = {
        nodes: nodes,
        positionX: chessMatrix[i][1].position[0],
        positionZ: chessMatrix[i][1].position[1],
        figureName: "white pawn " + i,
      };
      chessMatrix[i][1].figure = "white pawn " + i;
    }

    return generateProps;
  }, []);

  // Remove pawn from the game
  const filterPawns = useMemo(() => {
    if (removePawn) {
      return generateProps.filter(
        (pawn) => !removePawn.includes(pawn.figureName)
      );
    } else {
      return generateProps;
    }
  }, [removePawn]);

  useEffect(() => {
    setSquaresMatrix(chessMatrix);
  }, []);

  return (
    <AnimatePresence>
      {filterPawns.map((props) => (
        <Pawn key={props.figureName} props={props} />
      ))}
    </AnimatePresence>
  );
};

////
//// SET BLACK PAWNS
////
const SetBlackPawns = ({ chessMatrix, setSquaresMatrix }) => {
  const { nodes } = useGLTF("./blender/figure/pawnBlack.glb");

  const removePawn = useGame((state) => state.removePawn);

  const generateProps = useMemo(() => {
    const generateProps = [];
    for (let i = 0; i < 8; i++) {
      generateProps[i] = {
        nodes: nodes,
        positionX: chessMatrix[i][6].position[0],
        positionZ: chessMatrix[i][6].position[1],
        figureName: "black pawn " + i,
      };
      chessMatrix[i][6].figure = "black pawn " + i;
    }

    return generateProps;
  }, []);

  // Remove pawn from the game, when
  const filterPawns = useMemo(() => {
    if (removePawn) {
      return generateProps.filter(
        (pawn) => !removePawn.includes(pawn.figureName)
      );
    } else {
      return generateProps;
    }
  }, [removePawn]);

  useEffect(() => {
    setSquaresMatrix(chessMatrix);
  }, []);

  return (
    <AnimatePresence>
      {filterPawns.map((props) => (
        <Pawn key={props.figureName} props={props} />
      ))}
    </AnimatePresence>
  );
};

////
///// SET WHITE BISHOP
////
const SetWhiteBishops = ({ chessMatrix, setSquaresMatrix }) => {
  const { nodes } = useGLTF("./blender/figure/bishopWhite.glb");
  const generateProps = useMemo(() => {
    const generateProps = [];
    generateProps[0] = {
      nodes: nodes,
      positionX: chessMatrix[2][0].position[0],
      positionZ: chessMatrix[2][0].position[1],

      figureName: "white bishop 0",
    };
    generateProps[1] = {
      nodes: nodes,
      positionX: chessMatrix[5][0].position[0],
      positionZ: chessMatrix[5][0].position[1],

      figureName: "white bishop 1",
    };
    chessMatrix[2][0].figure = "white bishop 0";
    chessMatrix[5][0].figure = "white bishop 1";

    return generateProps;
  }, []);
  useEffect(() => {
    setSquaresMatrix(chessMatrix);
  }, []);
  return (
    <>
      {generateProps.map((props, index) => (
        <Bishop key={index} props={props} />
      ))}
    </>
  );
};

////
///// SET BLACK BISHOP
////
const SetBlackBishops = ({ chessMatrix, setSquaresMatrix }) => {
  const { nodes } = useGLTF("./blender/figure/bishopBlack.glb");
  const generateProps = useMemo(() => {
    const generateProps = [];
    generateProps[0] = {
      nodes: nodes,
      positionX: chessMatrix[2][7].position[0],
      positionZ: chessMatrix[2][7].position[1],
      figureName: "black bishop 0",
    };
    generateProps[1] = {
      nodes: nodes,
      positionX: chessMatrix[5][7].position[0],
      positionZ: chessMatrix[5][7].position[1],
      figureName: "black bishop 1",
    };
    chessMatrix[2][7].figure = "black bishop 0";
    chessMatrix[5][7].figure = "black bishop 1";

    return generateProps;
  }, []);
  useEffect(() => {
    setSquaresMatrix(chessMatrix);
  }, []);
  return (
    <>
      {generateProps.map((props, index) => (
        <Bishop key={index} props={props} />
      ))}
    </>
  );
};

////
///// SET WHITE KNIGHT
////
const SetWhiteKnight = ({ chessMatrix, setSquaresMatrix }) => {
  const { nodes } = useGLTF("./blender/figure/knightWhite.glb");
  const generateProps = useMemo(() => {
    const generateProps = [];
    generateProps[0] = {
      nodes: nodes,
      positionX: chessMatrix[1][0].position[0],
      positionZ: chessMatrix[1][0].position[1],
      figureName: "white knight 0",
    };
    generateProps[1] = {
      nodes: nodes,
      positionX: chessMatrix[6][0].position[0],
      positionZ: chessMatrix[6][0].position[1],
      figureName: "white knight 1",
    };
    chessMatrix[1][0].figure = "white knight 0";
    chessMatrix[6][0].figure = "white knight 1";

    return generateProps;
  }, []);
  useEffect(() => {
    setSquaresMatrix(chessMatrix);
  }, []);
  return (
    <>
      {generateProps.map((props, index) => (
        <Knight key={index} props={props} />
      ))}
    </>
  );
};

////
///// SET BLACK KNIGHT
////
const SetBlackKnight = ({ chessMatrix, setSquaresMatrix }) => {
  const { nodes } = useGLTF("./blender/figure/knightBlack.glb");
  const generateProps = useMemo(() => {
    const generateProps = [];
    generateProps[0] = {
      nodes: nodes,
      positionX: chessMatrix[1][7].position[0],
      positionZ: chessMatrix[1][7].position[1],
      figureName: "black knight 0",
    };
    generateProps[1] = {
      nodes: nodes,
      positionX: chessMatrix[6][7].position[0],
      positionZ: chessMatrix[6][7].position[1],
      figureName: "black knight 1",
    };
    chessMatrix[1][7].figure = "black knight 0";
    chessMatrix[6][7].figure = "black knight 1";

    return generateProps;
  }, []);
  useEffect(() => {
    setSquaresMatrix(chessMatrix);
  }, []);
  return (
    <>
      {generateProps.map((props, index) => (
        <Knight key={index} props={props} />
      ))}
    </>
  );
};

////
///// SET WHITE ROOK
////
const SetWhiteRook = ({ chessMatrix, setSquaresMatrix }) => {
  const { nodes } = useGLTF("./blender/figure/rookWhite.glb");
  const generateProps = useMemo(() => {
    const generateProps = [];
    generateProps[0] = {
      nodes: nodes,
      positionX: chessMatrix[0][0].position[0],
      positionZ: chessMatrix[0][0].position[1],
      figureName: "white rook 0",
    };
    generateProps[1] = {
      nodes: nodes,
      positionX: chessMatrix[7][0].position[0],
      positionZ: chessMatrix[7][0].position[1],
      figureName: "white rook 1",
    };
    chessMatrix[0][0].figure = "white rook 0";
    chessMatrix[7][0].figure = "white rook 1";

    return generateProps;
  }, []);
  useEffect(() => {
    setSquaresMatrix(chessMatrix);
  }, []);
  return (
    <>
      {generateProps.map((props, index) => (
        <Rook key={index} props={props} />
      ))}
    </>
  );
};

////
///// SET BLACK ROOK
////
const SetBlackRook = ({ chessMatrix, setSquaresMatrix }) => {
  const { nodes } = useGLTF("./blender/figure/rookBlack.glb");
  const generateProps = useMemo(() => {
    const generateProps = [];
    generateProps[0] = {
      nodes: nodes,
      positionX: chessMatrix[0][7].position[0],
      positionZ: chessMatrix[0][7].position[1],
      figureName: "black rook 0",
    };
    generateProps[1] = {
      nodes: nodes,
      positionX: chessMatrix[7][7].position[0],
      positionZ: chessMatrix[7][7].position[1],
      figureName: "black rook 1",
    };
    chessMatrix[0][7].figure = "black rook 0";
    chessMatrix[7][7].figure = "black rook 1";

    return generateProps;
  }, []);
  useEffect(() => {
    setSquaresMatrix(chessMatrix);
  }, []);
  return (
    <>
      {generateProps.map((props, index) => (
        <Rook key={index} props={props} />
      ))}
    </>
  );
};
