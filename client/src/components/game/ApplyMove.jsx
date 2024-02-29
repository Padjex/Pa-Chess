// import * as THREE from "three";
import { useRef, useEffect } from "react";
import { motion } from "framer-motion-3d";
import gsap from "gsap";
import useGame from "../../store/useGame";
import squareVertex from "../../shaders/availableSquare/vertex.glsl";
import squareFragment from "../../shaders/availableSquare/fragment.glsl";
import useResponsive from "../../store/useResponsive";

export default function ApplyMove({ props }) {
  const {
    xCoo,
    yCoo,
    figureName,
    tableLocation,
    capture,
    tableLocationFrom,
    castling = false,
    enPassant = false,
    enPassantPlayed = false,
  } = props;

  const setApplyMove = useGame((state) => state.setApplyMove);

  // set new move, send a props on click to zustand
  const makeMove = (x, y) => {
    const screenPosition = [x, y];

    setApplyMove(
      screenPosition,
      tableLocation,
      figureName,
      tableLocationFrom,
      castling,
      enPassant,
      enPassantPlayed
    );
  };

  // Responsive
  const gropuRef = useRef();

  const isMobile = useResponsive((state) => state.isMobile);
  const isWidth = useResponsive((state) => state.isWidth);

  useEffect(() => {
    const scaleValue = isWidth ? 1 : isMobile ? 0.5 : 0.7;

    let ctx = gsap.context(() => {
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

  return (
    <group ref={gropuRef} scale={isWidth ? 1 : isMobile ? 0.5 : 0.7}>
      <group position={[xCoo, 0.508, yCoo]}>
        <motion.group
          initial={{
            scale: 0,
          }}
          animate={{
            scale: 1,
          }}
          transition={{
            duration: 0.24,
          }}
        >
          <mesh
            onClick={(event) => {
              event.stopPropagation();
              makeMove(event.clientX, event.clientY);
            }}
            rotation-x={-Math.PI * 0.5}
          >
            <shaderMaterial
              vertexShader={squareVertex}
              fragmentShader={squareFragment}
              transparent={true}
            />
            <planeGeometry args={[0.23, 0.23, 128, 128]} />
          </mesh>
        </motion.group>
      </group>
    </group>
  );
}
