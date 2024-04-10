import Link from 'next/link'
import { useUserPassportContext } from '@/context/PassportContext';
import Button from './ui/buttons/Button';
import Image from 'next/image';
import { Label } from './ui/Label';
import { BoltIcon } from './icons';
import { ArrowUpRight, GithubIcon } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';


export const HeaderComponent = () => {
  const { signIn, isPassportConnected } = useUserPassportContext();

  return (
    <div className="bg-white flex w-full h-16 justify-between items-center pr-5 pl-5 pt-2.5 pb-2.5 border-b rounded-b-3xl border-b-[#0000001a]">
      <Link href="/">
        <div className="flex gap-1.5 items-center relative">
          <Image src={'/images/carbonvote.png'} width={30} height={30} alt={'Carbonvote'} />
          <Label className="text-red-600 text-2xl font-bold font-quicksand">Carbonvote</Label>
          <Label className="text-red-400 italic font-thin">Beta</Label>
        </div>
      </Link>
      <div className="flex gap-x-5 items-center">
        {/* <Button className="outline-none h-10 items-center rounded-full" leftIcon={BoltIcon} onClick={signIn}>
          {isPassportConnected ? 'Zupass Connected' : 'Connect Passport'}
        </Button>
        <ConnectButton /> */}
        <Link href="/">
          <div className="flex gap-1.5 items-center relative">
            <Label className="text-base">Docs</Label>
            <ArrowUpRight width={20} height={20} />
          </div>
        </Link>
        <Link href="/">
          <div className="flex gap-1.5 items-center relative">
            <Label className="text-base">GitHub</Label>
            <GithubIcon width={20} height={20} fill='black' />
          </div>
        </Link>
        <Link href="/">
          <div className="flex gap-1.5 items-center relative">
            <Label className="text-base">Changelog</Label>
            <ArrowUpRight width={20} height={20} />
          </div>
        </Link>
        <Button className="outline-none h-10 items-center rounded-full" leftIcon={BoltIcon}>Sign In</Button>
      </div>
    </div>
  );
};

export default HeaderComponent;