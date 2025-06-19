import { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import {
  PollOptionType,
  CredentialTable,
  VoteData,
  AllAggregatedDataType,
  Poll,
} from '@/types';
import { fetchCredentialVotes } from '@/controllers/poll.controller';
import { getBalanceAtBlock } from '@/utils/pollUtils';
import { CREDENTIALS } from '@/src/constants';
import { useLatestBlock } from '@/utils/useLatestBlock';
import { OptionVotersData } from './useEthOnChainData';

interface UsePollResultsProps {
  pollId: string | undefined;
  poll: Poll | null;
  pollIsLive: boolean;
  options: PollOptionType[] | undefined;
  credentialTable: CredentialTable[] | undefined;
  isEthHoldingPoll: boolean;
  endBlockNumber: number | undefined;
  isFetchFinish: boolean;
  hasEthOnChainOption: boolean;
  optionsVotersData: OptionVotersData[];
}

interface UsePollResultsReturn {
  pollResultData: VoteData[] | undefined;
  contractPollResultData: AllAggregatedDataType[];
  isLoading: boolean;
  error: Error | null;
  refreshResults: () => void;
  fetchEthHoldingResults: () => Promise<void>;
  latestBlockNumber: number | null;
  isPollResultFetched: boolean;
}

const usePollResults = ({
  pollId,
  poll,
  pollIsLive,
  options,
  credentialTable,
  isEthHoldingPoll,
  endBlockNumber,
  isFetchFinish,
  hasEthOnChainOption,
  optionsVotersData,
}: UsePollResultsProps): UsePollResultsReturn => {
  const [pollResultData, setPollResultData] = useState<VoteData[] | undefined>(
    undefined
  );
  const [contractPollResultData, setContractPollResultData] = useState<
    AllAggregatedDataType[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isPollResultFetched, setIsPollResultFetched] = useState(false);

  const latestBlockNumber = useLatestBlock(isEthHoldingPoll, refreshTrigger);

  const refreshResults = useCallback(() => {
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  const shouldFetchRegular = useMemo(
    () =>
      pollId &&
      isFetchFinish &&
      credentialTable &&
      credentialTable.some(
        (cred) =>
          cred.credential !== CREDENTIALS.EthHoldingOffchain.name &&
          cred.credential !== 'EthHolding on-chain'
      ),
    [pollId, isFetchFinish, credentialTable]
  );

  const shouldFetchEthHolding = useMemo(
    () =>
      pollId &&
      poll &&
      options &&
      credentialTable &&
      latestBlockNumber !== null &&
      endBlockNumber !== undefined &&
      isFetchFinish &&
      isEthHoldingPoll,
    [
      pollId,
      poll,
      options,
      credentialTable,
      latestBlockNumber,
      endBlockNumber,
      isFetchFinish,
      isEthHoldingPoll,
    ]
  );

  const filteredEthHoldingCredentials = useMemo(
    () =>
      credentialTable?.filter(
        (cred) =>
          cred.credential === 'EthHolding on-chain' ||
          cred.credential === CREDENTIALS.EthHoldingOffchain.name
      ) || [],
    [credentialTable]
  );

  const blockNumberToUse = useMemo(
    () => (pollIsLive ? latestBlockNumber : endBlockNumber),
    [pollIsLive, latestBlockNumber, endBlockNumber]
  );

  useEffect(() => {
    const fetchRegularResults = async () => {
      if (!shouldFetchRegular) {
        setPollResultData(undefined);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        if (pollId) {
          const response = await fetchCredentialVotes({
            id: pollId,
            isEthHolding: false,
          });
          setPollResultData(response.data);
          setIsPollResultFetched(true);
        }
      } catch (err) {
        console.error('Error fetching regular poll results:', err);
        setError(
          err instanceof Error
            ? err
            : new Error('Failed to fetch regular poll results')
        );
        setPollResultData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRegularResults();
  }, [pollId, shouldFetchRegular, isEthHoldingPoll, refreshTrigger]);

  const processOffChainVotes = useCallback(
    async (
      options: PollOptionType[],
      voteData: VoteData,
      blockNumber: number
    ): Promise<PollOptionType[]> => {
      const optionIndex = options.findIndex((opt) => opt.id === voteData.id);
      if (optionIndex === -1) return options;

      try {
        const votersData = await Promise.all(
          (voteData.voters_account || []).map(async (address) => {
            try {
              const balance = await getBalanceAtBlock(address, blockNumber);
              return {
                address,
                balance: balance || '0',
                voteHash: '',
              };
            } catch (error) {
              console.error(
                `Error getting balance for off-chain voter ${address} at block ${blockNumber}:`,
                error
              );
              return {
                address,
                balance: '0',
                voteHash: '',
              };
            }
          })
        );

        const totalBalance = votersData.reduce(
          (acc, { balance }) => acc + ethers.parseEther(balance || '0'),
          BigInt(0)
        );

        const updatedOptions = [...options];
        updatedOptions[optionIndex] = {
          ...updatedOptions[optionIndex],
          votersCount: votersData.length,
          totalEth: ethers.formatEther(totalBalance),
          votersData,
        };

        return updatedOptions;
      } catch (error) {
        console.error(
          `Error processing off-chain votes for option ${voteData.id}:`,
          error
        );
        return options;
      }
    },
    []
  );

  const fetchEthHoldingResults = useCallback(async () => {
    if (!shouldFetchEthHolding) {
      setContractPollResultData([]);
      if (!shouldFetchRegular) {
        setIsLoading(false);
      }
      return;
    }

    if (contractPollResultData.length === 0) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const allAggregatedData = await Promise.all(
        filteredEthHoldingCredentials.map(async (credential) => {
          let optionsData = options
            ? options.map((option) => ({ ...option }))
            : [];

          if (credential.credential === 'EthHolding on-chain') {
            if (hasEthOnChainOption && optionsVotersData.length > 0) {
              optionsData = optionsData.map((option) => {
                if (!option.address) return option;

                const matchingData = optionsVotersData.find(
                  (data) => data.optionId === option.id
                );

                if (!matchingData) return option;

                return {
                  ...option,
                  votersCount: matchingData.votersCount,
                  totalEth: matchingData.totalEth,
                  votersData: matchingData.votersData,
                };
              });
            }
          } else if (
            credential.credential === CREDENTIALS.EthHoldingOffchain.name &&
            pollId
          ) {
            try {
              const response = await fetchCredentialVotes({
                id: pollId,
                isEthHolding: true,
              });

              for (const voteData of response.data) {
                optionsData = await processOffChainVotes(
                  optionsData,
                  voteData,
                  blockNumberToUse!
                );
              }
            } catch (error) {
              console.error(
                'Error fetching ETH Holding off-chain votes:',
                error
              );
            }
          }

          return {
            id: credential.id,
            aggregatedData: optionsData,
          };
        })
      );

      setContractPollResultData(allAggregatedData);
      setIsPollResultFetched(true);
    } catch (err) {
      console.error('Error fetching ETH Holding poll results:', err);
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to fetch ETH Holding poll results')
      );
      setContractPollResultData([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    shouldFetchEthHolding,
    shouldFetchRegular,
    pollId,
    options,
    filteredEthHoldingCredentials,
    blockNumberToUse,
    processOffChainVotes,
    contractPollResultData.length,
    hasEthOnChainOption,
    optionsVotersData,
  ]);

  useEffect(() => {
    fetchEthHoldingResults();
  }, [fetchEthHoldingResults, refreshTrigger]);

  return {
    pollResultData,
    contractPollResultData,
    isLoading,
    error,
    refreshResults,
    fetchEthHoldingResults,
    latestBlockNumber,
    isPollResultFetched,
  };
};

export default usePollResults;
