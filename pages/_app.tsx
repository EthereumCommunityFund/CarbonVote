import { UserPassportContextProvider } from "../context/PassportContext";

import type { AppProps } from "next/app";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserPassportContextProvider>
      <Component {...pageProps} />
    </UserPassportContextProvider>
  );
}
