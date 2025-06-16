
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Bitcoin, Copy, ExternalLink, CheckCircle, Clock } from 'lucide-react';

interface CryptoDepositProps {
  userId: string;
  onDepositSuccess: () => void;
}

interface Deposit {
  id: string;
  address: string;
  amount: number;
  tx_hash: string | null;
  confirmations: number;
  status: string;
  created_at: string;
}

const CryptoDeposit: React.FC<CryptoDepositProps> = ({ userId, onDepositSuccess }) => {
  const [depositAddress, setDepositAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Generate a Bitcoin address (in production, use a proper wallet service)
  const generateBTCAddress = () => {
    // This is a demo address - in production, integrate with a proper wallet service
    const demoAddress = '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa';
    setDepositAddress(demoAddress);
  };

  useEffect(() => {
    generateBTCAddress();
    fetchDeposits();
  }, [userId]);

  const fetchDeposits = async () => {
    try {
      const { data, error } = await supabase
        .from('crypto_deposits')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeposits(data || []);
    } catch (error) {
      console.error('Error fetching deposits:', error);
    }
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(depositAddress);
    toast({
      title: "Address Copied! 📋",
      description: "Bitcoin address copied to clipboard",
    });
  };

  const submitDeposit = async () => {
    if (!amount || !txHash) {
      toast({
        title: "Missing Information",
        description: "Please enter both amount and transaction hash",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('crypto_deposits')
        .insert({
          user_id: userId,
          address: depositAddress,
          amount: parseFloat(amount),
          tx_hash: txHash,
          currency: 'BTC'
        });

      if (error) throw error;

      toast({
        title: "Deposit Submitted! ⏳",
        description: "We're verifying your transaction. This may take a few minutes.",
      });

      setAmount('');
      setTxHash('');
      fetchDeposits();
      
      // Start verification process
      verifyTransaction(txHash);
    } catch (error: any) {
      toast({
        title: "Deposit Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyTransaction = async (transactionHash: string) => {
    try {
      // Using blockchain.info API for Bitcoin transaction verification
      const response = await fetch(`https://blockchain.info/rawtx/${transactionHash}`);
      const txData = await response.json();

      if (txData) {
        // Check confirmations (simplified - in production, implement proper verification)
        const confirmations = txData.block_height ? 1 : 0;
        
        if (confirmations >= 1) {
          // Update deposit status
          await supabase
            .from('crypto_deposits')
            .update({ 
              status: 'confirmed',
              confirmations: confirmations,
              confirmed_at: new Date().toISOString()
            })
            .eq('tx_hash', transactionHash);

          toast({
            title: "Deposit Confirmed! ✅",
            description: "Your Bitcoin deposit has been verified and credited",
          });

          fetchDeposits();
          onDepositSuccess();
        }
      }
    } catch (error) {
      console.error('Error verifying transaction:', error);
      // In production, implement retry logic and better error handling
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'credited':
        return <CheckCircle className="w-4 h-4 text-neon-green" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'credited':
        return 'text-neon-green';
      default:
        return 'text-yellow-400';
    }
  };

  return (
    <div className="glass-effect rounded-2xl p-6 border border-neon-blue/30">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg">
          <Bitcoin className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Bitcoin Deposit</h3>
          <p className="text-gray-400 text-sm">Fund your account with Bitcoin</p>
        </div>
      </div>

      {/* Deposit Address */}
      <div className="mb-6">
        <Label className="text-gray-300 mb-2 block">Deposit Address</Label>
        <div className="flex gap-2">
          <Input
            value={depositAddress}
            readOnly
            className="bg-slate-800/50 border-neon-blue/30 text-white font-mono text-sm"
          />
          <Button
            onClick={copyAddress}
            variant="outline"
            size="sm"
            className="border-neon-blue/30 text-neon-blue hover:bg-neon-blue/10"
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Send Bitcoin to this address and provide transaction details below
        </p>
      </div>

      {/* Deposit Form */}
      <div className="space-y-4 mb-6">
        <div>
          <Label htmlFor="amount" className="text-gray-300">Amount (BTC)</Label>
          <Input
            id="amount"
            type="number"
            step="0.00000001"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="bg-slate-800/50 border-neon-blue/30 text-white"
            placeholder="0.001"
          />
        </div>

        <div>
          <Label htmlFor="txHash" className="text-gray-300">Transaction Hash</Label>
          <Input
            id="txHash"
            value={txHash}
            onChange={(e) => setTxHash(e.target.value)}
            className="bg-slate-800/50 border-neon-blue/30 text-white font-mono text-sm"
            placeholder="Enter transaction hash after sending"
          />
        </div>

        <Button
          onClick={submitDeposit}
          disabled={loading || !amount || !txHash}
          className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-yellow-500 hover:to-orange-500 text-white font-bold py-2 rounded-lg transition-all duration-300"
        >
          {loading ? 'Submitting...' : 'Submit Deposit'}
        </Button>
      </div>

      {/* Deposit History */}
      {deposits.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-white mb-3">Recent Deposits</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {deposits.map((deposit) => (
              <div key={deposit.id} className="bg-slate-800/30 rounded-lg p-3 border border-slate-700/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-white font-semibold">{deposit.amount} BTC</span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(deposit.status)}
                    <span className={`text-xs font-medium ${getStatusColor(deposit.status)}`}>
                      {deposit.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                {deposit.tx_hash && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 font-mono">
                      {deposit.tx_hash.slice(0, 16)}...
                    </span>
                    <a
                      href={`https://blockchain.info/tx/${deposit.tx_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-neon-blue hover:text-neon-purple transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
                <div className="text-xs text-gray-500 mt-1">
                  {new Date(deposit.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoDeposit;
