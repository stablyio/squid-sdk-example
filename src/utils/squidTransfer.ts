import { Squid } from '@0xsquid/sdk';
import { ethers } from 'ethers';
import { Token } from '@0xsquid/squid-types';
import { SolanaSigner } from '@0xsquid/sdk/dist/types';
import { Connection, Transaction, VersionedTransaction } from '@solana/web3.js';

const SOLANA_CHAIN_ID = 'solana-mainnet-beta';
const PYYUSD_ADDRESS = '2b1kV6DkPAnxd5ixfnxCpjxmKwqjjaYmCZfHsFu24GXo';

interface TransferParams {
  squid: Squid;
  signer: SolanaSigner;
  toToken: Token;
  amount: string;
  address: string;
}

interface TransferResult {
  transactionHash: string;
  requestId: string;
  fromChainId: string;
  toChainId: string;
}

export const executeSquidTransfer = async ({
  squid,
  signer,
  toToken,
  amount,
  address,
}: TransferParams): Promise<TransferResult> => {
  try {
    console.log('💫 Setting up transfer parameters...');
    // Convert amount to the correct decimal places (6 for PYYUSD)
    const fromAmount = ethers.parseUnits(amount, 6).toString();

    // Set up parameters for swapping tokens
    const params = {
      fromAddress: address,
      fromChain: SOLANA_CHAIN_ID,
      fromToken: PYYUSD_ADDRESS, // Using PYYUSD as source token
      fromAmount: fromAmount,
      toChain: toToken.chainId,
      toToken: toToken.address,
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
      signer: signer,
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
      toChainId: toToken.chainId,
    };
  } catch (error) {
    console.error('❌ Transfer failed:', error);
    throw error;
  }
};

export const checkTransferStatus = async (
  squid: Squid,
  params: {
    transactionId: string;
    requestId: string;
    fromChainId: string;
    toChainId: string;
  }
) => {
  try {
    const status = await squid.getStatus({
      ...params,
      integratorId: process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID || '',
    });
    return status.squidTransactionStatus;
  } catch (error) {
    console.error('Status check failed:', error);
    throw error;
  }
}; 