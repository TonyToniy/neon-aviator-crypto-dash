
import React from 'react';
import { User, Wallet, Trophy, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PlayerStatsProps {
  balance: number;
  totalWagered: number;
  totalWon: number;
  gamesPlayed: number;
  onDeposit: () => void;
  onWithdraw: () => void;
  isDemoMode?: boolean;
}

const PlayerStats: React.FC<PlayerStatsProps> = ({
  balance,
  totalWagered,
  totalWon,
  gamesPlayed,
  onDeposit,
  onWithdraw,
  isDemoMode = false
}) => {
  const netProfit = totalWon - totalWagered;
  const winRate = gamesPlayed > 0 ? ((totalWon / totalWagered) * 100) : 0;

  return (
    <div className="glass-effect rounded-2xl p-6 border border-neon-green/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-neon-green to-emerald-500 rounded-lg">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">
            {isDemoMode ? 'Demo Stats' : 'Player Stats'}
          </h3>
          <p className="text-gray-400 text-sm">
            {isDemoMode ? 'Practice performance' : 'Track your performance'}
          </p>
        </div>
      </div>

      {/* Balance Display */}
      <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-xl p-4 mb-6 border border-neon-green/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-300">
            {isDemoMode ? 'Demo Balance' : 'Current Balance'}
          </span>
          <Wallet className="w-5 h-5 text-neon-green" />
        </div>
        <div className="text-3xl font-bold text-neon-green mb-4">
          ${balance.toFixed(2)}
          {isDemoMode && <span className="text-sm text-orange-400 ml-2">(DEMO)</span>}
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={onDeposit}
            disabled={isDemoMode}
            className="bg-gradient-to-r from-neon-blue to-blue-600 hover:from-blue-600 hover:to-neon-blue text-white font-semibold py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Deposit
          </Button>
          <Button
            onClick={onWithdraw}
            variant="outline"
            disabled={balance <= 0 || isDemoMode}
            className="border-neon-green/30 text-neon-green hover:bg-neon-green/10 hover:border-neon-green/50 font-semibold py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Withdraw
          </Button>
        </div>
        
        {isDemoMode && (
          <p className="text-xs text-orange-400 mt-2 text-center">
            Deposit/Withdrawal disabled in demo mode
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-800/30 rounded-xl p-4 text-center border border-slate-700/50">
          <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {gamesPlayed}
          </div>
          <div className="text-xs text-gray-400">Games Played</div>
        </div>
        
        <div className="bg-slate-800/30 rounded-xl p-4 text-center border border-slate-700/50">
          <Target className="w-6 h-6 text-purple-400 mx-auto mb-2" />
          <div className="text-2xl font-bold text-white">
            {winRate.toFixed(0)}%
          </div>
          <div className="text-xs text-gray-400">Efficiency</div>
        </div>
      </div>

      {/* Financial Stats */}
      <div className="space-y-3">
        <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
          <span className="text-gray-300">Total Wagered:</span>
          <span className="text-white font-semibold">${totalWagered.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center py-2 border-b border-slate-700/30">
          <span className="text-gray-300">Total Won:</span>
          <span className="text-neon-green font-semibold">${totalWon.toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center py-2">
          <span className="text-gray-300">Net Profit:</span>
          <span className={`font-bold ${netProfit >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
            {netProfit >= 0 ? '+' : ''}${netProfit.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Performance Indicator */}
      <div className="mt-6 pt-4 border-t border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Performance</span>
          <span className={`text-sm font-semibold ${
            netProfit >= 0 ? 'text-neon-green' : 'text-red-400'
          }`}>
            {netProfit >= 0 ? '📈 Profitable' : '📉 Down'}
          </span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full transition-all duration-500 ${
              netProfit >= 0 ? 'bg-gradient-to-r from-neon-green to-emerald-500' : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}
            style={{ 
              width: `${Math.min(100, Math.abs(netProfit) / Math.max(totalWagered, 1) * 100 + 20)}%` 
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default PlayerStats;
