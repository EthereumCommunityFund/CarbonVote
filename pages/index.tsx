'use client';
require('dotenv').config();
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { fetchAllPolls as fetchAllPollsFromAPI } from '@/controllers/poll.controller';
import { Label } from '@/components/ui/Label';
import { useUserPassportContext } from '../context/PassportContext';
import { PollCardTemplate } from '@/components/templates/PollCard';
import Button from '@/components/ui/buttons/Button';
import { PlusCirceIcon } from '@/components/icons';
import { Loader } from '@/components/ui/Loader';
import { ethers } from 'ethers';
import VotingContract from './../carbonvote-contracts/deployment/contracts/VoteContract.sol/VotingContract.json';
import { getProviderUrl } from '@/utils/getProviderUrl';
import { CONTRACT_ADDRESS } from '@/src/constants';
interface Poll {
  name: string;
  title: string;
  description: string;
  options: string[];
  endTime: number;
  pollType: string;
  pollMetadata: string;
  time_limit: number;
  startTime: number;
  id: string;
  contractpoll_index?: number[];
}

export default function Home() {
  const router = useRouter();
  const { signIn, isPassportConnected } = useUserPassportContext();
  const contractAbi = VotingContract.abi;
  //const contractAddress = contract_addresses.VotingContract;


  const fetchPollsFromContract = async () => {
    const providerUrl = getProviderUrl();
    const provider = new ethers.JsonRpcProvider(providerUrl);
    const contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      contractAbi,
      provider
    );
    const {
      names,
      descriptions,
      options,
      endTimes,
      pollTypes,
      pollMetadatas,
      startTimes,
    } = await contract.getAllPolls();
    const polls = names.map((name: any, index: string | number) => {
      const pollType = pollTypes[index];
      return {
        name,
        id: String(index), //add id for ethholding polls so there will not have redirection problems
        description: descriptions[index],
        options: options[index],
        endTime: Number(endTimes[index]) * 1000,
        pollType,
        pollMetadata: pollMetadatas[index],
        startTime: Number(startTimes[index]) * 1000,
      };
    });
    return polls;
  };

  const fetchPolls = async () => {
    const pollsFromContract = await fetchPollsFromContract();
    const { data: pollsFromAPI } = await fetchAllPollsFromAPI();
    const indexesFromAPI = pollsFromAPI.flatMap(
      (poll: Poll) => poll.contractpoll_index || []
    );
    const allNull = indexesFromAPI.every(
      (index: number | null) => index === null
    );

    if (!allNull) {
      const indexesFromAPIAsString = indexesFromAPI.map(
        (index: number) => index?.toString() || ''
      );
      const filteredPollsFromContract = pollsFromContract.filter(
        (poll: Poll) => !indexesFromAPIAsString.includes(poll.id)
      );

      return [...filteredPollsFromContract, ...pollsFromAPI].sort(
        (a: Poll, b: Poll) => {
          return b.startTime - a.startTime;
        }
      );
    } else {
      return pollsFromAPI.sort((a: Poll, b: Poll) => {
        return b.startTime - a.startTime;
      });
    }
  };
  // TODO: Order
  const { data: polls, isLoading, error } = useQuery('polls', fetchPolls);

  const handleCreatePoll = () => {
    router.push(`/create`);
  };

  return (
    <div className="flex flex-col p-5 gap-2.5 text-black">
      <div className="flex gap-3 pt-5 px-5 bg-gradient-to-r from-red-400 to-white rounded-lg justify-center">
        <div className="flex flex-col gap-2.5 py-10 font-share-tech-monorounded-lg lg:w-2/3">
          <Label className="text-[39px]">Carbonvote 2 - Beta</Label>
          <Label className="lg:text-[69px] md:text-[59px]">
            Empowering Consensus for a Sustainable Future.
          </Label>
        </div>
      </div>
      <div className="px-[273px] flex flex-col gap-[30px]">
        <div className="flex justify-end">
          <Button
            className="rounded-full"
            leftIcon={PlusCirceIcon}
            onClick={handleCreatePoll}
          >
            Create a Poll
          </Button>
        </div>
        {isLoading && (
          <div className="flex justify-center items-center h-full">
            <Loader />
          </div>
        )}
        <div className="flex flex-col gap-2.5 h-[250px]">
          {polls?.map((poll: Poll, index: number) => {
            return (
              <PollCardTemplate
                key={index}
                id={poll.id}
                title={poll.name || poll.title}
                creator={'Creator Name'}
                description={poll.description}
                options={poll.options}
                pollMetadata={poll.pollMetadata}
                startTime={poll.startTime}
                endTime={poll.endTime}
                topic={''}
                subTopic={''}
                polltype={poll.pollType}
                poll={poll}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
