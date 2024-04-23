import { useUserPassportContext } from "@/context/PassportContext";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import Button from "./buttons/Button";
import { Dispatch, SetStateAction, useEffect } from "react";
import Image from "next/image";

interface SigninDropDownPropTypes {
    showMenu: boolean;
    setShowMenu: Dispatch<SetStateAction<boolean>>;
    setWalletConnected: Dispatch<SetStateAction<boolean>>;
}

export default function SigninDropdown({ showMenu, setShowMenu, setWalletConnected }: SigninDropDownPropTypes) {

    const { signIn } = useUserPassportContext()

    const handleZupassSigninButton = () => {
        signIn();
        setShowMenu(false);
    }

    return (
        showMenu ? <div className="absolute w-fit p-[10px] z-10 right-5 mt-[20px] rounded-[10px] border border-collapse border-[#0000001A] bg-[#FFFFFFCC] backdrop-blur-[20px]">
            <ConnectButton.Custom>
                {
                    ({
                        account,
                        chain,
                        openAccountModal,
                        openChainModal,
                        openConnectModal,
                        authenticationStatus,
                        mounted,
                    }) => {
                        const ready = mounted && authenticationStatus !== 'loading';
                        const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === 'authenticated');

                        const handleConnectWalletButton = () => {
                            openConnectModal();
                            setShowMenu(false);
                        }

                        const handleAddressClick = () => {
                            openAccountModal();
                            setShowMenu(false);
                        }

                        useEffect(() => {
                            if(account?.address) {
                                setWalletConnected(true);
                            }
                        }, [account])

                        return (
                            <div
                                className="box-border w-full"
                            >
                                {
                                    (() => {
                                        if (!connected) {
                                            return (
                                                <Button className="rounded-[12px] bg-transparent border border-collapse border-[#0000001A] w-full flex justify-center" onClick={handleConnectWalletButton}>
                                                    Connect Wallet
                                                </Button>
                                            )
                                        }

                                        if (chain.unsupported) {
                                            return (
                                                <button onClick={openChainModal} type="button" >
                                                    Wrong network
                                                </button>
                                            )
                                        }

                                        return (
                                            <div className="flex gap-3 w-full">
                                                <div className="flex flex-col items-center shadow-md w-full rounded-[10px] box-border">
                                                    <div>
                                                        {
                                                            account.displayBalance ? ` (${account.displayBalance})` : '0' + (account.balanceSymbol ?? " ETH")
                                                        }
                                                    </div>
                                                    <div onClick={handleAddressClick} className=" justify-center w-full p-[10px]">
                                                        <div className="w-full bg-[#e5e5e5] py-2 flex justify-center rounded-[10px]">
                                                            {account.displayName ? account.displayName : account.address}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })()
                                }
                            </div>
                        )
                    }
                }
            </ConnectButton.Custom>
            <div className="h-[1px] w-full bg-[#00000044] my-[10px]"></div>
            <div className="flex items-center gap-[10px] p-[10px]" onClick={handleZupassSigninButton}>
                <Image src="/images/zupass_login.svg" width={24} height={24} alt="avatar"/>
                <span>Zupass Login</span>
            </div>
        </div>
            : <></>
    )
}