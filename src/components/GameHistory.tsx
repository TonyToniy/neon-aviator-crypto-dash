
import React from 'react';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';

interface GameHistoryProps {
  history: Array<{
    id: number;
    multiplier: number;
    crashed: boolean;
    timestamp: Date;
    betAmount?: number;
    winAmount?: number;
  }>;
}

const GameHistory: React.FC<GameHistoryProps> = ({ history }) => {
  const getMultiplierColor = (multiplier: number, crashed: boolean) => {
    if (crashed) return 'text-red-400';
    if (multiplier < 2) return 'text-neon-green';
    if (multiplier < 5) return 'text-yellow-400';
    if (multiplier < 10) return 'text-orange-400';
    return 'text-purple-400';
  };

  return (
    <div className="glass-effect rounded-2xl p-6 border border-neon-purple/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-neon-purple to-neon-pink rounded-lg">
          <Clock className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-xl font-bold text-white">Game History</h3>
      </div>

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {history.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No games played yet</p>
            <p className="text-sm">Start playing to see your history</p>
          </div>
        ) : (
          history.slice(0, 20).map((game) => (
            <div
              key={game.id}
              className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50 hover:border-neon-blue/30 transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {game.crashed ? (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  ) : (
                    <TrendingUp className="w-5 h-5 text-neon-green" />
                  )}
                  <div>
                    <div className={`font-bold text-lg ${getMultiplierColor(game.multiplier, game.crashed)}`}>
                      {game.multiplier.toFixed(2)}x
                    </div>
                    <div className="text-xs text-gray-400">
                      {game.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
                
                {game.betAmount && (
                  <div className="text-right">
                    <div className="text-sm text-gray-300">
                      Bet: ${game.betAmount.toFixed(2)}
                    </div>
                    {game.winAmount && (
                      <div className={`text-sm font-semibold ${
                        game.winAmount > game.betAmount ? 'text-neon-green' : 'text-red-400'
                      }`}>
                        {game.winAmount > game.betAmount ? '+' : ''}
                        ${(game.winAmount - game.betAmount).toFixed(2)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Stats */}
      {history.length > 0 && (
        <div className="mt-6 pt-4 border-t border-slate-700/50">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-neon-blue">
                {history.length}
              </div>
              <div className="text-xs text-gray-400">Games</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-neon-green">
                {(history.filter(g => !g.crashed).length / history.length * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-gray-400">Win Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-neon-purple">
                {Math.max(...history.map(g => g.multiplier)).toFixed(2)}x
              </div>
              <div className="text-xs text-gray-400">Best</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameHistory;
