import { Token } from '@0xsquid/squid-types';

export const CHAIN_ID = 'solana-mainnet-beta';

let ethereumTokens: Token[] = [];

export const initializeEthereumTokens = (allTokens: Token[]) => {
  ethereumTokens = allTokens.filter(token => token.chainId === CHAIN_ID);
};

export const getEthereumTokens = () => ethereumTokens;

// Helper function to find a token by address
export const findEthereumTokenByAddress = (address: string): Token | undefined => {
  return ethereumTokens.find(token => 
    token.address.toLowerCase() === address.toLowerCase()
  );
};

// Helper function to find a token by symbol
export const findEthereumTokenBySymbol = (symbol: string): Token | undefined => {
  return ethereumTokens.find(token => 
    token.symbol.toLowerCase() === symbol.toLowerCase()
  );
}; 