import type { EventEmitter, SendTransactionOptions, SupportedTransactionVersions, TransactionOrVersionedTransaction, WalletName } from '@solana/wallet-adapter-base';
import {
    BaseMessageSignerWalletAdapter,
    BaseSignInMessageSignerWalletAdapter,
    isIosAndRedirectable,
    isVersionedTransaction,
    scopePollingDetectionStrategy,
    WalletAccountError,
    WalletConnectionError,
    WalletDisconnectedError,
    WalletDisconnectionError,
    WalletError,
    WalletNotConnectedError,
    WalletNotReadyError,
    WalletPublicKeyError,
    WalletReadyState,
    WalletSendTransactionError,
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
    VersionedTransaction,
} from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

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

    signAndSendTransaction<T extends Transaction | VersionedTransaction>(transaction: T): { signature: string } {
        let signature = '';
        this.magic.solana.signTransaction(transaction, {
            requireAllSignatures: false,
            verifySignatures: true,
        }).then((signedTx: any) => {
            return this.connection.sendRawTransaction(signedTx.rawTransaction);
        }).then((txSignature: string) => {
            signature = txSignature;
        });
        return { signature };
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
}