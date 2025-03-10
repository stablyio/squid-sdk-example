import type { WalletName } from '@solana/wallet-adapter-base';
import {
  BaseSignInMessageSignerWalletAdapter,
  WalletConnectionError,
  WalletReadyState,
  WalletSignMessageError,
  WalletSignTransactionError,
} from '@solana/wallet-adapter-base';
import { SolanaSignInInput, SolanaSignInOutput } from '@solana/wallet-standard-features';
import type {
  Connection,
  SendOptions,
  Transaction,
  TransactionSignature,
  TransactionVersion,
} from '@solana/web3.js';
import { PublicKey, VersionedTransaction } from '@solana/web3.js';

export class MagicWalletAdapter extends BaseSignInMessageSignerWalletAdapter {
  name = 'Magic' as WalletName<'Magic'>;
  url = 'https://magic.link';
  icon = '';
  publicKey: PublicKey | null = null;
  connecting = false;
  readyState = WalletReadyState.Installed;
  supportedTransactionVersions = new Set(['legacy', 0] as const);

  constructor(private magic: any, private connection: Connection) {
    super();
  }

  async connect(): Promise<void> {
    try {
      const metadata = await this.magic.user.getMetadata();
      this.publicKey = new PublicKey(metadata.publicAddress);
    } catch (error: any) {
      throw new WalletConnectionError(error?.message, error);
    }
  }

  async disconnect(): Promise<void> {
    // Magic handles disconnection
  }

  async signTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<T> {
    try {
      const signedTx = await this.magic.solana.signTransaction(transaction);
      return signedTx;
    } catch (error: any) {
      throw new WalletSignTransactionError(error?.message, error);
    }
  }

  async signAndSendTransaction<T extends Transaction | VersionedTransaction>(transaction: T): Promise<{ signature: string }> {
    try {
      const signedTx = await this.magic.solana.signTransaction(transaction);
      // Magic's signTransaction returns the raw transaction data
      const signature = await this.connection.sendRawTransaction(
        signedTx.rawTransaction || signedTx
      );
      return { signature };
    } catch (error: any) {
      throw new WalletSignTransactionError(error?.message, error);
    }
  }

  async signAndSendTransactionBatch(transactions: Transaction[]): Promise<string[]> {
    const signatures: string[] = [];
    for (const tx of transactions) {
      const { signature } = await this.signAndSendTransaction(tx);
      signatures.push(signature);
    }
    return signatures;
  }

  async signMessage(message: Uint8Array): Promise<Uint8Array> {
    try {
      return await this.magic.solana.signMessage(message);
    } catch (error: any) {
      throw new WalletSignMessageError(error?.message, error);
    }
  }

  async signIn(input?: SolanaSignInInput): Promise<SolanaSignInOutput> {
    throw new Error('Method not implemented.');
  }

  async sendTransaction<T extends Transaction | VersionedTransaction>(
    transaction: T,
    connection: Connection
  ): Promise<string> {
    try {
      const signedTx = await this.magic.solana.signTransaction(transaction);
      // Magic returns { rawTransaction: Uint8Array }
      return connection.sendRawTransaction(
        signedTx.rawTransaction
      );
    } catch (error: any) {
      console.error('Send transaction error:', error);
      throw error;
    }
  }
}