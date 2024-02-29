import { Environment, SoftShadows } from "@react-three/drei";
import { motion } from "framer-motion-3d";
export default function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <motion.directionalLight
        initial={{ x: -4, y: 14, z: -1, intensity: 0.01 }}
        animate={{ x: 4, y: 9, z: -1, intensity: 1.94 }}
        transition={{ duration: 0.8, delay: 1.44 }}
        castShadow
        // shadow-bias={0.00015}
        // shadow-normalBisa={0.001}
      />
      <directionalLight
        intensity={1.14}
        position={[-9, 5, 1]}
        castShadow
        // shadow-bias={0.00015}
        // shadow-normalBisa={0.421}
      />
      {/* <Environment preset="apartment" /> */}
    </>
  );
}
