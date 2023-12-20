import { ArrowLeftIcon, StopCircleIcon, ThumbDownIcon, ThumbUpIcon } from '@/components/icons';
import { ClockIcon } from '@/components/icons/clock';
import Button from '@/components/ui/buttons/Button';
import CheckerButton from '@/components/ui/buttons/CheckerButton';
import CountdownTimer from '@/components/ui/CountDownTimer';
import HtmlString from '@/components/ui/Html';
import { Label } from '@/components/ui/Label';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import OptionButton from '@/components/ui/buttons/OptionButton';
import { toast } from '@/components/ui/use-toast';
import { VoteRequestData, castVote, fetchPollById } from '@/controllers/poll.controller';
import { useUserPassportContext } from '@/context/PassportContext';
import OptionVotingCountProgress from '@/components/OptionVotingCounts';
import { PollOptionType, PollType, RemainingTime } from '@/types';
import { getPollStatus } from '@/utils';
import PieChartComponent from '@/components/ui/PieChart';

const PollPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const handleBack = () => {
    router.push('/');
  };
  const [poll, setPoll] = useState<PollType>();
  const { signIn, isPassportConnected } = useUserPassportContext();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [options, setOptions] = useState<PollOptionType[]>([]);
  const [isClosed, setIsClosed] = useState<boolean>();
  const [remainingTime, setRemainingTime] = useState<RemainingTime>();

  console.log(poll?.options, 'options');
  useEffect(() => {
    const optionContractAbi = VotingOption.abi;
    const optionNames: any[] = [];

    const fetchVotingOption = async () => {
      if (window.ethereum && id && poll && poll.options) {
        let provider = new ethers.BrowserProvider(window.ethereum as any);
        let signer = await provider.getSigner();

        for (const address of poll.options) {
          const contract = new ethers.Contract(address, optionContractAbi, signer);
          console.log(contract, 'contract');

          try {
            const optionName = await contract.name();
            optionNames.push(optionName);
          } catch (error) {
            console.error('Error fetching options:', error);
          }
        }
        console.log(optionNames, 'optionNames');
      }
    };

    fetchVotingOption();
  }, [id, poll]); // Adding poll to the dependency array to re-run the effect when poll changes

  useEffect(() => {
    fetchPollFromApi(id);

    const interval = setInterval(() => {
      if (poll) {
        const pollStatus = getPollStatus(poll);
        setRemainingTime(pollStatus.remainingTime);
        setIsClosed(pollStatus.closed);
      }
    }, 1000)

    return () => {
      clearInterval(interval);
    };
  }, [id]);

  const fetchPollFromApi = async (pollId: string | string[] | undefined) => {
    try {
      const response = await fetchPollById(pollId as string);
      const data = await response.data;
      console.log(data, 'pollData');
      setPoll(data);
      const pollStatus = getPollStatus(data);
      setRemainingTime(pollStatus.remainingTime);
      setIsClosed(pollStatus.closed);
      setOptions(data.options);
    } catch (error) {
      console.error('Error fetching poll from API:', error);
    }
  };

  const handleVote = async (optionId: string) => {
    if (!isPassportConnected) {
      signIn();
      return;
    }
    const voter_identifier = localStorage.getItem('userId');
    const pollId = poll?.id;
    const voteData = {
      poll_id: pollId,
      option_id: optionId,
      voter_identifier: voter_identifier,
    };

    try {
      console.log(voteData, 'voteData');
      const response = await castVote(voteData as VoteRequestData);
      console.log(response, 'response');
      toast({
        title: 'Vote cast successfully',
      });
      await fetchPollFromApi(id);
    } catch (error: any) {
      console.error('Error casting vote:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (!poll) {
    return <div>Loading...</div>; // Add loading state handling
  }

  return (
    <div className="flex gap-20 px-20 pt-5 text-black w-full justify-center">
      <div className="flex flex-col gap-2.5 max-w-[1000px] w-full">
        <div>
          <Button className="rounded-full" leftIcon={ArrowLeftIcon} onClick={handleBack}>
            Back
          </Button>
        </div>
        <div className="bg-white flex flex-col gap-1.5 rounded-2xl p-5 ">
          <div className="flex gap-3.5 pb-3">
            <div className={`${!isClosed ? `bg-[#F84A4A20]` : `bg-[#F8F8F8]`} px-2.5 rounded-lg items-center`}>{!isClosed ? <Label className="text-[#F84A4A]">Live</Label> : <Label className="text-[#656565]">Closed</Label>}</div>
            {!isClosed && remainingTime ? (
              <div className="flex gap-2">
                <ClockIcon />
                <CountdownTimer remainingTime={remainingTime} />
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-black/60 text-base">Motion: </Label>
            <Label className="text-2xl">{poll?.title}</Label>
          </div >
          <div className="flex justify-end pb-5 border-b border-black/30">{/* <Label>by: {mockPoll.creator}</Label> */}</div>
          <div className="flex flex-col gap-2.5">
            <Label className="text-black/60 text-lg font-bold">Description: </Label>
            <span dangerouslySetInnerHTML={{ __html: poll?.description }} />
          </div>
        </div >
        <div className="bg-white/40 p-2.5 flex flex-col gap-3.5">
          <Label className="text-2xl">Vote on Poll</Label>
          <Label>
            This vote requires a <Label className="font-bold">zero-value transaction</Label> from your wallet
          </Label>
          <div className="flex flex-col gap-2.5">
            {options?.map((option) => (
              <OptionButton
                key={option.id}
                id={option.id}
                optionName={option.option_description}
                onVote={(optionId) => handleVote(optionId as string)}
                isChecked={selectedOption === option.option_description}
                type="api"
              />
            ))}
          </div>
        </div>
      </div >
      <div className="flex flex-col gap-8 w-96">
        <div className="px-2.5 py-5 pb-2 rounded-2xl bg-white">
          <Label className="text-2xl">Details</Label>
          <hr></hr>
          <div className='flex flex-col gap-4 pt-3 text-base'>
            <Label>Voting Method: </Label>
            <Label>Start Date: </Label>
            <Label>End Date: </Label>
            <Label>Requirements: </Label>
          </div>
        </div>
        <div className="px-2.5 py-5 pb-2 rounded-2xl bg-white">
          <Label className="text-2xl">Results</Label>
          <hr></hr>
          <div className='flex flex-col gap-2.5 pt-2.5'>
            {options &&
              options.map((option: PollOptionType) => (
                <OptionVotingCountProgress key={option.id} description={option.option_description} votes={option.votes} />
              ))
            }
          </div>
          <PieChartComponent votes={options} />
        </div>
      </div>
    </div >
  )
};

export default PollPage;
