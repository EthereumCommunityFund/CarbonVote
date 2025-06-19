import React from 'react';
import { Label } from '@/components/ui/Label';
import OptionButton from '@/components/ui/buttons/OptionButton';
import { LockIcon } from '@/components/icons/lock';
import Image from 'next/image';
import { copyToClipboard } from '@/utils/pollUtils';
import { PollOptionType, SelectedOptionData } from '@/types';
import { Skeleton } from '@mui/material';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

interface PollVotingAreaProps {
  pollIsLive: boolean;
  hasAvailableCredential: boolean;
  options: PollOptionType[] | undefined;
  selectedOptionData: SelectedOptionData | undefined;
  handleOptionSelect: (
    optionId: string,
    optionIndex: number | undefined,
    option_description: string
  ) => void;
  isContractPoll: boolean;
  isEthHoldingPoll: boolean;
  isAddressExpanded: boolean;
  handleAddressToggleExpanded: () => void;
  contractPollResultData: any[];
  latestBlockNumber: number | null | undefined;
  endBlockNumber: number | undefined;
  refreshResults: (() => Promise<void>) | (() => void);
  isLoading?: boolean;
  userHasVoted: boolean;
}

const PollVotingArea: React.FC<PollVotingAreaProps> = ({
  pollIsLive,
  hasAvailableCredential,
  options,
  selectedOptionData,
  handleOptionSelect,
  isContractPoll,
  isEthHoldingPoll,
  isAddressExpanded,
  handleAddressToggleExpanded,
  contractPollResultData,
  latestBlockNumber,
  endBlockNumber,
  refreshResults,
  isLoading,
  userHasVoted,
}) => {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-[20px] p-[14px] bg-[rgba(0,0,0,0.05)] rounded-[10px] border border-[rgba(0,0,0,0.1)] animate-pulse">
        <div className="flex flex-col gap-[10px]">
          <Skeleton variant="rounded" width="150px" height={24} />
          <Skeleton variant="rounded" width="80%" height={20} />
          <Skeleton variant="rounded" width="60%" height={17} />
        </div>

        <div className="flex flex-col gap-[10px]">
          <Skeleton variant="rounded" width="100%" height={46} />
          <Skeleton variant="rounded" width="100%" height={46} />
          <Skeleton variant="rounded" width="100%" height={46} />
        </div>
      </div>
    );
  }

  if (!pollIsLive) {
    return (
      <div className="flex justify-center items-center p-[14px] bg-[rgba(0,0,0,0.05)] rounded-[10px] border border-[rgba(0,0,0,0.1)]">
        <p className="text-[16px] font-[600] leading-[2] text-black">
          Voting Finished
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-[20px] p-[14px] bg-[rgba(0,0,0,0.05)] rounded-[10px] border border-[rgba(0,0,0,0.1)]">
      {/* {userHasVoted && (
            <div className="flex items-center justify-center px-[14px] py-[10px] bg-black text-white rounded-md text-sm font-semibold">
              <CheckIcon className="w-[20px] h-[20px]" />
              <span className="ml-[10px]">You Have Voted</span>
            </div>
          )} */}
      <Label className="text-[20px] font-[700] leading-[1.6]">
        Vote on Poll
      </Label>
      <div className={hasAvailableCredential ? 'block' : 'hidden'}>
        <p className="text-[16px] font-[600] leading-[1.6] text-black/70">
          This is a nested poll. You can vote with multiple credentials.
        </p>
        <p className="mt-[4px] text-[14px] font-[600] leading-[1.6] text-black/50">
          Votes will be segmented by credentials
        </p>
      </div>
      <div
        className={`relative flex flex-col gap-[10px] ${
          hasAvailableCredential ? 'opacity-100' : 'opacity-50'
        }`}
      >
        {options && options.length > 0 ? (
          options.map((option, index) => (
            <OptionButton
              key={option.id}
              index={index}
              id={option.id}
              optionName={option.option_description}
              isChecked={option.id === selectedOptionData?.optionId}
              onVote={() =>
                handleOptionSelect(
                  option.id,
                  option.option_index,
                  option.option_description
                )
              }
              optionAddress={undefined}
            />
          ))
        ) : (
          <div className="p-4 text-center text-black/70">
            No options available
          </div>
        )}
        {!hasAvailableCredential && options && options.length > 0 ? (
          <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center gap-[10px] cursor-not-allowed">
            <div className="flex items-center gap-[10px]">
              <LockIcon className="w-[30px] h-[30px] text-black" />
              <h3 className="text-[16px] font-[700] leading-[1.2]">
                You Cannot Vote
              </h3>
            </div>
            <p className="text-[14px] font-[600] leading-[1.4]">
              You do not have the available credentials
            </p>
          </div>
        ) : null}
      </div>

      {/* ETHHolding V1 */}
      {isContractPoll && (
        <div className="p-[10px] bg-[rgba(0,0,0,0.05)] border border-black/10 rounded-[10px]">
          <div className="flex items-center gap-[10px]">
            <Image
              src="/images/eth_logo.svg"
              alt="Ethereum Logo"
              width={24}
              height={24}
            />
            <div className="text-[14px] font-[700] text-black/50 leading-[20px]">
              Ether Holding (V1) voting
            </div>
          </div>
          <div className="mt-[6px] text-[14px] text-black font-[600] leading-[1.6]">
            requires a zero-value transaction from your wallet.
          </div>
          <div className="mt-[10px] text-[12px] text-black/50 font-[600] leading-[1.6]">
            Optionally, you can manually send a zero-value transaction by
            pasting the address directly from your wallet.
          </div>
          <div>
            <div className="mt-[10px] flex gap-[6px]">
              <div
                className="text-[13px] text-black/60 bg-transparent rounded-[10px] shadow-none flex gap-[6px] cursor-pointer"
                onClick={handleAddressToggleExpanded}
              >
                {isAddressExpanded ? 'Hide Addresses' : 'Show Addresses'}
                {isAddressExpanded ? (
                  <ChevronUpIcon className="w-5 h-5" />
                ) : (
                  <ChevronDownIcon className="w-5 h-5" />
                )}
              </div>
            </div>
            {isAddressExpanded && (
              <div className="w-full flex flex-col gap-2 mt-[6px] text-[13px]">
                {options?.map((option, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between w-full px-[10px] gap-[10px]"
                  >
                    <p className="font-bold text-[13px] min-w-[80px] shrink-0">
                      {index + 1}. {option.option_description}
                    </p>

                    <div className="flex-1 flex items-center justify-end gap-[5px] overflow-hidden">
                      <p className="truncate w-full max-w-full text-right">
                        {option.address}
                      </p>
                      <button
                        className="text-[13px] ml-2 shrink-0"
                        onClick={() =>
                          copyToClipboard(option.address as string)
                        }
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* do not distinguish v1 and v2, indicates that the vote involves ETH holding as a voting weight (includes V1 and V2) */}
      {/* {isEthHoldingPoll && (
            <ContractPollResultComponent
              allAggregatedData={contractPollResultData}
              currentBlock={latestBlockNumber as number}
              endBlock={endBlockNumber as number}
              onRefresh={refreshResults}
            />
          )} */}
    </div>
  );
};

export default PollVotingArea;
