'use client';
import {
  FiArrowLeft,
  FiPlusCircle,
  FiX,
  FiPlus,
  FiTrash2,
  FiArrowDown,
} from 'react-icons/fi';
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
import VotingContract from '../../carbonvote-contracts/deployment/contracts/VoteContract.sol/VotingContract.json';
import { toast } from '@/components/ui/use-toast';
import { OptionType } from '@/types';
import { useFormStore } from '@/zustand/create';
import { CREDENTIALS, CONTRACT_ADDRESS } from '@/src/constants';
import {
  DateTimePicker,
  LocalizationProvider
} from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import moment from 'moment-timezone';
import styles from '@/styles/createPoll.module.css';
import POAPEvents from '../../components/POAPEvents';
import { createPoll } from '@/controllers/poll.controller';

interface ZupassOptionType {
  value: string;
  label: string;
}

const Options: ZupassOptionType[] = [
  { value: 'Zuzalu', label: 'Zuzalu Resident' },
  { value: 'Zuconnect', label: 'ZuConnect Resident' },
  { value: 'Devconnect', label: 'DevConnect Attendee' },
];

const allZupassOptions = Options.map(cred => cred.value);

const CreatePollPage = () => {
  const [pollContract, setPollContract] = useState<Contract | null>(null);
  const contractAbi = VotingContract.abi;
  const router = useRouter();
  const [motionTitle, setMotionTitle] = useState<string>();
  const [motionDescription, setMotionDescription] = useState<string>('');
  const [gitcoinScore, setGitcoinScore] = useState<string>('10');
  const [POAPNumber, setPOAPNumber] = useState<string>('1');
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  const timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeZoneAbbr = moment().tz(timeZone).format('zz');

  const [zupassCredential, setZupassCredential] = useState<string[]>(allZupassOptions);
  const [selectedEthHoldingOption, setSelectedEthHoldingOption] = useState<string>('off-chain');
  const [selectedProtocolGuildOption, setSelectedProtocolGuildOption] = useState<string>('off-chain');
  const [options, setOptions] = useState<OptionType[]>([{ name: '', color: 'blue' }, { name: '', color: 'green' }]);
  const [isLoading, setIsLoading] = useState(false);

  // Zustand
  const selectedPOAPEvents = useFormStore((state) => state.selectedEvents);
  const resetFormStore = useFormStore((state) => state.reset);
  const [endDateTime, setEndDateTime] = useState<Dayjs | null>(null);

  const [ethHolding, setEthHolding] = useState(false);
  const [poapsEnabled, setPoapsEnabled] = useState(false);
  const [zupassEnabled, setZupassEnabled] = useState(false);
  const [protocolGuildMemberEnabled, setProtocolGuildMemberEnabled] = useState(false);
  const [gitcoinPassport, setGitcoinPassport] = useState(false);

  // TODO: Check if more than one is selected and enable showNestedInfoDiv
  const [showNestedInfoDiv, setShowNestedInfoDiv] = useState(false);

  // Check if all toggles are true or false
  const areAllSelected = ethHolding && poapsEnabled && zupassEnabled && protocolGuildMemberEnabled && gitcoinPassport;

  // Function to toggle all states
  const toggleAll = () => {
    const newValue = !areAllSelected; // If all are selected, turn off, otherwise turn on
    setEthHolding(newValue);
    setPoapsEnabled(newValue);
    setZupassEnabled(newValue);
    setProtocolGuildMemberEnabled(newValue);
    setGitcoinPassport(newValue);
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

  const endDate = new Date(String(endDateTime));
  const durationInSeconds = endDate.getTime() / 1000;
  console.log(durationInSeconds, 'endDate');
  const currentSeconds = (Date.now() / 1000) + 60; //time now plus 1 minute

  const addOption = () => {
    // TODO: Add color picker for different options
    setOptions([...options, { name: '', color: "yellow" }]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOffchainCreatePoll = async (credential: string) => {

    if (!motionTitle || !credential) return;

    const pollData = {
      title: motionTitle,
      description: motionDescription,
      time_limit: durationInSeconds,
      votingMethod: 'headCount',
      options: options
        .map((option) => ({ option_description: option.name })),
      credentials: [credential],
      poap_events: selectedPOAPEvents.map((event) => event.id),
      endDateTime: endDateTime,
    };

    try {
      console.log('Creating poll...', pollData);

      const response = await createPoll(pollData);

      console.log('Poll created successfully', response);
      toast({
        title: 'Poll created successfully',
      });
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
  }

  const createNewPoll = async () => {
    setIsLoading(true);
    if (!motionTitle || !motionDescription || !endDateTime) {
      toast({
        title: 'Error',
        description: 'All fields are required',
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (durationInSeconds < currentSeconds) {
      toast({
        title: 'Error',
        description: "The end time cannot be earlier than the current time.",
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (options.length < 2) {
      toast({
        title: 'Error',
        description: 'At least two options should be included',
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
    // FIXME: Remove poll_type from Supabase
    // let poll_type = 0;
    const optionNames = options.map((option) => option.name);
    const pollMetadata = 'arbitrary data';
    console.log('Title:', motionTitle);
    console.log('Description:', motionDescription);
    console.log('Duration (seconds):', durationInSeconds);
    console.log('Option Names:', optionNames);
    console.log('Poll Metadata:', pollMetadata);

    // ethHolding
    if (ethHolding) {
      if (selectedProtocolGuildOption === 'off-chain') {
        handleOffchainCreatePoll(CREDENTIALS.EthHoldingOffchain.id)
      } else {
        // TODO: contract based poll
      }
    }

    // poapsEnabled
    if (poapsEnabled) {
      handleOffchainCreatePoll(CREDENTIALS.POAPapi.id)
    }

    // zupassEnabled
    if (zupassEnabled) {

    }

    // Protocol Guild
    if (protocolGuildMemberEnabled) {
      // TODO: Add offchain/onchain if/else using 'selectedProtocolGuildOption'
      if (selectedProtocolGuildOption === 'off-chain') {
        handleOffchainCreatePoll(CREDENTIALS.ProtocolGuildMember.id)

      } else {
        // TODO: contract based poll
      }
    }

    // FIXME: Add ethholding onchain option
    // if (XXXXXXXXXXX) {
    //   try {
    //     if (pollContract) {
    //       if (!isConnected) {
    //         console.error(
    //           'You need to connect to Metamask to create, please try again'
    //         );
    //         toast({
    //           title: 'Error',
    //           description:
    //             'You need to connect to Metamask to create, please try again',
    //           variant: 'destructive',
    //         });
    //         setIsLoading(false);
    //         connect();
    //         return;
    //       }
    //       const provider = new ethers.BrowserProvider(window.ethereum as any);
    //       const signer = await provider.getSigner();
    //       const contract = new ethers.Contract(
    //         CONTRACT_ADDRESS,
    //         contractAbi,
    //         signer
    //       );
    //       console.log(provider, signer, contract);
    //       const network = await provider.getNetwork();

    //       if (Number(network.chainId) === 11155111) {
    //         console.log('Connected to Sepolia');

    //         const tx = await contract.createPoll(
    //           motionTitle,
    //           motionDescription,
    //           durationInSeconds,
    //           optionNames,
    //           pollMetadata
    //         );
    //         await tx.wait();
    //         toast({
    //           title: 'Poll created successfully, please wait',
    //         });
    //         console.log('Poll created successfully');
    //         resetFormStore();
    //         router.push('/').then(() => window.location.reload());
    //       } else {
    //         console.error('You should connect to Sepolia, please try again');
    //         toast({
    //           title: 'Error',
    //           description: 'You should connect to Sepolia, please try again',
    //           variant: 'destructive',
    //         });
    //         setIsLoading(false);
    //       }
    //     }
    //   } catch (error: any) {
    //     console.error('Error creating poll:', error);
    //     setIsLoading(false);
    //     resetFormStore();
    //     toast({
    //       title: 'Error',
    //       description: error.message,
    //       variant: 'destructive',
    //     });
    //   }
    // }
  };

  const handleTitleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMotionTitle(event.target.value);
  };
  const handleDescriptionChange = (value: string) => {
    setMotionDescription(value);
  };
  const handleGitcoinScoreChange = (event: ChangeEvent<HTMLInputElement>) => {
    setGitcoinScore(event.target.value);
  };
  const handlePOAPNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPOAPNumber(event.target.value);
  };
  const handleZupassSelect = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setZupassCredential(prev =>
      prev.includes(value) ? prev.filter(item => item !== value) : [...prev, value]
    );
  };
  const removeZupassSelected = (value: string) => {
    setZupassCredential(prev => prev.filter(item => item !== value));
  };
  const handleEthHoldingRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedEthHoldingOption(event.target.value);
    console.log(event.target.value);
  };
  const handleProtocolGuildRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedProtocolGuildOption(event.target.value);
    console.log(event.target.value);
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
                <DateTimePicker value={endDateTime} onChange={setEndDateTime} />
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
                  checked={ethHolding}
                  onChange={() => setEthHolding(prevState => !prevState)}
                  className={styles.toggle_btn}
                />
                <div className={styles.cred_details}>
                  <img src="images/eth_logo.svg" />
                  <span>Ether Holding: </span>
                </div>
              </div>
              {ethHolding ? (
                <div className={styles.cred_details_toggled_on}>
                  <p className={styles.desc_p}>Desc</p>
                  <div className={styles.radios_flex_col}>
                    <label className={styles.radio_flex}>
                      <input
                        type="radio"
                        name="EthHoldingOption"
                        value="on-chain"
                        checked={selectedEthHoldingOption === 'on-chain'}
                        onChange={handleEthHoldingRadioChange}
                        className={styles.hidden_radio}
                      />
                      <span>On-chain: Smart Contract verification and voting</span>
                      <img src="/images/info_circle.svg" alt="Info" />
                    </label>
                    <label className={styles.radio_flex}>
                      <input
                        type="radio"
                        name="EthHoldingOption"
                        value="off-chain"
                        checked={selectedEthHoldingOption === 'off-chain'}
                        onChange={handleEthHoldingRadioChange}
                        className={styles.hidden_radio}
                      />
                      <span>Off-chain</span>
                      <img src="/images/info_circle.svg" alt="Info" />
                    </label>
                  </div>
                </div>
              ) : null}
            </div>

            <div className={styles.cred_container}>
              <div className={styles.cred_container_header}>
                <input
                  type="checkbox"
                  checked={poapsEnabled}
                  onChange={() => setPoapsEnabled(prevState => !prevState)}
                  className={styles.toggle_btn}
                />
                <div className={styles.cred_details}>
                  <img src="images/poaps.svg" />
                  <span>POAPs Credentials</span>
                </div>
              </div>
              {poapsEnabled ? (
                <div className={styles.cred_details_toggled_on}>
                  <p className={styles.desc_p}>Desc</p>
                  <div className={styles.cred_content}>
                    <div className="flex flex-col gap-2">
                      <Label className="text-2xl font-semibold">Select Event</Label>
                      <POAPEvents />
                    </div>

                    <div className={styles.input_wrap_flex}>
                      <Label className={styles.header_small}>
                        Select minimum amount of POAPs required
                      </Label>
                      <Input
                        value={POAPNumber}
                        onChange={handlePOAPNumberChange}
                        placeholder={'1'}
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
                  checked={zupassEnabled}
                  onChange={() => setZupassEnabled(prevState => !prevState)}
                  className={styles.toggle_btn}
                />
                <div className={styles.cred_details}>
                  <img src="images/zupass.svg" />
                  <span>Zupass Credentials</span>
                </div>
              </div>

              {zupassEnabled ? (
                <div className={styles.cred_details_toggled_on}>
                  <p className={styles.desc_p}>Desc</p>
                  <div className={styles.cred_content}>
                    <div className={styles.cred_dropdown_container}>
                      <select onChange={handleZupassSelect} className={styles.select_dropdown}
                        title="Zupass Credential">
                        <option value="" disabled>
                          Select Credentials
                        </option>
                        {Options.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <div className={styles.selected_dropdown_items}>
                        {zupassCredential.map((value, index) => {
                          const option = Options.find(option => option.value === value);
                          return (
                            <div key={index}>
                              <span>{option?.label}</span>
                              <FiX onClick={() => removeZupassSelected(value)} />
                            </div>
                          );
                        })}
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
                  checked={protocolGuildMemberEnabled}
                  onChange={() => setProtocolGuildMemberEnabled(prevState => !prevState)}
                  className={styles.toggle_btn}
                />
                <div className={styles.cred_details}>
                  <img src="images/guild.png" />
                  <span>Protocol Guild Member Credential</span>
                </div>
              </div>
              {protocolGuildMemberEnabled ? (
                <div className={styles.cred_details_toggled_on}>
                  <p className={styles.desc_p}>Desc</p>
                  <div className={styles.radios_flex_col}>
                    <label className={styles.radio_flex}>
                      <input
                        type="radio"
                        name="chainOption"
                        value="on-chain"
                        checked={selectedProtocolGuildOption === 'on-chain'}
                        onChange={handleProtocolGuildRadioChange}
                        className={styles.hidden_radio}
                      />
                      <span>On-chain: Smart Contract verification and voting</span>
                      <img src="/images/info_circle.svg" alt="Info" />
                    </label>
                    <label className={styles.radio_flex}>
                      <input
                        type="radio"
                        name="chainOption"
                        value="off-chain"
                        checked={selectedProtocolGuildOption === 'off-chain'}
                        onChange={handleProtocolGuildRadioChange}
                        className={styles.hidden_radio}
                      />
                      <span>Off-chain</span>
                      <img src="/images/info_circle.svg" alt="Info" />
                    </label>
                  </div>
                </div>
              ) : null}
            </div>
            <div className={styles.cred_container}>
              <div className={styles.cred_container_header}>
                <input
                  type="checkbox"
                  checked={gitcoinPassport}
                  onChange={() => setGitcoinPassport(prevState => !prevState)}
                  className={styles.toggle_btn}
                />
                <div className={styles.cred_details}>
                  <img src="images/gitcoin.svg" />
                  <span>Gitcoin Passport</span>
                </div>
              </div>
              {gitcoinPassport ? (
                <div className={styles.cred_details_toggled_on}>
                  <p className={styles.desc_p}>Desc</p>
                  <div className={styles.cred_content}>
                    <div className={styles.input_wrap_flex}>
                      <Label className={styles.header_small}>
                        Input minimum score required
                      </Label>
                      <Input
                        value={gitcoinScore}
                        onChange={handleGitcoinScoreChange}
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