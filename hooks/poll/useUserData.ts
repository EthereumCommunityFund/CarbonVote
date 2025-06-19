import { useEffect, useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { toast } from '@/components/ui/use-toast';
import { useUserPassportContext } from '@/context/PassportContext';
import { fetchScore } from '@/controllers';
import { fetchVote } from '@/controllers/poll.controller';
import { getPoapOwnership } from '@/controllers/poap.controller';
import { CredentialTable, Poll as BasePoll, PollOptionType } from '@/types';
import { CREDENTIALS } from '@/src/constants';
import { ProtocolGuildMembershipList } from '@/src/protocolguildmember';
import { SoloStakerList } from '@/src/solostaker';
import { getBalanceAtBlock } from '@/utils/getBalanceAtBlock';
import { getLatestBlockNumber } from '@/utils/getLatestBlockNumber';
import { isValidUuidV4 } from '@/utils';
import { IUserVotedOption } from './useEthOnChainData';
import { isEthHoldingCredentialOnChain } from '@/utils/pollUtils';

interface Poll extends BasePoll {
  pollType?: string;
  poll_type?: string;
  block_number: number;
  gitcoin_score: number;
  poap_number: string;
  poap_events: number[];
}

interface UseUserDataProps {
  poll: Poll | null;
  pollIsLive: boolean;
  userVotedOption: IUserVotedOption | null;
  credentialTable: CredentialTable[];
  options: PollOptionType[];
  account: string | undefined;
  isPassportConnected: boolean;
  pollId: string | undefined;
  isPollDataFetched: boolean;
}

export interface UseUserDataReturn {
  userAvailableCredentials: CredentialTable[];
  userEthHolding: string;
  userScore: number | undefined;
  credentialCardReady: boolean;
  checkCredentials: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
  isUserDataFetched: boolean;
}

export function useUserData({
  poll,
  pollIsLive,
  userVotedOption,
  options,
  credentialTable,
  account,
  isPassportConnected,
  pollId,
  isPollDataFetched,
}: UseUserDataProps) {
  const { address: accountWagmi, isConnected } = useAccount();
  const { signIn, verifyZuconnectticket, devconnectVerify, zuzaluVerify } =
    useUserPassportContext();

  const [userEthHolding, setUserEthHolding] = useState('0');
  const [score, setScore] = useState<number>();
  const [poapsNumber, setPoapsNumber] = useState('0');
  const [eventDetails, setEventDetails] = useState<any[]>([]);
  const [userAvailableCredentialTable, setAvailableCredentialTable] = useState<
    CredentialTable[]
  >([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [credentialCardReady, setCredentialCardReady] = useState(false);
  const [zupassPoll, setZupassPoll] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUserDataFetched, setIsUserDataFetched] = useState(false);

  const handleAddressToggleExpanded = useCallback(() => {
    setIsAddressExpanded((prev) => !prev);
  }, []);

  const getEthHoldings = useCallback(async (): Promise<number> => {
    if (!accountWagmi) return 0;

    try {
      const blockNumber = poll?.block_number || (await getLatestBlockNumber());
      if (!blockNumber) {
        console.warn('Could not determine block number for ETH balance check.');
        return 0;
      }

      const userBalance = await getBalanceAtBlock(
        accountWagmi as string,
        blockNumber as number
      );

      setUserEthHolding(parseFloat(userBalance).toFixed(2));
      return parseFloat(userBalance);
    } catch (error) {
      console.error('Error getting ETH balance:', error);
      setError(error as Error);
      return 0;
    }
  }, [accountWagmi, poll?.block_number]);

  const fetchGitcoinScore = useCallback(
    async (address: string): Promise<number | undefined> => {
      try {
        const fetchScoreData = {
          address,
          scorerId: '6347',
        };
        const scoreResponse = await fetchScore(fetchScoreData);
        const scoreData = scoreResponse.data;
        setScore(scoreData.score);
        return scoreData.score;
      } catch (error) {
        console.error('Error fetching Gitcoin score:', error);
        return undefined;
      }
    },
    []
  );

  const fetchPoapOwnership = useCallback(
    async (address: string, eventIds: number[]): Promise<string[]> => {
      try {
        const ownershipPromises = eventIds.map((eventId: number) =>
          getPoapOwnership(address, String(eventId)).then((response) => {
            const hasOwnership = response?.data?.owner === address;
            return {
              eventId: String(eventId),
              hasOwnership,
            };
          })
        );

        const ownershipResults = await Promise.all(ownershipPromises);
        const userOwnedPoapIds: string[] = ownershipResults
          .filter((result) => result.hasOwnership)
          .map((result) => result.eventId);

        setPoapsNumber(userOwnedPoapIds.length.toString());
        return userOwnedPoapIds;
      } catch (error) {
        console.error('Error processing POAP events:', error);
        return [];
      }
    },
    []
  );

  const checkVoteStatus = useCallback(
    async (
      credential: CredentialTable,
      identifier: string
    ): Promise<Partial<CredentialTable>> => {
      try {
        const checkVoteData = {
          id: pollId as string,
          identifier,
          credential: credential.id,
        };
        const responseVote = await fetchVote(checkVoteData);

        if (responseVote.data.option_id !== '') {
          return {
            votedOption: responseVote.data.option_id,
            votedOptionName: options.find(
              (option) => option.id === responseVote.data.option_id
            )?.option_description,
          };
        }
        return {};
      } catch (error) {
        console.warn(
          `Could not fetch vote status for credential ${credential.id}:`,
          error
        );
        return {};
      }
    },
    [pollId, options]
  );

  const updateCredentialWithVoteStatus = useCallback(
    async (
      availableCredentialTable: CredentialTable[],
      credential: CredentialTable,
      identifier: string
    ) => {
      const voteStatus = await checkVoteStatus(credential, identifier);

      if (Object.keys(voteStatus).length > 0) {
        const credentialIndex = availableCredentialTable.findIndex(
          (cred) => cred.id === credential.id && cred.identifier === identifier
        );

        if (credentialIndex !== -1) {
          availableCredentialTable[credentialIndex] = {
            ...availableCredentialTable[credentialIndex],
            ...voteStatus,
          };
        } else {
          const lastElementIndex = availableCredentialTable.length - 1;
          if (lastElementIndex >= 0) {
            availableCredentialTable[lastElementIndex] = {
              ...availableCredentialTable[lastElementIndex],
              ...voteStatus,
            };
          }
        }
      }

      return availableCredentialTable;
    },
    [checkVoteStatus]
  );

  const checkEthOnChainVoteStatus = useCallback(
    async (
      availableCredentialTable: CredentialTable[]
    ): Promise<CredentialTable[]> => {
      if (!accountWagmi || !options || options.length === 0 || !poll) {
        return availableCredentialTable;
      }

      try {
        const ethOnChainIndex = availableCredentialTable.findIndex((cred) =>
          isEthHoldingCredentialOnChain(cred)
        );

        if (ethOnChainIndex !== -1) {
          if (userVotedOption) {
            availableCredentialTable[ethOnChainIndex] = {
              ...availableCredentialTable[ethOnChainIndex],
              votedOption: userVotedOption.optionId,
              votedOptionName: userVotedOption.optionDescription,
            };
          } else {
            const { votedOption, votedOptionName, ...restCredential } =
              availableCredentialTable[ethOnChainIndex];
            availableCredentialTable[ethOnChainIndex] = restCredential;
          }
        }
      } catch (error) {
        console.error('Error checking ETHOnChain vote status:', error);
      }

      return availableCredentialTable;
    },
    [accountWagmi, options, poll, userVotedOption]
  );

  const processWalletCredentials = useCallback(
    async (
      availableCredentialTable: CredentialTable[]
    ): Promise<{
      updatedCredentialTable: CredentialTable[];
      hasZupassRequirement: boolean;
    }> => {
      let hasZupassRequirement = false;

      if (!accountWagmi) {
        console.warn(
          'Wallet not connected. Skipping wallet-dependent credentials.'
        );
        return {
          updatedCredentialTable: availableCredentialTable,
          hasZupassRequirement,
        };
      }

      for (const credential of credentialTable) {
        if (isValidUuidV4(credential.id)) {
          let isAvailable = false;
          let identifier = accountWagmi;
          let credentialName = credential.credential;
          let additionalData: Partial<CredentialTable> = {};

          switch (credential.id) {
            case CREDENTIALS.EthHoldingOffchain.id:
              credentialName = CREDENTIALS.EthHoldingOffchain.name;
              const userEth = await getEthHoldings();
              if (userEth > 0) {
                isAvailable = true;
              }
              break;

            case CREDENTIALS.GitcoinPassport.id:
              credentialName = CREDENTIALS.GitcoinPassport.name;
              const gitscore = await fetchGitcoinScore(accountWagmi as string);
              if (
                gitscore !== undefined &&
                poll &&
                poll.gitcoin_score !== undefined &&
                gitscore >= poll.gitcoin_score
              ) {
                isAvailable = true;
                additionalData.gitscore = gitscore;
              } else {
                console.log(
                  `Gitcoin score ${gitscore} does not meet requirement ${poll?.gitcoin_score}`
                );
              }
              break;

            case CREDENTIALS.POAPapi.id:
              credentialName = CREDENTIALS.POAPapi.name;
              if (
                poll &&
                poll.poap_events &&
                poll.poap_events.length > 0 &&
                poll.poap_number !== undefined
              ) {
                try {
                  const userOwnedPoapIds = await fetchPoapOwnership(
                    accountWagmi as string,
                    poll.poap_events
                  );

                  if (userOwnedPoapIds.length >= Number(poll.poap_number)) {
                    isAvailable = true;
                    additionalData.poap_events = userOwnedPoapIds;
                  } else {
                    console.log(
                      `User POAP count ${userOwnedPoapIds.length} does not meet requirement ${poll.poap_number}`
                    );
                  }
                } catch (error) {
                  console.error('Error processing POAP events:', error);
                }
              } else {
                console.warn(
                  'POAP requirements not fully defined in poll data.'
                );
              }
              break;

            case CREDENTIALS.ProtocolGuildMember.id:
              credentialName = CREDENTIALS.ProtocolGuildMember.name;
              if (
                ProtocolGuildMembershipList.includes(accountWagmi.toLowerCase())
              ) {
                isAvailable = true;
              }
              break;

            case CREDENTIALS.EthSoloStaker.id:
              credentialName = CREDENTIALS.EthSoloStaker.name;
              if (SoloStakerList.includes(accountWagmi.toLowerCase())) {
                isAvailable = true;
              }
              break;

            case CREDENTIALS.WhitelistedAddresses.id:
              credentialName = CREDENTIALS.WhitelistedAddresses.name;
              if (
                poll?.white_list &&
                Array.isArray(poll.white_list) &&
                poll.white_list.some(
                  (address: string) =>
                    address.toLowerCase() === accountWagmi.toLowerCase()
                )
              ) {
                isAvailable = true;
              }
              break;

            case CREDENTIALS.ZuConnectResident.id:
            case CREDENTIALS.DevConnect.id:
            case CREDENTIALS.ZuzaluResident.id:
              hasZupassRequirement = true;
              continue;

            default:
              console.warn('Unhandled credential ID (UUID):', credential.id);
              continue;
          }

          if (isAvailable) {
            const availableCred: CredentialTable = {
              id: credential.id,
              identifier: identifier,
              credential: credentialName,
              ...additionalData,
            };
            availableCredentialTable.push(availableCred);

            await updateCredentialWithVoteStatus(
              availableCredentialTable,
              { id: credential.id, identifier, credential: credentialName },
              identifier
            );
          }
        } else if (credential.credential === 'EthHolding on-chain') {
          const ethOnChainCred = { ...credential };
          availableCredentialTable.push(ethOnChainCred);

          await checkEthOnChainVoteStatus(availableCredentialTable);
        } else if (
          credential.credential === 'ProtocolGuild on-chain' &&
          accountWagmi
        ) {
          if (ProtocolGuildMembershipList.includes(accountWagmi as string)) {
            availableCredentialTable.push(credential);
          }
        }
      }

      return {
        updatedCredentialTable: availableCredentialTable,
        hasZupassRequirement,
      };
    },
    [
      accountWagmi,
      credentialTable,
      getEthHoldings,
      poll,
      fetchGitcoinScore,
      fetchPoapOwnership,
      updateCredentialWithVoteStatus,
      checkEthOnChainVoteStatus,
    ]
  );

  const processZupassCredentials = useCallback(
    async (
      availableCredentialTable: CredentialTable[],
      hasZupassRequirement: boolean
    ): Promise<CredentialTable[]> => {
      if (!hasZupassRequirement) {
        return availableCredentialTable;
      }

      setZupassPoll(true);

      if (isPassportConnected) {
        const zuconnectCred = credentialTable.find(
          (c) => c.id === CREDENTIALS.ZuConnectResident.id
        );
        if (zuconnectCred && localStorage.getItem('zuconnectNullifier')) {
          const identifier = localStorage.getItem(
            'zuconnectNullifier'
          ) as string;
          const availableCred: CredentialTable = {
            id: CREDENTIALS.ZuConnectResident.id,
            identifier: identifier,
            credential: CREDENTIALS.ZuConnectResident.name,
          };
          availableCredentialTable.push(availableCred);

          await updateCredentialWithVoteStatus(
            availableCredentialTable,
            {
              id: CREDENTIALS.ZuConnectResident.id,
              identifier,
              credential: CREDENTIALS.ZuConnectResident.name,
            },
            identifier
          );
        }

        const devconnectCred = credentialTable.find(
          (c) => c.id === CREDENTIALS.DevConnect.id
        );
        if (devconnectCred && localStorage.getItem('devconnectNullifier')) {
          const identifier = localStorage.getItem(
            'devconnectNullifier'
          ) as string;
          const availableCred: CredentialTable = {
            id: CREDENTIALS.DevConnect.id,
            identifier: identifier,
            credential: CREDENTIALS.DevConnect.name,
          };
          availableCredentialTable.push(availableCred);

          await updateCredentialWithVoteStatus(
            availableCredentialTable,
            {
              id: CREDENTIALS.DevConnect.id,
              identifier,
              credential: CREDENTIALS.DevConnect.name,
            },
            identifier
          );
        }

        const zuzaluCred = credentialTable.find(
          (c) => c.id === CREDENTIALS.ZuzaluResident.id
        );
        if (zuzaluCred && localStorage.getItem('zuzaluNullifier')) {
          const identifier = localStorage.getItem('zuzaluNullifier') as string;
          const availableCred: CredentialTable = {
            id: CREDENTIALS.ZuzaluResident.id,
            identifier: identifier,
            credential: CREDENTIALS.ZuzaluResident.name,
          };
          availableCredentialTable.push(availableCred);

          await updateCredentialWithVoteStatus(
            availableCredentialTable,
            {
              id: CREDENTIALS.ZuzaluResident.id,
              identifier,
              credential: CREDENTIALS.ZuzaluResident.name,
            },
            identifier
          );
        }
      } else {
        console.log('Zupass not connected. Skipping Zupass credentials check.');
      }

      if (
        credentialTable.some((credential) =>
          [
            CREDENTIALS.DevConnect.id,
            CREDENTIALS.ZuConnectResident.id,
            CREDENTIALS.ZuzaluResident.id,
          ].includes(credential.id)
        )
      ) {
        setExpandedIds((prevIds) => {
          if (!prevIds.includes('Zupass')) {
            return [...prevIds, 'Zupass'];
          }
          return prevIds;
        });
      }

      return availableCredentialTable;
    },
    [credentialTable, isPassportConnected, updateCredentialWithVoteStatus]
  );

  const checkAndSetCredentialsAndVotes = useCallback(async () => {
    if (!credentialTable || !pollId || !options || options.length === 0) {
      console.log('Waiting for poll data to check credentials...');
      if (credentialTable && credentialTable.length > 0) {
        setCredentialCardReady(true);
        setIsLoading(false);
      } else {
        setCredentialCardReady(false);
      }
      return;
    }

    setCredentialCardReady(false);
    setIsLoading(true);
    setError(null);

    try {
      const availableCredentialTable: CredentialTable[] = [];

      const { updatedCredentialTable, hasZupassRequirement } =
        await processWalletCredentials(availableCredentialTable);

      const finalCredentialTable = await processZupassCredentials(
        updatedCredentialTable,
        hasZupassRequirement
      );

      setAvailableCredentialTable(finalCredentialTable);
      setCredentialCardReady(true);
      if (!isUserDataFetched) {
        setIsUserDataFetched(true);
      }
    } catch (error) {
      console.error('Error checking credentials and votes:', error);
      setError(error as Error);
      if (credentialTable && credentialTable.length > 0) {
        setCredentialCardReady(true);
      } else {
        setCredentialCardReady(false);
      }
    } finally {
      setIsLoading(false);
    }
  }, [
    credentialTable,
    options,
    pollId,
    isUserDataFetched,
    processWalletCredentials,
    processZupassCredentials,
  ]);

  const handleZupassConnect = useCallback(
    async (credentialId: string) => {
      setIsLoading(true);
      try {
        switch (credentialId) {
          case CREDENTIALS.DevConnect.id:
            await devconnectVerify();
            break;
          case CREDENTIALS.ZuConnectResident.id:
            await verifyZuconnectticket();
            break;
          case CREDENTIALS.ZuzaluResident.id:
            await zuzaluVerify();
            break;
          default:
            console.warn('Unknown Zupass credential ID:', credentialId);
            setIsLoading(false);
            return;
        }
        await checkAndSetCredentialsAndVotes();
      } catch (error) {
        console.error('Error connecting to Zupass:', error);
        toast({
          title: 'Error',
          description: 'Failed to connect to Zupass',
          variant: 'destructive',
        });
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [
      devconnectVerify,
      verifyZuconnectticket,
      zuzaluVerify,
      checkAndSetCredentialsAndVotes,
    ]
  );

  useEffect(() => {
    if (isPollDataFetched) {
      checkAndSetCredentialsAndVotes();
    } else {
      setAvailableCredentialTable([]);
      if (!credentialTable || credentialTable.length === 0) {
        setCredentialCardReady(false);
        setIsLoading(true);
      } else {
        setCredentialCardReady(true);
        setIsLoading(false);
        if (!isUserDataFetched && credentialTable.length > 0) {
          setIsUserDataFetched(true);
        }
      }
    }
  }, [
    isPollDataFetched,
    accountWagmi,
    isPassportConnected,
    pollId,
    credentialTable,
    options,
    checkAndSetCredentialsAndVotes,
    isUserDataFetched,
  ]);

  useEffect(() => {
    if (pollId !== undefined && accountWagmi) {
      getEthHoldings();
    }
  }, [pollId, accountWagmi, getEthHoldings]);

  const toggleCredentialExpand = useCallback((credentialId: string) => {
    setExpandedIds((prevIds) =>
      prevIds.includes(credentialId)
        ? prevIds.filter((id) => id !== credentialId)
        : [...prevIds, credentialId]
    );
  }, []);

  return {
    userAvailableCredentials: userAvailableCredentialTable,
    userEthHolding,
    userScore: score,
    credentialCardReady,
    checkCredentials: checkAndSetCredentialsAndVotes,
    isLoading,
    error,
    expandedIds,
    isAddressExpanded,
    handleAddressToggleExpanded,
    zupassPoll,
    getEthHoldings,
    handleZupassConnect,
    toggleCredentialExpand,
    signIn,
    isUserDataFetched,
  };
}

export default useUserData;
