import React, { useMemo } from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { CheckCircleIconWhite } from '@/components/icons/checkcirclewhite';
import TruncateText from '@/components/TruncateText';
import PoapDetails from '@/components/POAPDetails';
import { CREDENTIALS } from '@/src/constants';
import { CredentialTable } from '@/types';
import Button from '@/components/ui/buttons/Button';
import { CardHolderIcon } from '@/components/icons';
import ConnectButton from './ConnectButton';

interface CredentialDetailsProps {
  credentialName: string;
  account: string | undefined;
  userAvailableCredentials: CredentialTable[];
  userScore: number | string;
  endBlockNumber?: number;
  requiredGitScore?: number;
  poll: any;
  eventDetails: any[];
  setEventDetails: React.Dispatch<React.SetStateAction<any[]>>;
}

const CredentialDetails = ({
  credentialName,
  account,
  userAvailableCredentials,
  userScore,
  endBlockNumber,
  requiredGitScore,
  poll,
  eventDetails,
  setEventDetails,
}: CredentialDetailsProps) => {
  return useMemo(() => {
    switch (credentialName) {
      case 'EthHolding on-chain':
        return (
          <>
            <div>Need to have an Ethereum address</div>
            <div>Poll end block: {endBlockNumber}</div>
            <div className="flex">
              {account ? (
                <div className="flex items-center gap-[4px] rounded-full h-[28px] px-[8px]  bg-black text-white text-[13px] leading-[1.4] font-[500]">
                  <TruncateText text={account} maxLength={15} />
                  <CheckCircleIconWhite className="text-white w-[20px]" />
                </div>
              ) : (
                <ConnectButton />
              )}
            </div>
          </>
        );

      case CREDENTIALS.EthHoldingOffchain.name:
        return (
          <>
            <div className="text-sm bg-[#f9f9f9] border border-[#ccc] rounded-md px-[10px] py-[4px]">
              All voting is off-chain and does not require you to pay any
              transaction fees.
            </div>
            <div className="text-[13px] text-black/50 leading-[140%]">
              Need to have an Ethereum address
            </div>
            {/* <div className="text-[13px] text-black/50 leading-[140%]">
              Poll end block: {endBlockNumber}
            </div> */}
            <div className="flex">
              {account ? (
                <div className="flex items-center gap-[4px] rounded-full h-[28px] px-[8px]  bg-black text-white text-[13px] leading-[1.4] font-[500]">
                  <TruncateText text={account} maxLength={15} />
                  <CheckCircleIconWhite className="text-white w-[20px]" />
                </div>
              ) : (
                <ConnectButton />
              )}
            </div>
          </>
        );

      case CREDENTIALS.GitcoinPassport.name:
        const hasScore = userAvailableCredentials.some(
          (credentialItem) =>
            credentialItem.id === CREDENTIALS.GitcoinPassport.id
        );

        return (
          <>
            <div className="text-[13px] text-black/50 leading-[140%]">
              Minimum score required: {requiredGitScore}
            </div>
            <div className="">{account ? userScore : <ConnectButton />}</div>
          </>
        );

      case CREDENTIALS.POAPapi.name:
        const hasPoaps = userAvailableCredentials.some(
          (credentialItem) => credentialItem.id === CREDENTIALS.POAPapi.id
        );
        return (
          <>
            <div className="text-[13px] text-black/50 leading-[140%]">
              Need to have a minimum of {poll?.poap_number} POAPs
            </div>
            <div className="flex flex-wrap gap-[5px]">
              {account ? (
                <PoapDetails
                  poapEvents={poll?.poap_events as number[]}
                  account={account as string}
                  eventDetails={eventDetails}
                  setEventDetails={setEventDetails}
                />
              ) : (
                <ConnectButton />
              )}
            </div>
          </>
        );

      case CREDENTIALS.EthSoloStaker.name:
        const isStaker = userAvailableCredentials.some(
          (credentialItem) => credentialItem.id === CREDENTIALS.EthSoloStaker.id
        );
        return (
          <>
            <div className="text-[13px] text-black/50 leading-[140%]">
              Need to be a valid Solo Staker
            </div>
            <div>
              <p className="text-black font-['Inter'] text-[13px] font-normal leading-[140%] tracking-[0.13px] opacity-50 mb-[10px]">
                <a
                  href="https://github.com/starknet-io/provisions-data/tree/main/eth"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'blue', textTransform: 'uppercase' }}
                >
                  SOURCE LINK
                </a>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm">
                {account ? (
                  isStaker ? (
                    <div className="flex items-center gap-[10px] bg-black text-white rounded-[50px] py-[7px] px-[10px] font-['Inter'] text-[14px] font-[500]">
                      Ether Solo Staker
                      <CheckCircleIconWhite className="text-white w-[20px]" />
                    </div>
                  ) : (
                    <span className="text-[13px] text-black/50 leading-[140%]">
                      You are not a valid solo staker
                    </span>
                  )
                ) : (
                  <ConnectButton />
                )}
              </div>
            </div>
          </>
        );

      case CREDENTIALS.WhitelistedAddresses.name:
        const isAddressInWhitelist =
          poll?.white_list && Array.isArray(poll.white_list) && account
            ? poll.white_list.some(
                (address: string) =>
                  address.toLowerCase() === account.toLowerCase()
              )
            : false;

        return (
          <>
            <div className="text-[13px] text-black/50 leading-[140%]">
              Your address needs to be part of this whitelist
            </div>
            <div className="flex">
              {account ? (
                isAddressInWhitelist ? (
                  <div className="flex items-center gap-[4px] rounded-full h-[28px] px-[8px] bg-black text-white text-[13px] leading-[1.4] font-[500]">
                    <TruncateText text={account} maxLength={15} />
                    <CheckCircleIconWhite className="text-white w-[20px]" />
                  </div>
                ) : (
                  <div className="text-[13px] text-red-500 leading-[140%]">
                    Your address is not in the whitelist
                  </div>
                )
              ) : (
                <ConnectButton />
              )}
            </div>
          </>
        );
      default:
        return null;
    }
  }, [
    credentialName,
    account,
    userAvailableCredentials,
    userScore,
    endBlockNumber,
    requiredGitScore,
    poll,
    eventDetails,
    setEventDetails,
  ]);
};

export default CredentialDetails;
