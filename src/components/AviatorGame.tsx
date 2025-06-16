import React, { useState, useEffect, useRef } from 'react';
import { Plane, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AviatorGameProps {
  onMultiplierChange: (multiplier: number) => void;
  onGameEnd: (crashed: boolean, finalMultiplier: number) => void;
  isPlaying: boolean;
  onGameStart: () => void;
}

const AviatorGame: React.FC<AviatorGameProps> = ({
  onMultiplierChange,
  onGameEnd,
  isPlaying,
  onGameStart
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
    onGameStart();

    console.log(`Game started! Crash point: ${newCrashPoint.toFixed(2)}x`);

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

  const stopGame = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    onGameEnd(false, multiplier);
    setGameState('crashed');
    
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
      className="relative h-72 w-full bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-2xl overflow-hidden border border-neon-blue/30"
    >
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-cyber-grid bg-grid opacity-20"></div>
      
      {/* Multiplier display */}
      <div className="absolute top-3 left-1/2 transform -translate-x-1/2 z-10">
        <div className={`text-4xl font-bold ${getMultiplierColor()} animate-number-glow`}>
          {multiplier.toFixed(2)}x
        </div>
      </div>

      {/* Flying plane */}
      {gameState === 'flying' && (
        <div 
          className="absolute bottom-16 left-0 text-neon-blue"
          style={{
            animation: `plane-fly ${Math.max(2, crashPoint * 0.8)}s linear infinite`,
            '--duration': `${Math.max(2, crashPoint * 0.8)}s`
          } as React.CSSProperties}
        >
          <Plane size={32} className="rotate-12 drop-shadow-lg" />
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-neon-green rounded-full animate-ping"></div>
        </div>
      )}

      {/* Crash effect */}
      {gameState === 'crashed' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center animate-pulse">
            <TrendingDown size={60} className="text-red-500 mx-auto mb-3" />
            <div className="text-3xl font-bold text-red-500">CRASHED!</div>
            <div className="text-lg text-red-400 mt-1">
              at {multiplier.toFixed(2)}x
            </div>
          </div>
        </div>
      )}

      {/* Game controls */}
      <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
        {gameState === 'waiting' && (
          <Button
            onClick={startGame}
            className="bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white font-bold py-2 px-6 rounded-xl neon-glow transition-all duration-300 hover:scale-105"
          >
            START FLIGHT
          </Button>
        )}
        
        {gameState === 'flying' && isPlaying && (
          <Button
            onClick={stopGame}
            className="bg-gradient-to-r from-neon-green to-emerald-500 hover:from-emerald-500 hover:to-neon-green text-white font-bold py-2 px-6 rounded-xl neon-glow transition-all duration-300 hover:scale-105"
          >
            CASH OUT {multiplier.toFixed(2)}x
          </Button>
        )}
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-neon-blue rounded-full opacity-40 animate-float"
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
