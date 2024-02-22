'use client';
import {
  FiArrowLeft,
  FiPlusCircle,
  FiX,
  FiPlus,
  FiTrash2,
  FiChevronDown,
  FiArrowDown,
} from 'react-icons/fi';
import { CredentialForm } from '@/components/templates/CredentialForm';
import Button from '@/components/ui/buttons/Button';
import CheckerButton from '@/components/ui/buttons/CheckerButton';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import TextEditor from '@/components/ui/TextEditor';
import { useRouter } from 'next/router';
import { useAccount, useConnect } from 'wagmi';
import React, { ChangeEvent, useState } from 'react';
import { useEffect } from 'react';
import { Contract, ethers } from 'ethers';
import { convertToHoursAndMinutesToSeconds } from '@/utils';
import VotingContract from '../../carbonvote-contracts/deployment/contracts/VoteContract.sol/VotingContract.json';
import { toast } from '@/components/ui/use-toast';
import { OptionType } from '@/types';
import { createPoll } from '@/controllers/poll.controller';
import { useFormStore } from '@/zustand/create';
import { CREDENTIALS, CONTRACT_ADDRESS } from '@/src/constants';
import {
  DateTimePicker,
  LocalizationProvider,
  TimezoneProps,
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import {
  GetServerSideProps,
  GetStaticProps,
  InferGetServerSidePropsType,
  InferGetStaticPropsType,
} from 'next';
import moment from 'moment-timezone';
import styles from '@/styles/createPoll.module.css';

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
  const [votingMethod, setVotingMethod] = useState<'ethholding' | 'headcount'>(
    'ethholding'
  );
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
  const selectedPOAPEvents = useFormStore((state) => state.selectedEvents);
  const resetFormStore = useFormStore((state) => state.reset);
  const endDateTime = useState<Dayjs>();

  const [toggleStates, setToggleStates] = useState([
    false,
    false,
    false,
    false,
    false,
  ]); // Individual toggle states
  const [showNestedInfoDiv, setShowNestedInfoDiv] = useState(false);

  // Function to toggle all buttons
  const toggleAll = () => {
    setToggleStates((prevToggleStates) => {
      const allTrue = prevToggleStates.every((state) => state);
      const newState = prevToggleStates.map(() => !allTrue);
      const numChecked = newState.filter((state) => state).length;
      setShowNestedInfoDiv(numChecked > 1);
      return newState;
    });
  };

  // Function to handle individual toggle button clicks
  const handleToggle = (index: number) => {
    setToggleStates((prevToggleStates) => {
      const newState = prevToggleStates.map((state, i) =>
        i === index ? !state : state
      );
      const numChecked = newState.filter((state) => state).length;
      setShowNestedInfoDiv(numChecked > 1);
      return newState;
    });
  };

  useEffect(() => {
    const doConnect = async () => {
      const provider = new ethers.JsonRpcProvider(
        'https://sepolia.infura.io/v3/01371fc4052946bd832c20ca12496243'
      );
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        contractAbi,
        provider
      );
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
    setIsLoading(true);
    if (!motionTitle || !motionDescription || !timeLimit) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      setIsLoading(false);
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
        setIsLoading(false);
        return;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid duration',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    const checkedOptions = options.filter((option) => option.isChecked);
    if (checkedOptions.length < 2) {
      toast({
        title: 'Error',
        description: 'At least two options should be selected',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (typeof endDateTime === null) {
      toast({
        title: 'Error',
        description: 'End Date/Time is not selected',
        variant: 'destructive',
      });
      setIsLoading(false);
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
    console.log(
      `votingMethod: ${votingMethod}, credentials[0]: ${credentials[0]}`
    );
    if (
      votingMethod === 'headcount' &&
      credentials[0] !== '635a93d1-4d2c-47d9-82f4-9acd8ff68350'
    ) {
      const pollData = {
        title: motionTitle,
        description: motionDescription,
        time_limit: durationInSeconds,
        votingMethod: 'headCount',
        options: options
          .filter((option) => option.isChecked)
          .map((option) => ({ option_description: option.name })),
        credentials: credentials,
        poap_events: selectedPOAPEvents.map((event) => event.id),
        endDateTime: endDateTime,
      };

      const isProtocolGuildMember = credentials.includes(
        CREDENTIALS.ProtocolGuildMember.id
      );

      if (votingMethod === 'headcount' && isProtocolGuildMember) {
        poll_type = 1;
        //setpollType(1);
      } else {
        //setpollType(0);
        poll_type = 0;
      }
      console.log(pollType, 'polltype');
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
            console.error(
              'You need to connect to Metamask to create, please try again'
            );
            toast({
              title: 'Error',
              description:
                'You need to connect to Metamask to create, please try again',
              variant: 'destructive',
            });
            setIsLoading(false);
            connect();
            return;
          }
          if (votingMethod != 'ethholding') {
            //setpollType(1);
            poll_type = 1;
          } else {
            //setpollType(0);
            poll_type = 0;
          }
          console.log(votingMethod);
          console.log(poll_type, 'poll_type');
          const provider = new ethers.BrowserProvider(window.ethereum as any);
          const signer = await provider.getSigner();
          const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            contractAbi,
            signer
          );
          console.log(provider, signer, contract);
          const network = await provider.getNetwork();

          if (Number(network.chainId) === 11155111) {
            console.log('Connected to Sepolia');

            const tx = await contract.createPoll(
              motionTitle,
              motionDescription,
              durationInSeconds,
              optionNames,
              poll_type,
              pollMetadata
            );
            await tx.wait();
            toast({
              title: 'Poll created successfully, please wait',
            });
            console.log('Poll created successfully');
            setCredentials([]);
            resetFormStore();
            router.push('/').then(() => window.location.reload());
          } else {
            console.error('You should connect to Sepolia, please try again');
            toast({
              title: 'Error',
              description: 'You should connect to Sepolia, please try again',
              variant: 'destructive',
            });
            setIsLoading(false);
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
    if (votingMethod !== 'ethholding') {
      setpollType(1);
    } else {
      setpollType(0);
    }
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
    resetFormStore();
    router.push('/');
  };

  return (
    <div className="flex gap-20 px-20 py-5 text-black w-full justify-center overflow-y-auto">
      <div className="flex flex-col gap-5 py-5">
        <div>
          <Button
            className="rounded-full"
            leftIcon={FiArrowLeft}
            onClick={handleBack}
          >
            Back
          </Button>
        </div>
        <div className={styles.create_container}>
          <div className={styles.create_poll_header_container}>
            <Label className={styles.create_poll_header}>Create Poll</Label>
          </div>
          <div className={styles.form_rows}>
            {/*  */}
            <div className={styles.input_wrap_flex}>
              <Label className={styles.input_header}>Motion Title </Label>
              <Input
                value={motionTitle}
                onChange={handleTitleInputChange}
                placeholder={'Motion Title'}
                className={styles.select_dropdown}
              />
            </div>

            <div className={styles.input_wrap_flex}>
              <Label className={styles.input_header}>Select a Category</Label>
              <select
                onChange={handleVotingSelect}
                value={votingMethod}
                className={styles.select_dropdown}
                title="Voting Method"
              >
                <option className="" value="ethholding">
                  EIP
                </option>
                <option className="" value="headcount">
                  HeadCounting
                </option>
              </select>
              <div className={styles.selected_dropdown_items}>
                <div>
                  <span>EID</span>
                  <FiX />
                </div>
                <div>
                  <span>EID</span>
                  <FiX />
                </div>
                <div>
                  <span>EID</span>
                  <FiX />
                </div>
              </div>
            </div>

            <div className={styles.input_wrap_flex}>
              <Label className={styles.input_header}>
                Motion Description:{' '}
              </Label>
              <TextEditor
                value={motionDescription}
                onChange={handleDescriptionChange}
              />
              <div className={styles.markdown_info}>
                <img src="/images/markdown.svg" />
                <span>Markdown Available</span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <div className={styles.input_wrap_flex}>
                <Label className={styles.input_header}>Options</Label>
                <span className={styles.header_small}>
                  Minimum of 2 options
                </span>

                {/* <Label className="text-black/60 text-base">max: 3</Label> */}
              </div>
              {options.map((option, index) => (
                <div key={index} className="flex w-full space-x-2">
                  <CheckerButton
                    option={option}
                    idx={index}
                    onInputChange={(e) => handleInputChange(index, e)}
                  />
                  {index > 1 && (
                    <button
                      className="text-red-400"
                      onClick={() => removeOption(index)}
                    >
                      <FiTrash2 />
                    </button>
                  )}
                </div>
              ))}

              <div className="flex justify-end">
                <Button className={styles.add_option_btn} onClick={addOption}>
                  <FiPlus />
                  <span>Add an Option</span>
                </Button>
              </div>
            </div>
            <div className={styles.input_wrap_flex}>
              <Label className={styles.input_header}>End Date/Time</Label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker value={endDateTime} />
              </LocalizationProvider>
            </div>
          </div>
          {/* <Label>{`Your TimeZone: ${myTimeZone.timeZone} ${myTimeZone.timeZoneOffset}`} </Label> */}

          <div className={styles.timezone}>
            <span>Your timezone:</span>
            <span>
              {timeZone} {timeZoneAbbr}
            </span>
          </div>
        </div>
        <div className={styles.create_container}>
          <Label className={styles.create_poll_header}>Voting Methods</Label>

          <Label className={styles.cred_header}>Select Credentials</Label>
          <div className={styles.voting_methods}>
            <button className={styles.select_all} onClick={toggleAll}>
              Select All
            </button>
            <div className={styles.cred_container}>
              <div className={styles.cred_container_header}>
                <input
                  type="checkbox"
                  checked={toggleStates[0]}
                  onChange={() => handleToggle(0)}
                  className={styles.toggle_btn}
                />
                <div className={styles.cred_details}>
                  <img src="images/eth_logo.svg" />
                  <span>Ether Holding: On-Chain</span>
                </div>
              </div>
              {toggleStates[0] ? (
                <div className={styles.cred_details_toggled_on}>
                  <p className={styles.desc_p}>Desc</p>
                  <div className={styles.radios_flex_col}>
                    <div className={styles.radio_flex}>
                      <div className={styles.active_radio}></div>
                      <span>On-chain</span>
                      <img src="/images/info_circle.svg" />
                    </div>
                    <div className={styles.radio_flex_disabled}>
                      <div className={styles.disabled_radio}></div>
                      <span>Off-chain</span>
                      <span className={styles.radio_coming_soon}>
                        OFF-CHAIN COMING SOON
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className={styles.cred_container}>
              <div className={styles.cred_container_header}>
                <input
                  type="checkbox"
                  checked={toggleStates[1]}
                  onChange={() => handleToggle(1)}
                  className={styles.toggle_btn}
                />
                <div className={styles.cred_details}>
                  <img src="images/poaps.svg" />
                  <span>POAPs Credentials</span>
                </div>
              </div>
              {toggleStates[1] ? (
                <div className={styles.cred_details_toggled_on}>
                  <p className={styles.desc_p}>Desc</p>
                  <div className={styles.cred_content}>
                    <div className="flex justify-end">
                      <Button className={styles.add_poaps}>
                        <span>Auto-add Ethereum event POAPs</span>
                        <FiPlus />
                      </Button>
                    </div>
                    <div className={styles.cred_dropdown_container}>
                      <select
                        onChange={handleVotingSelect}
                        value={votingMethod}
                        className={styles.select_dropdown}
                        title="Voting Method"
                      >
                        <option
                          className=""
                          value="ethholding"
                          disabled
                          selected
                        >
                          Select POAPs
                        </option>
                        <option className="" value="ethholding">
                          EIP
                        </option>
                        <option className="" value="headcount">
                          HeadCounting
                        </option>
                      </select>
                      <div className={styles.selected_dropdown_items}>
                        <div>
                          <span>DevCon 5</span>
                          <FiX />
                        </div>
                        <div>
                          <span>DevCon 5</span>
                          <FiX />
                        </div>
                        <div>
                          <span>DevCon 5</span>
                          <FiX />
                        </div>
                        <div>
                          <span>DevCon 5</span>
                          <FiX />
                        </div>
                      </div>
                    </div>

                    <div className={styles.input_wrap_flex}>
                      <Label className={styles.header_small}>
                        Select minimum amount of POAPs required
                      </Label>
                      <Input
                        value={motionTitle}
                        onChange={handleTitleInputChange}
                        placeholder={'3'}
                        className={styles.select_dropdown}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <div className={styles.cred_container}>
              <div className={styles.cred_container_header}>
                <input
                  type="checkbox"
                  checked={toggleStates[2]}
                  onChange={() => handleToggle(2)}
                  className={styles.toggle_btn}
                />
                <div className={styles.cred_details}>
                  <img src="images/zupass.svg" />
                  <span>Zupass Credentials</span>
                </div>
              </div>

              {toggleStates[2] ? (
                <div className={styles.cred_details_toggled_on}>
                  <p className={styles.desc_p}>Desc</p>
                  <div className={styles.cred_content}>
                    <div className={styles.cred_dropdown_container}>
                      <select
                        onChange={handleVotingSelect}
                        value={votingMethod}
                        className={styles.select_dropdown}
                        title="Voting Method"
                      >
                        <option
                          className=""
                          value="ethholding"
                          disabled
                          selected
                        >
                          Select Credentials
                        </option>
                        <option className="" value="ethholding">
                          EIP
                        </option>
                        <option className="" value="headcount">
                          HeadCounting
                        </option>
                      </select>
                      <div className={styles.selected_dropdown_items}>
                        <div>
                          <span>Zuzalu Resident</span>
                          <FiX />
                        </div>
                        <div>
                          <span>ZuConnect Resident</span>
                          <FiX />
                        </div>
                        <div>
                          <span>DevConnect Attendee</span>
                          <FiX />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <div className={styles.cred_container}>
              <div className={styles.cred_container_header}>
                <input
                  type="checkbox"
                  checked={toggleStates[3]}
                  onChange={() => handleToggle(3)}
                  className={styles.toggle_btn}
                />
                <div className={styles.cred_details}>
                  <img src="images/guild.png" />
                  <span>Protocol Guild Member Credential</span>
                </div>
              </div>
              {toggleStates[3] ? (
                <div className={styles.cred_details_toggled_on}>
                  <p className={styles.desc_p}>Desc</p>
                  <div className={styles.cred_content}>
                    <div className={styles.selected_dropdown_items}>
                      <div>
                        <span>Protocol Guild Member</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            <div className={styles.cred_container}>
              <div className={styles.cred_container_header}>
                <input
                  type="checkbox"
                  checked={toggleStates[4]}
                  onChange={() => handleToggle(4)}
                  className={styles.toggle_btn}
                />
                <div className={styles.cred_details}>
                  <img src="images/gitcoin.svg" />
                  <span>Gitcoin Passport</span>
                </div>
              </div>
              {toggleStates[4] ? (
                <div className={styles.cred_details_toggled_on}>
                  <p className={styles.desc_p}>Desc</p>
                  <div className={styles.cred_content}>
                    <div className={styles.input_wrap_flex}>
                      <Label className={styles.header_small}>
                        Input minimum score required
                      </Label>
                      <Input
                        value={motionTitle}
                        onChange={handleTitleInputChange}
                        placeholder={'10'}
                        className={styles.select_dropdown}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          {showNestedInfoDiv && (
            <div className={styles.multiple_cred_container}>
              <div className={styles.multiple_cred_info1}>
                <span>You Selected Multiple Credentials</span>
                <FiArrowDown />
              </div>
              <div className={styles.multiple_cred_info2}>
                <img src="/images/nes.svg" />
                <div>
                  <p>
                    <strong>You are creating a nested poll.</strong> (One
                    credential = One vote)
                  </p>
                  <span>
                    This allows a user to vote separately with each available
                    credential in a poll.
                  </span>
                </div>
              </div>
            </div>
          )}
          {/* <select
            onChange={handleVotingSelect}
            value={votingMethod}
            className="flex w-full text-black outline-none rounded-lg py-2.5 pr-3 pl-2.5 bg-inputField gap-2.5 items-center border border-white/10 border-opacity-10"
            title="Voting Method"
          >
            <option
              className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              value="ethholding"
            >
              EthHolding
            </option>
            <option
              className="bg-componentPrimary origin-top-right rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
              value="headcount"
            >
              HeadCounting
            </option>
          </select> */}

          {/* {votingMethod === 'ethholding' ? (
            <></>
          ) : (
            votingMethod === 'headcount' && (
              <div className="flex flex-col gap-2">
                <Label className="text-2xl">Access Rules</Label>
                <CredentialForm
                  selectedCredentials={credentials}
                  onCredentialsChange={(selectedUuids) =>
                    setCredentials(selectedUuids)
                  }
                />
              </div>
            )
          )} */}
        </div>
        <div className="flex gap-2.5">
          <Button className={styles.bottom_cta} leftIcon={FiX}>
            Discard
          </Button>
          <Button
            className={styles.bottom_cta}
            leftIcon={FiPlusCircle}
            isLoading={isLoading}
            onClick={createNewPoll}
          >
            Create Poll
          </Button>
        </div>
      </div>
    </div>
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
