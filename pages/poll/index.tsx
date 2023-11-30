import { ArrowLeftIcon, StopCircleIcon, ThumbDownIcon, ThumbUpIcon } from '@/components/icons';
import { ClockIcon } from '@/components/icons/clock';
import Button from '@/components/ui/buttons/Button';
import CheckerButton from '@/components/ui/buttons/CheckerButton';
import CountdownTimer from '@/components/ui/CountDownTimer';
import HtmlString from '@/components/ui/Html';
import { Label } from '@/components/ui/Label';
import { PollType } from '@/types';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { ethers, Contract } from 'ethers';
import { contractAbi, contractAddress } from '@/constant/constants';

const PollPage = () => {
  const router = useRouter();
  const mockPoll: PollType = {
    id: '3333',
    creator: 'QJ',
    title: 'The ice age should not be extended without at least some decrease in block rewards.',
    description: 'Description',
    startDate: '23423',
    endDate: '23423',
    isLive: true,
    topic: 'ZK',
    subTopic: 'ZKML',
    isZuPassRequired: false,
  };

  const handleBack = () => {
    router.push('/');
  };
  const [pollContract, setPollContract] = useState<Contract | null>(null);
  useEffect(() => {
    if (window.ethereum) {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = new ethers.Contract(contractAddress, contractAbi, signer);
      setPollContract(contract);
    }
  }, []);

  return (
    <div className="flex gap-20 px-20 pt-5 text-black w-full justify-center">
      <div className="flex flex-col gap-2.5">
        <div>
          <Button className="rounded-full" leftIcon={ArrowLeftIcon} onClick={handleBack}>
            Back
          </Button>
        </div>
        <div className="bg-white flex flex-col gap-2.5 rounded-2xl p-5 ">
          <div className="flex gap-3.5 pb-3">
            <div className="bg-[#F84A4A20] px-2.5 rounded-lg items-center">{mockPoll.isLive ? <Label className="text-[#F84A4A]">Live</Label> : <Label className="text-white/70">Ended</Label>}</div>
            {mockPoll.isLive ? (
              <div className="flex gap-2">
                <ClockIcon />
                <CountdownTimer targetDate={new Date('2023-12-25T00:00:00')} />
              </div>
            ) : (
              <></>
            )}
          </div>
          <div className="flex flex-col gap-1">
            <Label className="text-black/60 text-lg">Motion: </Label>
            <Label className="text-2xl">{mockPoll.title}</Label>
          </div>
          <div className="flex justify-end pb-5 border-b border-black/30">
            <Label>by: {mockPoll.creator}</Label>
          </div>
          <div className="flex flex-col gap-2.5">
            <Label className="text-black/60 text-lg font-bold">Description: </Label>
            <HtmlString htmlString={mockPoll.description} />
          </div>
        </div>
        <div className="bg-white/40 p-2.5 flex flex-col gap-3.5">
          <Label className="text-2xl">Vote on Poll</Label>
          <Label>
            This vote requires a <Label className="font-bold">zero-value transaction</Label> from your wallet
          </Label>
          <div className="flex flex-col gap-2.5">
            <CheckerButton />
            <CheckerButton />
            <CheckerButton />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-10 w-96">
        <div className="flex flex-col bg-white rounded-xl gap-5">
          <div className="px-2.5 py-5 border-b border-b-black/40 pb-5">
            <Label className="text-2xl">Details</Label>
          </div>
          <div className="flex flex-col gap-2.5 pl-5 pb-5">
            <Label>Voting Method: {mockPoll.creator}</Label>
            <Label>Start Date: {mockPoll.startDate as string}</Label>
            <Label>End Date: {mockPoll.endDate as string}</Label>
            <Label>Requirements: {mockPoll.startDate as string}</Label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PollPage;
