import { ArrowLeftIcon, PlusCirceIcon, PlusIcon, StopCircleIcon, ThumbDownIcon, ThumbUpIcon } from '@/components/icons';
import { XMarkIcon } from '@/components/icons/xmark';
import { CredentialForm } from '@/components/templates/CredentialForm';
import Button from '@/components/ui/buttons/Button';
import CheckerButton from '@/components/ui/buttons/CheckerButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import TextEditor from '@/components/ui/TextEditor';
import { useRouter } from 'next/router';
import { ChangeEvent, useState } from 'react';
import { useEffect } from 'react';
import { ethers, Contract } from 'ethers';
import { convertToMinutes } from '@/utils';
import VotingContract from '../../carbonvote_contracts/artifacts/contracts/VoteContract.sol/VotingContract.json';

const CreatePollPage = () => {
  const [pollContract, setPollContract] = useState<Contract | null>(null);
  const contractAbi = VotingContract.abi;
  const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      setPollContract(contract);
    }
  }, []);
  const router = useRouter();
  const [motionTitle, setMotionTitle] = useState<string>();
  const [motionDescription, setMotionDescription] = useState<string>('');
  const [timeLimit, setTimeLimit] = useState<string>();
  const [votingMethod, setVotingMethod] = useState<'ethholding' | 'voting1' | 'voting2'>('ethholding');

  const createNewPoll = async () => {
    if (!motionTitle || !motionDescription || !timeLimit) {
      console.error('All fields are required');
      return;
    }
    const durationInSeconds = convertToMinutes(timeLimit) * 60;
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    const endTimeTimestamp = currentTimeInSeconds + durationInSeconds;
    if (durationInSeconds <= 0) {
      console.error('Invalid duration');
      return;
    }

    const formattedTitle = ethers.utils.formatBytes32String(motionTitle);
    const formattedDescription = ethers.utils.formatBytes32String(motionDescription);
    const pollType = 0;
    const optionNames = ['Yes', 'No'].map(ethers.utils.formatBytes32String);
    const pollMetadata = ethers.utils.formatBytes32String('arbitrary data');
    console.log('Formatted Title:', formattedTitle);
    console.log('Formatted Description:', formattedDescription);
    console.log('Duration (seconds):', endTimeTimestamp);
    console.log('Option Names:', optionNames);
    console.log('Poll Metadata:', pollMetadata);

    try {
      if (pollContract) {
        const tx = await pollContract.createPoll(formattedTitle, formattedDescription, endTimeTimestamp, optionNames, pollType, pollMetadata);
        await tx.wait();
        console.log('Poll created successfully');
      }
    } catch (error) {
      console.error('Error creating poll:', error);
    }
  };

  const handleTitleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMotionTitle(event.target.value);
  };
  const handleDescriptionChange = (value: string) => {
    setMotionDescription(value);
  };
  const handleTimeLimitChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTimeLimit(event.target.value);
  };
  const handleVotingSelect = (e: any) => {
    console.log(e.target.value, 'voting method: ');
    setVotingMethod(e.target.value);
  };

  const handleBack = () => {
    router.push('/');
  };

  return (
    <div className="flex gap-20 px-20 pt-5 text-black w-full justify-center h-[600px] overflow-y-auto">
      <div className="flex flex-col gap-2.5">
        <div>
          <Button className="rounded-full" leftIcon={ArrowLeftIcon} onClick={handleBack}>
            Back
          </Button>
        </div>
        <div className="bg-white flex flex-col gap-2.5 rounded-2xl p-5 ">
          <Label className="text-2xl">Create Poll</Label>
          <div className="flex flex-col gap-1">
            <Label className="text-black/60 text-lg">Motion Title: </Label>
            <Input value={motionTitle} onChange={handleTitleInputChange} placeholder={'Motion Title'} />
          </div>
          <div className="flex justify-end pb-5 border-b border-black/30"></div>
          <div className="flex flex-col gap-2.5">
            <Label className="text-black/60 text-lg font-bold">Motion Description: </Label>
            <TextEditor value={motionDescription} onChange={handleDescriptionChange} />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex gap-2 items-center">
              <Label className="text-2xl">Options</Label>
              <Label className="text-black/60 text-base">min: 2</Label>
              <Label className="text-black/60 text-base">max: 3</Label>
            </div>
            <CheckerButton />
            <CheckerButton />
            <div className="flex justify-end">
              <Button className="rounded-full" leftIcon={PlusIcon}>
                Add Option
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-2xl">Time Limit</Label>
            <Input value={timeLimit} onChange={handleTimeLimitChange} placeholder={'Time Input'}></Input>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-2xl">Voting Method</Label>
            <div className="flex flex-col gap-1">
              <Label className="text-base">Select a Method</Label>
              <select
                onChange={handleVotingSelect}
                value={votingMethod}
                className="flex w-full text-black outline-none rounded-lg py-2.5 pr-3 pl-2.5 bg-inputField gap-2.5 items-center border border-white/10 border-opacity-10"
                title="Voting Method"
              >
                <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="ethholding">
                  EthHolding
                </option>
                <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="voting1">
                  Voting 1
                </option>
                <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="voting2">
                  Voting 2
                </option>
              </select>
            </div>
          </div>
          {votingMethod === 'ethholding' ? (
            <></>
          ) : (
            <div className="flex flex-col gap-2">
              <Label className="text-2xl">Access Rules</Label>
              <CredentialForm />
            </div>
          )}
        </div>
        <div className="flex gap-2.5 justify-end">
          <Button className="rounded-full" leftIcon={XMarkIcon}>
            Discard
          </Button>
          <Button className="rounded-full" leftIcon={PlusCirceIcon} onClick={createNewPoll}>
            Create Poll
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-10 w-96">
        <div className="flex flex-col bg-white rounded-xl gap-5">
          <div className="px-2.5 py-5 border-b border-b-black/40 pb-5">
            <Label className="text-2xl">Details</Label>
          </div>
          <div className="flex flex-col gap-2.5 pl-5 pb-5"></div>
        </div>
      </div>
    </div>
  );
};
export default CreatePollPage;
