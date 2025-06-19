import React, { useCallback, useMemo } from 'react';
import { toast } from '@/components/ui/use-toast';
import Image from 'next/image';
import { HiArrowRight } from 'react-icons/hi';
import { CredentialTable, SelectedOptionData, Poll } from '@/types';
import { getImagePathByCredential } from '@/utils/pollUtils';
import { cn } from '@/styles/cn';
import Modal from '@/components/ui/Modal';
import { VoteCheckIcon, XIcon } from '@/components/icons';
import Button from '@/components/ui/buttons/Button';

interface CredentialItemProps {
  credential: CredentialTable;
  credentialDetail: CredentialTable | undefined;
  isAvailable: boolean;
  isSelected: boolean;
  onSelectCredential: (id: string) => void;
}

const CredentialItem: React.FC<CredentialItemProps> = ({
  credential,
  credentialDetail,
  isAvailable,
  isSelected,
  onSelectCredential,
}) => {
  const imagePath = getImagePathByCredential(credential.credential as string);

  return (
    <div className="w-full relative">
      <div
        onClick={() => isAvailable && onSelectCredential(credential.id)}
        className={cn(
          'flex items-center justify-between w-full p-[10px] rounded-[10px] gap-[10px] border border-black/10',
          'bg-transparent hover:bg-[rgba(0,0,0,0.1)]',
          !isAvailable ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'
        )}
      >
        <div className="flex items-center gap-[10px]">
          {imagePath && (
            <Image src={imagePath} alt="Credential" width={20} height={20} />
          )}
          <span className="font-[700] text-[14px] leading-[1.4] text-black/50">
            {credential.credential}
            {credentialDetail &&
              credentialDetail.votedOptionName &&
              ` (Voted: ${credentialDetail.votedOptionName})`}
          </span>
        </div>
        <div
          className={cn(
            'w-[30px] h-[30px] flex items-center justify-center rounded-[5px]',
            isSelected ? 'bg-black' : 'bg-[#F5F5F5]'
          )}
        >
          <div className={isSelected ? '' : 'opacity-10'}>
            <VoteCheckIcon color={isSelected ? 'white' : 'black'} />
          </div>
        </div>
      </div>
    </div>
  );
};

interface VotingPopupProps {
  selectedOptionData: SelectedOptionData | undefined;
  credentialTable: CredentialTable[];
  userAvailableCredentials: CredentialTable[];
  voteTable: string[];
  handleVotesRadioChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectAllClick: () => void;
  setShowConfirmationPopup: React.Dispatch<React.SetStateAction<boolean>>;
  initializeVoting: (
    selectedOptionData: SelectedOptionData,
    voteTable: string[]
  ) => void;
  castVoteFlow: (
    selectedOptionData: SelectedOptionData,
    voteTable: string[]
  ) => Promise<void>;
  isOpen: boolean;
  onClose: () => void;
  poll: Poll | null;
  account?: string;
}

const VotingPopup: React.FC<VotingPopupProps> = ({
  selectedOptionData,
  credentialTable,
  userAvailableCredentials,
  voteTable,
  handleVotesRadioChange,
  handleSelectAllClick,
  setShowConfirmationPopup,
  initializeVoting,
  castVoteFlow,
  isOpen,
  onClose,
  poll,
  account,
}) => {
  const currentSelectedOptionName = selectedOptionData?.option_description;

  const isVoteActive = !!selectedOptionData && voteTable.length > 0;

  const handleCredentialSelect = useCallback(
    (credentialId: string) => {
      const event = {
        target: {
          value: credentialId,
          checked: !voteTable.includes(credentialId),
        },
      } as React.ChangeEvent<HTMLInputElement>;

      handleVotesRadioChange(event);
    },
    [voteTable, handleVotesRadioChange]
  );

  const isCredentialAvailable = useCallback(
    (credential: CredentialTable) => {
      const credentialDetail = userAvailableCredentials.find(
        (item: CredentialTable) => item.id === credential.id
      );

      return (
        !!credentialDetail &&
        (!credentialDetail.votedOption ||
          credentialDetail.votedOptionName !== currentSelectedOptionName)
      );
    },
    [userAvailableCredentials, currentSelectedOptionName]
  );

  const getCredentialDetail = useCallback(
    (credentialId: string) => {
      return userAvailableCredentials.find(
        (item: CredentialTable) => item.id === credentialId
      );
    },
    [userAvailableCredentials]
  );

  const handleVoteClick = useCallback(async () => {
    if (!isVoteActive) {
      toast({
        title: 'Error',
        description: `Please check the credentials card, you haven't choose any available credential.`,
        variant: 'destructive',
      });
      return;
    }
    onClose();
    setShowConfirmationPopup(true);
    initializeVoting(selectedOptionData, voteTable);
  }, [
    initializeVoting,
    isVoteActive,
    onClose,
    selectedOptionData,
    setShowConfirmationPopup,
    voteTable,
  ]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeOnOutsideClick={false}
      contentClassName="p-0 gap-0"
    >
      <div className="flex justify-between items-start p-[14px] border-b border-black/10">
        <div className="flex flex-col gap-[5px]">
          <p className="text-[16px] font-[700] leading-[1.25] text-black">
            Vote
          </p>
          <p className="text-[13px] font-[500] leading-[20px] text-black/60">
            You are voting:{' '}
            <span className="text-[14px] font-[400] leading-[1.6] text-black">
              {selectedOptionData ? selectedOptionData.option_description : ''}
            </span>
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-[34px] h-[34px] rounded-full bg-black/10 opacity-70 flex items-center justify-center hover:bg-black/30"
        >
          <XIcon width={20} height={20} />
        </button>
      </div>

      <div className="p-[20px] flex flex-col items-center gap-[20px]">
        <p className="w-full text-[14px] leading-[1.6] text-black/80">
          Select the credentials you want to vote with:
        </p>

        <div className="w-full flex flex-col justify-end p-[10px] gap-[10px] rounded-[10px] border border-black/10">
          <div className="flex flex-col gap-[10px]">
            {credentialTable.map((credential) => {
              const credentialDetail = getCredentialDetail(credential.id);
              const isAvailable = isCredentialAvailable(credential);
              const isSelected = voteTable.includes(credential.id);

              return (
                <CredentialItem
                  key={credential.id}
                  credential={credential}
                  credentialDetail={credentialDetail}
                  isAvailable={isAvailable}
                  isSelected={isSelected}
                  onSelectCredential={handleCredentialSelect}
                />
              );
            })}
          </div>
          <div className="w-full">
            <Button
              className="w-full rounded-[10px] border border-black/10 bg-transparent hover:bg-[#e5e5e5] px-[10px] py-[4px] cursor-pointer text-[13px] font-[600] leading-[1.7] text-black justify-center"
              onClick={handleSelectAllClick}
            >
              Select All Available
            </Button>
          </div>
        </div>

        <div className="w-full">
          <Button
            className={cn(
              'bg-[rgba(0,0,0,0.05)] hover:bg-[#e5e5e5] text-black font-[700] p-[10px] gap-[10px] text-[16px] leading-[1.2] rounded-full w-full',
              isVoteActive ? '' : 'opacity-70 cursor-not-allowed'
            )}
            onClick={handleVoteClick}
            disabled={!isVoteActive}
          >
            <HiArrowRight />
            <span>Vote</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default VotingPopup;
