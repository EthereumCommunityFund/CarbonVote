import { useForm, useFieldArray, FieldArrayWithId } from 'react-hook-form';
import { useState, useEffect, useMemo, startTransition } from 'react';
import { useRouter } from 'next/router';
import { Contract, ethers, isAddress } from 'ethers';
import {
  useAccount,
  useConnect,
  useConfig,
  useWriteContract,
  useReadContract,
} from 'wagmi';
import { waitForTransactionReceipt, readContract } from 'wagmi/actions';
import { injected } from 'wagmi/connectors';
import { toast } from '@/components/ui/use-toast';
import { CONTRACT_ADDRESS, CREDENTIALS } from '@/src/constants';
import { useFormStore } from '@/zustand/create';
import { getProviderUrl } from '@/utils/getProviderUrl';
import { getLatestBlockNumber } from '@/utils/getLatestBlockNumber';
import { createPoll } from '@/controllers/poll.controller';
import dayjs, { Dayjs } from 'dayjs';
import VotingContract from '../../carbonvote-contracts/deployment/contracts/VoteContract.sol/VotingContract.json';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { devLog } from '@/utils/devLog';

const optionSchema = z.object({
  name: z.string().min(1, { message: 'Option description cannot be empty' }),
  // color: z.string(),
  index: z.number(),
});

const pollSchema = z
  .object({
    motionTitle: z.string().min(1, { message: 'Motion title is required' }),
    categories: z
      .array(z.string())
      .min(1, { message: 'At least one category is required' })
      .max(3, { message: 'Maximum 3 categories allowed' }),
    tags: z.array(z.string()).max(5, { message: 'Maximum 5 tags allowed' }),
    motionDescription: z.string().optional(),
    options: z
      .array(optionSchema)
      .min(2, { message: 'At least two options should be included' }),
    endDateTime: z
      .any()
      .nullable()
      .refine((val) => val !== null, { message: 'End Date/Time is required' })
      .refine((date) => date && dayjs(date).isAfter(dayjs().add(1, 'minute')), {
        message: 'The end time must be in the future',
      }),
    gitcoinScore: z
      .string()
      .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
        message: 'Please enter a valid non-negative number',
      }),
    POAPNumber: z.string().refine((val) => /^[1-9]\d*$/.test(val), {
      message: 'Please enter a valid positive number',
    }),
    zupassCredential: z.array(z.string()),
    ethHolding: z.boolean(),
    poapsEnabled: z.boolean(),
    zupassEnabled: z.boolean(),
    // protocolGuildMemberEnabled: z.boolean(),
    gitcoinPassport: z.boolean(),
    // ethSoloStaker: z.boolean(),
    whitelistedAddressesEnabled: z.boolean(),
    whitelistedAddresses: z.string(),
    selectedEthHoldingOption: z.array(z.string()),
    // selectedProtocolGuildOption: z.string(),
  })
  .superRefine((data, ctx) => {
    if (data.ethHolding && data.selectedEthHoldingOption.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          'Please select at least one Ether Holding option (Classic or V2).',
        path: ['selectedEthHoldingOption'],
      });
    }
    if (data.poapsEnabled && !data.POAPNumber) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Minimum POAP amount is required',
        path: ['POAPNumber'],
      });
    }
    if (data.gitcoinPassport && !data.gitcoinScore) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Minimum score is required',
        path: ['gitcoinScore'],
      });
    }
    if (data.zupassEnabled && data.zupassCredential.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Please select at least one Zupass credential.',
        path: ['zupassCredential'],
      });
    }
    if (data.whitelistedAddressesEnabled) {
      // Check if the input contains addresses
      if (
        !data.whitelistedAddresses ||
        data.whitelistedAddresses.trim() === ''
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter at least one address, separated by commas',
          path: ['whitelistedAddresses'],
        });
        return;
      }

      // Check if addresses are properly separated by commas
      const commaRegex = /，/g;
      if (commaRegex.test(data.whitelistedAddresses)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please use commas (,) to separate addresses',
          path: ['whitelistedAddresses'],
        });
        return;
      }

      // Split and validate each address
      const addresses = data.whitelistedAddresses
        .split(',')
        .map((addr) => addr.trim())
        .filter(Boolean);

      if (addresses.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter at least one address, separated by commas',
          path: ['whitelistedAddresses'],
        });
        return;
      }

      // Validate each address is a valid Ethereum address using ethers.js isAddress function
      const invalidAddresses = addresses.filter((addr) => !isAddress(addr));

      if (invalidAddresses.length > 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Please enter valid Ethereum addresses',
          path: ['whitelistedAddresses'],
        });
      }
    }

    const credentialSelectedCount = [
      data.ethHolding,
      data.poapsEnabled,
      data.zupassEnabled,
      // data.protocolGuildMemberEnabled,
      data.gitcoinPassport,
      // data.ethSoloStaker,
      data.whitelistedAddressesEnabled,
    ].filter(Boolean).length;
    if (credentialSelectedCount === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Should choose at least one credential',
        path: ['ethHolding'],
      });
    }
  });

export type FormData = z.infer<typeof pollSchema>;

interface UseCreatePollReturn {
  register: ReturnType<typeof useForm<FormData>>['register'];
  control: ReturnType<typeof useForm<FormData>>['control'];
  handleSubmit: ReturnType<typeof useForm<FormData>>['handleSubmit'];
  watch: ReturnType<typeof useForm<FormData>>['watch'];
  setValue: ReturnType<typeof useForm<FormData>>['setValue'];
  getValues: ReturnType<typeof useForm<FormData>>['getValues'];
  errors: ReturnType<typeof useForm<FormData>>['formState']['errors'];
  fields: FieldArrayWithId<FormData, 'options', 'id'>[];
  ethHolding: boolean;
  poapsEnabled: boolean;
  zupassEnabled: boolean;
  // protocolGuildMemberEnabled: boolean;
  gitcoinPassport: boolean;
  // ethSoloStaker: boolean;
  whitelistedAddressesEnabled: boolean;
  whitelistedAddresses: string;

  endDateTime: Dayjs | null;
  zupassCredential: string[];
  selectedEthHoldingOption: string[];
  // selectedProtocolGuildOption: string;
  areAllSelected: boolean;
  addOption: () => void;
  removeOption: (index: number) => void;
  toggleAll: () => void;
  onSubmit: (data: FormData) => Promise<void>;
  handleBack: () => void;
  isLoading: boolean;
  contractPollCreation: (pollType: number) => Promise<number | undefined>;
}

export const useCreatePoll = (
  allZupassOptions: string[]
): UseCreatePollReturn => {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { connect } = useConnect();
  const config = useConfig();
  const providerUrl = getProviderUrl();
  const [pollContract, setPollContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { writeContractAsync } = useWriteContract();

  const selectedPOAPEvents = useFormStore((state) => state.selectedEvents);
  const resetFormStore = useFormStore((state) => state.reset);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(pollSchema),
    defaultValues: {
      motionTitle: '',
      motionDescription: '',
      tags: [],
      options: [
        { name: 'Yes', index: 0 },
        { name: 'No', index: 1 },
      ],
      endDateTime: null,
      gitcoinScore: '10',
      POAPNumber: '5',
      zupassCredential: [...allZupassOptions],
      ethHolding: false,
      poapsEnabled: false,
      zupassEnabled: false,
      // protocolGuildMemberEnabled: false,
      gitcoinPassport: false,
      // ethSoloStaker: false,
      whitelistedAddressesEnabled: false,
      whitelistedAddresses: '',

      selectedEthHoldingOption: [],
      // selectedProtocolGuildOption: 'off-chain',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'options',
  });

  const ethHolding = watch('ethHolding');
  const poapsEnabled = watch('poapsEnabled');
  const zupassEnabled = watch('zupassEnabled');
  // const protocolGuildMemberEnabled = watch('protocolGuildMemberEnabled');
  const gitcoinPassport = watch('gitcoinPassport');
  // const ethSoloStaker = watch('ethSoloStaker');
  const whitelistedAddressesEnabled = watch('whitelistedAddressesEnabled');
  const whitelistedAddresses = watch('whitelistedAddresses');

  const endDateTime = watch('endDateTime');
  const zupassCredential = watch('zupassCredential');
  const selectedEthHoldingOption = watch('selectedEthHoldingOption');
  // const selectedProtocolGuildOption = watch('selectedProtocolGuildOption');

  const areAllSelected = useMemo(() => {
    return (
      ethHolding &&
      poapsEnabled &&
      zupassEnabled &&
      // protocolGuildMemberEnabled &&
      gitcoinPassport &&
      // ethSoloStaker &&
      whitelistedAddressesEnabled
    );
  }, [
    ethHolding,
    poapsEnabled,
    zupassEnabled,
    // protocolGuildMemberEnabled,
    gitcoinPassport,
    // ethSoloStaker,
    whitelistedAddressesEnabled,
  ]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      const doConnect = async () => {
        try {
          console.log('Connecting to contract with provider URL:', providerUrl);
          const provider = new ethers.JsonRpcProvider(providerUrl);
          const contract = new ethers.Contract(
            CONTRACT_ADDRESS,
            VotingContract.abi,
            provider
          );
          startTransition(() => {
            setPollContract(contract);
          });
          console.log('Contract instance created:', contract);
        } catch (error) {
          console.error('Failed to connect to contract:', error);
          toast({
            title: 'Error',
            description: 'Failed to initialize contract connection.',
            variant: 'destructive',
          });
        }
      };

      doConnect();
      startTransition(() => {
        resetFormStore();
      });
      console.log('Zustand form store reset (transitioned).');
    }
  }, [isMounted, providerUrl, resetFormStore]);

  const addOption = () => {
    if (fields.length < 5) {
      append({ name: '', index: fields.length });
    }
  };

  const removeOption = (index: number) => {
    remove(index);
  };

  const toggleAll = () => {
    const newValue = !areAllSelected;
    setValue('ethHolding', newValue);
    setValue('poapsEnabled', newValue);
    setValue('zupassEnabled', newValue);
    // setValue('protocolGuildMemberEnabled', newValue);
    setValue('gitcoinPassport', newValue);
    // setValue('ethSoloStaker', newValue);
    setValue('whitelistedAddressesEnabled', newValue);
  };

  const handleBack = () => {
    resetFormStore();
    router.push('/');
  };

  const contractPollCreation = async (pollType: number) => {
    try {
      if (!isConnected) {
        console.error('Wallet not connected for on-chain poll');
        toast({
          title: 'Error',
          description: 'Wallet not connected for on-chain poll',
          variant: 'destructive',
        });
        connect({ connector: injected() });
        return undefined;
      }

      const formData = getValues();
      const optionNames = formData.options.map((option) => option.name);
      const pollMetadata = 'arbitrary data';

      const endDate = formData.endDateTime
        ? new Date(String(formData.endDateTime))
        : new Date();
      const durationInSeconds = Math.round(
        (endDate.getTime() - Date.now()) / 1000
      );
      const start_block_number = await getLatestBlockNumber();
      const averageBlockTimeS = 12;
      const estimatedBlocks = durationInSeconds / averageBlockTimeS;
      const end_block_number =
        start_block_number! + Math.round(estimatedBlocks);

      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: VotingContract.abi,
        functionName: 'createPoll',
        args: [
          formData.motionTitle,
          formData.motionDescription || '',
          durationInSeconds,
          optionNames,
          pollType,
          pollMetadata,
          end_block_number,
        ],
      });

      const receipt = await waitForTransactionReceipt(config, { hash });

      if (receipt.status === 'success') {
        toast({
          title: 'On-chain poll created successfully, please wait',
        });

        const pollsData = await readContract(config, {
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: VotingContract.abi,
          functionName: 'getAllPolls',
        });

        if (pollsData && Array.isArray(pollsData)) {
          const contractPollIndex = (pollsData as any[]).length - 1;
          return contractPollIndex;
        } else {
          throw new Error('Can not get polls data');
        }
      } else {
        throw new Error('transaction failed');
      }
    } catch (error: any) {
      console.error('Error creating on-chain poll:', error);
      setIsLoading(false);
      toast({
        title: 'Error Creating On-Chain Poll',
        description:
          error.message ||
          'An unknown error occurred during contract interaction.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const endDate = new Date(String(data.endDateTime));
      const durationInSeconds = Math.round(
        (endDate.getTime() - Date.now()) / 1000
      );
      const currentSeconds = Date.now() / 1000 + 60; // time now plus 1 minute

      if (endDate.getTime() / 1000 < currentSeconds) {
        toast({
          title: 'Error',
          description: 'The end time cannot be earlier than the current time.',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      let credentialsTable: string[] = [];
      let indexTable: number[] = [];

      if (
        data.ethHolding &&
        data.selectedEthHoldingOption.includes('on-chain')
        // (data.protocolGuildMemberEnabled &&
        //   data.selectedProtocolGuildOption === 'on-chain')
      ) {
        if (!isConnected) {
          console.error('Wallet not connected for on-chain poll');
          toast({
            title: 'Error',
            description:
              'You need to connect your Wallet to create on-chain polls. Please connect and try again.',
            variant: 'destructive',
          });
          setIsLoading(false);
          connect({ connector: injected() });
          return;
        }
        if (!pollContract) {
          console.error('Contract not initialized before onSubmit check');
          toast({
            title: 'Error',
            description:
              'Contract connection not ready. Please wait a moment and try again.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
      }

      if (data.ethHolding) {
        if (data.selectedEthHoldingOption.includes('on-chain')) {
          const contractPollIndexEth = await contractPollCreation(0);
          if (contractPollIndexEth) {
            indexTable.push(contractPollIndexEth);
          }
        }
        if (data.selectedEthHoldingOption.includes('off-chain')) {
          credentialsTable.push(CREDENTIALS.EthHoldingOffchain.id);
        }
      }

      // if (data.protocolGuildMemberEnabled) {
      //   if (data.selectedProtocolGuildOption === 'on-chain') {
      //     const contractPollIndexPro = await contractPollCreation(1);
      //     if (contractPollIndexPro) {
      //       indexTable.push(contractPollIndexPro);
      //     }
      //   } else {
      //     credentialsTable.push(CREDENTIALS.ProtocolGuildMember.id);
      //   }
      // }

      if (data.poapsEnabled) {
        if (selectedPOAPEvents.length === 0) {
          toast({
            title: 'Error',
            description: 'Please select at least one POAP event.',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }
        credentialsTable.push(CREDENTIALS.POAPapi.id);
      }

      if (data.zupassEnabled) {
        if (data.zupassCredential.includes('Zuzalu')) {
          credentialsTable.push(CREDENTIALS.ZuzaluResident.id);
        }
        if (data.zupassCredential.includes('Zuconnect')) {
          credentialsTable.push(CREDENTIALS.ZuConnectResident.id);
        }
        if (data.zupassCredential.includes('Devconnect')) {
          credentialsTable.push(CREDENTIALS.DevConnect.id);
        }
      }

      if (data.gitcoinPassport) {
        credentialsTable.push(CREDENTIALS.GitcoinPassport.id);
      }
      let whiteList: string[] = [];
      if (data.whitelistedAddressesEnabled) {
        whiteList = data.whitelistedAddresses
          ? data.whitelistedAddresses
              .split(',')
              .map((addr) => addr.trim())
              .filter(Boolean)
          : [];
      }

      // if (data.ethSoloStaker) {
      //   credentialsTable.push(CREDENTIALS.EthSoloStaker.id);
      // }

      const pollData = {
        title: data.motionTitle,
        description: data.motionDescription || '',
        time_limit: durationInSeconds,
        options: data.options.map((option, index) => ({
          option_description: option.name,
          option_index: index,
        })),
        categories: data.categories,
        credentials: credentialsTable,
        poap_events: data.poapsEnabled
          ? selectedPOAPEvents.map((event) => event.id)
          : [],
        poap_number: data.poapsEnabled ? data.POAPNumber : '0',
        gitcoin_score: data.gitcoinPassport ? Number(data.gitcoinScore) : 0,
        contractpoll_index: indexTable,
        white_list: data.whitelistedAddressesEnabled ? whiteList : [],
        tags: data.tags,
      };

      console.log('Submitting poll data:', pollData);
      const response = await createPoll(pollData);
      console.log('Poll creation response:', response);

      toast({
        title: 'Poll created successfully',
      });
      resetFormStore();
      setTimeout(() => {
        router.push('/').then(() => window.location.reload());
      }, 1000);
    } catch (error) {
      console.error('Error during poll submission process:', error);
      if (
        !(
          error instanceof Error &&
          error.message.includes('contract interaction')
        )
      ) {
        toast({
          title: 'Poll Submission Error',
          description:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred.',
          variant: 'destructive',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    errors,
    fields,
    ethHolding,
    poapsEnabled,
    zupassEnabled,
    // protocolGuildMemberEnabled,
    gitcoinPassport,
    // ethSoloStaker,
    whitelistedAddressesEnabled,
    whitelistedAddresses,
    endDateTime,
    zupassCredential,
    selectedEthHoldingOption,
    // selectedProtocolGuildOption,
    areAllSelected,
    addOption,
    removeOption,
    toggleAll,
    onSubmit,
    handleBack,
    isLoading,
    contractPollCreation,
  };
};
