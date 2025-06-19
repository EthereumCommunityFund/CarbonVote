import React, { useCallback, useEffect, useState, useRef } from 'react';
import { HiArrowRight, HiCheck } from 'react-icons/hi';
import Modal from '@/components/ui/Modal';
import Image from 'next/image';
import { getCredentialDetails } from './utils';
import { VoteCheckIcon, WarnCircleIcon, XIcon } from '@/components/icons';
import { CredentialTable, SelectedOptionData } from '@/types';
import Button from '@/components/ui/buttons/Button';
import { cn } from '@/styles/cn';
import { devLog } from '@/utils/devLog';
import {
  CredentialDisplayItem,
  VotingProcess,
  VoteProcessUiState,
  GlobalMessage,
} from './types';

export interface IVoteProcessPopupProps {
  votingProcess: VotingProcess[];
  onClose: () => void;
  option_description: string;
  isOpen: boolean;
  onRefresh: () => void;

  selectedOptionData: SelectedOptionData | undefined;
  credentialTable: CredentialTable[];
  voteTable: string[];
  autoMode?: boolean;

  castVoteFlow: (
    selectedOptionData: SelectedOptionData,
    voteTable: string[]
  ) => Promise<void>;

  initializeVoting: (
    selectedOptionData: SelectedOptionData,
    voteTable: string[]
  ) => void;
  processCurrentCredential: () => Promise<void>;
  retryCurrentCredential: () => Promise<void>;
  skipCurrentCredential: () => void;
  processNextCredential: () => Promise<void>;
}

const VoteProcessPopup: React.FC<IVoteProcessPopupProps> = (props) => {
  const {
    votingProcess,
    onClose,
    option_description,
    isOpen,
    onRefresh,
    credentialTable,
    voteTable,
    selectedOptionData,
    initializeVoting,
    processCurrentCredential,
    retryCurrentCredential,
    skipCurrentCredential,
    processNextCredential,
    autoMode = true,
  } = props;

  const displayedVoteItemsRef = useRef<CredentialDisplayItem[]>([]);

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [overallUiState, setOverallUiState] =
    useState<VoteProcessUiState>('idle');
  const [globalMessage, setGlobalMessage] = useState<GlobalMessage | null>(
    null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [localAutoMode, setLocalAutoMode] = useState(autoMode);

  useEffect(() => {
    if (voteTable.length > 0) {
      const items = voteTable.map((credId) => {
        const credential = credentialTable.find((ct) => ct.id === credId);
        const details = getCredentialDetails({
          credentialId: credId,
          status: 'pending',
          contractpoll: credential?.credential,
        });

        return {
          id: credId,
          name: details.text,
          iconUrl: details.imgSrc,
          status: 'pending' as const,
        };
      });

      displayedVoteItemsRef.current = items;
      setCurrentStepIndex(-1);
      setOverallUiState('idle');
    }
  }, [voteTable, credentialTable]);

  const updateDisplayItems = useCallback((votingProcess: VotingProcess[]) => {
    const currentItems = displayedVoteItemsRef.current;

    const updatedItems = currentItems.map((item) => {
      const process = votingProcess.find((vp) => vp.credentialId === item.id);
      if (process) {
        return {
          ...item,
          status: process.status as any,
          errorMessage: process.errorMessage,
        };
      }
      return item;
    });

    const needsUpdate = updatedItems.some((updatedItem, index) => {
      const currentItem = currentItems[index];
      return (
        updatedItem.status !== currentItem.status ||
        updatedItem.errorMessage !== currentItem.errorMessage
      );
    });

    if (needsUpdate) {
      displayedVoteItemsRef.current = updatedItems;
    }

    return updatedItems;
  }, []);

  const checkAllCredentialsCompleted = useCallback(
    (votingProcess: VotingProcess[]) => {
      return votingProcess.every(
        (vote) =>
          vote.status === 'success' ||
          vote.status === 'error' ||
          vote.status === 'unauthorized' ||
          vote.status === 'popup_disabled' ||
          vote.status === 'skipped'
      );
    },
    []
  );

  const handleAllCredentialsCompleted = useCallback(
    (votingProcess: VotingProcess[]) => {
      const allSuccess = votingProcess.every(
        (vote) => vote.status === 'success'
      );

      const hasErrors = votingProcess.some(
        (vote) =>
          vote.status === 'error' ||
          vote.status === 'unauthorized' ||
          vote.status === 'popup_disabled'
      );

      if (allSuccess) {
        setOverallUiState('all_completed_success');
        setGlobalMessage({
          text: 'Your vote has been confirmed!',
          type: 'success',
        });
      } else {
        setOverallUiState('all_completed_with_issues');
        setGlobalMessage({
          text: hasErrors
            ? 'Some credential votes failed, but your vote has been partially confirmed'
            : 'Your vote has been confirmed!',
          type: hasErrors ? 'error' : 'success',
        });
      }
      setIsProcessing(false);
    },
    []
  );

  const handleProcessingCredential = useCallback(
    (votingProcess: VotingProcess[], updatedItems: CredentialDisplayItem[]) => {
      const currentProcess = votingProcess.find(
        (vp) =>
          vp.status === 'processing' ||
          vp.status === 'verifying' ||
          vp.status === 'signing' ||
          vp.status === 'sending' ||
          vp.status === 'pending_tx'
      );

      if (currentProcess) {
        setOverallUiState('processing');
        setIsProcessing(true);

        const index = updatedItems.findIndex(
          (item) => item.id === currentProcess.credentialId
        );
        if (index !== -1) {
          setCurrentStepIndex(index);
        }
        return true;
      }
      return false;
    },
    []
  );

  const handleErrorCredential = useCallback(
    (votingProcess: VotingProcess[], updatedItems: CredentialDisplayItem[]) => {
      const errorProcess = votingProcess.find((vp) => vp.status === 'error');

      if (errorProcess) {
        setOverallUiState('credential_error_awaiting_action');
        setIsProcessing(false);

        const index = updatedItems.findIndex(
          (item) => item.id === errorProcess.credentialId
        );
        if (index !== -1) {
          setCurrentStepIndex(index);
        }
        return true;
      }
      return false;
    },
    []
  );

  const handleSuccessCredential = useCallback(
    async (votingProcess: VotingProcess[], currentStepIndex: number) => {
      if (currentStepIndex >= 0 && currentStepIndex < votingProcess.length) {
        const currentCredentialId =
          displayedVoteItemsRef.current[currentStepIndex].id;
        const currentVoteProcess = votingProcess.find(
          (vp) => vp.credentialId === currentCredentialId
        );

        if (
          currentVoteProcess &&
          currentVoteProcess.status === 'success' &&
          currentStepIndex < votingProcess.length - 1
        ) {
          if (localAutoMode) {
            const nextIndex = currentStepIndex + 1;
            setCurrentStepIndex(nextIndex);
            setOverallUiState('processing');
            setIsProcessing(true);
            setGlobalMessage({
              text: `auto verifying ${displayedVoteItemsRef.current[nextIndex].name}...`,
              type: 'info',
            });

            const updatedItems = [...displayedVoteItemsRef.current];
            updatedItems[nextIndex] = {
              ...updatedItems[nextIndex],
              status: 'processing',
            };
            displayedVoteItemsRef.current = updatedItems;

            try {
              await processNextCredential();
            } catch (error) {
              console.error('Error processing next credential:', error);
              setOverallUiState('credential_error_awaiting_action');
              setGlobalMessage({
                text: 'verification failed, please retry or skip this credential',
                type: 'error',
              });
              setIsProcessing(false);
            }
          } else {
            setOverallUiState('ready_for_next');
            setIsProcessing(false);
            setGlobalMessage({
              text: 'This credential has been confirmed, please continue to the next step',
              type: 'success',
            });
          }
          return true;
        }
      }
      return false;
    },
    [localAutoMode, processNextCredential]
  );

  useEffect(() => {
    const processVotingState = async () => {
      if (votingProcess.length > 0) {
        const updatedItems = updateDisplayItems(votingProcess);

        const hasError = handleErrorCredential(votingProcess, updatedItems);

        if (hasError) {
          return;
        }

        const isProcessing = handleProcessingCredential(
          votingProcess,
          updatedItems
        );

        if (isProcessing) {
          return;
        }

        const allCompleted = checkAllCredentialsCompleted(votingProcess);

        if (allCompleted) {
          handleAllCredentialsCompleted(votingProcess);
        } else {
          await handleSuccessCredential(votingProcess, currentStepIndex);
        }
      }
    };

    processVotingState();
  }, [
    votingProcess,
    currentStepIndex,
    updateDisplayItems,
    checkAllCredentialsCompleted,
    handleAllCredentialsCompleted,
    handleProcessingCredential,
    handleErrorCredential,
    handleSuccessCredential,
  ]);

  const handleClose = useCallback(() => {
    displayedVoteItemsRef.current = [];
    setCurrentStepIndex(-1);
    setOverallUiState('idle');
    setGlobalMessage(null);
    setIsProcessing(false);
    setLocalAutoMode(autoMode);

    onRefresh();
    onClose();
  }, [onClose, onRefresh, autoMode]);

  const handleStartVote = useCallback(async () => {
    if (selectedOptionData && voteTable.length > 0) {
      setOverallUiState('processing');
      setIsProcessing(true);
      setCurrentStepIndex(0);
      setGlobalMessage({ text: 'Verifying credential...', type: 'info' });

      if (displayedVoteItemsRef.current.length > 0) {
        const updatedItems = [...displayedVoteItemsRef.current];
        updatedItems[0] = {
          ...updatedItems[0],
          status: 'processing',
        };
        displayedVoteItemsRef.current = updatedItems;
      }

      try {
        await processCurrentCredential();
      } catch (error) {
        console.error('Error during voting process:', error);
        setOverallUiState('final_error_state');
        setGlobalMessage({
          text: 'An error occurred during the voting process, please try again later',
          type: 'error',
        });
        setIsProcessing(false);
      }
    }
  }, [selectedOptionData, voteTable, processCurrentCredential]);

  const handleRetry = useCallback(async () => {
    if (currentStepIndex >= 0 && selectedOptionData) {
      const currentCredential = displayedVoteItemsRef.current[currentStepIndex];

      setOverallUiState('processing');
      setIsProcessing(true);
      setGlobalMessage({
        text: `Re-verifying ${currentCredential.name}...`,
        type: 'info',
      });

      const updatedItems = [...displayedVoteItemsRef.current];
      updatedItems[currentStepIndex] = {
        ...updatedItems[currentStepIndex],
        status: 'processing',
      };
      displayedVoteItemsRef.current = updatedItems;

      try {
        await retryCurrentCredential();
      } catch (error) {
        console.error('Error during retry:', error);
        setOverallUiState('credential_error_awaiting_action');
        setGlobalMessage({
          text: 'Retry failed, please try again or skip this credential',
          type: 'error',
        });
        setIsProcessing(false);
      }
    }
  }, [currentStepIndex, selectedOptionData, retryCurrentCredential]);

  const handleSkip = useCallback(async () => {
    if (
      currentStepIndex >= 0 &&
      currentStepIndex < displayedVoteItemsRef.current.length
    ) {
      skipCurrentCredential();

      if (currentStepIndex < displayedVoteItemsRef.current.length - 1) {
        const nextIndex = currentStepIndex + 1;
        setCurrentStepIndex(nextIndex);
        setOverallUiState('processing');
        setIsProcessing(true);
        setGlobalMessage({
          text: `Verifying ${displayedVoteItemsRef.current[nextIndex].name}...`,
          type: 'info',
        });

        const updatedItems = [...displayedVoteItemsRef.current];
        updatedItems[nextIndex] = {
          ...updatedItems[nextIndex],
          status: 'processing',
        };
        displayedVoteItemsRef.current = updatedItems;

        try {
          await processNextCredential();
        } catch (error) {
          console.error('Error processing the next credential:', error);
          setOverallUiState('credential_error_awaiting_action');
          setGlobalMessage({
            text: 'Verification failed, please retry or skip this credential',
            type: 'error',
          });
          setIsProcessing(false);
        }
      } else {
        setOverallUiState('all_completed_with_issues');
        setGlobalMessage({
          text: 'Your vote has been partially confirmed',
          type: 'info',
        });
      }
    }
  }, [currentStepIndex, skipCurrentCredential, processNextCredential]);

  const handleNext = useCallback(async () => {
    if (
      currentStepIndex < displayedVoteItemsRef.current.length - 1 &&
      selectedOptionData
    ) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setOverallUiState('processing');
      setIsProcessing(true);
      setGlobalMessage({
        text: `Verifying ${displayedVoteItemsRef.current[nextIndex].name}...`,
        type: 'info',
      });

      const updatedItems = [...displayedVoteItemsRef.current];
      updatedItems[nextIndex] = {
        ...updatedItems[nextIndex],
        status: 'processing',
      };
      displayedVoteItemsRef.current = updatedItems;

      try {
        await processNextCredential();
      } catch (error) {
        console.error('Error processing the next credential:', error);
        setOverallUiState('credential_error_awaiting_action');
        setGlobalMessage({
          text: 'Verification failed, please retry or skip this credential',
          type: 'error',
        });
        setIsProcessing(false);
      }
    }
  }, [currentStepIndex, selectedOptionData, processNextCredential]);

  const renderCredentialItem = useCallback(
    (item: CredentialDisplayItem, index: number) => {
      const isProcessed = index < currentStepIndex;
      const isActive = index === currentStepIndex;
      const isProcessingItem =
        item.status === 'verifying' ||
        item.status === 'signing' ||
        item.status === 'sending' ||
        item.status === 'pending_tx' ||
        item.status === 'processing';
      const isNotStart = index > currentStepIndex;
      const isLastOne = index === displayedVoteItemsRef.current.length - 1;
      const showBackground =
        isProcessed ||
        isActive ||
        item.status === 'success' ||
        item.status === 'skipped';

      return (
        <div key={item.id} className="w-full">
          <div className={cn('flex justify-between items-center rounded-lg')}>
            <div
              className={cn(
                'flex items-center gap-[10px] px-[8px] py-[2px] rounded-[5px]',
                showBackground ? 'bg-black/5' : '',
                isNotStart && item.status === 'pending' ? 'opacity-50' : ''
              )}
            >
              <Image
                src={item.iconUrl}
                alt={item.name}
                width={20}
                height={20}
              />
              <span className="text-[14px] font-[600] leading-[1.4] text-black/50">
                {item.name}
              </span>
            </div>
            <div className="flex items-center">
              {item.status === 'pending' && (
                <div
                  className={cn(
                    'w-[30px] h-[30px] flex items-center justify-center rounded-[5px]'
                  )}
                >
                  <div className={'opacity-10'}>
                    <VoteCheckIcon color={'black'} />
                  </div>
                </div>
              )}
              {isProcessingItem && (
                <div className="animate-spin">
                  <Image
                    src="/images/loader.png"
                    alt="Loading"
                    width={30}
                    height={30}
                  />
                </div>
              )}
              {item.status === 'success' && (
                <div className="w-[30px] h-[30px] flex justify-center items-center rounded-full bg-black">
                  <VoteCheckIcon color={'white'} />
                </div>
              )}
              {(item.status === 'error' || item.status === 'skipped') && (
                <WarnCircleIcon width={30} height={30} />
              )}
            </div>
          </div>

          {item.status === 'error' && isActive && (
            <div className="py-[10px] flex justify-between items-center">
              <p className="text-[14px] leading-[1.6] text-[#FF5B53]">
                {item.errorMessage ||
                  'Error: Something went wrong with the process'}
              </p>
              <div className="flex gap-[10px]">
                <Button
                  className={cn(
                    'h-[30px] px-[10px] border  text-[16px] rounded-[8px]',
                    'bg-white border-black/10 text-black'
                  )}
                  onClick={handleSkip}
                >
                  Skip
                </Button>
                <Button
                  className={cn(
                    'h-[30px] px-[10px] border  text-[16px] rounded-[8px]',
                    'bg-[rgba(255,91,83,0.10)] border-[#FF5B53] text-[#EB473F] hover:bg-[#f3bdba]'
                  )}
                  onClick={handleRetry}
                >
                  Retry
                </Button>
              </div>
            </div>
          )}

          {isActive && !isLastOne && (
            <div className="mt-[10px] w-full h-0 border-t border-black/10"></div>
          )}

          {/* Connection line */}
          {index < displayedVoteItemsRef.current.length - 1 && (
            <div className="px-[18px] py-[5px]">
              <div className="w-[1px] h-[20px] bg-black/20"></div>
            </div>
          )}
        </div>
      );
    },
    [currentStepIndex, handleRetry, handleSkip]
  );

  const renderActionButton = useCallback(() => {
    if (overallUiState === 'idle') {
      return (
        <Button
          className="bg-[rgba(0,0,0,0.05)] hover:bg-[#e5e5e5] text-black font-[700] p-[10px] gap-[10px] text-[16px] leading-[1.2] rounded-full w-full"
          onClick={handleStartVote}
        >
          <HiArrowRight />
          <span>Start Voting</span>
        </Button>
      );
    }

    if (overallUiState === 'processing') {
      return (
        <Button
          className="bg-[#ececec] text-[#4d4d4d] font-[700] p-[10px] gap-[10px] text-[16px] leading-[1.2] rounded-full w-full"
          disabled
        >
          <span>Confirming...</span>
        </Button>
      );
    }

    if (overallUiState === 'ready_for_next') {
      return (
        <Button
          className="bg-[rgba(0,0,0,0.05)] hover:bg-[#e5e5e5] text-black font-[700] p-[10px] gap-[10px] text-[16px] leading-[1.2] rounded-full w-full"
          onClick={handleNext}
        >
          <HiArrowRight />
          <span>Next</span>
        </Button>
      );
    }

    if (
      overallUiState === 'all_completed_success' ||
      overallUiState === 'all_completed_with_issues'
    ) {
      return (
        <div className="flex flex-col gap-[20px]">
          <div className="text-[16px] font-[600] leading-[1.25] text-black text-center">
            Your votes are confirmed!
          </div>

          <Button
            className="bg-[rgba(0,0,0,0.05)] hover:bg-[#e5e5e5] text-black font-[700] p-[10px] gap-[10px] text-[16px] leading-[1.2] rounded-full w-full opacity-70"
            onClick={handleClose}
          >
            <HiCheck />
            <span>Done</span>
          </Button>
        </div>
      );
    }

    if (overallUiState === 'credential_error_awaiting_action') {
      return (
        <Button
          className="bg-[#f0f0f0] text-black/70 font-[700] p-[10px] gap-[10px] text-[16px] leading-[1.2] rounded-full w-full"
          disabled
        >
          <span>Error</span>
        </Button>
      );
    }

    if (overallUiState === 'final_error_state') {
      return (
        <Button
          className="bg-red-100 text-red-500 font-[700] p-[10px] gap-[10px] text-[16px] leading-[1.2] rounded-full w-full"
          onClick={handleClose}
        >
          <span>Error</span>
        </Button>
      );
    }

    return null;
  }, [overallUiState, handleStartVote, handleNext, handleClose]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      contentClassName="p-0 gap-[0]"
      keepMounted
      closeOnOutsideClick={overallUiState === 'idle'}
    >
      <div className="flex justify-between items-start p-[14px] border-b border-black/10">
        <div className="flex flex-col gap-[5px]">
          <p className="text-[16px] font-[700] leading-[1.25] text-black">
            Vote
          </p>
          <p className="text-[13px] font-[500] leading-[20px] text-black/60">
            You are voting:{' '}
            <span className="text-[14px] font-[400] leading-[1.6] text-black">
              {option_description ?? ''}
            </span>
          </p>
        </div>
        {overallUiState === 'idle' && (
          <button
            onClick={handleClose}
            className="w-[34px] h-[34px] rounded-full bg-black/10 opacity-70 flex items-center justify-center hover:bg-black/30"
          >
            <XIcon width={20} height={20} />
          </button>
        )}
      </div>

      <div className="p-[20px] flex flex-col items-center gap-[20px]">
        {/* credential list */}
        <div className="w-full p-[14px] border border-black/10 rounded-[10px]">
          {displayedVoteItemsRef.current.map((item, index) =>
            renderCredentialItem(item, index)
          )}
        </div>

        {/* global message */}
        {/* {globalMessage && (
          <div
            className={cn(
              'w-full p-3 rounded-lg text-[14px]',
              globalMessage.type === 'success'
                ? 'bg-green-50 text-green-600'
                : globalMessage.type === 'error'
                  ? 'bg-red-50 text-red-500'
                  : 'bg-gray-50 text-gray-600'
            )}
          >
            {globalMessage.text}
          </div>
        )} */}

        {/* bottom button */}
        <div className="w-full">{renderActionButton()}</div>
      </div>
    </Modal>
  );
};

export default VoteProcessPopup;
