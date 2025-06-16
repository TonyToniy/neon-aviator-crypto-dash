
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bitcoin, DollarSign, Zap, Play, LogIn } from 'lucide-react';

interface BettingPanelProps {
  balance: number;
  onPlaceBet: (amount: number) => void;
  onCashOut: () => void;
  isPlaying: boolean;
  currentMultiplier: number;
  potentialWin: number;
  isDemoMode?: boolean;
  onToggleDemoMode?: () => void;
  demoBalance?: number;
}

const BettingPanel: React.FC<BettingPanelProps> = ({
  balance,
  onPlaceBet,
  onCashOut,
  isPlaying,
  currentMultiplier,
  potentialWin,
  isDemoMode = false,
  onToggleDemoMode,
  demoBalance = 1000
}) => {
  const [betAmount, setBetAmount] = useState(10);

  const quickBetAmounts = [10, 25, 50, 100];
  const displayBalance = isDemoMode ? demoBalance : balance;
  const maxBet = isDemoMode ? demoBalance : balance;

  const handleBetAmountChange = (amount: number) => {
    setBetAmount(Math.min(amount, maxBet));
  };

  const handlePlaceBet = () => {
    if (betAmount <= maxBet && betAmount > 0) {
      onPlaceBet(betAmount);
    }
  };

  return (
    <div className="glass-effect rounded-xl p-3 border border-neon-blue/30">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg">
            <Bitcoin className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">
              {isDemoMode ? 'Demo Mode' : 'Place Bet'}
            </h3>
            <p className="text-gray-400 text-xs">
              {isDemoMode ? `Demo Balance: $${displayBalance.toFixed(2)}` : `Balance: $${displayBalance.toFixed(2)}`}
            </p>
          </div>
        </div>

        {/* Demo Mode Toggle - only show if authenticated */}
        {onToggleDemoMode ? (
          <Button
            onClick={onToggleDemoMode}
            variant="outline"
            size="sm"
            className={`text-xs border-orange-500/30 ${
              isDemoMode 
                ? 'bg-orange-500/20 text-orange-400 border-orange-400' 
                : 'text-orange-400 hover:bg-orange-500/10'
            }`}
          >
            <Play className="w-3 h-3 mr-1" />
            {isDemoMode ? 'REAL MONEY' : 'DEMO'}
          </Button>
        ) : isDemoMode && (
          <Button
            onClick={() => window.location.href = '/auth'}
            variant="outline"
            size="sm"
            className="text-xs border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10"
          >
            <LogIn className="w-3 h-3 mr-1" />
            SIGN IN
          </Button>
        )}
      </div>

      {/* Current Game Stats */}
      {(isPlaying || isDemoMode) && (
        <div className={`${
          isDemoMode 
            ? 'bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/30' 
            : 'bg-gradient-to-r from-neon-green/10 to-emerald-500/10 border-neon-green/30'
        } rounded-lg p-2 mb-3 border`}>
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-300 text-xs">Multiplier:</span>
            <span className={`font-bold text-sm ${
              isDemoMode ? 'text-orange-400' : 'text-neon-green'
            }`}>
              {currentMultiplier.toFixed(2)}x
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-xs">
              {isDemoMode ? 'Demo Win:' : 'Win:'}
            </span>
            <span className={`font-bold text-sm ${
              isDemoMode ? 'text-orange-400' : 'text-neon-green'
            }`}>
              ${potentialWin.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Bet Amount Section */}
      {!isPlaying && (
        <>
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-300 mb-1">
              Bet Amount ($)
            </label>
            <div className="relative">
              <Input
                type="number"
                value={betAmount}
                onChange={(e) => handleBetAmountChange(Number(e.target.value))}
                className="bg-slate-800/50 border-neon-blue/30 text-white pr-12 text-sm font-semibold h-8"
                min="1"
                max={maxBet}
              />
              <DollarSign className="absolute right-2 top-1/2 transform -translate-y-1/2 text-neon-green w-4 h-4" />
            </div>
          </div>

          {/* Quick Bet Buttons */}
          <div className="grid grid-cols-4 gap-1 mb-3">
            {quickBetAmounts.map((amount) => (
              <Button
                key={amount}
                variant="outline"
                size="sm"
                onClick={() => handleBetAmountChange(amount)}
                disabled={amount > maxBet}
                className="border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10 hover:border-neon-blue/50 transition-all duration-200 text-xs py-1 h-6"
              >
                ${amount}
              </Button>
            ))}
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div className="space-y-1">
        {!isPlaying ? (
          <Button
            onClick={handlePlaceBet}
            disabled={betAmount <= 0 || betAmount > maxBet}
            className="w-full bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white font-bold py-2 rounded-lg neon-glow transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Zap className="w-3 h-3 mr-1" />
            {isDemoMode ? `DEMO BET $${betAmount}` : `PLACE BET $${betAmount}`}
          </Button>
        ) : (
          <Button
            onClick={onCashOut}
            className={`w-full ${
              isDemoMode 
                ? 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-yellow-500 hover:to-orange-500' 
                : 'bg-gradient-to-r from-neon-green to-emerald-500 hover:from-emerald-500 hover:to-neon-green'
            } text-white font-bold py-2 rounded-lg neon-glow transition-all duration-300 hover:scale-105 animate-pulse text-sm`}
          >
            {isDemoMode ? `DEMO CASH OUT $${potentialWin.toFixed(2)}` : `CASH OUT $${potentialWin.toFixed(2)}`}
          </Button>
        )}

        {/* Max Bet Button */}
        {!isPlaying && (
          <Button
            onClick={() => handleBetAmountChange(maxBet)}
            variant="outline"
            className="w-full border-neon-orange/30 text-neon-orange hover:bg-neon-orange/10 hover:border-neon-orange/50 text-xs py-1 h-6"
            disabled={maxBet <= 0}
          >
            MAX BET
          </Button>
        )}
      </div>
    </div>
  );
};

export default BettingPanel;
