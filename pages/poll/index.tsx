import { useEffect, useState } from 'react';
import { ArrowLeftIcon } from '@/components/icons';
import { ClockIcon } from '@/components/icons/clock';
import Button from '@/components/ui/buttons/Button';
import CountdownTimer from '@/components/ui/CountDownTimer';
import { Label } from '@/components/ui/Label';
import { useRouter } from 'next/router';
import OptionButton from '@/components/ui/buttons/OptionButton';
import { toast } from '@/components/ui/use-toast';
import { VoteRequestData, castVote, fetchPollById, fetchVote, } from '@/controllers/poll.controller';
import { useUserPassportContext } from '@/context/PassportContext';
import OptionVotingCountProgress from '@/components/OptionVotingCounts';
import { useWallet } from '@/context/WalletContext';
import { ethers } from "ethers";
import contractABI from '@/carbonvote-contracts/deployment/contracts/poapsverification.json';
import { calculateTimeRemaining } from '@/utils/index';
import { v4 as uuidv4 } from 'uuid';
import PoapDetails from '@/components/POAPDetails'
import { fetchScore } from '@/controllers';
import { Loader } from '@/components/ui/Loader';

interface Poll {
  id: string;
  name: string;
  title: string;
  startTime: number;
  endTime: number;
  isLive: boolean;
  creator: string;
  topic: string;
  subTopic: string;
  description: string;
  options: string[];
  pollMetadata: string;
  poap_events: number[]
}

interface Option {
  id: string;
  option_description: string;
  pollId: string;
  totalWeight: number;
  votes: number;
}

const PollPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const handleBack = () => {
    router.push('/');
  };
  const [poll, setPoll] = useState<Poll>();
  const { signIn, isPassportConnected, verifyticket, devconnectVerify } = useUserPassportContext();
  const { connectToMetamask, isConnected, account, hasChangedAccount } = useWallet();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [options, setOptions] = useState<Option[]>([]);
  const [credentialId, setCredentialId] = useState("");
  const [score, setScore] = useState('0');
  const [remainingTime, settimeRemaining] = useState('');
  const [startDate, setstartDate] = useState<Date>();
  const [poapsNumber, setPoapsNumber] = useState('0');
  const [eventDetails, setEventDetails] = useState<any[]>([])
  //const [pollIsLive, setPollLive] = useState(false);

  const contractAddress = "0xD07E11aeA30DC68E42327F116e47f12C7E434d77";
  useEffect(() => {
    fetchPollFromApi(id);
  }, [id]);

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
    } else if (credentialId == "600d1865-1441-4e36-bb13-9345c94c4dfb") {
      const fetchNewNumber = async () => {
        try {
          const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/01371fc4052946bd832c20ca12496243');
          //const provider=new ethers.providers.JsonRpcProvider(sepoliaRPC);
          const contract = new ethers.Contract(contractAddress, contractABI, provider);
          const events = await contract.getEventCountForCollection(account);

          setPoapsNumber(events.toString());
        } catch (error) {
          console.error('Error fetching score:', error);
        }
      };
      fetchNewNumber();
    }
  }, [account]);

  const fetchPollFromApi = async (pollId: string | string[] | undefined) => {
    try {
      const response = await fetchPollById(pollId as string);
      const data = await response.data;
      console.log(data, 'pollData');
      setPoll(data);
      console.log(poll?.poap_events.length, 'poll?.poap_events');
      setOptions(data.options);
      const credentialId = data.credentials?.[0]?.id || "";
      let identifier: string | null = null;
      if (credentialId) {
        switch (credentialId) {
          case '76118436-886f-4690-8a54-ab465d08fa0d': //Zuconnect
          case '3cc4b682-9865-47b0-aed8-ef1095e1c398': //Devconnect
            if (localStorage.getItem('userId')) { identifier = localStorage.getItem('userId'); }
            break;
          case '6ea677c7-f6aa-4da5-88f5-0bcdc5c872c2': //Gitcoin passport
          case '600d1865-1441-4e36-bb13-9345c94c4dfb': //POAPS verification
            if (localStorage.getItem('account')) { identifier = localStorage.getItem('account'); }
            break;
        }
      }
      else {
        if (!localStorage.getItem('userUniqueId')) {
          const uniqueId = uuidv4();
          localStorage.setItem('userUniqueId', uniqueId);
        }
        identifier = localStorage.getItem('userUniqueId');
      }
      const checkdata = {
        id: pollId as string,
        identifier: identifier as string
      }
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
      if (!timeleft) { }
      else {
        settimeRemaining(timeleft);
      }
      /*console.log(pollIsLive, 'live1');
      console.log(remainingTime, 'remaining time');
      if (remainingTime !== null && remainingTime !== 'Time is up!') {
        setPollLive(true);
        console.log(remainingTime, 'remaining Time', pollIsLive);
      }*/
      if (credentialId) {
        setCredentialId(credentialId);
        console.log(credentialId, 'credential ID');
      }
      //console.log(pollIsLive, 'live');
    } catch (error) {
      console.error('Error fetching poll from API:', error);
    }
  };

  const getRequirement = () => {
    switch (credentialId) {
      case '76118436-886f-4690-8a54-ab465d08fa0d':
        return 'Zuconnect Resident';
      case '3cc4b682-9865-47b0-aed8-ef1095e1c398':
        return 'Devconnect Resident';
      case '6ea677c7-f6aa-4da5-88f5-0bcdc5c872c2':
        return 'Gitcoin Passport';
      case '600d1865-1441-4e36-bb13-9345c94c4dfb':
        return 'POAPS Verification';
      default:
        return '';
    }
  }

  const warnAndConnect = () => {
    console.error('You need to connect to Metamask to get this information, please try again');
    toast({
      title: 'Error',
      description: 'You need to connect to Metamask to get this information, please try again',
      variant: 'destructive',
    });
    connectToMetamask();
  }

  const pollIsLive = remainingTime !== null && remainingTime !== 'Time is up!';

  const handleVote = async (optionId: string) => {
    let canVote = false;
    let voter_identifier: any = '';
    if (!localStorage.getItem('userUniqueId')) {
      const uniqueId = uuidv4();
      localStorage.setItem('userUniqueId', uniqueId);
    }
    //Zuconnect credentials voting
    if (credentialId == '76118436-886f-4690-8a54-ab465d08fa0d') {
      console.log('Zuconnect resident"');
      if (!isPassportConnected) {
        await signIn();
      }
      try {
        await verifyticket();
        let usereventId = localStorage.getItem('event Id');
        console.log(usereventId);
        if (usereventId == "91312aa1-5f74-4264-bdeb-f4a3ddb8670c" || usereventId == "54863995-10c4-46e4-9342-75e48b68d307" || usereventId == "797de414-2aec-4ef8-8655-09df7e2b6cc6" || usereventId == "a6109324-7ca0-4198-9583-77962d1b9d53") {
          canVote = true;
          console.log(canVote);
        }
      } catch (error) {
        console.error('Error in verifying ticket:', error);
        return;
      }
      voter_identifier = localStorage.getItem('userId');
    }
    //Devconnect
    else if (credentialId == '3cc4b682-9865-47b0-aed8-ef1095e1c398') {
      if (!isPassportConnected) {
        await signIn();
      }
      try {
        await devconnectVerify();
        if (localStorage.getItem('devconnect Id')) {
          canVote = true;
        }
      }
      catch (error) {
        console.error('Error in verifying ticket:', error);
        return;
      }
      voter_identifier = localStorage.getItem('userId');
    }
    //Gitcoin
    else if (credentialId == '6ea677c7-f6aa-4da5-88f5-0bcdc5c872c2') {
      if (!isConnected) {
        warnAndConnect();
        return;
      }
      if (account !== null) {
        let fetchScoreData = { address: account, scorerId: '6347' };
        let scoreResponse = await fetchScore(fetchScoreData);
        let scoreData = scoreResponse.data;
        console.log(scoreData.score.toString(), 'score');
        setScore(scoreData.score.toString());
        if (scoreData.score.toString() != '0') {
          canVote = true;
        }
      }
      voter_identifier = account;
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
      voter_identifier = account;
      canVote = true;
    }
    //POAPS ONCHAIN
    else if (credentialId == '600d1865-1441-4e36-bb13-9345c94c4dfb') {
      if (!isConnected) {
        warnAndConnect();
        return;
      }
      try {
        const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/01371fc4052946bd832c20ca12496243');
        //const provider=new ethers.providers.JsonRpcProvider(sepoliaRPC);
        const contract = new ethers.Contract(contractAddress, contractABI, provider);
        const events = await contract.getEventCountForCollection(account);

        setPoapsNumber(events.toString());
        console.log(events.toString(), 'events');
      } catch (error) {
        console.error("An error occurred:", error);
      }

      if (Number(poapsNumber) > 4) {
        canVote = true;
      }
      voter_identifier = account;
    } else {
      voter_identifier = localStorage.getItem('userUniqueId');
      canVote = true;
    }
    const pollId = poll?.id;
    const voteData = {
      poll_id: pollId,
      option_id: optionId,
      voter_identifier: voter_identifier,
    };

    try {
      console.log(voteData, 'voteData');
      console.log(canVote);
      if (!canVote) {
        console.error('You do not have the credential to vote');
        toast({
          title: 'Error',
          description: 'You do not have the credential to vote',
          variant: 'destructive',
        });
      }
      else {
        // FIXME: We need to add signature to validate vote even if it's only checked by the backend
        // this way we avoit injection of accounts
        const response = await castVote(voteData as VoteRequestData);
        console.log(response, 'response');
        toast({
          title: 'Vote cast successfully',
        });
        await fetchPollFromApi(id);
      }
    } catch (error: any) {
      if (error.response && error.response.status === 409) {
        console.error('You have already voted for this option');
        toast({
          title: 'Warning',
          description: 'You have already voted for this option',
          variant: 'destructive',
        });
      }
      else {
        console.error('Error casting vote:', error);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
    }
  };

  if (!poll) {
    return <Loader />; // Add loading state handling
  }

  return (
    <div className="flex flex-col md:flex-row gap-20 px-20 pt-5 text-black w-full justify-center">
      <div className="flex flex-col gap-2.5 max-w-[1000px] w-full">
        <div>
          <Button className="rounded-full" leftIcon={ArrowLeftIcon} onClick={handleBack}>
            Back
          </Button>
        </div>
        <div className="bg-white flex flex-col gap-1.5 rounded-2xl p-5 ">
          <div className="flex gap-3.5 pb-3">
            <div className={`${pollIsLive ? 'bg-[#96ecbd]' : 'bg-[#F8F8F8]'
              } px-2.5 rounded-lg items-center`}>
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
          <div className="flex justify-end pb-5 border-b border-black/30">{/* <Label>by: {mockPoll.creator}</Label> */}</div>
          <div className="flex flex-col gap-2.5">
            <Label className="text-black/60 text-lg font-bold">Description: </Label>
            <span dangerouslySetInnerHTML={{ __html: poll?.description }} />
          </div>
        </div>

        <div className="bg-white/40 p-2.5 flex flex-col gap-3.5">
          {pollIsLive ? (
            <>
              <Label className="text-2xl">Vote on Poll</Label>
              {(!poll?.poap_events || poll?.poap_events.length === 0) && credentialId === "600d1865-1441-4e36-bb13-9345c94c4dfb" ? (
                <div>
                  <div><Label className="text-sm">Number of POAPS you have: {poapsNumber}/5 (You need to have more than 5 Ethereum POAPS to vote)</Label></div>
                  <div><Label className="text-sm">Please notice that for now in this test version, we only stored the participation list of 2 Ethereum events.</Label></div>
                </div>
              ) : (
                <div></div>
              )}
              {credentialId === "6ea677c7-f6aa-4da5-88f5-0bcdc5c872c2" && (
                <Label className="text-sm">Your gitcoin passport score is: {score}/100 (Your score must be higher than 0 to vote)</Label>
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
          <div className='flex flex-col gap-4 pt-3 text-base'>
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
            <Label className="text-1xl">
              Requirements:
            </Label>
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                border: '1px solid #ccc',
                borderRadius: '9999px',
                padding: '4px 8px',
                margin: '4px',
              }}>
                <img src={'/images/carbonvote.png'} alt="Requirement image" style={{ width: '30px', height: '30px', marginRight: '8px', borderRadius: 100 }} />
                <span>{getRequirement()}</span>
                {/* TODO: Check if this is complied */}
                <div style={{ marginLeft: 10 }}>⚪️</div>
                {/* <div style={{ marginLeft: 10 }}>{true ? "✅" : "🔴"}</div> */}
              </div>
            </div>
            {(poll?.poap_events?.length > 0) && (
              <PoapDetails poapEvents={poll?.poap_events} account={account} eventDetails={eventDetails} setEventDetails={setEventDetails} />
            )}
          </div>
        </div>
        <div className="px-2.5 py-5 pb-2 rounded-2xl bg-white">
          <Label className="text-2xl">Results</Label>
          <hr></hr>
          <div className='flex flex-col gap-2.5 pt-2.5'>
            {options &&
              options.map((option: Option) => (
                <OptionVotingCountProgress description={option.option_description} votes={option.votes} />
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
};

export default PollPage;
