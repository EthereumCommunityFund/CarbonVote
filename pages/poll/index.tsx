'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowLeftIcon, EthIcon } from '@/components/icons';
import { ClockIcon } from '@/components/icons/clock';
import Button from '@/components/ui/buttons/Button';
import CountdownTimer from '@/components/ui/CountDownTimer';
import { Label } from '@/components/ui/Label';
import { useRouter } from 'next/router';
import OptionButton from '@/components/ui/buttons/OptionButton';
import { toast } from '@/components/ui/use-toast';
import {
  VoteRequestData,
  castVote,
  fetchPollById,
  fetchVote,
  fetchCredentialVotes,
} from '@/controllers/poll.controller';
import { useUserPassportContext } from '@/context/PassportContext';
import OptionVotingCountProgress from '@/components/OptionVotingCounts';
import { useAccount, useConnect, useSignMessage } from 'wagmi';
import { Contract, ethers, BigNumberish } from 'ethers';
import contractABI from '@/carbonvote-contracts/deployment/contracts/poapsverification.json';
import { calculateTimeRemaining } from '@/utils/index';
import { v4 as uuidv4 } from 'uuid';
import PoapDetails from '@/components/POAPDetails';
import { fetchScore } from '@/controllers';
import { Loader } from '@/components/ui/Loader';
import PieChartComponent from '@/components/ui/PieChart';
import {
  PollOptionType,
  Poll,
  PollTypes,
  VoteData,
  CredentialTable,
  SelectedOptionData,
  VotingProcess,
  VoterData,
  AllAggregatedDataType,
} from '@/types';
import { CREDENTIALS, CONTRACT_ADDRESS } from '@/src/constants';
import { PollResultComponent } from '@/components/PollResult';
import { ContractPollResultComponent } from '@/components/EthPollResult';
import { getBalanceAtBlock } from '@/utils/getBalanceAtBlock';
import { generateMessage } from '@/utils/generateMessage';
import VotingContract from '../../carbonvote-contracts/deployment/contracts/VoteContract.sol/VotingContract.json';
import VotingOption from '../../carbonvote-contracts/deployment/contracts/VotingOption.sol/VotingOption.json';
import createPollstyles from '@/styles/createPoll.module.css';
import styles from '@/styles/poll.module.css';
import { HiArrowRight } from 'react-icons/hi';
import ConfirmationPopup from '@/components/ConfirmationPopup';
import { getProviderUrl } from '@/utils/getProviderUrl';
import { getImagePathByCredential, isValidUuidV4 } from '@/utils/index';
import getPoapOwnership from 'utils/getPoapOwnership';
import { ProtocolGuildMembershipList } from '@/src/protocolguildmember';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { BoltIcon } from '../../components/icons';
import { MultiplePeopleIcon } from '@/components/icons/multiplepeople';
import { DownArrowIcon } from '@/components/icons/downarrow';
import moment from 'moment-timezone';
import { ChevronDownIcon } from 'lucide-react';
import { LockIcon } from '@/components/icons/lock';
import { CheckCircleIcon } from '@/components/icons/checkcircle';
import { CheckCircleIconWhite } from '@/components/icons/checkcirclewhite';
import TruncateText from '@/components/TruncateText';
import { SoloStakerList } from '@/src/solostaker';
import { getLatestBlockNumber } from '@/utils/getLatestBlockNumber';
import { useLatestBlock } from '@/utils/useLatestBlock';
import { identity } from 'lodash';
import { getEtherscanLogs } from '@/utils/getVoteTransactionHash';

const PollPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const handleBack = () => {
    router.push('/');
  };
  const poapApiKey = process.env.POAP_API_KEY ?? '';
  const [poll, setPoll] = useState<Poll>();
  const {
    signIn,
    isPassportConnected,
    verifyZuconnectticket,
    devconnectVerify,
    zuzaluVerify,
  } = useUserPassportContext(); // zupass
  const { address: account, isConnected } = useAccount();
  const { connect } = useConnect();
  const [options, setOptions] = useState<PollOptionType[]>([]);
  const [contractPollResult, setContractPollResult] = useState<
    AllAggregatedDataType[]
  >([]);
  const [userEthHolding, setUserEthHolding] = useState('0');
  const [pollIsLive, setPollIsLive] = useState<boolean>(false);
  const [score, setScore] = useState<number>();
  const [remainingTime, settimeRemaining] = useState('');
  const [startDate, setstartDate] = useState<Date>();
  const [poapsNumber, setPoapsNumber] = useState('0');
  const [eventDetails, setEventDetails] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const contractAbi = VotingContract.abi;
  const [pollContract, setPollContract] = useState<Contract | null>(null);
  const [pollType, setPollType] = useState<string>();
  const [endBlockNumber, setEndBlockNumber] = useState<number>();
  const [isEthHoldingPoll, setIsEthHoldingPoll] = useState<boolean>(false);
  const [credentialTable, setNestedCredentialTable] = useState<
    CredentialTable[]
  >([]);
  const [userAvailableCredentialTable, setAvailableCredentialTable] = useState<
    CredentialTable[]
  >([]);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);
  const [isFetchFinish, setIsFetchFinish] = useState<boolean>(false);
  const {
    data,
    isError,
    isLoading,
    isSuccess,
    signMessage,
    signMessageAsync,
    reset,
  } = useSignMessage({
    message,
  });
  const [voteTable, setVoteTable] = useState<string[]>([]);
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [zupasspoll, setZupassPoll] = useState(false);
  const [votingProcess, setVotingProcess] = useState<VotingProcess[]>([]);
  const [credentialCardReady, setCredentialCardReady] = useState(false);
  const [selectedOptionData, setSelectedOptionData] =
    useState<SelectedOptionData>();
  const [requiredgitscore, setRequiredGitScore] = useState(0);
  const [pollResult, setPollResult] = useState<VoteData[]>();
  const handleVotesRadioChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const credentialId = event.target.value;
    console.log(credentialId, 'selected id');
    const isCurrentlyChecked = event.target.checked;
    console.log(isCurrentlyChecked, 'is selected id checked');
    console.log(voteTable, 'vote table');
    setVoteTable((prevVoteTable) => {
      if (
        [
          CREDENTIALS.DevConnect.id,
          CREDENTIALS.ZuConnectResident.id,
          CREDENTIALS.ZuzaluResident.id,
        ].includes(credentialId)
      ) {
        let newVoteTable = prevVoteTable.filter(
          (id) =>
            ![
              CREDENTIALS.DevConnect.id,
              CREDENTIALS.ZuConnectResident.id,
              CREDENTIALS.ZuzaluResident.id,
            ].includes(id)
        );
        if (isCurrentlyChecked) {
          newVoteTable = [...newVoteTable, credentialId];
        }
        return newVoteTable;
      } else {
        if (isCurrentlyChecked) {
          if (!prevVoteTable.includes(credentialId)) {
            return [...prevVoteTable, credentialId];
          }
        } else {
          return prevVoteTable.filter((id) => id !== credentialId);
        }
      }
      return prevVoteTable;
    });
  };

  const handleSelectAllClick = () => {
    let addedZupassIds = false;
    const zupassIds: string[] = [
      CREDENTIALS.DevConnect.id,
      CREDENTIALS.ZuConnectResident.id,
      CREDENTIALS.ZuzaluResident.id,
    ];

    const newVoteTable = credentialTable.reduce((acc: string[], cred) => {
      const isAvailable = userAvailableCredentialTable.some(
        (availableCred) => availableCred.id === cred.id
      );
      if (isAvailable) {
        if (zupassIds.includes(cred.id)) {
          if (!addedZupassIds) {
            acc.push(cred.id);
            addedZupassIds = true;
          }
        } else {
          acc.push(cred.id);
        }
      }
      return acc;
    }, []);
    setVoteTable(newVoteTable);
  };
  const [refreshCount, setRefreshCount] = useState(0);
  const refreshLatestBlock = () => {
    setRefreshCount((prevCount) => prevCount + 1);
  };
  const latestBlockNumber = useLatestBlock(isEthHoldingPoll, refreshCount);
  const providerUrl = getProviderUrl();
  const provider = new ethers.JsonRpcProvider(providerUrl);
  useEffect(() => {
    const getOptionVoteCounts = async () => {
      if (id && poll && options && credentialTable && latestBlockNumber) {
        let allAggregatedData: AllAggregatedDataType[] = [];
        const filteredCredentials = credentialTable.filter(
          (cred) =>
            cred.credential === 'EthHolding on-chain' ||
            cred.credential === CREDENTIALS.EthHoldingOffchain.name
        );
        console.log(filteredCredentials, 'check credential table');
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
                    let totalBalance = BigInt(0);
                    let votersData = [];
                    for (let i = 0; i < Number(votersCount); i++) {
                      const voterAddress = await contract.voters(i);
                      const balance = await provider.getBalance(voterAddress);
                      let transactionHash: string = '';
                      if (voterAddress) {
                        transactionHash = await getEtherscanLogs(
                          voterAddress,
                          Number(cred.id)
                        );
                      }
                      totalBalance += BigInt(balance.toString());
                      votersData.push({
                        address: voterAddress,
                        balance: ethers.formatEther(balance),
                        voteHash: transactionHash,
                      });
                    }
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
                  const balance = await provider.getBalance(voterAddress);
                  totalBalance += BigInt(balance.toString());

                  votersData.push({
                    address: voterAddress,
                    balance: ethers.formatEther(balance),
                  });

                  const optionToUpdateIndex =
                    aggregatedDataForCurrentId.findIndex(
                      (option) => option.id === voteData.id
                    );
                  if (optionToUpdateIndex !== -1) {
                    aggregatedDataForCurrentId[
                      optionToUpdateIndex
                    ].votersCount = votersData.length;
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
    };

    if (latestBlockNumber !== null) {
      getOptionVoteCounts();
    }
  }, [latestBlockNumber, refreshCount]);

  const handleOptionSelect = (
    optionId: string,
    optionIndex: number | undefined,
    option_description: string
  ) => {
    console.log('here');
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
    console.log(voteTable, 'vote Table in useEffect');
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
  const popupRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Function to close popup when clicked outside
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        event.target instanceof Node &&
        !popupRef.current.contains(event.target)
      ) {
        setIsPopupOpen(false);
      }
    };

    // Add event listener when popup is open
    if (isPopupOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setVoteTable([]);
    } else {
      // Remove event listener when popup is closed
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopupOpen]);

  const handleConfirmationPopupClose = async () => {
    setVoteTable([]);
    setShowConfirmationPopup(false);
    if (isValidUuidV4(id as string)) {
      await fetchPollFromApi(id);
      await getEthHoldings();
    } else {
      await fetchPollFromContract(id as string);
    }
    await checkAndSetCredentialsAndVotes();
    refreshLatestBlock();
  };

  useEffect(() => {
    if (id !== undefined) {
      if (isValidUuidV4(id as string)) {
        fetchPollFromApi(id);
        getEthHoldings();
        console.log(poll, 'poll data');
      } else {
        fetchPollFromContract(id as string);
      }
    }
  }, [id]);

  useEffect(() => {
    checkAndSetCredentialsAndVotes();
  }, [
    isFetchFinish,
    account,
    isPassportConnected,
    verifyZuconnectticket,
    devconnectVerify,
    zuzaluVerify,
  ]);

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
                for (const eventId of credential.poap_events as string[]) {
                  let userPoapIds = [];
                  try {
                    const hasOwnership = await getPoapOwnership(
                      poapApiKey,
                      account,
                      eventId
                    );
                    if (hasOwnership) {
                      userPoapIds.push(eventId);
                    }
                  } catch (error) {
                    console.error(
                      `Error checking POAP ownership for event ID ${eventId}:`,
                      error
                    );
                  }
                  if (
                    poll &&
                    poll.poap_number !== undefined &&
                    userPoapIds.length >= Number(poll?.poap_number)
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
                  } else {
                  }
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
    setCredentialCardReady(true);
  }

  const invokeCastVote = async (vote_credential: string, signature: string) => {
    console.log(
      signature,
      selectedOptionData?.optionId,
      poll?.id,
      account,
      vote_credential,
      'all information'
    );
    if (
      signature &&
      selectedOptionData?.optionId &&
      poll?.id &&
      account &&
      vote_credential
    ) {
      const voteData = {
        poll_id: poll.id,
        option_id: selectedOptionData.optionId,
        voter_identifier: account,
        signature: signature,
        vote_credential: vote_credential,
        ...(vote_credential === CREDENTIALS.GitcoinPassport.id && {
          gitscore: score,
        }),
      };
      console.log(voteData, 'voteData');
      try {
        const response = await castVote(voteData as VoteRequestData);
        console.log(response, 'response');
        setVotingProcess((currentvoting) =>
          currentvoting.map((votingcredential) =>
            votingcredential.credentialId === vote_credential
              ? { ...votingcredential, status: 'success' }
              : votingcredential
          )
        );
        //await fetchPollFromApi(id);
      } catch (error) {
        console.error('Error casting vote:', error);
        if (typeof error === 'object' && error !== null && 'status' in error) {
          const err = error as { status: number; message?: string };
          if (err.status === 403) {
            console.error("You don't have permission to cast this vote.");
            setVotingProcess((currentvoting) =>
              currentvoting.map((votingcredential) =>
                votingcredential.credentialId === vote_credential
                  ? { ...votingcredential, status: 'unauthorized' }
                  : votingcredential
              )
            );
          } else {
            console.error('An unexpected error occurred.');
            setVotingProcess((currentvoting) =>
              currentvoting.map((votingcredential) =>
                votingcredential.credentialId === vote_credential
                  ? { ...votingcredential, status: 'error' }
                  : votingcredential
              )
            );
          }
        } else {
          console.error('An unexpected error occurred.');
          setVotingProcess((currentvoting) =>
            currentvoting.map((votingcredential) =>
              votingcredential.credentialId === vote_credential
                ? { ...votingcredential, status: 'error' }
                : votingcredential
            )
          );
        }
      }
    }
  };

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
        break;
      case CREDENTIALS.ZuConnectResident.id:
        await verifyZuconnectticket();
        break;
      case CREDENTIALS.ZuzaluResident.id:
        await zuzaluVerify();
        break;
    }
  };
  const fetchPollFromApi = async (pollId: string | string[] | undefined) => {
    try {
      const response = await fetchPollById(pollId as string);
      const data = await response.data;
      console.log(data, 'pollData');
      setPoll(data);
      data.options.sort((a: PollOptionType, b: PollOptionType) =>
        a.option_description.localeCompare(b.option_description)
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
      const startdate = new Date(data.startTime);
      if (data.end_block_number) {
        setEndBlockNumber(data.end_block_number);
      }
      setstartDate(startdate);
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
        const provider = new ethers.JsonRpcProvider(
          'https://sepolia.infura.io/v3/01371fc4052946bd832c20ca12496243'
        );
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
          const provider = new ethers.JsonRpcProvider(
            'https://sepolia.infura.io/v3/01371fc4052946bd832c20ca12496243'
          );
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
              console.log(index, 'index');
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
                      optionindex: Number(index),
                    };

                    updatedOptions = [
                      ...updatedOptions.slice(0, optionToUpdateIndex),
                      updatedOption,
                      ...updatedOptions.slice(optionToUpdateIndex + 1),
                    ];
                  }
                }
              } else {
                console.log('new option');
                updatedOptions.push({
                  id: index,
                  pollId: id as string,
                  option_description: optionName,
                  address: address,
                  votersCount: 0,
                  totalEth: '0',
                  votersData: [],
                  optionindex: Number(index),
                });
              }
            } catch (error) {
              console.error('Error fetching options:', error);
            }
          }
          if (updatedOptions != existingoptions) {
            updatedOptions.sort((a, b) =>
              a.option_description.localeCompare(b.option_description)
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

  const handleCastVote = async (
    optionId: string,
    requiredCred: string,
    voterTag: string
  ) => {
    const pollId = poll?.id;
    const voter_identifier = localStorage.getItem(voterTag);
    try {
      const voteData = {
        poll_id: pollId,
        option_id: optionId,
        voter_identifier: voter_identifier,
        vote_credential: requiredCred,
        signature: null,
      };
      console.log(voteData, 'voteData');
      const response = await castVote(voteData as VoteRequestData);
      console.log(response, 'response');
      setVotingProcess((currentvoting) =>
        currentvoting.map((votingcredential) =>
          votingcredential.credentialId === requiredCred
            ? { ...votingcredential, status: 'success' }
            : votingcredential
        )
      );
    } catch (error) {
      console.error('Error casting vote:', error);
      setVotingProcess((currentvoting) =>
        currentvoting.map((votingcredential) =>
          votingcredential.credentialId === requiredCred
            ? { ...votingcredential, status: 'error' }
            : votingcredential
        )
      );
    }
  };

  const handleCastVoteSigned = async (
    optionId: string,
    credentialId: string
  ) => {
    try {
      const pollId = poll?.id as string;
      const message = await generateMessage(
        pollId,
        optionId,
        account as string
      );
      const signature = await signMessageAsync({ message });

      if (signature) {
        await invokeCastVote(credentialId, signature);
        console.log('success');
      } else {
        console.log('cast vote error');
      }
    } catch (error) {
      console.error('Error signing vote:', error);
    }
  };

  const handleVote = async (
    optionId: string,
    credentialIds: string[],
    optionIndex: number | undefined
  ) => {
    console.log('handle vote', optionId, credentialIds, optionIndex);
    if (!localStorage.getItem('userUniqueId')) {
      const uniqueId = uuidv4();
      localStorage.setItem('userUniqueId', uniqueId);
    }
    if (voteTable.length > 0) {
      console.log(credentialIds, 'vote table');
      for (let credentialId of credentialIds) {
        if (isValidUuidV4(credentialId)) {
          switch (credentialId) {
            case CREDENTIALS.ZuConnectResident.id:
              await handleCastVote(
                optionId,
                CREDENTIALS.ZuConnectResident.id,
                'zuconnectNullifier'
              );
              break;
            case CREDENTIALS.DevConnect.id:
              await handleCastVote(
                optionId,
                CREDENTIALS.DevConnect.id,
                'devconnectNullifier'
              );
              break;
            case CREDENTIALS.ZuzaluResident.id:
              await handleCastVote(
                optionId,
                CREDENTIALS.ZuzaluResident.id,
                'zuzaluNullifier'
              );
              break;
            case CREDENTIALS.GitcoinPassport.id:
            case CREDENTIALS.POAPapi.id:
            case CREDENTIALS.ProtocolGuildMember.id:
            case CREDENTIALS.EthSoloStaker.id:
            case CREDENTIALS.EthHoldingOffchain.id:
              await handleCastVoteSigned(optionId, credentialId);
              break;
            // POAPS ONCHAIN
            /*else if (credentialId == CREDENTIALS.POAPSVerification.id) {
              if (!isConnected) {
                warnAndConnect();
                return;
              }
              try {
                const provider = new ethers.JsonRpcProvider(
                  'https://sepolia.infura.io/v3/01371fc4052946bd832c20ca12496243'
                );
                //const provider=new ethers.providers.JsonRpcProvider(sepoliaRPC);
                const contract = new ethers.Contract(
                  CREDENTIALS.POAPSVerification.contract,
                  contractABI,
                  provider
                );
                const events = await contract.getEventCountForCollection(account);
        
                setPoapsNumber(events.toString());
                console.log(events.toString(), 'events');
              } catch (error) {
                console.error('An error occurred:', error);
              }
        
              if (Number(poapsNumber) > 4) {
                await handleCastVoteSigned(
                  optionId,
                  CREDENTIALS.ProtocolGuildMember.id
                );
              }*/
          }
        } else {
          console.log(credentialId, 'credentialId');
          console.log(optionIndex as number, 'option index');
          await handleContractVote(credentialId, optionIndex as number);
        }
      }
    } else {
      await handleContractVote(id as string, optionIndex as number);
    }
  };
  function canOpenPopup() {
    let windowReference = window.open('', '_blank');
    if (
      !windowReference ||
      windowReference.closed ||
      typeof windowReference.closed == 'undefined'
    ) {
      // Pop-up was blocked
      return false;
    }
    windowReference.close();
    return true;
  }
  const handleContractVote = async (pollId: string, optionIndex: number) => {
    const generateSignature = async (message: string) => {
      const response = await fetch('/api/auth/generate_signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({ message }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate signature');
      }

      const data = await response.json();
      console.log(data.data.message, 'message');
      console.log(data.data.signed_message, 'signature');
      return data.data.signed_message;
    };
    if (!isPassportConnected) {
      const signature = await generateSignature(account as string);
      const message = account as string;
      if (signature) {
        localStorage.setItem('signature', signature);
        localStorage.setItem('message', message);
      }
    }
    const signature = localStorage.getItem('signature');
    const message = localStorage.getItem('message');
    if (!signature) {
      console.error('No signature found. Please connect your wallet');
      return;
    }
    if (!message) {
      console.error('No message found. Please connect your wallet');
      return;
    }

    try {
      let provider = new ethers.BrowserProvider(window.ethereum as any);
      let signer = await provider.getSigner();
      //let provider = ethers.getDefaultProvider("http://localhost:8545/");
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractAbi,
        signer
      );
      const pollIndex = Number(pollId);
      const newOptionIndex = Number(optionIndex);
      // console.log(pollIndex, 'pollIndex');
      // console.log(newOptionIndex, 'newOptionIndex');
      // console.log(signature, 'signature');
      // console.log(message, 'message');
      if (!canOpenPopup()) {
        toast({
          title: 'Error',
          description:
            'Please enable pop-ups in your browser settings to proceed with the transaction.',
          variant: 'destructive',
        });
        setVotingProcess((currentvoting) =>
          currentvoting.map((votingcredential) =>
            votingcredential.credentialId === pollId
              ? { ...votingcredential, status: 'pop-up disabled' }
              : votingcredential
          )
        );
      }
      const transactionResponse = await contract.vote(
        pollIndex,
        newOptionIndex,
        signature,
        message
      );
      await transactionResponse.wait(); // Wait for the transaction to be mined
      console.log('Vote cast successfully');
      setVotingProcess((currentvoting) =>
        currentvoting.map((votingcredential) =>
          votingcredential.credentialId === pollId
            ? { ...votingcredential, status: 'success' }
            : votingcredential
        )
      );
    } catch (error: any) {
      console.error('Error casting vote:', error);
      setVotingProcess((currentvoting) =>
        currentvoting.map((votingcredential) =>
          votingcredential.credentialId === pollId
            ? { ...votingcredential, status: 'error' }
            : votingcredential
        )
      );
    }
  };

  if (!poll || !credentialCardReady) {
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
      case CREDENTIALS.EthHoldingOffchain.name:
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
      case CREDENTIALS.ProtocolGuildMember.name:
      case 'ProtocolGuild on-chain':
        const isMember = userAvailableCredentialTable.some(
          (credentialItem) =>
            credentialItem.id === CREDENTIALS.ProtocolGuildMember.id ||
            credentialItem.credential === 'ProtocolGuild on-chain'
        );
        return (
          <div className="flex flex-col gap-1">
            <div className="text-sm">Need to be a member of Protocol Guild</div>
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
        );
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
            Back
          </Button>
        </div>

        <div className="bg-white flex flex-col gap-7.5 rounded-xl border border-black border-opacity-10">
          <div className="flex flex-col p-5 gap-5 border-b border-black border-opacity-10">
            <div className="flex gap-3.5">
              {pollIsLive ? (
                <div className="px-2.5 py-0.5 bg-red-500 bg-opacity-20 rounded-lg">
                  <Label className="text-red-500 text-md font-bold">Live</Label>
                </div>
              ) : (
                <div className="px-2.5 py-0.5 opacity-60 bg-black bg-opacity-5 rounded-lg">
                  <Label className="text-black text-md font-bold">Closed</Label>
                </div>
              )}

              <div className={styles.countdown}>
                <img src='/images/clock.svg' className={styles.countdown_icon} />
                <CountdownTimer endTime={poll.endTime} />
              </div>

            </div>

            <div className="flex flex-col gap-1">
              <Label className="text-black uppercase opacity-50 text-base">Motion:</Label>
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
              {/*<div className={styles.user_voted}>
                <img src='/images/checkmark_white.svg' />
                <span>You Have Voted</span>
          </div>*/}
              <Label className={styles.container_header}>Vote on Poll</Label>
              <div className={styles.nested_poll_header}>
                <h4>
                  This is a nested poll. You can vote with multiple credentials.
                </h4>
                <p>Votes will be segmented by credentials</p>
              </div>
              <div className={styles.options_container}>
                {/* <div className={styles.gated_poll_disabled}>
                  <div className={styles.gated_content}>
                    <div>
                      <img src="/images/locked.svg" alt="" />
                      <span>You Cannot Vote</span>
                    </div>
                    <p>You do not have the available credentials</p>
                  </div>
                  </div>*/}
                {options?.map((option) => (
                  <OptionButton
                    key={option.id}
                    id={option.id}
                    optionName={option.option_description}
                    onVote={() =>
                      handleOptionSelect(
                        option.id,
                        option.optionindex,
                        option.option_description
                      )
                    }
                    optionAddress={undefined}
                  />
                ))}
              </div>
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
                  Optionally, you can manually send a zero-value transaction by
                  pasting the address directly from your wallet.
                </p>
                <span>Show Addresses</span>
              </div>
            </>
          ) : (
            <div className={styles.poll_finished}>
              <h3>Poll finished</h3>
              <div></div>
            </div>
          )}
        </div>
        {isPopupOpen && (
          <div>
            <div className={styles.voting_popup_bg}>
              <div ref={popupRef} className={styles.voting_popup}>
                <h4>Your Available Credentials</h4>
                <p className={styles.header_p}>You are selecting</p>
                <p className={styles.choice}>
                  {selectedOptionData
                    ? selectedOptionData.option_description
                    : ''}
                </p>
                <div className={styles.v_pop_content}>
                  <p>Select the credentials you want to vote with</p>
                  <div className={styles.v_pop_list}>
                    {credentialTable.map((credential) => {
                      const isAvailable = userAvailableCredentialTable.some(
                        (availCred) => availCred.id === credential.id
                      );
                      const imagePath = getImagePathByCredential(
                        credential.credential as string
                      );
                      return (
                        <div
                          key={credential.id}
                          className={styles.radios_flex_col}
                        >
                          <label
                            className={`${styles.choice_option} ${!isAvailable ? styles.disabled : ''}`}
                          >
                            <div>
                              {imagePath && (
                                <img
                                  src={imagePath}
                                  alt="Credential"
                                  className="image-class-name"
                                />
                              )}
                              <span>{credential.credential}</span>
                            </div>
                            {isAvailable ? (
                              <input
                                type="checkbox"
                                name="credentials"
                                value={credential.id}
                                checked={voteTable.includes(credential.id)}
                                onChange={handleVotesRadioChange}
                                className={styles.hidden_radio}
                              />
                            ) : (
                              <div className={styles.unavailableCover} />
                            )}
                          </label>
                          {!isAvailable && (
                            <div className={styles.overlay}></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div
                    className={styles.select_all}
                    onClick={handleSelectAllClick}
                  >
                    Select All
                  </div>
                  <button
                    className={styles.vote_btn}
                    onClick={() => {
                      setIsPopupOpen(false);
                      setShowConfirmationPopup(true);
                      if (selectedOptionData) {
                        handleVote(
                          selectedOptionData.optionId,
                          voteTable,
                          selectedOptionData.optionIndex
                        );
                      }
                    }}
                  >
                    <HiArrowRight />
                    <span>Vote</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        {showConfirmationPopup && (
          <ConfirmationPopup
            votingProcess={votingProcess}
            onClose={handleConfirmationPopupClose}
          />
        )}
        {isEthHoldingPoll && (
          <ContractPollResultComponent
            allAggregatedData={contractPollResult}
            currentBlock={latestBlockNumber as number}
            endBlock={endBlockNumber as number}
            onRefresh={refreshLatestBlock}
          />
        )}
        <PollResultComponent
          pollType={PollTypes.HEAD_COUNT}
          optionsData={pollResult as VoteData[]}
          credentialTable={credentialTable}
        />
      </div>

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

            {poll.ipfs_link && (
              <div className="flex flex-wrap items-center gap-1">
                <a
                  href={poll.ipfs_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black text-opacity-50 font-bold text-sm"
                >
                  IPFS: {poll.ipfs_link.substring(0, 20)}
                  {poll.ipfs_link.length > 20 ? '...' : ''}
                </a>
              </div>
            )}

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
                        .map((credential) => (
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
                        ))
                    ) : (
                      <Button
                        className={styles.cred_btn}

                        onClick={signIn}
                      >
                        {isPassportConnected
                          ?
                          <div className={styles.zupass_logged}>
                            <div className={styles.zuconnect}><span>ZuConnect Resident</span>
                              <img src="/images/check.svg" /></div>
                            <span>OR</span>
                            <div className={styles.zuzalu}>Zuzalu Resident</div>
                          </div>
                          :
                          <div className={styles.zupass_not_logged}>
                            <img src='/images/zupass_login.svg' />
                            <span>Zupass Login</span>
                          </div>

                        }
                      </Button>
                    ))}
                  {(() => {
                    const Zupass = [
                      CREDENTIALS.DevConnect.id,
                      CREDENTIALS.ZuConnectResident.id,
                      CREDENTIALS.ZuzaluResident.id,
                    ];
                    const foundVotedOption = userAvailableCredentialTable.find(
                      (credentialItem) =>
                        Zupass.includes(credentialItem.id) &&
                        credentialItem.votedOptionName
                    );
                    return foundVotedOption ? (
                      <span>Voted: {foundVotedOption.votedOptionName}</span>
                    ) : null;
                  })()}
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
    </div>
  );
};

export default PollPage;
