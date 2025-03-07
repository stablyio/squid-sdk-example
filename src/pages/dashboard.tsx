import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '@/components/ui/Layout';
import WalletMethods from '@/components/magic/cards/WalletMethodsCard';
import SendTransaction from '@/components/magic/cards/SendTransactionCard';
import Spacer from '@/components/ui/Spacer';
import SmartContract from '@/components/magic/cards/SmartContract';
import { isTestnet } from '@/utils/smartContract';

export default function DashboardPage() {
  const [token, setToken] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token') ?? '';
    setToken(storedToken);
    if (!storedToken) {
      router.push('/');
    }
  }, [router]);

  return (
    <Layout token={token} setToken={setToken}>
      <div className="cards-container">
        <SendTransaction />
        <Spacer size={10} />
        <WalletMethods token={token} setToken={setToken} />
        <Spacer size={15} />
        {isTestnet() && <SmartContract />}
      </div>
    </Layout>
  );
} 