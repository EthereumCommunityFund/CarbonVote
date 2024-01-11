require('dotenv').config();
import { HomePageProvider } from '../components/HomePageProvider';
import { UserPassportContextProvider } from '../context/PassportContext';
import { WalletProvider } from '../context/WalletContext';
import type { AppProps } from 'next/app';
import '../styles/globals.css';
import '../styles/quill.css';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from 'react-query';
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <UserPassportContextProvider>
        <WalletProvider>
          <HomePageProvider props={pageProps}>
            <Component {...pageProps} />
            <Toaster />
          </HomePageProvider>
        </WalletProvider>
      </UserPassportContextProvider>
    </QueryClientProvider>
  );
}