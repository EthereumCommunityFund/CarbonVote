'use client'
import { FiArrowLeft, FiPlusCircle, FiXCircle, FiPlus, FiTrash2 } from "react-icons/fi";
import { CredentialForm } from '@/components/templates/CredentialForm';
import Button from '@/components/ui/buttons/Button';
import CheckerButton from '@/components/ui/buttons/CheckerButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import TextEditor from '@/components/ui/TextEditor';
import { useRouter } from 'next/router';
import { useAccount, useConnect } from 'wagmi'
import React, { ChangeEvent, useState } from 'react';
import { useEffect } from 'react';
import { Contract, ethers } from 'ethers';
import { convertToHoursAndMinutesToSeconds } from '@/utils';
import VotingContract from '../../carbonvote-contracts/deployment/contracts/VoteContract.sol/VotingContract.json';
import { toast } from '@/components/ui/use-toast';
import { OptionType } from '@/types';
import { createPoll } from '@/controllers/poll.controller';
import { useFormStore } from "@/zustand/create";
import { CREDENTIALS, CONTRACT_ADDRESS } from '@/src/constants'
import { DateTimePicker, LocalizationProvider, TimezoneProps } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { GetServerSideProps, GetStaticProps, InferGetServerSidePropsType, InferGetStaticPropsType } from "next";
import moment from "moment-timezone";

// type TimeZoneType = {
//   timeZone: string;
//   timeZoneOffset: string;
// }

// const CreatePollPage = ({ myTimeZone }: InferGetStaticPropsType<typeof getStaticProps>) => {
const CreatePollPage = () => {
  const [pollContract, setPollContract] = useState<Contract | null>(null);
  const contractAbi = VotingContract.abi;
  const router = useRouter();
  const [credentials, setCredentials] = useState<string[]>([]);
  const [motionTitle, setMotionTitle] = useState<string>();
  const [motionDescription, setMotionDescription] = useState<string>('');
  const [timeLimit, setTimeLimit] = useState<string>();
  const [votingMethod, setVotingMethod] = useState<'ethholding' | 'headcount'>('ethholding');
  const [pollType, setpollType] = useState<0 | 1>(0);
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  const timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeZoneAbbr = moment().tz(timeZone).format('zz');

  const [options, setOptions] = useState<OptionType[]>([
    { name: '', isChecked: true },
    { name: '', isChecked: true },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Zustand
  const selectedPOAPEvents = useFormStore((state) => state.selectedEvents)
  const resetFormStore = useFormStore((state) => state.reset)
  const endDateTime = useState<Dayjs>();

  useEffect(() => {
    const doConnect = async () => {
      const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/01371fc4052946bd832c20ca12496243');
      const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, provider);
      setPollContract(contract);
    };
    doConnect();
    resetFormStore();
  }, []);

  const addOption = () => {
    setOptions([...options, { name: '', isChecked: true }]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const createNewPoll = async () => {
    setIsLoading(true)
    if (!motionTitle || !motionDescription || !timeLimit) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      setIsLoading(false)
      return;
    }
    let durationInSeconds: number;
    try {
      durationInSeconds = convertToHoursAndMinutesToSeconds(timeLimit);
      if (durationInSeconds <= 0) {
        toast({
          title: 'Error',
          description: 'Invalid duration',
          variant: 'destructive',
        });
        setIsLoading(false)
        return;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid duration',
        variant: 'destructive',
      });
      setIsLoading(false)
      return;
    }

    const checkedOptions = options.filter((option) => option.isChecked);
    if (checkedOptions.length < 2) {
      toast({
        title: 'Error',
        description: 'At least two options should be selected',
        variant: 'destructive',
      });
      setIsLoading(false)
      return;
    }

    if (typeof endDateTime === null) {
      toast({
        title: 'Error',
        description: 'End Date/Time is not selected',
        variant: 'destructive',
      });
      setIsLoading(false)
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
        poap_events: selectedPOAPEvents.map(event => event.id),
        endDateTime: endDateTime
      };

      const isProtocolGuildMember = credentials.includes(CREDENTIALS.ProtocolGuildMember.id);

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
        resetFormStore();
        router.push('/').then(() => window.location.reload());
      } catch (error) {
        console.error('Error creating poll:', error);
        setIsLoading(false);
        resetFormStore();
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
            console.error('You need to connect to Metamask to create, please try again');
            toast({
              title: 'Error',
              description: 'You need to connect to Metamask to create, please try again',
              variant: 'destructive',
            });
            setIsLoading(false)
            connect();
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
          const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi, signer);
          console.log(provider, signer, contract);
          const network = await provider.getNetwork();

          if (Number(network.chainId) === 11155111) {
            console.log('Connected to Sepolia');

            const tx = await contract.createPoll(motionTitle, motionDescription, durationInSeconds, optionNames, poll_type, pollMetadata);
            await tx.wait();
            toast({
              title: 'Poll created successfully, please wait',
            });
            console.log('Poll created successfully');
            setCredentials([]);
            resetFormStore();
            router.push('/').then(() => window.location.reload());
          }
          else {
            console.error('You should connect to Sepolia, please try again');
            toast({
              title: 'Error',
              description: 'You should connect to Sepolia, please try again',
              variant: 'destructive',
            });
            setIsLoading(false)
          }
        }
      } catch (error: any) {
        console.error('Error creating poll:', error);
        setIsLoading(false);
        resetFormStore();
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
    resetFormStore();
    router.push('/');
  };

  return (
    <div className="flex gap-20 px-20 py-5 text-black w-full justify-center overflow-y-auto">
      <div className="flex flex-col gap-2.5 py-5">
        <div>
          <Button className="rounded-full" leftIcon={FiArrowLeft} onClick={handleBack}>
            Back
          </Button>
        </div>
        <div className="bg-white flex flex-col gap-2.5 rounded-2xl p-5 ">
          <Label className="text-2xl text-black/40">Create Poll</Label>
          <div className="flex flex-col gap-1">
            <Label className="text-black text-lg">Motion Title: </Label>
            <Input value={motionTitle} onChange={handleTitleInputChange} placeholder={'Motion Title'} />
          </div>
          <div className="flex justify-end pb-5 border-b border-black/30"></div>
          <div className="flex flex-col gap-2.5">
            <Label className="text-black text-lg font-bold">Motion Description: </Label>
            <TextEditor value={motionDescription} onChange={handleDescriptionChange} />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex gap-2 items-center">
              <Label className="text-2xl">Options</Label>
              <Label className="text-black/60 text-sm">min 2</Label>
              {/* <Label className="text-black/60 text-base">max: 3</Label> */}
            </div>
            {options.map((option, index) => (
              <div key={index} className="flex w-full space-x-2">
                <CheckerButton option={option} idx={index} onInputChange={(e) => handleInputChange(index, e)} />
                {index > 1 &&
                  <button className="text-red-400" onClick={() => removeOption(index)}><FiTrash2 /></button>
                }
              </div>
            ))}

            <div className="flex justify-end">
              <Button className="rounded-full" leftIcon={FiPlus} onClick={addOption}>
                Add Option
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label className="text-2xl">End Date/Time</Label>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker value={endDateTime} />
            </LocalizationProvider>
          </div>
          {/* <Label>{`Your TimeZone: ${myTimeZone.timeZone} ${myTimeZone.timeZoneOffset}`} </Label> */}
          <Label>{`Your TimeZone: ${timeZone} ${timeZoneAbbr}`} </Label>
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
                />
              </div>
            )
          )}
        </div>
        <div className="flex gap-2.5 justify-end">
          <Button className="rounded-full" leftIcon={FiXCircle}>
            Discard
          </Button>
          <Button className="rounded-full" leftIcon={FiPlusCircle} isLoading={isLoading} onClick={createNewPoll}>
            Create Poll
          </Button>
        </div>
      </div>
    </div >
  );
};
export default CreatePollPage;

// export const getServerSideProps: GetServerSideProps = (async () => {
//   const timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;

//   const timeZoneAbbr = moment().tz(timeZone).format('zz');
//   const myTimeZone: TimeZoneType = {
//     timeZone: timeZone,
//     timeZoneOffset: timeZoneAbbr,
//   }
//   return {
//     props: {
//       myTimeZone
//     }
//   }
// });

// export const getStaticProps: GetStaticProps = async () => {
//   const timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;

//   const timeZoneAbbr = moment().tz(timeZone).format('zz');
//   const myTimeZone: TimeZoneType = {
//     timeZone: timeZone,
//     timeZoneOffset: timeZoneAbbr,
//   }
//   return {
//     props: {
//       myTimeZone
//     }
//   }
// };