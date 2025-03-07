import { useState } from 'react';
import Card from '@/components/ui/Card';
import CardHeader from '@/components/ui/CardHeader';
import TokenSelector from '@/components/ui/TokenSelector';
import { Token } from '@0xsquid/squid-types';
import CardLabel from '@/components/ui/CardLabel';

interface NetworkStatsCardProps {
  onSubmit: (token: Token, amount: string) => void;
}

const NetworkStatsCard = ({ onSubmit }: NetworkStatsCardProps) => {
  const [selectedToken, setSelectedToken] = useState<Token>();
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    debugger
    if (!selectedToken || !amount) return;
    
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError('Please enter an amount greater than 0');
      return;
    }

    setError('');
    onSubmit(selectedToken, amount);
  };

  return (
    <Card>
      <CardHeader id="Token">Select Token</CardHeader>
      <TokenSelector
        selectedToken={selectedToken}
        onSelect={setSelectedToken}
        label="Available Tokens"
      />
      <div className="mt-4">
        <CardLabel leftHeader="Amount" />
        <input
          type="number"
          value={amount}
          onChange={(e) => {
            setAmount(e.target.value);
            setError('');
          }}
          placeholder="Enter amount"
          className="w-full p-3 bg-[#1A1F2E] rounded-lg text-white placeholder-gray-400 outline-none mt-2"
          min="0"
          step="any"
        />
        {error && (
          <div className="text-red-500 text-sm mt-1">{error}</div>
        )}
      </div>
      <button
        onClick={handleSubmit}
        disabled={!selectedToken || !amount}
        className={`w-full mt-4 p-3 rounded-lg font-medium transition-colors ${
          selectedToken && amount
            ? 'bg-[#6851ff] text-white hover:bg-[#6851ff]/90'
            : 'bg-[#2D3548] text-gray-400 cursor-not-allowed'
        }`}
      >
        Submit
      </button>
    </Card>
  );
};

export default NetworkStatsCard; 