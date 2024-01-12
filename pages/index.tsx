import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { fetchAllPolls as fetchAllPollsFromAPI } from '@/controllers/poll.controller';
import { Label } from '@/components/ui/Label';
import { useUserPassportContext } from '../context/PassportContext';
import { mockpolls } from '@/constant/mockPolls';
import { PollType } from '@/types';
import { PollCardTemplate } from '@/components/templates/PollCard';
import Button from '@/components/ui/buttons/Button';
import { PlusCirceIcon } from '@/components/icons';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import VotingContract from './../carbonvote-contracts/artifacts/contracts/VoteContract.sol/VotingContract.json';
import { contract_addresses } from './../carbonvote-contracts/artifacts/deployedAddresses.json';
import { toast } from '@/components/ui/use-toast';
import Spinner from '@/components/ui/Spinner';

interface Poll {
  name: string;
  title: string;
  description: string;
  options: string[];
  endTime: number;
  pollType: number;
  pollMetadata: string;
  votingMethod: string;
  time_limit: number;
}

export default function Home() {
  const router = useRouter();
  const { signIn, isPassportConnected } = useUserPassportContext();
  const contractAbi = VotingContract.abi;
  const contractAddress = contract_addresses.VotingContract;
  //const contractAddress = "0x12B4b94e5d5D0a2433851f9B423CC0B5a4C71DEa";

  const fetchPollsFromContract = async () => {
    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      const { names, descriptions, options, endTimes, pollTypes, pollMetadatas } = await contract.getAllPolls();
      return names.map((name: any, index: string | number) => ({
        name,
        description: descriptions[index],
        options: options[index],
        endTime: endTimes[index],
        pollType: pollTypes[index],
        pollMetadata: pollMetadatas[index],
        votingMethod: 'ethholding',
      }));
    }
    return [];
  };
  const fetchPolls = async () => {
    const pollsFromContract = await fetchPollsFromContract();
    const { data: pollsFromAPI } = await fetchAllPollsFromAPI();
    return [...pollsFromContract, ...pollsFromAPI];
  };

  const { data: polls, isLoading, error } = useQuery('polls', fetchPolls);

  const handleCreatePoll = () => {
    if (!isPassportConnected) {
      try {
        signIn();
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Error connecting to Passport. Please try again.',
          variant: 'destructive',
        });
      }
      return;
    }
    router.push(`/create`);
  };

  return (
    <div className="flex flex-col p-5 gap-2.5 text-black">
      <div className="flex gap-3 pt-5 px-5 bg-gradient-to-r from-red-400 to-white rounded-lg justify-center">
        <div className="flex flex-col gap-2.5 py-10 font-share-tech-mono lg:w-2/3">
          <Label className="text-[39px]">Carbonvote V 2.0</Label>
          <Label className="lg:text-[69px] md:text-[59px]">Empowering Consensus for a Sustainable Future.</Label>
        </div>
      </div>
      <div className="px-[273px] flex flex-col gap-[30px]">
        {isLoading ? <Spinner /> : <></>}
        <div className="flex justify-end">
          <Button className="rounded-full" leftIcon={PlusCirceIcon} onClick={handleCreatePoll}>
            Create a Poll
          </Button>
        </div>
        <div className="flex flex-col gap-2.5 h-[250px]">
          {polls?.map((poll: Poll, index: number) => {
            return (
              <PollCardTemplate
                key={index}
                id={`${index}`}
                title={poll.name || poll.title}
                creator={'Creator Name'}
                description={poll.description}
                endTime={new Date(Number(poll.endTime) * 1000)}
                isLive={Date.now() < Number(poll.endTime) * 1000}
                options={poll.options}
                pollMetadata={poll.pollMetadata}
                startDate={''}
                topic={''}
                subTopic={''}
                isZuPassRequired={true}
                votingMethod={poll.votingMethod || poll.votingMethod}
                poll={poll}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
