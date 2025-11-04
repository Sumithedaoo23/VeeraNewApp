import React, { useState, useEffect, useRef } from 'react';
import { Home, ArrowLeft, Grid3x3, Play, Pause } from 'lucide-react';

const MovementDetectionExperiment = () => {
  const [sensorValue, setSensorValue] = useState(0);
  const [threshold, setThreshold] = useState(50);
  const [inputThreshold, setInputThreshold] = useState('50');
  const [isMovementDetected, setIsMovementDetected] = useState(false);
  const [detectedObject, setDetectedObject] = useState(null);
  const [objectPosition, setObjectPosition] = useState({ x: -100, y: 50 });
  const [isAnimating, setIsAnimating] = useState(true);
  const [alertActive, setAlertActive] = useState(false);
  const audioRef = useRef(null);

  // Play voiceover when component mounts
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(e => console.log('Audio play failed:', e));
    }
  }, []);

  // Simulate sensor data (replace with actual serial communication)
  useEffect(() => {
    const interval = setInterval(() => {
      const newValue = Math.floor(Math.random() * 100);
      setSensorValue(newValue);
      
      if (newValue > threshold) {
        setIsMovementDetected(true);
        setAlertActive(true);
        const objects = ['person', 'cat', 'dog'];
        setDetectedObject(objects[Math.floor(Math.random() * objects.length)]);
      } else {
        setIsMovementDetected(false);
        setAlertActive(false);
        setDetectedObject(null);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [threshold]);

  // Animate objects moving across screen
  useEffect(() => {
    if (!isAnimating) return;
    
    const animationInterval = setInterval(() => {
      setObjectPosition(prev => {
        const newX = prev.x + 2;
        if (newX > 100) {
          return { x: -100, y: Math.random() * 60 + 20 };
        }
        return { x: newX, y: prev.y };
      });
    }, 50);

    return () => clearInterval(animationInterval);
  }, [isAnimating]);

  const handleSetThreshold = () => {
    const value = parseInt(inputThreshold);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setThreshold(value);
    }
  };

  const handleReset = () => {
    setThreshold(50);
    setInputThreshold('50');
    setSensorValue(0);
  };

  const getObjectEmoji = () => {
    if (!detectedObject) return '👤';
    switch(detectedObject) {
      case 'person': return '🚶';
      case 'cat': return '🐱';
      case 'dog': return '🐕';
      default: return '👤';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white p-6">
      {/* Audio element for voiceover */}
      <audio ref={audioRef} src="VOICEOVER_FILE_PATH.mp3" />
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-cyan-300">Living Object Movement Detection</h1>
        <div className="flex gap-3">
          <button className="w-12 h-12 bg-cyan-600 hover:bg-cyan-700 rounded-full flex items-center justify-center transition">
            <ArrowLeft size={24} />
          </button>
          <button className="w-12 h-12 bg-cyan-600 hover:bg-cyan-700 rounded-full flex items-center justify-center transition">
            <Home size={24} />
          </button>
          <button className="w-12 h-12 bg-cyan-600 hover:bg-cyan-700 rounded-full flex items-center justify-center transition">
            <Grid3x3 size={24} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6 h-[calc(100vh-180px)]">
        {/* Left Panel - Kit Image */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-cyan-500/30">
          <h2 className="text-xl font-semibold mb-4 text-cyan-300">Veera Kit</h2>
          <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
            <div className="text-center text-sm text-gray-300 mb-2">PIR Motion Sensor</div>
            <div className="w-full h-48 bg-gradient-to-b from-blue-900 to-slate-800 rounded-lg flex items-center justify-center">
              <div className="text-6xl">📡</div>
            </div>
            <div className="mt-4 text-xs text-gray-400 text-center">
              Sensor detects infrared radiation from living objects
            </div>
          </div>

          {/* Sensor Reading Display */}
          <div className="bg-slate-700/50 rounded-xl p-4 mb-4">
            <h3 className="text-sm font-semibold mb-2 text-cyan-300">Sensor Reading</h3>
            <div className="bg-slate-900 rounded-lg p-4 text-center">
              <div className="text-4xl font-bold text-cyan-400">{sensorValue}</div>
              <div className="text-sm text-gray-400 mt-1">Motion Level</div>
            </div>
          </div>

          {/* Threshold Settings */}
          <div className="bg-slate-700/50 rounded-xl p-4">
            <h3 className="text-sm font-semibold mb-3 text-cyan-300">Threshold Settings</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Set Threshold</label>
                <input
                  type="number"
                  value={inputThreshold}
                  onChange={(e) => setInputThreshold(e.target.value)}
                  className="w-full bg-slate-900 rounded px-3 py-2 text-white border border-cyan-500/30 focus:border-cyan-500 outline-none"
                  min="0"
                  max="100"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSetThreshold}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-700 py-2 rounded font-semibold transition"
                >
                  Set Threshold
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded font-semibold transition"
                >
                  Reset
                </button>
              </div>
              <div className="text-xs text-gray-400 text-center">
                Current: {threshold}
              </div>
            </div>
          </div>
        </div>

        {/* Center Panel - Security Camera View */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-cyan-500/30 relative overflow-hidden">
          {/* Camera UI Elements */}
          <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-mono">REC</span>
          </div>
          <div className="absolute top-4 right-4 z-10 text-xs font-mono">
            {new Date().toLocaleTimeString()}
          </div>

          {/* Security Camera View */}
          <div className="relative w-full h-full bg-gradient-to-b from-slate-900 to-slate-800 rounded-xl overflow-hidden border-4 border-slate-700">
            {/* Grid overlay */}
            <div className="absolute inset-0 opacity-20">
              <div className="grid grid-cols-3 grid-rows-3 h-full">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="border border-cyan-500"></div>
                ))}
              </div>
            </div>

            {/* Scene Background */}
            <div className="absolute inset-0 flex items-end justify-center">
              <div className="w-full h-3/4 bg-gradient-to-t from-green-900/30 to-transparent">
                {/* House */}
                <div className="absolute bottom-0 left-1/4 w-32 h-40">
                  <div className="absolute bottom-0 w-full h-32 bg-yellow-900/60 border-2 border-yellow-700"></div>
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[64px] border-r-[64px] border-b-[40px] border-l-transparent border-r-transparent border-b-red-900"></div>
                  <div className="absolute bottom-8 left-8 w-8 h-12 bg-cyan-300/40 border border-cyan-600"></div>
                  <div className="absolute bottom-8 right-8 w-8 h-12 bg-cyan-300/40 border border-cyan-600"></div>
                </div>

                {/* Trees */}
                <div className="absolute bottom-0 right-1/4">
                  <div className="w-8 h-16 bg-amber-900"></div>
                  <div className="absolute -top-8 -left-4 text-5xl">🌳</div>
                </div>
              </div>
            </div>

            {/* Moving Object */}
            {isAnimating && (
              <div
                className="absolute text-6xl transition-all duration-100"
                style={{
                  left: `${objectPosition.x}%`,
                  top: `${objectPosition.y}%`,
                  filter: isMovementDetected ? 'drop-shadow(0 0 10px #00ff00)' : 'none'
                }}
              >
                {getObjectEmoji()}
              </div>
            )}

            {/* Detection Zone Highlight */}
            {isMovementDetected && (
              <div className="absolute inset-0 border-4 border-red-500 animate-pulse">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500/20 rounded-full w-32 h-32 animate-ping"></div>
              </div>
            )}

            {/* Alert Banner */}
            {alertActive && (
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-red-600 px-6 py-3 rounded-lg font-bold text-xl animate-pulse z-20">
                ⚠️ MOVEMENT DETECTED! ⚠️
              </div>
            )}

            {/* Status Text */}
            <div className="absolute bottom-4 left-4 bg-slate-900/80 px-4 py-2 rounded text-sm z-10">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isMovementDetected ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <span>{isMovementDetected ? `${detectedObject?.toUpperCase()} DETECTED` : 'AREA SECURE'}</span>
              </div>
            </div>

            {/* Detection Info */}
            <div className="absolute bottom-4 right-4 bg-slate-900/80 px-4 py-2 rounded text-xs z-10">
              <div>Sensitivity: {threshold}%</div>
              <div>Signal: {sensorValue}%</div>
            </div>
          </div>

          {/* Control Panel */}
          <div className="mt-4 flex justify-center gap-4">
            <button
              onClick={() => setIsAnimating(!isAnimating)}
              className="bg-cyan-600 hover:bg-cyan-700 px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition"
            >
              {isAnimating ? <Pause size={20} /> : <Play size={20} />}
              {isAnimating ? 'Pause' : 'Start'} Simulation
            </button>
          </div>
        </div>

        {/* Right Panel - Veera Avatar */}
        <div className="bg-slate-800/50 backdrop-blur rounded-2xl p-6 border border-cyan-500/30 flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-cyan-300">Veera Guide</h2>
          <div className="flex-1 flex items-center justify-center">
            <img 
              src="lion.gif" 
              alt="Veera Avatar" 
              className="max-w-full max-h-96 object-contain"
            />
          </div>
          
          {/* Information Panel */}
          <div className="mt-4 bg-slate-700/50 rounded-xl p-4">
            <h3 className="font-semibold mb-2 text-cyan-300">About This Experiment</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              PIR (Passive Infrared) sensors detect movement by measuring infrared radiation. 
              Living objects emit heat, which the sensor detects when they move within range. 
              Adjust the threshold to control sensitivity!
            </p>
          </div>

          {/* Statistics */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-cyan-400">{isMovementDetected ? 'YES' : 'NO'}</div>
              <div className="text-xs text-gray-400">Detection</div>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-cyan-400">{detectedObject || 'None'}</div>
              <div className="text-xs text-gray-400">Object Type</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="mt-6 flex justify-center">
        <button className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 px-12 py-4 rounded-xl font-bold text-lg transition shadow-lg">
          Next Experiment →
        </button>
      </div>
    </div>
  );
};

export default MovementDetectionExperiment;