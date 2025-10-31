import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

type BillboardProps = {
  position?: [number, number, number];
  rotation?: [number, number, number];
};

export default function FlickeringBillboard({
  position = [0, 2, 0],
  rotation = [0, 0, 0],
}: BillboardProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const shaderRef = useRef<THREE.ShaderMaterial>(null);
  const mainTextRef = useRef<THREE.Mesh>(null);
  const redRef = useRef<THREE.Mesh>(null);
  const cyanRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (shaderRef.current) shaderRef.current.uniforms.uTime.value = t;

    const flicker = 0.8 + Math.sin(t * 50.0) * 0.2 + Math.random() * 0.2;

    // Main text opacity flicker
    if (mainTextRef.current) {
      const mat = mainTextRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = flicker;
    }

    // RGB offset flicker bursts
    const burst = Math.random() > 0.96;
    const offset = burst
      ? (Math.random() - 0.5) * 0.8
      : Math.sin(t * 70.0) * 0.1;

    if (redRef.current) {
      const mat = redRef.current.material as THREE.MeshBasicMaterial;
      redRef.current.position.x = offset + 0.05;
      mat.opacity = 0.6 + Math.random() * 0.3;
    }

    if (cyanRef.current) {
      const mat = cyanRef.current.material as THREE.MeshBasicMaterial;
      cyanRef.current.position.x = -offset - 0.05;
      mat.opacity = 0.6 + Math.random() * 0.3;
    }
  });

  // --- Full RGB Glitch Shader ---
  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    varying vec2 vUv;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = random(i);
      float b = random(i + vec2(1.0, 0.0));
      float c = random(i + vec2(0.0, 1.0));
      float d = random(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) +
             (c - a) * u.y * (1.0 - u.x) +
             (d - b) * u.x * u.y;
    }

    void main() {
      vec2 uv = vUv;

      // --- Horizontal RGB tearing ---
      float tearA = step(0.8, random(vec2(floor(uv.y * 50.0), floor(uTime * 3.0))));
      float tearB = step(0.9, random(vec2(floor(uv.y * 30.0), floor(uTime * 4.0))));
      float shift = (tearA + tearB) * (sin(uTime * 90.0) * 0.4 + 0.3);
      uv.x += shift;

      // --- RGB channel distortions ---
      vec2 rUV = uv + vec2(sin(uTime * 2.0 + uv.y * 10.0) * 0.02, 0.0);
      vec2 gUV = uv + vec2(cos(uTime * 1.5 + uv.y * 20.0) * 0.015, 0.0);
      vec2 bUV = uv + vec2(sin(uTime * 3.0 + uv.y * 15.0) * -0.025, 0.0);

      // --- Channel noise ---
      float r = noise(rUV * 20.0 + uTime * 4.0);
      float g = noise(gUV * 25.0 - uTime * 3.0);
      float b = noise(bUV * 22.0 + uTime * 5.0);

      // --- Combine with rainbow bursts ---
      vec3 color = vec3(r, g, b);
      color.r += step(0.98, random(uv + uTime * 5.0)) * 0.8;
      color.g += step(0.985, random(uv * 3.0 - uTime * 2.0)) * 0.8;
      color.b += step(0.99, random(uv * 4.0 + uTime * 4.0)) * 0.8;

      // --- Vertical color bleeding ---
      color += vec3(
        sin(uv.y * 80.0 + uTime * 30.0) * 0.3,
        sin(uv.y * 90.0 - uTime * 40.0) * 0.3,
        cos(uv.y * 70.0 + uTime * 50.0) * 0.3
      );

      // --- Scanlines & flicker ---
      float scan = sin(uv.y * 1200.0 + uTime * 400.0) * 0.25;
      color += scan;

      // --- Extra saturation for RGB bloom effect ---
      color = pow(color, vec3(0.9));
      color = mix(color, vec3(1.0, 0.4, 0.8), 0.2 * sin(uTime * 3.0));

      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return (
    <group position={position} rotation={rotation}>
      {/* Billboard Face */}
      <mesh ref={meshRef} position={[0, 3.2, 0]}>
        <planeGeometry args={[8, 3]} />
        <shaderMaterial
          ref={shaderRef}
          vertexShader={vertexShader}
          fragmentShader={fragmentShader}
          uniforms={{ uTime: { value: 0 } }}
        />
      </mesh>

      {/* Frame / Back */}
      <mesh position={[0, 3.2, -0.1]}>
        <boxGeometry args={[8, 3, 0.2]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Pole */}
      <mesh position={[0, 1.2, -0.6]}>
        <cylinderGeometry args={[0.1, 0.15, 2.4, 12]} />
        <meshStandardMaterial color="#333" metalness={0.4} roughness={0.7} />
      </mesh>

      {/* Main text */}
      <Text
        ref={mainTextRef}
        position={[0, 3.2, 0.12]}
        fontSize={0.6}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        material-transparent
        maxWidth={5.5}
        textAlign="center"
        lineHeight={1.1}
      >
        BRANDEN AND PRAVESH CAUGHT IN A FREAK OFF.....6 DEAD
      </Text>

      {/* Red RGB Split */}
      <Text
        ref={redRef}
        position={[0.05, 3.2, 0.11]}
        fontSize={0.6}
        color="#ff0033"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        material-transparent
        maxWidth={5.5}
        textAlign="center"
        lineHeight={1.1}
      >
        BRANDEN AND PRAVESH CAUGHT IN A FREAK OFF.....6 DEAD
      </Text>

      {/* Cyan RGB Split */}
      <Text
        ref={cyanRef}
        position={[-0.05, 3.2, 0.11]}
        fontSize={0.6}
        color="#00ffff"
        anchorX="center"
        anchorY="middle"
        fontWeight="bold"
        material-transparent
        maxWidth={5.5}
        textAlign="center"
        lineHeight={1.1}
      >
       BRANDEN AND PRAVESH CAUGHT IN A FREAK OFF.....6 DEAD
      </Text>
    </group>
  );
}
