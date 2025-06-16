import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Plane, Zap, Coins, LogOut, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import AviatorGame from '@/components/AviatorGame';
import BettingPanel from '@/components/BettingPanel';
import GameHistory from '@/components/GameHistory';
import PlayerStats from '@/components/PlayerStats';
import CryptoDeposit from '@/components/CryptoDeposit';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface GameRecord {
  id: number;
  multiplier: number;
  crashed: boolean;
  timestamp: Date;
  betAmount?: number;
  winAmount?: number;
}

const Index = () => {
  const { user, loading, signOut } = useAuth();
  const [balance, setBalance] = useState(0);
  const [currentMultiplier, setCurrentMultiplier] = useState(1.0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentBet, setCurrentBet] = useState(0);
  const [gameHistory, setGameHistory] = useState<GameRecord[]>([]);
  const [totalWagered, setTotalWagered] = useState(0);
  const [totalWon, setTotalWon] = useState(0);
  const [showDeposit, setShowDeposit] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [demoBalance, setDemoBalance] = useState(1000);
  const { toast } = useToast();

  // Fetch user balance from database
  const fetchBalance = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setBalance(Number(data.balance) || 0);
    } catch (error) {
      console.error('Error fetching balance:', error);
    }
  };

  // Update balance in database
  const updateBalance = async (newBalance: number) => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_balances')
        .update({ balance: newBalance, updated_at: new Date().toISOString() })
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating balance:', error);
    }
  };

  // ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS
  useEffect(() => {
    if (user) {
      fetchBalance();
    }
  }, [user]);

  // Redirect to auth if not authenticated - AFTER all hooks
  if (loading) {
    return (
      <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin">
          <Plane className="w-8 h-8 text-neon-blue" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const handlePlaceBet = async (amount: number) => {
    if (isDemoMode) {
      if (amount <= demoBalance) {
        const newDemoBalance = demoBalance - amount;
        setDemoBalance(newDemoBalance);
        setCurrentBet(amount);
        setIsPlaying(true);
        
        toast({
          title: "Demo Bet Placed! 🎮",
          description: `Demo $${amount} bet placed. Good luck!`,
        });
      }
    } else {
      if (amount <= balance) {
        const newBalance = balance - amount;
        setBalance(newBalance);
        await updateBalance(newBalance);
        setCurrentBet(amount);
        setIsPlaying(true);
        setTotalWagered(prev => prev + amount);
        
        toast({
          title: "Bet Placed! 🚀",
          description: `$${amount} bet placed. Good luck!`,
        });
      }
    }
  };

  const handleCashOut = async () => {
    if (isPlaying && currentBet > 0) {
      const winAmount = currentBet * currentMultiplier;
      
      if (isDemoMode) {
        const newDemoBalance = demoBalance + winAmount;
        setDemoBalance(newDemoBalance);
      } else {
        const newBalance = balance + winAmount;
        setBalance(newBalance);
        await updateBalance(newBalance);
        setTotalWon(prev => prev + winAmount);
      }
      
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
        title: isDemoMode ? "Demo Cash Out! 🎮" : "Cash Out Successful! 💰",
        description: `${isDemoMode ? 'Demo won' : 'Won'} $${winAmount.toFixed(2)} at ${currentMultiplier.toFixed(2)}x`,
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
        title: isDemoMode ? "Demo Crashed! 🎮" : "Plane Crashed! 💥",
        description: `${isDemoMode ? 'Demo lost' : 'Lost'} $${currentBet.toFixed(2)} at ${finalMultiplier.toFixed(2)}x`,
        variant: "destructive",
      });
    }
    
    setIsPlaying(false);
    setCurrentBet(0);
  };

  const handleGameStart = () => {
    setCurrentMultiplier(1.0);
  };

  const handleDemoStart = () => {
    setCurrentMultiplier(1.0);
  };

  const handleToggleDemoMode = () => {
    if (isPlaying) {
      toast({
        title: "Cannot Switch Modes",
        description: "Please finish your current game first",
        variant: "destructive",
      });
      return;
    }
    
    setIsDemoMode(!isDemoMode);
    setCurrentBet(0);
    setCurrentMultiplier(1.0);
    
    // Reset demo balance when entering demo mode
    if (!isDemoMode) {
      setDemoBalance(1000);
    }
    
    toast({
      title: isDemoMode ? "Demo Mode Disabled" : "Demo Mode Enabled! 🎮",
      description: isDemoMode ? "You can now place real bets" : "Practice without risking real money",
    });
  };

  const handleDeposit = () => {
    setShowDeposit(true);
  };

  const handleWithdraw = () => {
    // In production, implement proper withdrawal logic
    toast({
      title: "Withdrawal Request",
      description: "Withdrawal functionality coming soon",
    });
  };

  const handleDepositSuccess = () => {
    fetchBalance();
    setShowDeposit(false);
    toast({
      title: "Deposit Successful! 💰",
      description: "Your account has been credited",
    });
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: "Signed Out",
      description: "See you next time!",
    });
  };

  const potentialWin = currentBet * currentMultiplier;
  const displayBalance = isDemoMode ? demoBalance : balance;

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 bg-cyber-grid bg-grid opacity-5"></div>
      
      {/* Header - Very compact */}
      <header className="relative z-10 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-lg border-b border-neon-blue/20 py-1">
        <div className="container mx-auto px-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg">
                <Plane className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
                  AVIATOR
                </h1>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 text-neon-green">
                <Coins className="w-4 h-4" />
                <span className="font-bold text-sm">
                  {isDemoMode ? `DEMO $${displayBalance.toFixed(2)}` : `$${displayBalance.toFixed(2)}`}
                </span>
              </div>
              
              <div className="flex items-center gap-1 text-neon-purple">
                <Zap className="w-3 h-3" />
                <span className="font-semibold text-xs">
                  {gameHistory.length > 0 
                    ? `${((gameHistory.filter(g => !g.crashed).length / gameHistory.length) * 100).toFixed(0)}%`
                    : 'New'
                  }
                </span>
              </div>

              <Dialog open={showSettings} onOpenChange={setShowSettings}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-neon-blue">
                    <Settings className="w-4 h-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-slate-900 border-neon-blue/30">
                  <DialogHeader>
                    <DialogTitle className="text-white">Account Settings</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="text-sm text-gray-300">
                      <strong>Email:</strong> {user.email}
                    </div>
                    <Button
                      onClick={handleSignOut}
                      variant="outline"
                      className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Tight layout */}
      <main className="relative z-10 flex-1 p-2 overflow-hidden">
        <div className="h-full grid grid-cols-1 lg:grid-cols-12 gap-2">
          {/* Game Area */}
          <div className="lg:col-span-8 flex flex-col gap-2 h-full">
            <div className="flex-1 min-h-0">
              <AviatorGame
                onMultiplierChange={setCurrentMultiplier}
                onGameEnd={handleGameEnd}
                isPlaying={isPlaying}
                onGameStart={handleGameStart}
                isDemoMode={isDemoMode}
                onDemoStart={handleDemoStart}
                onCashOut={handleCashOut}
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
                isDemoMode={isDemoMode}
                onToggleDemoMode={handleToggleDemoMode}
                demoBalance={demoBalance}
              />
            </div>
          </div>

          {/* Side Panels */}
          <div className="lg:col-span-4 flex flex-col lg:grid lg:grid-rows-2 gap-2 h-full overflow-hidden">
            <div className="min-h-0">
              <PlayerStats
                balance={displayBalance}
                totalWagered={totalWagered}
                totalWon={totalWon}
                gamesPlayed={gameHistory.length}
                onDeposit={handleDeposit}
                onWithdraw={handleWithdraw}
              />
            </div>

            <div className="min-h-0 overflow-hidden">
              <GameHistory history={gameHistory} />
            </div>
          </div>
        </div>
      </main>

      {/* Crypto Deposit Modal */}
      <Dialog open={showDeposit} onOpenChange={setShowDeposit}>
        <DialogContent className="bg-slate-900 border-neon-blue/30 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-white">Bitcoin Deposit</DialogTitle>
          </DialogHeader>
          <CryptoDeposit 
            userId={user.id} 
            onDepositSuccess={handleDepositSuccess}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
