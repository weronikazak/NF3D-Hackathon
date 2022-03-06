import React, {Suspense} from "react";
import { Canvas } from "react-three-fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import "./styles.css";
import Ogre from "./Ogre";


export default function App() {
  return (
    <div className="App">
      <Canvas clasName="canvas">
        <OrbitControls enableZoom={false} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[-2, 5, 2]} />
        <Suspense fallback={null}>
          <Ogre />
        </Suspense>
      </Canvas>
    </div>
  )
}
