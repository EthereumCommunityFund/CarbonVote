import { useState, useEffect, useCallback } from 'react';
import { ethers, Contract } from 'ethers';
import {
  fetchPollById,
  fetchCredentialVotes,
} from '@/controllers/poll.controller';
import { Poll, PollOptionType, CredentialTable, VoteData } from '@/types';
import { isValidUuidV4, calculateTimeRemaining } from '@/utils/pollUtils';
import { CREDENTIALS, CONTRACT_ADDRESS } from '@/src/constants';
import VotingContract from '../../carbonvote-contracts/deployment/contracts/VoteContract.sol/VotingContract.json';
import VotingOption from '../../carbonvote-contracts/deployment/contracts/VotingOption.sol/VotingOption.json';
import useProvider from '../../utils/useProvider';
import { devLog } from '@/utils/devLog';

const contractAbi = VotingContract.abi;
const optionContractAbi = VotingOption.abi;

export const usePollData = (pollId: string | string[] | undefined) => {
  const [poll, setPoll] = useState<Poll>();
  const [options, setOptions] = useState<PollOptionType[]>([]);
  const [credentialTable, setCredentialTable] = useState<CredentialTable[]>([]);
  const [pollResult, setPollResult] = useState<VoteData[]>();
  const [isContractPoll, setIsContractPoll] = useState<boolean>(false);
  const [isEthHoldingPoll, setIsEthHoldingPoll] = useState<boolean>(false);
  const [pollIsLive, setPollIsLive] = useState<boolean>(false);
  const [remainingTime, setRemainingTime] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endBlockNumber, setEndBlockNumber] = useState<number>();
  const [pollType, setPollType] = useState<string>();
  const [pollContract, setPollContract] = useState<Contract | null>(null);
  const [requiredGitScore, setRequiredGitScore] = useState(0);
  const [isFetchFinish, setIsFetchFinish] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const provider = useProvider();

  const sortOptionsByIndex = useCallback((options: PollOptionType[]) => {
    return [...options].sort(
      (a: PollOptionType, b: PollOptionType) =>
        a.option_index! - b.option_index!
    );
  }, []);

  const processCredentials = useCallback(
    (data: any, nestedCredentialTable: CredentialTable[]) => {
      const updatedTable = [...nestedCredentialTable];
      let isEthHolding = false;

      if (data.credentials && data.credentials.length > 0) {
        data.credentials.forEach((cred: any) => {
          Object.values(CREDENTIALS).forEach((credential) => {
            if (cred.id === credential.id) {
              let pushObject: CredentialTable = {
                credential: credential.name,
                id: cred.id,
              };
              if (cred.id === CREDENTIALS.POAPapi.id) {
                pushObject = {
                  ...pushObject,
                  poap_events: data.poap_events,
                  poap_number: data.poap_number,
                };
              } else if (cred.id === CREDENTIALS.GitcoinPassport.id) {
                pushObject = { ...pushObject, gitscore: data.gitcoin_score };
              } else if (cred.id === CREDENTIALS.EthHoldingOffchain.id) {
                isEthHolding = true;
              }
              updatedTable.push(pushObject);
            }
          });
        });
      } 
      
      return { updatedTable, isEthHolding };
    },
    []
  );

  const fetchPollFromContract = useCallback(
    async (pollId: string, existingOptions?: PollOptionType[]) => {
      if (!pollId) return;

      try {
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractAbi,
          provider
        );

        if (!existingOptions) {
          setPollContract(contract);
        }

        const nestedCredentialTable: CredentialTable[] = [];

        if (contract !== null) {
          const pollData = await contract.getPoll(pollId);

          if (!existingOptions) {
            setPoll(pollData);
          }

          const contractpoll_type = pollData[4].toString();
          setPollType(contractpoll_type);
          setEndBlockNumber(Number(pollData.endBlockNumber));

          if (contractpoll_type) {
            if (contractpoll_type === '0') {
              setIsEthHoldingPoll(true);
              setIsContractPoll(true);
              nestedCredentialTable.push({
                id: pollId.toString(),
                credential: 'EthHolding on-chain',
                endblock_number: Number(pollData.endBlockNumber),
              });
            } else {
              nestedCredentialTable.push({
                id: pollId.toString(),
                credential: 'ProtocolGuild on-chain',
                endblock_number: Number(pollData.endBlockNumber),
              });
            }
          }

          const timeleft = calculateTimeRemaining(
            Number(pollData.endTime) * 1000
          );
          if (timeleft && !existingOptions) {
            setRemainingTime(timeleft);
          }

          let updatedOptions = existingOptions ? [...existingOptions] : [];

          const optionPromises = pollData.options.map(
            async (address: string) => {
              try {
                const optionContract = new ethers.Contract(
                  address,
                  optionContractAbi,
                  provider
                );

                const [optionName, index] = await Promise.all([
                  optionContract.name(),
                  optionContract.option_index(),
                ]);

                return { address, optionName, index };
              } catch (error) {
                console.error('Error fetching option:', error);
                return null;
              }
            }
          );

          const optionResults = await Promise.all(optionPromises);

          for (const result of optionResults) {
            if (!result) continue;

            const { address, optionName, index } = result;

            if (existingOptions) {
              if (contractpoll_type === '0') {
                let optionToUpdateIndex = updatedOptions.findIndex(
                  (option) => option.option_description === optionName
                );
                if (optionToUpdateIndex !== -1) {
                  const updatedOption = {
                    ...updatedOptions[optionToUpdateIndex],
                    address: address,
                    votersCount: 0,
                    totalEth: '0',
                    votersData: [],
                  };

                  updatedOptions = [
                    ...updatedOptions.slice(0, optionToUpdateIndex),
                    updatedOption,
                    ...updatedOptions.slice(optionToUpdateIndex + 1),
                  ];
                }
              }
            } else {
              updatedOptions.push({
                id: index,
                pollId: pollId as string,
                option_description: optionName,
                address: address,
                votersCount: 0,
                totalEth: '0',
                votersData: [],
                option_index: Number(index),
              });
            }
          }

          if (updatedOptions !== existingOptions) {
            const sortedOptions = sortOptionsByIndex(updatedOptions);
            setOptions(sortedOptions);
          }
        }

        if (!existingOptions) {
          setIsFetchFinish(true);
          setCredentialTable(nestedCredentialTable);
          setIsLoading(false);
        }

        return nestedCredentialTable;
      } catch (error) {
        console.error('Error fetching poll from contract:', error);
        if (!existingOptions) {
          setError(error instanceof Error ? error : new Error('Unknown error'));
          setIsLoading(false);
        }
        return [];
      }
    },
    [provider, sortOptionsByIndex]
  );

  const fetchPollFromApi = useCallback(
    async (pollId: string | string[] | undefined) => {
      try {
        setIsLoading(true);
        const response = await fetchPollById(pollId as string);
        const data = await response.data;
        devLog('poll data', data);
        setPoll(data);

        const sortedOptions = sortOptionsByIndex(data.options);
        setOptions(sortedOptions);
        setRequiredGitScore(data.gitcoin_score);

        let nestedCredentialTable: CredentialTable[] = [];
        if (data.contractpoll_index && data.contractpoll_index.length > 0) {
          const contractResults = await Promise.all(
            data.contractpoll_index.map((index: string) =>
              fetchPollFromContract(index, data.options)
            )
          );

          for (const result of contractResults) {
            if (result) {
              nestedCredentialTable = nestedCredentialTable.concat(result);
            }
          }
        }

        const { updatedTable, isEthHolding } = processCredentials(
          data,
          nestedCredentialTable
        );
        nestedCredentialTable = updatedTable;
        if (isEthHolding) {
          setIsEthHoldingPoll(true);
        }

        const timeleft = calculateTimeRemaining(data.endTime);
        const startdate = new Date(data.startTime);
        if (data.end_block_number) {
          setEndBlockNumber(data.end_block_number);
        }
        setStartDate(startdate);

        try {
          const response = await fetchCredentialVotes({ id: pollId as string });
          setPollResult(response.data);
        } catch (error) {
          console.error('Error fetching poll result:', error);
          setPollResult([]);
        }

        if (timeleft) {
          setRemainingTime(timeleft);
        }

        setCredentialTable(nestedCredentialTable);
        setIsFetchFinish(true);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching poll from API:', error);
        setError(error instanceof Error ? error : new Error('Unknown error'));
        setIsLoading(false);
      }
    },
    [sortOptionsByIndex, processCredentials, fetchPollFromContract]
  );

  useEffect(() => {
    if (pollId !== undefined) {
      if (isValidUuidV4(pollId as string)) {
        fetchPollFromApi(pollId);
      } else {
        fetchPollFromContract(pollId as string);
      }
    }
  }, [pollId, fetchPollFromApi, fetchPollFromContract]);

  useEffect(() => {
    const isLive = remainingTime !== null && remainingTime !== 'Time is up!';
    setPollIsLive(isLive);
  }, [remainingTime]);

  return {
    poll,
    options,
    credentialTable,
    pollResult,
    isContractPoll,
    isEthHoldingPoll,
    pollIsLive,
    remainingTime,
    startDate,
    endBlockNumber,
    pollType,
    pollContract,
    requiredGitScore,
    isFetchFinish,
    isLoading,
    error,
    fetchPollFromApi,
    fetchPollFromContract,
  };
};

export default usePollData;
