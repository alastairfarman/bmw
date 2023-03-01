import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useLoader } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { useFrame } from '@react-three/fiber';
import { ReinhardToneMapping, VideoTexture } from 'three';
import { OrbitControls } from '@react-three/drei';


function App(props) {

  const [color, setColor] = useState('rgb(125,0,55)');
  const [cameraIndex, setCameraIndex] = useState(0);


 // camera 1

  const camera = new THREE.PerspectiveCamera(30, window.innerWidth / window.innerHeight, 1, 300);
  camera.position.set(2, -0.5, 30);
  camera.rotation.set(0.1745, 0, 0);

    // camera 2

    const camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera2.position.set(0, 0, 50);


  const bumpTexture = useLoader(THREE.TextureLoader, "./bump.jpg");

  


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


  const vertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

  const fragmentShader = `
  uniform sampler2D videoTexture;
  uniform float opacity;
  varying vec2 vUv;

  void main() {
    vec4 color = texture2D(videoTexture, vUv);
    float luminance = dot(color.rgb, vec3(0.299, 0.587, 0.114));
    float alpha = smoothstep(0.0, 0.5, luminance);
    gl_FragColor = vec4(color.rgb, color.a * alpha * opacity);
  }
`;

// rain droplets on screen

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
  


  // color change for car

  const onColorChange = (color) => {
setColor(color)
   
  };


  const onCameraChange = (index) => {
    setCameraIndex(index);
  };

  return (<>
        <Canvas shadows={true} dpr={[1, 1.5]} style={{ width: 800, height: 600 }} camera={cameraIndex === 0 ? camera : camera2} onCreated={state => {state.gl.toneMapping = ReinhardToneMapping; state.gl.toneMappingExposure = 0.3; state.gl.shadowMap.enabled = true; state.gl.shadowMap.type = THREE.PCFShadowMap}}>
          
          <Car color={color} />
          
          <mesh rotation={[-1.5708,0,0]} position={[0,-1.01,-50]} receiveShadow>
            <planeGeometry attach="geometry" args={[200, 200, 100, 100]} />
            <meshStandardMaterial attach="material" color="grey" roughness={0.3} metalness={0} bumpMap={bumpTexture} bumpScale={0.2} />
          </mesh>

          <mesh position={[0, 20, -60]}>
            <planeGeometry args={[120, 90]} />
            <meshBasicMaterial map={videoTexture} transparent blending={THREE.AdditiveBlending} opacity={0.5}  />
          </mesh>

          <Environment files="./img/sky.hdr" background>
            {(texture) => {
            texture.mapping = THREE.EquirectangularReflectionMapping;
            texture.encoding = THREE.sRGBEncoding;
            texture.rotation = Math.PI / 2; // Rotate 90 degrees to the right
            return <primitive object={texture} />;}}
          </Environment>

          <Rain/>

             {/* <pointLight
            intensity={2}
            position={[1, -0.1, 4.2]}
            color={0xff5500}
            castShadow
            userData={{ name: "headlight", side: "left" }}
          />
          <pointLight
            intensity={2}
            position={[1.8, -0.1, 3.8]}
            color={0xff5500}
            castShadow
            userData={{ name: "headlight", side: "right" }}
          /> */}

          <spotLight
          position={[50, 25, 28]}
          angle={Math.PI / 8}
          penumbra={1.5}
          intensity={2}
          castShadow
          shadow-mapSize-height={2048}
          shadow-mapSize-width={2048}
          userData={{ name: "key" }}/>
    
          {/* <OrbitControls/> */}

      </Canvas>
      
      <Selector onColorChange={onColorChange} onCameraChange={onCameraChange} />
</>
  );
}

function Selector(props) {
  const handleColorChange = (event) => {
    props.onColorChange(event.target.value);
  };

  const handleCameraChange = (event) => {
    props.onCameraChange(event.target.value);
  };

  return (
    <div id='UI'>
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
   </div>
   </div>

  );
}

export default App;
