'use client'
import { ArrowLeftIcon, PlusCirceIcon, PlusIcon, StopCircleIcon, ThumbDownIcon, ThumbUpIcon } from '@/components/icons';
import { XMarkIcon } from '@/components/icons/xmark';
import { CredentialForm } from '@/components/templates/CredentialForm';
import Button from '@/components/ui/buttons/Button';
import CheckerButton from '@/components/ui/buttons/CheckerButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import TextEditor from '@/components/ui/TextEditor';
import { useRouter } from 'next/router';
import { useWallet } from '@/context/WalletContext';
import { ChangeEvent, useState } from 'react';
import { useEffect } from 'react';
import { Contract, ethers } from 'ethers';
import { convertToHoursAndMinutesToSeconds, convertToMinutes } from '@/utils';
//import VotingContract from '../../carbonvote-contracts/artifacts/contracts/VoteContract.sol/VotingContract.json';
//import { contract_addresses } from '../../carbonvote-contracts/artifacts/deployedAddresses.json';
import VotingContract from '../../carbonvote-contracts/deployment/contracts/VoteContract.sol/VotingContract.json';
import { toast } from '@/components/ui/use-toast';
import { OptionType } from '@/types';
import { useUserPassportContext } from '@/context/PassportContext';
import { PollRequestData, createPoll } from '@/controllers/poll.controller';
import axiosInstance from '@/src/axiosInstance';

const CreatePollPage = () => {
  const [pollContract, setPollContract] = useState<Contract | null>(null);
  const contractAbi = VotingContract.abi;
  //const contractAddress = contract_addresses.VotingContract;
  const contractAddress = "0x5092F0161B330A7B2128Fa39a93b10ff32c0AE3e";
  const router = useRouter();
  const { signIn, isPassportConnected } = useUserPassportContext();
  const [credentials, setCredentials] = useState<string[]>([]);
  const [motionTitle, setMotionTitle] = useState<string>();
  const [motionDescription, setMotionDescription] = useState<string>('');
  const [timeLimit, setTimeLimit] = useState<string>();
  const [votingMethod, setVotingMethod] = useState<'ethholding' | 'headcount'>('ethholding');
  const [pollType, setpollType] = useState<0 | 1>(0);
  const { connectToMetamask, isConnected, account } = useWallet();
  const [options, setOptions] = useState<OptionType[]>([
    { name: 'Yes', isChecked: false },
    { name: 'No', isChecked: false },
  ]);
  const [isZuPassRequired, setIsZuPassRequired] = useState(false);

  useEffect(() => {
    const doConnect = async () => {
      /*let provider;
    console.log(process.env.PROVIDER as string, 'process env');
    if (process.env.PROVIDER == "mainnet") { provider = ethers.getDefaultProvider("mainnet"); }
    if (process.env.PROVIDER == "sepolia") { provider = ethers.getDefaultProvider("sepolia"); }
    if (process.env.PROVIDER == "testnet") { console.log('testnet'); provider = ethers.getDefaultProvider("http://localhost:8545/"); }*/
      //const signer = await provider.getSigner();
      const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/01371fc4052946bd832c20ca12496243');
      const contract = new ethers.Contract(contractAddress, contractAbi, provider);
      //const provider = new ethers.BrowserProvider(window.ethereum as any);
      //const signer = await provider.getSigner();
      //const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      setPollContract(contract);
    };
    doConnect();
  }, []);

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
  const credentialsMapping = {
    'Protocol Guild Member': '635a93d1-4d2c-47d9-82f4-9acd8ff68350',
    'ZuConnect Resident': '76118436-886f-4690-8a54-ab465d08fa0d',
    'DevConnect': '3cc4b682-9865-47b0-aed8-ef1095e1c398',
    'Gitcoin Passport': '6ea677c7-f6aa-4da5-88f5-0bcdc5c872c2',
    'POAPS Verification': '600d1865-1441-4e36-bb13-9345c94c4dfb',
  };

  const createNewPoll = async () => {
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


    const checkedOptions = options.filter((option) => option.isChecked);
    if (checkedOptions.length < 2) {
      toast({
        title: 'Error',
        description: 'At least two options should be selected',
        variant: 'destructive',
      });
      return;
    }
    let poll_type = 0;
    const optionNames = checkedOptions.map((option) => option.name);
    const pollMetadata = 'arbitrary data';
    console.log('Title:', motionTitle);
    console.log('Description:', motionDescription);
    console.log('Duration (seconds):', durationInSeconds);
    console.log('Option Names:', optionNames);
    console.log('Poll Metadata:', pollMetadata);
    console.log(`votingMethod: ${votingMethod}, credentials[0]: ${credentials[0]}`);
    if (votingMethod === 'headcount' && credentials[0] !== '635a93d1-4d2c-47d9-82f4-9acd8ff68350') {
      const pollData = {
        title: motionTitle,
        description: motionDescription,
        time_limit: durationInSeconds,
        votingMethod: 'headCount',
        options: options.filter((option) => option.isChecked).map((option) => ({ option_description: option.name })),
        credentials: credentials,
      };

      const isProtocolGuildMember = credentials.includes(credentialsMapping['Protocol Guild Member']);

      if (votingMethod === 'headcount' && isProtocolGuildMember) {
        poll_type = 1;
        //setpollType(1);
      } else {
        //setpollType(0);
        poll_type = 0;
      }
      console.log(pollType, 'polltype')
      console.log(poll_type, 'poll_type');
      try {
        console.log('Creating poll...', pollData);

        const response = await createPoll(pollData);


        console.log('Poll created successfully', response);
        toast({
          title: 'Poll created successfully',
        });
        setCredentials([]);
        router.push('/');
        /*setTimeout(() => {
          router.push('/');
        }, 1000);*/
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
          if (!isConnected) {
            connectToMetamask();
            return;
          }
          if (votingMethod != 'ethholding') {
            //setpollType(1); 
            poll_type = 1;
          }
          else {
            //setpollType(0);
            poll_type = 0;
          }
          console.log(votingMethod);
          console.log(poll_type, 'poll_type');
          const provider = new ethers.BrowserProvider(window.ethereum as any);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(contractAddress, contractAbi, signer);
          console.log(provider, signer, contract);
          const tx = await contract.createPoll(motionTitle, motionDescription, durationInSeconds, optionNames, poll_type, pollMetadata);
          await tx.wait();
          toast({
            title: 'Poll created successfully',
          });
          console.log('Poll created successfully');
          setCredentials([]);
          setTimeout(() => {
            router.push('/');
          }, 1000);
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
    if (votingMethod !== 'ethholding') { setpollType(1); } else { setpollType(0); }
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
    router.reload();
  };

  return (
    <div className="flex gap-20 px-20 py-5 text-black w-full justify-center overflow-y-auto">
      <div className="flex flex-col gap-2.5 py-5">
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
            <Input value={timeLimit} onChange={handleTimeLimitChange} placeholder={'4days 7hour 30m'}></Input>
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
                  HeadCounting
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
                <CredentialForm
                  selectedCredentials={credentials}
                  onCredentialsChange={(selectedUuids) => setCredentials(selectedUuids)}
                /*isZuPassRequired={isZuPassRequired}
                setIsZuPassRequired={setIsZuPassRequired}*/
                />
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
    </div>
  );
};
export default CreatePollPage;