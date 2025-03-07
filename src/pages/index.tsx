import MagicProvider from '@/hooks/MagicProvider';
import { useEffect, useState } from 'react';
import { ToastContainer } from 'react-toastify';
import { useRouter } from 'next/router';
import 'react-toastify/dist/ReactToastify.css';
import Login from '@/components/magic/Login';
import MagicDashboardRedirect from '@/components/ui/MagicDashboardRedirect';

export default function Home() {
  const [token, setToken] = useState('');
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('token') ?? '';
    setToken(storedToken);
    if (storedToken) {
      router.push('/wallet');
    }
  }, [router]);

  return (
    <MagicProvider>
      <ToastContainer />
      {process.env.NEXT_PUBLIC_MAGIC_API_KEY ? (
        <Login token={token} setToken={setToken} />
      ) : (
        <MagicDashboardRedirect />
      )}
    </MagicProvider>
  );
}
