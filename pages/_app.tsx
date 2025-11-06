require('dotenv').config();
import { HomePageProvider } from '../components/HomePageProvider';
import { UserPassportContextProvider } from '../context/PassportContext';
import { WalletProvider } from '../context/WalletContext';
import type { AppProps } from 'next/app';
import { Toaster } from '@/components/ui/toaster';
import { useState } from 'react';
import { useEffect } from 'react';
import { NotificationBar } from '@/components/NotificationBar';
import '../styles/globals.css';
export default function App({ Component, pageProps }: AppProps) {
  const [showNotification, setShowNotification] = useState(true);

  const handleClose = () => {
    setShowNotification(false);
  };

  return (
    <UserPassportContextProvider>
      <WalletProvider>
        <HomePageProvider props={pageProps}>
          <div suppressHydrationWarning>
            {showNotification && <NotificationBar onClose={handleClose} />}
            <Component {...pageProps} />
            <Toaster />
          </div>
        </HomePageProvider>
      </WalletProvider>
    </UserPassportContextProvider>
  );
}
