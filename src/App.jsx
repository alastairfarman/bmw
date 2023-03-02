import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useLoader } from '@react-three/fiber';
import { Environment, Float } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { useFrame, useThree } from '@react-three/fiber';
import {  ReinhardToneMapping, VideoTexture } from 'three';

import { EffectComposer, DepthOfField, Bloom, Noise, Vignette } from '@react-three/postprocessing';



//camera 1

const camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 1, 500);
camera.position.set(2, -0.5, 30);
camera.rotation.set(0.14, 0, 0);



function App(props) {

  const [color, setColor] = useState('rgb(125,0,55)');
  const [bokeh, setBokeh] = useState(0);
  const [focusDistance, setFocusDistance] = useState(0.13);
  const [focalLength, setFocalLength] = useState(0.1);
// load floor texture

const bumpTexture = useLoader(THREE.TextureLoader, "./bump.jpg");
bumpTexture.minFilter = THREE.LinearFilter;




// Car


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
        roughness: 0,
        metalness: 1,
        side: THREE.DoubleSide,
      }),
      Bmw_Logo: new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x3e4d44),
        side: THREE.DoubleSide,
      }),
      Brushed_metal: new THREE.MeshPhysicalMaterial({
        color: "rgb(170,170,170)",
        roughness: 0,
        metalness: 1,
        side: THREE.DoubleSide,
      }),
      Car_paint: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(color),
        roughness: 0,
        clearcoat: 1,
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
        transmission: 0.95,
        roughness: 0.15,
        clearcoat: 1,
        clearcoatRoughness: 0,
        transparent: true,
        side: THREE.DoubleSide,
      }),
      Dark_blue_paint: new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x0033ff),
        side: THREE.DoubleSide,
      }),
      Red_glass: new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(0xff0000),
        roughness: 0,
        transparent: true,
        side: THREE.DoubleSide,
        transmission: 0.8,
        clearcoat: 1,
        clearcoatRoughness: 0,
        thickness: 2,
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
        transmission: 1,
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

    const { scene } = useThree();

  

    const setHeadlightIntensity = (intensity, intensity2) => {
      scene.traverse((object) => {
        if (
          object.type === "PointLight" &&
          object.userData.name === "headlight"
        ) {
          object.intensity = intensity;
        }

        if (
          object.type === "SpotLight" &&
          object.userData.name === "headlight"
        ) {
          object.intensity = intensity2;
        }
      });

    };


  const handlePointerOver = (event) => {
    setHeadlightIntensity(0.7, 400);
  };

  const handlePointerOut = (event) => {
    setHeadlightIntensity(0, 0);
  };


  
    return (
      <primitive
        object={gltf.scene}
        rotation={[0, Math.PI / 4, 0]}
        position={[-2, 0, 0]}
        onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      />
    );
  }

// video texture for rain storm

const [video] = useState(() => {
  const video = document.createElement('video');
  video.src = './a.webm';
  video.loop = true;
  video.muted = true;
  video.play();
  return video;
});

const videoTexture = new VideoTexture(video);

videoTexture.minFilter = THREE.LinearFilter;
videoTexture.magFilter = THREE.LinearFilter;
videoTexture.format = THREE.RGBAFormat;


// rain droplets on screen

function Rain({ activeCamera }) {
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

  let position;
  if (activeCamera === 0) {
    position = [0, 20, -60];
  } else if (activeCamera === 1) {
    position = [0, 20, -30];
  }

  return (
    <group position={position}>
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

// color change for car

  const onColorChange = (color) => {
setColor(color)
   
  };


  const onCameraChange = (index) => {
    switch(index) {
      case 0:
        camera.position.set(2, -0.5, 30);
        camera.rotation.set(0.14, 0, 0);
        camera.fov = 25
        setBokeh(0)
          setFocusDistance(1)
          setFocalLength(1)
        break;
      case 1:
        camera.position.set(-12, 0.7, -13);
        camera.rotation.set(0, -Math.PI/1.3, 0);
        camera.fov = 10
        setBokeh(10)
        setFocusDistance(0.2)
        setFocalLength(0.2)
        break;
        case 2:
          camera.position.set(20, 0.5, 10);
          camera.rotation.set(0, Math.PI/2.6, 0);
          camera.fov = 6.5
          setBokeh(20)
          setFocusDistance(0.035)
          setFocalLength(0.03)

          break;
      default:
        break;
    }
    camera.updateProjectionMatrix()
  };
  

  return (
  <>
    <Canvas shadows={true} dpr={[1, 1.5]} style={{ width: 1000, height: 600 }} camera={camera} onCreated={state => {state.gl.toneMapping = ReinhardToneMapping; state.gl.toneMappingExposure = 0.15; state.gl.shadowMap.enabled = true; state.gl.shadowMap.type = THREE.PCFShadowMap}}>

          <Car color={color} smaa />
          
          <mesh rotation={[-1.5708,0,0]} position={[0,-1.01,-50]} receiveShadow>
            <planeGeometry attach="geometry" args={[200, 200, 100, 100]} />
            <meshStandardMaterial attach="material" color="grey" roughness={0.6} metalness={0} bumpMap={bumpTexture} bumpScale={0.05} />
          </mesh>

          <mesh rotation={[-1.5708,0,0]} position={[0,-1,10]} receiveShadow>
            <planeGeometry attach="geometry" args={[40, 40, 100, 100]} />
            <meshStandardMaterial attach="material" color="grey" roughness={0.6} metalness={0} bumpMap={bumpTexture} bumpScale={0.05} />
          </mesh>

          <Float
  speed={0.5} // Animation speed, defaults to 1
  rotationIntensity={0.1} // XYZ rotation intensity, defaults to 1
  floatIntensity={1} // Up/down float intensity, works like a multiplier with floatingRange,defaults to 1
>
          <mesh position={[40,4,40]}>
            <sphereGeometry attach="geometry" args={[0.5, 60, 30]} />
            <meshPhysicalMaterial attach="material" color="white" roughness={0} metalness={1} bumpMap={bumpTexture} bumpScale={0.1} />
          </mesh>
          </Float>

          <Environment files="./img/sky.hdr" background onCreated={state => {state.texture.mapping = THREE.EquirectangularReflectionMapping; state.texture.encoding = THREE.sRGBEncoding; state.texture.rotation = Math.PI / 2 * -1;}}/>

          <Rain/>

          <pointLight
            intensity={0}
            position={[3, 0.9, 3.5]}
            color={0xff5500}
            castShadow
            userData={{ name: "headlight", side: "left" }}
          />
          <pointLight
            intensity={0}
            position={[1.5, 0.9, 4.5]}
            color={0xff5544}
            castShadow
            userData={{ name: "headlight", side: "right" }}
          />

          <spotLight
          position={[3.8,-0.2,6.1]}
          angle={Math.PI / 64}
          penumbra={1}
          intensity={0}
          color={0xffddaa}
          castShadow
          userData={{name: "headlight", side: "left"}}
          />
          <spotLight
          position={[1.7,-0.2,7.5]}
          angle={Math.PI / 64}
          penumbra={1}
          intensity={0}
          color={0xffddaa}
          castShadow
          userData={{name: "headlight", side: "right"}}
          />

          <spotLight
          position={[60, 5, 50]}
          angle={Math.PI / 8}
          penumbra={1.5}
          intensity={6}
          color={0xffcfaa}
          castShadow
          shadow-mapSize-height={2048}
          shadow-mapSize-width={2048}
          userData={{ name: "key" }}/>
<EffectComposer smaa>
        
      <DepthOfField focusDistance={focusDistance} focalLength={focalLength} bokehScale={bokeh} height={480} />
      <Bloom luminanceThreshold={0.8} luminanceSmoothing={1} height={512} opacity={4} />
        <Noise opacity={0.05} />
        <Vignette eskil={true} offset={0.5} darkness={0.2} />
      </EffectComposer>
      <mesh position={[0, 20, -60]}>
            <planeGeometry args={[120, 90]} />
            <meshBasicMaterial map={videoTexture} transparent opacity={10} blending={THREE.AdditiveBlending} depthWrite={false} receiveShadow={false} castShadow={false} />
          </mesh>
    </Canvas>
    <Selector onColorChange={onColorChange} onCameraChange={onCameraChange} />
</>);
}

function Selector(props) {
  const handleColorChange = (event) => {
    props.onColorChange(event.target.value);
  };

  const handleCameraChange = (event) => {
    props.onCameraChange(parseInt(event.target.value));
  };
  

  return (
    <div id='ui'>
    <div>
      <label>
        <input type="radio" name="color" value="rgb(172,175,178)" onChange={handleColorChange} />
        Silver
      </label>
      <label>
        <input type="radio" name="color" value="rgb(45,45,45)" onChange={handleColorChange} />
        Black
      </label>
      <label>
        <input type="radio" name="color" value="rgb(20,120,155)" onChange={handleColorChange} />
        Blue
      </label>
    </div>
     <div>
     <label>
       <input type="radio" name="camera" value="0"  onChange={handleCameraChange} />
       Camera 1
     </label>
     <label>
       <input type="radio" name="camera" value="1" onChange={handleCameraChange} />
       Camera 2
     </label>
     <label>
     <input type="radio" name="camera" value="2" onChange={handleCameraChange} />
       Camera 3
     </label>
   </div>
   </div>

  );
}

export default App;
