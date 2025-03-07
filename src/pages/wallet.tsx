import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/ui/Layout';
import UserInfo from '@/components/magic/cards/UserInfoCard';
import NetworkStatsCard from '@/components/magic/cards/NetworkStatsCard';
import DepositCard from '@/components/magic/cards/DepositCard';
import TransferStatusCard from '@/components/magic/cards/TransferStatusCard';
import Spacer from '@/components/ui/Spacer';
import { Token } from '@0xsquid/squid-types';
import { useMagic } from '@/hooks/MagicProvider';
import { useSquid } from '@/hooks/SquidProvider';
import { Connection } from '@solana/web3.js';
import { ethers } from 'ethers';
import { MagicWalletAdapter } from '@/utils/magic_adapter';
import { SolanaSigner } from '@0xsquid/sdk/dist/types';

interface DepositInfo {
  token: Token;
  amount: string;
}

type CardState = 'network' | 'deposit' | 'transfer';

export default function WalletPage() {
  const [token, setToken] = useState('');
  const [depositInfo, setDepositInfo] = useState<DepositInfo | null>(null);
  const [cardState, setCardState] = useState<CardState>('network');
  const router = useRouter();
  const { magic, connection } = useMagic();
  const { squid } = useSquid();

  const signer = useMemo<SolanaSigner | undefined>(() => {
    if (!magic || !connection) return undefined;
    const adapter = new MagicWalletAdapter(magic, connection);
    return adapter as unknown as SolanaSigner;
  }, [magic, connection]);

  // Effect for token-based redirection
  useEffect(() => {
    const storedToken = localStorage.getItem('token') ?? '';
    setToken(storedToken);
    if (!storedToken) {
      router.push('/');
    }
  }, [router]);

  // Effect for checking magic and squid availability
  useEffect(() => {
    const exampleTransfer = async () => {
      if (!magic || !squid || !signer) return;

      try {
        console.log('💫 Setting up transfer parameters...');
        const SOLANA_CHAIN_ID = 'solana-mainnet-beta';
        const PYYUSD_ADDRESS = '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo';
        const metadata = await magic?.user.getInfo();
        // Convert amount to the correct decimal places (6 for PYYUSD)
        const fromAmount = ethers.parseUnits('.10', 6).toString();

        const address = metadata.publicAddress ?? '';
        const toTokenAddress = '6p6xgHyF7AeE6TZkSmFsko444wqoP15icUSqi2jfGiPN'
    
        // Set up parameters for swapping tokens
        const params = {
          fromAddress: address,
          fromChain: SOLANA_CHAIN_ID,
          fromToken: PYYUSD_ADDRESS, // Using PYYUSD as source token
          fromAmount: fromAmount,
          toChain: SOLANA_CHAIN_ID,
          toToken: toTokenAddress,
          toAddress: address,
          enableBoost: true,
        };
    
        console.log('🔄 Transfer parameters:', params);
    
        // Get the swap route using Squid SDK
        const { route, requestId } = await squid.getRoute(params);
        console.log('📊 Calculated route:', {
          fromAmount,
          estimatedOutput: route.estimate.toAmount,
          requestId
        });

        // Execute the swap transaction
        console.log('🚀 Executing route...');
        const tx = await squid.executeRoute({
          signer,
          route,
        });
    
        console.log('Transaction response:', tx);
        
        // For Solana, tx should be a string (transaction signature)
        const txId = typeof tx === 'string' ? tx : null;
    
        if (!txId) {
          throw new Error('Transaction failed - invalid response format');
        }
        console.log('✅ Transaction executed:', txId);

        // Return transaction details for status monitoring
        return {
          transactionHash: txId,
          requestId: requestId || '',
          fromChainId: SOLANA_CHAIN_ID,
          toChainId: SOLANA_CHAIN_ID,
        };
      } catch (error) {
        console.error('❌ Transfer failed:', error);
        throw error;
      }
    }
    
    setTimeout(() => exampleTransfer(), 1000);
  }, [magic, squid, router, signer]);

  // This would typically come from your backend or wallet configuration
  const depositAddress = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';

  const handleSubmit = (token: Token, amount: string) => {
    setDepositInfo({ token, amount });
    setCardState('deposit');
  };

  const handleBack = () => {
    setDepositInfo(null);
    setCardState('network');
  };

  const handleDepositComplete = () => {
    setCardState('transfer');
  };

  const renderCard = () => {
    switch (cardState) {
      case 'network':
        return <NetworkStatsCard onSubmit={handleSubmit} />;
      case 'deposit':
        return depositInfo && (
          <DepositCard 
            token={depositInfo.token}
            amount={depositInfo.amount}
            onBack={handleBack}
            onComplete={handleDepositComplete}
          />
        );
      case 'transfer':
        return depositInfo && (
          <TransferStatusCard 
            token={depositInfo.token}
            amount={depositInfo.amount}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Layout token={token} setToken={setToken}>
      <div className='cards-container'>
        {renderCard()}
        <Spacer size={10} />
        <UserInfo token={token} setToken={setToken} />
      </div>
    </Layout>
  );
} 