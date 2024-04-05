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
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import moment from 'moment-timezone';
import styles from '@/styles/createPoll.module.css';
import POAPEvents from '../../components/POAPEvents';
import { createPoll } from '@/controllers/poll.controller';
import { getProviderUrl } from '@/utils/getProviderUrl';
import { getLatestBlockNumber } from '@/utils/getLatestBlockNumber';

interface ZupassOptionType {
  value: string;
  label: string;
}

const Options: ZupassOptionType[] = [
  { value: 'Zuzalu', label: 'Zuzalu Resident' },
  { value: 'Zuconnect', label: 'ZuConnect Resident' },
  { value: 'Devconnect', label: 'Istanbul DevConnect Attendee' },
];

const allZupassOptions = Options.map((cred) => cred.value);

const CreatePollPage = () => {
  const providerUrl = getProviderUrl();
  const [pollContract, setPollContract] = useState<Contract | null>(null);
  const contractAbi = VotingContract.abi;
  const router = useRouter();
  const [motionTitle, setMotionTitle] = useState<string>();
  const [motionDescription, setMotionDescription] = useState<string>('');
  const [gitcoinScore, setGitcoinScore] = useState<string>('10');
  const [POAPNumber, setPOAPNumber] = useState<string>('5');
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  const timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timeZoneAbbr = moment().tz(timeZone).format('zz');

  const [zupassCredential, setZupassCredential] =
    useState<string[]>(allZupassOptions);
  const [selectedEthHoldingOption, setSelectedEthHoldingOption] = useState<
    string[]
  >(['off-chain']);
  const [selectedProtocolGuildOption, setSelectedProtocolGuildOption] =
    useState<string>('off-chain');
  const [options, setOptions] = useState<OptionType[]>([
    { name: '', color: 'blue', index: 0 },
    { name: '', color: 'green', index: 1 },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  // Zustand
  const selectedPOAPEvents = useFormStore((state) => state.selectedEvents);
  const resetFormStore = useFormStore((state) => state.reset);
  const [endDateTime, setEndDateTime] = useState<Dayjs | null>(null);

  const [ethHolding, setEthHolding] = useState(false);
  const [poapsEnabled, setPoapsEnabled] = useState(false);
  const [zupassEnabled, setZupassEnabled] = useState(false);
  const [protocolGuildMemberEnabled, setProtocolGuildMemberEnabled] =
    useState(false);
  const [gitcoinPassport, setGitcoinPassport] = useState(false);
  const [ethSoloStaker, setEthSoloStaker] = useState(false);
  const [showNestedInfoDiv, setShowNestedInfoDiv] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number>(0);

  // Check if all toggles are true or false
  const areAllSelected =
    ethHolding &&
    poapsEnabled &&
    zupassEnabled &&
    protocolGuildMemberEnabled &&
    gitcoinPassport;

  // Function to toggle all states
  const toggleAll = () => {
    const newValue = !areAllSelected; // If all are selected, turn off, otherwise turn on
    setEthHolding(newValue);
    setPoapsEnabled(newValue);
    setZupassEnabled(newValue);
    //setProtocolGuildMemberEnabled(newValue);
    setGitcoinPassport(newValue);
    setEthSoloStaker(newValue);
  };

  useEffect(() => {
    console.log(gitcoinScore, 'gitcoinscore');
    const doConnect = async () => {
      const provider = new ethers.JsonRpcProvider(providerUrl);
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

  useEffect(() => {
    const trueCount = [
      ethHolding,
      poapsEnabled,
      zupassEnabled,
      protocolGuildMemberEnabled,
      gitcoinPassport,
      ethSoloStaker,
    ].filter(Boolean).length;
    setSelectedNumber(trueCount);
    if (trueCount >= 2) {
      setShowNestedInfoDiv(true);
    }
  }, [
    ethHolding,
    poapsEnabled,
    zupassEnabled,
    protocolGuildMemberEnabled,
    gitcoinPassport,
    ethSoloStaker,
  ]);

  const endDate = new Date(String(endDateTime));
  const durationInSeconds = Math.round((endDate.getTime() - Date.now()) / 1000);
  const currentSeconds = Date.now() / 1000 + 60; //time now plus 1 minute

  const addOption = () => {
    // TODO: Add color picker for different options
    const newIndex = options.length;
    setOptions([...options, { name: '', color: 'yellow', index: newIndex }]);
  };

  const removeOption = (removeIndex: number) => {
    const updatedOptions = options
      .filter((_, index) => index !== removeIndex)
      .map((option, index) => ({ ...option, index }));
    setOptions(updatedOptions);
  };

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

    if (endDate.getTime() / 1000 < currentSeconds) {
      toast({
        title: 'Error',
        description: 'The end time cannot be earlier than the current time.',
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

    if (selectedNumber === 0) {
      toast({
        title: 'Error',
        description: 'Should choose at least one credential',
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

    let credentialsTable: string[] = [];
    let indexTable: number[] = [];
    // ethHolding
    try {
      if (ethHolding) {
        for (const option of selectedEthHoldingOption) {
          if (option === 'on-chain') {
            if (!isConnected) {
              console.error(
                'You need to connect to Wallet to create, please try again'
              );
              toast({
                title: 'Error',
                description:
                  'You need to connect to Wallet to create, please try again',
                variant: 'destructive',
              });
              setIsLoading(false);
              connect();
              return;
            }
            const contractPollIndexEth = await contractPollCreation(0);
            if (contractPollIndexEth) {
              indexTable.push(contractPollIndexEth as number);
            }
          } else {
            credentialsTable.push(CREDENTIALS.EthHoldingOffchain.id);
          }
        }
      }

      // Protocol Guild
      if (protocolGuildMemberEnabled) {
        if (selectedProtocolGuildOption === 'on-chain') {
          if (!isConnected) {
            console.error(
              'You need to connect to Wallet to create, please try again'
            );
            toast({
              title: 'Error',
              description:
                'You need to connect to Wallet to create, please try again',
              variant: 'destructive',
            });
            setIsLoading(false);
            connect();
            return;
          }
          const contractPollIndexPro = await contractPollCreation(1);
          if (contractPollIndexPro) {
            indexTable.push(contractPollIndexPro as number);
          }
        } else {
          credentialsTable.push(CREDENTIALS.ProtocolGuildMember.id);
        }
      }

      // poapsEnabled
      if (poapsEnabled) {
        credentialsTable.push(CREDENTIALS.POAPapi.id);
      }

      // zupassEnabled
      console.log(zupassCredential);
      if (zupassEnabled) {
        if (zupassCredential.includes('Zuzalu')) {
          credentialsTable.push(CREDENTIALS.ZuzaluResident.id);
        }
        if (zupassCredential.includes('Zuconnect')) {
          credentialsTable.push(CREDENTIALS.ZuConnectResident.id);
        }
        if (zupassCredential.includes('Devconnect')) {
          credentialsTable.push(CREDENTIALS.DevConnect.id);
        }
      }

      // gitcoinEnabled
      if (gitcoinPassport) {
        credentialsTable.push(CREDENTIALS.GitcoinPassport.id);
      }
      // Eth Solo Staker
      if (ethSoloStaker) {
        credentialsTable.push(CREDENTIALS.EthSoloStaker.id);
      }
      const pollData = {
        title: motionTitle,
        description: motionDescription,
        time_limit: durationInSeconds,
        options: options.map((option, index) => ({
          option_description: option.name,
          option_index: index,
        })),
        credentials: credentialsTable,
        poap_events: selectedPOAPEvents.map((event) => event.id),
        poap_number: POAPNumber,
        gitcoin_score: Number(gitcoinScore),
        contractpoll_index: indexTable,
      };

      console.log('Creating poll...', pollData);

      const response = await createPoll(pollData);

      console.log('Poll created successfully', response);
      toast({
        title: 'Poll created successfully',
      });
      resetFormStore();
      setTimeout(() => {
        router.push('/').then(() => window.location.reload());
      }, 1000);
    } catch (error) {
      console.error('Error creating poll:', error);
      setIsLoading(false);
      resetFormStore();
      toast({
        title: 'Error',
        description: 'Failed to create poll',
        variant: 'destructive',
      });
      return;
    }
  };
  const contractPollCreation = async (pollType: number) => {
    try {
      if (pollContract) {
        console.log(pollType, 'poll_type');
        const optionNames = options.map((option) => option.name);
        const pollMetadata = 'arbitrary data';
        const provider = new ethers.BrowserProvider(window.ethereum as any);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(
          CONTRACT_ADDRESS,
          contractAbi,
          signer
        );
        console.log(provider, signer, contract);
        const network = await provider.getNetwork();

        console.log(`Connected to ${network}`);
        const start_block_number = await getLatestBlockNumber();
        const averageBlockTimeS = 12;
        const estimatedBlocks = durationInSeconds / averageBlockTimeS;
        const end_block_number =
          start_block_number + Math.round(estimatedBlocks);
        const tx = await contract.createPoll(
          motionTitle,
          motionDescription,
          durationInSeconds,
          optionNames,
          pollType,
          pollMetadata,
          end_block_number
        );
        await tx.wait();
        toast({
          title: 'On-chain poll created successfully, please wait',
        });
        console.log('Poll created successfully');

        if (
          (ethHolding &&
            !poapsEnabled &&
            !zupassEnabled &&
            !protocolGuildMemberEnabled &&
            !gitcoinPassport) ||
          (!ethHolding &&
            !poapsEnabled &&
            !zupassEnabled &&
            protocolGuildMemberEnabled &&
            !gitcoinPassport)
        ) {
          router.push('/').then(() => window.location.reload());
        } else {
          //Get created contract poll's index
          const { names } = await contract.getAllPolls();
          const contractPollIndex = names.length - 1;
          return contractPollIndex;
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
      throw error;
    }
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
    setZupassCredential((prev) =>
      prev.includes(value)
        ? prev.filter((item) => item !== value)
        : [...prev, value]
    );
  };
  const removeZupassSelected = (value: string) => {
    setZupassCredential((prev) => prev.filter((item) => item !== value));
  };
  const handleEthHoldingRadioChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setSelectedEthHoldingOption((prevOptions) => {
      const index = prevOptions.indexOf(value);
      if (index > -1) {
        return prevOptions.filter((option) => option !== value);
      } else {
        return [...prevOptions, value];
      }
    });
  };
  const handleProtocolGuildRadioChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
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
    <div className="flex gap-20 px-20 py-5 text-black w-800 justify-center overflow-y-auto">
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
              {/* Comment it cause it's not working after test
              <div className={styles.markdown_info}>
                <img src="/images/markdown.svg" />
                <span>Markdown Available</span>
                </div>*/}
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

              {options.length < 5 && (
                <div className="flex justify-end">
                  <Button className={styles.add_option_btn} onClick={addOption}>
                    <FiPlus />
                    <span>Add an Option</span>
                  </Button>
                </div>
              )}
            </div>
            <div className={styles.input_wrap_flex}>
              <Label className={styles.input_header}>End Date/Time</Label>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateTimePicker
                  value={endDateTime}
                  onChange={setEndDateTime}
                  className={styles.date}
                />
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
                  onChange={() => setEthHolding((prevState) => !prevState)}
                  className={styles.toggle_btn}
                />
                <div className={styles.cred_details}>
                  <img src="images/eth_logo.svg" />
                  <span>Ether Holding </span>
                </div>
              </div>
              {ethHolding ? (
                <div className={styles.cred_details_toggled_on}>
                  <p className={styles.desc_p}>
                    Description: The real-time quantity of ETH held in the
                    address that participates in the voting are counted as
                    votes.
                  </p>
                  <p className={styles.desc_p}>
                    The poll results will dynamically show vote changes
                    according to the state of blockchain until the end of the
                    poll. Voters can send transaction from wallets off-site.
                  </p>
                  <div className={styles.radios_flex_col}>
                    <label className={styles.radio_flex}>
                      <input
                        type="checkbox"
                        name="EthHoldingOption"
                        value="on-chain"
                        checked={selectedEthHoldingOption.includes('on-chain')}
                        onChange={handleEthHoldingRadioChange}
                        className={styles.hidden_radio}
                      />
                      <div className={styles.radio_p_container}>
                        <p>
                          <b>Classic Carvonvote</b>: Select this option to
                          implement a smart contract for the vote tallying
                          process.
                        </p>
                        <div className={styles.radio_span}>
                          <img src="/images/info_circle.svg" alt="Info" />
                          <span>
                            Poll creators and voters will need to pay for
                            transaction fees for deployment of contract and
                            voting. (SC is under auditing)
                          </span>
                        </div>
                      </div>
                    </label>
                    <label className={styles.radio_flex}>
                      <input
                        type="checkbox"
                        name="EthHoldingOption"
                        value="off-chain"
                        checked={selectedEthHoldingOption.includes('off-chain')}
                        onChange={handleEthHoldingRadioChange}
                        className={styles.hidden_radio}
                      />
                      <div className={styles.radio_p_container}>
                        <p>
                          <b>Carbonvote V2</b>: Zero Transaction Costs for Poll
                          Creators and Voters: The voting process is conducted
                          off-chain.{' '}
                        </p>
                        <div className={styles.radio_span}>
                          <img src="/images/info_circle.svg" alt="Info" />
                          <span>
                            Verification is ensured through IPFS/Ceramic.
                            (Recommmend)
                          </span>
                        </div>
                      </div>
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
                  onChange={() => setPoapsEnabled((prevState) => !prevState)}
                  className={styles.toggle_btn}
                />
                <div className={styles.cred_details}>
                  <img src="images/poaps.svg" />
                  <span>POAPs Credentials</span>
                </div>
              </div>
              {poapsEnabled ? (
                <div className={styles.cred_details_toggled_on}>
                  <p className={styles.desc_p}>
                    Description: POAP (Proof of Attendance Protocol) voters are
                    individuals who possess special non-fungible tokens (NFTs)
                    known as POAPs (link to poap.xyz).{' '}
                  </p>
                  <p className={styles.desc_p}>
                    Choose the eligible events (POAPs) for the poll and
                    determine the minimum number of events each voter must have
                    attended for eligibility. One address one vote.
                  </p>
                  <div className={styles.cred_content}>
                    <div className="flex flex-col gap-2">
                      {/* <Label className="text-2xl font-semibold">
                        Select Event
                      </Label> */}
                      <POAPEvents />
                    </div>

                    <div className={styles.input_wrap_flex}>
                      <Label className={styles.header_small}>
                        Select minimum amount of POAPs required
                      </Label>
                      <Input
                        value={POAPNumber}
                        onChange={handlePOAPNumberChange}
                        placeholder={'5'}
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
                  onChange={() => setZupassEnabled((prevState) => !prevState)}
                  className={styles.toggle_btn}
                />
                <div className={styles.cred_details}>
                  <img src="images/zupass.svg" />
                  <span>Zupass Credentials</span>
                </div>
              </div>

              {zupassEnabled ? (
                <div className={styles.cred_details_toggled_on}>
                  <p className={styles.desc_p}>
                    Description: Choose the eligible events (Zupass Ticket) for
                    the poll. One event ticket one vote. The votes are counted
                    separately according to each event.
                  </p>
                  <div className={styles.cred_content}>
                    <div className={styles.cred_dropdown_container}>
                      <select
                        onChange={handleZupassSelect}
                        className={styles.select_dropdown}
                        title="Zupass Credential"
                      >
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
                          const option = Options.find(
                            (option) => option.value === value
                          );
                          return (
                            <div key={index}>
                              <span>{option?.label}</span>
                              <FiX
                                onClick={() => removeZupassSelected(value)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
            {/*<div className={styles.cred_container}>
              <div className={styles.cred_container_header}>
                <input
                  type="checkbox"
                  checked={protocolGuildMemberEnabled}
                  onChange={() =>
                    setProtocolGuildMemberEnabled((prevState) => !prevState)
                  }
                  className={styles.toggle_btn}
                />
                <div className={styles.cred_details}>
                  <img src="images/guild.png" />
                  <span>Protocol Guild Member Credential</span>
                </div>
              </div>
              {protocolGuildMemberEnabled ? (
                <div className={styles.cred_details_toggled_on}>
                  <p className={styles.desc_p}>
                    Description: Voters are individuals who owns recognized
                    membership Protocol Guild. Each address (person) counts as
                    one vote.
                  </p>
                  <p className={styles.desc_p}>
                    <a
                      href="https://app.splits.org/accounts/0xF29Ff96aaEa6C9A1fBa851f74737f3c069d4f1a9/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'blue', textTransform: 'uppercase' }}
                    >
                      Source link
                    </a>
                    {'    '}Updated: 02/2024{' '}
                  </p>
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
                      <div className={styles.radio_p_container}>
                        <p>
                          <b>Classic Carvonvote</b>: Select this option to
                          implement a smart contract for the vote tallying
                          process.{' '}
                        </p>
                        <div className={styles.radio_span}>
                          <img src="/images/info_circle.svg" alt="Info" />
                          <span>
                            Poll creators and voters will need to pay for
                            transaction fees for deployment of contract and
                            voting. Voters can send transaction from wallets
                            off-site. (SC is under auditing)
                          </span>
                        </div>
                      </div>
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
                      <div className={styles.radio_p_container}>
                        <p>
                          <b>Carbonvote V2</b>: Zero Transaction Costs for Poll
                          Creators and Voters: The voting process is conducted
                          off-chain.{' '}
                        </p>
                        <div className={styles.radio_span}>
                          <img src="/images/info_circle.svg" alt="Info" />
                          <span>
                            Requires voters to sign in with Protocol Guild
                            recognised address. Verification is ensured through
                            IPFS/Ceramic.
                          </span>
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
              ) : null}
            </div>*/}
            <div className={styles.cred_container}>
              <div className={styles.cred_container_header}>
                <input
                  type="checkbox"
                  checked={gitcoinPassport}
                  onChange={() => setGitcoinPassport((prevState) => !prevState)}
                  className={styles.toggle_btn}
                />
                <div className={styles.cred_details}>
                  <img src="images/gitcoin.svg" />
                  <span>Gitcoin Passport</span>
                </div>
              </div>
              {gitcoinPassport ? (
                <div className={styles.cred_details_toggled_on}>
                  <p className={styles.desc_p}>
                    Description: Voters are users of Gitcoin Passport indicating
                    participation or contribution within the Gitcoin ecosystem.
                    Determine the minimum score required for eligibility among
                    voters.
                  </p>
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
            <div className={styles.cred_container}>
              <div className={styles.cred_container_header}>
                <input
                  type="checkbox"
                  checked={ethSoloStaker}
                  onChange={() => setEthSoloStaker((prevState) => !prevState)}
                  className={styles.toggle_btn}
                />
                <div className={styles.cred_details}>
                  <img src="images/solo_staker.svg" />
                  <span>Ether Solo Staker</span>
                </div>
              </div>
              {ethSoloStaker ? (
                <div className={styles.cred_details_toggled_on}>
                  <p className={styles.desc_p}>
                    Description: Ether Solo Staker voters are individuals who
                    stake their Ethereum (ETH) independently, without relying on
                    a staking pool or service. (Smart contract version will come
                    soon)
                  </p>
                  <p className={styles.desc_p}>
                    <a
                      href="https://github.com/starknet-io/provisions-data/tree/main/eth"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'blue', textTransform: 'uppercase' }}
                    >
                      Source link
                    </a>
                    {'    '}Updated: 03/2024{' '}
                  </p>
                  <div className={styles.cred_content}></div>
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
                <img src="/images/nes.svg" alt="Nested Info" />
                {selectedNumber === 2 &&
                selectedEthHoldingOption.length === 1 &&
                selectedEthHoldingOption[0] === 'on-chain' &&
                selectedProtocolGuildOption === 'on-chain' ? (
                  <div>
                    <p>
                      <strong>
                        You are creating two smart contract polls.
                      </strong>
                    </p>
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          )}
        </div>
        <div className={styles.bottom_cta_container}>
          <Button
            className={styles.bottom_buttons}
            leftIcon={FiX}
            onClick={handleBack}
          >
            Discard
          </Button>
          <Button
            className={styles.bottom_buttons}
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
