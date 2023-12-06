import { useRouter } from 'next/router';

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

interface Poll {
  name: string;
  description: string;
  options: string[];
  endTime: number;
  pollType: number;
  pollMetadata: string;
}

export default function Home() {
  const router = useRouter();
  const pollList: PollType[] = mockpolls;
  const [polls, setPolls] = useState<Poll[]>([]);
  const contractAbi = VotingContract.abi;
  const contractAddress = contract_addresses.VotingContract;

  useEffect(() => {
    const fetchPolls = async () => {
      if (window.ethereum) {
        let provider = new ethers.BrowserProvider(window.ethereum as any);
        let signer = await provider.getSigner();

        const contract = new ethers.Contract(contractAddress, contractAbi, signer);

        try {
          // Get all polls at once
          const { names, descriptions, options, endTimes, pollTypes, pollMetadatas } = await contract.getAllPolls();
          const pollsData = names.map((name: any, index: string | number) => ({
            name: name,
            description: descriptions[index],
            options: options[index],
            endTime: endTimes[index],
            pollType: pollTypes[index],
            pollMetadata: pollMetadatas[index],
          }));
          console.log(
            VotingContract.abi
            // await contract.
          );
          console.log(contract);
          // const pollsData = await contract.getAllPolls();
          console.log(pollsData, 'pollsData');
          setPolls(pollsData);
        } catch (error) {
          console.error('Error fetching polls:', error);
        }
      }
    };

    fetchPolls();
    console.log(polls, 'polls');
  }, []);

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
        <div className="flex justify-end">
          <Button className="rounded-full" leftIcon={PlusCirceIcon} onClick={handleCreatePoll}>
            Create a Poll
          </Button>
        </div>
        <div className="flex flex-col gap-2.5 h-[250px] overflow-y-auto">
          {polls.map((poll, index) => {
            return (
              <PollCardTemplate
                key={index}
                id={`${index}`} // Assuming you don't have a unique ID, you can use the index or a better unique identifier
                title={poll.name}
                creator={'Creator Name'} // Replace with actual creator if available
                description={poll.description}
                endDate={new Date(Number(poll.endTime) * 1000)}
                isLive={Date.now() < Number(poll.endTime) * 1000}
                options={poll.options}
                pollMetadata={poll.pollMetadata}
                startDate={''}
                topic={''}
                subTopic={''}
                isZuPassRequired={false}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
