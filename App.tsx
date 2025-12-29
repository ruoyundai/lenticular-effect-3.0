
import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import IridescentSurface from './components/IridescentSurface';
import * as THREE from 'three';

const App: React.FC = () => {
  // --- Shader States ---
  // 根据图片参考调整的参数
  const [intensity] = useState(1.8);
  const [speed] = useState(0.02); // 减慢速度使其更优雅
  const [grain] = useState(0.3); // 降低颗粒感，增加丝滑感
  const [grainSize] = useState(20.0);
  const [brightness] = useState(1.1); // 柔和亮度
  const [flowShape] = useState(0.4);
  const [pixelation] = useState(0); 

  // 精准匹配图片的马卡龙调色盘
  const [colors] = useState([
    '#95d5ee', // 柔和天蓝 (左上核心)
    '#84a0d4', // 灰蓝 (右侧深处)
    '#d0a9c5', // 灰粉 (底部过渡)
    '#e9e2f5', // 极浅紫 (高光区域)
    '#bfe2b0'  // 浅黄绿 (边缘漫射)
  ]);
  
  // 调整权重，让蓝色和粉紫色的占比更接近图中比例
  const [colorWeights] = useState([1.2, 1.0, 1.1, 0.8, 0.6]);
  
  const [mouse, setMouse] = useState(new THREE.Vector2(0.5, 0.5));

  const handleMouseMove = useCallback((e: React.MouseEvent | MouseEvent) => {
    setMouse(new THREE.Vector2(
      e.clientX / window.innerWidth,
      1.0 - (e.clientY / window.innerHeight)
    ));
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div className="relative w-full h-full bg-white overflow-hidden">
      <Suspense fallback={<div className="w-full h-full bg-white" />}>
        <Canvas 
          camera={{ position: [0, 0, 1], fov: 45 }}
          gl={{ antialias: true, alpha: false, stencil: false, depth: false }}
          className="w-full h-full"
        >
          <IridescentSurface 
            intensity={intensity} 
            speed={speed} 
            grain={grain}
            grainSize={grainSize}
            brightness={brightness}
            flowShape={flowShape}
            pixelation={pixelation}
            colors={colors}
            colorWeights={colorWeights}
            mouse={mouse}
          />
        </Canvas>
      </Suspense>
    </div>
  );
};

export default App;
