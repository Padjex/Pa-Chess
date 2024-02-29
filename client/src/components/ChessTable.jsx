import { useEffect, useRef } from "react";
import { useGLTF, useTexture, MeshReflectorMaterial } from "@react-three/drei";
import gsap from "gsap";
import useResponsive from "../store/useResponsive";

export default function ChessTable() {
  const { nodes } = useGLTF("./blender/table/chessTable4.glb");

  const texture = useTexture("./blender/table/bakeFin.png");
  // const texture = useTexture("./blender/table/bake1234.jpg");
  // const texture = useTexture("./blender/table/bake12345.jpg");

  const isMobile = useResponsive((state) => state.isMobile);
  const isWidth = useResponsive((state) => state.isWidth);

  texture.flipY = false;

  const gropuRef = useRef();

  useEffect(() => {
    const scaleValue = isWidth ? 1 : isMobile ? 0.5 : 0.7;

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

  return (
    // <group scale={isWidth ? 1 : isMobile ? 0.6 : 0.7}>
    <group ref={gropuRef}>
      <mesh
        scale={2.384}
        rotation={[-Math.PI / 2, 0, 0]}
        position-y={0.5}
        receiveShadow
      >
        <planeGeometry args={[1, 1]} />
        <MeshReflectorMaterial
          resolution={1600}
          opacity={0.319}
          mirror={1}
          transparent={true}
          blur={[1000, 1000]}
          mixBlur={0.1}
          mixStrength={100}
          roughness={0}
          depthScale={1.5}
          minDepthThreshold={1}
          maxDepthThreshold={1.4}
          metalness={0.8}
          color={"#0a0a09"}
          // color={"#1f1106"}
        />
      </mesh>
      <group scale={1.54} position-y={0.06} rotation-y={Math.PI}>
        <mesh
          receiveShadow
          geometry={nodes.squareChess.geometry}
          position={nodes.squareChess.position}
          scale={nodes.squareChess.scale}
          rotation={nodes.squareChess.rotation}
        >
          <meshBasicMaterial map={texture} />
        </mesh>

        <mesh
          geometry={nodes.tableChess.geometry}
          position={nodes.tableChess.position}
          scale={nodes.tableChess.scale}
          rotation={nodes.tableChess.rotation}
          receiveShadow
        >
          <meshStandardMaterial map={texture} roughness={0.9} />
        </mesh>
        <mesh
          geometry={nodes.table.geometry}
          position={nodes.table.position}
          scale={nodes.table.scale}
          rotation={nodes.table.rotation}
          receiveShadow
        >
          {/* <meshBasicMaterial map={texture} /> */}
          <meshStandardMaterial
            map={texture}
            roughness={0.94}
            metalness={0.99}
          />
        </mesh>
      </group>
    </group>
  );
}
