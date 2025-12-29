
import React, { useState } from 'react';

interface UIOverlayProps {
  intensity: number;
  setIntensity: (v: number) => void;
  speed: number;
  setSpeed: (v: number) => void;
  grain: number;
  setGrain: (v: number) => void;
  grainSize: number;
  setGrainSize: (v: number) => void;
  brightness: number;
  setBrightness: (v: number) => void;
  flowShape: number;
  setFlowShape: (v: number) => void;
  pixelation: number;
  setPixelation: (v: number) => void;
  colors: string[];
  setColors: (c: string[]) => void;
  colorWeights: number[];
  setColorWeights: (w: number[]) => void;
  onClose?: () => void;
}

const UIOverlay: React.FC<UIOverlayProps> = ({ 
  intensity, setIntensity, 
  speed, setSpeed, 
  grain, setGrain,
  grainSize, setGrainSize,
  brightness, setBrightness,
  flowShape, setFlowShape,
  pixelation, setPixelation,
  colors, setColors,
  colorWeights, setColorWeights,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'main' | 'palette' | 'grain'>('main');

  const updateColor = (index: number, val: string) => {
    const newColors = [...colors];
    newColors[index] = val;
    setColors(newColors);
  };

  const updateWeight = (index: number, val: number) => {
    const newWeights = [...colorWeights];
    newWeights[index] = val;
    setColorWeights(newWeights);
  };

  return (
    <div className="absolute top-6 right-6 flex flex-col bg-black/85 backdrop-blur-3xl rounded-3xl border border-white/10 w-80 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300 z-50">
      {/* Header with Close option for mobile/cleanliness */}
      <div className="flex border-b border-white/5 bg-white/5 items-center">
        {(['main', 'palette', 'grain'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab ? 'text-white bg-white/5' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6 flex flex-col gap-6 max-h-[65vh] overflow-y-auto custom-scrollbar">
        {activeTab === 'main' && (
          <>
            <ControlSlider label="Flow Speed" val={speed} setVal={setSpeed} min={0} max={1.5} step={0.01} />
            <ControlSlider label="Intensity" val={intensity} setVal={setIntensity} min={0} max={5} step={0.1} />
            <ControlSlider label="Brightness" val={brightness} setVal={setBrightness} min={0} max={2.5} step={0.01} />
            <ControlSlider label="Turbulence" val={flowShape} setVal={setFlowShape} min={0.2} max={6} step={0.1} />
            <ControlSlider label="Pixelation" val={pixelation} setVal={setPixelation} min={0} max={10} step={1} />
          </>
        )}

        {activeTab === 'palette' && (
          <div className="flex flex-col gap-5">
            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Color Distributions</span>
            {colors.map((c, i) => (
              <div key={i} className="flex flex-col gap-3 p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                      <input 
                        type="color" 
                        value={c} 
                        onChange={(e) => updateColor(i, e.target.value)}
                        className="w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer p-0"
                      />
                      <span className="text-[10px] text-zinc-400 font-mono tracking-tight">{c.toUpperCase()}</span>
                   </div>
                   <span className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">LAYER {i+1}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between text-[9px] text-zinc-500 font-bold uppercase">
                    <span>Weight</span>
                    <span className="text-white">{(colorWeights[i] * 10).toFixed(0)}%</span>
                  </div>
                  <input 
                    type="range" min="0.1" max="10" step="0.1" 
                    value={colorWeights[i]} 
                    onChange={(e) => updateWeight(i, parseFloat(e.target.value))}
                    className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white"
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'grain' && (
          <>
            <ControlSlider label="Grain Intensity" val={grain} setVal={setGrain} min={0} max={2} step={0.01} />
            <ControlSlider label="Grain Scale" val={grainSize} setVal={setGrainSize} min={1} max={30} step={1} />
            <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl mt-2">
               <p className="text-[9px] text-emerald-500/80 uppercase tracking-tight leading-relaxed font-medium">
                 Grain creates the characteristic "Metallic Foil" texture. Increase scale for micro-structure effects.
               </p>
            </div>
          </>
        )}
      </div>

      <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2 opacity-30">
           <span className="text-[8px] text-zinc-400 uppercase tracking-widest">SYNC: OK</span>
        </div>
        <button 
          onClick={onClose}
          className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-colors"
        >
          Hide Menu
        </button>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
      `}</style>
    </div>
  );
};

const ControlSlider = ({ label, val, setVal, min, max, step }: any) => (
  <div className="flex flex-col gap-2 group">
    <div className="flex justify-between text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
      <span className="group-hover:text-zinc-200 transition-colors">{label}</span>
      <span className="text-white tabular-nums bg-white/5 px-1.5 py-0.5 rounded-md text-[9px]">{val.toFixed(2)}</span>
    </div>
    <input 
      type="range" min={min} max={max} step={step} 
      value={val} 
      onChange={(e) => setVal(parseFloat(e.target.value))}
      className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-white hover:accent-emerald-400 transition-all"
    />
  </div>
);

export default UIOverlay;
