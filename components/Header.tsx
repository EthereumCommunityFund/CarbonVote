import Link from 'next/link';
import { useUserPassportContext } from '@/context/PassportContext';
import Button from './ui/buttons/Button';
import Image from 'next/image';
import { Label } from './ui/Label';
import { BoltIcon } from './icons';
import { ArrowUpRight, GithubIcon } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import HeaderDropdown from './ui/HeaderDropdown';
import { useState } from 'react';
import SigninDropdown from './ui/SigninDropdown';
import { useAccount } from 'wagmi';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export const HeaderComponent = () => {
  const { signIn, isPassportConnected } = useUserPassportContext();
  const [open, setOpen] = useState(false);

  const { isConnected } = useAccount();

  return (
    <div className="bg-white flex w-full justify-between items-center p-[10px_20px] border-b rounded-b-[20px] border-[#0000001a] backdrop-blur-[10px]">
      <Link href="/">
        <div className="flex gap-1.5 items-center relative">
          <Image
            src={'/images/carbonvote.png'}
            width={40}
            height={40}
            alt={'Carbonvote'}
          />
          <Label className="text-[#F74949] text-2xl font-bold font-quicksand lg:block hidden">
            Carbonvote
          </Label>
          <Label className="text-[#FF6E6E] italic text-[14px] font-thin">
            Beta
          </Label>
        </div>
      </Link>
      <div className="flex lg:gap-x-5 gap-[10px] items-center">
        <Link
          href="https://github.com/EthereumCommunityFund/CarbonVote"
          target="_"
        >
          <div className="lg:flex hidden gap-1.5 items-center relative opacity-60">
            <Label className="text-base font-[500] cursor-pointer">
              GitHub
            </Label>
            <GithubIcon width={20} height={20} fill="black" />
          </div>
        </Link>
        <Link href="https://ecf-dev.gitbook.io/carbonvote" target="_">
          <div className="lg:flex hidden gap-1.5 items-center relative opacity-60">
            <Label className="text-base font-[500] cursor-pointer">
              Changelog
            </Label>
            <ArrowUpRight width={20} height={20} />
          </div>
        </Link>

        <HeaderDropdown />

        <SigninDropdown />
        {/* <ConnectButton /> */}
      </div>
    </div>
  );
};

export default HeaderComponent;
