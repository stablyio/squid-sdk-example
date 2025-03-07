export enum Network {
  SOLANA_DEVNET = 'solana-devnet',
  SOLANA_MAINNET_BETA = 'solana-mainnet',
}

export const getNetworkUrl = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.SOLANA_DEVNET:
      return 'https://api.devnet.solana.com';
    case Network.SOLANA_MAINNET_BETA:
      return 'https://solana-mainnet.g.alchemy.com/v2/yNo4wg-mwX1guCmubZwwkinTfilTPF4f';
    default:
      throw new Error('Network not supported');
  }
};

export const getNetworkName = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.SOLANA_DEVNET:
      return 'Solana (Devnet)';
    case Network.SOLANA_MAINNET_BETA:
      return 'Solana (Mainnet Beta)';
  }
};

export const getBlockExplorer = (address: string) => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.SOLANA_DEVNET:
      return `https://explorer.solana.com/address/${address}?cluster=devnet`;
    case Network.SOLANA_MAINNET_BETA:
      return `https://explorer.solana.com/address/${address}`;
  }
};
