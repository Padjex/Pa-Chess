import { events, useFrame, useThree } from "@react-three/fiber";
import gsap from "gsap";
import useGame from "../store/useGame";
import useResponsive from "../store/useResponsive";

import { useEffect, useRef, useState } from "react";
import {
  OrthographicCamera,
  PerspectiveCamera,
  useScroll,
} from "@react-three/drei";

export const CameraAnimation = () => {
  const started = useGame((state) => state.started);
  const playerColor = useGame((state) => state.playerColor);
  const endGame = useGame((state) => state.endGame);

  const scroll = useScroll();

  scroll.fill.classList.add("top-0");
  scroll.fill.classList.add("absolute");

  const [isPerspective, setIsPerspective] = useState(true);
  const [cameraOnScroll, setCameraOnScroll] = useState(false);

  const groupCameraRef = useRef();
  const cameraPerspective = useRef(null);
  const camera2 = useRef();
  const tl = useRef();

  const isMobile = useResponsive((state) => state.isMobile);
  const isWidth = useResponsive((state) => state.isWidth);

  const multiplierZ = isMobile ? 0.7 : 1;

  const cameraStartZ =
    playerColor === "black" ? 1.9 * multiplierZ : -1.9 * multiplierZ;

  const cameraStartY = isMobile ? 1.14 : 2.76;
  const cameraEndY = isMobile ? 1.94 : 3.94;

  // Perspective to Orthographic camera
  useEffect(() => {}, [isPerspective]);

  // Camera on scroll
  useEffect(() => {
    if (cameraOnScroll) {
      tl.current = gsap.timeline();
      tl.current.fromTo(
        cameraPerspective.current.position,
        {
          z: cameraStartZ,
          y: cameraStartY,
        },
        {
          z: playerColor === "black" ? 0.4 : -0.4,
          y: cameraEndY,
          duration: 10,
          ease: "power2.inOut",
        }
      );
      return () => {
        tl.current.kill();
      };
    }
  }, [cameraOnScroll]);

  useFrame(({ camera }) => {
    cameraPerspective.current.lookAt(0, 0.2, 0);
    if (cameraOnScroll) {
      tl.current.seek(scroll.offset * tl.current.duration());
    }

    if (scroll.scroll.current > 0.9 && isPerspective) {
      setIsPerspective(false);
    }
    if (scroll.scroll.current < 0.9 && !isPerspective) {
      setIsPerspective(true);
    }
  });

  // Camera animation on started
  useEffect(() => {
    if (started) {
      let ctx = gsap.context(() => {
        gsap.to(cameraPerspective.current.position, {
          duration: 1.7,
          delay: 1,
          x: 0,
          y: cameraStartY,
          z: cameraStartZ,
          ease: "power2.out",
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
      scroll.el.scrollTo({ top: 0 });
      let ctx = gsap.to(cameraPerspective.current.position, {
        delay: 0.64,
        duration: 1.64,
        z: cameraStartZ,
        ease: "power1.inOut",
        onUpdate: function () {
          // camera.current.lookAt(0, 0.1, 0);

          // Adjust z to go from 0 to pi in order to create a semi-circular path using sin(z)

          const multiplier = Math.PI / (2 * cameraStartZ);

          const z =
            (cameraPerspective.current.position.z + Math.abs(cameraStartZ)) *
            multiplier;

          if (z < Math.PI) {
            cameraPerspective.current.position.x = Math.sin(z) * 1.74;
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
      scroll.el.scrollTo({ top: 0 });
      setCameraOnScroll(true);
    }
  }, [playerColor]);

  useEffect(() => {
    if (endGame) {
      scroll.el.scrollTo({ top: 0 });
      const tl = gsap.timeline();
      const tl2 = gsap.timeline();

      tl.to(groupCameraRef.current.rotation, {
        y: Math.PI * 39.4,
        duration: 240,
        ease: "linear",
      });

      tl2.to(cameraPerspective.current.position, {
        y: 1.4,
        duration: 14.9,
        repeat: -1,
        yoyo: true,

        onUpdate: () => {
          cameraPerspective.current.lookAt(0, 0.1, 0);
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
      {/* <OrbitControls /> */}
      <group ref={groupCameraRef}>
        <PerspectiveCamera
          ref={cameraPerspective}
          fov={isMobile ? 70 : 45}
          far={100}
          near={0.05}
          position={[-3.4, 1.2, 0]}
          makeDefault={isPerspective}
        />
      </group>
      <OrthographicCamera
        ref={camera2}
        makeDefault={!isPerspective}
        // fov={}
        position={[0, 4, 0]}
        near={0.05}
        far={100}
        lookAt={[0, 0, 0]}
        left={-1}
        right={1}
        top={1}
        bottom={-1}
      />
    </>
  );
};
