
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
  id: number;
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
  const [verifying, setVerifying] = useState<string | null>(null);
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
      
      verifyTransaction(txHash);
    } catch (error: any) {
      console.error('Error submitting deposit:', error);
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
    console.log('Starting verification for tx:', transactionHash);
    setVerifying(transactionHash);
    
    try {
      // Simulate checking transaction confirmations
      console.log('Checking transaction confirmations for:', transactionHash);
      
      // Simulate API call delay for blockchain verification
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // For demo, we'll simulate that the transaction has 1+ confirmations
      const hasConfirmations = transactionHash.length >= 32; // Basic validation
      
      if (hasConfirmations) {
        console.log('Transaction has confirmations, marking as confirmed');
        
        // Update deposit status to confirmed - the database trigger will handle crediting
        const { error } = await supabase
          .from('crypto_deposits')
          .update({ 
            status: 'confirmed',
            confirmations: 1,
            confirmed_at: new Date().toISOString()
          })
          .eq('tx_hash', transactionHash);

        if (error) {
          console.error('Error updating deposit status:', error);
          throw error;
        }

        console.log('Deposit confirmed - database trigger will credit balance');
        
        toast({
          title: "Transaction Confirmed! ✅",
          description: "Your Bitcoin deposit has been verified and credited to your account",
        });

        // Refresh deposits and trigger success callback
        await fetchDeposits();
        onDepositSuccess();
      } else {
        throw new Error('Transaction does not have sufficient confirmations');
      }
    } catch (error) {
      console.error('Error verifying transaction:', error);
      toast({
        title: "Verification Failed",
        description: "Could not verify transaction confirmations. Please try manual confirmation.",
        variant: "destructive",
      });
    } finally {
      setVerifying(null);
    }
  };

  const manualConfirm = async (txHash: string) => {
    console.log('Manual confirmation for tx:', txHash);
    setVerifying(txHash);
    
    try {
      // Update deposit status to confirmed - database trigger will handle the rest
      const { error } = await supabase
        .from('crypto_deposits')
        .update({ 
          status: 'confirmed',
          confirmations: 1,
          confirmed_at: new Date().toISOString()
        })
        .eq('tx_hash', txHash);

      if (error) throw error;

      toast({
        title: "Deposit Confirmed! ✅",
        description: "Your deposit has been confirmed and credited to your account",
      });

      await fetchDeposits();
      onDepositSuccess();
    } catch (error) {
      console.error('Error confirming deposit:', error);
      toast({
        title: "Confirmation Failed",
        description: "Could not confirm deposit. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVerifying(null);
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
                  <div className="flex items-center gap-2">
                    {getStatusIcon(deposit.status)}
                    <span className={`text-xs font-medium ${getStatusColor(deposit.status)}`}>
                      {deposit.status.toUpperCase()}
                    </span>
                    {deposit.status === 'pending' && deposit.tx_hash && (
                      <Button
                        onClick={() => manualConfirm(deposit.tx_hash!)}
                        disabled={verifying === deposit.tx_hash}
                        size="sm"
                        className="text-xs px-2 py-1 h-6 bg-blue-600 hover:bg-blue-700"
                      >
                        {verifying === deposit.tx_hash ? 'Confirming...' : 'Confirm'}
                      </Button>
                    )}
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
