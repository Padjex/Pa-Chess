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
  const cameraOrthographic = useRef();
  const tl1 = useRef();
  const tl2 = useRef();

  const isMobile = useResponsive((state) => state.isMobile);
  const isWidth = useResponsive((state) => state.isWidth);

  const multiplierZ = isMobile ? 0.7 : 1;

  const cameraStartZ =
    playerColor === "black" ? 1.9 * multiplierZ : -1.9 * multiplierZ;

  const cameraStartY = isMobile ? 1.14 : 2.76;
  const cameraEndY = isMobile ? 1.94 : 3.94;

  // Perspective to Orthographic camera
  useEffect(() => {
    // if (!isPerspective) {
    //   tl2.current = gsap.timeline();
    //   tl2.current.to(cameraOrthographic.current.position, {
    //     y: 2,
    //     x: 0,
    //     duration: 0.9,
    //     onUpdate: () => {
    //       cameraOrthographic.current.lookAt(0, 0.2, 0);
    //     },
    //     onComplete: () => {
    //       setCameraOnScroll(true);
    //     },
    //   });
    //   return () => {
    //     tl2.current.kill();
    //   };
    // }
  }, [isPerspective]);

  // for resizing
  const { viewport } = useThree();

  // Camera on scroll
  useEffect(() => {
    if (cameraOnScroll) {
      tl1.current = gsap.timeline();
      tl1.current.fromTo(
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
        tl1.current.kill();
      };
    }
  }, [cameraOnScroll, viewport]);

  useFrame(({ camera }) => {
    // console.log(camera.position);
    cameraPerspective.current.lookAt(0, 0.2, 0);
    cameraOrthographic.current.lookAt(0, 0.2, 0);
    if (cameraOnScroll) {
      tl1.current.seek(scroll.offset * tl1.current.duration());
      if (scroll.scroll.current > 0.9 && isPerspective) {
        setIsPerspective(false);
      }
      if (scroll.scroll.current < 0.9 && !isPerspective) {
        setIsPerspective(true);
      }
    }
  });

  // Camera animation on started
  useEffect(() => {
    // for test
    let done = false;
    if (started) {
      done = true;
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

      const multiplier = Math.PI / (2 * cameraStartZ);

      let ctx = gsap.to(cameraPerspective.current.position, {
        delay: 0.64,
        duration: 1.64,
        z: cameraStartZ,
        ease: "power1.inOut",
        onUpdate: function () {
          // camera.current.lookAt(0, 0.1, 0);

          // Adjust z to go from 0 to pi in order to create a semi-circular path using sin(z)

          const z =
            (cameraPerspective.current.position.z + Math.abs(cameraStartZ)) *
            multiplier;

          if (z < Math.PI) {
            cameraPerspective.current.position.x =
              Math.sin(z) * (isMobile ? 1.74 : 2.84);
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
      // scroll.el.scrollTo({ top: 0 });
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
        ref={cameraOrthographic}
        makeDefault={!isPerspective}
        // zoom={2.5}
        position={[0, 1, playerColor === "black" ? 0.01 : -0.01]}
        // near={0.05}
        // far={10}
        // lookAt={[0, 0.2, 0]}
        left={isMobile ? -0.6 : -2.4}
        right={isMobile ? 0.6 : 2.4}
        top={isMobile ? 1.4 : 1.8}
        bottom={isMobile ? -1.4 : -1.8}
      />
    </>
  );
};
