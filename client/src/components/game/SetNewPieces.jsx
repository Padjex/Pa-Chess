import { useEffect, useState, useRef } from "react";
import { Bishop, Knight, Rook, Queen } from "./Figures";
import { useGLTF } from "@react-three/drei";
import gsap from "gsap";
import useGame from "../../store/useGame";
import useResponsive from "../../store/useResponsive";

export default function SetNewPieces() {
  const chessMatrix = useGame((state) => state.chessMatrix);
  const playarNewPiece = useGame((state) => state.playarNewPiece);
  const playerColor = useGame((state) => state.playerColor);

  const newPieceAdded = useGame((state) => state.newPieceAdded);
  const confirmedNewPiece = useGame((state) => state.confirmedNewPiece);

  const [addPieces, setAddPieces] = useState([]);

  const isMobile = useResponsive((state) => state.isMobile);
  const isWidth = useResponsive((state) => state.isWidth);

  const gropuRef = useRef();

  useEffect(() => {
    const scaleValue = isWidth ? 1 : isMobile ? 0.44 : 0.7;

    let ctx = gsap.context(() => {
      gsap.from(gropuRef.current.scale, {
        duration: 0.4,
        x: 0.6,
        y: 0.6,
        z: 0.6,
        ease: "power2.out",
      });
      gsap.to(gropuRef.current.scale, {
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

  useEffect(() => {
    if (playarNewPiece && confirmedNewPiece) {
      const piece = playarNewPiece;

      const { position } = chessMatrix
        .flat()
        .find((square) => square.figure === playarNewPiece);

      let wordOrder = 1;
      if (piece.includes("queen")) {
        wordOrder = 0;
      }

      const pieceType = piece.split(" ")[wordOrder];

      let newPieceComponent;
      const props = {
        positionX: position[0],
        positionZ: position[1],
        figureName: piece,
      };

      switch (pieceType) {
        case "queen": {
          const nodesLocation =
            playerColor === "white"
              ? "./blender/figure/queenWhite.glb"
              : "./blender/figure/queenBlack.glb";
          const { nodes } = useGLTF(nodesLocation);

          props.nodes = nodes;
          newPieceComponent = <Queen key={addPieces.length} props={props} />;
          break;
        }
        case "rook": {
          const nodesLocation =
            playerColor === "white"
              ? "./blender/figure/rookWhite.glb"
              : "./blender/figure/rookBlack.glb";
          const { nodes } = useGLTF(nodesLocation);
          props.nodes = nodes;
          newPieceComponent = <Rook key={addPieces.length} props={props} />;
          break;
        }
        case "bishop": {
          const nodesLocation =
            playerColor === "white"
              ? "./blender/figure/bishopWhite.glb"
              : "./blender/figure/bishopBlack.glb";
          const { nodes } = useGLTF(nodesLocation);
          props.nodes = nodes;
          newPieceComponent = <Bishop key={addPieces.length} props={props} />;
          break;
        }
        case "knight": {
          const nodesLocation =
            playerColor === "white"
              ? "./blender/figure/knightWhite.glb"
              : "./blender/figure/knightBlack.glb";
          const { nodes } = useGLTF(nodesLocation);
          props.nodes = nodes;
          newPieceComponent = <Knight key={addPieces.length} props={props} />;
          break;
        }
      }
      setAddPieces((prevState) => [...prevState, newPieceComponent]);
      newPieceAdded();
    }
  }, [playarNewPiece, confirmedNewPiece]);

  return <group ref={gropuRef}>{addPieces}</group>;
}
