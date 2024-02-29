import { Sphere, useScroll } from "@react-three/drei";
import { useEffect, useRef } from "react";
import { useControls } from "leva";

import * as THREE from "three";

export default function Background() {
  // const { color } = useControls({
  //   color: "#f5e9b5",
  // });

  return (
    <Sphere scale={30} position={[0, -10, 0]}>
      <meshStandardMaterial
        side={THREE.BackSide}
        toneMapped={false}
        // color="#f5e9b5"
        color="#f5bf7f"
        // color="#c4ad7a"
        // color="#f0e1c2"
        // color="#330a0b"
        // color="#2e141e"
        // color="#3d1111"
        // color="#632525"
        // color="#120101"
        // color="#331717"
        // color="#420808"
      />
    </Sphere>
  );
}
