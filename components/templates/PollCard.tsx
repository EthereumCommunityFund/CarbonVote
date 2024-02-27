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
  polltype: any;
  pollMetadata: string;
  votingMethod: string;
  poll: any;
  endTime: number;
}

export const PollCardTemplate = ({ id, title, topic, subTopic, description, options, votingMethod, polltype, pollMetadata, poll, startTime, endTime }: IPollCard) => {
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
    /*if (votingMethod === 'EthHolding' || (polltype && polltype.toString() == '1')) {
      path = '/contract-poll';
    }*/
    const pollId = id;
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
  const cleanDescription = removeImageTags(description);

  const shortDescription = cleanDescription.length > 200 ? cleanDescription.substring(0, 200) + '...' : cleanDescription;

  return (
    <div className="bg-white rounded-lg p-3 hover:cursor-pointer w-full flex flex-col justify-between" onClick={handleClickItem}>
      {/* <!-- Header with Title and Live/Closed Status --> */}
      <div className="flex justify-between">
        <Label className="text-xl font-bold">{title}
        </Label>
        <div className={`${isLive ? 'bg-[#96ecbd]' : 'bg-[#F8F8F8]'} px-2.5 py-1 rounded-lg`}>
          <Label className={`${isLive ? 'text-[#44b678]' : 'text-[#656565]'}`}>
            {isLive ? 'Live' : 'Closed'}
          </Label>
        </div>
      </div>

      <span className="text-xs" style={{ color: votingMethod === 'EthHolding' ? "orange" : "blue" }}>{votingMethod === 'headCount' ? 'HEADCOUNTING' : votingMethod.toUpperCase()}</span>

      {/* <!-- Description --> */}
      <span dangerouslySetInnerHTML={{ __html: removeImageTags(shortDescription) }} />


      {/* <!-- Time Remaining (Shown only if Live) --> */}
      {isLive && (
        <div className="flex items-center gap-3.5 mt-3 text-gray-500">
          <ClockIcon />
          <CountdownTimer endTime={endTime} />
        </div>
      )}
    </div>

  );
};