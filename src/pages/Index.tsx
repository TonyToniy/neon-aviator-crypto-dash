import React, { useState, useEffect } from 'react';
import { Plane, Zap, Coins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import AviatorGame from '@/components/AviatorGame';
import BettingPanel from '@/components/BettingPanel';
import GameHistory from '@/components/GameHistory';
import PlayerStats from '@/components/PlayerStats';

interface GameRecord {
  id: number;
  multiplier: number;
  crashed: boolean;
  timestamp: Date;
  betAmount?: number;
  winAmount?: number;
}

const Index = () => {
  const [balance, setBalance] = useState(1000);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBet, setCurrentBet] = useState(0);
  const [gameHistory, setGameHistory] = useState<GameRecord[]>([]);
  const [totalWagered, setTotalWagered] = useState(0);
  const [totalWon, setTotalWon] = useState(0);
  const { toast } = useToast();

  const handlePlaceBet = (amount: number) => {
    if (amount <= balance) {
      setBalance(prev => prev - amount);
      setCurrentBet(amount);
      setIsPlaying(true);
      setTotalWagered(prev => prev + amount);
      
      toast({
        title: "Bet Placed! 🚀",
        description: `$${amount} bet placed. Good luck!`,
      });
    }
  };

  const handleCashOut = () => {
    if (isPlaying && currentBet > 0) {
      const winAmount = currentBet * currentMultiplier;
      setBalance(prev => prev + winAmount);
      setTotalWon(prev => prev + winAmount);
      
      const gameRecord: GameRecord = {
        id: Date.now(),
        multiplier: currentMultiplier,
        crashed: false,
        timestamp: new Date(),
        betAmount: currentBet,
        winAmount: winAmount
      };
      
      setGameHistory(prev => [gameRecord, ...prev]);
      setIsPlaying(false);
      setCurrentBet(0);
      
      toast({
        title: "Cash Out Successful! 💰",
        description: `Won $${winAmount.toFixed(2)} at ${currentMultiplier.toFixed(2)}x`,
      });
    }
  };

  const handleGameEnd = (crashed: boolean, finalMultiplier: number) => {
    if (crashed && isPlaying) {
      const gameRecord: GameRecord = {
        id: Date.now(),
        multiplier: finalMultiplier,
        crashed: true,
        timestamp: new Date(),
        betAmount: currentBet,
        winAmount: 0
      };
      
      setGameHistory(prev => [gameRecord, ...prev]);
      
      toast({
        title: "Plane Crashed! 💥",
        description: `Lost $${currentBet.toFixed(2)} at ${finalMultiplier.toFixed(2)}x`,
        variant: "destructive",
      });
    }
    
    setIsPlaying(false);
    setCurrentBet(0);
  };

  const handleGameStart = () => {
    setCurrentMultiplier(1.0);
  };

  const handleDeposit = () => {
    setBalance(prev => prev + 500);
    toast({
      title: "Deposit Successful! 💳",
      description: "Added $500 to your balance",
    });
  };

  const handleWithdraw = () => {
    if (balance >= 100) {
      setBalance(prev => prev - 100);
      toast({
        title: "Withdrawal Successful! 🏦",
        description: "Withdrew $100 from your balance",
      });
    }
  };

  const potentialWin = currentBet * currentMultiplier;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col">
      {/* Animated background */}
      <div className="fixed inset-0 bg-cyber-grid bg-grid opacity-5"></div>
      
      {/* Header - Compact */}
      <header className="relative z-10 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-lg border-b border-neon-blue/20">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  AVIATOR
                </h1>
                <p className="text-gray-400 text-xs">Crypto Crash Game</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-neon-green">
                <Coins className="w-4 h-4" />
                <span className="font-bold text-lg">${balance.toFixed(2)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-neon-purple">
                <Zap className="w-4 h-4" />
                <span className="font-semibold text-sm">
                  {gameHistory.length > 0 
                    ? `${((gameHistory.filter(g => !g.crashed).length / gameHistory.length) * 100).toFixed(0)}% Win Rate`
                    : 'New Player'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Optimized for viewport */}
      <main className="relative z-10 container mx-auto px-4 py-4 flex-1 overflow-hidden">
        <div className="grid lg:grid-cols-4 gap-4 h-full">
          {/* Game Area - Takes up 2 columns with fixed height */}
          <div className="lg:col-span-2 flex flex-col gap-4 h-full">
            <div className="flex-1 min-h-0">
              <AviatorGame
                onMultiplierChange={setCurrentMultiplier}
                onGameEnd={handleGameEnd}
                isPlaying={isPlaying}
                onGameStart={handleGameStart}
              />
            </div>
            
            <div className="flex-shrink-0">
              <BettingPanel
                balance={balance}
                onPlaceBet={handlePlaceBet}
                onCashOut={handleCashOut}
                isPlaying={isPlaying}
                currentMultiplier={currentMultiplier}
                potentialWin={potentialWin}
              />
            </div>
          </div>

          {/* Side Panels - Compact */}
          <div className="flex flex-col gap-4 h-full min-h-0">
            <div className="flex-shrink-0">
              <PlayerStats
                balance={balance}
                totalWagered={totalWagered}
                totalWon={totalWon}
                gamesPlayed={gameHistory.length}
                onDeposit={handleDeposit}
                onWithdraw={handleWithdraw}
              />
            </div>
          </div>

          <div className="flex flex-col gap-4 h-full min-h-0">
            <div className="flex-1 min-h-0">
              <GameHistory history={gameHistory} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
