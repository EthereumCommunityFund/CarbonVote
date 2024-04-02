import { useEffect, useState } from 'react';
import CountdownTimer from '../ui/CountDownTimer';
import { Label } from '../ui/Label';
import { useRouter } from 'next/router';
import { useUserPassportContext } from '@/context/PassportContext';
import styles from "styles/pollCard.module.css"

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
  poll: any;
  endTime: number;
}

export const PollCardTemplate = ({ id, title, topic, subTopic, description, options, polltype, pollMetadata, poll, startTime, endTime }: IPollCard) => {
  const router = useRouter();
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
    <div className={styles.poll_card} onClick={handleClickItem}>
      <div className={styles.status_countdown_flex}>
        <div className={`${isLive ? 'bg-[#44b678]' : 'bg-red-500'} bg-opacity-20 px-2.5 py-1 rounded-lg`}>
          <Label className={`${isLive ? 'text-[#44b678]' : 'text-red-500'}`}>
            {isLive ? 'Live' : 'Closed'}
          </Label>
        </div>
        {/* <!-- Time Remaining (Shown only if Live) --> */}
        {isLive && (
          <div className={styles.countdown}>
            <img src='/images/clock.svg' className={styles.countdown_icon} />
            <CountdownTimer endTime={endTime} />
          </div>
        )}
      </div>
      {/* <!-- Header with Title and Live/Closed Status --> */}
      <div className="flex justify-between">
        <Label className="text-xl font-bold">{title}
        </Label>

      </div>

      {/* <!-- Description --> */}
      <span dangerouslySetInnerHTML={{ __html: removeImageTags(shortDescription) }} />
    </div>
  );
};