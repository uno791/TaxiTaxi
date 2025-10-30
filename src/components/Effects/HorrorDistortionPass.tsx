import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  EffectComposer,
  RenderPass,
  ShaderPass,
  GammaCorrectionShader,
} from "three-stdlib";

type Props = {
  /** 0..1 external control */
  intensity: number;
  /** normalized device coords for the ghost (0..1 range), optional */
  ghostNDC?: THREE.Vector2 | null;
};

export function HorrorDistortionPass({ intensity, ghostNDC }: Props) {
  const { gl, scene, camera, size } = useThree();

  const composer = useRef<EffectComposer | null>(null);
  const shaderPass = useRef<ShaderPass | null>(null);

  const shader = useMemo(
    () => ({
      uniforms: {
        tDiffuse: { value: null },
        uTime: { value: 0 },
        uIntensity: { value: 0 },
        uResolution: { value: new THREE.Vector2(size.width, size.height) },
        uGhostNDC: { value: new THREE.Vector2(0.5, 0.5) },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position.xy, 0.0, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform sampler2D tDiffuse;
        uniform float uTime;
        uniform float uIntensity;
        uniform vec2 uResolution;
        uniform vec2 uGhostNDC;
        varying vec2 vUv;

        float hash(vec2 p) {
          p = vec2(dot(p, vec2(127.1,311.7)), dot(p, vec2(269.5,183.3)));
          return fract(sin(dot(p,vec2(12.9898,78.233))) * 43758.5453123);
        }

        vec2 barrelAround(vec2 uv, vec2 anchor, float amt) {
          vec2 cc = uv - anchor;
          float r2 = dot(cc, cc);
          return uv + cc * r2 * amt;
        }

        void main() {
          float I = clamp(uIntensity, 0.0, 1.0);
          vec2 uv = vUv;

          float wob = (sin(uTime * 1.2) * 0.003 + sin(uTime * 3.7) * 0.002) * (0.7 + 0.3 * I);
          vec2 wobDir = normalize(uv - uGhostNDC + 1e-5);
          uv += wobDir * wob * I;

          float barrelAmt = mix(0.0, 0.35, I);
          vec2 uvB = barrelAround(uv, uGhostNDC, barrelAmt);

          float ca = mix(0.002, 0.02, I);
          vec2 dir = (uvB - uGhostNDC) * (1.2 + 0.6 * I);
          vec2 rUV = uvB + dir * ca;
          vec2 gUV = uvB;
          vec2 bUV = uvB - dir * ca;

          vec3 col = vec3(
            texture2D(tDiffuse, rUV).r,
            texture2D(tDiffuse, gUV).g,
            texture2D(tDiffuse, bUV).b
          );

          float scan = sin((uv.y + uTime * 0.25) * 920.0) * 0.06 * I;
          float n = (hash(uv * uResolution.xy + uTime * 17.0) - 0.5) * 0.08 * I;
          col += n - scan;

          float d = distance(uv, uGhostNDC);
          float vig = smoothstep(0.95, 0.25, 1.0 - d);
          col *= mix(1.0, 0.65 + 0.35 * vig, 0.55 * I);

          gl_FragColor = vec4(col, 1.0);
        }
      `,
    }),
    [size.width, size.height]
  );

  useEffect(() => {
    const c = new EffectComposer(gl);
    c.setSize(size.width, size.height);

    const rp = new RenderPass(scene, camera);
    const sp = new ShaderPass(shader as any);
    const gamma = new ShaderPass(GammaCorrectionShader);

    c.addPass(rp);
    c.addPass(sp);
    c.addPass(gamma);

    composer.current = c;
    shaderPass.current = sp;

    const prevAutoClear = gl.autoClear;
    gl.autoClear = false;

    return () => {
      gl.autoClear = prevAutoClear;
      c.dispose();
    };
  }, [gl, scene, camera, shader, size.width, size.height]);

  useEffect(() => {
    composer.current?.setSize(size.width, size.height);
    if (shaderPass.current) {
      shaderPass.current.uniforms.uResolution.value.set(size.width, size.height);
    }
  }, [size]);

  useFrame((_, delta) => {
    if (!composer.current || !shaderPass.current) return;
    const uniforms = shaderPass.current.uniforms;
    uniforms.uTime.value += delta;
    uniforms.uIntensity.value = intensity;
    if (ghostNDC) {
      uniforms.uGhostNDC.value.copy(ghostNDC);
    }
    composer.current.render();
  }, 1);

  return null;
}
