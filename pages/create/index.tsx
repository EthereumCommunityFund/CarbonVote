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
import { Contract, ethers } from 'ethers';
import { convertToHoursAndMinutesToSeconds, convertToMinutes } from '@/utils';
import VotingContract from '../../carbonvote-contracts/artifacts/contracts/VoteContract.sol/VotingContract.json';
import { contract_addresses } from '../../carbonvote-contracts/artifacts/deployedAddresses.json';
import { toast } from '@/components/ui/use-toast';
import { OptionType } from '@/types';
import { useUserPassportContext } from '@/context/PassportContext';
import { PollRequestData, createPoll } from '@/controllers/poll.controller';
import axiosInstance from '@/src/axiosInstance';

const CreatePollPage = () => {
  const [pollContract, setPollContract] = useState<Contract | null>(null);
  const contractAbi = VotingContract.abi;
  const contractAddress = contract_addresses.VotingContract;
  useEffect(() => {
    if (window.ethereum) {
      const doConnect = async () => {
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, contractAbi, signer);
        setPollContract(contract);
      };
      doConnect();
    }
  }, []);
  const router = useRouter();
  const { signIn, isPassportConnected } = useUserPassportContext();
  const [credentials, setCredentials] = useState<string[]>([]);
  const [motionTitle, setMotionTitle] = useState<string>();
  const [motionDescription, setMotionDescription] = useState<string>('');
  const [timeLimit, setTimeLimit] = useState<string>();
  const [votingMethod, setVotingMethod] = useState<'ethholding' | 'headcount'>('ethholding');
  const [options, setOptions] = useState<OptionType[]>([
    { name: 'Yes', isChecked: false },
    { name: 'No', isChecked: false },
  ]);

  // const [options, setOptions] = useState<OptionType[]>([]);
  const handleOptionChange = (updatedOption: OptionType) => {
    const updatedOptions = options.map((option) => (option.name === updatedOption.name ? updatedOption : option));
    setOptions(updatedOptions);
  };

  const addOption = () => {
    setOptions([...options, { name: '', isChecked: false }]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, updatedOption: OptionType) => {
    const updatedOptions = options.map((option, i) => (i === index ? updatedOption : option));
    setOptions(updatedOptions);
  };

  const createNewPoll = async () => {
    if (!isPassportConnected) {
      signIn();
      return;
    }
    if (!motionTitle || !motionDescription || !timeLimit) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      return;
    }
    const durationInSeconds = convertToHoursAndMinutesToSeconds(timeLimit);
    console.log(durationInSeconds);
    if (durationInSeconds <= 0) {
      toast({
        title: 'Error',
        description: 'Invalid duration',
        variant: 'destructive',
      });
      return;
    }
    // const endTime = new Date();
    // endTime.setSeconds(endTime.getSeconds() + durationInSeconds);

    // Convert the end time to an ISO string
    // const timeLimitISO = endTime.toISOString();
    const pollType = 0;

    const checkedOptions = options.filter((option) => option.isChecked);
    if (checkedOptions.length < 2) {
      toast({
        title: 'Error',
        description: 'At least two options should be selected',
        variant: 'destructive',
      });
      return;
    }

    const optionNames = checkedOptions.map((option) => option.name);
    const pollMetadata = 'arbitrary data';
    console.log('Title:', motionTitle);
    console.log('Description:', motionDescription);
    console.log('Duration (seconds):', durationInSeconds);
    console.log('Option Names:', optionNames);
    console.log('Poll Metadata:', pollMetadata);

    if (votingMethod === 'headcount') {
      const pollData = {
        title: motionTitle,
        description: motionDescription,
        time_limit: durationInSeconds,
        voting_method: 'headCount',
        options: options.filter((option) => option.isChecked).map((option) => ({ option_description: option.name })),
        credentials: credentials,
      };

      try {
        console.log('Creating poll...', pollData);

        const response = await createPoll(pollData);

        console.log('Poll created successfully', response);
        toast({
          title: 'Poll created successfully',
        });
        setTimeout(() => {
          router.push('/');
        }, 5000);
      } catch (error) {
        console.error('Error creating poll:', error);
        toast({
          title: 'Error',
          description: 'Failed to create poll',
          variant: 'destructive',
        });
      }
    } else {
      try {
        if (pollContract) {
          const tx = await pollContract.createPoll(motionTitle, motionTitle, durationInSeconds, optionNames, pollType, pollMetadata);
          await tx.wait();
          toast({
            title: 'Poll created successfully',
          });
          console.log('Poll created successfully');
          setTimeout(() => {
            router.push('/');
          }, 5000);
        }
      } catch (error: any) {
        console.error('Error creating poll:', error);
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      }
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
  const handleCheckboxChange = (index: number, isChecked: boolean) => {
    const newOptions = options.map((option, i) => (i === index ? { ...option, isChecked } : option));
    setOptions(newOptions);
  };
  const handleInputChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
    const newOptions = options.map((option, i) => (i === index ? { ...option, name: event.target.value } : option));
    setOptions(newOptions);
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
              {/* <Label className="text-black/60 text-base">max: 3</Label> */}
            </div>
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <CheckerButton option={option} onOptionChange={(updatedOption) => handleCheckboxChange(index, updatedOption.isChecked)} onInputChange={(e) => handleInputChange(index, e)} />
                <button onClick={() => removeOption(index)}>❌</button>
              </div>
            ))}

            <div className="flex justify-end">
              <Button className="rounded-full" leftIcon={PlusIcon} onClick={addOption}>
                Add Option
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-2xl">Time Limit</Label>
            <Input value={timeLimit} onChange={handleTimeLimitChange} placeholder={'1hr 30m'}></Input>
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
                <option className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none" value="headcount">
                  HeadCount
                </option>
              </select>
            </div>
          </div>
          {votingMethod === 'ethholding' ? (
            <></>
          ) : (
            votingMethod === 'headcount' && (
              <div className="flex flex-col gap-2">
                <Label className="text-2xl">Access Rules</Label>
                <CredentialForm selectedCredentials={credentials} onCredentialsChange={(selectedUuids) => setCredentials(selectedUuids)} />
              </div>
            )
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
