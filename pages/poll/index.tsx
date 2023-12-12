import { Contract, ethers } from 'ethers';
import { ArrowLeftIcon, StopCircleIcon, ThumbDownIcon, ThumbUpIcon } from '@/components/icons';
import { ClockIcon } from '@/components/icons/clock';
import Button from '@/components/ui/buttons/Button';
import CheckerButton from '@/components/ui/buttons/CheckerButton';
import CountdownTimer from '@/components/ui/CountDownTimer';
import HtmlString from '@/components/ui/Html';
import { Label } from '@/components/ui/Label';
import { OptionType, PollType } from '@/types';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { contract_addresses } from '../../carbonvote-contracts/artifacts/deployedAddresses.json';
import VotingContract from '../../carbonvote-contracts/artifacts/contracts/VoteContract.sol/VotingContract.json';
import VotingOption from '../../carbonvote-contracts/artifacts/contracts/VotingOption.sol/VotingOption.json';
import OptionButton from '@/components/ui/buttons/OptionButton';
import { toast } from '@/components/ui/use-toast';
import { use } from 'chai';
interface Poll {
  id: string;
  name: string;
  startDate: string | Date;
  endDate: string | Date;
  isLive: boolean;
  creator: string;
  topic: string;
  subTopic: string;
  isZuPassRequired: boolean;
  description: string;
  options: string[];
  pollMetadata: string;
}

const PollPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const handleBack = () => {
    router.push('/');
  };
  const [poll, setPoll] = useState<Poll>();
  const contractAbi = VotingContract.abi;
  const contractAddress = contract_addresses.VotingContract;
  const [optionNames, setOptionNames] = useState<string[]>([]);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  useEffect(() => {
    const fetchPoll = async () => {
      if (window.ethereum && id) {
        let provider = new ethers.BrowserProvider(window.ethereum as any);
        let signer = await provider.getSigner();

        const contract = new ethers.Contract(contractAddress, contractAbi, signer);

        try {
          const pollData = await contract.getPoll(id);
          // console.log(contract);
          // console.log(pollData, 'pollData');
          setPoll(pollData);
        } catch (error) {
          console.error('Error fetching poll:', error);
        }
      }
    };

    fetchPoll();
  }, []);

  useEffect(() => {
    const optionContractAbi = VotingOption.abi;
    const optionNames: any[] = [];

    const fetchVotingOption = async () => {
      if (window.ethereum && id && poll && poll.options) {
        let provider = new ethers.BrowserProvider(window.ethereum as any);
        let signer = await provider.getSigner();
        console.log(poll.options, 'poll.options');
        for (const address of poll.options) {
          const contract = new ethers.Contract(address, optionContractAbi, signer);
          // console.log(contract, 'contract');

          try {
            const optionName = await contract.name();
            optionNames.push(optionName);
          } catch (error) {
            console.error('Error fetching options:', error);
          }
        }
        setOptionNames(optionNames);
        // console.log(optionNames, 'optionNames');
      }
    };

    fetchVotingOption();
  }, [id, poll]);

  useEffect(() => {
    const optionContractAbi = VotingOption.abi;
    const getOptionVoteCounts = async () => {
      if (window.ethereum && id && poll && poll.options) {
        let provider = new ethers.BrowserProvider(window.ethereum as any);

        for (const address of poll.options) {
          const contract = new ethers.Contract(address, optionContractAbi, provider);
          const votersCount = await contract.getVotersCount();

          let votersData = [];
          for (let i = 0; i < votersCount; i++) {
            const voterAddress = await contract.voters(i);
            const balance = await provider.getBalance(voterAddress);
            const balanceInEth = ethers.formatEther(balance);

            votersData.push({
              address: voterAddress,
              balance: balanceInEth,
            });
          }

          // Now you have all voter addresses and their balances for a specific option
          console.log(votersData, 'votersData');
        }
      }
    };

    getOptionVoteCounts();
  }, [id, poll]);

  const handleVote = async (optionIndex: number) => {
    const signature = localStorage.getItem('userSignature');
    const message = localStorage.getItem('userMessage');

    if (!signature || !message) {
      console.error('No signature or message found. Please connect your wallet.');
      return;
    }

    if (!window.ethereum) {
      console.error('Please install MetaMask to perform this action.');
      return;
    }

    try {
      let provider = new ethers.BrowserProvider(window.ethereum as any);
      let signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      const pollIndex = Number(id);
      const newOptionIndex = Number(optionIndex);
      // console.log(pollIndex, 'pollIndex');
      // console.log(newOptionIndex, 'newOptionIndex');
      // console.log(signature, 'signature');
      // console.log(message, 'message');
      const transactionResponse = await contract.vote(pollIndex, newOptionIndex, signature, message);
      await transactionResponse.wait(); // Wait for the transaction to be mined
      console.log('Vote cast successfully');
      toast({
        title: 'Vote cast successfully',
      });
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
      <div className="flex flex-col gap-2.5">
        <div>
          <Button className="rounded-full" leftIcon={ArrowLeftIcon} onClick={handleBack}>
            Back
          </Button>
        </div>
        <div className="bg-white flex flex-col gap-2.5 rounded-2xl p-5 ">
          <div className="flex gap-3.5 pb-3">
            <div className="bg-[#F84A4A20] px-2.5 rounded-lg items-center">{poll?.isLive ? <Label className="text-[#F84A4A]">Live</Label> : <Label className="text-white/70">Ended</Label>}</div>
            {poll?.isLive ? (
              <div className="flex gap-2">
                <ClockIcon />
                <CountdownTimer targetDate={new Date('2023-12-25T00:00:00')} />
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-black/60 text-lg">Motion: </Label>
            <Label className="text-2xl">{poll?.name}</Label>
          </div>
          <div className="flex justify-end pb-5 border-b border-black/30">{/* <Label>by: {mockPoll.creator}</Label> */}</div>
          <div className="flex flex-col gap-2.5">
            <Label className="text-black/60 text-lg font-bold">Description: </Label>
            <span dangerouslySetInnerHTML={{ __html: poll?.description }} />
          </div>
        </div>
        <div className="bg-white/40 p-2.5 flex flex-col gap-3.5">
          <Label className="text-2xl">Vote on Poll</Label>
          <Label>
            This vote requires a <Label className="font-bold">zero-value transaction</Label> from your wallet
          </Label>
          <div className="flex flex-col gap-2.5">
            {optionNames.map((optionName, index) => (
              <OptionButton key={index} index={index} optionName={optionName} onVote={() => handleVote(index)} isChecked={selectedOption === optionName} />
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-10 w-96">
        <div className="flex flex-col bg-white rounded-xl gap-5">
          <div className="px-2.5 py-5 border-b border-b-black/40 pb-5">
            <Label className="text-2xl">Details</Label>
          </div>
          {/* <div className="flex flex-col gap-2.5 pl-5 pb-5">
            <Label>Voting Method: {poll.creator}</Label>
            <Label>Start Date: {poll.startDate as string}</Label>
            <Label>End Date: {mockPoll.endDate as string}</Label>
            <Label>Requirements: {mockPoll.startDate as string}</Label>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default PollPage;
