import { ArrowLeftIcon, PlusCirceIcon, PlusIcon } from '@/components/icons';
import { XMarkIcon } from '@/components/icons/xmark';
import { CredentialForm } from '@/components/templates/CredentialForm';
import Button from '@/components/ui/buttons/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import TextEditor from '@/components/ui/TextEditor';
import { useRouter } from 'next/router';
import { ChangeEvent, useState } from 'react';
import { useEffect } from 'react';
import { Contract, ethers } from 'ethers';
import { convertToHoursAndMinutesToSeconds } from '@/utils';
import VotingContract from '../../carbonvote-contracts/artifacts/contracts/VoteContract.sol/VotingContract.json';
import { toast } from '@/components/ui/use-toast';
import { OptionType } from '@/types';
import { useUserPassportContext } from '@/context/PassportContext';
import { createPoll } from '@/controllers/poll.controller';
import { useFormStore } from "@/zustand/create";

import VotingMethodSelect from '@/components/VotingMethodSelect';
import OptionItem from '@/components/OptionItem';

const CreatePollPage = () => {
  const [pollContract, setPollContract] = useState<Contract | null>(null);
  const contractAbi = VotingContract.abi;
  //const contractAddress = contract_addresses.VotingContract;
  const contractAddress = "0x12B4b94e5d5D0a2433851f9B423CC0B5a4C71DEa";

  const router = useRouter();
  const { signIn, isPassportConnected } = useUserPassportContext();
  const [credentials, setCredentials] = useState<string[]>([]);
  const [motionTitle, setMotionTitle] = useState<string>();
  const [motionDescription, setMotionDescription] = useState<string>("");
  const [timeLimit, setTimeLimit] = useState<string>();
  const [votingMethod, setVotingMethod] = useState<'ethholding' | 'headcount'>('ethholding');
  const [options, setOptions] = useState<OptionType[]>([
    { name: 'Yes', isChecked: false },
    { name: 'No', isChecked: false },
  ]);
  const [isZuPassRequired, setIsZuPassRequired] = useState(false);

  // Zustand
  const selectedPOAPEvents = useFormStore((state) => state.selectedEvents)
  const removeAllPoapEvents = useFormStore((state) => state.removeAll)

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

  // const [options, setOptions] = useState<OptionType[]>([]);
  const handleOptionChange = (updatedOption: OptionType) => {
    const updatedOptions = options.map((option) =>
      option.name === updatedOption.name ? updatedOption : option
    );
    setOptions(updatedOptions);
  };

  const addOption = () => {
    setOptions([...options, { name: "", isChecked: false }]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, updatedOption: OptionType) => {
    const updatedOptions = options.map((option, i) =>
      i === index ? updatedOption : option
    );
    setOptions(updatedOptions);
  };
  const credentialsMapping = {
    'ZuConnect Resident': '76118436-886f-4690-8a54-ab465d08fa0d',
    // ... add other credential mappings
  };

  useEffect(() => {
    if (votingMethod === 'headcount') {
      setIsZuPassRequired(true);
    } else {
      setIsZuPassRequired(false);
    }
  }, [votingMethod]);

  const cleanFormState = () => {
    removeAllPoapEvents();
  }

  const createNewPoll = async () => {
    if (!isPassportConnected) {
      signIn();
      return;
    }
    if (!motionTitle || !motionDescription || !timeLimit) {
      toast({
        title: "Error",
        description: "All fields are required",
        variant: "destructive",
      });
      return;
    }
    const durationInSeconds = convertToHoursAndMinutesToSeconds(timeLimit);
    console.log(durationInSeconds);
    if (durationInSeconds <= 0) {
      toast({
        title: "Error",
        description: "Invalid duration",
        variant: "destructive",
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
        title: "Error",
        description: "At least two options should be selected",
        variant: "destructive",
      });
      return;
    }

    const optionNames = checkedOptions.map((option) => option.name);
    const pollMetadata = "arbitrary data";
    console.log("Title:", motionTitle);
    console.log("Description:", motionDescription);
    console.log("Duration (seconds):", durationInSeconds);
    console.log("Option Names:", optionNames);
    console.log("Poll Metadata:", pollMetadata);

    if (votingMethod === "headcount") {
      const pollData = {
        title: motionTitle,
        description: motionDescription,
        time_limit: durationInSeconds,
        votingMethod: 'headCount',
        options: options.filter((option) => option.isChecked).map((option) => ({ option_description: option.name })),
        credentials: credentials,
        poap_events: selectedPOAPEvents.map(event => event.id)
      };

      try {
        console.log('Creating poll...', pollData);

        const response = await createPoll(pollData);

        console.log("Poll created successfully", response);
        toast({
          title: "Poll created successfully",
        });
        setTimeout(() => {
          router.push("/");
        }, 5000);
      } catch (error) {
        console.error("Error creating poll:", error);
        toast({
          title: "Error",
          description: "Failed to create poll",
          variant: "destructive",
        });
      }
    } else {
      try {
        if (pollContract) {
          const tx = await pollContract.createPoll(
            motionTitle,
            motionTitle,
            durationInSeconds,
            optionNames,
            pollType,
            pollMetadata
          );
          await tx.wait();
          toast({
            title: "Poll created successfully",
          });
          console.log("Poll created successfully");
          setTimeout(() => {
            router.push("/");
          }, 5000);
        }
      } catch (error: any) {
        console.error("Error creating poll:", error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
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
    console.log(e.target.value, "voting method: ");
    setVotingMethod(e.target.value);
  };
  const handleCheckboxChange = (index: number, isChecked: boolean) => {
    const newOptions = options.map((option, i) =>
      i === index ? { ...option, isChecked } : option
    );
    setOptions(newOptions);
  };
  const handleInputChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newOptions = options.map((option, i) =>
      i === index ? { ...option, name: event.target.value } : option
    );
    setOptions(newOptions);
  };

  const handleBack = () => {
    router.push("/");
  };

  return (
    <div>
      <div className="flex gap-20 px-20 py-5 text-black w-full justify-center overflow-y-auto">
        <div className="flex flex-col gap-2.5 py-5">
          <div>
            <Button
              className="rounded-full"
              leftIcon={ArrowLeftIcon}
              onClick={handleBack}
            >
              Back
            </Button>
          </div>
          <div className="flex flex-col gap-2.5">
            <Label className="text-black/60 text-lg font-bold">
              Title:{" "}
            </Label>
            <Input placeholder="Write a title"
              value={motionTitle}
              onChange={handleTitleInputChange}
            ></Input>
          </div>

          <div className="flex flex-col gap-2.5">
            <Label className="text-black/60 text-lg font-bold">
              Motion Description:{" "}
            </Label>
            <TextEditor
              value={motionDescription}
              onChange={handleDescriptionChange}
            />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex gap-2 items-center">
              <Label className="text-2xl">Options</Label>
              <Label className="text-black/60 text-base">min: 2</Label>
              {/* <Label className="text-black/60 text-base">max: 3</Label> */}
            </div>

            {options.map((option, index) => (
              <OptionItem
                key={index}
                option={option}
                index={index}
                onCheckboxChange={handleCheckboxChange}
                onInputChange={handleInputChange}
                onRemove={removeOption}
              />
            ))}

            <div className="flex justify-end">
              <Button
                className="rounded-full"
                leftIcon={PlusIcon}
                onClick={addOption}
              >
                Add Option
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label className="text-2xl">Time Limit</Label>
            <Input
              value={timeLimit}
              onChange={handleTimeLimitChange}
              placeholder={"1hr 30m"}
            ></Input>
          </div>

          <VotingMethodSelect votingMethod={votingMethod} onChange={handleVotingSelect} />


          {votingMethod === 'ethholding' ? (
            <></>
          ) : (
            votingMethod === 'headcount' && (
              <div className="flex flex-col gap-2">
                <Label className="text-2xl">Access Rules</Label>
                <CredentialForm
                  selectedCredentials={credentials}
                  onCredentialsChange={(selectedUuids) => setCredentials(selectedUuids)} />
              </div>
            )
          )}

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
          </div>
        </div>
      </div>
    </div>
  )

};

export default CreatePollPage;
