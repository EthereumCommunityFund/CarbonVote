import React, { useMemo } from 'react';
import { Label } from '@/components/ui/Label';
import { CheckCircleIcon } from '@/components/icons/checkcircle';
import { LockIcon } from '@/components/icons/lock';
import { CredentialTable } from '@/types';
import {
  getImagePathByCredential,
  isEthHoldingCredentialOnChain,
} from '@/utils/pollUtils';
import CredentialDetails from '@/components/poll/credential/CredentialDetails';
import Image from 'next/image';
import CredentialItemContainer from './CredentialItemContainer';
import { CREDENTIALS } from '@/src/constants';

interface CredentialItemProps {
  credential: CredentialTable;
  userAvailableCredentials: CredentialTable[];
  expandedIds: string[];
  setExpandedIds: React.Dispatch<React.SetStateAction<string[]>>;
  account?: string;
  userScore: number | string | undefined;
  endBlockNumber?: number;
  requiredGitScore?: number;
  poll: any;
  eventDetails: any[];
  setEventDetails: React.Dispatch<React.SetStateAction<any[]>>;
  customDetailContent?: React.ReactNode;
}

const CredentialItem: React.FC<CredentialItemProps> = ({
  credential,
  userAvailableCredentials,
  expandedIds,
  setExpandedIds,
  account,
  userScore,
  endBlockNumber,
  requiredGitScore,
  poll,
  eventDetails,
  setEventDetails,
  customDetailContent,
}) => {
  const imagePath = useMemo(
    () => getImagePathByCredential(credential.credential as string),
    [credential.credential]
  );

  const isAvailable = useMemo(() => {
    if (credential.id === CREDENTIALS.WhitelistedAddresses.id) {
      return (
        poll?.white_list &&
        Array.isArray(poll.white_list) &&
        account &&
        poll.white_list.some(
          (address: string) => address.toLowerCase() === account.toLowerCase()
        )
      );
    }

    if (userAvailableCredentials.length === 0) {
      return false;
    }

    return userAvailableCredentials.some(
      (credentialItem: CredentialTable) => credentialItem.id === credential.id
    );
  }, [userAvailableCredentials, credential.id, poll?.white_list, account]);

  const votedOptionData = useMemo(() => {
    if (userAvailableCredentials.length === 0) {
      return null;
    }

    return userAvailableCredentials.find((credentialItem: CredentialTable) => {
      const isRegularCredential = credentialItem.id === credential.id;

      const isEthOnChainCredential =
        isEthHoldingCredentialOnChain(credential) &&
        isEthHoldingCredentialOnChain(credentialItem);

      const hasVotedOption = !!credentialItem.votedOptionName;

      return (isRegularCredential || isEthOnChainCredential) && hasVotedOption;
    });
  }, [userAvailableCredentials, credential.id, credential.credential]);

  const credentialLabel = useMemo(
    () => (
      <Label className="">
        {imagePath && (
          <div className="flex items-center gap-[10px]">
            <Image
              src={imagePath}
              alt="Credential"
              className="image-class-name"
              width={24}
              height={24}
            />
            <span className="text-[14px] text-black font-[700] opacity-50">
              {credential.credential}
            </span>
          </div>
        )}
      </Label>
    ),
    [imagePath, credential.credential]
  );

  const statusIcon = useMemo(
    () =>
      isAvailable ? (
        <CheckCircleIcon className="w-[28px] h-[28px]" />
      ) : (
        <LockIcon className="w-[28px] h-[28px] text-black opacity-20" />
      ),
    [isAvailable]
  );

  const detailContent = useMemo(() => {
    if (customDetailContent) {
      return (
        <>
          <CredentialDetails
            credentialName={credential.credential as string}
            account={account}
            userAvailableCredentials={userAvailableCredentials}
            userScore={userScore || 0}
            endBlockNumber={endBlockNumber}
            requiredGitScore={requiredGitScore}
            poll={poll}
            eventDetails={eventDetails}
            setEventDetails={setEventDetails}
          />
          {customDetailContent}
        </>
      );
    }

    return (
      <CredentialDetails
        credentialName={credential.credential as string}
        account={account}
        userAvailableCredentials={userAvailableCredentials}
        userScore={userScore || 0}
        endBlockNumber={endBlockNumber}
        requiredGitScore={requiredGitScore}
        poll={poll}
        eventDetails={eventDetails}
        setEventDetails={setEventDetails}
      />
    );
  }, [
    account,
    credential.credential,
    customDetailContent,
    endBlockNumber,
    eventDetails,
    poll,
    requiredGitScore,
    setEventDetails,
    userAvailableCredentials,
    userScore,
  ]);

  const footer = useMemo(() => {
    return (
      votedOptionData && (
        <div className="flex items-center gap-[5px]">
          <span className="font-[600]">Voted:</span>
          <span className="text-black/60">
            {votedOptionData.votedOptionName}
          </span>
        </div>
      )
    );
  }, [votedOptionData]);

  return (
    <CredentialItemContainer
      id={credential.id}
      expandedIds={expandedIds}
      setExpandedIds={setExpandedIds}
      label={credentialLabel}
      statusIcon={statusIcon}
      detailContent={detailContent}
      footer={footer}
    />
  );
};

export default React.memo(CredentialItem);
