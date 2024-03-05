import { useFrame, useThree } from "@react-three/fiber";

import useGame from "../store/useGame";
import gsap from "gsap";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  OrthographicCamera,
  PerspectiveCamera,
  useScroll,
} from "@react-three/drei";

export const CameraAnimation = () => {
  const started = useGame((state) => state.started);
  const playerColor = useGame((state) => state.playerColor);
  const endGame = useGame((state) => state.endGame);

  const groupCameraRef = useRef();

  const scroll = useScroll();

  scroll.fill.classList.add("top-0");
  scroll.fill.classList.add("absolute");

  const [isPerspective, setIsPerspective] = useState(true);
  const [cameraOnScroll, setCameraOnScroll] = useState(false);

  const camera = useRef(null);
  const tl = useRef();

  const cameraStartZ = playerColor === "black" ? 1.9 : -1.9;

  const cameraStartY = 2.46;

  useEffect(() => {
    if (cameraOnScroll) {
      tl.current = gsap.timeline();
      tl.current.fromTo(
        camera.current.position,
        {
          // z: playerColor === "black" ? 2.6 : -2.6,
          z: cameraStartZ,
          y: cameraStartY,
        },
        {
          z: playerColor === "black" ? 0.4 : -0.4,
          y: 4,
          duration: 10,
          ease: "power2.inOut",
        }
      );
      return () => {
        tl.current.kill();
      };
    }
  }, [cameraOnScroll]);

  useFrame(() => {
    camera.current.lookAt(0, 0.2, 0);
    if (cameraOnScroll) {
      tl.current.seek(scroll.offset * tl.current.duration());
    }
  });

  // Camera animation on started
  useEffect(() => {
    if (started) {
      let ctx = gsap.context(() => {
        gsap.to(camera.current.position, {
          duration: 1.7,
          delay: 1,
          x: 0,
          // y: 3.577,
          y: cameraStartY,
          z: cameraStartZ,
          ease: "power2.out",
          onUpdate: () => {
            // camera.current.lookAt(0, 0.1, 0);
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
      let ctx = gsap.to(camera.current.position, {
        delay: 0.64,
        duration: 1.64,
        z: 1.9,
        ease: "power1.inOut",
        onUpdate: function () {
          // camera.current.lookAt(0, 0.1, 0);

          // Adjust z to go from 0 to pi in order to create a semi-circular path using sin(z)

          // PI/endPosition.z = 0.60415243338265254585820065063067
          const multiplier = Math.PI / (2 * cameraStartZ);

          // const z =
          //   (camera.current.position.z + 1.9) *
          //   0.60415243338265254585820065063067;

          const z =
            (camera.current.position.z + Math.abs(cameraStartZ)) * multiplier;

          if (z < Math.PI) {
            camera.current.position.x = Math.sin(z) * 1.74;
          }
        },
        onComplete: () => {
          setCameraOnScroll(true);
        },
      });
      return () => {
        ctx.revert();
      };
    } else if (playerColor === "white") {
      setCameraOnScroll(true);
    }
  }, [playerColor]);

  useEffect(() => {
    if (endGame) {
      const tl = gsap.timeline();
      const tl2 = gsap.timeline();

      tl.to(groupCameraRef.current.rotation, {
        y: Math.PI * 39.4,
        duration: 240,
        ease: "linear",
      });

      tl2.to(camera.current.position, {
        y: 1.4,
        duration: 14.9,
        repeat: -1,
        yoyo: true,

        onUpdate: () => {
          camera.current.lookAt(0, 0.1, 0);
        },
      });

      return () => {
        tl.kill();
        tl2.kill();
      };
    }
  }, [endGame]);

  return (
    <>
      {isPerspective ? (
        <group ref={groupCameraRef}>
          <PerspectiveCamera
            fov={45}
            far={100}
            near={0.05}
            position={[-3.4, 1.2, 0]}
            makeDefault
            ref={camera}
          />
        </group>
      ) : (
        <OrthographicCamera makeDefault position={[0, 4, 0]} />
      )}
    </>
  );
};
