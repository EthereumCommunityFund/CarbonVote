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
    <div className="flex flex-col items-center">
      <div className="flex p-10 sm:p-[35px] bg-main-gradient rounded-[20px] font-share-tech-mono justify-center mx-2 sm:mx-[10px]] md:mx-[20px] lg:min-w-[95%] max-w-full mt-[27px]">
        <div className="flex flex-col justify-center font-share-tech-monorounded-lg">
          <Label className="sm:text-[29px] text-[24px] lg:text-[39px] lg:max-w-[906px]">Carbonvote 2</Label>
          <Label className="text-[39px] sm:text-[49px] lg:text-[69px] lg:max-w-[906px]">
            Empowering Consensus for a Sustainable Future.
          </Label>
        </div>
      </div>
      <div className={styles.body_bg}>
        <div className="w-full border-collapse rounded-[10px] border-[#FF6E6E] border-[1px] bg-light-red p-2">
          <div className="flex gap-[10px] items-center">
            <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M18 10.5C18 12.6217 17.1571 14.6566 15.6569 16.1569C14.1566 17.6571 12.1217 18.5 10 18.5C7.87827 18.5 5.84344 17.6571 4.34315 16.1569C2.84285 14.6566 2 12.6217 2 10.5C2 8.37827 2.84285 6.34344 4.34315 4.84315C5.84344 3.34285 7.87827 2.5 10 2.5C12.1217 2.5 14.1566 3.34285 15.6569 4.84315C17.1571 6.34344 18 8.37827 18 10.5ZM11 14.5C11 14.7652 10.8946 15.0196 10.7071 15.2071C10.5196 15.3946 10.2652 15.5 10 15.5C9.73478 15.5 9.48043 15.3946 9.29289 15.2071C9.10536 15.0196 9 14.7652 9 14.5C9 14.2348 9.10536 13.9804 9.29289 13.7929C9.48043 13.6054 9.73478 13.5 10 13.5C10.2652 13.5 10.5196 13.6054 10.7071 13.7929C10.8946 13.9804 11 14.2348 11 14.5ZM10 5.5C9.73478 5.5 9.48043 5.60536 9.29289 5.79289C9.10536 5.98043 9 6.23478 9 6.5V10.5C9 10.7652 9.10536 11.0196 9.29289 11.2071C9.48043 11.3946 9.73478 11.5 10 11.5C10.2652 11.5 10.5196 11.3946 10.7071 11.2071C10.8946 11.0196 11 10.7652 11 10.5V6.5C11 6.23478 10.8946 5.98043 10.7071 5.79289C10.5196 5.60536 10.2652 5.5 10 5.5Z" fill="#F7494A" />
            </svg>

            <span className="font-bold text-[16px] text-[#FF6E6E]">Beta is on Sepolia</span>
          </div>
          <div className="text-[14px] text-[#FF6E6E] mt-[7px]">
            During beta, the app will be using the Sepolia testnet. Please switch your network to Sepolia to test.
          </div>
        </div>
        <div className="flex flex-col gap-[30px]">
          <div className={styles.filter_create_flex}>
            <div className={styles.filter_dropdowns}>
              { /* <select value={selectedType} onChange={e => handleTypeChange(e.target.value)}>
              {filterTypes.map((type, index) => (
                <option key={index} value={type}>
                  {type}
                </option>
              ))}
              </select> */ }

              { /* <select value={selectedCategory} onChange={e => handleCategoryChange(e.target.value)}>
              {filterCategories.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
              </select> */}
            </div>
            <Button
              className="rounded-full w-full justify-center md:w-fit"
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
    </div>
  );
}
