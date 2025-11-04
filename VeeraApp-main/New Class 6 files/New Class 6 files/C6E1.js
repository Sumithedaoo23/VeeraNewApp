import React, { useState, useEffect, useRef } from 'react';
import { Volume2, Home, List, ChevronLeft, Trophy, Star } from 'lucide-react';

const VeeraKitObjectDetection = () => {
  const [sensorValue, setSensorValue] = useState(50);
  const [threshold, setThreshold] = useState(20);
  const [manualThreshold, setManualThreshold] = useState('20');
  const [isVoiceoverPlaying, setIsVoiceoverPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [gameMode, setGameMode] = useState('practice'); // practice, challenge
  const [challengeLevel, setChallengeLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isGameActive, setIsGameActive] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [perfectParks, setPerfectParks] = useState(0);
  
  const audioRef = useRef(null);
  const buzzerRef = useRef(null);
  const successRef = useRef(null);

  // Play voiceover when page loads
  useEffect(() => {
    const audio = new Audio('class6-exp1-objectdetection-voiceover.mp3');
    audioRef.current = audio;
    
    audio.play().then(() => {
      setIsVoiceoverPlaying(true);
    }).catch(err => {
      console.log('Voiceover autoplay prevented:', err);
    });

    audio.onended = () => {
      setIsVoiceoverPlaying(false);
    };

    // Initialize buzzer and success sounds
    buzzerRef.current = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIGWm98OScTgwOUKzn77dlGwU7k9rzxnklBSh+zPLaizsKFFyw6+2oVRILSKXh8bllHgQufM/z1YU2Bhxuv/LkkUYLEVm28OihUBELSKzn8LVgGgU7ldz1xXYnBSh+zPLaizsKFFyw6+2oVRILSKXh8bllHgQufM/z1YU2Bhxuv/LkkUYLEVm28OihUBELSKzn8LVgGgU7ldz1xXYnBSh+zPLaizsKFFyw6+2oVRILSKXh8bllHgQufM/z1YU2Bhxuv/LkkUYLEVm28OihUBELSKzn8LVgGgU7ldz1xXYnBSh+zPLaizsKFFyw6+2oVRILSKXh8bllHgQufM/z1YU2Bhxuv/LkkUYLEVm28OihUBELSKzn8LVgGgU7ldz1xXYnBSh+zPLaizsKFFyw6+2oVRILSKXh8bllHgQufM/z1YU2Bhxuv/LkkUYLEVm28OihUBELSKzn8LVgGgU7ldz1xXYnBSh+zPLaizsKFFyw6+2oVRILSKXh8bllHgQufM/z1YU2Bhxuv/Lkk=');
    successRef.current = new Audio('data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=');

    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
    };
  }, []);

  // Challenge mode timer
  useEffect(() => {
    if (isGameActive && gameMode === 'challenge' && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (isGameActive && gameMode === 'challenge' && timeLeft === 0) {
      endChallenge();
    }
  }, [timeLeft, isGameActive, gameMode]);

  // Simulate serial communication or manual control
  useEffect(() => {
    if (gameMode === 'practice') {
      const interval = setInterval(() => {
        // In practice mode, you can still receive sensor data from kit
        // This will be replaced with actual COM4 communication
      }, 100);
      return () => clearInterval(interval);
    }
  }, [gameMode]);

  const handleSetThreshold = () => {
    const value = parseInt(manualThreshold);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      setThreshold(value);
      console.log('Sending threshold to kit:', value);
    }
  };

  const handleResetThreshold = () => {
    setThreshold(20);
    setManualThreshold('20');
    console.log('Resetting threshold to default: 20');
  };

  const handleCarPositionChange = (e) => {
    const distance = parseInt(e.target.value);
    setSensorValue(distance);
    
    // Send distance to kit via serial communication
    console.log('Sending distance to kit:', distance);
    
    // Check if car is in danger zone
    if (distance < threshold) {
      // Play buzzer sound
      if (buzzerRef.current) {
        buzzerRef.current.currentTime = 0;
        buzzerRef.current.play().catch(e => console.log(e));
      }
    }

    // Check for perfect parking in challenge mode
    if (isGameActive && gameMode === 'challenge') {
      const perfectRange = threshold + 5; // Perfect park is 5cm above threshold
      if (distance >= threshold && distance <= perfectRange) {
        setShowSuccess(true);
        if (successRef.current) {
          successRef.current.play().catch(e => console.log(e));
        }
        setScore(score + (challengeLevel * 10));
        setPerfectParks(perfectParks + 1);
        setTimeout(() => setShowSuccess(false), 2000);
      }
    }
  };

  const startChallenge = () => {
    setIsGameActive(true);
    setScore(0);
    setAttempts(0);
    setPerfectParks(0);
    setTimeLeft(30);
    setSensorValue(100);
  };

  const endChallenge = () => {
    setIsGameActive(false);
    // Show final score
  };

  const nextLevel = () => {
    if (challengeLevel < 3) {
      setChallengeLevel(challengeLevel + 1);
      setThreshold(threshold - 5); // Make it harder
      startChallenge();
    }
  };

  const carPosition = Math.max(0, Math.min(100, sensorValue));
  const isWarning = sensorValue < threshold;
  const isSafeZone = sensorValue >= threshold && sensorValue <= (threshold + 10);
  const isPerfectPark = sensorValue >= threshold && sensorValue <= (threshold + 5);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold">Class 6 - Object Detection: Parking Challenge</h1>
            {gameMode === 'challenge' && isGameActive && (
              <div className="flex items-center gap-4 bg-white/20 px-4 py-2 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="text-yellow-300" size={24} />
                  <span className="font-bold text-xl">{score}</span>
                </div>
                <div className="text-lg">
                  ⏱️ {timeLeft}s
                </div>
                <div className="flex items-center gap-1">
                  <Star className="text-yellow-300" size={20} />
                  <span className="font-bold">{perfectParks}</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => console.log('Go to previous page')}
              className="bg-white text-blue-600 rounded-full p-3 hover:bg-blue-50 transition-all shadow-md"
              title="Previous Page"
            >
              <ChevronLeft size={24} />
            </button>
            <button 
              onClick={() => console.log('Go to home')}
              className="bg-white text-blue-600 rounded-full p-3 hover:bg-blue-50 transition-all shadow-md"
              title="Home"
            >
              <Home size={24} />
            </button>
            <button 
              onClick={() => console.log('Go to levels')}
              className="bg-white text-blue-600 rounded-full p-3 hover:bg-blue-50 transition-all shadow-md"
              title="Levels"
            >
              <List size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex gap-6 p-6">
        {/* Left Section - Kit Image */}
        <div className="w-1/4 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Veera Kit</h3>
          <div className="bg-blue-100 rounded-lg p-4 border-4 border-blue-300">
            <div className="text-center">
              <div className="bg-blue-600 text-white rounded-lg p-6 mb-4">
                <p className="text-sm font-semibold">VEERA KIT</p>
                <p className="text-xs mt-2">Ultrasonic Sensor</p>
              </div>
              <div className="relative">
                <div className={`w-full h-24 rounded-lg border-4 ${isWarning ? 'border-red-500 bg-red-100' : isSafeZone ? 'border-green-500 bg-green-100' : 'border-yellow-500 bg-yellow-100'} flex items-center justify-center transition-all`}>
                  <div className={`w-16 h-16 rounded-full ${isWarning ? 'bg-red-500 animate-pulse' : isSafeZone ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                </div>
                <p className="mt-2 text-sm font-semibold text-gray-700">Ultrasonic Sensor Active</p>
              </div>
            </div>
          </div>

          {/* Game Mode Selection */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => {setGameMode('practice'); setIsGameActive(false);}}
              className={`w-full py-3 px-4 rounded-lg font-bold transition-all ${
                gameMode === 'practice' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🎮 Practice Mode
            </button>
            <button
              onClick={() => setGameMode('challenge')}
              className={`w-full py-3 px-4 rounded-lg font-bold transition-all ${
                gameMode === 'challenge' 
                  ? 'bg-purple-500 text-white shadow-lg' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              🏆 Challenge Mode
            </button>
            {gameMode === 'challenge' && !isGameActive && (
              <button
                onClick={startChallenge}
                className="w-full py-3 px-4 rounded-lg font-bold bg-green-500 text-white hover:bg-green-600 transition-all shadow-lg animate-pulse"
              >
                ▶️ Start Challenge
              </button>
            )}
          </div>

          {/* Challenge Info */}
          {gameMode === 'challenge' && (
            <div className="mt-4 bg-purple-50 rounded-lg p-4 border-2 border-purple-300">
              <h4 className="font-bold text-purple-900 mb-2">Level {challengeLevel}</h4>
              <p className="text-sm text-gray-700">
                Park as many times as possible in the safe zone! Perfect parks earn bonus points!
              </p>
            </div>
          )}
        </div>

        {/* Center Section - Experiment Animation */}
        <div className="flex-1 bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold text-gray-800">Parking Sensor Simulation</h3>
            {showSuccess && (
              <div className="bg-green-500 text-white px-6 py-2 rounded-full font-bold animate-bounce">
                🎉 PERFECT PARK! +{challengeLevel * 10} points!
              </div>
            )}
          </div>
          
          {/* Parking Scene */}
          <div className="relative bg-gradient-to-b from-sky-300 to-gray-300 rounded-lg h-96 overflow-hidden border-4 border-gray-400">
            {/* Background elements */}
            <div className="absolute top-4 left-4 text-4xl">☁️</div>
            <div className="absolute top-8 right-20 text-4xl">☁️</div>
            <div className="absolute top-4 right-4 text-3xl">☀️</div>
            
            {/* Road */}
            <div className="absolute bottom-0 w-full h-32 bg-gray-600">
              <div className="flex justify-around h-full items-center">
                <div className="w-16 h-1 bg-yellow-400"></div>
                <div className="w-16 h-1 bg-yellow-400"></div>
                <div className="w-16 h-1 bg-yellow-400"></div>
                <div className="w-16 h-1 bg-yellow-400"></div>
              </div>
            </div>

            {/* Parking Zone Indicator */}
            <div 
              className="absolute bottom-32 bg-green-500/30 h-32 border-4 border-dashed border-green-600 transition-all"
              style={{ 
                right: `${threshold}%`,
                width: '10%'
              }}
            >
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-green-600 text-white px-2 py-1 rounded text-xs font-bold whitespace-nowrap">
                SAFE ZONE
              </div>
            </div>

            {/* Obstacle (Wall/Barrier) */}
            <div className="absolute bottom-32 right-8 w-24 h-32 bg-gradient-to-b from-red-700 to-red-900 rounded-t-lg border-4 border-red-950">
              <div className="absolute top-2 left-2 right-2 h-8 bg-red-600 rounded flex items-center justify-center">
                <span className="text-white font-bold text-xs">STOP</span>
              </div>
              <div className="absolute bottom-2 left-2 right-2 space-y-1">
                <div className="w-full h-2 bg-yellow-400"></div>
                <div className="w-full h-2 bg-yellow-400"></div>
              </div>
            </div>

            {/* Car */}
            <div 
              className="absolute bottom-32 transition-all duration-300"
              style={{ right: `${carPosition}%` }}
            >
              <div className="relative">
                {/* Car Body */}
                <div className={`w-32 h-20 rounded-lg border-4 transition-all ${
                  isPerfectPark ? 'bg-green-400 border-green-600 shadow-lg shadow-green-500' :
                  isWarning ? 'bg-red-400 border-red-600 animate-pulse' : 
                  isSafeZone ? 'bg-green-400 border-green-600' : 
                  'bg-blue-500 border-blue-700'
                }`}>
                  <div className={`absolute top-0 left-8 w-16 h-10 rounded-t-lg transition-all ${
                    isPerfectPark ? 'bg-green-300' :
                    isWarning ? 'bg-red-300' : 
                    isSafeZone ? 'bg-green-300' : 
                    'bg-blue-400'
                  }`}></div>
                  {/* Windows */}
                  <div className="absolute top-1 left-10 w-5 h-8 bg-sky-200 rounded"></div>
                  <div className="absolute top-1 right-10 w-5 h-8 bg-sky-200 rounded"></div>
                  {/* Headlights */}
                  <div className={`absolute top-8 right-1 w-3 h-3 rounded-full ${isWarning ? 'bg-red-500' : 'bg-yellow-300'}`}></div>
                </div>
                {/* Wheels */}
                <div className="absolute -bottom-2 left-2 w-8 h-8 bg-black rounded-full border-2 border-gray-400">
                  <div className="absolute inset-1 bg-gray-600 rounded-full"></div>
                </div>
                <div className="absolute -bottom-2 right-2 w-8 h-8 bg-black rounded-full border-2 border-gray-400">
                  <div className="absolute inset-1 bg-gray-600 rounded-full"></div>
                </div>
                
                {/* Sensor Waves */}
                <div className="absolute right-0 top-8">
                  <div className={`w-8 h-1 ${isWarning ? 'bg-red-500' : 'bg-blue-400'} animate-pulse`}></div>
                  <div className={`w-12 h-1 ${isWarning ? 'bg-red-500' : 'bg-blue-400'} opacity-70 mt-1 animate-pulse`}></div>
                  <div className={`w-16 h-1 ${isWarning ? 'bg-red-500' : 'bg-blue-400'} opacity-40 mt-1 animate-pulse`}></div>
                </div>

                {/* Perfect Park Stars */}
                {isPerfectPark && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2">
                    <div className="flex gap-1 animate-bounce">
                      <Star className="text-yellow-400 fill-yellow-400" size={20} />
                      <Star className="text-yellow-400 fill-yellow-400" size={24} />
                      <Star className="text-yellow-400 fill-yellow-400" size={20} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Warning Display */}
            <div className="absolute top-4 left-4 right-4">
              <div className={`${
                isPerfectPark ? 'bg-yellow-400 text-gray-900' :
                isWarning ? 'bg-red-500' : 
                isSafeZone ? 'bg-green-500' : 
                'bg-blue-500'
              } text-white px-6 py-3 rounded-lg text-center font-bold text-lg shadow-lg transition-all`}>
                {isPerfectPark ? '⭐ PERFECT PARKING! ⭐' :
                 isWarning ? '⚠️ WARNING: TOO CLOSE! DANGER!' : 
                 isSafeZone ? '✓ SAFE DISTANCE - GOOD JOB!' : 
                 '🚗 Keep Moving...'}
              </div>
            </div>

            {/* Distance Indicator */}
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-white px-4 py-2 rounded-lg shadow-lg border-2 border-gray-300">
              <p className="text-sm font-semibold text-gray-700">Distance: <span className="text-2xl text-blue-600">{sensorValue}</span> cm</p>
            </div>
          </div>

          {/* Car Control Slider */}
          <div className="mt-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border-2 border-blue-300">
            <h4 className="font-bold text-gray-800 mb-4 text-center text-lg">🎮 Control Car Distance</h4>
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700 w-20">Far (100cm)</span>
              <input
                type="range"
                min="0"
                max="100"
                value={sensorValue}
                onChange={handleCarPositionChange}
                className="flex-1 h-3 bg-gray-300 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, 
                    red 0%, 
                    red ${threshold}%, 
                    green ${threshold}%, 
                    green ${threshold + 10}%, 
                    yellow ${threshold + 10}%, 
                    yellow 100%)`
                }}
              />
              <span className="text-sm font-semibold text-gray-700 w-20 text-right">Near (0cm)</span>
            </div>
            <p className="text-center mt-2 text-sm text-gray-600">
              Drag the slider to move the car closer or farther from the obstacle
            </p>
          </div>

          {/* Control Panel */}
          <div className="mt-4 grid grid-cols-2 gap-4">
            {/* Sensor Reading Display */}
            <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-300">
              <h4 className="font-bold text-gray-800 mb-2">📡 Sensor Reading</h4>
              <div className={`rounded-lg p-4 border-2 transition-all ${
                isWarning ? 'bg-red-100 border-red-400' : 
                isSafeZone ? 'bg-green-100 border-green-400' : 
                'bg-white border-blue-400'
              }`}>
                <p className={`text-3xl font-bold text-center ${
                  isWarning ? 'text-red-600' : 
                  isSafeZone ? 'text-green-600' : 
                  'text-blue-600'
                }`}>
                  {sensorValue} cm
                </p>
              </div>
            </div>

            {/* Threshold Control */}
            <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-300">
              <h4 className="font-bold text-gray-800 mb-2">⚙️ Set Threshold</h4>
              <div className="flex gap-2 mb-2">
                <input
                  type="number"
                  value={manualThreshold}
                  onChange={(e) => setManualThreshold(e.target.value)}
                  className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-orange-500 outline-none"
                  placeholder="Enter threshold"
                  min="0"
                  max="100"
                />
                <span className="flex items-center text-gray-600 font-semibold">cm</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSetThreshold}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Set
                </button>
                <button
                  onClick={handleResetThreshold}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-all shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Reset
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center font-semibold">
                Current Threshold: <span className="text-orange-600">{threshold} cm</span>
              </p>
            </div>
          </div>
        </div>

        {/* Right Section - Veera Avatar */}
        <div className="w-1/5 bg-white rounded-xl shadow-lg p-6 flex flex-col items-center">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Veera Guide</h3>
          <div className="relative">
            <img 
              src="lion.gif" 
              alt="Veera Avatar" 
              className="w-48 h-48 object-contain"
            />
            {isVoiceoverPlaying && (
              <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-2 animate-pulse">
                <Volume2 className="text-white" size={20} />
              </div>
            )}
          </div>
          <div className="mt-4 bg-blue-50 rounded-lg p-4 border-2 border-blue-300">
            <p className="text-sm text-gray-700 text-center leading-relaxed">
              {gameMode === 'practice' 
                ? "🎮 Practice moving the car! Try to park it in the safe zone without hitting the obstacle."
                : "🏆 Challenge yourself! Park as many times as possible in 30 seconds. Perfect parks give bonus points!"}
            </p>
          </div>

          {/* Tips Section */}
          <div className="mt-4 bg-yellow-50 rounded-lg p-4 border-2 border-yellow-300 w-full">
            <h4 className="font-bold text-gray-800 mb-2 text-center">💡 Tips</h4>
            <ul className="text-xs text-gray-700 space-y-1">
              <li>• Red = Danger Zone</li>
              <li>• Green = Safe Zone</li>
              <li>• Stars = Perfect Park!</li>
              <li>• Listen for buzzer in danger</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-4 px-6 shadow-lg">
        <div className="flex justify-center">
          <button
            onClick={() => console.log('Next experiment')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition-all shadow-md transform hover:scale-105"
          >
            Next Experiment →
          </button>
        </div>
      </footer>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 3px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  );
};

export default VeeraKitObjectDetection;