
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

  const quickBetAmounts = [10, 25, 50, 100];

  const handleBetAmountChange = (amount: number) => {
    setBetAmount(Math.min(amount, balance));
  };

  const handlePlaceBet = () => {
    if (betAmount <= balance && betAmount > 0) {
      onPlaceBet(betAmount);
    }
  };

  return (
    <div className="glass-effect rounded-xl p-3 border border-neon-blue/30">
      <div className="flex items-center gap-2 mb-3">
        <div className="p-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg">
          <Bitcoin className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white">Place Bet</h3>
          <p className="text-gray-400 text-xs">Balance: ${balance.toFixed(2)}</p>
        </div>
      </div>

      {/* Current Game Stats */}
      {isPlaying && (
        <div className="bg-gradient-to-r from-neon-green/10 to-emerald-500/10 rounded-lg p-2 mb-3 border border-neon-green/30">
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-300 text-xs">Multiplier:</span>
            <span className="text-neon-green font-bold text-sm">
              {currentMultiplier.toFixed(2)}x
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-xs">Win:</span>
            <span className="text-neon-green font-bold text-sm">
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
                max={balance}
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
                disabled={amount > balance}
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
            disabled={betAmount <= 0 || betAmount > balance}
            className="w-full bg-gradient-to-r from-neon-blue to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white font-bold py-2 rounded-lg neon-glow transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Zap className="w-3 h-3 mr-1" />
            PLACE BET ${betAmount}
          </Button>
        ) : (
          <Button
            onClick={onCashOut}
            className="w-full bg-gradient-to-r from-neon-green to-emerald-500 hover:from-emerald-500 hover:to-neon-green text-white font-bold py-2 rounded-lg neon-glow transition-all duration-300 hover:scale-105 animate-pulse text-sm"
          >
            CASH OUT ${potentialWin.toFixed(2)}
          </Button>
        )}

        {/* Max Bet Button */}
        {!isPlaying && (
          <Button
            onClick={() => handleBetAmountChange(balance)}
            variant="outline"
            className="w-full border-neon-orange/30 text-neon-orange hover:bg-neon-orange/10 hover:border-neon-orange/50 text-xs py-1 h-6"
            disabled={balance <= 0}
          >
            MAX BET
          </Button>
        )}
      </div>
    </div>
  );
};

export default BettingPanel;
