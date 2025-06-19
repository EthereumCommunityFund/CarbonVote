import { useState, useEffect, useCallback, useMemo } from 'react';
import { ethers } from 'ethers';
import { PollOptionType, VoterData } from '@/types';
import { getBalanceAtBlock } from '@/utils/pollUtils';
import VotingOption from '../../carbonvote-contracts/deployment/contracts/VotingOption.sol/VotingOption.json';
import { useLatestBlock } from '@/utils/useLatestBlock';
import useProvider from '@/utils/useProvider';
import { devLog } from '@/utils/devLog';
import { useAccount } from 'wagmi';

export interface OptionVotersData {
  optionId: string;
  address: string | undefined;
  votersCount: number;
  totalEth: string;
  votersData: VoterData[];
}

export interface IUserVotedOption {
  optionId: string;
  optionDescription: string;
}

export interface EthOnChainDataResult {
  hasEthOnChainOption: boolean;
  optionsVotersData: OptionVotersData[];
  userVotedOption: IUserVotedOption | null;
  isLoading: boolean;
  error: Error | null;
  refreshData: () => void;
  totalVoters: number;
  totalEth: string;
}

export function useEthOnChainData(
  options: PollOptionType[] | undefined,
  pollIsLive: boolean,
  endBlockNumber?: number
) {
  const [optionsVotersData, setOptionsVotersData] = useState<
    OptionVotersData[]
  >([]);
  const [userVotedOption, setUserVotedOption] = useState<{
    optionId: string;
    optionDescription: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { address: accountWagmi } = useAccount();
  const provider = useProvider();
  const latestBlockNumber = useLatestBlock(true, refreshTrigger);

  const hasEthOnChainOption = useMemo(() => {
    return options?.some((option) => option.address) || false;
  }, [options]);

  const blockNumberToUse = useMemo(
    () => (pollIsLive ? latestBlockNumber : endBlockNumber),
    [pollIsLive, latestBlockNumber, endBlockNumber]
  );

  const { totalVoters, totalEth } = useMemo(() => {
    const uniqueVoters = new Set<string>();
    let totalEthBigInt = BigInt(0);

    optionsVotersData.forEach((option) => {
      option.votersData.forEach((voter) => {
        uniqueVoters.add(voter.address);
        totalEthBigInt += ethers.parseEther(voter.balance || '0');
      });
    });

    return {
      totalVoters: uniqueVoters.size,
      totalEth: ethers.formatEther(totalEthBigInt),
    };
  }, [optionsVotersData]);

  const fetchOptionVotersData = useCallback(
    async (
      option: PollOptionType,
      blockNumber: number | undefined
    ): Promise<OptionVotersData> => {
      if (!option.address || !blockNumber) {
        return {
          optionId: option.id,
          address: option.address,
          votersCount: 0,
          totalEth: '0',
          votersData: [],
        };
      }

      try {
        const contract = new ethers.Contract(
          option.address as string,
          VotingOption.abi,
          provider
        );

        const votersCount = await contract.getVotersCount();

        const voterAddresses = await Promise.all(
          Array.from({ length: Number(votersCount) }, (_, j) =>
            contract.voters(j)
          )
        );

        const votersData = await Promise.all(
          voterAddresses.map(async (address) => {
            try {
              const balance = await getBalanceAtBlock(address, blockNumber);
              return {
                address,
                balance: balance || '0',
                voteHash: '',
              };
            } catch (error) {
              console.error(
                `Error getting balance for voter ${address} at block ${blockNumber}:`,
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

        return {
          optionId: option.id,
          address: option.address,
          votersCount: votersData.length,
          totalEth: ethers.formatEther(totalBalance),
          votersData,
        };
      } catch (error) {
        console.error(
          `Error fetching voters data for option ${option.address}:`,
          error
        );
        return {
          optionId: option.id,
          address: option.address,
          votersCount: 0,
          totalEth: '0',
          votersData: [],
        };
      }
    },
    [provider]
  );
  const updateUserVotedOption = useCallback(
    (optionsVotersData: OptionVotersData[]) => {
      if (
        !accountWagmi ||
        !options ||
        options.length === 0 ||
        optionsVotersData.length === 0
      ) {
        setUserVotedOption(null);
        return;
      }

      let foundUserVote = false;

      for (const optionData of optionsVotersData) {
        if (optionData.votersData && optionData.votersData.length > 0) {
          const hasVoted = optionData.votersData.some(
            (voter) =>
              voter.address.toLowerCase() === accountWagmi.toLowerCase()
          );

          if (hasVoted) {
            const matchingOption = options.find(
              (option) => option.id === optionData.optionId
            );
            if (matchingOption) {
              setUserVotedOption({
                optionId: optionData.optionId,
                optionDescription: matchingOption.option_description,
              });
              foundUserVote = true;
              break;
            }
          }
        }
      }

      if (!foundUserVote) {
        setUserVotedOption(null);
      }
    },
    [options, accountWagmi]
  );

  const fetchAllOptionsData = useCallback(async () => {
    if (!options || options.length === 0 || !blockNumberToUse) {
      setOptionsVotersData([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const ethOnChainOptions = options.filter((option) => option.address);

      if (ethOnChainOptions.length === 0) {
        setOptionsVotersData([]);
        return;
      }

      const allOptionsData = await Promise.all(
        ethOnChainOptions.map((option) =>
          fetchOptionVotersData(option, blockNumberToUse)
        )
      );

      setOptionsVotersData(allOptionsData);
    } catch (err) {
      console.error('Error fetching ETH on-chain data:', err);
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to fetch ETH on-chain data')
      );
      setOptionsVotersData([]);
    } finally {
      setIsLoading(false);
    }
  }, [options, blockNumberToUse, fetchOptionVotersData]);

  const refreshData = useCallback(async () => {
    if (!hasEthOnChainOption || !options || options.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let currentBlockNumber: number | undefined;

      if (pollIsLive) {
        try {
          currentBlockNumber = await provider.getBlockNumber();
        } catch (error) {
          console.error('Error getting latest block number:', error);
          currentBlockNumber = latestBlockNumber || undefined;
        }
      } else {
        currentBlockNumber = endBlockNumber;
      }

      if (!currentBlockNumber) {
        console.error('Failed to get block number for refresh');
        return;
      }

      const ethOnChainOptions = options.filter((option) => option.address);

      if (ethOnChainOptions.length === 0) {
        return;
      }

      const allOptionsData = await Promise.all(
        ethOnChainOptions.map((option) =>
          fetchOptionVotersData(option, currentBlockNumber)
        )
      );

      setOptionsVotersData(allOptionsData);
      updateUserVotedOption(allOptionsData);

    } catch (err) {
      console.error('Error refreshing ETH on-chain data:', err);
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to refresh ETH on-chain data')
      );
    } finally {
      setIsLoading(false);
    }
  }, [
    hasEthOnChainOption,
    options,
    pollIsLive,
    endBlockNumber,
    latestBlockNumber,
    fetchOptionVotersData,
    updateUserVotedOption,
  ]);

  useEffect(() => {
    if (hasEthOnChainOption) {
      fetchAllOptionsData();
    }
  }, [hasEthOnChainOption, fetchAllOptionsData, refreshTrigger]);

  useEffect(() => {
    if (hasEthOnChainOption && accountWagmi) {
      updateUserVotedOption(optionsVotersData);
    }
  }, [
    refreshTrigger,
    hasEthOnChainOption,
    accountWagmi,
    updateUserVotedOption,
    optionsVotersData,
  ]);

  return {
    hasEthOnChainOption,
    optionsVotersData,
    userVotedOption,
    isLoading,
    error,
    refreshData,
    totalVoters,
    totalEth,
  };
}

export default useEthOnChainData;
