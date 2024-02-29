import { meshBounds } from "@react-three/drei";
import { motion } from "framer-motion-3d";
import gsap from "gsap";
import useGame from "../../store/useGame";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import useResponsive from "../../store/useResponsive";

const whiteColor1 = new THREE.Color(0.42, 0.233, 0.104);
const whiteMaterial1 = new THREE.MeshStandardMaterial({
  color: whiteColor1,
  // roughness: 1,
  // metalness: 1,
  // transparent: true,
  // opacity: 0.8,
});
const whiteColor2 = new THREE.Color(0.474, 0.352, 0.227);
const whiteMaterial2 = new THREE.MeshStandardMaterial({
  color: whiteColor2,
  roughness: 0,
  // roughness: 1,
  // metalness: 0.2,
  // transparent: true,
  // opacity: 0.8,
});
const blackColor1 = new THREE.Color(0.024, 0.001, 0.004);
const blackMaterial1 = new THREE.MeshStandardMaterial({
  color: blackColor1,
  // roughness: 1,
  // transparent: true,
  // opacity: 0.8,
});
const blackColor2 = new THREE.Color(0.227, 0.034, 0.026);
const blackMaterial2 = new THREE.MeshStandardMaterial({
  color: blackColor2,
  // roughness: 0.3,
  metalness: 0.1,
  // transparent: true,
  // opacity: 0.8,
});

const activeWhiteColor = new THREE.Color(0.74, 0.66, 0.46);
const activeWhiteMaterial = new THREE.MeshStandardMaterial({
  color: activeWhiteColor,
});

const activeBlackColor = new THREE.Color(0.067, 0.026, 0.034);
const activeBlackMaterial = new THREE.MeshStandardMaterial({
  color: activeBlackColor,
});

// Audio for figures
const audioOnMove = new Audio("./sounds/hitSound.wav");

const playSound = (volume) => {
  audioOnMove.currentTime = 0.9;
  audioOnMove.volume = volume;
  audioOnMove.play();
};

export const Pawn = ({ props }) => {
  const { nodes, positionX, positionZ, figureName } = props;

  const setActiveFigure = useGame((state) => state.setActiveFigure);

  // to update only figures of playar
  const playerColor = useGame((state) => state.playerColor);
  const playerFigure = figureName.includes(playerColor);

  const onMove = useGame((state) => state.onMove);

  const availableClick = playerFigure === true && onMove === true;

  const delay = figureName.charAt(figureName.length - 1);

  const pawnGroupRef = useRef();

  const applyMove = useGame((state) => state.applyMove);

  const applyCapture = useGame((state) => state.applyCapture);

  const applyUndoCaptured = useGame((state) => state.applyUndoCaptured);

  const figureNameParts = figureName.split(" ");
  const figureColor = figureNameParts[0];

  // Changing the active material
  const pawnMesh1 = useRef();
  const pawnMesh2 = useRef();
  const activeFigure = useGame((state) => state.activeFigure);

  useEffect(() => {
    if (activeFigure === figureName) {
      playSound(0.6);

      if (figureColor === "white") {
        pawnMesh2.current.material = activeWhiteMaterial;
      } else {
        pawnMesh1.current.material = activeBlackMaterial;
      }
    } else {
      if (figureColor === "white") {
        pawnMesh2.current.material = whiteMaterial2;
      } else {
        pawnMesh1.current.material = blackMaterial1;
      }
    }
  }, [activeFigure]);

  // apply move
  useEffect(() => {
    if (applyMove) {
      if (applyMove.figure === figureName) {
        let tl = gsap.timeline();

        tl.to(pawnGroupRef.current.position, {
          x: applyMove.position[0],
          z: applyMove.position[1],
          ease: "circ.out",
          duration: 0.3,

          onComplete: () => {
            playSound(0.8);
          },
        });
      }
    }
  }, [applyMove, applyCapture]);

  // apply capture for opponent figures
  useEffect(() => {
    if (applyCapture) {
      const length = applyCapture.length - 1;
      if (applyCapture[length] === figureName) {
        let finalX = -1.64;
        let xMultiplier = -0.2;
        let color = "black";
        if (applyCapture[length].includes("white")) {
          color = "white";
          finalX = 1.64;
          xMultiplier = 0.2;
        }
        const lengthColor = applyCapture.filter((figure) =>
          figure.includes(color)
        ).length;

        let row = 0;
        if (lengthColor > 7) {
          row = 1;
        }
        let tl = gsap.timeline();
        tl.to(pawnGroupRef.current.position, {
          y: 0.9,
          ease: "circ.out",
          duration: 0.1,
        });
        tl.to(pawnGroupRef.current.rotation, {
          x: Math.PI * 2,
          ease: "power2",
          duration: 0.44,
        });
        tl.to(pawnGroupRef.current.position, {
          x: finalX + xMultiplier * row,
          z: 0.64 - 0.19 * lengthColor + (7 * 0.19 + 0.095) * row,
          ease: "circ.out",
          duration: 0.45,
        });
        tl.to(pawnGroupRef.current.position, {
          y: 0.06,
          duration: 0.15,
          onComplete: () => {
            playSound(0.6);
          },
        });
      }
    }
  }, [applyCapture]);

  // back opponent figures after move undo
  useEffect(() => {
    if (applyUndoCaptured) {
      if (applyUndoCaptured.figure === figureName) {
        let tl = gsap.timeline();
        tl.to(pawnGroupRef.current.position, {
          y: 0.9,
          ease: "circ.out",
          duration: 0.1,
        });
        tl.to(pawnGroupRef.current.rotation, {
          x: 0,
          ease: "power2",
          duration: 0.44,
        });
        tl.to(pawnGroupRef.current.position, {
          x: applyUndoCaptured.position[0],
          z: applyUndoCaptured.position[1],
          ease: "circ.out",
        });
        tl.to(pawnGroupRef.current.position, {
          y: 0.5,
          duration: 0.15,
          onComplete: () => {
            playSound(0.6);
          },
        });
      }
    }
  }, [applyUndoCaptured]);

  return (
    <>
      <group ref={pawnGroupRef} position={[positionX, 0.5, positionZ]}>
        <motion.group
          rotation-x={Math.PI * 0.5}
          rotation-z={Math.PI}
          scale={3.6}
          initial={{
            y: 3.4,
          }}
          animate={{
            y: 0,
          }}
          transition={{
            delay: 1.6 + 0.28 - delay * 0.04,
            duration: 0.64,
          }}
        >
          {/* Meshes for click event*/}
          <mesh
            visible={false}
            scale={[0.04, 0.03, 0.05]}
            rotation-x={Math.PI * 0.5}
            position={[0, 0.0, -0.022]}
            onClick={
              availableClick
                ? (event) => {
                    event.stopPropagation();
                    setActiveFigure(figureName);
                  }
                : null
            }
          >
            <capsuleGeometry args={[0.3, 1.1, 1, 5]} />
          </mesh>
          <mesh
            rotation-x={Math.PI}
            position={[0, 0, -0.0001]}
            scale={0.06}
            visible={false}
            onClick={
              availableClick
                ? (event) => {
                    event.stopPropagation();
                    setActiveFigure(figureName);
                  }
                : null
            }
          >
            <planeGeometry args={[1, 1]} />
          </mesh>
          {/* Meshes for click event*/}
          <mesh
            ref={pawnMesh1}
            // castShadow
            geometry={nodes.pawn_1.geometry}
            material={figureColor === "white" ? whiteMaterial1 : blackMaterial1}
          />
          <mesh
            ref={pawnMesh2}
            // castShadow
            geometry={nodes.pawn_2.geometry}
            material={figureColor === "white" ? whiteMaterial2 : blackMaterial2}
          />
        </motion.group>
      </group>
    </>
  );
};

export const Knight = ({ props }) => {
  const { nodes, positionX, positionZ, figureName } = props;

  const setActiveFigure = useGame((state) => state.setActiveFigure);
  const playerColor = useGame((state) => state.playerColor);
  const playerFigure = figureName.includes(playerColor);

  // For intial animation
  const numFigure = figureName.charAt(figureName.length - 1);
  const delay = numFigure == 0 ? 0.04 : 0.24;

  const onMove = useGame((state) => state.onMove);

  const availableClick = playerFigure === true && onMove === true;

  const knighGrouptRef = useRef();

  const applyMove = useGame((state) => state.applyMove);

  const applyCapture = useGame((state) => state.applyCapture);
  const applyUndoCaptured = useGame((state) => state.applyUndoCaptured);

  const figureNameParts = figureName.split(" ");
  const figureColor = figureNameParts[0];

  // Changing the active material
  const knightMesh1 = useRef();
  const knightMesh2 = useRef();
  const activeFigure = useGame((state) => state.activeFigure);

  useEffect(() => {
    if (activeFigure === figureName) {
      playSound(0.6);
      if (figureColor === "white") {
        knightMesh2.current.material = activeWhiteMaterial;
      } else {
        knightMesh1.current.material = activeBlackMaterial;
      }
    } else {
      if (figureColor === "white") {
        knightMesh2.current.material = whiteMaterial2;
      } else {
        knightMesh1.current.material = blackMaterial1;
      }
    }
  }, [activeFigure]);

  useEffect(() => {
    if (applyUndoCaptured) {
      if (applyUndoCaptured.figure === figureName) {
        let tl = gsap.timeline();
        tl.to(knighGrouptRef.current.position, {
          y: 0.9,
          ease: "circ.out",
          duration: 0.1,
        });
        tl.to(knighGrouptRef.current.rotation, {
          x: 0,
          ease: "power2",
          duration: 0.44,
        });
        tl.to(knighGrouptRef.current.position, {
          x: applyUndoCaptured.position[0],
          z: applyUndoCaptured.position[1],
          ease: "circ.out",
        });
        tl.to(knighGrouptRef.current.position, {
          y: 0.5,
          duration: 0.15,
          onComplete: () => {
            playSound(0.6);
          },
        });
      }
    }
  }, [applyUndoCaptured]);

  // apply move for player figures
  useEffect(() => {
    if (applyMove) {
      if (applyMove.figure === figureName) {
        let tl = gsap.timeline();

        tl.to(knighGrouptRef.current.position, {
          y: 0.79,
          ease: "circ.out",

          duration: 0.35,
        });
        tl.to(knighGrouptRef.current.position, {
          x: applyMove.position[0],
          z: applyMove.position[1],
          ease: "circ.out",
          duration: 0.45,
        });
        tl.to(knighGrouptRef.current.position, {
          y: 0.5,
          duration: 0.15,
          onComplete: () => {
            playSound(0.8);
          },
        });
      }
    }
  }, [applyMove, applyCapture]);

  // apply capture for opponent figures
  useEffect(() => {
    if (applyCapture) {
      const length = applyCapture.length - 1;
      if (applyCapture[length] === figureName) {
        let finalX = -1.64;
        let xMultiplier = -0.2;
        let color = "black";
        if (applyCapture[length].includes("white")) {
          color = "white";
          finalX = 1.64;
          xMultiplier = 0.2;
        }
        const lengthColor = applyCapture.filter((figure) =>
          figure.includes(color)
        ).length;
        var tl = gsap.timeline();
        let row = 0;
        if (lengthColor > 7) {
          row = 1;
        }

        tl.to(knighGrouptRef.current.position, {
          y: 0.9,
          ease: "circ.out",
          duration: 0.1,
        });
        tl.to(knighGrouptRef.current.rotation, {
          x: Math.PI * 2,
          ease: "power2",
          duration: 0.44,
        });
        tl.to(knighGrouptRef.current.position, {
          x: finalX + xMultiplier * row,
          z: 0.64 - 0.19 * lengthColor + (7 * 0.19 + 0.095) * row,
          ease: "circ.out",
          duration: 0.45,
        });
        tl.to(knighGrouptRef.current.position, {
          y: 0.064,
          duration: 0.15,
          onComplete: () => {
            playSound(0.6);
          },
        });
      }
    }
  }, [applyCapture]);

  return (
    <>
      <group ref={knighGrouptRef} position={[positionX, 0.5, positionZ]}>
        <motion.group
          rotation-x={Math.PI * 0.5}
          rotation-z={Math.PI}
          scale={3.6}
          initial={{
            y: 3.4,
          }}
          animate={{
            y: 0,
          }}
          transition={{
            delay: figureName.includes("new") ? 0.3 : 1.2 + delay,
            duration: figureName.includes("new") ? 0.3 : 0.7,
          }}
          exit={{
            scale: 0,
            transition: {
              duration: 0.3,
              delay: 0.2,
              type: "spring",
              mass: 5,
              stiffness: 450,
              damping: 50,
              restDelta: 0.0005,
            },
          }}
        >
          {/* Meshes for click event*/}
          <mesh
            visible={false}
            scale={[0.04, 0.046, 0.05]}
            rotation-x={Math.PI * 0.5}
            position={[0, 0.0, -0.042]}
            onClick={
              availableClick
                ? (event) => {
                    event.stopPropagation();
                    setActiveFigure(figureName);
                  }
                : null
            }
          >
            <capsuleGeometry args={[0.3, 1, 1, 5]} />
          </mesh>
          <mesh
            rotation-x={Math.PI}
            position={[0, 0, -0.0001]}
            scale={0.06}
            visible={false}
            onClick={
              availableClick
                ? (event) => {
                    event.stopPropagation();
                    setActiveFigure(figureName);
                  }
                : null
            }
          >
            <planeGeometry args={[1, 1]} />
          </mesh>
          {/* Meshes for click event*/}
          <mesh
            ref={knightMesh1}
            // castShadow
            geometry={nodes.knight_1.geometry}
            material={figureColor === "white" ? whiteMaterial1 : blackMaterial1}
          />
          <mesh
            ref={knightMesh2}
            // castShadow
            geometry={nodes.knight_2.geometry}
            material={figureColor === "white" ? whiteMaterial2 : blackMaterial2}
          />
        </motion.group>
      </group>
    </>
  );
};

export const Queen = ({ props }) => {
  const { nodes, positionX, positionZ, figureName } = props;

  const playerColor = useGame((state) => state.playerColor);
  const setActiveFigure = useGame((state) => state.setActiveFigure);
  const playerFigure = figureName.includes(playerColor);

  const onMove = useGame((state) => state.onMove);

  const availableClick = playerFigure === true && onMove === true;

  const queenGroupRef = useRef();

  const applyMove = useGame((state) => state.applyMove);

  const applyCapture = useGame((state) => state.applyCapture);
  const applyUndoCaptured = useGame((state) => state.applyUndoCaptured);

  const figureNameParts = figureName.split(" ");
  const figureColor = figureNameParts[1];

  // Changing the active material
  const queenMesh1 = useRef();
  const queenMesh2 = useRef();
  const activeFigure = useGame((state) => state.activeFigure);

  useEffect(() => {
    if (activeFigure === figureName) {
      playSound(0.8);
      if (figureColor === "white") {
        queenMesh2.current.material = activeWhiteMaterial;
      } else {
        queenMesh1.current.material = activeBlackMaterial;
      }
    } else {
      if (figureColor === "white") {
        queenMesh2.current.material = whiteMaterial2;
      } else {
        queenMesh1.current.material = blackMaterial1;
      }
    }
  }, [activeFigure]);

  useEffect(() => {
    if (applyUndoCaptured) {
      if (applyUndoCaptured.figure === figureName) {
        let tl = gsap.timeline();
        tl.to(queenGroupRef.current.position, {
          y: 0.9,
          ease: "circ.out",
          duration: 0.1,
        });
        tl.to(queenGroupRef.current.rotation, {
          x: 0,
          ease: "power2",
          duration: 0.44,
        });
        tl.to(queenGroupRef.current.position, {
          x: applyUndoCaptured.position[0],
          z: applyUndoCaptured.position[1],
          ease: "circ.out",
        });
        tl.to(queenGroupRef.current.position, {
          y: 0.5,
          duration: 0.15,
          onComplete: () => {
            playSound(0.6);
          },
        });
      }
    }
  }, [applyUndoCaptured]);

  // apply move
  useEffect(() => {
    if (applyMove) {
      if (applyMove.figure === figureName) {
        let tl = gsap.timeline();
        tl.to(queenGroupRef.current.position, {
          x: applyMove.position[0],
          z: applyMove.position[1],
          y: 0.5,
          ease: "circ.out",
          onComplete: () => {
            playSound(0.8);
          },
        });
      }
    }
  }, [applyMove, applyCapture]);

  // apply capture for opponent figures
  useEffect(() => {
    if (applyCapture) {
      const length = applyCapture.length - 1;
      if (applyCapture[length] === figureName) {
        let finalX = -1.64;
        let xMultiplier = -0.2;
        let color = "black";
        if (applyCapture[length].includes("white")) {
          color = "white";
          finalX = 1.64;
          xMultiplier = 0.2;
        }
        const lengthColor = applyCapture.filter((figure) =>
          figure.includes(color)
        ).length;
        var tl = gsap.timeline();
        let row = 0;
        if (lengthColor > 7) {
          row = 1;
        }

        tl.to(queenGroupRef.current.position, {
          y: 0.9,
          ease: "circ.out",
          duration: 0.1,
        });
        tl.to(queenGroupRef.current.rotation, {
          x: Math.PI * 2,
          ease: "power2",
          duration: 0.44,
        });
        tl.to(queenGroupRef.current.position, {
          x: finalX + xMultiplier * row,
          z: 0.64 - 0.19 * lengthColor + (7 * 0.19 + 0.095) * row,
          ease: "circ.out",
          duration: 0.45,
        });
        tl.to(queenGroupRef.current.position, {
          y: 0.064,
          duration: 0.15,
          onComplete: () => {
            playSound(0.6);
          },
        });
      }
    }
  }, [applyCapture]);

  return (
    <>
      <group ref={queenGroupRef} position={[positionX, 0.5, positionZ]}>
        <motion.group
          rotation-x={Math.PI * 0.5}
          rotation-z={Math.PI}
          scale={3.6}
          initial={{
            y: 3.4,
          }}
          animate={{
            y: 0,
          }}
          transition={{
            delay: figureName.includes("new") ? 0.3 : 1.2 + 0.16,
            duration: figureName.includes("new") ? 0.3 : 0.7,
          }}
        >
          {/* Meshes for click event*/}
          <mesh
            visible={false}
            scale={[0.054, 0.054, 0.054]}
            rotation-x={Math.PI * 0.5}
            position={[0, 0.0, -0.042]}
            onClick={
              availableClick
                ? (event) => {
                    event.stopPropagation();
                    setActiveFigure(figureName);
                  }
                : null
            }
          >
            <capsuleGeometry args={[0.3, 1.1, 1, 5]} />
          </mesh>
          <mesh
            rotation-x={Math.PI}
            position={[0, 0, -0.0001]}
            scale={0.06}
            visible={false}
            onClick={
              availableClick
                ? (event) => {
                    event.stopPropagation();
                    setActiveFigure(figureName);
                  }
                : null
            }
          >
            <planeGeometry args={[1, 1]} />
          </mesh>
          {/* Meshes for click event*/}
          <mesh
            ref={queenMesh1}
            // castShadow
            geometry={nodes.queen_1.geometry}
            material={figureColor === "white" ? whiteMaterial1 : blackMaterial1}
          />
          <mesh
            ref={queenMesh2}
            // castShadow
            geometry={nodes.queen_2.geometry}
            material={figureColor === "white" ? whiteMaterial2 : blackMaterial2}
          />
        </motion.group>
      </group>
    </>
  );
};

export const Bishop = ({ props }) => {
  const { nodes, positionX, positionZ, figureName } = props;

  const setActiveFigure = useGame((state) => state.setActiveFigure);
  const playerColor = useGame((state) => state.playerColor);
  const playerFigure = figureName.includes(playerColor);

  const onMove = useGame((state) => state.onMove);

  const availableClick = playerFigure === true && onMove === true;

  // For inital animation
  const numFigure = figureName.charAt(figureName.length - 1);
  const delay = numFigure == 0 ? 0.08 : 0.2;

  const bishopGroupRef = useRef();

  const applyMove = useGame((state) => state.applyMove);

  const applyCapture = useGame((state) => state.applyCapture);
  const applyUndoCaptured = useGame((state) => state.applyUndoCaptured);

  const figureNameParts = figureName.split(" ");
  const figureColor = figureNameParts[0];

  // Changing the active material
  const bishopMesh1 = useRef();
  const bishopMesh2 = useRef();
  const activeFigure = useGame((state) => state.activeFigure);

  useEffect(() => {
    if (activeFigure === figureName) {
      playSound(0.6);
      if (figureColor === "white") {
        bishopMesh2.current.material = activeWhiteMaterial;
      } else {
        bishopMesh1.current.material = activeBlackMaterial;
      }
    } else {
      if (figureColor === "white") {
        bishopMesh2.current.material = whiteMaterial2;
      } else {
        bishopMesh1.current.material = blackMaterial1;
      }
    }
  }, [activeFigure]);

  useEffect(() => {
    if (applyUndoCaptured) {
      if (applyUndoCaptured.figure === figureName) {
        let tl = gsap.timeline();
        tl.to(bishopGroupRef.current.position, {
          y: 0.9,
          ease: "circ.out",
          duration: 0.1,
        });
        tl.to(bishopGroupRef.current.rotation, {
          x: 0,
          ease: "power2",
          duration: 0.44,
        });
        tl.to(bishopGroupRef.current.position, {
          x: applyUndoCaptured.position[0],
          z: applyUndoCaptured.position[1],
          ease: "circ.out",
        });
        tl.to(bishopGroupRef.current.position, {
          y: 0.5,
          duration: 0.15,
          onComplete: () => {
            playSound(0.6);
          },
        });
      }
    }
  }, [applyUndoCaptured]);

  // apply move
  useEffect(() => {
    if (applyMove) {
      if (applyMove.figure === figureName) {
        let tl = gsap.timeline();
        tl.to(bishopGroupRef.current.position, {
          x: applyMove.position[0],
          z: applyMove.position[1],
          y: 0.5,
          ease: "circ.out",
          onComplete: () => {
            playSound(0.8);
          },
        });
      }
    }
  }, [applyMove, applyCapture]);

  // apply capture for opponent figures
  useEffect(() => {
    if (applyCapture) {
      const length = applyCapture.length - 1;
      if (applyCapture[length] === figureName) {
        let finalX = -1.64;
        let xMultiplier = -0.2;
        let color = "black";
        if (applyCapture[length].includes("white")) {
          color = "white";
          finalX = 1.64;
          xMultiplier = 0.2;
        }
        const lengthColor = applyCapture.filter((figure) =>
          figure.includes(color)
        ).length;
        var tl = gsap.timeline();
        let row = 0;
        if (lengthColor > 7) {
          row = 1;
        }

        tl.to(bishopGroupRef.current.position, {
          y: 0.9,
          ease: "circ.out",
          duration: 0.1,
        });
        tl.to(bishopGroupRef.current.rotation, {
          x: Math.PI * 2,
          ease: "power2",
          duration: 0.44,
        });
        tl.to(bishopGroupRef.current.position, {
          x: finalX + xMultiplier * row,
          z: 0.64 - 0.19 * lengthColor + (7 * 0.19 + 0.095) * row,
          ease: "circ.out",
          duration: 0.45,
        });
        tl.to(bishopGroupRef.current.position, {
          y: 0.064,
          duration: 0.15,
          onComplete: () => {
            playSound(0.6);
          },
        });
      }
    }
  }, [applyCapture]);

  return (
    <>
      <group ref={bishopGroupRef} position={[positionX, 0.5, positionZ]}>
        <motion.group
          rotation-x={Math.PI * 0.5}
          rotation-z={Math.PI}
          scale={3.6}
          initial={{
            y: 3.4,
          }}
          animate={{
            y: 0,
          }}
          transition={{
            delay: figureName.includes("new") ? 0.3 : 1.2 + delay,
            duration: figureName.includes("new") ? 0.3 : 0.7,
          }}
        >
          {/* Meshes for click event*/}
          <mesh
            visible={false}
            scale={[0.04, 0.049, 0.05]}
            rotation-x={Math.PI * 0.5}
            position={[0, 0.0, -0.044]}
            onClick={
              availableClick
                ? (event) => {
                    event.stopPropagation();
                    setActiveFigure(figureName);
                  }
                : null
            }
          >
            <capsuleGeometry args={[0.3, 1.1, 1, 5]} />
          </mesh>
          <mesh
            rotation-x={Math.PI}
            position={[0, 0, -0.0001]}
            scale={0.06}
            visible={false}
            onClick={
              availableClick
                ? (event) => {
                    event.stopPropagation();
                    setActiveFigure(figureName);
                  }
                : null
            }
          >
            <planeGeometry args={[1, 1]} />
          </mesh>
          {/* Meshes for click event*/}
          <mesh
            ref={bishopMesh1}
            castShadow
            geometry={nodes.bishop_1.geometry}
            material={figureColor === "white" ? whiteMaterial1 : blackMaterial1}
          />
          <mesh
            ref={bishopMesh2}
            castShadow
            geometry={nodes.bishop_2.geometry}
            material={figureColor === "white" ? whiteMaterial2 : blackMaterial2}
          />
        </motion.group>
      </group>
    </>
  );
};

export const Rook = ({ props }) => {
  const { nodes, positionX, positionZ, figureName } = props;

  const setActiveFigure = useGame((state) => state.setActiveFigure);
  const playerColor = useGame((state) => state.playerColor);
  const playerFigure = figureName.includes(playerColor);

  const onMove = useGame((state) => state.onMove);

  const availableClick = playerFigure === true && onMove === true;

  // For inital animation
  const numFigure = figureName.charAt(figureName.length - 1);
  const delay = numFigure == 0 ? 0 : 0.28;

  const rookGroupRef = useRef();

  const applyMove = useGame((state) => state.applyMove);

  const applyCapture = useGame((state) => state.applyCapture);
  const applyUndoCaptured = useGame((state) => state.applyUndoCaptured);

  const applyCastling = useGame((state) => state.applyCastling);

  const figureNameParts = figureName.split(" ");
  const figureColor = figureNameParts[0];

  // Changing the active material
  const rookMesh1 = useRef();
  const rookMesh2 = useRef();
  const activeFigure = useGame((state) => state.activeFigure);

  useEffect(() => {
    if (activeFigure === figureName) {
      playSound(0.6);
      if (figureColor === "white") {
        rookMesh2.current.material = activeWhiteMaterial;
      } else {
        rookMesh1.current.material = activeBlackMaterial;
      }
    } else {
      if (figureColor === "white") {
        rookMesh2.current.material = whiteMaterial2;
      } else {
        rookMesh1.current.material = blackMaterial1;
      }
    }
  }, [activeFigure]);

  // apply castling
  useEffect(() => {
    if (applyCastling)
      if (applyCastling.figure === figureName) {
        let rotationX = Math.PI * 2;
        if (applyCastling.undo) {
          rotationX = 0;
        }
        let tl = gsap.timeline();
        tl.to(rookGroupRef.current.position, {
          y: 0.79,
          ease: "circ.out",
          duration: 0.1,
        });
        tl.to(rookGroupRef.current.rotation, {
          x: rotationX,
          ease: "power2",
          duration: 0.44,
        });
        tl.to(rookGroupRef.current.position, {
          ease: "circ.out",
          duration: 0.45,
          x: applyCastling.position[0],
          z: applyCastling.position[1],
        });
        tl.to(rookGroupRef.current.position, {
          y: 0.5,
          duration: 0.15,
          onComplete: () => {
            playSound(0.8);
          },
        });
      }
  }, [applyCastling]);

  // apply undo on capture
  useEffect(() => {
    if (applyUndoCaptured) {
      if (applyUndoCaptured.figure === figureName) {
        let tl = gsap.timeline();
        tl.to(rookGroupRef.current.position, {
          y: 0.9,
          ease: "circ.out",
          duration: 0.1,
        });
        tl.to(rookGroupRef.current.rotation, {
          x: 0,
          ease: "power2",
          duration: 0.44,
        });
        tl.to(rookGroupRef.current.position, {
          x: applyUndoCaptured.position[0],
          z: applyUndoCaptured.position[1],
          ease: "circ.out",
        });
        tl.to(rookGroupRef.current.position, {
          y: 0.5,
          duration: 0.15,
          onComplete: () => {
            playSound(0.6);
          },
        });
      }
    }
  }, [applyUndoCaptured]);

  // apply move
  useEffect(() => {
    if (applyMove) {
      if (applyMove.figure === figureName) {
        let tl = gsap.timeline();
        tl.to(rookGroupRef.current.position, {
          x: applyMove.position[0],
          z: applyMove.position[1],
          y: 0.5,
          ease: "circ.out",
          onComplete: () => {
            playSound(0.8);
          },
        });
      }
    }
  }, [applyMove, applyCapture]);

  // apply capture for opponent figures
  useEffect(() => {
    if (applyCapture) {
      const length = applyCapture.length - 1;
      if (applyCapture[length] === figureName) {
        let finalX = -1.64;
        let xMultiplier = -0.2;
        let color = "black";
        if (applyCapture[length].includes("white")) {
          color = "white";
          finalX = 1.64;
          xMultiplier = 0.2;
        }
        const lengthColor = applyCapture.filter((figure) =>
          figure.includes(color)
        ).length;
        var tl = gsap.timeline();
        let row = 0;
        if (lengthColor > 7) {
          row = 1;
        }

        tl.to(rookGroupRef.current.position, {
          y: 0.9,
          ease: "circ.out",
          duration: 0.1,
        });
        tl.to(rookGroupRef.current.rotation, {
          x: Math.PI * 2,
          ease: "power2",
          duration: 0.44,
        });
        tl.to(rookGroupRef.current.position, {
          x: finalX + xMultiplier * row,
          z: 0.64 - 0.19 * lengthColor + (7 * 0.19 + 0.095) * row,
          ease: "circ.out",
          duration: 0.45,
        });
        tl.to(rookGroupRef.current.position, {
          y: 0.064,
          duration: 0.15,
          onComplete: () => {
            playSound(0.8);
          },
        });
      }
    }
  }, [applyCapture]);

  return (
    <>
      <group ref={rookGroupRef} position={[positionX, 0.5, positionZ]}>
        <motion.group
          rotation-x={Math.PI * 0.5}
          rotation-z={Math.PI}
          scale={3.8}
          initial={{
            y: 3.4,
          }}
          animate={{
            y: 0,
          }}
          transition={{
            delay: figureName.includes("new") ? 0.3 : 1.2 + delay,
            duration: figureName.includes("new") ? 0.3 : 0.7,
          }}
        >
          {/* Meshes for click event*/}
          <mesh
            visible={false}
            scale={[0.039, 0.034, 0.06]}
            rotation-x={Math.PI * 0.5}
            position={[0, 0.0, -0.034]}
            onClick={
              availableClick
                ? (event) => {
                    event.stopPropagation();
                    setActiveFigure(figureName);
                  }
                : null
            }
          >
            <capsuleGeometry args={[0.3, 1.1, 1, 5]} />
          </mesh>
          <mesh
            rotation-x={Math.PI}
            position={[0, 0, -0.0001]}
            scale={0.06}
            visible={false}
            onClick={
              availableClick
                ? (event) => {
                    event.stopPropagation();
                    setActiveFigure(figureName);
                  }
                : null
            }
          >
            <planeGeometry args={[1, 1]} />
          </mesh>
          {/* Meshes for click event*/}
          <mesh
            ref={rookMesh1}
            // castShadow
            geometry={nodes.rook_1.geometry}
            material={figureColor === "white" ? whiteMaterial1 : blackMaterial1}
          />
          <mesh
            ref={rookMesh2}
            // castShadow
            geometry={nodes.rook_2.geometry}
            material={figureColor === "white" ? whiteMaterial2 : blackMaterial2}
          />
        </motion.group>
      </group>
    </>
  );
};

export const King = ({ props }) => {
  const { nodes, positionX, positionZ, figureName } = props;

  const setActiveFigure = useGame((state) => state.setActiveFigure);
  const playerColor = useGame((state) => state.playerColor);
  const playerFigure = figureName.includes(playerColor);

  const onMove = useGame((state) => state.onMove);

  const availableClick = playerFigure === true && onMove === true;

  const kingGroupRef = useRef();

  const applyMove = useGame((state) => state.applyMove);

  const figureNameParts = figureName.split(" ");
  const figureColor = figureNameParts[1];

  // Changing the active material
  const kingMesh1 = useRef();
  const kingMesh2 = useRef();
  const activeFigure = useGame((state) => state.activeFigure);

  useEffect(() => {
    if (activeFigure === figureName) {
      playSound(0.6);
      if (figureColor === "white") {
        kingMesh2.current.material = activeWhiteMaterial;
      } else {
        kingMesh1.current.material = activeBlackMaterial;
      }
    } else {
      if (figureColor === "white") {
        kingMesh2.current.material = whiteMaterial2;
      } else {
        kingMesh1.current.material = blackMaterial1;
      }
    }
  }, [activeFigure]);

  // apply move
  useEffect(() => {
    if (applyMove) {
      if (applyMove.figure === figureName) {
        let tl = gsap.timeline();
        tl.to(kingGroupRef.current.position, {
          x: applyMove.position[0],
          z: applyMove.position[1],
          y: 0.5,
          ease: "circ.out",
          onComplete: () => {
            playSound(0.8);
          },
        });
      }
    }
  }, [applyMove, onMove]);

  return (
    <>
      <group ref={kingGroupRef} position={[positionX, 0.5, positionZ]}>
        <motion.group
          rotation-x={Math.PI * 0.5}
          rotation-z={Math.PI}
          scale={3.6}
          initial={{
            y: 3.4,
          }}
          animate={{
            y: 0,
          }}
          transition={{
            delay: 1.2 + 0.12,
            duration: 0.7,
          }}
        >
          {/* Meshes for click event*/}
          <mesh
            visible={false}
            scale={[0.044, 0.06, 0.06]}
            rotation-x={Math.PI * 0.5}
            position={[0, 0.0, -0.044]}
            onClick={
              availableClick
                ? (event) => {
                    event.stopPropagation();
                    setActiveFigure(figureName);
                  }
                : null
            }
          >
            <capsuleGeometry args={[0.3, 1.1, 1, 5]} />
          </mesh>
          <mesh
            rotation-x={Math.PI}
            position={[0, 0, -0.0001]}
            scale={0.06}
            visible={false}
            onClick={
              availableClick
                ? (event) => {
                    event.stopPropagation();
                    setActiveFigure(figureName);
                  }
                : null
            }
          >
            <planeGeometry args={[1, 1]} />
          </mesh>
          {/* Meshes for click event*/}
          <mesh
            ref={kingMesh1}
            castShadow
            geometry={nodes.king_1.geometry}
            material={figureColor === "white" ? whiteMaterial1 : blackMaterial1}
          />
          <mesh
            ref={kingMesh2}
            castShadow
            geometry={nodes.king_2.geometry}
            material={figureColor === "white" ? whiteMaterial2 : blackMaterial2}
          />
        </motion.group>
      </group>
    </>
  );
};
