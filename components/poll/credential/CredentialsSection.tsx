import React from 'react';
import { Label } from '@/components/ui/Label';
import { CheckCircleIcon } from '@/components/icons/checkcircle';
import { CheckIcon } from 'lucide-react';
import { CREDENTIALS } from '@/src/constants';
import { CredentialTable, Poll } from '@/types';
import { Skeleton } from '@mui/material';
import ZupassSection from './ZupassSection';
import CredentialItem from './CredentialItem';
import WhitelistDetailContent from '@/components/poll/credential/WhitelistDetailContent';

export interface CredentialsSectionProps {
  pollIsLive: boolean;
  credentialTable: CredentialTable[];
  userAvailableCredentials: CredentialTable[];
  expandedIds: string[];
  setExpandedIds: React.Dispatch<React.SetStateAction<string[]>>;
  zupasspoll: boolean;
  isPassportConnected: boolean;
  signIn: () => void;
  handleZupassConnect: (credentialId: string) => void;
  account?: string;
  userScore: number | string | undefined;
  endBlockNumber?: number;
  requiredGitScore?: number;
  poll: Poll | null;
  eventDetails: any[];
  setEventDetails: React.Dispatch<React.SetStateAction<any[]>>;
  isLoading?: boolean;
  isUserDataFetched: boolean;
  userHasVoted: boolean;
}

const LoadingSkeleton = () => (
  <div className="flex flex-col bg-white rounded-lg border border-black border-opacity-10 animate-pulse">
    <div className="px-5 py-2.5 border-b border-black border-opacity-10">
      <Skeleton variant="rounded" width="70%" height={28} />
    </div>
    <div className="flex flex-col p-3.5 gap-2.5">
      <div className="flex gap-2.5 items-center">
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="rounded" width="80%" height={20} />
      </div>
      <div className="flex flex-col p-2.5 gap-2.5 bg-gray-100 rounded-lg mt-2">
        <div className="flex justify-between items-center">
          <Skeleton variant="rounded" width="40%" height={24} />
          <Skeleton variant="circular" width={28} height={28} />
        </div>
        <Skeleton variant="rounded" width="100px" height={20} />
        <Skeleton variant="rounded" width="100%" height={60} />
      </div>
      {[1, 2, 3, 4].map((_, index) => {
        return (
          <div
            key={index}
            className="flex flex-col p-2.5 gap-2.5 bg-gray-100 rounded-lg mt-2"
          >
            <div className="flex justify-between items-center">
              <Skeleton variant="rounded" width="50%" height={24} />
              <Skeleton variant="circular" width={28} height={28} />
            </div>
            <Skeleton variant="rounded" width="100px" height={20} />
          </div>
        );
      })}
    </div>
  </div>
);

const CredentialsSection: React.FC<CredentialsSectionProps> = ({
  pollIsLive,
  credentialTable,
  userAvailableCredentials,
  expandedIds,
  setExpandedIds,
  zupasspoll,
  isPassportConnected,
  signIn,
  handleZupassConnect,
  account,
  userScore,
  endBlockNumber,
  requiredGitScore,
  poll,
  eventDetails,
  setEventDetails,
  isLoading,
  isUserDataFetched,
  userHasVoted,
}) => {
  if ((isLoading && !isUserDataFetched) || credentialTable.length === 0) {
    return <LoadingSkeleton />;
  }

  const safeCredentialTable = credentialTable || [];

  const nonZupassCredentials = safeCredentialTable.filter(
    // hide solo staker, 2025.05.01
    (credential) =>
      ![
        CREDENTIALS.DevConnect.id,
        CREDENTIALS.ZuConnectResident.id,
        CREDENTIALS.ZuzaluResident.id,
        CREDENTIALS.EthSoloStaker.id,
        CREDENTIALS.ProtocolGuildMember.id,
        CREDENTIALS.EthSoloStaker.id,
      ].includes(credential.id)
  );

  return (
    <div className="relative flex flex-col bg-white rounded-lg border border-black border-opacity-10">
      <div className="px-5 py-2.5 border-b border-black border-opacity-10">
        <Label className="text-lg">Your Available Credentials</Label>
      </div>

      <div className="flex flex-col p-3.5 gap-2.5">
        {userHasVoted && (
          <div className="flex items-center justify-center px-[14px] py-[10px] bg-black text-white rounded-md text-sm font-semibold">
            <CheckIcon className="w-[20px] h-[20px]" />
            <span className="ml-[10px]">You Have Voted</span>
          </div>
        )}
        <div className="flex gap-2.5 text-black opacity-60">
          <CheckCircleIcon className="w-6 h-6" />
          <Label className="text-sm">
            You can vote with any of the credentials below
          </Label>
        </div>

        {/* Zupass credentials */}
        <ZupassSection
          credentialTable={safeCredentialTable}
          userAvailableCredentials={userAvailableCredentials || []}
          expandedIds={expandedIds}
          setExpandedIds={setExpandedIds}
          zupasspoll={zupasspoll}
          isPassportConnected={isPassportConnected}
          signIn={signIn}
          handleZupassConnect={handleZupassConnect}
        />

        {/* non Zupass credentials */}
        {nonZupassCredentials.map((credential) => (
          <CredentialItem
            key={credential.id}
            credential={credential}
            userAvailableCredentials={userAvailableCredentials || []}
            expandedIds={expandedIds}
            setExpandedIds={setExpandedIds}
            account={account}
            userScore={userScore}
            endBlockNumber={endBlockNumber}
            requiredGitScore={requiredGitScore}
            poll={poll}
            eventDetails={eventDetails}
            setEventDetails={setEventDetails}
            customDetailContent={
              credential.id === CREDENTIALS.WhitelistedAddresses.id ? (
                <WhitelistDetailContent poll={poll ?? null} />
              ) : undefined
            }
          />
        ))}
      </div>
    </div>
  );
};

export default CredentialsSection;
