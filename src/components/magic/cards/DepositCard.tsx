import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import CardHeader from '@/components/ui/CardHeader';
import { QRCodeCanvas } from 'qrcode.react';
import { Token } from '@0xsquid/squid-types';
import Spinner from '@/components/ui/Spinner';
import { useMagic } from '@/hooks/MagicProvider';

interface DepositCardProps {
  token: Token;
  amount: string;
  onBack: () => void;
  onComplete: () => void;
}

const DepositCard = ({ token, amount, onBack, onComplete }: DepositCardProps) => {
  const [copied, setCopied] = useState(false);
  const [isWaiting, setIsWaiting] = useState(true);
  const [address, setAddress] = useState<string>('');
  const { magic } = useMagic();

  useEffect(() => {
    const getAddress = async () => {
      if (magic) {
        try {
          const metadata = await magic.user.getInfo();
          if (metadata.publicAddress) {
            setAddress(metadata.publicAddress);
          }
        } catch (error) {
          console.error('Failed to get wallet address:', error);
        }
      }
    };

    getAddress();
  }, [magic]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsWaiting(false);
      onComplete();
    }, 10000); // 10 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!address) {
    return (
      <Card>
        <div className="flex justify-center items-center py-8">
          <Spinner />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 hover:bg-[#2D3548] rounded-lg transition-colors"
          >
            <svg 
              className="w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
          <CardHeader id="Deposit">Deposit {token.symbol}</CardHeader>
        </div>
        {isWaiting && (
          <div className="w-6 h-6">
            <Spinner />
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-black font-medium mb-4">Please deposit {amount} {token.symbol} to this address</p>
        <div className="flex justify-center mb-4">
          <QRCodeCanvas 
            value={address}
            size={200}
            level="H"
            includeMargin={true}
            className="p-2 bg-white rounded-lg"
          />
        </div>
        <div className="flex items-center justify-center space-x-2 bg-[#1A1F2E] p-3 rounded-lg">
          <code className="text-gray-300 text-sm">{address}</code>
          <button
            onClick={handleCopy}
            className="ml-2 p-2 hover:bg-[#2D3548] rounded-lg transition-colors"
          >
            {copied ? (
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </Card>
  );
};

export default DepositCard; 