import React, { useState, useEffect, useRef } from 'react';
import { Home, ChevronLeft, Grid3x3, Volume2 } from 'lucide-react';

const PollutionMonitoringExperiment = () => {
  const [sensorValue, setSensorValue] = useState(45);
  const [threshold, setThreshold] = useState(100);
  const [inputThreshold, setInputThreshold] = useState('100');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const audioRef = useRef(null);

  // Simulate sensor data (replace with actual serial communication)
  useEffect(() => {
    const interval = setInterval(() => {
      setSensorValue(prev => {
        const change = (Math.random() - 0.5) * 10;
        return Math.max(0, Math.min(500, prev + change));
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

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
    }
  };

  const handleResetThreshold = () => {
    setThreshold(100);
    setInputThreshold('100');
  };

  // Calculate pollution level (0 = clean, 100 = very polluted)
  const pollutionPercentage = Math.min(100, (sensorValue / 500) * 100);
  const isExceedingThreshold = sensorValue > threshold;

  // Sky color based on pollution
  const getSkyColor = () => {
    if (pollutionPercentage < 20) return 'from-blue-400 to-blue-200';
    if (pollutionPercentage < 40) return 'from-blue-300 to-gray-200';
    if (pollutionPercentage < 60) return 'from-gray-300 to-gray-200';
    if (pollutionPercentage < 80) return 'from-gray-400 to-gray-300';
    return 'from-gray-600 to-gray-400';
  };

  // Air quality status
  const getAirQualityStatus = () => {
    if (pollutionPercentage < 20) return { text: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (pollutionPercentage < 40) return { text: 'Good', color: 'text-lime-600', bg: 'bg-lime-100' };
    if (pollutionPercentage < 60) return { text: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    if (pollutionPercentage < 80) return { text: 'Poor', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { text: 'Hazardous', color: 'text-red-600', bg: 'bg-red-100' };
  };

  const airQuality = getAirQualityStatus();

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white flex flex-col">
      {/* Hidden audio element */}
      <audio ref={audioRef} onPlay={() => setIsAudioPlaying(true)} onEnded={() => setIsAudioPlaying(false)}>
        <source src="pollution_monitoring_voiceover.mp3" type="audio/mpeg" />
      </audio>

      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-4 px-6 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold">Class 6 - Experiment 3: Pollution Monitoring</h1>
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
          
          {/* Left Side - Sensor Display and Controls */}
          <div className="col-span-3 space-y-4">
            {/* Sensor Reading */}
            <div className="bg-white rounded-xl shadow-lg p-5 border-2 border-indigo-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                Sensor Reading
              </h3>
              <div className="text-center">
                <div className="text-5xl font-bold text-indigo-600 mb-2">
                  {Math.round(sensorValue)}
                </div>
                <div className="text-sm text-gray-600">PPM (Parts Per Million)</div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className={`text-center px-3 py-2 rounded-lg ${airQuality.bg}`}>
                  <span className={`font-bold ${airQuality.color}`}>{airQuality.text}</span>
                </div>
              </div>
            </div>

            {/* Threshold Settings */}
            <div className="bg-white rounded-xl shadow-lg p-5 border-2 border-indigo-200">
              <h3 className="text-lg font-bold text-gray-800 mb-3">Threshold Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">
                    Set Threshold (PPM)
                  </label>
                  <input
                    type="number"
                    value={inputThreshold}
                    onChange={(e) => setInputThreshold(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:outline-none"
                    placeholder="Enter threshold"
                  />
                </div>
                <button
                  onClick={handleSetThreshold}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-lg transition-colors"
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
                  Current: <span className="font-bold text-indigo-600">{threshold} PPM</span>
                </div>
              </div>
            </div>

            {/* Alert Status */}
            {isExceedingThreshold && (
              <div className="bg-red-100 border-2 border-red-400 rounded-xl p-4 animate-pulse">
                <p className="text-red-800 font-bold text-center">⚠️ Alert!</p>
                <p className="text-red-700 text-sm text-center mt-1">Pollution exceeds threshold</p>
              </div>
            )}
          </div>

          {/* Center - City Skyline Animation */}
          <div className="col-span-6">
            <div className={`bg-gradient-to-b ${getSkyColor()} rounded-xl shadow-2xl p-6 h-full relative overflow-hidden`}>
              {/* Sun/Clouds based on pollution */}
              <div className="absolute top-4 right-4">
                {pollutionPercentage < 40 ? (
                  <div className="w-20 h-20 bg-yellow-400 rounded-full shadow-lg"></div>
                ) : (
                  <div className="w-24 h-16 bg-gray-400 rounded-full opacity-60"></div>
                )}
              </div>

              {/* Pollution Particles */}
              {pollutionPercentage > 30 && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(Math.floor(pollutionPercentage / 10))].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-2 h-2 bg-gray-500 rounded-full opacity-30"
                      style={{
                        left: `${(i * 13) % 100}%`,
                        top: `${(i * 17) % 100}%`,
                        animation: `float ${3 + (i % 3)}s ease-in-out infinite`
                      }}
                    ></div>
                  ))}
                </div>
              )}

              {/* City Buildings */}
              <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center gap-2 px-6">
                {/* Building 1 */}
                <div 
                  className="bg-gradient-to-b from-blue-900 to-blue-800 rounded-t-lg shadow-xl transition-opacity duration-1000"
                  style={{ width: '80px', height: '180px', opacity: 1 - pollutionPercentage / 150 }}
                >
                  <div className="grid grid-cols-3 gap-1 p-2">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="bg-yellow-300 w-full h-4"></div>
                    ))}
                  </div>
                </div>

                {/* Building 2 - Tallest */}
                <div 
                  className="bg-gradient-to-b from-gray-800 to-gray-700 rounded-t-lg shadow-xl transition-opacity duration-1000"
                  style={{ width: '100px', height: '240px', opacity: 1 - pollutionPercentage / 150 }}
                >
                  <div className="grid grid-cols-4 gap-1 p-2">
                    {[...Array(16)].map((_, i) => (
                      <div key={i} className="bg-yellow-200 w-full h-4"></div>
                    ))}
                  </div>
                </div>

                {/* Building 3 */}
                <div 
                  className="bg-gradient-to-b from-indigo-900 to-indigo-800 rounded-t-lg shadow-xl transition-opacity duration-1000"
                  style={{ width: '70px', height: '150px', opacity: 1 - pollutionPercentage / 150 }}
                >
                  <div className="grid grid-cols-3 gap-1 p-2">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="bg-yellow-300 w-full h-4"></div>
                    ))}
                  </div>
                </div>

                {/* Building 4 */}
                <div 
                  className="bg-gradient-to-b from-purple-900 to-purple-800 rounded-t-lg shadow-xl transition-opacity duration-1000"
                  style={{ width: '90px', height: '200px', opacity: 1 - pollutionPercentage / 150 }}
                >
                  <div className="grid grid-cols-3 gap-1 p-2">
                    {[...Array(12)].map((_, i) => (
                      <div key={i} className="bg-yellow-200 w-full h-4"></div>
                    ))}
                  </div>
                </div>

                {/* Building 5 */}
                <div 
                  className="bg-gradient-to-b from-teal-900 to-teal-800 rounded-t-lg shadow-xl transition-opacity duration-1000"
                  style={{ width: '75px', height: '170px', opacity: 1 - pollutionPercentage / 150 }}
                >
                  <div className="grid grid-cols-3 gap-1 p-2">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="bg-yellow-300 w-full h-4"></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Air Quality Indicator */}
              <div className="absolute top-6 left-6 bg-white/90 rounded-xl p-4 shadow-lg">
                <div className="text-sm font-bold text-gray-700 mb-2">Air Quality Index</div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        pollutionPercentage < 40 ? 'bg-green-500' :
                        pollutionPercentage < 60 ? 'bg-yellow-500' :
                        pollutionPercentage < 80 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${pollutionPercentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold">{Math.round(pollutionPercentage)}%</span>
                </div>
              </div>
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
                      <span className="flex items-center justify-center gap-2 text-indigo-600">
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

            {/* Learning Points */}
            <div className="bg-white rounded-xl shadow-lg p-4 border-2 border-indigo-200">
              <h3 className="text-md font-bold text-gray-800 mb-2">Learning Points:</h3>
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>Monitor air quality in real-time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>Set pollution thresholds</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>Understand air quality levels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-indigo-600 font-bold">•</span>
                  <span>Environmental awareness</span>
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

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
        }
      `}</style>
    </div>
  );
};

export default PollutionMonitoringExperiment;