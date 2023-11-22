import { HomePageProvider } from "../components/HomePageProvider";
import { UserPassportContextProvider } from "../context/PassportContext";

import type { AppProps } from "next/app";

import "../styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserPassportContextProvider>
      <HomePageProvider props={pageProps}>
        <Component {...pageProps} />
      </HomePageProvider>
    </UserPassportContextProvider>
  );
}
