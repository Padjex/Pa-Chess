import { useFrame, useThree } from "@react-three/fiber";
import useGame from "../store/useGame";
import gsap from "gsap";
import { useEffect, useRef, useState } from "react";
import { PerspectiveCamera, useScroll } from "@react-three/drei";

export const CameraAnimation = () => {
  const { camera, viewport } = useThree();

  const isMobile = window.innerWidth < 768;
  const responsiveRatio = viewport.width / 12;

  const started = useGame((state) => state.started);
  const playerColor = useGame((state) => state.playerColor);
  const endGame = useGame((state) => state.endGame);

  const groupCameraRef = useRef();

  // Camera animation on started
  useEffect(() => {
    if (started) {
      let ctx = gsap.context(() => {
        gsap.to(camera.position, {
          duration: 1.7,
          delay: 1,
          x: 0,
          y: 3.577,
          z: -2.6,
          // x: 0,
          // y: 2.69,
          // z: -1.6,
          ease: "power2.out",
          onUpdate: () => {
            camera.lookAt(0, 0.1, 0);
          },
        });
      });
      return () => {
        ctx.revert();
      };
    }
  }, [started]);

  // Camera animation on playerColor set
  useEffect(() => {
    if (playerColor === "black") {
      let ctx = gsap.to(camera.position, {
        delay: 0.64,
        // duration: 1.4,
        duration: 1.9,
        // x: 0,
        z: 2.6,
        // z: 1.6,
        ease: "power1.inOut",
        onUpdate: function () {
          camera.lookAt(0, 0.1, 0);

          // Adjust z to go from 0 to pi in order to create a semi-circular path using sin(z)

          // PI/endPosition.z = 0.60415243338265254585820065063067
          const z =
            (camera.position.z + 2.6) * 0.60415243338265254585820065063067;

          if (z < Math.PI) {
            camera.position.x = Math.sin(z) * 1.4;
          }
        },
      });
      return () => {
        ctx.revert();
      };
    }
  }, [playerColor]);

  useEffect(() => {
    if (endGame) {
      const tl = gsap.timeline();
      const tl2 = gsap.timeline();

      tl.to(groupCameraRef.current.rotation, {
        y: Math.PI * 34,
        duration: 240,
        ease: "linear",
      });

      tl2.to(camera.position, {
        y: 1.4,
        duration: 14.9,
        repeat: -1,
        yoyo: true,

        onUpdate: () => {
          camera.lookAt(0, 0.1, 0);
        },
      });

      return () => {
        tl.kill();
        tl2.kill();
      };
    }
  }, [endGame]);

  return (
    <group ref={groupCameraRef}>
      <PerspectiveCamera
        fov={45}
        far={100}
        near={0.05}
        position={[-3.4, 3.2, 0]}
        makeDefault
      />
    </group>
  );
};
