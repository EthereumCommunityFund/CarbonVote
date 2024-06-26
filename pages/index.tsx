import Image from "next/image";
import { Inter } from "next/font/google";
import { useEffect } from "react";
const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.href = "https://beta.carbonvote.com";
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  return (
    <main
      className={`gradient-background flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="relative flex place-items-center flex-col before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]">
        <Image
          // className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
          src="/CVLogo.png"
          alt="Carbon Vote Logo"
          width={180}
          height={37}
          priority
        />
        <div className="m-10 bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t lg:static lg:h-auto lg:w-auto lg:bg-none">
          Version 2.0 is now available in beta. You will be redirected in 3
          seconds.
        </div>
      </div>
      <footer className="text-center text-sm text-gray-600 py-4 w-full">
        Made with ❤️ and ☕️ by Zuzalu & ECF Network Builders
      </footer>
    </main>
  );
}
