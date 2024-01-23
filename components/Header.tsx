import { useState } from 'react';
import Link from 'next/link'
import { useUserPassportContext } from '@/context/PassportContext';
import Button from './ui/buttons/Button';
import Image from 'next/image';
import { Label } from './ui/Label';
import { BoltIcon } from './icons';
import { useWallet } from '@/context/WalletContext';

export const HeaderComponent = () => {
  const { signIn, isPassportConnected } = useUserPassportContext();
  const { connectToMetamask, account, isConnected } = useWallet();
  const [isHovered, setIsHovered] = useState(false);

  const formattedAddy = account?.slice(0, 4) + '...' + account?.slice(-4)
  return (
    <div className="bg-white flex w-full h-16 justify-between items-center p-5">
      <Link href="/">
        <div className="flex gap-1.5 items-center">
          <Image src={'/images/carbonvote.png'} width={30} height={30} alt={'Carbonvote'} />
          <Label className="text-red-600 text-lg">Carbonvote</Label>
          <Label className="text-red-400 text-lg italic font-thin">beta</Label>
        </div>
      </Link>
      <div className="flex gap-1.5 items-center">
        <Button className="outline-none h-10 items-center rounded-full" leftIcon={BoltIcon} onClick={signIn}>
          {isPassportConnected ? 'Zupass Connected' : 'Connect Passport'}
        </Button>
        {isConnected ?
          // FIXME: Add disconnect function
          <Button className={`outline-none h-10 items-center rounded-full`} onClick={connectToMetamask}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {isHovered ? "Disconnect" : formattedAddy}
          </Button>
          :
          <Button className="outline-none h-10 items-center rounded-full" onClick={connectToMetamask}>
            Connect Wallet
          </Button>
        }
      </div>
    </div>
  );
};

export default HeaderComponent;