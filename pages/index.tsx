'use client';
require('dotenv').config();
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
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
import { CONTRACT_ADDRESS, IS_PROD } from '@/src/constants';
import styles from 'styles/pollList.module.css';
import { priorityPollIds } from '@/utils';
import { POLL_CATEGORIES } from '@/components/create/constant';
import { getCategoryLabel } from '@/utils/category';
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
  categories: string[];
  credentials?: {
    id: string;
    credential_name: string;
    credential_detail: string | null;
  }[];
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

export default function Home() {
  const router = useRouter();
  const { signIn, isPassportConnected } = useUserPassportContext();
  const contractAbi = VotingContract.abi;

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
        categories: [],
      };
    });
    return polls;
  };

  const [filterCategories, setFilterCategories] = useState<string[]>([
    'View All',
  ]);

  const fetchPolls = async () => {
    const now = new Date();
    const pollsFromContract = await fetchPollsFromContract();
    const { data: pollsFromAPI } = await fetchAllPollsFromAPI();
    const indexesFromAPI = pollsFromAPI.flatMap(
      (poll: Poll) => poll.contractpoll_index || []
    );
    const allNull = indexesFromAPI.every(
      (index: number | null) => index === null
    );

    let combinedPolls;
    if (!allNull) {
      const indexesFromAPIAsString = indexesFromAPI.map(
        (index: number) => index?.toString() || ''
      );
      const filteredPollsFromContract = pollsFromContract.filter(
        (poll: Poll) => !indexesFromAPIAsString.includes(poll.id)
      );

      combinedPolls = [...filteredPollsFromContract, ...pollsFromAPI];
    } else {
      combinedPolls = pollsFromAPI;
    }

    const allCategories = pollsFromAPI
      .flatMap((poll: Poll) => poll.categories || [])
      .filter(Boolean) as string[];

    const uniqueCategories = Array.from(new Set(allCategories)) as string[];
    setFilterCategories(['View All', ...uniqueCategories]);

    return combinedPolls.sort((a: Poll, b: Poll) => {
      const now = Date.now();
      const isALive = a.endTime > now;
      const isBLive = b.endTime > now;

      if (isALive && !isBLive) return -1;
      if (!isALive && isBLive) return 1;

      if (priorityPollIds.includes(a.id) && !priorityPollIds.includes(b.id)) {
        return -1;
      }
      if (!priorityPollIds.includes(a.id) && priorityPollIds.includes(b.id)) {
        return 1;
      }
      if (priorityPollIds.includes(a.id) && priorityPollIds.includes(b.id)) {
        return priorityPollIds.indexOf(a.id) - priorityPollIds.indexOf(b.id);
      }

      return b.startTime - a.startTime;
    });
  };

  // TODO: Order
  const {
    data: polls,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['polls'],
    queryFn: fetchPolls,
  });

  const [filteredPolls, setFilteredPolls] = useState<Poll[]>([]);

  useEffect(() => {
    if (polls) {
      setFilteredPolls(polls);
    }
  }, [polls]);

  const handleCreatePoll = () => {
    router.push(`/create`);
  };

  const [selectedType, setSelectedType] = useState<string>('View All');
  const [selectedCategory, setSelectedCategory] = useState<string>('View All');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [filteredItems, setFilteredItems] = useState<Item[]>([]);

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    filterItems(value, selectedCategory);
  };

  const handleCategoryChange = (value: string) => {
    if (value !== 'View All' && !selectedCategories.includes(value)) {
      const newSelectedCategories = [...selectedCategories, value];
      setSelectedCategories(newSelectedCategories);
      filterPolls(newSelectedCategories);
    }
    setSelectedCategory('View All');
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    const newSelectedCategories = selectedCategories.filter(
      (category) => category !== categoryToRemove
    );
    setSelectedCategories(newSelectedCategories);
    filterPolls(newSelectedCategories);
  };

  const filterPolls = (categories: string[]) => {
    if (!polls) return;

    if (categories.length === 0) {
      setFilteredPolls(polls);
      return;
    }

    const filtered = polls.filter((poll) => {
      if (!poll.categories || poll.categories.length === 0) return false;
      return categories.some((category) => poll.categories.includes(category));
    });

    setFilteredPolls(filtered);
  };

  const filterItems = (
    type: string,
    category: string,
    categories: string[] = selectedCategories
  ) => {
    const filtered = data.filter((item) => {
      if (type !== 'View All' && categories.length > 0) {
        return item.type === type && categories.includes(item.category);
      } else if (type !== 'View All') {
        return item.type === type;
      } else if (categories.length > 0) {
        return categories.includes(item.category);
      }
      return true;
    });
    setFilteredItems(filtered);
  };

  return (
    <div className="flex flex-col items-center pb-[20px]">
      <div className="flex p-10 sm:p-[35px] bg-main-gradient rounded-[20px] font-share-tech-mono justify-center mx-2 sm:mx-[10px]] md:mx-[20px] lg:min-w-[95%] max-w-full mt-[27px]">
        <div className="flex flex-col justify-center font-share-tech-monorounded-lg gap-[14px] md:gap-[10px]">
          <Label className="text-[24px] md:text-[29px] lg:text-[39px] lg:max-w-[906px] leading-[1.2]">
            Carbonvote 2
          </Label>
          <Label className="text-[39px] md:text-[49px] lg:text-[69px] lg:max-w-[906px] leading-[1.2]">
            Empowering Consensus for a Sustainable Future.
          </Label>
        </div>
      </div>
      <div className={`flex flex-col px-[10px] max-w-[872px] mx-auto`}>
        <div className="flex flex-col gap-[30px] w-full">
          <div className={`${styles.filter_create_flex} gap-[30px] w-full`}>
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-[118px] h-[40px] rounded-[10px] opacity-70 pt-[10px] pr-[14px] pb-[10px] pl-[14px] outline-none"
            >
              {filterCategories.map((category, index) => (
                <option key={index} value={category}>
                  {category === 'View All'
                    ? category
                    : getCategoryLabel(category)}
                </option>
              ))}
            </select>
            <Button
              className="rounded-full justify-center md:w-fit"
              leftIcon={<PlusCirceIcon />}
              onClick={handleCreatePoll}
            >
              Create a Poll
            </Button>
          </div>

          {/* Categories Filter Tags */}
          {selectedCategories.length > 0 && (
            <div className="flex flex-col gap-2 w-full">
              <Label className="text-gray-500 font-medium">Categories</Label>
              <div className="flex flex-wrap gap-2 w-full">
                {selectedCategories.map((category, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-[rgba(0,0,0,0.1)] rounded-[60px] h-[27px] pt-[4px] pr-[10px] pb-[4px] pl-[10px] gap-[5px] w-auto"
                  >
                    <span className="font-medium">
                      {getCategoryLabel(category)}
                    </span>
                    <button
                      onClick={() => handleRemoveCategory(category)}
                      className="flex items-center justify-center w-4 h-4 text-xs"
                      aria-label="Remove category"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {isLoading && (
            <div className="flex justify-center items-center h-full">
              <Loader />
            </div>
          )}
          <div className="flex flex-col gap-2.5 w-full pb-[20px]">
            {filteredPolls?.map((poll: Poll, index: number) => {
              return <PollCardTemplate key={index} poll={poll} />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
