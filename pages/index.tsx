'use client';
require('dotenv').config();
import { useState } from "react"
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
import styles from "styles/pollList.module.css"
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

interface Item {
  id: number;
  name: string;
  type: string;
  category: string;
}

const data: Item[] = [
  { id: 1, name: 'Item 1', type: 'Type A', category: 'Category 1' },
  { id: 2, name: 'Item 2', type: 'Type B', category: 'Category 2' },
  { id: 3, name: 'Item 3', type: 'Type A', category: 'Category 1' },
  { id: 4, name: 'Item 4', type: 'Type C', category: 'Category 2' },
  { id: 5, name: 'Item 5', type: 'Type B', category: 'Category 1' },
];

const filterTypes: string[] = ['View All', 'Type A', 'Type B', 'Type C'];
const filterCategories: string[] = ['View All', 'Category 1', 'Category 2'];

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
  console.log(polls)
  const handleCreatePoll = () => {
    router.push(`/create`);
  };

  const [selectedType, setSelectedType] = useState<string>('View All');
  const [selectedCategory, setSelectedCategory] = useState<string>('View All');
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    filterItems(value, selectedCategory);
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    filterItems(selectedType, value);
  };

  const filterItems = (type: string, category: string) => {
    const filtered = data.filter(item => {
      if (type !== 'View All' && category !== 'View All') {
        return item.type === type && item.category === category;
      } else if (type !== 'View All') {
        return item.type === type;
      } else if (category !== 'View All') {
        return item.category === category;
      }
      return true;
    });
    setFilteredItems(filtered);
  };

  return (
    <div className={styles.body_bg}>
      <div className="flex gap-3 p-10 bg-gradient-to-r from-[#FF7373] to-[#FFE2E2] rounded-[20px] justify-center">
        <div className="flex flex-col gap-2.5 py-10 font-share-tech-mono rounded-lg lg:w-2/3">
          <Label className="text-[39px]">Carbonvote V 2.0</Label>
          <Label className="lg:text-[69px] md:text-[59px]">
            Empowering Consensus for a Sustainable Future.
          </Label>
        </div>
      </div>
      <div className="px-[273px] flex flex-col gap-[30px]">
        <div className={styles.filter_create_flex}>
          <div className={styles.filter_dropdowns}>
            {/* <select value={selectedType} onChange={e => handleTypeChange(e.target.value)}>
              {filterTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
            </select> */}
            {/* <select value={selectedCategory} onChange={e => handleCategoryChange(e.target.value)}>
              {filterCategories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select> */}
          </div>
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
    </div >
  );
}
