import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import CardHeader from '@/components/ui/CardHeader';
import Spinner from '@/components/ui/Spinner';
import { Token } from '@0xsquid/squid-types';
import { useMagic } from '@/hooks/MagicProvider';
import { useSquid } from '@/hooks/SquidProvider';
import { ethers } from 'ethers';
import { executeSquidTransfer, checkTransferStatus } from '@/utils/squidTransfer';
import { findEthereumTokenBySymbol } from '@/utils/tokens'
import { Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { Squid } from "@0xsquid/sdk";

interface TransferStatusCardProps {
  token: Token;
  amount: string;
}

type TransferStatus = 'initiating' | 'approving' | 'transferring' | 'monitoring' | 'completed' | 'failed';

const statusMessages = {
  initiating: 'Initiating transfer...',
  approving: 'Approving token spend...',
  transferring: 'Executing transfer...',
  monitoring: 'Monitoring transfer status...',
  completed: 'Transfer completed successfully!',
  failed: 'Transfer failed. Please try again.',
};

const TransferStatusCard = ({ token, amount }: TransferStatusCardProps) => {
  const [status, setStatus] = useState<TransferStatus>('initiating');
  const [error, setError] = useState<string | null>(null);
  const { magic } = useMagic();
  const { squid } = useSquid();

  const getMagicSigner = async () => {
    if (!magic) return;
    const metadata = await magic.user.getMetadata();
    if (!metadata.publicAddress) throw new Error("User is not logged in");
  
    return {
      publicKey: metadata.publicAddress,
      signTransaction: async (transaction: any) => {
        const signedTx = await magic.solana.signTransaction(transaction);
        return signedTx.rawTransaction;
      },
      signMessage: async (message: any) => {
        return await magic.solana.signMessage(new Uint8Array(message));
      }
    };
  };

  useEffect(() => {
    const executeTransfer = async () => {
      if (!magic || !squid) return;

      try {
        console.log('🚀 Initiating transfer process...', { token: token.symbol, amount });
        setStatus('initiating');
        
        const signer = await getMagicSigner();
        if (!signer) {
          throw new Error('Failed to get signer');
        }

        console.log('👍 Got signer address:', signer.publicKey);
        setStatus('approving');
        const result = await executeSquidTransfer({
          squid,
          signer,
          toToken: token,
          amount,
          address: signer.publicKey,
        });

        console.log('✅ Transfer initiated successfully:', result);
        setStatus('monitoring');
        
        // Monitor the transaction status
        const checkStatus = async () => {
          try {
            console.log('🔍 Checking transfer status...');
            const transferStatus = await checkTransferStatus(squid, {
              transactionId: result.transactionHash,
              requestId: result.requestId,
              fromChainId: result.fromChainId,
              toChainId: result.toChainId,
            });

            console.log('📡 Current transfer status:', transferStatus);

            if (!transferStatus) {
              console.log('⏳ Status pending, checking again in 5 seconds...');
              setTimeout(checkStatus, 5000);
              return;
            }

            if (['success', 'partial_success'].includes(transferStatus)) {
              console.log('🎉 Transfer completed successfully!');
              setStatus('completed');
            } else if (['failed', 'error'].includes(transferStatus)) {
              console.log('❌ Transfer failed:', transferStatus);
              setStatus('failed');
              setError('Transfer failed. Please check your transaction and try again.');
            } else {
              console.log('⏳ Transfer still in progress, checking again in 5 seconds...');
              setTimeout(checkStatus, 5000);
            }
          } catch (error) {
            console.error('❌ Status check failed:', error);
            setStatus('failed');
            setError('Failed to check transfer status');
          }
        };

        // Start monitoring
        checkStatus();

      } catch (error) {
        console.error('❌ Transfer failed:', error);
        setStatus('failed');
        setError(error instanceof Error ? error.message : 'Transfer failed');
      }
    };

    executeTransfer();
  }, [magic, squid, token, amount]);

  return (
    <Card>
      <CardHeader id="Transfer">Transfer Status</CardHeader>
      <div className="text-center py-8">
        <p className="text-black font-medium mb-6">
          {statusMessages[status]}
        </p>
        {status !== 'completed' && status !== 'failed' && (
          <div className="flex justify-center">
            <div className="w-8 h-8">
              <Spinner />
            </div>
          </div>
        )}
        {error && (
          <p className="text-red-500 mt-4">{error}</p>
        )}
      </div>
    </Card>
  );
};

export default TransferStatusCard; 