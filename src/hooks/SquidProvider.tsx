import { Squid } from "@0xsquid/sdk";
import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { initializeEthereumTokens } from "@/utils/tokens";
import { Token } from "@0xsquid/squid-types";

type SquidContextType = {
  squid: Squid | null;
  isLoading: boolean;
  error: Error | null;
  tokens: Token[];
};

const SquidContext = createContext<SquidContextType>({
  squid: null,
  isLoading: true,
  error: null,
  tokens: [],
});

export const useSquid = () => useContext(SquidContext);

interface SquidProviderProps {
  children: ReactNode;
}

const SquidProvider = ({ children }: SquidProviderProps) => {
  const [squid, setSquid] = useState<Squid | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [tokens, setTokens] = useState<Token[]>([]);

  useEffect(() => {
    const initSquid = async () => {
      try {
        const squidInstance = new Squid({
          baseUrl: process.env.NEXT_PUBLIC_SQUID_BASE_URL || 'https://testnet.api.squidrouter.com',
          integratorId: process.env.NEXT_PUBLIC_SQUID_INTEGRATOR_ID || 'your-integrator-id',
        });

        await squidInstance.init();
        console.log('Squid initialized successfully');

        // Get tokens list
        const tokenList = squidInstance.tokens;
        if (Array.isArray(tokenList)) {
          setTokens(tokenList);
          initializeEthereumTokens(tokenList);
        }
        setSquid(squidInstance);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize Squid:', err);
        setError(err as Error);
        setIsLoading(false);
      }
    };

    initSquid();
  }, []);

  return (
    <SquidContext.Provider value={{ squid, isLoading, error, tokens }}>
      {children}
    </SquidContext.Provider>
  );
};

export default SquidProvider; 