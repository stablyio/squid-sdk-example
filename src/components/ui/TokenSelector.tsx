import { Token } from '@0xsquid/squid-types';
import { useState } from 'react';
import Image from 'next/image';
import { getEthereumTokens } from '@/utils/tokens';
import { useSquid } from '@/hooks/SquidProvider';
import Spinner from '@/components/ui/Spinner';

interface TokenSelectorProps {
  onSelect: (token: Token) => void;
  selectedToken?: Token;
  label?: string;
}

const TokenSelector = ({ onSelect, selectedToken, label = "Select Token" }: TokenSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isLoading } = useSquid();
  
  const ethereumTokens = getEthereumTokens();
  const filteredTokens = ethereumTokens.filter(token => 
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="relative">
      <label className="card-label">{label}</label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 bg-[#1A1F2E] rounded-lg hover:bg-[#2D3548] transition-colors"
      >
        {selectedToken ? (
          <div className="flex items-center">
            {/* Temporarily disabled token image
            {selectedToken.logoURI && (
              <div className="w-6 h-6 mr-2 rounded-full overflow-hidden">
                <Image
                  src={selectedToken.logoURI}
                  alt={selectedToken.symbol}
                  width={24}
                  height={24}
                />
              </div>
            )}
            */}
            <span className="text-white">{selectedToken.symbol}</span>
          </div>
        ) : (
          <span className="text-gray-400">Select a token</span>
        )}
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-2 bg-[#1A1F2E] rounded-lg shadow-lg max-h-96 overflow-auto">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search tokens..."
              className="w-full p-2 bg-[#2D3548] rounded-lg text-white placeholder-gray-400 outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="py-2">
            {filteredTokens.length > 0 ? (
              filteredTokens.map((token) => (
                <button
                  key={`${token.chainId}-${token.address}`}
                  className="w-full flex items-center p-3 hover:bg-[#2D3548] transition-colors"
                  onClick={() => {
                    onSelect(token);
                    setIsOpen(false);
                    setSearchQuery('');
                  }}
                >
                  {/* Temporarily disabled token image
                  {token.logoURI && (
                    <div className="w-6 h-6 mr-2 rounded-full overflow-hidden">
                      <Image
                        src={token.logoURI}
                        alt={token.symbol}
                        width={24}
                        height={24}
                      />
                    </div>
                  )}
                  */}
                  <div className="flex flex-col items-start">
                    <span className="text-white">{token.symbol}</span>
                    <span className="text-gray-400 text-sm">{token.name}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-gray-400 text-center py-4">
                No tokens found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default TokenSelector; 