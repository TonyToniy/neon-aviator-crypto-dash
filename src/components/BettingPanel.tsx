
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bitcoin, DollarSign, Zap } from 'lucide-react';

interface BettingPanelProps {
  balance: number;
  onPlaceBet: (amount: number) => void;
  onCashOut: () => void;
  isPlaying: boolean;
  currentMultiplier: number;
  potentialWin: number;
}

const BettingPanel: React.FC<BettingPanelProps> = ({
  balance,
  onPlaceBet,
  onCashOut,
  isPlaying,
  currentMultiplier,
  potentialWin
}) => {
  const [betAmount, setBetAmount] = useState(10);
  const [autoCashOut, setAutoCashOut] = useState(2.0);

  const quickBetAmounts = [10, 25, 50, 100, 250];

  const handleBetAmountChange = (amount: number) => {
    setBetAmount(Math.min(amount, balance));
  };

  const handlePlaceBet = () => {
    if (betAmount <= balance && betAmount > 0) {
      onPlaceBet(betAmount);
    }
  };

  return (
    <div className="glass-effect rounded-2xl p-6 border border-neon-blue/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg">
          <Bitcoin className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Place Your Bet</h3>
          <p className="text-gray-400 text-sm">Balance: ${balance.toFixed(2)}</p>
        </div>
      </div>

      {/* Bet Amount Section */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Bet Amount ($)
        </label>
        <div className="relative">
          <Input
            type="number"
            value={betAmount}
            onChange={(e) => handleBetAmountChange(Number(e.target.value))}
            className="bg-slate-800/50 border-neon-blue/30 text-white pr-16 text-lg font-semibold"
            min="1"
            max={balance}
            disabled={isPlaying}
          />
          <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neon-green w-5 h-5" />
        </div>
      </div>

      {/* Quick Bet Buttons */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {quickBetAmounts.map((amount) => (
          <Button
            key={amount}
            variant="outline"
            size="sm"
            onClick={() => handleBetAmountChange(amount)}
            disabled={isPlaying || amount > balance}
            className="border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10 hover:border-neon-blue/50 transition-all duration-200"
          >
            ${amount}
          </Button>
        ))}
      </div>

      {/* Auto Cash Out */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Auto Cash Out (x)
        </label>
        <Input
          type="number"
          value={autoCashOut}
          onChange={(e) => setAutoCashOut(Number(e.target.value))}
          className="bg-slate-800/50 border-neon-purple/30 text-white"
          min="1.01"
          step="0.01"
          disabled={isPlaying}
        />
      </div>

      {/* Current Game Stats */}
      {isPlaying && (
        <div className="bg-gradient-to-r from-neon-green/10 to-emerald-500/10 rounded-xl p-4 mb-6 border border-neon-green/30">
          <div className="flex justify-between items-center mb-2">
            <span className="text-gray-300">Current Multiplier:</span>
            <span className="text-neon-green font-bold text-lg">
              {currentMultiplier.toFixed(2)}x
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300">Potential Win:</span>
            <span className="text-neon-green font-bold text-lg">
              ${potentialWin.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="space-y-3">
        {!isPlaying ? (
          <Button
            onClick={handlePlaceBet}
            disabled={betAmount <= 0 || betAmount > balance}
            className="w-full bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white font-bold py-4 rounded-xl neon-glow transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Zap className="w-5 h-5 mr-2" />
            PLACE BET ${betAmount}
          </Button>
        ) : (
          <Button
            onClick={onCashOut}
            className="w-full bg-gradient-to-r from-neon-green to-emerald-500 hover:from-emerald-500 hover:to-neon-green text-white font-bold py-4 rounded-xl neon-glow transition-all duration-300 hover:scale-105 animate-pulse"
          >
            CASH OUT ${potentialWin.toFixed(2)}
          </Button>
        )}
      </div>

      {/* Max Bet Button */}
      {!isPlaying && (
        <Button
          onClick={() => handleBetAmountChange(balance)}
          variant="outline"
          className="w-full mt-2 border-neon-orange/30 text-neon-orange hover:bg-neon-orange/10 hover:border-neon-orange/50"
          disabled={balance <= 0}
        >
          MAX BET
        </Button>
      )}
    </div>
  );
};

export default BettingPanel;
