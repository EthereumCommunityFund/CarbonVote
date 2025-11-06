import { useState, useCallback } from 'react';
import { useAccount, useConfig } from 'wagmi';
import { signTypedData } from '@wagmi/core';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';
import { VoteRequestData, castVote } from '@/controllers/poll.controller';
import {
  Poll,
  CredentialTable,
  SelectedOptionData,
  VotingProcess,
  PollOptionType,
} from '@/types';
import {
  CREDENTIALS,
  CONTRACT_ADDRESS,
  EIP712_DOMAIN,
  EIP712_TYPE,
} from '@/src/constants';
import VotingContract from '../../carbonvote-contracts/deployment/contracts/VoteContract.sol/VotingContract.json';
import {
  isValidUuidV4,
  generateMessage,
  canOpenPopup,
} from '@/utils/pollUtils';
import { devLog } from '@/utils/devLog';

interface UseVotingProps {
  poll: Poll | null;
  credentialTable: CredentialTable[];
  options: PollOptionType[];
  userScore: number | undefined;
  config: ReturnType<typeof useConfig>;
  isPassportConnected: boolean;
  refreshResults: () => Promise<void>;
  checkCredentials: () => Promise<void>;
  setVoteTable: React.Dispatch<React.SetStateAction<string[]>>;
  setShowConfirmationPopup: React.Dispatch<React.SetStateAction<boolean>>;
}
interface EnhancedVotingProcess extends VotingProcess {
  errorMessage?: string;
}

type InternalVoteData = Partial<VoteRequestData> & {
  signature?: `0x${string}` | null;
  gitscore?: number;
  vote_credential: string;
};

interface UseVotingReturn {
  castVoteFlow: (
    selectedOptionData: SelectedOptionData,
    voteTable: string[]
  ) => Promise<void>;
  votingProcess: EnhancedVotingProcess[];
  onVoteProcessPopupClose: () => Promise<void>;

  initializeVoting: (
    selectedOptionData: SelectedOptionData,
    voteTable: string[]
  ) => void;
  processCurrentCredential: () => Promise<void>;
  retryCurrentCredential: () => Promise<void>;
  skipCurrentCredential: () => void;
  processNextCredential: () => Promise<void>;
}

const useVoting = ({
  poll,
  credentialTable,
  options,
  userScore,
  config,
  isPassportConnected,
  refreshResults,
  checkCredentials,
  setVoteTable,
  setShowConfirmationPopup,
}: UseVotingProps): UseVotingReturn => {
  const { address } = useAccount();

  const [votingProcess, setVotingProcess] = useState<EnhancedVotingProcess[]>(
    []
  );
  const [currentProcessingIndex, setCurrentProcessingIndex] =
    useState<number>(-1);
  const [selectedOption, setSelectedOption] =
    useState<SelectedOptionData | null>(null);
  const [credentialsToProcess, setCredentialsToProcess] = useState<string[]>(
    []
  );

  const updateVotingStatus = useCallback(
    (
      credentialId: string,
      status: VotingProcess['status'],
      errorMessage?: string
    ) => {
      setVotingProcess((current) =>
        current.map((vp) =>
          vp.credentialId === credentialId
            ? { ...vp, status, ...(errorMessage ? { errorMessage } : {}) }
            : vp
        )
      );
    },
    []
  );

  const onVoteProcessPopupClose = useCallback(async () => {
    setVoteTable([]);
    setShowConfirmationPopup(false);
  }, [
    setVoteTable,
    setShowConfirmationPopup,
    refreshResults,
    checkCredentials,
  ]);

  const invokeCastVote = useCallback(
    async (
      vote_credential: string,
      signature: `0x${string}` | null,
      optionId: string
    ) => {
      if (!poll || !address) {
        console.error('Poll or account missing for invokeCastVote');
        updateVotingStatus(vote_credential, 'error');
        return;
      }

      const voteData: InternalVoteData = {
        poll_id: poll.id,
        option_id: optionId,
        voter_identifier: address,
        signature: signature,
        vote_credential: vote_credential,
      };

      if (
        [
          CREDENTIALS.ZuConnectResident.id,
          CREDENTIALS.DevConnect.id,
          CREDENTIALS.ZuzaluResident.id,
        ].includes(vote_credential)
      ) {
        let voterTag = '';
        switch (vote_credential) {
          case CREDENTIALS.ZuConnectResident.id:
            voterTag = 'zuconnectNullifier';
            break;
          case CREDENTIALS.DevConnect.id:
            voterTag = 'devconnectNullifier';
            break;
          case CREDENTIALS.ZuzaluResident.id:
            voterTag = 'zuzaluNullifier';
            break;
        }
        const identifier = localStorage.getItem(voterTag);
        if (!identifier) {
          console.error(`Nullifier not found for ${voterTag}`);
          updateVotingStatus(vote_credential, 'error');
          return;
        }
        voteData.voter_identifier = identifier;
        voteData.signature = null;
      } else {
        if (!signature) {
          console.error('Signature missing for non-Zupass vote');
          updateVotingStatus(vote_credential, 'error');
          return;
        }
        voteData.signature = signature;
        voteData.voter_identifier = address;
      }

      if (vote_credential === CREDENTIALS.GitcoinPassport.id) {
        if (userScore === undefined) {
          console.error('Gitcoin score missing');
          updateVotingStatus(vote_credential, 'error');
          return;
        }
        voteData.gitscore = userScore;
      }

      try {
        await castVote(voteData as VoteRequestData);
        updateVotingStatus(vote_credential, 'success');
      } catch (error) {
        console.error('Error casting vote:', error);
        if (typeof error === 'object' && error !== null && 'status' in error) {
          const err = error as { status: number; message?: string };
          if (err.status === 403) {
            updateVotingStatus(vote_credential, 'unauthorized');
          } else {
            updateVotingStatus(vote_credential, 'error');
          }
        } else {
          updateVotingStatus(vote_credential, 'error');
        }
      }
    },
    [poll, address, userScore, updateVotingStatus]
  );

  const handleCastVote = useCallback(
    async (optionId: string, requiredCred: string) => {
      await invokeCastVote(requiredCred, null, optionId);
    },
    [invokeCastVote]
  );

  const handleCastVoteSigned = useCallback(
    async (optionId: string, credentialId: string) => {
      if (!poll?.id || !address) {
        console.error('Poll ID or account missing for signing.');
        updateVotingStatus(credentialId, 'error');
        return;
      }
      try {
        updateVotingStatus(credentialId, 'signing');
        const message = await generateMessage(poll.id, optionId, address);
        const domain = {
          ...EIP712_DOMAIN,
          chainId: config.chains[0].id,
        };

        const signature = await signTypedData(config, {
          domain,
          types: EIP712_TYPE,
          primaryType: 'PollVote',
          message,
        });

        if (signature) {
          updateVotingStatus(credentialId, 'sending');
          await invokeCastVote(credentialId, signature, optionId);
        } else {
          updateVotingStatus(credentialId, 'error');
        }
      } catch (error) {
        console.error('Error signing vote:', error);
        updateVotingStatus(credentialId, 'error');
      }
    },
    [poll?.id, address, config, invokeCastVote, updateVotingStatus]
  );

  const handleContractVote = useCallback(
    async (pollId: string, optionIndex: number) => {
      updateVotingStatus(pollId, 'signing');

      const generateSignature = async (message: string): Promise<string> => {
        const response = await fetch('/api/auth/generate_signature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        });
        if (!response.ok) throw new Error('Failed to generate signature');
        const data = await response.json();
        return data.data.signed_message;
      };

      let signature = localStorage.getItem('signature');
      let message = localStorage.getItem('message');

      if (
        !isPassportConnected ||
        !signature ||
        !message ||
        message !== address
      ) {
        try {
          if (!address) throw new Error('Account not connected');
          signature = await generateSignature(address);
          message = address;
          localStorage.setItem('signature', signature);
          localStorage.setItem('message', message);
        } catch (error) {
          console.error('Failed to generate or store signature:', error);
          updateVotingStatus(pollId, 'error');
          toast({
            title: 'Error',
            description: 'Failed to prepare vote signature.',
            variant: 'destructive',
          });
          return;
        }
      }

      if (!signature || !message) {
        console.error('Signature or message missing for contract vote.');
        updateVotingStatus(pollId, 'error');
        return;
      }

      try {
        if (!window.ethereum) {
          throw new Error(
            'Ethereum provider not found. Please install MetaMask or another wallet.'
          );
        }
        let provider = new ethers.BrowserProvider(window.ethereum as any);
        let signer = await provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          VotingContract.abi,
          signer
        );
        const pollIndex = Number(pollId);
        const newOptionIndex = Number(optionIndex);

        if (!canOpenPopup()) {
          toast({
            title: 'Error',
            description:
              'Please enable pop-ups in your browser settings to proceed with the transaction.',
            variant: 'destructive',
          });
          updateVotingStatus(pollId, 'popup_disabled');
          return;
        }
        updateVotingStatus(pollId, 'pending_tx');
        const transactionResponse = await contract.vote(
          pollIndex,
          newOptionIndex,
          signature,
          message
        );
        await transactionResponse.wait();
        updateVotingStatus(pollId, 'success');
      } catch (error: any) {
        console.error('Error casting contract vote:', error);
        updateVotingStatus(pollId, 'error');
        toast({
          title: 'Transaction Error',
          description: error.message || 'Failed to send transaction.',
          variant: 'destructive',
        });
      }
    },
    [updateVotingStatus, address, isPassportConnected]
  );

  const initializeVoteProcess = useCallback(
    (selectedOptionData: SelectedOptionData, voteTable: string[]) => {
      if (!localStorage.getItem('userUniqueId')) {
        const uniqueId = uuidv4();
        localStorage.setItem('userUniqueId', uniqueId);
      }

      const initialVotingProcess = voteTable.map((credentialId) => ({
        credentialId,
        status: 'pending',
        contractpoll: credentialTable.find((ct) => ct.id === credentialId)
          ?.credential,
      }));

      setVotingProcess(initialVotingProcess);
      setSelectedOption(selectedOptionData);
      setCredentialsToProcess(voteTable);
      setCurrentProcessingIndex(-1); // it means not start
    },
    [credentialTable]
  );

  const processCredential = useCallback(
    async (credentialId: string, optionId: string) => {
      try {
        updateVotingStatus(credentialId, 'processing');

        if (isValidUuidV4(credentialId)) {
          switch (credentialId) {
            case CREDENTIALS.ZuConnectResident.id:
              await handleCastVote(optionId, CREDENTIALS.ZuConnectResident.id);
              break;
            case CREDENTIALS.DevConnect.id:
              await handleCastVote(optionId, CREDENTIALS.DevConnect.id);
              break;
            case CREDENTIALS.ZuzaluResident.id:
              await handleCastVote(optionId, CREDENTIALS.ZuzaluResident.id);
              break;
            case CREDENTIALS.GitcoinPassport.id:
            case CREDENTIALS.POAPapi.id:
            case CREDENTIALS.ProtocolGuildMember.id:
            case CREDENTIALS.EthSoloStaker.id:
            case CREDENTIALS.EthHoldingOffchain.id:
            case CREDENTIALS.WhitelistedAddresses.id:
              await handleCastVoteSigned(optionId, credentialId);
              break;
            default:
              console.warn(`Unhandled UUID credential ID: ${credentialId}`);
              updateVotingStatus(credentialId, 'error', 'unknown credential');
              return false;
          }
        } else {
          const optionIndex = options.find(
            (opt) => opt.id === optionId
          )?.option_index;
          if (optionIndex !== undefined) {
            await handleContractVote(credentialId, optionIndex);
          } else {
            console.error(`Option index not found for option ID: ${optionId}`);
            updateVotingStatus(credentialId, 'error', 'credentialId not found');
            return false;
          }
        }

        return true;
      } catch (error) {
        console.error(`Error processing credential ${credentialId}:`, error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Error processing credential';
        updateVotingStatus(credentialId, 'error', errorMessage);
        return false;
      }
    },
    [
      handleCastVote,
      handleCastVoteSigned,
      handleContractVote,
      updateVotingStatus,
      options,
    ]
  );

  const processCurrentCredential = useCallback(async () => {
    if (!selectedOption) {
      toast({
        title: 'Error',
        description: 'Missing option data',
        variant: 'destructive',
      });
      return;
    }

    if (credentialsToProcess.length === 0) {
      toast({
        title: 'No credential selected',
        description: 'Please select at least one credential to vote',
        variant: 'destructive',
      });
      return;
    }

    if (currentProcessingIndex === -1) {
      setCurrentProcessingIndex(0);
    }

    const index = currentProcessingIndex === -1 ? 0 : currentProcessingIndex;

    const currentCredentialId = credentialsToProcess[index];
    await processCredential(currentCredentialId, selectedOption.optionId);
  }, [
    selectedOption,
    credentialsToProcess,
    currentProcessingIndex,
    processCredential,
  ]);

  const retryCurrentCredential = useCallback(async () => {
    if (
      !selectedOption ||
      currentProcessingIndex < 0 ||
      currentProcessingIndex >= credentialsToProcess.length
    ) {
      return;
    }

    const currentCredentialId = credentialsToProcess[currentProcessingIndex];
    await processCredential(currentCredentialId, selectedOption.optionId);
  }, [
    selectedOption,
    currentProcessingIndex,
    credentialsToProcess,
    processCredential,
  ]);

  const skipCurrentCredential = useCallback(() => {
    if (
      currentProcessingIndex < 0 ||
      currentProcessingIndex >= credentialsToProcess.length
    ) {
      return;
    }

    const currentCredentialId = credentialsToProcess[currentProcessingIndex];
    updateVotingStatus(currentCredentialId, 'skipped');
  }, [currentProcessingIndex, credentialsToProcess, updateVotingStatus]);

  const processNextCredential = useCallback(async () => {
    if (currentProcessingIndex >= credentialsToProcess.length - 1) {
      return;
    }

    const nextIndex = currentProcessingIndex + 1;
    setCurrentProcessingIndex(nextIndex);

    if (selectedOption) {
      const nextCredentialId = credentialsToProcess[nextIndex];
      await processCredential(nextCredentialId, selectedOption.optionId);
    }
  }, [
    currentProcessingIndex,
    credentialsToProcess,
    selectedOption,
    processCredential,
  ]);

  const castVoteFlow = useCallback(
    async (selectedOptionData: SelectedOptionData, voteTable: string[]) => {
      initializeVoteProcess(selectedOptionData, voteTable);

      if (voteTable.length > 0 && selectedOptionData) {
        setCurrentProcessingIndex(0);

        for (let i = 0; i < voteTable.length; i++) {
          const credentialId = voteTable[i];
          const success = await processCredential(
            credentialId,
            selectedOptionData.optionId
          );

          if (!success) {
            break;
          }
        }
      } else if (voteTable.length === 0) {
        toast({
          title: 'No credential selected',
          description: 'Please select at least one credential to vote',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: 'Missing option data',
          variant: 'destructive',
        });
      }
    },
    [initializeVoteProcess, processCredential]
  );

  const initializeVoting = useCallback(
    (selectedOptionData: SelectedOptionData, voteTable: string[]) => {
      initializeVoteProcess(selectedOptionData, voteTable);
    },
    [initializeVoteProcess]
  );

  return {
    castVoteFlow,
    votingProcess,
    onVoteProcessPopupClose,
    initializeVoting,
    processCurrentCredential,
    retryCurrentCredential,
    skipCurrentCredential,
    processNextCredential,
  };
};

export default useVoting;
