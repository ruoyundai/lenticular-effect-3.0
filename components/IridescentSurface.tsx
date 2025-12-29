
import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface IridescentSurfaceProps {
  intensity: number;
  speed: number;
  grain: number;
  grainSize: number;
  brightness: number;
  flowShape: number;
  pixelation: number;
  colors: string[];
  colorWeights: number[];
  mouse: THREE.Vector2;
}

const IridescentSurface: React.FC<IridescentSurfaceProps> = ({ 
  intensity, speed, grain, grainSize, brightness, flowShape, pixelation, colors, colorWeights, mouse 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const { viewport } = useThree();

  const colorVectors = useMemo(() => {
    return colors.map(c => {
      const col = new THREE.Color(c);
      return new THREE.Vector3(col.r, col.g, col.b);
    });
  }, [colors]);

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    uIntensity: { value: intensity },
    uSpeed: { value: speed },
    uGrain: { value: grain },
    uGrainSize: { value: grainSize },
    uBrightness: { value: brightness },
    uFlowShape: { value: flowShape },
    uPixelation: { value: pixelation },
    uMouse: { value: mouse },
    uColors: { value: colorVectors },
    uColorWeights: { value: colorWeights }
  }), []);

  useFrame((state) => {
    if (meshRef.current) {
      const material = meshRef.current.material as THREE.ShaderMaterial;
      material.uniforms.uTime.value = state.clock.getElapsedTime();
      material.uniforms.uIntensity.value = intensity;
      material.uniforms.uSpeed.value = speed;
      material.uniforms.uGrain.value = grain;
      material.uniforms.uGrainSize.value = grainSize;
      material.uniforms.uBrightness.value = brightness;
      material.uniforms.uFlowShape.value = flowShape;
      material.uniforms.uPixelation.value = pixelation;
      material.uniforms.uMouse.value.copy(mouse);
      material.uniforms.uColors.value = colorVectors;
      material.uniforms.uColorWeights.value = colorWeights;
      material.uniforms.uResolution.value.set(state.size.width, state.size.height);
    }
  });

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform float uTime;
    uniform vec2 uResolution;
    uniform float uIntensity;
    uniform float uSpeed;
    uniform float uGrain;
    uniform float uGrainSize;
    uniform float uBrightness;
    uniform float uFlowShape;
    uniform float uPixelation;
    uniform vec2 uMouse;
    uniform vec3 uColors[5];
    uniform float uColorWeights[5];
    varying vec2 vUv;

    // --- Noise Helpers ---
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

    float snoise(vec2 v) {
      const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
      vec2 i  = floor(v + dot(v, C.yy) );
      vec2 x0 = v -   i + dot(i, C.xx);
      vec2 i1;
      i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
      vec4 x12 = x0.xyxy + C.xxzz;
      x12.xy -= i1;
      i = mod289(i);
      vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
      vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
      m = m*m ;
      m = m*m ;
      vec3 x = 2.0 * fract(p * C.www) - 1.0;
      vec3 h = abs(x) - 0.5;
      vec3 a0 = x - floor(x + 0.5);
      vec3 m0 = 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
      vec3 g;
      g.x  = a0.x  * x0.x  + h.x  * x0.y;
      g.yz = a0.yz * x12.xz + h.yz * x12.yw;
      g *= m0;
      return 130.0 * dot(m, g);
    }

    float random(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    vec3 getWeightedPalette(float t) {
      float wSum = uColorWeights[0] + uColorWeights[1] + uColorWeights[2] + uColorWeights[3] + uColorWeights[4];
      if (wSum <= 0.0) return uColors[0];
      
      float b1 = uColorWeights[0] / wSum;
      float b2 = (uColorWeights[0] + uColorWeights[1]) / wSum;
      float b3 = (uColorWeights[0] + uColorWeights[1] + uColorWeights[2]) / wSum;
      float b4 = (uColorWeights[0] + uColorWeights[1] + uColorWeights[2] + uColorWeights[3]) / wSum;
      
      t = clamp(t, 0.0, 1.0);
      if (t < b1) return mix(uColors[0], uColors[1], t / b1);
      if (t < b2) return mix(uColors[1], uColors[2], (t - b1) / (b2 - b1));
      if (t < b3) return mix(uColors[2], uColors[3], (t - b2) / (b3 - b2));
      return mix(uColors[3], uColors[4], (t - b3) / (1.0 - b3));
    }

    void main() {
      // --- Fluted Glass Constants (from user snippet) ---
      const float u_numSegments = 20.0;
      const float u_inputOutputRatio = 1.2;
      const float u_overlap = 0.6;
      const float u_light_strength = 0.2;

      vec2 uv = vUv;
      
      // Pixelation
      if (uPixelation > 0.0) {
        float res = 1024.0 / pow(2.0, uPixelation);
        uv = floor(uv * res) / res;
      }

      // --- Fluted Glass Logic ---
      float segmentWidth = 1.0 / u_numSegments;
      float inputSegmentWidth = segmentWidth * u_inputOutputRatio;
      float overlapWidth = segmentWidth * u_overlap;

      float segmentIndex = floor(uv.x / segmentWidth);
      float segmentStart = segmentIndex * segmentWidth;
      float localUVx = (uv.x - segmentStart) / segmentWidth;

      // Apply log compression to the x coordinate within the segment
      float compressedX = log(1.0 + localUVx * 9.0) / log(10.0);

      // Calculate the corresponding input UV
      float inputSegmentStart = segmentIndex * (inputSegmentWidth - overlapWidth);
      vec2 inputUV = vec2(inputSegmentStart + compressedX * inputSegmentWidth, uv.y);

      // --- Procedural Iridescent Logic (using inputUV from glass refraction) ---
      float time = uTime * uSpeed;
      float dist = distance(inputUV, uMouse);
      float mouseInfluence = smoothstep(0.5, 0.0, dist) * 0.35;
      
      float noiseScale = 2.0 * uFlowShape;
      float n = snoise(inputUV * noiseScale + time * 0.1 + mouseInfluence);
      n += 0.5 * snoise(inputUV * noiseScale * 2.0 - time * 0.15 + n + uMouse * 0.2);
      n += 0.25 * snoise(inputUV * noiseScale * 4.0 + time * 0.2);
      
      float d = 0.015;
      float nx = snoise((inputUV + vec2(d, 0.0)) * noiseScale + n * 0.5);
      float ny = snoise((inputUV + vec2(0.0, d)) * noiseScale + n * 0.5);
      vec3 normal = normalize(vec3(n - nx, n - ny, d * 4.0));
      
      float colorIndex = fract(n * 0.45 + time * 0.015 + dist * 0.05);
      vec3 iris = getWeightedPalette(colorIndex);
      iris = pow(iris, vec3(1.4));
      
      float spec = pow(max(0.0, dot(normal, vec3(0.5, 0.5, 1.0))), 20.0);
      
      vec3 baseColor = vec3(1.0, 1.0, 1.0);
      float mask = smoothstep(-0.6, 0.6, n);
      vec3 color = mix(baseColor, iris * uIntensity, mask);
      
      color += spec * iris * 1.8;
      color *= uBrightness;
      
      // Grain Logic
      vec2 grainUv = inputUV * 512.0 * uGrainSize;
      float grainVal = (random(grainUv + fract(uTime * 0.001)) - 0.5) * uGrain;
      color += grainVal;

      // --- Fluted Glass Shading Overlay (from user snippet) ---
      // Apply the vertical gradient
      float gradientMidpoint = 0.8;
      float gradientStrength = smoothstep(gradientMidpoint, 1.0, uv.y);
      color = mix(color, vec3(0.0), gradientStrength * 0.5);
      
      // Apply the black gradient on the right side of each segment
      float rightGradientStrength = smoothstep(0.8, 1.0, localUVx);
      color = mix(color, vec3(0.0), rightGradientStrength * u_light_strength);

      // Apply the white gradient on the left side of each segment
      float leftGradientStrength = smoothstep(0.1, 0.0, localUVx);
      color = mix(color, vec3(1.0), leftGradientStrength * u_light_strength);

      color = smoothstep(-0.01, 1.02, color);
      gl_FragColor = vec4(color, 1.0);
    }
  `;

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent={false}
      />
    </mesh>
  );
};

export default IridescentSurface;