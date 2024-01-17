import { useEffect, useState } from 'react';
import { ClockIcon } from '../icons/clock';
import { LockClosedIcon } from '../icons/lockclosed';
import { LockOpenIcon } from '../icons/lockopen';
import CountdownTimer from '../ui/CountDownTimer';
import { Label } from '../ui/Label';
import { useRouter } from 'next/router';
import { useUserPassportContext } from '@/context/PassportContext';

interface IPollCard {
  id: string;
  title: string;
  startTime: number;
  creator: string;
  topic: string;
  subTopic: string;
  description: string;
  options: string[];
  polltype: string;
  pollMetadata: string;
  votingMethod: string;
  poll: any;
  endTime: number;
}

export const PollCardTemplate = ({ id, title, topic, subTopic, description, options, votingMethod, polltype, pollMetadata, poll, startTime, endTime }: IPollCard) => {

  /*useEffect(() => {
    console.log(id, 'id');
    console.log(poll.id, 'poll.id');
    console.log(polltype, 'poll type');
    console.log(startTime, 'start time');
    console.log(endTime, 'end time');
  }, []);*/
  console.log(endTime);
  const router = useRouter();
  const { signIn, isPassportConnected } = useUserPassportContext();
  const getEndDate = (time: string | bigint | number): Date => {
    if (typeof time === 'string') {
      return new Date(time);
    } else if (typeof time === 'bigint') {
      return new Date(Number(time) * 1000);
    } else {
      return new Date(time);
    }
  };
  const [isLive, setIsLive] = useState(false);
  useEffect(() => {
    const checkIfLive = () => {
      const now = new Date();
      const endDate = getEndDate(endTime);
      setIsLive(endDate > now);
    };
    checkIfLive();
    const interval = setInterval(checkIfLive, 60000);
    return () => clearInterval(interval);
  }, [endTime]);
  const handleClickItem = () => {

    // Define the base path
    let path = '/poll'; // Default path for API polls
    // Update path if the voting method is 'ethholding' for contract polls
    console.log(polltype, 'poll type');
    const biginteth = BigInt(1);
    if (votingMethod === 'EthHolding' || polltype === '1n') {
      path = '/contract-poll';
    }
    const pollId = votingMethod === 'headCount' ? poll.id : id;
    // Navigate to the appropriate path with the poll ID
    router.push({
      pathname: path,
      query: { id: pollId },
    });
  };
  function removeImageTags(text: string) {
    const regex = /<img[^>]*>/g;
    return text.replace(regex, '');
  }
  return (
    <div className="bg-white flex flex-col justify-between rounded-lg p-3 hover:cursor-pointer w-full gap-3.5" onClick={handleClickItem}>
      <Label className="text-whilte/60">{votingMethod.toLocaleUpperCase()}</Label>
      <Label>{title}</Label>
      <span dangerouslySetInnerHTML={{ __html: removeImageTags(description) }} />
      <div className="flex gap-3.5">
        <div className={`${isLive ? `bg-[#96ecbd]` : `bg-[#F8F8F8]`} px-2.5 rounded-lg self-center`}>
          {isLive ? <Label className="text-[#44b678]">Live</Label> : <Label className="text-[#656565]">Closed</Label>}
        </div>
        {isLive && (
          <div className="flex flex-2">
            <ClockIcon />
            <CountdownTimer endTime={endTime} />
          </div>
        )}
      </div>
    </div>
  );
};