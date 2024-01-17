import { Contract, ethers } from 'ethers';
import { ArrowLeftIcon, StopCircleIcon, ThumbDownIcon, ThumbUpIcon } from '@/components/icons';
import { ClockIcon } from '@/components/icons/clock';
import Button from '@/components/ui/buttons/Button';
import CheckerButton from '@/components/ui/buttons/CheckerButton';
import CountdownTimer from '@/components/ui/CountDownTimer';
import HtmlString from '@/components/ui/Html';
import { Label } from '@/components/ui/Label';
import { useWallet } from '@/context/WalletContext';
import { OptionType, PollType } from '@/types';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
//import { contract_addresses } from '../../carbonvote-contracts/artifacts/deployedAddresses.json';
//import VotingContract from '../../carbonvote-contracts/artifacts/contracts/VoteContract.sol/VotingContract.json';
//import VotingOption from '../../carbonvote-contracts/artifacts/contracts/VotingOption.sol/VotingOption.json';
import VotingContract from '../../carbonvote-contracts/deployment/contracts/VoteContract.sol/VotingContract.json';
import VotingOption from '../../carbonvote-contracts/deployment/contracts/VotingOption.sol/VotingOption.json';
import OptionButton from '@/components/ui/buttons/OptionButton';
import { toast } from '@/components/ui/use-toast';
import { fetchPollById } from '@/controllers/poll.controller';
import { calculateTimeRemaining } from '@/utils/index';
import { Loader } from '@/components/ui/Loader';
import { useUserPassportContext } from '@/context/PassportContext';
interface Poll {
  id: string;
  name: string;
  startDate: string | Date;
  endTime: string | bigint | number;
  startTime: string | bigint | number;
  creator: string;
  topic: string;
  subTopic: string;
  description: string;
  options: string[];
  pollMetadata: string;
  poll_type: number | bigint | string;
}

interface Option {
  optionName: string;
  votersCount: number;
  totalEth?: string;
  votersData?: any;
  address?: string;
}

const PollPage = () => {
  const router = useRouter();
  const { id, source } = router.query;

  const handleBack = () => {
    router.push('/');
  };
  const [poll, setPoll] = useState<Poll>();
  const contractAbi = VotingContract.abi;
  //const contractAddress = contract_addresses.VotingContract;
  const contractAddress = "0x5092F0161B330A7B2128Fa39a93b10ff32c0AE3e";
  //const [optionNames, setOptionNames] = useState<string[]>([]);
  const [options, setOptions] = useState<Option[]>([]);
  const [remainingTime, settimeRemaining] = useState('');
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [pollType, setPollType] = useState<string | number | bigint>();
  const { connectToMetamask, isConnected, account } = useWallet();
  const { signIn, isPassportConnected } = useUserPassportContext();
  useEffect(() => {
    fetchPollFromContract();
  }, [id, source]);

  const fetchPollFromContract = async () => {
    if (id) {
      //let provider = new ethers.BrowserProvider(window.ethereum as any);
      //let signer = await provider.getSigner();
      //const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/01371fc4052946bd832c20ca12496243');
      const contract = new ethers.Contract(contractAddress, contractAbi, provider);
      try {
        const pollData = await contract.getPoll(id);
        // console.log(contract);
        console.log(pollData, 'pollData');

        setPoll(pollData);
        setPollType(pollData.pollType);
        //pollType = pollData.pollType;
        if (pollType) { console.log(pollType.toString(), 'poll_type123'); } else { console.log('no poll type'); }
        let startdate = new Date(Number(pollData.startTime) * 1000);
        console.log(startdate, 'start time', pollData.endTime, 'end time');
        const timeleft = calculateTimeRemaining(Number(pollData.endTime) * 1000);
        if (!timeleft) { }
        else {
          settimeRemaining(timeleft);
          console.log(timeleft, 'time left');
        }
      } catch (error) {
        console.error('Error fetching poll:', error);
      }
    }
  };

  const optionContractAbi = VotingOption.abi;
  // const optionNames: any[] = [];

  const fetchVotingOptions = async () => {
    if (id && poll && poll.options) {
      //let provider = new ethers.BrowserProvider(window.ethereum as any);
      //let signer = await provider.getSigner();
      //const optionNames: any[] = [];
      const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/01371fc4052946bd832c20ca12496243');
      const newOptions: Option[] = [];
      console.log(poll.options, 'poll.options');
      for (const address of poll.options) {
        const contract = new ethers.Contract(address, optionContractAbi, provider);
        // console.log(contract, 'contract');

        try {
          const optionName = await contract.name();
          //optionNames.push(optionName);
          newOptions.push({
            optionName: optionName,
            address: address,
            votersCount: 0,
            totalEth: '0',
            votersData: []
          });
        } catch (error) {
          console.error('Error fetching options:', error);
        }
      }
      setOptions(newOptions);
      // console.log(optionNames, 'optionNames');
    }
  };

  useEffect(() => {
    fetchVotingOptions();
  }, [id, poll]);

  const [optionsData, setOptionsData] = useState<Option[]>([]);

  useEffect(() => {
    const optionContractAbi = VotingOption.abi;
    const getOptionVoteCounts = async () => {
      if (id && poll && poll.options) {
        const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/01371fc4052946bd832c20ca12496243');
        let aggregatedData = [];

        for (const address of poll.options) {
          const contract = new ethers.Contract(address, optionContractAbi, provider);
          const votersCount = await contract.getVotersCount();

          let totalBalance = BigInt(0);
          let votersData = [];

          for (let i = 0; i < votersCount; i++) {
            const voterAddress = await contract.voters(i);
            const balance = await provider.getBalance(voterAddress);
            totalBalance += BigInt(balance.toString());
            console.log(voterAddress, 'voteraddress');
            console.log(totalBalance, 'balance');
            votersData.push({
              address: voterAddress,
              balance: ethers.formatEther(balance),
            });
          }

          const optionName = await contract.name();
          aggregatedData.push({
            optionName,
            votersCount,
            totalEth: ethers.formatEther(totalBalance),
            votersData,
          });
        }
        console.log(aggregatedData, 'aggregatedData');
        setOptionsData(aggregatedData);
      }
    };

    getOptionVoteCounts();
  }, [id, poll]);

  function canOpenPopup() {
    let windowReference = window.open('', '_blank');
    if (!windowReference || windowReference.closed || typeof windowReference.closed == 'undefined') {
      // Pop-up was blocked
      return false;
    }
    windowReference.close();
    return true;
  }
  const handleVote = async (optionIndex: number) => {
    if (!isConnected) {
      console.error('You need to connect to Metamask to vote, please try again');
      toast({
        title: 'Error',
        description: 'You need to connect to Metamask to vote, please try again',
        variant: 'destructive',
      });
      connectToMetamask();
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
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      const pollIndex = Number(id);
      const newOptionIndex = Number(optionIndex);
      // console.log(pollIndex, 'pollIndex');
      // console.log(newOptionIndex, 'newOptionIndex');
      // console.log(signature, 'signature');
      // console.log(message, 'message');
      const network = await provider.getNetwork();
      if (!canOpenPopup()) {
        toast({
          title: 'Error',
          description: 'Please enable pop-ups in your browser settings to proceed with the transaction.',
          variant: 'destructive',
        });
        return;
      }
      if (Number(network.chainId) === 11155111) {
        console.log('Connected to Sepolia');
        const transactionResponse = await contract.vote(pollIndex, newOptionIndex, signature, message);
        await transactionResponse.wait(); // Wait for the transaction to be mined
        console.log('Vote cast successfully');
        toast({
          title: 'Vote cast successfully',
        });
        await fetchPollFromContract();
        await fetchVotingOptions();
      } else {
        console.error('You should connect to Sepolia, please try again');
        toast({
          title: 'Error',
          description: 'You should connect to Sepolia, please try again',
          variant: 'destructive',
        });
      }
    }
    catch (error: any) {
      console.error('Error casting vote:', error);
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  if (!poll) {
    return <Loader />; // Add loading state handling
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
            <div className={`${remainingTime !== null && remainingTime !== 'Time is up!' ? 'bg-[#F84A4A20]' : 'bg-[#F8F8F8]'
              } px-2.5 rounded-lg items-center`}>
              {remainingTime !== null && remainingTime !== 'Time is up!' ? (
                <Label className="text-[#F84A4A]">Live</Label>
              ) : (
                <Label className="text-[#656565]">Closed</Label>
              )}
              {remainingTime !== null && remainingTime !== 'Time is up!' ? (
                <div className="flex gap-2">
                  <ClockIcon />
                  <CountdownTimer endTime={Number(poll.endTime) * 1000} />
                </div>
              ) : null}
            </div>
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
          {
            pollType?.toString() === "1"
              ? <Label className="text-sm">You can not vote if your address is not on this list: <a href="https://app.splits.org/accounts/0x84af3D5824F0390b9510440B6ABB5CC02BB68ea1" style={{ color: 'blue' }}>link</a></Label>
              : <Label className="text-sm">(You can also make a zero-value transaction from your wallet (in Sepolia) to given options addresses to vote)</Label>
          }
          <div className="flex flex-col gap-2.5">
            {options.map((option, index) => (
              <div key={index} className="option-item">
                <OptionButton
                  index={index}
                  optionName={option.optionName}
                  onVote={() => handleVote(index)}
                  isChecked={selectedOption === option.optionName}
                  type="contract"
                />
                {pollType?.toString() !== '1' && (
                  <div className="option-address">Address: {option.address}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-10 w-96">
        <div className="px-2.5 py-5 pb-2 rounded-2xl bg-white">
          <Label className="text-2xl">Details</Label>
          <hr></hr>
          <div className='flex flex-col gap-4 pt-3 text-base'>
            <Label>
              {(() => {
                return `Voting Method: ${pollType?.toString() === '1' ? 'HeadCounting' : 'EthHolding'}`;
              })()}
            </Label>
            <Label>
              {(() => {
                return `Start Date: ${new Date(Number(poll.startTime) * 1000)}`;
              })()}
            </Label>
            <Label>
              {(() => {
                return `End Date: ${new Date(Number(poll.endTime) * 1000)}`;
              })()}
            </Label>
            <Label>
              {(() => {
                return `Requirement: ${pollType?.toString() === '1' ? 'Protocol Guild Member' : 'No requirement'}`;
              })()}
            </Label>
          </div>
        </div>
        {optionsData &&
          optionsData.map((option, index) => (
            <div key={index} className="flex flex-col bg-white rounded-xl gap-5">
              <div className="px-2.5 py-5 border-b border-b-black/40 pb-5">
                <Label className="text-2xl">{option.optionName}</Label>
              </div>
              <div className="flex flex-col gap-2.5 pl-5 pb-5">
                <Label>No of voters: {option.votersCount.toString()}</Label>
                {pollType?.toString() !== '1' && (
                  <Label>Total Eth of Voters: {option.totalEth} ETH</Label>
                )}

                {/* You can also iterate over votersData if needed */}
                {/* {option.votersData.map((voter, voterIndex) => (
              <div key={voterIndex}>
                <Label>Voter Address: {voter.address}</Label>
                <Label>Voter Balance: {voter.balance}</Label>
              </div>
            ))} */}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default PollPage;