import React, { useState, useEffect } from 'react';
import { ethers, Contract, Signer } from 'ethers';
import { contractAbi, contractAddress } from '@/constant/constants';
import { StopCircleIcon, ThumbDownIcon, ThumbUpIcon } from '@/components/icons';
import Button from '@/components/ui/buttons/Button';
import HtmlString from '@/components/ui/Html';
import { Label } from '@/components/ui/Label';
import { PollType } from '@/types';
declare global {
  interface Window {
    ethereum?: ethers.providers.ExternalProvider & {
      on?: (...args: any[]) => void;
      removeListener?: (...args: any[]) => void;
    };
  }
}

const PollPage = () => {
  const [hasVoted, setHasVoted] = useState(false);
  const [voteOption, setVoteOption] = useState('');
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractInstance = new ethers.Contract(contractAddress, contractAbi, signer);
        setContract(contractInstance);

        // Call the function to check if the user has voted
        await checkIfUserHasVoted(signer);
      }
    };

    init();
  }, []);

  const checkIfUserHasVoted = async (signer: Signer) => {
    try {
      const address = await signer.getAddress();
      // Ensure contract is not null before using it
      if (contract) {
        const hasVoted = await contract.voters(address);
        setHasVoted(hasVoted);
      }
    } catch (error) {
      console.error('Error checking voting status:', error);
    }
  };

  const castVote = async (voteType: string) => {
    try {
      // Ensure contract is not null before using it
      if (contract) {
        const voteYes = voteType === 'yes';
        const abstain = voteType === 'abstain';
        const tx = await contract.castVote(voteYes, abstain);
        await tx.wait();
        setHasVoted(true);
        setVoteOption(voteType);
      } else {
        console.error('Contract not initialized');
      }
    } catch (error) {
      console.error('Error casting vote:', error);
    }
  };

  const mockPoll: PollType = {
    id: '3333',
    name: 'Poll Name',
    creator: 'QJ',
    title: 'The ice age should not be extended without at least some decrease in block rewards.',
    description: 'Description',
    startDate: '23423',
    endDate: '23423',
    isLive: true,
  };

  // ... Rest of the component

  return (
    <div className="px-36 py-20 bg-itemBgPrimary flex flex-col text-white">
      {/* ... Rest of the UI code */}
      <div className="p-5 flex flex-col gap-2.5">
        <div className="flex gap-2.5 w-full justify-between">
          <Button className="w-full justify-center rounded-2xl" leftIcon={ThumbUpIcon} onClick={() => castVote('yes')} disabled={hasVoted}>
            Yes
          </Button>
          <Button className="w-full justify-center rounded-2xl" leftIcon={ThumbDownIcon} onClick={() => castVote('no')} disabled={hasVoted}>
            No
          </Button>
        </div>
        <div className="flex justify-center w-full">
          <Label className="w-full text-center">OR</Label>
        </div>
        <div>
          <Button className="w-full justify-center rounded-2xl" leftIcon={StopCircleIcon} onClick={() => castVote('abstain')} disabled={hasVoted}>
            Abstain
          </Button>
        </div>
      </div>
      {/* Show the voting option selected */}
      {hasVoted && <p>You have voted: {voteOption.toUpperCase()}</p>}
    </div>
  );
};

export default PollPage;
