'use client';
import { useEffect, useState } from 'react';
import { ArrowLeftIcon } from '@/components/icons';
import Button from '@/components/ui/buttons/Button';
import CountdownTimer from '@/components/ui/CountDownTimer';
import { Label } from '@/components/ui/Label';
import { useRouter } from 'next/router';
import OptionButton from '@/components/ui/buttons/OptionButton';
import {
  fetchPollById,
  fetchVote,
  fetchCredentialVotes,
} from '@/controllers/poll.controller';
import { useUserPassportContext } from '@/context/PassportContext';
import { useAccount, useConnect, useSignMessage } from 'wagmi';
import { signTypedData } from '@wagmi/core';
import { Contract, ethers } from 'ethers';
import { calculateTimeRemaining } from '@/utils/index';
import PoapDetails from '@/components/POAPDetails';
import { fetchScore } from '@/controllers';
import { Loader } from '@/components/ui/Loader';
import {
  PollOptionType,
  Poll,
  PollTypes,
  VoteData,
  CredentialTable,
  SelectedOptionData,
  VotingProcess,
  AllAggregatedDataType,
} from '@/types';
import {
  CREDENTIALS,
  CONTRACT_ADDRESS,
  EIP712_DOMAIN,
  EIP712_TYPE,
} from '@/src/constants';
import { PollResultComponent } from '@/components/PollResult';
import { ContractPollResultComponent } from '@/components/EthPollResult';
import { getBalanceAtBlock } from '@/utils/getBalanceAtBlock';
import VotingContract from '../../carbonvote-contracts/deployment/contracts/VoteContract.sol/VotingContract.json';
import VotingOption from '../../carbonvote-contracts/deployment/contracts/VotingOption.sol/VotingOption.json';
import styles from '@/styles/poll.module.css';
import ConfirmationPopup from '@/components/ConfirmationPopup';
import { getProviderUrl } from '@/utils/getProviderUrl';
import { getImagePathByCredential, isValidUuidV4 } from '@/utils/index';
import { getPoapOwnership } from '@/controllers/poap.controller';
import { ProtocolGuildMembershipList } from '@/src/protocolguildmember';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { MultiplePeopleIcon } from '@/components/icons/multiplepeople';
import moment from 'moment-timezone';
import { ChevronDownIcon } from 'lucide-react';
import { LockIcon } from '@/components/icons/lock';
import { CheckCircleIcon } from '@/components/icons/checkcircle';
import { CheckCircleIconWhite } from '@/components/icons/checkcirclewhite';
import TruncateText from '@/components/TruncateText';
import { SoloStakerList } from '@/src/solostaker';
import { getLatestBlockNumber } from '@/utils/getLatestBlockNumber';
import { useLatestBlock } from '@/utils/useLatestBlock';
import { getEthersLogs } from '@/utils/getVoteTransactionHash';
import CastPopUp from '@/components/CastPopup'

const PollPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const handleBack = () => {
    router.push('/');
  };
  const [poll, setPoll] = useState<Poll>();
  const {
    signIn,
    isPassportConnected,
    verifyZuconnectticket,
    devconnectVerify,
    zuzaluVerify,
  } = useUserPassportContext(); // zupass
  const { address: account } = useAccount();
  const [options, setOptions] = useState<PollOptionType[]>([]);
  const [contractPollResult, setContractPollResult] = useState<
    AllAggregatedDataType[]
  >([]);
  // FIXME: What is the purpose of userEthHolding?
  const [userEthHolding, setUserEthHolding] = useState('0');
  const [pollIsLive, setPollIsLive] = useState<boolean>(false);
  const [score, setScore] = useState<number>();
  const [remainingTime, settimeRemaining] = useState('');
  const [eventDetails, setEventDetails] = useState<any[]>([]);
  const contractAbi = VotingContract.abi;
  const [pollContract, setPollContract] = useState<Contract | null>(null);
  const [pollType, setPollType] = useState<string>();
  const [endBlockNumber, setEndBlockNumber] = useState<number>();
  const [isEthHoldingPoll, setIsEthHoldingPoll] = useState<boolean>(false);
  const [isContractPoll, setIsContractPoll] = useState<boolean>(false);
  const [credentialTable, setNestedCredentialTable] = useState<
    CredentialTable[]
  >([]);
  const [userAvailableCredentialTable, setAvailableCredentialTable] = useState<
    CredentialTable[]
  >([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const handleAddressToggleExpanded = () => {
    setIsAddressExpanded(!isAddressExpanded);
  };
  const [isFetchFinish, setIsFetchFinish] = useState<boolean>(false);
  const [voteTable, setVoteTable] = useState<string[]>([]);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [zupasspoll, setZupassPoll] = useState(false);
  const [votingProcess, setVotingProcess] = useState<VotingProcess[]>([]);
  const [credentialCardReady, setCredentialCardReady] = useState(false);
  const [selectedOptionData, setSelectedOptionData] = useState<SelectedOptionData>();
  const [requiredgitscore, setRequiredGitScore] = useState(0);
  const [pollResult, setPollResult] = useState<VoteData[]>();

  const [refreshCount, setRefreshCount] = useState(0);
  const refreshLatestBlock = () => {
    setRefreshCount((prevCount) => prevCount + 1);
  };
  const latestBlockNumber = useLatestBlock(isEthHoldingPoll, refreshCount);
  const providerUrl = getProviderUrl();
  const provider = new ethers.JsonRpcProvider(providerUrl);
  async function getOptionVoteCounts() {
    if (
      id &&
      poll &&
      options &&
      credentialTable &&
      latestBlockNumber &&
      endBlockNumber
    ) {
      let blockNumber = latestBlockNumber;
      if (latestBlockNumber > endBlockNumber) {
        blockNumber = endBlockNumber;
      }
      console.log(latestBlockNumber, endBlockNumber, blockNumber, 'numbers');
      let allAggregatedData: AllAggregatedDataType[] = [];
      const filteredCredentials = credentialTable.filter(
        (cred) =>
          cred.credential === 'EthHolding on-chain' ||
          cred.credential === CREDENTIALS.EthHoldingOffchain.name
      );
      for (const cred of filteredCredentials) {
        try {
          let aggregatedDataForCurrentId = [...options];
          if (cred.credential === 'EthHolding on-chain') {
            const optionContractAbi = VotingOption.abi;
            for (const optionaddress of options) {
              if (optionaddress.address) {
                const contract = new ethers.Contract(
                  optionaddress.address as string,
                  optionContractAbi,
                  provider
                );
                if (contract !== null) {
                  let votersCount = await contract.getVotersCount();
                  let promises = [];
                  for (let i = 0; i < Number(votersCount); i++) {
                    promises.push(contract.voters(i));
                  }
                  const addresses = await Promise.all(promises);
                  promises = [];
                  for (const voterAddress of addresses) {
                    const balancePromise = await getBalanceAtBlock(
                      voterAddress,
                      blockNumber
                    )
                      .then((balance) => balance)
                      .catch((error) => {
                        console.error(
                          `Error getting balance for address ${voterAddress}:`,
                          error
                        );
                        return '0';
                      });
                    const transactionHashPromise = getEthersLogs(
                      voterAddress,
                      Number(cred.id)
                    ).catch((error) => {
                      console.error(
                        `Error getting logs for address ${voterAddress}:`,
                        error
                      );
                      return '';
                    });
                    promises.push(
                      Promise.all([
                        balancePromise,
                        transactionHashPromise,
                      ]).then(([balance, transactionHash]) => {
                        return {
                          address: voterAddress,
                          balance,
                          voteHash: transactionHash,
                        };
                      })
                    );
                  }
                  const votersData = await Promise.all(promises);
                  const totalBalance = votersData.reduce(
                    (acc, { balance }) =>
                      acc + BigInt(ethers.parseEther(balance)),
                    BigInt(0)
                  );
                  votersCount = Number(votersCount);
                  const optionName = await contract.name();
                  let optionToUpdateIndex =
                    aggregatedDataForCurrentId.findIndex(
                      (option) => option.option_description === optionName
                    );
                  if (optionToUpdateIndex !== -1) {
                    aggregatedDataForCurrentId[optionToUpdateIndex] = {
                      ...aggregatedDataForCurrentId[optionToUpdateIndex],
                      votersCount,
                      totalEth: ethers.formatEther(totalBalance),
                      votersData,
                    };
                  }
                }
              }
            }
          } else {
            const response = await fetchCredentialVotes({
              id: id as string,
              isEthHolding: true,
            });
            const data = await response.data;
            for (let voteData of data) {
              let totalBalance = BigInt(0);
              let votersData = [];

              for (let voterAddress of voteData.voters_account || []) {
                const balance = await getBalanceAtBlock(
                  voterAddress,
                  blockNumber
                );
                totalBalance += BigInt(ethers.parseEther(balance));

                votersData.push({
                  address: voterAddress,
                  balance: balance,
                });

                const optionToUpdateIndex =
                  aggregatedDataForCurrentId.findIndex(
                    (option) => option.id === voteData.id
                  );
                if (optionToUpdateIndex !== -1) {
                  aggregatedDataForCurrentId[optionToUpdateIndex].votersCount =
                    votersData.length;
                  aggregatedDataForCurrentId[optionToUpdateIndex].totalEth =
                    ethers.formatEther(totalBalance);
                  aggregatedDataForCurrentId[optionToUpdateIndex].votersData =
                    votersData;
                }
              }
            }
          }
          allAggregatedData.push({
            id: cred.id,
            aggregatedData: aggregatedDataForCurrentId,
          });
        } catch (error) {
          console.error('Error fetching data:', error);
        }
      }
      console.log(allAggregatedData, 'data fetched');
      setContractPollResult(allAggregatedData);
    }
  }

  useEffect(() => {
    if (latestBlockNumber !== null) {
      getOptionVoteCounts();
    }
  }, [
    credentialTable,
    latestBlockNumber,
    refreshCount,
    isFetchFinish,
    account,
    endBlockNumber,
  ]);

  const handleOptionSelect = (
    optionId: string,
    optionIndex: number | undefined,
    option_description: string
  ) => {
    console.log(
      optionId,
      voteTable,
      optionIndex,
      option_description,
      'handle option select'
    );
    setSelectedOptionData({
      optionId,
      optionIndex,
      option_description,
    });
    setIsPopupOpen(true);
  };

  useEffect(() => {
    const initialVotingProcess = voteTable.map((credentialId) => ({
      credentialId,
      status: 'pending',
    }));
    const updatedVotingProcess = initialVotingProcess.map((votingprocess) => {
      const foundCredential = credentialTable.find(
        (ct) => ct.id === votingprocess.credentialId
      );
      if (foundCredential && foundCredential.credential) {
        return { ...votingprocess, contractpoll: foundCredential.credential };
      }
      return votingprocess;
    });
    setVotingProcess(updatedVotingProcess);
    console.log(updatedVotingProcess, 'voting process');
  }, [voteTable]);

  useEffect(() => {
    console.log('current voting process', votingProcess);
    console.log('remaining time', remainingTime);
    console.log('contract poll type', pollType);
    console.log(remainingTime, 'remaining time');
    console.log(pollIsLive, 'is poll live1');
    if (remainingTime !== null && remainingTime !== 'Time is up!') {
      setPollIsLive(true);
    } else {
      setPollIsLive(false);
    }
    console.log(pollIsLive, 'is poll live2');
  }, [votingProcess, remainingTime, pollType]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleConfirmationPopupClose = async () => {
    setVoteTable([]);
    setShowConfirmationPopup(false);
    if (isValidUuidV4(id as string)) {
      await fetchPollFromApi(id);
      await getEthHoldings();
    } else {
      await fetchPollFromContract(id as string);
    }
    await getOptionVoteCounts();
    await checkAndSetCredentialsAndVotes();
  };

  useEffect(() => {
    if (id !== undefined) {
      if (isValidUuidV4(id as string)) {
        fetchPollFromApi(id);
        getEthHoldings();
      } else {
        fetchPollFromContract(id as string);
      }
    }
  }, [id]);

  useEffect(() => {
    checkAndSetCredentialsAndVotes();
  }, [isFetchFinish, account, isPassportConnected]);

  useEffect(() => {
    if (poll?.block_number) {
      getEthHoldings();
    }
  }, [id, poll?.block_number]);

  async function checkAndSetCredentialsAndVotes() {
    setCredentialCardReady(false);
    const availableCredentialTable: CredentialTable[] = [];
    if (credentialTable.length > 0) {
      for (let credential of credentialTable) {
        if (isValidUuidV4(credential.id)) {
          switch (credential.id) {
            case CREDENTIALS.ZuConnectResident.id:
              if (localStorage.getItem('zuconnectNullifier')) {
                availableCredentialTable.push({
                  id: CREDENTIALS.ZuConnectResident.id,
                  identifier: localStorage.getItem(
                    'zuconnectNullifier'
                  ) as string,
                  credential: CREDENTIALS.ZuConnectResident.name,
                });
                const checkdata = {
                  id: id as string,
                  identifier: localStorage.getItem('zuconnectNullifier'),
                  credential: CREDENTIALS.ZuConnectResident.id,
                };
                const responsevote = await fetchVote(checkdata);
                if (responsevote.data.option_id !== '') {
                  const lastElementIndex = availableCredentialTable.length - 1;
                  availableCredentialTable[lastElementIndex] = {
                    ...availableCredentialTable[lastElementIndex],
                    votedOption: responsevote.data.option_id,
                    votedOptionName: options.find(
                      (option) => option.id === responsevote.data.option_id
                    )?.option_description,
                  };
                }
              }
              break;
            case CREDENTIALS.DevConnect.id:
              if (localStorage.getItem('devconnectNullifier')) {
                availableCredentialTable.push({
                  id: CREDENTIALS.DevConnect.id,
                  identifier: localStorage.getItem(
                    'devconnectNullifier'
                  ) as string,
                  credential: CREDENTIALS.DevConnect.name,
                });
                const checkdata = {
                  id: id as string,
                  identifier: localStorage.getItem('devconnectNullifier'),
                  credential: CREDENTIALS.DevConnect.id,
                };
                const responsevote = await fetchVote(checkdata);
                if (responsevote.data.option_id !== '') {
                  const lastElementIndex = availableCredentialTable.length - 1;
                  availableCredentialTable[lastElementIndex] = {
                    ...availableCredentialTable[lastElementIndex],
                    votedOption: responsevote.data.option_id,
                    votedOptionName: options.find(
                      (option) => option.id === responsevote.data.option_id
                    )?.option_description,
                  };
                }
              }
              break;
            case CREDENTIALS.ZuzaluResident.id:
              if (localStorage.getItem('zuzaluNullifier')) {
                availableCredentialTable.push({
                  id: CREDENTIALS.ZuzaluResident.id,
                  identifier: localStorage.getItem('zuzaluNullifier') as string,
                  credential: CREDENTIALS.ZuzaluResident.name,
                });
                const checkdata = {
                  id: id as string,
                  identifier: localStorage.getItem('zuzaluNullifier'),
                  credential: CREDENTIALS.ZuzaluResident.id,
                };
                const responsevote = await fetchVote(checkdata);
                if (responsevote.data.option_id !== '') {
                  const lastElementIndex = availableCredentialTable.length - 1;
                  availableCredentialTable[lastElementIndex] = {
                    ...availableCredentialTable[lastElementIndex],
                    votedOption: responsevote.data.option_id,
                    votedOptionName: options.find(
                      (option) => option.id === responsevote.data.option_id
                    )?.option_description,
                  };
                }
              }
              break;
            case CREDENTIALS.EthHoldingOffchain.id:
              if (account) {
                let userEth = await getEthHoldings();
                if (userEth != 0) {
                  availableCredentialTable.push({
                    id: CREDENTIALS.EthHoldingOffchain.id,
                    identifier: account,
                    credential: CREDENTIALS.EthHoldingOffchain.name,
                  });
                  const checkdata = {
                    id: id as string,
                    identifier: account,
                    credential: CREDENTIALS.EthHoldingOffchain.id,
                  };
                  const responsevote = await fetchVote(checkdata);
                  if (responsevote.data.option_id !== '') {
                    const lastElementIndex =
                      availableCredentialTable.length - 1;
                    availableCredentialTable[lastElementIndex] = {
                      ...availableCredentialTable[lastElementIndex],
                      votedOption: responsevote.data.option_id,
                      votedOptionName: options.find(
                        (option) => option.id === responsevote.data.option_id
                      )?.option_description,
                    };
                  }
                }
              }
              break;
            case CREDENTIALS.GitcoinPassport.id:
              if (account) {
                const fetchNewScore = async () => {
                  let fetchScoreData = {
                    address: account as string,
                    scorerId: '6347',
                  };
                  try {
                    let scoreResponse = await fetchScore(fetchScoreData);
                    let scoreData = scoreResponse.data;
                    console.log(scoreData.score.toString(), 'score');
                    setScore(scoreData.score);
                    return scoreData.score;
                  } catch (error) {
                    console.error('Error fetching score:', error);
                  }
                };
                let gitscore = await fetchNewScore();
                if (
                  poll &&
                  poll.gitcoin_score !== undefined &&
                  gitscore >= poll.gitcoin_score
                ) {
                  availableCredentialTable.push({
                    id: CREDENTIALS.GitcoinPassport.id,
                    identifier: account,
                    credential: CREDENTIALS.GitcoinPassport.name,
                    gitscore: gitscore,
                  });
                  const checkdata = {
                    id: id as string,
                    identifier: account,
                    credential: CREDENTIALS.GitcoinPassport.id,
                  };
                  const responsevote = await fetchVote(checkdata);
                  if (responsevote.data.option_id !== '') {
                    const lastElementIndex =
                      availableCredentialTable.length - 1;
                    availableCredentialTable[lastElementIndex] = {
                      ...availableCredentialTable[lastElementIndex],
                      votedOption: responsevote.data.option_id,
                      votedOptionName: options.find(
                        (option) => option.id === responsevote.data.option_id
                      )?.option_description,
                    };
                  }
                } else {
                  console.log(gitscore, 'not enough score');
                }
              }
              break;
            case CREDENTIALS.POAPapi.id:
              if (account) {
                try {
                  const ownershipPromises = (
                    credential.poap_events as string[]
                  ).map((eventId) =>
                    getPoapOwnership(account, eventId).then((response) => {
                      const hasOwnership = response?.data?.owner;
                      return {
                        eventId,
                        hasOwnership,
                      };
                    })
                  );
                  const ownershipResults = await Promise.all(ownershipPromises);
                  const userPoapIds = ownershipResults
                    .filter((result) => result.hasOwnership)
                    .map((result) => result.eventId);
                  if (
                    poll &&
                    poll.poap_number !== undefined &&
                    userPoapIds.length >= Number(poll.poap_number)
                  ) {
                    availableCredentialTable.push({
                      id: CREDENTIALS.POAPapi.id,
                      identifier: account,
                      credential: CREDENTIALS.POAPapi.name,
                      poap_events: userPoapIds,
                    });

                    const checkdata = {
                      id: id as string,
                      identifier: account,
                      credential: CREDENTIALS.POAPapi.id,
                    };

                    const responsevote = await fetchVote(checkdata);
                    if (responsevote.data.option_id !== '') {
                      const lastElementIndex =
                        availableCredentialTable.length - 1;
                      availableCredentialTable[lastElementIndex] = {
                        ...availableCredentialTable[lastElementIndex],
                        votedOption: responsevote.data.option_id,
                        votedOptionName: options.find(
                          (option) => option.id === responsevote.data.option_id
                        )?.option_description,
                      };
                    }
                  }
                } catch (error) {
                  console.error('Error processing POAP events:', error);
                }
              }
              break;
            case CREDENTIALS.ProtocolGuildMember.id:
              if (account) {
                if (ProtocolGuildMembershipList.includes(account)) {
                  availableCredentialTable.push({
                    id: CREDENTIALS.ProtocolGuildMember.id,
                    credential: CREDENTIALS.ProtocolGuildMember.name,
                    identifier: account,
                  });
                  const checkdata = {
                    id: id as string,
                    identifier: account,
                    credential: CREDENTIALS.ProtocolGuildMember.id,
                  };
                  const responsevote = await fetchVote(checkdata);
                  if (responsevote.data.option_id !== '') {
                    const lastElementIndex =
                      availableCredentialTable.length - 1;
                    availableCredentialTable[lastElementIndex] = {
                      ...availableCredentialTable[lastElementIndex],
                      votedOption: responsevote.data.option_id,
                      votedOptionName: options.find(
                        (option) => option.id === responsevote.data.option_id
                      )?.option_description,
                    };
                  }
                }
              }
              break;
            case CREDENTIALS.EthSoloStaker.id:
              if (account) {
                if (SoloStakerList.includes(account)) {
                  availableCredentialTable.push({
                    id: CREDENTIALS.EthSoloStaker.id,
                    credential: CREDENTIALS.EthSoloStaker.name,
                    identifier: account,
                  });
                  const checkdata = {
                    id: id as string,
                    identifier: account,
                    credential: CREDENTIALS.EthSoloStaker.id,
                  };
                  const responsevote = await fetchVote(checkdata);
                  if (responsevote.data.option_id !== '') {
                    const lastElementIndex =
                      availableCredentialTable.length - 1;
                    availableCredentialTable[lastElementIndex] = {
                      ...availableCredentialTable[lastElementIndex],
                      votedOption: responsevote.data.option_id,
                      votedOptionName: options.find(
                        (option) => option.id === responsevote.data.option_id
                      )?.option_description,
                    };
                  }
                }
              }
              break;
          }
        } else if (credential.credential === 'EthHolding on-chain') {
          availableCredentialTable.push(credential);
        } else if (
          credential.credential === 'ProtocolGuild on-chain' &&
          account
        ) {
          if (ProtocolGuildMembershipList.includes(account as string)) {
            availableCredentialTable.push(credential);
          }
        }
      }
    } else {
      if (pollType === '0') {
        console.log('here');
        availableCredentialTable.push({
          id: id as string,
          identifier: account,
          credential: 'EthHolding on-chain',
        });
      } else {
        availableCredentialTable.push({
          id: id as string,
          identifier: account,
          credential: 'ProtocolGuild on-chain',
        });
      }
    }
    setAvailableCredentialTable(availableCredentialTable);
    if (!account) {
      const filteredCredentialTable = availableCredentialTable.filter(
        (credential) => {
          const accountDependentCredentials = [
            CREDENTIALS.EthHoldingOffchain.name,
            CREDENTIALS.GitcoinPassport.name,
            CREDENTIALS.POAPapi.name,
            CREDENTIALS.ProtocolGuildMember.name,
            CREDENTIALS.EthSoloStaker.name,
            'ProtocolGuild on-chain',
            'EthHolding on-chain',
          ];
          return !accountDependentCredentials.includes(credential.id);
        }
      );
      setAvailableCredentialTable(filteredCredentialTable);
    }
    if (!isPassportConnected) {
      const filteredCredentialTable = availableCredentialTable.filter(
        (credential) => {
          const accountDependentCredentials = [
            CREDENTIALS.ZuConnectResident.id,
            CREDENTIALS.ZuConnectResident.id,
            CREDENTIALS.DevConnect.id,
          ];
          return !accountDependentCredentials.includes(credential.id);
        }
      );
      setAvailableCredentialTable(filteredCredentialTable);
    }
    console.log(availableCredentialTable, 'available credential table');
    const containsZupassCredentials = availableCredentialTable.some(
      (credential) =>
        [
          CREDENTIALS.ZuConnectResident.id,
          CREDENTIALS.DevConnect.id,
          CREDENTIALS.ZuzaluResident.id,
        ].includes(credential.id)
    );
    if (containsZupassCredentials) {
      setZupassPoll(true);
    }
    refreshLatestBlock;
    if (
      credentialTable.some((credential) =>
        [
          CREDENTIALS.DevConnect.id,
          CREDENTIALS.ZuConnectResident.id,
          CREDENTIALS.ZuzaluResident.id,
        ].includes(credential.id)
      )
    ) {
      setExpandedIds((prevIds) => [...prevIds, 'Zupass']);
    }
    setCredentialCardReady(true);
  }

  const getEthHoldings = async () => {
    if (account) {
      const blockNumber = await getLatestBlockNumber();
      const userBalance = await getBalanceAtBlock(
        account as string,
        blockNumber as number
      );
      console.log(
        `account ${account} Balance at block ${blockNumber}: ${userBalance} ETH`
      );
      setUserEthHolding(parseFloat(userBalance).toFixed(2));
      return parseFloat(userBalance);
    }
  };

  const handleZupassConnect = async (credentialId: string) => {
    switch (credentialId) {
      case CREDENTIALS.DevConnect.id:
        await devconnectVerify();
        await checkAndSetCredentialsAndVotes();
        break;
      case CREDENTIALS.ZuConnectResident.id:
        await verifyZuconnectticket();
        await checkAndSetCredentialsAndVotes();
        break;
      case CREDENTIALS.ZuzaluResident.id:
        await zuzaluVerify();
        await checkAndSetCredentialsAndVotes();
        break;
    }
  };
  const fetchPollFromApi = async (pollId: string | string[] | undefined) => {
    try {
      const response = await fetchPollById(pollId as string);
      const data = await response.data;
      console.log(data, 'pollData');
      setPoll(data);
      data.options.sort(
        (a: PollOptionType, b: PollOptionType) =>
          a.option_index! - b.option_index!
      );
      setOptions(data.options);
      setRequiredGitScore(data.gitcoin_score);
      let nestedCredentialTable: CredentialTable[] = [];
      for (const index of data.contractpoll_index) {
        console.log(index, 'fetching index');
        const result = (await fetchPollFromContract(
          index,
          data.options
        )) as CredentialTable[];
        nestedCredentialTable = nestedCredentialTable.concat(result);
      }
      console.log(nestedCredentialTable, 'contract Table');
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
              setIsEthHoldingPoll(true);
            }
            nestedCredentialTable.push(pushObject);
          }
        });
      });
      console.log(nestedCredentialTable, 'nestedcredentialtable');
      const timeleft = calculateTimeRemaining(data.endTime);
      if (data.end_block_number) {
        setEndBlockNumber(data.end_block_number);
      }
      try {
        const response = await fetchCredentialVotes({ id: id as string });
        console.log(response.data);
        setPollResult(response.data);
      } catch (error) {
        console.error('Error fetching poll result:', error);
      }
      if (timeleft) {
        settimeRemaining(timeleft);
      }
      /*if (newCredentialId) {
        setCredentialId(newCredentialId);
        console.log('credential ID', newCredentialId);
      }*/
      setNestedCredentialTable(nestedCredentialTable);
      setIsFetchFinish(true);
      //console.log(pollIsLive, 'live');
    } catch (error) {
      console.error('Error fetching poll from API:', error);
    }
  };

  const fetchPollFromContract = async (
    pollId: string,
    existingoptions?: PollOptionType[]
  ) => {
    if (pollId) {
      //let provider = new ethers.BrowserProvider(window.ethereum as any);
      //let signer = await provider.getSigner();
      //const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      try {
        const provider = new ethers.JsonRpcProvider(getProviderUrl());
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractAbi,
          provider
        );
        setPollContract(contract);
        const nestedCredentialTable: CredentialTable[] = [];
        if (contract !== null) {
          const pollData = await contract.getPoll(pollId);
          // console.log(contract);
          console.log(pollData, 'pollData');
          if (!existingoptions) {
            setPoll(pollData);
          }
          setPollType(pollData[4].toString());
          setEndBlockNumber(Number(pollData.endBlockNumber));
          //pollType = pollData.pollType;
          const contractpoll_type = pollData[4].toString();
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
          } else {
            console.log('no poll type');
          }
          const timeleft = calculateTimeRemaining(
            Number(pollData.endTime) * 1000
          );
          if (!timeleft) {
          } else {
            settimeRemaining(timeleft);
            console.log(timeleft, 'time left contract poll');
          }
          const provider = new ethers.JsonRpcProvider(getProviderUrl());
          console.log(pollData.options, 'poll.options');
          const optionContractAbi = VotingOption.abi;
          let updatedOptions = existingoptions || [];
          for (const address of pollData.options) {
            const contract = new ethers.Contract(
              address,
              optionContractAbi,
              provider
            );
            try {
              const optionName = await contract.name();
              const index = await contract.option_index();
              if (existingoptions) {
                if (contractpoll_type === '0') {
                  console.log(existingoptions, 'nested option');
                  console.log(optionName, 'option name');
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
                  pollId: id as string,
                  option_description: optionName,
                  address: address,
                  votersCount: 0,
                  totalEth: '0',
                  votersData: [],
                  option_index: Number(index),
                });
              }
            } catch (error) {
              console.error('Error fetching options:', error);
            }
          }
          if (updatedOptions != existingoptions) {
            updatedOptions.sort(
              (a: PollOptionType, b: PollOptionType) =>
                a.option_index! - b.option_index!
            );
            setOptions(updatedOptions);
            console.log(updatedOptions, 'updated option');
          }
          console.log(updatedOptions, 'updated option1');
        } else {
          console.log('Poll contract not existe');
        }
        if (!existingoptions) {
          setIsFetchFinish(true);
          setNestedCredentialTable(nestedCredentialTable);
        }
        console.log(nestedCredentialTable, 'contract nested table');
        return nestedCredentialTable;
      } catch (error) {
        console.error('Error fetching poll:', error);
      }
    }
  };

  const timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeZoneAbbr = moment().tz(timeZone).format('zz');

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Address copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };
  if (!poll) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
  }
  //To do: Create a child component （don't have time for now)
  function renderCredentialDetails(credentialName: string) {
    switch (credentialName) {
      case 'EthHolding on-chain':
        return (
          <div className="flex flex-col gap-1">
            <div className="text-sm">Need to have an Ethereum address</div>
            <div className="text-sm">Poll end block: {endBlockNumber}</div>
            <div className="flex items-center gap-2">
              {account ? (
                <div className={styles.avail_cred}>
                  <TruncateText text={account} maxLength={15} />
                  <CheckCircleIconWhite className={styles.avail_cred_icon} />
                </div>
              ) : (
                <ConnectButton />
              )}
            </div>
          </div>
        );
      case CREDENTIALS.EthHoldingOffchain.name:
        return (
          <div className="flex flex-col gap-1">
            <div
              className="text-s"
              style={{
                border: '1px solid #ccc',
                padding: '10px',
                borderRadius: '5px',
                backgroundColor: '#f9f9f9',
                marginTop: '10px',
                marginBottom: '10px',
              }}
            >
              All voting is off-chain and does not require you to pay any
              transaction fees.
            </div>
            <div className="text-sm">Need to have an Ethereum address</div>
            <div className="text-sm">Poll end block: {endBlockNumber}</div>
            <div className="flex items-center gap-2">
              {account ? (
                <div className={styles.avail_cred}>
                  <TruncateText text={account} maxLength={15} />
                  <CheckCircleIconWhite className={styles.avail_cred_icon} />
                </div>
              ) : (
                <ConnectButton />
              )}
            </div>
          </div>
        );
      /*case CREDENTIALS.ProtocolGuildMember.name:
      case 'ProtocolGuild on-chain':
        const isMember = userAvailableCredentialTable.some(
          (credentialItem) =>
            credentialItem.id === CREDENTIALS.ProtocolGuildMember.id ||
            credentialItem.credential === 'ProtocolGuild on-chain'
        );
        return (
          <div className="flex flex-col gap-1">
            <div className="text-sm">Need to be a member of Protocol Guild</div>
            <div>
              <p className={styles.desc_p}>
                <a
                  href="https://app.splits.org/accounts/0xF29Ff96aaEa6C9A1fBa851f74737f3c069d4f1a9/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'blue', textTransform: 'uppercase' }}
                >
                  Source link
                </a>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm">
                {account ? (
                  isMember ? (
                    <div className={styles.avail_cred}>
                      Protocol Guild Member
                      <CheckCircleIconWhite
                        className={styles.avail_cred_icon}
                      />
                    </div>
                  ) : (
                    'You are not a Protocol Guild member'
                  )
                ) : (
                  <ConnectButton />
                )}
              </div>
            </div>
          </div>
        );*/
      case CREDENTIALS.GitcoinPassport.name:
        const hasScore = userAvailableCredentialTable.some(
          (credentialItem) =>
            credentialItem.id === CREDENTIALS.GitcoinPassport.id
        );

        return (
          <div className="flex flex-col gap-1">
            <div className="text-sm">
              Minimum score required: {requiredgitscore}
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm">
                {account ? score : <ConnectButton />}
              </div>
            </div>
          </div>
        );
      case CREDENTIALS.POAPapi.name:
        const hasPoaps = userAvailableCredentialTable.some(
          (credentialItem) => credentialItem.id === CREDENTIALS.POAPapi.id
        );
        return (
          <div className="flex flex-col gap-1">
            <div className="text-sm">
              Need to have a minimum of {poll?.poap_number} POAPs
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm">
                {account ? (
                  <PoapDetails
                    poapEvents={poll?.poap_events as number[]}
                    account={account as string}
                    eventDetails={eventDetails}
                    setEventDetails={setEventDetails}
                  />
                ) : (
                  <ConnectButton />
                )}
              </div>
            </div>
          </div>
        );
      case CREDENTIALS.EthSoloStaker.name:
        const isStaker = userAvailableCredentialTable.some(
          (credentialItem) => credentialItem.id === CREDENTIALS.EthSoloStaker.id
        );
        return (
          <div className="flex flex-col gap-1">
            <div className="text-sm">Need to be a valid Solo Staker</div>
            <div>
              <p className={styles.desc_p}>
                <a
                  href="https://github.com/starknet-io/provisions-data/tree/main/eth"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'blue', textTransform: 'uppercase' }}
                >
                  Source link
                </a>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm">
                {account ? (
                  isStaker ? (
                    <div className={styles.avail_cred}>
                      Ether Solo Staker
                      <CheckCircleIconWhite
                        className={styles.avail_cred_icon}
                      />
                    </div>
                  ) : (
                    'You are not a valid solo staker'
                  )
                ) : (
                  <ConnectButton />
                )}
              </div>
            </div>
          </div>
        );
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-20 px-20 pt-5 text-black w-full justify-center">
      <div className="flex flex-col gap-2.5 max-w-[1000px] w-full">
        <div>
          <Button
            className="rounded-full"
            leftIcon={ArrowLeftIcon}
            onClick={handleBack}
          >
            Backd
          </Button>
        </div>

        <div className="bg-white flex flex-col gap-7.5 rounded-xl border border-black border-opacity-10">
          <div className="flex flex-col p-5 gap-5 border-b border-black border-opacity-10">
            <div className="flex gap-3.5">
              {pollIsLive ? (
                <div className="px-2.5 py-0.5 bg-[#44b678] bg-opacity-20 rounded-lg">
                  <Label className="text-[#44b678] text-md font-bold">
                    Live
                  </Label>
                </div>
              ) : (
                <div className="px-2.5 py-0.5 opacity-60 bg-red-500 bg-opacity-20 rounded-lg">
                  <Label className="text-black text-red-500 font-bold">
                    Closed
                  </Label>
                </div>
              )}

              <div className={styles.countdown}>
                <img
                  src="/images/clock.svg"
                  className={styles.countdown_icon}
                />
                <CountdownTimer endTime={poll.endTime} />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-black uppercase opacity-50 text-base">
                Motion:
              </Label>
              <Label className="text-2xl">{poll?.title || poll?.name}</Label>
            </div>
          </div>

          <div className="flex flex-col p-5 gap-2.5">
            <Label className="text-sm uppercase text-black opacity-50 font-extrabold">
              Description:
            </Label>
            <span dangerouslySetInnerHTML={{ __html: poll?.description }} />
          </div>
        </div>

        <div className={styles.voting_container}>
          {pollIsLive ? (
            <>
              <Label className={styles.container_header}>Vote on Poll</Label>
              <div className={styles.nested_poll_header}>
                <h4>
                  This is a nested poll. You can vote with multiple credentials.
                </h4>
                <p>Votes will be segmented by credentials</p>
              </div>
              <div className={styles.options_container}>
                {options?.map((option) => (
                  <OptionButton
                    key={option.id}
                    id={option.id}
                    optionName={option.option_description}
                    onVote={() =>
                      handleOptionSelect(
                        option.id,
                        option.option_index,
                        option.option_description
                      )
                    }
                    optionAddress={undefined}
                  />
                ))}
              </div>
              {isContractPoll && (
                <div className={styles.eth_holding_container}>
                  <div>
                    <img src="/images/eth_logo.svg" />
                    <h4>
                      Ether Holding Credential{' '}
                      <span>
                        requires a <strong>zero-value transaction</strong> from
                        your wallet.
                      </span>
                    </h4>
                  </div>
                  <p>
                    Optionally, you can manually send a zero-value transaction
                    by pasting the address directly from your wallet.
                  </p>
                  <div>
                    <div className="w-full flex flex-col gap-2.5">
                      <button onClick={handleAddressToggleExpanded}>
                        {isAddressExpanded
                          ? 'Hide Addresses'
                          : 'Show Addresses'}
                      </button>

                      {isAddressExpanded && (
                        <div className="w-full flex flex-col gap-2">
                          {options.map((option, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between w-full"
                              style={{ paddingLeft: '10px' }}
                            >
                              <p
                                className="font-bold"
                                style={{ marginRight: 'auto' }}
                              >
                                {option.option_description}
                              </p>
                              <p style={{ width: '50%', textAlign: 'center' }}>
                                {option.address}
                              </p>
                              <button
                                onClick={() =>
                                  copyToClipboard(option.address as string)
                                }
                                style={{ marginLeft: 'auto' }}
                              >
                                Copy
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className={styles.poll_finished}>
              <h3>Poll finished</h3>
              <div></div>
            </div>
          )}
        </div>
        <CastPopUp
          isPopupOpen={isPopupOpen} setIsPopupOpen={setIsPopupOpen}
          poll={poll}
          selectedOptionData={selectedOptionData}
          credentialTable={credentialTable}
          userAvailableCredentialTable={userAvailableCredentialTable}
          setShowConfirmationPopup={setShowConfirmationPopup}
          setVotingProcess={setVotingProcess}
          isPassportConnected={isPassportConnected}
          voteTable={voteTable}
          setVoteTable={setVoteTable}
        />
        {
          showConfirmationPopup && (
            <ConfirmationPopup
              votingProcess={votingProcess}
              onClose={handleConfirmationPopupClose}
              option_description={
                selectedOptionData?.option_description as string
              }
            />
          )
        }
        {
          isEthHoldingPoll && (
            <ContractPollResultComponent
              allAggregatedData={contractPollResult}
              currentBlock={latestBlockNumber as number}
              endBlock={endBlockNumber as number}
              onRefresh={refreshLatestBlock}
            />
          )
        }
        <PollResultComponent
          pollType={PollTypes.HEAD_COUNT}
          optionsData={pollResult as VoteData[]}
          credentialTable={credentialTable}
        />
      </div >

      <div className="flex flex-col pb-4 gap-5 w-96">
        <div className="bg-white rounded-lg border border-black border-opacity-10">
          <div className="w-full px-5 py-2.5">
            <Label className="text-lg font-semibold">Details</Label>
          </div>

          <div className="border-b border-black border-opacity-10" />

          <div className="w-full flex flex-col p-3.5 gap-3.5">
            <div className="flex flex-col gap-2.5">
              <Label className="text-base opacity-80">Method:</Label>

              <div className="flex flex-wrap items-center gap-1">
                <div className="flex px-2.5 py-1 gap-1 bg-black bg-opacity-5 rounded-xl">
                  <MultiplePeopleIcon className="w-5 h-5" />
                  <Label className="text-black text-opacity-50 font-bold text-sm">
                    {credentialTable.length > 1 ? 'Nested poll' : null}
                  </Label>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1">
              {poll.ipfs_link ? (
                <a
                  href={poll.ipfs_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black text-opacity-50 font-bold text-sm"
                >
                  IPFS: {poll.ipfs_link.substring(0, 20)}
                  {poll.ipfs_link.length > 20 ? '...' : ''}
                </a>
              ) : (
                <span className="text-black text-opacity-50 font-bold text-sm">
                  IPFS: Update every day at 12 pm CET
                </span>
              )}
            </div>

            <div className="flex flex-col gap-2.5 py-2.5 border-t border-black border-opacity-10">
              <Label className="text-black opacity-80 text-base font-semibold">
                End Date:
              </Label>
              <Label className="text-lg font-bold">
                {new Intl.DateTimeFormat('en', {
                  hour12: false,
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }).format(new Date(Number(poll?.endTime)))}
              </Label>
              <Label className=" text-black opacity-40 text-sm font-medium">
                {timeZoneAbbr}
              </Label>
            </div>
          </div>
        </div>

        <div className="flex flex-col bg-white rounded-lg border border-black border-opacity-10">
          <div className="px-5 py-2.5 border-b border-black border-opacity-10">
            <Label className="text-lg">Your Available Credentials</Label>
          </div>

          <div className="flex flex-col p-3.5 gap-2.5">
            <div className="flex gap-2.5 text-black opacity-60">
              <CheckCircleIcon className="w-6 h-6" />
              <Label className="text-sm">
                You can vote with any of the credentials below
              </Label>
            </div>

            {credentialTable.some((credential) =>
              [
                CREDENTIALS.DevConnect.id,
                CREDENTIALS.ZuConnectResident.id,
                CREDENTIALS.ZuzaluResident.id,
              ].includes(credential.id)
            ) && (
                <div className="flex flex-col p-2.5 gap-2.5 bg-black bg-opacity-5 rounded-lg">
                  <div className="flex justify-between">
                    <Label className="text-sm text-black font-bold">
                      <div className="flex items-center gap-2">
                        <img
                          src="/images/zupass.svg"
                          alt="Credential"
                          className="image-class-name"
                        />
                        <span className="opacity-60">Zupass</span>
                      </div>
                    </Label>
                    {zupasspoll ? (
                      <div className={styles.avail_cred}>
                        ZuPass
                        <CheckCircleIconWhite
                          className={styles.avail_cred_icon}
                        />
                      </div>
                    ) : (
                      <LockIcon className="w-7 h-7 text-black opacity-25" />
                    )}
                  </div>
                  <button
                    className="flex gap-1.5 text-sm text-black opacity-60 font-medium"
                    onClick={() => {
                      const isExpanded = expandedIds.includes('Zupass');
                      setExpandedIds(
                        isExpanded
                          ? expandedIds.filter((id) => id !== 'Zupass')
                          : [...expandedIds, 'Zupass']
                      );
                    }}
                  >
                    {expandedIds.includes('Zupass')
                      ? 'Hide Details'
                      : 'Show Details'}
                    <ChevronDownIcon className="w-5 h-5" />
                  </button>
                  {expandedIds.includes('Zupass') &&
                    (isPassportConnected ? (
                      credentialTable
                        .filter((credential) =>
                          [
                            CREDENTIALS.DevConnect.id,
                            CREDENTIALS.ZuConnectResident.id,
                            CREDENTIALS.ZuzaluResident.id,
                          ].includes(credential.id)
                        )
                        .map((credential) => {
                          const votedOption = userAvailableCredentialTable.find(
                            (credentialItem) =>
                              credentialItem.id === credential.id &&
                              credentialItem.votedOptionName
                          );

                          return (
                            <div
                              key={credential.id}
                              className="flex flex-col p-2.5 gap-2.5 bg-black bg-opacity-5 rounded-lg"
                            >
                              {userAvailableCredentialTable.some(
                                (credentialItem) =>
                                  credentialItem.id === credential.id
                              ) ? (
                                <>
                                  <CheckCircleIcon className="w-7 h-7" />
                                  <span className="text-black opacity-75">
                                    {credential.credential}
                                  </span>
                                  {votedOption && (
                                    <span className="text-sm">
                                      Voted: {votedOption.votedOptionName}
                                    </span>
                                  )}
                                </>
                              ) : (
                                <>
                                  <LockIcon className="w-7 h-7 text-black opacity-25" />
                                  <span className="text-black opacity-75">
                                    {credential.credential}
                                  </span>
                                  <button
                                    className="mt-2 py-2 px-4 bg-blue-500 text-white rounded-lg focus:outline-none"
                                    onClick={() => {
                                      handleZupassConnect(credential.id);
                                    }}
                                  >
                                    Connect {credential.credential}
                                  </button>
                                </>
                              )}
                            </div>
                          );
                        })
                    ) : (
                      <Button className={styles.cred_btn} onClick={signIn}>
                        {isPassportConnected ? (
                          <div className={styles.zupass_logged}>
                            <div className={styles.zuconnect}>
                              <span>ZuConnect Resident</span>
                              <img src="/images/check.svg" />
                            </div>
                            <span>OR</span>
                            <div className={styles.zuzalu}>Zuzalu Resident</div>
                          </div>
                        ) : (
                          <div className={styles.zupass_not_logged}>
                            <img src="/images/zupass_login.svg" />
                            <span>Zupass Login</span>
                          </div>
                        )}
                      </Button>
                    ))}
                </div>
              )}
            {credentialTable
              .filter(
                (credential) =>
                  ![
                    CREDENTIALS.DevConnect.id,
                    CREDENTIALS.ZuConnectResident.id,
                    CREDENTIALS.ZuzaluResident.id,
                  ].includes(credential.id)
              )
              .map((credential) => {
                const imagePath = getImagePathByCredential(
                  credential.credential as string
                );
                return (
                  <div
                    key={credential.id}
                    className="flex flex-col p-2.5 gap-2.5 bg-black bg-opacity-5 rounded-lg"
                  >
                    <div className="flex justify-between">
                      <Label className="text-sm text-black font-bold opacity-50">
                        {imagePath && (
                          <div className="flex items-center">
                            <img
                              src={imagePath}
                              alt="Credential"
                              className="image-class-name"
                            />
                            <span>{credential.credential}</span>
                          </div>
                        )}
                      </Label>
                      {userAvailableCredentialTable.some(
                        (credentialItem) => credentialItem.id === credential.id
                      ) ? (
                        <CheckCircleIcon className="w-7 h-7" />
                      ) : (
                        <LockIcon className="w-7 h-7 text-black opacity-25" />
                      )}
                    </div>
                    <button
                      className="flex gap-1.5 text-sm text-black opacity-60 font-medium"
                      onClick={() => {
                        const isExpanded = expandedIds.includes(credential.id);
                        setExpandedIds(
                          isExpanded
                            ? expandedIds.filter((id) => id !== credential.id)
                            : [...expandedIds, credential.id]
                        );
                      }}
                    >
                      {expandedIds.includes(credential.id)
                        ? 'Hide Details'
                        : 'Show Details'}
                      <ChevronDownIcon className="w-5 h-5" />
                    </button>
                    {expandedIds.includes(credential.id) && (
                      <div>
                        {renderCredentialDetails(
                          credential.credential as string
                        )}
                      </div>
                    )}
                    {(() => {
                      const foundVotedOption =
                        userAvailableCredentialTable.find(
                          (credentialItem) =>
                            credentialItem.id === credential.id &&
                            credentialItem.votedOptionName
                        );
                      return foundVotedOption ? (
                        <span>Voted: {foundVotedOption.votedOptionName}</span>
                      ) : null;
                    })()}
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div >
  );
};

export default PollPage;

