import { OnChainExecutionData, RouteResponse } from '@0xsquid/squid-types';
import { Adapter } from '@solana/wallet-adapter-base';
import { Connection, VersionedTransaction } from '@solana/web3.js';

/**
 * Execute a Solana swap transaction
 * This will be used for the swap flow - Using Jupiter Dex under the hood
 */
export const executeSolanaSwap = async ({
  route,
  signer,
  connection,
  onSigned,
}: {
  route: RouteResponse['route'];
  signer: Adapter;
  connection: Connection;
  onSigned?: (signature: string) => void;
}): Promise<string> => {
  if (!(route?.transactionRequest as OnChainExecutionData)?.data) {
    throw new Error('Invalid parameters');
  }

  const swapRequest = (route.transactionRequest as OnChainExecutionData).data;
  const swapTransactionBuf = new Uint8Array(Buffer.from(swapRequest, 'base64'));
  const transaction = VersionedTransaction.deserialize(swapTransactionBuf);

  try {
    const latestBlockhash = await connection.getLatestBlockhash();
    const signature = await signer.sendTransaction(transaction, connection);

    onSigned?.(signature);

    await connection.confirmTransaction({
      signature,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    });

    return signature;
  } catch (error) {
    console.error('Solana swap failed:', error);
    throw error;
  }
}; 