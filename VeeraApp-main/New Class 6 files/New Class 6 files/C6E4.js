import React, { useState, useEffect, useRef } from 'react';
import { Home, ChevronLeft, Grid3x3, Volume2, Lightbulb, Sun, Moon, Star, Trophy, Zap } from 'lucide-react';

const AutomaticLightControlExperiment = () => {
  const [sensorValue, setSensorValue] = useState(800);
  const [threshold, setThreshold] = useState(500);
  const [inputThreshold, setInputThreshold] = useState('500');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [manualBrightness, setManualBrightness] = useState(80);
  const [selectedLocation, setSelectedLocation] = useState('street');
  const [score, setScore] = useState(0);
  const [challengeCompleted, setChallengeCompleted] = useState({
    street: false,
    park: false,
    school: false,
    home: false
  });
  const audioRef = useRef(null);

  const locations = {
    street: { 
      name: 'City Street', 
      icon: '🏙️', 
      optimalThreshold: 450, 
      description: 'Street lights for evening commuters',
      challenge: 'Turn lights ON when brightness drops below 50%'
    },
    park: { 
      name: 'Public Park', 
      icon: '🌳', 
      optimalThreshold: 400, 
      description: 'Park safety lighting',
      challenge: 'Lights should activate earlier for safety'
    },
    school: { 
      name: 'School Campus', 
      icon: '🏫', 
      optimalThreshold: 350, 
      description: 'Energy-efficient campus lighting',
      challenge: 'Save energy - lights ON only when quite dark'
    },
    home: { 
      name: 'Home Porch', 
      icon: '🏠', 
      optimalThreshold: 500, 
      description: 'Automatic porch lighting',
      challenge: 'Welcoming light as evening approaches'
    }
  };

  // Convert manual brightness to sensor value
  useEffect(() => {
    setSensorValue(manualBrightness * 10);
  }, [manualBrightness]);

  // Auto-play audio on component mount
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch(err => console.log('Audio autoplay prevented:', err));
    }
  }, []);

  const handleSetThreshold = () => {
    const value = parseInt(inputThreshold);
    if (!isNaN(value) && value >= 0) {
      setThreshold(value);
      checkChallenge(value);
    }
  };

  const checkChallenge = (newThreshold) => {
    const location = locations[selectedLocation];
    const diff = Math.abs(newThreshold - location.optimalThreshold);
    
    if (diff <= 50 && !challengeCompleted[selectedLocation]) {
      setChallengeCompleted(prev => ({ ...prev, [selectedLocation]: true }));
      setScore(prev => prev + 25);
    }
  };

  const handleResetThreshold = () => {
    setThreshold(500);
    setInputThreshold('500');
  };

  const lightsOn = sensorValue < threshold;
  const brightness = Math.round((sensorValue / 1000) * 100);

  const getSkyGradient = () => {
    if (brightness > 80) return 'from-blue-400 via-blue-300 to-cyan-200';
    if (brightness > 60) return 'from-blue-500 via-blue-400 to-blue-300';
    if (brightness > 40) return 'from-orange-400 via-pink-400 to-purple-400';
    if (brightness > 20) return 'from-indigo-600 via-purple-700 to-indigo-800';
    return 'from-indigo-900 via-purple-900 to-black';
  };

  const getCharacterReaction = () => {
    const location = locations[selectedLocation];
    const shouldBeOn = brightness < 50;
    
    if (shouldBeOn && lightsOn) return { emoji: '😊', text: 'Perfect! Well lit and safe!' };
    if (!shouldBeOn && !lightsOn) return { emoji: '😄', text: 'Great! Saving energy!' };
    if (shouldBeOn && !lightsOn) return { emoji: '😟', text: 'Too dark! Need lights!' };
    return { emoji: '😕', text: 'Wasting energy in daylight!' };
  };

  const reaction = getCharacterReaction();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col">
      <audio ref={audioRef} onPlay={() => setIsAudioPlaying(true)} onEnded={() => setIsAudioPlaying(false)}>
        <source src="automatic_light_control_voiceover.mp3" type="audio/mpeg" />
      </audio>

      {/* Header */}
      <div className="bg-gradient-to-r from-amber-600 to-yellow-600 text-white py-4 px-6 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Class 6 - Experiment 4: Automatic Light Control</h1>
          <div className="flex gap-3">
            <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <Home className="w-6 h-6" />
            </button>
            <button className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors">
              <Grid3x3 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-12 gap-6 h-full">
          
          {/* Left Side - Controls and Game Info */}
          <div className="col-span-3 space-y-4">
            {/* Score Display */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold">Score</span>
                <Trophy className="w-5 h-5" />
              </div>
              <div className="text-4xl font-bold">{score}</div>
              <div className="text-xs mt-1">
                {Object.values(challengeCompleted).filter(v => v).length}/4 Completed
              </div>
            </div>

            {/* Sensor Reading */}
            <div className="bg-white rounded-xl shadow-lg p-5 border-2 border-amber-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                Light Sensor (LDR)
              </h3>
              <div className="text-center">
                <div className="text-5xl font-bold text-amber-600 mb-2">
                  {Math.round(sensorValue)}
                </div>
                <div className="text-sm text-gray-600 mb-3">Lux Units</div>
                <div className="flex items-center justify-center gap-2 text-sm">
                  {brightness > 50 ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-indigo-400" />
                  )}
                  <span className="font-medium">{brightness}% Bright</span>
                </div>
              </div>
              
              {/* Light Status */}
              <div className={`mt-4 text-center px-4 py-3 rounded-lg ${
                lightsOn ? 'bg-yellow-100' : 'bg-gray-100'
              }`}>
                <div className="flex items-center justify-center gap-2">
                  <Lightbulb className={`w-5 h-5 ${lightsOn ? 'text-yellow-500' : 'text-gray-400'}`} />
                  <span className={`text-xl font-bold ${lightsOn ? 'text-yellow-600' : 'text-gray-600'}`}>
                    {lightsOn ? 'ON' : 'OFF'}
                  </span>
                </div>
              </div>
            </div>

            {/* Threshold Settings */}
            <div className="bg-white rounded-xl shadow-lg p-5 border-2 border-amber-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Set Threshold</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Threshold Value (Lux)
                  </label>
                  <input
                    type="number"
                    value={inputThreshold}
                    onChange={(e) => setInputThreshold(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-amber-500 focus:outline-none"
                    placeholder="Enter threshold"
                  />
                </div>
                <button
                  onClick={handleSetThreshold}
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 rounded-lg transition-colors"
                >
                  Set Threshold
                </button>
                <button
                  onClick={handleResetThreshold}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 rounded-lg transition-colors"
                >
                  Reset
                </button>
                <div className="text-center text-sm text-gray-600 mt-2">
                  Current: <span className="font-bold text-amber-600">{threshold} Lux</span>
                </div>
              </div>
            </div>
          </div>

          {/* Center - Interactive Game Scene */}
          <div className="col-span-6 space-y-4">
            
            {/* Location Selector */}
            <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-indigo-300">
              <h3 className="text-lg font-bold text-gray-800 mb-3">🎮 Choose Location Challenge:</h3>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(locations).map(([key, loc]) => (
                  <button
                    key={key}
                    onClick={() => setSelectedLocation(key)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      selectedLocation === key 
                        ? 'border-amber-500 bg-amber-50 scale-105' 
                        : 'border-gray-300 hover:border-amber-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{loc.icon}</div>
                    <div className="text-xs font-bold text-gray-700">{loc.name}</div>
                    {challengeCompleted[key] && (
                      <div className="text-green-600 mt-1">✓</div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Main Scene */}
            <div className={`bg-gradient-to-b ${getSkyGradient()} rounded-xl shadow-2xl p-6 h-96 relative overflow-hidden transition-all duration-1000`}>
              
              {/* Sun/Moon */}
              <div className="absolute transition-all duration-500" style={{
                top: '10%',
                right: brightness > 50 ? '15%' : '20%'
              }}>
                {brightness > 50 ? (
                  <div className="relative">
                    <div className="w-16 h-16 bg-yellow-400 rounded-full shadow-2xl"></div>
                    <div className="absolute inset-0 w-16 h-16 bg-yellow-300 rounded-full animate-ping opacity-20"></div>
                  </div>
                ) : (
                  <div className="w-14 h-14 bg-gray-200 rounded-full shadow-lg"></div>
                )}
              </div>

              {/* Stars at night */}
              {brightness < 40 && (
                <div className="absolute inset-0">
                  {[...Array(15)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 bg-white rounded-full"
                      style={{
                        left: `${(i * 47) % 100}%`,
                        top: `${(i * 23) % 50}%`,
                        opacity: 0.5 + Math.random() * 0.5
                      }}
                    ></div>
                  ))}
                </div>
              )}

              {/* Location-specific Scene */}
              {selectedLocation === 'street' && (
                <>
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gray-700"></div>
                  <div className="absolute bottom-24 left-0 right-0 flex justify-around px-8">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex flex-col items-center">
                        {lightsOn && (
                          <div className="absolute top-0 w-16 h-16 bg-yellow-300 rounded-full blur-xl opacity-60"></div>
                        )}
                        <div className={`w-6 h-5 rounded-t-lg ${lightsOn ? 'bg-yellow-400' : 'bg-gray-600'}`}></div>
                        <div className="w-2 h-24 bg-gray-600"></div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {selectedLocation === 'park' && (
                <>
                  <div className="absolute bottom-0 left-0 right-0 h-16 bg-green-700"></div>
                  <div className="absolute bottom-16 left-1/4 w-12 h-20 bg-green-800 rounded-t-full"></div>
                  <div className="absolute bottom-16 right-1/4 w-12 h-20 bg-green-800 rounded-t-full"></div>
                  <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2">
                    {lightsOn && (
                      <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-yellow-300 rounded-full blur-xl opacity-60"></div>
                    )}
                    <div className={`w-6 h-5 rounded-t-lg ${lightsOn ? 'bg-yellow-400' : 'bg-gray-600'}`}></div>
                    <div className="w-2 h-20 bg-gray-600 mx-auto"></div>
                  </div>
                </>
              )}

              {selectedLocation === 'school' && (
                <>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-48 h-32 bg-red-800">
                    <div className="absolute top-2 left-2 right-2 grid grid-cols-4 gap-2">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className={`h-8 ${lightsOn ? 'bg-yellow-300' : 'bg-blue-900'}`}></div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-8 h-12 bg-red-900"></div>
                  <div className="absolute bottom-44 left-1/2 transform -translate-x-1/2 w-20 h-2 bg-red-900"></div>
                </>
              )}

              {selectedLocation === 'home' && (
                <>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-24 bg-yellow-700">
                    <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-16 bg-blue-900"></div>
                  </div>
                  <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 w-40 h-2 bg-red-800"></div>
                  <div className="absolute bottom-26 left-1/2 transform -translate-x-1/2">
                    {lightsOn && (
                      <div className="absolute w-20 h-20 bg-yellow-300 rounded-full blur-xl opacity-70"></div>
                    )}
                  </div>
                  {lightsOn && (
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-8 h-8 bg-yellow-400 rounded-full"></div>
                  )}
                </>
              )}

              {/* Character Reaction */}
              <div className="absolute top-6 left-6 bg-white/95 rounded-xl p-4 shadow-lg backdrop-blur max-w-xs">
                <div className="text-4xl mb-2 text-center">{reaction.emoji}</div>
                <div className="text-sm font-bold text-gray-700 text-center">{reaction.text}</div>
              </div>

              {/* Challenge Info */}
              <div className="absolute bottom-6 left-6 right-6 bg-black/70 text-white rounded-xl p-3 backdrop-blur">
                <div className="text-xs font-bold mb-1">
                  {locations[selectedLocation].icon} {locations[selectedLocation].name}
                </div>
                <div className="text-xs">
                  Challenge: {locations[selectedLocation].challenge}
                </div>
                {challengeCompleted[selectedLocation] && (
                  <div className="text-green-400 text-xs mt-1 flex items-center gap-1">
                    <Zap className="w-3 h-3" /> +25 Points Earned!
                  </div>
                )}
              </div>
            </div>

            {/* Manual Day/Night Control */}
            <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-blue-300">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-bold text-gray-800">🎮 Control Time of Day</h3>
                <span className="text-sm text-gray-600">{brightness}% Brightness</span>
              </div>
              <div className="flex items-center gap-3">
                <Moon className="w-5 h-5 text-indigo-600" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={manualBrightness}
                  onChange={(e) => setManualBrightness(parseInt(e.target.value))}
                  className="flex-1 h-2 bg-gradient-to-r from-indigo-900 via-orange-400 to-yellow-400 rounded-lg appearance-none cursor-pointer"
                  style={{
                    accentColor: '#f59e0b'
                  }}
                />
                <Sun className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-xs text-center text-gray-600 mt-2">
                Drag to change brightness and test your threshold!
              </p>
            </div>
          </div>

          {/* Right Side - Veera Avatar */}
          <div className="col-span-3 space-y-4">
            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl shadow-lg p-4 border-2 border-yellow-200">
              <div className="flex flex-col items-center">
                <img 
                  src="lion.gif" 
                  alt="Veera Avatar" 
                  className="w-48 h-48 object-contain"
                />
                <div className="mt-3 text-center">
                  <p className="text-sm font-medium text-gray-700">
                    {isAudioPlaying ? (
                      <span className="flex items-center justify-center gap-2 text-amber-600">
                        <Volume2 className="w-4 h-4 animate-pulse" />
                        Speaking...
                      </span>
                    ) : (
                      "Hi! I'm Veera 🦁"
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Game Instructions */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-4 border-2 border-blue-300">
              <h3 className="text-md font-bold text-gray-800 mb-2">🎯 How to Play:</h3>
              <ol className="text-xs text-gray-700 space-y-2">
                <li className="flex gap-2">
                  <span className="font-bold">1.</span>
                  <span>Choose a location challenge</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">2.</span>
                  <span>Set the threshold value</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">3.</span>
                  <span>Use the slider to test day/night</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">4.</span>
                  <span>Watch character reactions!</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-bold">5.</span>
                  <span>Complete all 4 locations!</span>
                </li>
              </ol>
            </div>

            {/* Learning Points */}
            <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-amber-200">
              <h3 className="text-md font-bold text-gray-800 mb-2">Learning Points:</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>LDR measures light intensity</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Threshold controls automation</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Different places need different settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600 font-bold">•</span>
                  <span>Balance safety and energy savings</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Next Experiment Button */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="max-w-7xl mx-auto flex justify-center">
          <button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-12 rounded-full shadow-lg transition-all transform hover:scale-105">
            Next Experiment →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutomaticLightControlExperiment;