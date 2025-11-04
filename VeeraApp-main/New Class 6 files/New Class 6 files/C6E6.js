import React, { useState, useEffect, useRef } from 'react';
import { Home, ArrowLeft, Grid3x3, Lightbulb, Volume2, Award, Zap, TrendingUp, TrendingDown, Music, Users } from 'lucide-react';

const LightSoundMonitoring = () => {
  const [lightLevel, setLightLevel] = useState(300);
  const [soundLevel, setSoundLevel] = useState(45);
  const [sensorLight, setSensorLight] = useState(300);
  const [sensorSound, setSensorSound] = useState(45);
  const [lightThreshold, setLightThreshold] = useState(500);
  const [soundThreshold, setSoundThreshold] = useState(60);
  const [lightThresholdInput, setLightThresholdInput] = useState('500');
  const [soundThresholdInput, setSoundThresholdInput] = useState('60');
  const [manualLight, setManualLight] = useState('300');
  const [manualSound, setManualSound] = useState('45');
  const [isManualControl, setIsManualControl] = useState(false);
  const [score, setScore] = useState(100);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [violations, setViolations] = useState(0);
  const [showFeedback, setShowFeedback] = useState('');
  const [scene, setScene] = useState('classroom'); // 'classroom' or 'concert'
  const audioRef = useRef(null);

  // Play voiceover when component mounts
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
    }
  }, []);

  // Simulated sensor readings (replace with actual serial data)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isManualControl) {
        setSensorLight(prev => {
          const change = (Math.random() - 0.5) * 50;
          return Math.max(0, Math.min(1000, prev + change));
        });
        setSensorSound(prev => {
          const change = (Math.random() - 0.5) * 10;
          return Math.max(0, Math.min(120, prev + change));
        });
        setLightLevel(sensorLight);
        setSoundLevel(sensorSound);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isManualControl, sensorLight, sensorSound]);

  // Game timer
  useEffect(() => {
    if (gameStarted) {
      const timer = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameStarted]);

  // Check violations and update score
  useEffect(() => {
    if (gameStarted) {
      const isLightViolation = scene === 'classroom' ? 
        (lightLevel < 300 || lightLevel > lightThreshold) : 
        (lightLevel < 100 || lightLevel > 800);
      
      const isSoundViolation = soundLevel > soundThreshold;

      if (isLightViolation || isSoundViolation) {
        if (Math.random() > 0.8) { // Don't deduct every frame
          setViolations(prev => prev + 1);
          setScore(prev => Math.max(0, prev - 5));
          
          if (isLightViolation && isSoundViolation) {
            showTemporaryFeedback('⚠️ Light & Sound violations!');
          } else if (isLightViolation) {
            showTemporaryFeedback('💡 Light level issue!');
          } else {
            showTemporaryFeedback('🔊 Too noisy!');
          }
        }
      } else {
        // Small bonus for maintaining good conditions
        if (Math.random() > 0.95) {
          setScore(prev => Math.min(200, prev + 2));
        }
      }
    }
  }, [lightLevel, soundLevel, gameStarted, lightThreshold, soundThreshold, scene]);

  const showTemporaryFeedback = (message) => {
    setShowFeedback(message);
    setTimeout(() => setShowFeedback(''), 2000);
  };

  const handleSetLightThreshold = () => {
    const value = parseFloat(lightThresholdInput);
    if (!isNaN(value) && value >= 0 && value <= 1000) {
      setLightThreshold(value);
      showTemporaryFeedback('✅ Light threshold updated!');
    } else {
      alert('Please enter a valid light level between 0 and 1000 lux');
    }
  };

  const handleSetSoundThreshold = () => {
    const value = parseFloat(soundThresholdInput);
    if (!isNaN(value) && value >= 0 && value <= 120) {
      setSoundThreshold(value);
      showTemporaryFeedback('✅ Sound threshold updated!');
    } else {
      alert('Please enter a valid sound level between 0 and 120 dB');
    }
  };

  const handleResetThresholds = () => {
    setLightThreshold(500);
    setSoundThreshold(60);
    setLightThresholdInput('500');
    setSoundThresholdInput('60');
    showTemporaryFeedback('🔄 Thresholds reset!');
  };

  const handleManualLightChange = () => {
    const value = parseFloat(manualLight);
    if (!isNaN(value) && value >= 0 && value <= 1000) {
      setLightLevel(value);
      setIsManualControl(true);
      if (!gameStarted) setGameStarted(true);
    } else {
      alert('Please enter a valid light level between 0 and 1000 lux');
    }
  };

  const handleManualSoundChange = () => {
    const value = parseFloat(manualSound);
    if (!isNaN(value) && value >= 0 && value <= 120) {
      setSoundLevel(value);
      setIsManualControl(true);
      if (!gameStarted) setGameStarted(true);
    } else {
      alert('Please enter a valid sound level between 0 and 120 dB');
    }
  };

  const adjustLight = (delta) => {
    const newLight = Math.max(0, Math.min(1000, lightLevel + delta));
    setLightLevel(newLight);
    setManualLight(newLight.toString());
    setIsManualControl(true);
    if (!gameStarted) setGameStarted(true);
  };

  const adjustSound = (delta) => {
    const newSound = Math.max(0, Math.min(120, soundLevel + delta));
    setSoundLevel(newSound);
    setManualSound(newSound.toString());
    setIsManualControl(true);
    if (!gameStarted) setGameStarted(true);
  };

  const resetGame = () => {
    setScore(100);
    setTimeElapsed(0);
    setViolations(0);
    setGameStarted(false);
    setLightLevel(300);
    setSoundLevel(45);
    setManualLight('300');
    setManualSound('45');
    setIsManualControl(false);
    showTemporaryFeedback('🎮 Game Reset!');
  };

  const toggleScene = () => {
    setScene(prev => prev === 'classroom' ? 'concert' : 'classroom');
    showTemporaryFeedback(scene === 'classroom' ? '🎵 Concert Mode!' : '📚 Classroom Mode!');
  };

  const getLightStatus = () => {
    if (scene === 'classroom') {
      if (lightLevel < 300) return { status: 'danger', message: '🌑 Too Dark for Reading!' };
      if (lightLevel > lightThreshold) return { status: 'warning', message: '☀️ Too Bright!' };
      if (lightLevel >= 400 && lightLevel <= 600) return { status: 'excellent', message: '✨ Perfect Lighting!' };
      return { status: 'good', message: '💡 Good Lighting' };
    } else {
      if (lightLevel < 100) return { status: 'danger', message: '🌑 Too Dark!' };
      if (lightLevel > 800) return { status: 'warning', message: '☀️ Too Bright!' };
      if (lightLevel >= 200 && lightLevel <= 500) return { status: 'excellent', message: '🎭 Perfect Stage Lighting!' };
      return { status: 'good', message: '💡 Good Ambiance' };
    }
  };

  const getSoundStatus = () => {
    if (soundLevel > soundThreshold) return { status: 'danger', message: '🔊 Too Noisy!' };
    if (soundLevel > soundThreshold - 10) return { status: 'warning', message: '📢 Getting Loud!' };
    if (scene === 'classroom' && soundLevel < 40) return { status: 'excellent', message: '🤫 Quiet Environment' };
    if (scene === 'concert' && soundLevel > 50 && soundLevel < soundThreshold) return { status: 'good', message: '🎵 Good Music Level' };
    return { status: 'good', message: '👂 Acceptable Noise' };
  };

  const lightStatus = getLightStatus();
  const soundStatus = getSoundStatus();

  // Calculate how many people are visible based on light level
  const visiblePeople = Math.floor((lightLevel / 1000) * 8);

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-100 p-4">
      <audio ref={audioRef} src="light-sound-monitoring-voiceover.mp3" />

      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-indigo-800">
              Class 6 - Light & Sound Monitoring System
            </h1>
            <p className="text-sm text-gray-600 mt-1">Control light and sound to create the perfect environment!</p>
          </div>
          <div className="flex gap-2">
            <button 
              className="w-10 h-10 bg-yellow-400 hover:bg-yellow-500 rounded-full flex items-center justify-center transition-colors"
              onClick={() => window.history.back()}
              title="Previous Page"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <button 
              className="w-10 h-10 bg-green-400 hover:bg-green-500 rounded-full flex items-center justify-center transition-colors"
              onClick={() => console.log('Navigate to home')}
              title="Home"
            >
              <Home className="w-5 h-5 text-white" />
            </button>
            <button 
              className="w-10 h-10 bg-purple-400 hover:bg-purple-500 rounded-full flex items-center justify-center transition-colors"
              onClick={() => console.log('Navigate to levels')}
              title="Levels"
            >
              <Grid3x3 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        {/* Left Side - Kit Image & Game Stats */}
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-center mb-2">
              <h3 className="font-semibold text-sm text-gray-700">Veera Kit</h3>
              <p className="text-xs text-gray-500">LDR & Sound Sensors</p>
            </div>
            <div className="bg-indigo-100 rounded-lg p-4 border-2 border-indigo-300">
              <div className="flex justify-center gap-2">
                <Lightbulb className="w-8 h-8 text-yellow-500 animate-pulse" />
                <Volume2 className="w-8 h-8 text-blue-500 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Game Stats */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold text-gray-800">{score}</div>
              <div className="text-xs text-gray-600">Score</div>
              <div className="text-xs text-gray-500 mt-2">⏱️ {Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</div>
              <div className="text-xs text-red-600 mt-1">⚠️ Violations: {violations}</div>
              <button
                onClick={resetGame}
                className="mt-2 w-full bg-orange-400 hover:bg-orange-500 text-white text-xs font-semibold py-1 px-2 rounded transition-colors"
              >
                Reset Game
              </button>
            </div>
          </div>

          {/* Scene Toggle */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <button
              onClick={toggleScene}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {scene === 'classroom' ? <Users className="w-5 h-5" /> : <Music className="w-5 h-5" />}
              {scene === 'classroom' ? 'Classroom' : 'Concert'}
            </button>
          </div>
        </div>

        {/* Center - Main Animation/Scene */}
        <div className="col-span-7 bg-white rounded-lg shadow-md p-6 relative">
          {/* Feedback Message */}
          {showFeedback && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white px-6 py-3 rounded-full z-10 animate-pulse">
              {showFeedback}
            </div>
          )}

          {/* Scene Header */}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {scene === 'classroom' ? '📚 Smart Classroom' : '🎵 Concert Hall'}
            </h2>
            <div className="flex justify-center gap-4 mt-2">
              <div className={`px-4 py-2 rounded-full font-bold ${
                lightStatus.status === 'excellent' ? 'bg-green-200 text-green-800' :
                lightStatus.status === 'good' ? 'bg-blue-200 text-blue-800' :
                lightStatus.status === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                'bg-red-200 text-red-800'
              }`}>
                {lightStatus.message}
              </div>
              <div className={`px-4 py-2 rounded-full font-bold ${
                soundStatus.status === 'excellent' ? 'bg-green-200 text-green-800' :
                soundStatus.status === 'good' ? 'bg-blue-200 text-blue-800' :
                soundStatus.status === 'warning' ? 'bg-yellow-200 text-yellow-800' :
                'bg-red-200 text-red-800'
              }`}>
                {soundStatus.message}
              </div>
            </div>
          </div>

          {/* Main Scene */}
          <div className={`relative rounded-xl p-8 min-h-96 transition-all duration-500 ${
            scene === 'classroom' 
              ? 'bg-gradient-to-b from-blue-100 to-green-100' 
              : 'bg-gradient-to-b from-purple-900 to-indigo-900'
          }`}
          style={{
            backgroundColor: scene === 'classroom' 
              ? `rgba(219, 234, 254, ${Math.min(lightLevel / 800, 1)})` 
              : `rgba(88, 28, 135, ${Math.max(0.3, Math.min(lightLevel / 600, 1))})`
          }}>
            
            {scene === 'classroom' ? (
              // Classroom Scene
              <div className="relative h-full">
                {/* Ceiling Lights */}
                <div className="absolute top-0 left-0 right-0 flex justify-around mb-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="text-center">
                      <Lightbulb 
                        className={`w-12 h-12 ${
                          lightLevel > 300 ? 'text-yellow-400' : 'text-gray-400'
                        }`}
                        style={{
                          filter: lightLevel > 300 ? `drop-shadow(0 0 ${lightLevel / 20}px yellow)` : 'none'
                        }}
                      />
                    </div>
                  ))}
                </div>

                {/* Students sitting at desks */}
                <div className="grid grid-cols-4 gap-6 mt-20">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="text-center">
                      {/* Desk */}
                      <div className={`w-20 h-16 rounded-lg border-4 border-brown-400 mb-2 transition-all ${
                        i <= visiblePeople ? 'bg-amber-700 opacity-100' : 'bg-gray-600 opacity-30'
                      }`}>
                        {/* Book on desk */}
                        {i <= visiblePeople && (
                          <div className="w-12 h-10 bg-blue-400 mx-auto mt-2 rounded border-2 border-blue-600"></div>
                        )}
                      </div>
                      {/* Student */}
                      <div className={`text-4xl transition-opacity ${
                        i <= visiblePeople ? 'opacity-100' : 'opacity-20'
                      }`}>
                        {i % 3 === 0 ? '👧' : i % 3 === 1 ? '👦' : '🧒'}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Teacher at front */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="text-center">
                    <div className={`text-6xl ${lightLevel > 300 ? 'opacity-100' : 'opacity-30'}`}>
                      👨‍🏫
                    </div>
                    <div className={`mt-2 w-48 h-32 bg-gray-700 rounded-lg border-4 border-gray-800 flex items-center justify-center ${
                      lightLevel > 300 ? 'opacity-100' : 'opacity-30'
                    }`}>
                      <span className="text-white text-sm">Blackboard</span>
                    </div>
                  </div>
                </div>

                {/* Sound waves visualization */}
                {soundLevel > 40 && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="absolute border-4 border-blue-400 rounded-full animate-ping"
                        style={{
                          width: `${soundLevel * 2}px`,
                          height: `${soundLevel * 2}px`,
                          animationDelay: `${i * 0.3}s`,
                          opacity: soundLevel > soundThreshold ? 0.6 : 0.3
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              // Concert Hall Scene
              <div className="relative h-full">
                {/* Stage Lights */}
                <div className="absolute top-0 left-0 right-0 flex justify-around">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i}>
                      <div 
                        className={`w-8 h-8 rounded-full ${
                          lightLevel > 200 ? 'bg-yellow-400' : 'bg-gray-600'
                        }`}
                        style={{
                          boxShadow: lightLevel > 200 ? `0 0 ${lightLevel / 10}px rgba(255, 255, 0, 0.8)` : 'none'
                        }}
                      ></div>
                      <div 
                        className={`w-1 h-32 mx-auto ${lightLevel > 200 ? 'bg-yellow-300' : 'bg-gray-500'}`}
                        style={{
                          opacity: lightLevel / 1000
                        }}
                      ></div>
                    </div>
                  ))}
                </div>

                {/* Stage with performers */}
                <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-full">
                  <div className={`w-3/4 mx-auto h-24 rounded-t-lg border-4 border-amber-600 transition-all ${
                    lightLevel > 200 ? 'bg-amber-800' : 'bg-gray-800'
                  }`}>
                    <div className="flex justify-center items-end h-full gap-8 pb-4">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div 
                          key={i} 
                          className={`text-5xl transition-all ${
                            lightLevel > 150 ? 'opacity-100' : 'opacity-20'
                          }`}
                          style={{
                            transform: soundLevel > 60 ? `scale(${1 + (soundLevel - 60) / 200})` : 'scale(1)',
                            transition: 'transform 0.3s'
                          }}
                        >
                          {i === 3 ? '🎤' : i % 2 === 0 ? '🎸' : '🎹'}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Audience */}
                <div className="absolute bottom-4 left-0 right-0">
                  <div className="grid grid-cols-10 gap-2 px-8">
                    {Array.from({ length: 30 }).map((_, i) => (
                      <div 
                        key={i}
                        className={`text-2xl text-center transition-all ${
                          i < visiblePeople * 3 ? 'opacity-100' : 'opacity-20'
                        }`}
                        style={{
                          transform: soundLevel > 70 ? `translateY(-${(soundLevel - 70) / 5}px)` : 'none',
                          transition: 'transform 0.3s'
                        }}
                      >
                        {i % 3 === 0 ? '👨' : i % 3 === 1 ? '👩' : '🧑'}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sound waves for concert */}
                {soundLevel > 50 && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="absolute border-4 rounded-full animate-ping"
                        style={{
                          borderColor: `rgba(${255 - soundLevel * 2}, ${soundLevel * 2}, 255, 0.5)`,
                          width: `${soundLevel * 3}px`,
                          height: `${soundLevel * 3}px`,
                          animationDelay: `${i * 0.2}s`,
                        }}
                      ></div>
                    ))}
                  </div>
                )}

                {/* Musical notes floating */}
                {soundLevel > 60 && (
                  <div className="absolute inset-0 pointer-events-none">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="absolute text-4xl animate-bounce"
                        style={{
                          left: `${i * 20}%`,
                          top: `${20 + i * 10}%`,
                          animationDelay: `${i * 0.3}s`,
                          opacity: 0.6
                        }}
                      >
                        🎵
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Monitoring Meters */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            {/* Light Meter */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border-2 border-yellow-300">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Light Level
                </span>
                <span className="font-bold text-lg">{lightLevel.toFixed(0)} lux</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    lightStatus.status === 'danger' ? 'bg-red-500' :
                    lightStatus.status === 'warning' ? 'bg-yellow-500' :
                    lightStatus.status === 'excellent' ? 'bg-green-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${(lightLevel / 1000) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Sound Meter */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-300">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-700 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-blue-500" />
                  Sound Level
                </span>
                <span className="font-bold text-lg">{soundLevel.toFixed(0)} dB</span>
              </div>
              <div className="w-full bg-gray-300 rounded-full h-6 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${
                    soundStatus.status === 'danger' ? 'bg-red-500' :
                    soundStatus.status === 'warning' ? 'bg-yellow-500' :
                    soundStatus.status === 'excellent' ? 'bg-green-500' :
                    'bg-blue-500'
                  }`}
                  style={{ width: `${(soundLevel / 120) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Veera Avatar & Controls */}
        <div className="col-span-3 space-y-4">
          {/* Veera Avatar */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <div className="text-center mb-2">
              <h3 className="font-semibold text-gray-700">Veera Guide</h3>
            </div>
            <img 
              src="lion.gif" 
              alt="Veera Avatar" 
              className="w-full rounded-lg"
            />
            <div className="mt-3 bg-indigo-50 rounded-lg p-3">
              <p className="text-xs text-gray-700 text-center">
                "Balance light and sound for the perfect environment!"
              </p>
            </div>
          </div>

          {/* Light Control */}
          <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg shadow-md p-4 border-2 border-yellow-300">
            <h3 className="font-semibold text-gray-700 mb-3 text-center flex items-center justify-center gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-600" />
              Light Control
            </h3>
            
            <div className="bg-white rounded-lg p-3 mb-3 text-center">
              <div className="text-3xl font-bold text-gray-800">
                {lightLevel.toFixed(0)} lux
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => adjustLight(-50)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <TrendingDown className="w-4 h-4" />
                -50
              </button>
              <button
                onClick={() => adjustLight(50)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <TrendingUp className="w-4 h-4" />
                +50
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="number"
                value={manualLight}
                onChange={(e) => setManualLight(e.target.value)}
                className="w-full px-3 py-2 border-2 border-yellow-300 rounded-lg focus:border-yellow-500 focus:outline-none text-center font-bold"
                placeholder="Light level"
              />
              <button
                onClick={handleManualLightChange}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Set Light
              </button>
            </div>
          </div>

          {/* Sound Control */}
          <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg shadow-md p-4 border-2 border-blue-300">
            <h3 className="font-semibold text-gray-700 mb-3 text-center flex items-center justify-center gap-2">
              <Volume2 className="w-5 h-5 text-blue-600" />
              Sound Control
            </h3>
            
            <div className="bg-white rounded-lg p-3 mb-3 text-center">
              <div className="text-3xl font-bold text-gray-800">
                {soundLevel.toFixed(0)} dB
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => adjustSound(-5)}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <TrendingDown className="w-4 h-4" />
                -5
              </button>
              <button
                onClick={() => adjustSound(5)}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
              >
                <TrendingUp className="w-4 h-4" />
                +5
              </button>
            </div>

            <div className="space-y-2">
              <input
                type="number"
                value={manualSound}
                onChange={(e) => setManualSound(e.target.value)}
                className="w-full px-3 py-2 border-2 border-blue-300 rounded-lg focus:border-blue-500 focus:outline-none text-center font-bold"
                placeholder="Sound level"
              />
              <button
                onClick={handleManualSoundChange}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Set Sound
              </button>
            </div>
          </div>

          {/* Sensor Readings Display */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-gray-700 mb-3 text-center">
              Sensor Readings
            </h3>
            <div className="space-y-3">
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-lg p-3 border-2 border-yellow-300">
                <div className="flex items-center justify-between">
                  <Lightbulb className="w-6 h-6 text-yellow-600" />
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-800">
                      {sensorLight.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-600">lux</div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg p-3 border-2 border-blue-300">
                <div className="flex items-center justify-between">
                  <Volume2 className="w-6 h-6 text-blue-600" />
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-800">
                      {sensorSound.toFixed(0)}
                    </div>
                    <div className="text-xs text-gray-600">dB</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center mt-2">
              From Veera Kit
            </div>
          </div>

          {/* Threshold Settings */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-semibold text-gray-700 mb-3 text-center">
              Threshold Settings
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" />
                  Max Light Level (lux)
                </label>
                <input
                  type="number"
                  value={lightThresholdInput}
                  onChange={(e) => setLightThresholdInput(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none text-sm"
                  placeholder="Light threshold"
                />
                <div className="text-center bg-yellow-100 rounded p-1 mt-1">
                  <p className="text-xs text-gray-700">
                    Current: <span className="font-bold text-yellow-600">{lightThreshold}</span>
                  </p>
                </div>
                <button
                  onClick={handleSetLightThreshold}
                  className="w-full mt-2 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-1.5 rounded-lg transition-colors text-sm"
                >
                  Set Light
                </button>
              </div>

              <div>
                <label className="text-xs text-gray-600 block mb-1 flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                  Max Sound Level (dB)
                </label>
                <input
                  type="number"
                  value={soundThresholdInput}
                  onChange={(e) => setSoundThresholdInput(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none text-sm"
                  placeholder="Sound threshold"
                />
                <div className="text-center bg-blue-100 rounded p-1 mt-1">
                  <p className="text-xs text-gray-700">
                    Current: <span className="font-bold text-blue-600">{soundThreshold}</span>
                  </p>
                </div>
                <button
                  onClick={handleSetSoundThreshold}
                  className="w-full mt-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-1.5 rounded-lg transition-colors text-sm"
                >
                  Set Sound
                </button>
              </div>

              <button
                onClick={handleResetThresholds}
                className="w-full bg-gray-400 hover:bg-gray-500 text-white font-semibold py-2 rounded-lg transition-colors"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Next Experiment Button */}
      <div className="text-center">
        <button
          onClick={() => console.log('Navigate to next experiment')}
          className="bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all transform hover:scale-105"
        >
          Next Experiment →
        </button>
      </div>
    </div>
  );
};

export default LightSoundMonitoring;