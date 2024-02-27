'use client'
import { useEffect, useState } from 'react';
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
import { ethers } from 'ethers';
import contractABI from '@/carbonvote-contracts/deployment/contracts/poapsverification.json';
import { calculateTimeRemaining, convertOptionsToPollOptions } from '@/utils/index';
import { v4 as uuidv4 } from 'uuid';
import PoapDetails from '@/components/POAPDetails';
import { fetchScore } from '@/controllers';
import { Loader } from '@/components/ui/Loader';
import PieChartComponent from '@/components/ui/PieChart';
import { PollOptionType, Poll, PollTypes } from '@/types';
import { CREDENTIALS } from '@/src/constants';
import { PollResultComponent } from '@/components/PollResult';
import { getBalanceAtBlock } from '@/utils/getBalanceAtBlock'
import { generateMessage } from '@/utils/generateMessage'

const PollPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const handleBack = () => {
    router.push('/');
  };
  const [poll, setPoll] = useState<Poll>();
  const { signIn, isPassportConnected, verifyticket, devconnectVerify } =
    useUserPassportContext(); // zupass
  const { address: account, isConnected } = useAccount();
  const { connect } = useConnect();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [options, setOptions] = useState<PollOptionType[]>([]);
  const [credentialId, setCredentialId] = useState('');
  const [userEthHolding, setUserEthHolding] = useState('0');
  const [score, setScore] = useState('0');
  const [remainingTime, settimeRemaining] = useState('');
  const [startDate, setstartDate] = useState<Date>();
  const [poapsNumber, setPoapsNumber] = useState('0');
  const [eventDetails, setEventDetails] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const { data, isError, isLoading, isSuccess, signMessage } = useSignMessage({
    message,
  });

  console.log("🚀 ~ PollPage ~ data:", data)
  useEffect(() => {
    if (id !== undefined) {
      fetchPollFromApi(id);
      getEthHoldings();
    }
  }, [id]);

  useEffect(() => {
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
  }, [isSuccess, data]);

  useEffect(() => {
    console.log('account changed');
    setSelectedOption(null);
    fetchPollFromApi(id);
    if (credentialId == '6ea677c7-f6aa-4da5-88f5-0bcdc5c872c2') {
      const fetchNewScore = async () => {
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
          // TODO: Replace ethers with wagmi.
          // ref: https://wagmi.sh/core/api/actions/readContract
          // TODO: Replace hardcoded URL with dynamic.
          const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/01371fc4052946bd832c20ca12496243');
          //const provider=new ethers.providers.JsonRpcProvider(sepoliaRPC);
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
  }, [account]);

  const getEthHoldings = async () => {
    const blockNumber = poll?.block_number ?? 0;
    const userBalance = await getBalanceAtBlock(account as string, blockNumber);
    const balanceInEth = ethers.formatEther(userBalance); // ethers.js returns balances in wei, convert it to ether
    console.log(`Balance at block ${blockNumber}: ${balanceInEth} ETH`);

    setUserEthHolding(parseFloat(balanceInEth).toFixed(4));
  };

  const fetchPollFromApi = async (pollId: string | string[] | undefined) => {
    try {
      const response = await fetchPollById(pollId as string);
      const data = await response.data;
      console.log(data, 'pollData');
      setPoll(data);
      setOptions(data.options);
      const newCredentialId = data.credentials?.[0]?.id || '';
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
      }
      const timeleft = calculateTimeRemaining(data.endTime);
      console.log(data.endTime);
      console.log(data.startTime);
      const startdate = new Date(data.startTime);
      setstartDate(startdate);
      console.log(startDate, 'start date');
      if (timeleft) {
        settimeRemaining(timeleft);
      }
      if (newCredentialId) {
        setCredentialId(newCredentialId);
        console.log('credential ID', newCredentialId);
      }
      //console.log(pollIsLive, 'live');
    } catch (error) {
      console.error('Error fetching poll from API:', error);
    }
  };

  const getRequirement = () => {
    const current = Object.values(CREDENTIALS).find(
      (credential) => credential.id === id
    );
    return current?.name;
  };

  const warnAndConnect = () => {
    console.error(
      'You need to connect to Metamask to get this information, please try again'
    );
    toast({
      title: 'Error',
      description:
        'You need to connect to Metamask to get this information, please try again',
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
      await fetchPollFromApi(id);
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
      const newMessage = generateMessage(pollId, optionId, account as string, requiredCred);
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

  const handleVote = async (optionId: string) => {
    if (!localStorage.getItem('userUniqueId')) {
      const uniqueId = uuidv4();
      localStorage.setItem('userUniqueId', uniqueId);
    }
    // Zuconnect credentials voting
    if (credentialId == CREDENTIALS.ZuConnectResident.id) {
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
    }
    // Devconnect
    else if (credentialId == CREDENTIALS.DevConnect.id) {
      if (!isPassportConnected) {
        await signIn();
        return;
      }
      try {
        await devconnectVerify();
        if (localStorage.getItem('devconnectNullifier')) {
          await handleCastVote(optionId, CREDENTIALS.DevConnect.id, 'userId');
        }
      } catch (error) {
        console.error('Error in verifying ticket:', error);
        return;
      }
    }
    // Gitcoin
    else if (credentialId == CREDENTIALS.GitcoinPassport.id) {
      if (!isConnected) {
        warnAndConnect();
        return;
      }
      if (account !== null) {
        let fetchScoreData = { address: account as string, scorerId: '6347' };
        let scoreResponse = await fetchScore(fetchScoreData);
        let scoreData = scoreResponse.data;
        console.log(scoreData.score.toString(), 'score');
        setScore(scoreData.score.toString());
        if (scoreData.score.toString() != '0') {
          await handleCastVoteSigned(optionId, CREDENTIALS.GitcoinPassport.id);
        }
      }
    }
    // POAPS API
    else if (poll?.poap_events && poll?.poap_events.length) {
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
    //  EthHolding
    else if (credentialId == CREDENTIALS.EthHoldingOffchain.id) {
      if (!isConnected) {
        warnAndConnect();
        return;
      }

      // TODO: Check if address has Ether?

      await handleCastVoteSigned(optionId, CREDENTIALS.EthHoldingOffchain.id);
    }
    // POAPS ONCHAIN
    else if (credentialId == CREDENTIALS.POAPSVerification.id) {
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
      }
      // Protocol Guild
      else if (poll?.poap_events && poll?.poap_events.length) {
        if (!isConnected) {
          warnAndConnect();
          return;
        }
        await handleCastVote(
          optionId,
          CREDENTIALS.ProtocolGuildMember.id,
          'userUniqueId'
        );
      }
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
              className={`${pollIsLive ? 'bg-[#96ecbd]' : 'bg-[#F8F8F8]'
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
            <Label className="text-2xl">{poll?.title}</Label>
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

        <div className="bg-white/40 p-2.5 flex flex-col gap-3.5">
          {pollIsLive ? (
            <>
              <Label className="text-2xl">Vote on Poll</Label>
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
              <div className="flex flex-col gap-2.5">
                {options?.map((option) => (
                  <OptionButton
                    key={option.id}
                    id={option.id}
                    optionName={option.option_description}
                    onVote={(optionId) => handleVote(optionId as string)}
                    isChecked={selectedOption === option.id}
                    type="api"
                    optionAddress={undefined}
                  />
                ))}
              </div>
            </>
          ) : (
            <Label className="text-2xl">Poll finished</Label>
          )}
        </div>
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
                <div style={{ marginLeft: 10 }}><EthIcon /></div>
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
                <span>{getRequirement()}</span>
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
        <PollResultComponent pollType={PollTypes.HEAD_COUNT} optionsData={options} />
      </div>
    </div>
  );
};

export default PollPage;
