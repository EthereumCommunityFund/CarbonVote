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
} from '@/controllers/poll.controller';
import { useUserPassportContext } from '@/context/PassportContext';
import OptionVotingCountProgress from '@/components/OptionVotingCounts';
import { useAccount, useConnect, useSignMessage } from 'wagmi';
import { Contract, ethers } from 'ethers';
import contractABI from '@/carbonvote-contracts/deployment/contracts/poapsverification.json';
import { calculateTimeRemaining } from '@/utils/index';
import { v4 as uuidv4 } from 'uuid';
import PoapDetails from '@/components/POAPDetails';
import { fetchScore } from '@/controllers';
import { Loader } from '@/components/ui/Loader';
import PieChartComponent from '@/components/ui/PieChart';
import { PollOptionType, Poll, PollTypes } from '@/types';
import { CREDENTIALS, CONTRACT_ADDRESS } from '@/src/constants';
import { PollResultComponent } from '@/components/PollResult';
import { getBalanceAtBlock } from '@/utils/getBalanceAtBlock';
import { generateMessage } from '@/utils/generateMessage';
import VotingContract from '../../carbonvote-contracts/deployment/contracts/VoteContract.sol/VotingContract.json';
import VotingOption from '../../carbonvote-contracts/deployment/contracts/VotingOption.sol/VotingOption.json';
import createPollstyles from '@/styles/createPoll.module.css';
import styles from '@/styles/poll.module.css';
import { HiArrowRight } from 'react-icons/hi';
import ConfirmationPopup from '@/components/ConfirmationPopup';
import { getProviderUrl } from '@/utils/getProviderUrl';
interface CredentialTable {
  credential: string;
  id: string;
}
interface SelectedOptionData {
  optionId: string;
  optionIndex: number | undefined;
  option_description: string;
}
const PollPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const handleBack = () => {
    router.push('/');
  };
  const [poll, setPoll] = useState<Poll>();
  const { signIn, isPassportConnected, verifyticket, devconnectVerify,zuzaluVerify } =
    useUserPassportContext(); // zupass
  const { address: account, isConnected } = useAccount();
  const { connect } = useConnect();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [options, setOptions] = useState<PollOptionType[]>([]);
  // FIXME: For multiple votes this single CredentialId might break the logic. Implementing an agregated credential requirement 
  const [credentialId, setCredentialId] = useState('');
  const [userEthHolding, setUserEthHolding] = useState('0');
  const [score, setScore] = useState('0');
  const [remainingTime, settimeRemaining] = useState('');
  const [startDate, setstartDate] = useState<Date>();
  const [poapsNumber, setPoapsNumber] = useState('0');
  const [eventDetails, setEventDetails] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const contractAbi = VotingContract.abi;
  const [pollContract, setPollContract] = useState<Contract | null>(null);
  const [pollType, setPollType] = useState<string | number>();
  const [credentialTable, setNestedCredentialTable] = useState<
    CredentialTable[]
  >([]);
  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
    message,
  });
  const [voteTable, setVoteTable] = useState<string[]>([]);
  const [selectedCredentialId, setSelectedCredentialId] = useState<
    string | null
  >(null);
  const [votedOptions, setVotedOptions] = useState({});
  const [showConfirmationPopup, setShowConfirmationPopup] = useState(false);
  const [selectedOptionData, setSelectedOptionData] =
    useState<SelectedOptionData>();
  const handleVotesRadioChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const credentialId = event.target.value;
    setVoteTable((prevVoteTable) => {
      const isCurrentlyChecked = prevVoteTable.includes(credentialId);
      if (isCurrentlyChecked) {
        return prevVoteTable.filter((id) => id !== credentialId);
      } else {
        return [...prevVoteTable, credentialId];
      }
    });
    console.log(voteTable, 'vote Table');
  };
  const handleSelectAllClick = () => {
    setVoteTable(credentialTable.map((cred) => cred.id));
  };
  function getImagePathByCredential(credential: string): string {
    if (
      credential.includes('ProtocolGuild on-chain') ||
      credential.includes('Protocol Guild Member')
    ) {
      return '/images/guild.png';
    }
    if (
      credential.includes('EthHolding on-chain') ||
      credential.includes('Eth Holding (Offchain)')
    ) {
      return '/images/eth_logo.svg';
    }
    if (
      credential.includes('ZuConnect Resident') ||
      credential.includes('DevConnect') ||
      credential.includes('Zuzalu Resident')
    ) {
      return '/images/zupass.svg';
    }
    if (credential.includes('Gitcoin Passport')) {
      return '/images/gitcoin.svg';
    }
    if (credential.includes('POAP API')) {
      return '/images/poaps.svg';
    }
    return '';
  }
  const handleOptionSelect = (
    optionId: string,
    optionIndex: number | undefined,
    option_description: string
  ) => {
    console.log(optionId,voteTable,optionIndex,option_description,'handle option select');
    setSelectedOptionData({
      optionId,
      optionIndex,
      option_description,
    });
    setIsPopupOpen(true);
  };
  useEffect(() => {
    console.log(voteTable, 'vote Table in useEffect');
  }, [voteTable]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);

  const providerUrl = getProviderUrl();

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
    } else {
      // Remove event listener when popup is closed
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPopupOpen]);

  console.log('🚀 ~ PollPage ~ data:', data);
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
    async function checkAndSetVotes() {
      for (const credential of credentialTable) {
        let identifier;

        if (
          [
            CREDENTIALS.ZuConnectResident.id,
            CREDENTIALS.DevConnect.id,
            CREDENTIALS.ZuzaluResident.id,
          ].includes(credential.id)
        ) {
          identifier = localStorage.getItem('userId');
        } else if (
          [
            CREDENTIALS.GitcoinPassport.id,
            CREDENTIALS.POAPapi.id,
            CREDENTIALS.ProtocolGuildMember.id,
            CREDENTIALS.EthHoldingOffchain.id,
          ].includes(credential.id)
        ) {
          identifier = localStorage.getItem('account');
        } else {
          if (!localStorage.getItem('userUniqueId')) {
            const uniqueId = uuidv4();
            localStorage.setItem('userUniqueId', uniqueId);
          }
          identifier = localStorage.getItem('userUniqueId');
        }

        const checkdata = {
          id: credential.id,
          identifier: identifier,
        };

        const responsevote = await fetchVote(checkdata);

        if (responsevote.data.option_id !== '') {
          setVotedOptions(responsevote.data.option_id);
        }
      }
    }
    checkAndSetVotes();
  }, [credentialTable]);
  /*useEffect(() => {
    async () => {
      if (isSuccess && data !== undefined) {
        const voteData = {
          poll_id: poll?.id,
          option_id: optionId, // FIXME: Add optionId
          voter_identifier: account,
          requiredCred,// FIXME: Add requiredCre
          signature: data,
        };
        console.log(voteData, 'voteData');
        const response = await castVote(voteData as VoteRequestData);
        console.log(response, 'response');
        toast({
          title: 'Vote cast successfully',
        });
        await fetchPollFromApi(id);
      }
    }
  }, [isSuccess, data]);*/

  useEffect(() => {
    console.log('account changed');
    setSelectedOption(null);
    if (isValidUuidV4(id as string)) {
      fetchPollFromApi(id);
      if (credentialId == CREDENTIALS.GitcoinPassport.id) {
        const fetchNewScore = async () => {
          // FIXME: SHOULD THIS SCORE ID BE HARDCODED HERE?
          let fetchScoreData = { address: account as string, scorerId: '6347' };
          try {
            let scoreResponse = await fetchScore(fetchScoreData);
            let scoreData = scoreResponse.data;
            console.log(scoreData.score.toString(), 'score');
            setScore(scoreData.score.toString());
          } catch (error) {
            console.error('Error fetching score:', error);
          }
        };
        fetchNewScore();
      } else if (credentialId == CREDENTIALS.POAPSVerification.id) {
        const fetchNewNumber = async () => {
          try {
            // TODO: Replace hardcoded URL with dynamic.
            const provider = new ethers.JsonRpcProvider(providerUrl);
            const contract = new ethers.Contract(
              CREDENTIALS.POAPSVerification.contract,
              contractABI,
              provider
            );
            const events = await contract.getEventCountForCollection(account);

            setPoapsNumber(events.toString());
          } catch (error) {
            console.error('Error fetching score:', error);
          }
        };
        fetchNewNumber();
      }
    }
  }, [account]);

  const isValidUuidV4 = (uuid: string): boolean => {
    const uuidV4Pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidV4Pattern.test(uuid);
  };
  const getEthHoldings = async () => {
    const blockNumber = poll?.block_number ?? 0;
    const userBalance = await getBalanceAtBlock(account as string, blockNumber);
    const balanceInEth = ethers.formatEther(userBalance); // ethers.js returns balances in wei, convert it to ether
    console.log(`Balance at block ${blockNumber}: ${balanceInEth} ETH`);

    setUserEthHolding(parseFloat(balanceInEth).toFixed(2));
  };

  const fetchPollFromApi = async (pollId: string | string[] | undefined) => {
    try {
      const response = await fetchPollById(pollId as string);
      const data = await response.data;
      const nestedCredentialTable: CredentialTable[] = [];
      console.log(data, 'pollData');
      setPoll(data);
      setOptions(data.options);
      console.log(data.contractpoll_index?.length, 'length');
      if (data.contractpoll_index?.length == 1) {
        await fetchPollFromContract(data.contractpoll_index[0]);
        console.log(pollType?.toString(), 'pollType');
        if (pollType?.toString() == '0') {
          nestedCredentialTable.push({
            credential: 'EthHolding on-chain',
            id: data.contractpoll_index[0],
          });
        } else {
          nestedCredentialTable.push({
            credential: 'ProtocolGuild on-chain',
            id: data.contractpoll_index[1],
          });
        }
      }
      //If nested poll with Ethholding on-chain and Protocol guild on-chain
      if (data.contractpoll_index?.length == 2) {
        await fetchPollFromContract(data.contractpoll_index[0]);
        nestedCredentialTable.push({
          credential: 'EthHolding on-chain',
          id: data.contractpoll_index[0].toString(),
        });
        await fetchPollFromContract(data.contractpoll_index[1]);
        nestedCredentialTable.push({
          credential: 'ProtocolGuild on-chain',
          id: data.contractpoll_index[1].toString(),
        });
      }
      console.log(nestedCredentialTable, 'nestedTable');
      data.credentials.forEach((cred: any) => {
        Object.values(CREDENTIALS).forEach((credential) => {
          if (cred.id === credential.id) {
            nestedCredentialTable.push({
              credential: credential.name,
              id: cred.id,
            });
          }
        });
      });
      console.log(nestedCredentialTable, 'nestedcredentialtable');
      /*const newCredentialId = data.credentials?.[0]?.id || '';
      let identifier: string | null = null;
      if (newCredentialId) {
        switch (newCredentialId) {
          case CREDENTIALS.ZuConnectResident.id: //Zuconnect
          case CREDENTIALS.DevConnect.id: //Devconnect
            if (localStorage.getItem('userId')) {
              identifier = localStorage.getItem('userId');
            }
            break;
          case CREDENTIALS.GitcoinPassport.id: //Gitcoin passport
          case CREDENTIALS.POAPSVerification.id: //POAPS verification
            if (localStorage.getItem('account')) {
              identifier = localStorage.getItem('account');
            }
            break;
        }
      } else {
        if (!localStorage.getItem('userUniqueId')) {
          const uniqueId = uuidv4();
          localStorage.setItem('userUniqueId', uniqueId);
        }
        identifier = localStorage.getItem('userUniqueId');
      }
      const checkdata = {
        id: pollId as string,
        identifier: identifier as string,
      };
      const responsevote = await fetchVote(checkdata);
      if (responsevote.data.option_id !== '') {
        setSelectedOption(responsevote.data.option_id);
      }*/
      const timeleft = calculateTimeRemaining(data.endTime);
      console.log(data.endTime);
      console.log(data.startTime);
      const startdate = new Date(data.startTime);
      setstartDate(startdate);
      console.log(startDate, 'start date');
      if (timeleft) {
        settimeRemaining(timeleft);
      }
      /*if (newCredentialId) {
        setCredentialId(newCredentialId);
        console.log('credential ID', newCredentialId);
      }*/
      setNestedCredentialTable(nestedCredentialTable);
      //console.log(pollIsLive, 'live');
    } catch (error) {
      console.error('Error fetching poll from API:', error);
    }
  };
  const fetchPollFromContract = async (pollId: string) => {
    if (pollId) {
      //let provider = new ethers.BrowserProvider(window.ethereum as any);
      //let signer = await provider.getSigner();
      //const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      console.log('fetching', id);
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
        if (contract !== null) {
          const pollData = await contract.getPoll(pollId);
          // console.log(contract);
          console.log(pollData, 'pollData');

          setPoll(pollData);
          setPollType(pollData.pollType);
          //pollType = pollData.pollType;
          if (pollType) {
            console.log(pollType.toString(), 'poll_type123');
          } else {
            console.log('no poll type');
          }
          let startdate = new Date(Number(pollData.startTime) * 1000);
          console.log(startdate, 'start time', pollData.endTime, 'end time');
          const timeleft = calculateTimeRemaining(
            Number(pollData.endTime) * 1000
          );
          if (!timeleft) {
          } else {
            settimeRemaining(timeleft);
            console.log(timeleft, 'time left');
          }
          const provider = new ethers.JsonRpcProvider(
            'https://sepolia.infura.io/v3/01371fc4052946bd832c20ca12496243'
          );
          const newOptions: PollOptionType[] = [];
          console.log(pollData.options, 'poll.options');
          const optionContractAbi = VotingOption.abi;
          for (const address of pollData.options) {
            const contract = new ethers.Contract(
              address,
              optionContractAbi,
              provider
            );
            // console.log(contract, 'contract');

            try {
              const optionName = await contract.name();
              const index = await contract.option_index();
              console.log(index, 'index');
              //optionNames.push(optionName);
              const existingOptionIndex = options.findIndex(option => option.option_description === optionName);
              if (existingOptionIndex !== -1) {
                const updatedOptions = options.map((option, idx) =>
                  idx === existingOptionIndex
                    ? {
                        ...option,
                        address: address,
                        votersCount: 0,
                        totalEth: '0',
                        votersData: [],
                        optionindex: Number(index),
                      }
                    : option
                );
                setOptions(updatedOptions); 
              } else {
              newOptions.push({
                id: index,
                pollId: id as string,
                option_description: optionName,
                address: address,
                votersCount: 0,
                totalEth: '0',
                votersData: [],
                optionindex: Number(index),
              });
              newOptions.sort((a, b) => {
                if (
                  typeof a.optionindex === 'number' &&
                  typeof b.optionindex === 'number'
                ) {
                  return a.optionindex - b.optionindex;
                }
                return 0;
              });
              setOptions(newOptions);}
            } catch (error) {
              console.error('Error fetching options:', error);
            }
          }
        }
        else {
          console.log('Poll contract not existe');
        }
      } catch (error) {
        console.error('Error fetching poll:', error);
      }
    }
  };
  /*const getRequirement = () => {
    const current = Object.values(CREDENTIALS).find(
      (credential) => credential.id === id
    );
    return current?.name;
  };*/

  const warnAndConnect = () => {
    console.error(
      'You need to connect to Wallet to get this information, please try again'
    );
    toast({
      title: 'Error',
      description:
        'You need to connect to Wallet to get this information, please try again',
      variant: 'destructive',
    });
    connect();
  };

  const pollIsLive = remainingTime !== null && remainingTime !== 'Time is up!';

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
        requiredCred,
        signature: null,
      };
      console.log(voteData, 'voteData');
      const response = await castVote(voteData as VoteRequestData);
      console.log(response, 'response');
      toast({
        title: 'Vote cast successfully',
      });
    } catch (error) {
      console.error('Error casting vote:', error);
      return;
    }
  };

  const handleCastVoteSigned = async (
    optionId: string,
    requiredCred: string
  ) => {
    const pollId = poll?.id as string;
    try {
      const newMessage = generateMessage(pollId, optionId, account as string);
      if (account === null) return;
      setMessage(newMessage);
      signMessage();
      // 
      // TODO: We need to sign the message and submit. Wait until isSuccess === true and send the transaction
      // For this we need to save the data
      // 
    } catch (error) {
      console.error('Error signing vote:', error);
      return;
    }
  };

  const handleVote = async (
    optionId: string,
    credentialIds: string[],
    optionIndex: number | undefined
  ) => {
    console.log('handle vote',optionId,credentialIds,optionIndex);
    if (!localStorage.getItem('userUniqueId')) {
      const uniqueId = uuidv4();
      localStorage.setItem('userUniqueId', uniqueId);
    }
    if (voteTable.length > 0) {
      console.log(credentialIds,'vote tqble');
      for (let credentialId of credentialIds) {
        if (isValidUuidV4(credentialId)) {
          switch (credentialId) {
            case CREDENTIALS.ZuConnectResident.id:
              console.log('Zuconnect resident"');
              if (!isPassportConnected) {
                await signIn();
              }
              try {
                // TODO: Verify again on backend
                await verifyticket();
                let usereventId = localStorage.getItem('event Id');
                console.log(usereventId);
                if (
                  usereventId == '91312aa1-5f74-4264-bdeb-f4a3ddb8670c' ||
                  usereventId == '54863995-10c4-46e4-9342-75e48b68d307' ||
                  usereventId == '797de414-2aec-4ef8-8655-09df7e2b6cc6' ||
                  usereventId == 'a6109324-7ca0-4198-9583-77962d1b9d53'
                ) {
                  await handleCastVote(
                    optionId,
                    CREDENTIALS.ZuConnectResident.id,
                    'userId'
                  );
                }
              } catch (error) {
                console.error('Error in verifying ticket:', error);
                return;
              }
              break;
            // Devconnect
            case CREDENTIALS.DevConnect.id:
              if (!isPassportConnected) {
                await signIn();
                return;
              }
              try {
                await devconnectVerify();
                if (localStorage.getItem('devconnectNullifier')) {
                  await handleCastVote(
                    optionId,
                    CREDENTIALS.DevConnect.id,
                    'userId'
                  );
                }
              } catch (error) {
                console.error('Error in verifying ticket:', error);
                return;
              }
              break;
              //Zuzalu Resident
              case CREDENTIALS.ZuzaluResident.id:
              if (!isPassportConnected) {
                await signIn();
                return;
              }
              try {
                await zuzaluVerify();
                if (localStorage.getItem('zuzaluNullifier')) {
                  await handleCastVote(
                    optionId,
                    CREDENTIALS.ZuzaluResident.id,
                    'userId'
                  );
                }
              } catch (error) {
                console.error('Error in verifying ticket:', error);
                return;
              }
              break;
            // Gitcoin
            case CREDENTIALS.GitcoinPassport.id:
              if (!isConnected) {
                warnAndConnect();
                return;
              }
              if (account !== null) {
                let fetchScoreData = {
                  address: account as string,
                  scorerId: '6347',
                };
                let scoreResponse = await fetchScore(fetchScoreData);
                let scoreData = scoreResponse.data;
                console.log(scoreData.score.toString(), 'score');
                setScore(scoreData.score.toString());
                if (scoreData.score.toString() != '0') {
                  await handleCastVoteSigned(
                    optionId,
                    CREDENTIALS.GitcoinPassport.id
                  );
                }
              }
              break;
            // POAPS API
            case CREDENTIALS.POAPapi.id:
              if (poll?.poap_events && poll?.poap_events.length) {
                if (!isConnected) {
                  warnAndConnect();
                  return;
                }

                if (!eventDetails || !Array.isArray(eventDetails)) {
                  console.error('Invalid or empty event details');
                  return; // Exit if eventDetails is not an array
                }

                for (let detail of eventDetails) {
                  if (!detail?.data?.owner) {
                    console.error('Error: An event is missing an owner');
                    toast({
                      title: 'Error',
                      description: 'You need to own all required POAPs',
                      variant: 'destructive',
                    });
                    return; // Exit the function if an event without an owner is found
                  }
                }
                await handleCastVoteSigned(optionId, CREDENTIALS.POAPapi.id);
              }
              break;
            //  EthHolding
            case CREDENTIALS.EthHoldingOffchain.id:
              if (!isConnected) {
                warnAndConnect();
                return;
              }

              // TODO: Check if address has Ether?

              await handleCastVoteSigned(
                optionId,
                CREDENTIALS.EthHoldingOffchain.id
              );
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
            // Protocol Guild
            case CREDENTIALS.ProtocolGuildMember.id:
              if (!isConnected) {
                warnAndConnect();
                return;
              }
              await handleCastVote(
                optionId,
                CREDENTIALS.ProtocolGuildMember.id,
                'userUniqueId'
              );
              break;
          }
        } else {
          console.log(credentialId, 'credentialId');
          console.log(optionIndex as number, 'option index');
          await handleContractVote(credentialId, optionIndex as number);
        }
        await fetchPollFromApi(id);
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
    if (!isConnected) {
      console.error('You need to connect to vote, please try again');
      toast({
        title: 'Error',
        description: 'You need to connect to vote, please try again',
        variant: 'destructive',
      });
      connect();
      return;
    }
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

    if (!window.ethereum) {
      console.error('Please install MetaMask to perform this action.');
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
      const network = await provider.getNetwork();
      if (!canOpenPopup()) {
        toast({
          title: 'Error',
          description:
            'Please enable pop-ups in your browser settings to proceed with the transaction.',
          variant: 'destructive',
        });
        return;
      }
      if (Number(network.chainId) === 11155111) {
        console.log('Connected to Sepolia');
        const transactionResponse = await contract.vote(
          pollIndex,
          newOptionIndex,
          signature,
          message
        );
        await transactionResponse.wait(); // Wait for the transaction to be mined
        console.log('Vote cast successfully');
        toast({
          title: 'Vote cast successfully',
        });
        await fetchPollFromContract(pollId as string);
      } else {
        console.error('You should connect to Sepolia, please try again');
        toast({
          title: 'Error',
          description: 'You should connect to Sepolia, please try again',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Error casting vote:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  if (!poll || isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader />
      </div>
    );
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
        <div className="bg-white flex flex-col gap-1.5 rounded-2xl p-5 ">
          <div className="flex gap-3.5 pb-3">
            <div
              className={`${
                pollIsLive ? 'bg-[#96ecbd]' : 'bg-[#F8F8F8]'
              } px-2.5 rounded-lg items-center`}
            >
              {pollIsLive ? (
                <Label className="text-[#44b678]">Live</Label>
              ) : (
                <Label className="text-[#656565]">Closed</Label>
              )}
            </div>
            {pollIsLive ? (
              <div className="flex gap-2">
                <ClockIcon />
                <CountdownTimer endTime={poll.endTime} />
              </div>
            ) : null}
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-black/60 text-base">Motion: </Label>
            <Label className="text-2xl">{poll?.title || poll?.name}</Label>
          </div>
          <div className="flex justify-end pb-5 border-b border-black/30">
            {/* <Label>by: {mockPoll.creator}</Label> */}
          </div>
          <div className="flex flex-col gap-2.5">
            <Label className="text-black/60 text-lg font-bold">
              Description:{' '}
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
              {(!poll?.poap_events || poll?.poap_events.length === 0) &&
              credentialId === CREDENTIALS.POAPSVerification.id ? (
                <div>
                  <div>
                    <Label className="text-sm">
                      Number of POAPS you have: {poapsNumber}/5 (You need to
                      have more than 5 Ethereum POAPS to vote)
                    </Label>
                  </div>
                  <div>
                    <Label className="text-sm">
                      Please notice that for now in this test version, we only
                      stored the participation list of 2 Ethereum events.
                    </Label>
                  </div>
                </div>
              ) : (
                <div></div>
              )}
              {credentialId === '6ea677c7-f6aa-4da5-88f5-0bcdc5c872c2' && (
                <Label className="text-sm">
                  Your gitcoin passport score is: {score}/100 (Your score must
                  be higher than 0 to vote)
                </Label>
              )}
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
                    //isChecked={selectedOption === option.id}
                    //type="api"
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
            <Label className="text-2xl">Poll finished</Label>
          )}
        </div>
        <button onClick={() => setIsPopupOpen(!isPopupOpen)}>Open Popup</button>
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
                  <div className="flex flex-col gap-2.5">
                    {credentialTable.map((credential) => {
                      const imagePath = getImagePathByCredential(
                        credential.credential
                      );
                      return (
                        <div
                          key={credential.id}
                          className={styles.radios_flex_col}
                        >
                          <label className={styles.choice_option}>
                            <input
                              type="checkbox"
                              name="credentials"
                              value={credential.id}
                              checked={voteTable.includes(credential.id)}
                              onChange={handleVotesRadioChange}
                              className={styles.hidden_radio}
                            />
                            {imagePath && (
                              <img
                                src={imagePath}
                                alt="Credential"
                                className="image-class-name"
                              />
                            )}
                            <span>
                              {credential.credential}
                              {votedOptions ? ` (${votedOptions})` : ''}
                            </span>
                          </label>
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
                      setShowConfirmationPopup(false);if (selectedOptionData) {
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
            {showConfirmationPopup && <ConfirmationPopup />}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-8 w-96">
        <div className="px-2.5 py-5 pb-2 rounded-2xl bg-white">
          <Label className="text-2xl">Details</Label>
          <hr></hr>
          <div className="flex flex-col gap-4 pt-3 text-base">
            <Label>Voting Method: HeadCounting</Label>
            <Label>
              {(() => {
                return `Start Date: ${new Date(Number(poll.startTime))}`;
              })()}
            </Label>
            <Label>
              {(() => {
                return `End Date: ${new Date(Number(poll.endTime))}`;
              })()}
            </Label>
            <Label className="text-1xl">Requirements:</Label>

            {poll?.block_number !== undefined && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1px solid #ccc',
                  borderRadius: '9999px',
                  padding: '4px 8px',
                  margin: '4px',
                }}
              >
                <img
                  src={'/images/carbonvote.png'}
                  alt="Requirement image"
                  style={{
                    width: '30px',
                    height: '30px',
                    marginRight: '8px',
                    borderRadius: 100,
                  }}
                />
                <span>{userEthHolding} ETH</span>
                <div style={{ marginLeft: 10 }}>
                  <EthIcon />
                </div>
              </div>
            )}

            <div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1px solid #ccc',
                  borderRadius: '9999px',
                  padding: '4px 8px',
                  margin: '4px',
                }}
              >
                <img
                  src={'/images/carbonvote.png'}
                  alt="Requirement image"
                  style={{
                    width: '30px',
                    height: '30px',
                    marginRight: '8px',
                    borderRadius: 100,
                  }}
                />
                <span>{'getRequirement()'}</span>
                <div style={{ marginLeft: 10 }}>⚪️</div>
              </div>
            </div>
            {poll?.poap_events?.length > 0 && (
              <PoapDetails
                poapEvents={poll?.poap_events}
                account={account as string}
                eventDetails={eventDetails}
                setEventDetails={setEventDetails}
              />
            )}
          </div>
        </div>
        <PollResultComponent
          pollType={PollTypes.HEAD_COUNT}
          optionsData={options}
        />
      </div>
    </div>
  );
};

export default PollPage;
