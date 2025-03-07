import { useRouter } from 'next/router';
import Link from 'next/link';
import { LoginProps } from '@/utils/types';
import Header from './Header';

interface LayoutProps extends LoginProps {
  children: React.ReactNode;
}

export default function Layout({ children, token, setToken }: LayoutProps) {
  const router = useRouter();
  
  if (!token) {
    return null; // Let the page component handle the redirect
  }

  return (
    <div className="min-h-screen bg-[#0F1421]">
      <Header />
      <div className="flex">
        {/* Left Navigation Menu */}
        <div className="w-64 min-h-[calc(100vh-180px)] bg-[#1A1F2E] border-r border-[#2D3548]">
          <nav className="mt-8 px-4">
            <div className="space-y-2">
              <Link 
                href="/wallet"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  router.pathname === '/wallet' 
                    ? 'bg-[#6851ff] text-white' 
                    : 'text-gray-300 hover:bg-[#6851ff]/50 hover:text-white'
                }`}
              >
                <svg 
                  className="w-5 h-5 mr-3" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M3 6h18M3 12h18M3 18h18"
                  />
                </svg>
                Wallet
              </Link>
              <Link
                href="/dashboard"
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                  router.pathname === '/dashboard' 
                    ? 'bg-[#6851ff] text-white' 
                    : 'text-gray-300 hover:bg-[#6851ff]/50 hover:text-white'
                }`}
              >
                <svg 
                  className="w-5 h-5 mr-3" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                Dashboard
              </Link>
            </div>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 px-8 py-6">
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
} 