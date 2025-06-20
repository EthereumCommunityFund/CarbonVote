import { useState, useRef } from 'react';
import { useUserPassportContext } from '@/context/PassportContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Button from './buttons/Button';
import Image from 'next/image';
import { useDisconnect } from 'wagmi';
import { Z_INDEX_MAP } from '@/styles/styleConstants';
import { Menu, MenuItem, Divider } from '@mui/material';
import { BoltIcon } from '../icons';
import { useAccount } from 'wagmi';

export default function SigninDropdown() {
  const { signIn, signOut } = useUserPassportContext();
  const { disconnect } = useDisconnect();
  const { isConnected } = useAccount();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleZupassSigninButton = () => {
    signIn();
    handleClose();
  };

  const handleDisconnect = () => {
    disconnect();
    signOut();
    handleClose();
  };

  return (
    <>
      <Button
        className={
          'outline-none h-10 items-center rounded-full justify-center w-fit' +
          (isConnected ? ' p-0' : '')
        }
        leftIcon={isConnected ? undefined : <BoltIcon />}
        onClick={handleClick}
        aria-controls={open ? 'signin-menu' : undefined}
        aria-haspopup="true"
        aria-expanded={open ? 'true' : undefined}
      >
        {isConnected ? (
          <div className="flex w-full px-1 items-center gap-[4px]">
            <Image
              src="/images/zupass_login.svg"
              width={32}
              height={32}
              alt="avatar"
              className="rounded-full border border-collapse border-[#0000001A]"
            />
            <div className="mr-[4px]">Connected</div>
          </div>
        ) : (
          'Sign in'
        )}
      </Button>

      <Menu
        id="signin-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        sx={{
          zIndex: Z_INDEX_MAP.dropdown,
          '& .MuiPaper-root': {
            minWidth: '200px',
            borderRadius: '12px',
            boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            marginTop: '10px',
            padding: '8px',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            const ready = mounted && authenticationStatus !== 'loading';
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === 'authenticated');

            const handleConnectWalletButton = () => {
              openConnectModal();
              handleClose();
            };

            const handleAddressClick = () => {
              openAccountModal();
              handleClose();
            };

            return (
              <MenuItem
                disableRipple
                sx={{
                  padding: 0,
                  '&:hover': { backgroundColor: 'transparent' },
                  outline: 'none',
                }}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <div
                        className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors duration-200 w-full"
                        onClick={handleConnectWalletButton}
                      >
                        <Image
                          src="/images/wallet.svg"
                          width={24}
                          height={24}
                          alt="wallet"
                        />
                        <span className="font-semibold text-gray-800 text-sm">
                          Connect Wallet
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      onClick={handleAddressClick}
                      className="w-full p-3 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors duration-200"
                    >
                      <div className="w-full flex items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-400 to-purple-500"></div>
                          <span className="font-semibold text-gray-800 text-sm">
                            {account.displayName
                              ? account.displayName
                              : account.address}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </MenuItem>
            );
          }}
        </ConnectButton.Custom>

        <MenuItem
          disableRipple
          sx={{
            padding: 0,
            '&:hover': { backgroundColor: 'transparent' },
            outline: 'none',
          }}
        >
          <div
            className="flex items-center gap-3 p-3 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors duration-200 w-full"
            onClick={handleZupassSigninButton}
          >
            <Image
              src="/images/zupass_login.svg"
              width={24}
              height={24}
              alt="avatar"
            />
            <span className="font-semibold text-gray-800 text-sm">
              Zupass Login
            </span>
          </div>
        </MenuItem>

        <ConnectButton.Custom>
          {({ account }) => {
            if (account) {
              return (
                <>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem
                    disableRipple
                    sx={{
                      padding: 0,
                      '&:hover': { backgroundColor: 'transparent' },
                      outline: 'none',
                    }}
                  >
                    <div
                      className="flex items-center gap-3 p-3 rounded-xl cursor-pointer bg-red-50 hover:bg-red-100 transition-colors duration-200 w-full"
                      onClick={handleDisconnect}
                    >
                      <Image
                        src="/images/disconnect.svg"
                        width={24}
                        height={24}
                        alt="disconnect"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '/images/zupass_login.svg'; // 备用图片
                        }}
                      />
                      <span className="font-semibold text-red-600 text-sm">
                        Disconnect
                      </span>
                    </div>
                  </MenuItem>
                </>
              );
            }
            return null;
          }}
        </ConnectButton.Custom>
      </Menu>
    </>
  );
}
