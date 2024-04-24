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

export const HeaderComponent = () => {
  const { signIn, isPassportConnected } = useUserPassportContext();
  const [open, setOpen] = useState(false);
  const [showSigninMenu, setShowSigninMenu] = useState(false);
  const [walletConnected, setWalletConnected] = useState(false);

  return (
    <div className="bg-white flex w-full h-16 justify-between items-center pr-5 pl-5 pt-2.5 pb-2.5 border-b rounded-b-3xl border-b-[#0000001a]">
      <Link href="/">
        <div className="flex gap-1.5 items-center relative">
          <Image
            src={'/images/carbonvote.png'}
            width={30}
            height={30}
            alt={'Carbonvote'}
          />
          <Label className="text-red-600 text-2xl font-bold font-quicksand lg:block hidden">
            Carbonvote
          </Label>
          <Label className="text-red-400 italic font-thin">Beta</Label>
        </div>
      </Link>
      <div className="flex lg:gap-x-5 gap-[10px] items-center">
        {/* <Button className="outline-none h-10 items-center rounded-full" leftIcon={BoltIcon} onClick={signIn}>
          {isPassportConnected ? 'Zupass Connected' : 'Connect Passport'}
        </Button>
        <ConnectButton /> */}
        <Link href="/">
          <div className="gap-1.5 items-center relative lg:flex hidden">
            <Label className="text-base cursor-pointer">Docs</Label>
            <ArrowUpRight width={20} height={20} />
          </div>
        </Link>
        <Link
          href="https://github.com/EthereumCommunityFund/CarbonVote"
          target="_"
        >
          <div className="lg:flex hidden gap-1.5 items-center relative">
            <Label className="text-base cursor-pointer">GitHub</Label>
            <GithubIcon width={20} height={20} fill="black" />
          </div>
        </Link>
        <Link href="/">
          <div className="lg:flex hidden gap-1.5 items-center relative">
            <Label className="text-base cursor-pointer">Changelog</Label>
            <ArrowUpRight width={20} height={20} />
          </div>
        </Link>
        <Button
          className="w-10 h-10 rounded-full flex items-center justify-center lg:hidden"
          onClick={() => setOpen(!open)}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M3 5C3 4.73478 3.10536 4.48043 3.29289 4.29289C3.48043 4.10536 3.73478 4 4 4H16C16.2652 4 16.5196 4.10536 16.7071 4.29289C16.8946 4.48043 17 4.73478 17 5C17 5.26522 16.8946 5.51957 16.7071 5.70711C16.5196 5.89464 16.2652 6 16 6H4C3.73478 6 3.48043 5.89464 3.29289 5.70711C3.10536 5.51957 3 5.26522 3 5ZM3 10C3 9.73478 3.10536 9.48043 3.29289 9.29289C3.48043 9.10536 3.73478 9 4 9H16C16.2652 9 16.5196 9.10536 16.7071 9.29289C16.8946 9.48043 17 9.73478 17 10C17 10.2652 16.8946 10.5196 16.7071 10.7071C16.5196 10.8946 16.2652 11 16 11H4C3.73478 11 3.48043 10.8946 3.29289 10.7071C3.10536 10.5196 3 10.2652 3 10ZM3 15C3 14.7348 3.10536 14.4804 3.29289 14.2929C3.48043 14.1054 3.73478 14 4 14H16C16.2652 14 16.5196 14.1054 16.7071 14.2929C16.8946 14.4804 17 14.7348 17 15C17 15.2652 16.8946 15.5196 16.7071 15.7071C16.5196 15.8946 16.2652 16 16 16H4C3.73478 16 3.48043 15.8946 3.29289 15.7071C3.10536 15.5196 3 15.2652 3 15Z" fill="black" />
          </svg>
        </Button>
        <HeaderDropdown open={open} setOpen={setOpen}></HeaderDropdown>
        <div className='h-[40px]'>
          <Button
            className={"outline-none h-10 items-center rounded-full justify-center w-fit" + (walletConnected ? " p-0" : "")}
            leftIcon={walletConnected ? undefined : BoltIcon}
            onClick={() => setShowSigninMenu(!showSigninMenu)}
          >
            {
              walletConnected ? <div className='flex w-full px-1 items-center gap-[4px]'>
                {/* Image should be changed with avatar image of the account. */}
                <Image src="/images/zupass_login.svg" width={32} height={32} alt="avatar" className='rounded-full border border-collapse border-[#0000001A]' />
                <div className='mr-[4px]'>
                  Connected
                </div>
              </div> : "Sign in"
            }
          </Button>
          <SigninDropdown showMenu={showSigninMenu} setShowMenu={setShowSigninMenu} setWalletConnected={setWalletConnected} />
        </div>
        {/* <ConnectButton /> */}
      </div>
    </div>
  );
};

export default HeaderComponent;
