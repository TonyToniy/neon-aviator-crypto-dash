
import React, { useState, useEffect, useRef } from 'react';
import { Plane, TrendingUp, TrendingDown, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AviatorGameProps {
  onMultiplierChange: (multiplier: number) => void;
  onGameEnd: (crashed: boolean, finalMultiplier: number) => void;
  isPlaying: boolean;
  onGameStart: () => void;
  isDemoMode?: boolean;
  onDemoStart?: () => void;
  onCashOut: () => void;
}

const AviatorGame: React.FC<AviatorGameProps> = ({
  onMultiplierChange,
  onGameEnd,
  isPlaying,
  onGameStart,
  isDemoMode = false,
  onDemoStart,
  onCashOut
}) => {
  const [multiplier, setMultiplier] = useState(1.0);
  const [gameState, setGameState] = useState<'waiting' | 'flying' | 'crashed'>('waiting');
  const [crashPoint, setCrashPoint] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameRef = useRef<HTMLDivElement>(null);

  // Generate random crash point between 1.0 and 10.0
  const generateCrashPoint = () => {
    const random = Math.random();
    if (random < 0.5) return 1 + Math.random() * 2; // 50% chance of 1.0-3.0
    if (random < 0.8) return 3 + Math.random() * 4; // 30% chance of 3.0-7.0
    return 7 + Math.random() * 8; // 20% chance of 7.0-15.0
  };

  const startGame = () => {
    const newCrashPoint = generateCrashPoint();
    setCrashPoint(newCrashPoint);
    setMultiplier(1.0);
    setGameState('flying');
    
    if (isDemoMode && onDemoStart) {
      onDemoStart();
    } else {
      onGameStart();
    }

    console.log(`${isDemoMode ? 'Demo' : 'Real'} game started! Crash point: ${newCrashPoint.toFixed(2)}x`);

    intervalRef.current = setInterval(() => {
      setMultiplier(prev => {
        const newMultiplier = prev + 0.01;
        onMultiplierChange(newMultiplier);
        
        if (newMultiplier >= newCrashPoint) {
          setGameState('crashed');
          onGameEnd(true, newMultiplier);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
          }
          
          // Reset after crash animation
          setTimeout(() => {
            setGameState('waiting');
            setMultiplier(1.0);
          }, 3000);
        }
        
        return newMultiplier;
      });
    }, 50);
  };

  const handleCashOut = () => {
    console.log(`${isDemoMode ? 'Demo' : 'Real'} cash out triggered at ${multiplier.toFixed(2)}x`);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Call the parent's cash out handler
    onCashOut();
    
    setTimeout(() => {
      setGameState('waiting');
      setMultiplier(1.0);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const getMultiplierColor = () => {
    if (multiplier < 2) return 'text-neon-green';
    if (multiplier < 5) return 'text-yellow-400';
    if (multiplier < 10) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div 
      ref={gameRef}
      className="relative h-64 w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-xl overflow-hidden border border-neon-blue/30"
    >
      {/* Demo mode indicator */}
      {isDemoMode && (
        <div className="absolute top-2 right-2 z-20 bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-2 py-1 rounded-full text-xs font-bold">
          DEMO
        </div>
      )}

      {/* Animated background grid */}
      <div className="absolute inset-0 bg-cyber-grid bg-grid opacity-20"></div>
      
      {/* Flight path curve */}
      {gameState === 'flying' && (
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d="M5,85 Q30,60 55,40 Q75,25 95,15"
            stroke="rgba(0, 245, 255, 0.6)"
            strokeWidth="0.5"
            fill="none"
            className="animate-pulse"
          />
        </svg>
      )}
      
      {/* Multiplier display */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10">
        <div className={`text-2xl font-bold ${getMultiplierColor()} animate-number-glow`}>
          {multiplier.toFixed(2)}x
        </div>
      </div>

      {/* Flying plane positioned in the middle */}
      {gameState === 'flying' && (
        <div 
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-neon-blue animate-bounce"
        >
          <Plane size={24} className="rotate-12 drop-shadow-lg" />
          <div className="absolute -top-1 -right-1 w-1 h-1 bg-neon-green rounded-full animate-ping"></div>
        </div>
      )}

      {/* Crash effect */}
      {gameState === 'crashed' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center animate-pulse">
            <TrendingDown size={32} className="text-red-500 mx-auto mb-2" />
            <div className="text-lg font-bold text-red-500">
              {isDemoMode ? 'DEMO CRASHED!' : 'CRASHED!'}
            </div>
            <div className="text-sm text-red-400 mt-1">
              at {multiplier.toFixed(2)}x
            </div>
          </div>
        </div>
      )}

      {/* Game controls */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        {gameState === 'waiting' && (
          <Button
            onClick={startGame}
            className={`${
              isDemoMode 
                ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-yellow-500 hover:to-orange-500' 
                : 'bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-purple hover:to-neon-pink'
            } text-white font-bold py-1 px-3 rounded-lg neon-glow transition-all duration-300 hover:scale-105 text-xs`}
          >
            {isDemoMode ? (
              <>
                <Play className="w-3 h-3 mr-1" />
                DEMO FLIGHT
              </>
            ) : (
              'START FLIGHT'
            )}
          </Button>
        )}
        
        {gameState === 'flying' && (isPlaying || isDemoMode) && (
          <Button
            onClick={handleCashOut}
            className="bg-gradient-to-r from-neon-green to-emerald-500 hover:from-emerald-500 hover:to-neon-green text-white font-bold py-1 px-3 rounded-lg neon-glow transition-all duration-300 hover:scale-105 text-xs"
          >
            {isDemoMode ? `DEMO CASH OUT ${multiplier.toFixed(2)}x` : `CASH OUT ${multiplier.toFixed(2)}x`}
          </Button>
        )}
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-neon-blue rounded-full opacity-40 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default AviatorGame;
