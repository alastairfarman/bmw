import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useLoader } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';


function App(props) {

  const [color, setColor] = useState('red');

  function Car(props) {
    const gltf = useLoader(GLTFLoader, "./car.gltf");
  
    // Define a mapping of materials to apply to specific meshes
    const materials = {
      Black_plastic: new THREE.MeshStandardMaterial({
        color: "black",
        roughness: 1,
        side: THREE.DoubleSide,
      }),
      Blue_paint: new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x3e4d66),
        side: THREE.DoubleSide,
      }),
      Bmw_Badge: new THREE.MeshStandardMaterial({
        color: "black",
        side: THREE.DoubleSide,
      }),
      Bmw_Logo: new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x3e4d44),
        side: THREE.DoubleSide,
      }),
      Brushed_metal: new THREE.MeshPhysicalMaterial({
        color: "white",
        roughness: 0,
        metalness: 1,
        clearcoat: 1,
        clearcoatRoughness: 0,
        side: THREE.DoubleSide,
      }),
      Car_paint: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(color),
        roughness: 0,
        clearcoat: 0.4,
        clearcoatRoughness: 0,
        metalness: 1,
        side: THREE.DoubleSide,
      }),
      Chrome: new THREE.MeshPhysicalMaterial({
        color: "white",
        roughness: 0,
        metalness: 1,
      }),
      Clear_glass: new THREE.MeshPhysicalMaterial({
        color: "white",
        opacity: 1,
        transmission: 0.9,
        roughness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0,
        transparent: true,
        side: THREE.DoubleSide,
      }),
      Dark_blue_paint: new THREE.MeshStandardMaterial({ color: "darkblue" }),
      Red_glass: new THREE.MeshStandardMaterial({
        color: "red",
        opacity: 0.5,
        transparent: true,
        side: THREE.DoubleSide,
      }),
      Red_paint: new THREE.MeshStandardMaterial({
        color: "red",
        side: THREE.DoubleSide,
      }),
      Tyres: new THREE.MeshStandardMaterial({
        color: "black",
        roughness: 1,
        side: THREE.DoubleSide,
      }),
      Windows: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0x777777),
        roughness: 0,
        transparent: true,
        side: THREE.DoubleSide,
        transmission: 0.7,
        clearcoat: 1,
        clearcoatRoughness: 0,
        thickness: 2,
      }),
    };
  
    gltf.scene.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        if (materials[child.name]) {
          child.material = materials[child.name];
          child.receiveShadow = true;
        }
      }
    });
  
    return (
      <primitive
        object={gltf.scene}
        rotation={[0, Math.PI / 4, 0]}
        position={[-2, 0, 0]}
      />
    );
  }

  const onColorChange = (color) => {
setColor(color)
   
  };

  function Rain() {
    const particleCount = 60;
    const particles = useRef([]);
  
    useFrame(({ clock }) => {
      const time = clock.getElapsedTime();
      for (let i = 0; i < particleCount; i++) {
        const particle = particles.current[i];
        if (particle && particle.userData.active) {
          particle.material.opacity = Math.max(
            0,
            1 - (time - particle.userData.startTime) / 1.5
          );
          if (particle.material.opacity === 0) {
            particle.userData.active = false;
            particle.visible = false;
          }
        } else if (particle && Math.random() < 0.01) {
          particle.userData.active = true;
          particle.visible = true;
          particle.userData.startTime = time;
          particle.material.opacity = 1;
        }
      }
    });
  
    return (
      <group>
        {[...Array(particleCount)].map((_, i) => (
          <mesh
            key={i}
            ref={(ref) => (particles.current[i] = ref)}
            position={[
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 20,
            ]}
            scale={[0.02, 0.02, 1]}
            userData={{ active: false }}
            visible={false}
          >
            <circleGeometry args={[1, 16]} />
            <meshBasicMaterial
              color={0xffffff}
              transparent
              opacity={0}
              depthTest={false}
              blending={THREE.AdditiveBlending}
            />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ flex: 1 }}>
        <ColorSelector onColorChange={onColorChange} />
      </div>
      <div style={{ flex: 2 }}>
        <Canvas dpr={[1, 1.5]} style={{ width: 800, height: 600 }} camera={{ fov: 30, position: [0, -0.5, 30], near: 1, far: 300, rotation: [0.1745, 0, 0] }}>
          <Car color={color} />
          <mesh rotation={[-1.5708,0,0]} position={[0,-1.1,-80]} castShadow receiveShadow>
          <planeGeometry attach="geometry" args={[250, 250, 50, 50]} receiveShadow/>
          </mesh>
          <Environment files="./img/sky.hdr" background />
          <OrbitControls enableZoom={false} enablePan={false} enableRotate={true} />
          <Rain/>
        </Canvas>
      </div>
    </div>
  );
}

function ColorSelector(props) {
  const handleColorChange = (event) => {
    props.onColorChange(event.target.value);
  };

  return (
    <div>
      <label>
        <input type="radio" name="color" value="rgb(125,125,125)" onChange={handleColorChange} />
        Silver
      </label>
      <label>
        <input type="radio" name="color" value="rgb(35,35,35)" onChange={handleColorChange} />
        Black
      </label>
      <label>
        <input type="radio" name="color" value="rgb(20,120,155)" onChange={handleColorChange} />
        Blue
      </label>
    </div>
  );
}

export default App;
