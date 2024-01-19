'use client'
require('dotenv').config();
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import { useQuery } from 'react-query';
import { fetchAllPolls as fetchAllPollsFromAPI } from '@/controllers/poll.controller';
import { Label } from '@/components/ui/Label';
import { useUserPassportContext } from '../context/PassportContext';
//import { mockpolls } from '@/constant/mockPolls';
import { PollType } from '@/types';
import { PollCardTemplate } from '@/components/templates/PollCard';
import Button from '@/components/ui/buttons/Button';
import { PlusCirceIcon } from '@/components/icons';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
//import VotingContract from './../carbonvote-contracts/artifacts/contracts/VoteContract.sol/VotingContract.json';
import VotingContract from './../carbonvote-contracts/deployment/contracts/VoteContract.sol/VotingContract.json';
//import { contract_addresses } from './../carbonvote-contracts/artifacts/deployedAddresses.json';
import { toast } from '@/components/ui/use-toast';
import Spinner from '@/components/ui/Spinner';
interface Poll {
  name: string;
  title: string;
  description: string;
  options: string[];
  endTime: number;
  pollType: string;
  pollMetadata: string;
  votingMethod: string;
  time_limit: number;
  startTime: number;
  id: string;
}

export default function Home() {
  const router = useRouter();
  const { signIn, isPassportConnected } = useUserPassportContext();
  const contractAbi = VotingContract.abi;
  //const contractAddress = contract_addresses.VotingContract;


  const contractAddress = "0x5092F0161B330A7B2128Fa39a93b10ff32c0AE3e";


  const fetchPollsFromContract = async () => {
    /*let provider;
    console.log(process.env.PROVIDER as string, 'process env');
    if (process.env.PROVIDER == "mainnet") { provider = ethers.getDefaultProvider("mainnet"); }
    if (process.env.PROVIDER == "sepolia") { provider = ethers.getDefaultProvider("sepolia"); }
    if (process.env.PROVIDER == "testnet") { console.log('testnet'); provider = ethers.getDefaultProvider("http://localhost:8545/"); }*/
    //const signer = await provider.getSigner();
    //let SEPOLIA_RPC_URL = process.env.SEPOLIA_API_URL;
    //if (SEPOLIA_RPC_URL) { console.log(SEPOLIA_RPC_URL, 'sepolia url'); }
    const provider = new ethers.JsonRpcProvider('https://sepolia.infura.io/v3/01371fc4052946bd832c20ca12496243');
    //let provider = ethers.getDefaultProvider("sepolia");
    const contract = new ethers.Contract(contractAddress, contractAbi, provider);
    console.log(contract, provider, 'provider');
    const { names, descriptions, options, endTimes, pollTypes, pollMetadatas, startTimes } = await contract.getAllPolls();
    const polls = names.map((name: any, index: string | number) => {
      const pollType = pollTypes[index];
      const votingMethod = pollType.toString() == '0' ? 'EthHolding' : 'HeadCounting';
      return {
        name,
        id: index, //add id for ethholding polls so there will not have redirection problems
        description: descriptions[index],
        options: options[index],
        endTime: Number(endTimes[index]) * 1000,
        pollType,
        pollMetadata: pollMetadatas[index],
        votingMethod,
        startTime: Number(startTimes[index]) * 1000,
      };
    });
    return polls;
  };

  const fetchPolls = async () => {
    const pollsFromContract = await fetchPollsFromContract();
    const { data: pollsFromAPI } = await fetchAllPollsFromAPI();
    // TODO: Improve sorting to show most relevant Polls first
    // Combine and sort the polls based on endTime
    return [...pollsFromContract, ...pollsFromAPI].sort((a, b) => {
      return b.startTime - a.startTime;
    });
  };

  // TODO: Order 
  const { data: polls, isLoading, error } = useQuery('polls', fetchPolls);

  const handleCreatePoll = () => {
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
                votingMethod={poll.votingMethod}
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