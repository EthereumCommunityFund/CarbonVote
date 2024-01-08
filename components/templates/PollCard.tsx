import { useEffect } from 'react';
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
  startDate: string | Date;
  endTime: string | Date;
  isLive: boolean;
  creator: string;
  topic: string;
  subTopic: string;
  isZuPassRequired: boolean;
  description: string;
  options: string[];
  pollMetadata: string;
  votingMethod: string;
  poll: any;
}

export const PollCardTemplate = ({ id, title, startDate, endTime, isLive, topic, subTopic, isZuPassRequired, description, options, votingMethod, pollMetadata, poll }: IPollCard) => {
  const router = useRouter();
  const { signIn, isPassportConnected } = useUserPassportContext();
  const handleClickItem = () => {
    if (!isPassportConnected) {
      signIn();
      return;
    }

    // Define the base path
    let path = '/poll'; // Default path for API polls
    const pollId = votingMethod === 'headCount' ? poll.id : id;
    // Update path if the voting method is 'ethholding' for contract polls
    if (votingMethod === 'ethholding') {
      path = '/contract-poll';
    }

    // Navigate to the appropriate path with the poll ID
    router.push({
      pathname: path,
      query: { id: pollId },
    });
  };

  useEffect(() => {
    console.log(id, 'id');
    console.log(startDate, endTime, 'poll.id');
  }, []);
  return (
    <div className="bg-white flex flex-col justify-between rounded-lg p-3 hover:cursor-pointer w-full gap-3.5" onClick={handleClickItem}>
      <Label className="text-whilte/60">{votingMethod.toLocaleUpperCase()}</Label>
      <Label>{title}</Label>
      <span dangerouslySetInnerHTML={{ __html: description }} />
      <div className="flex gap-3.5">
        {isZuPassRequired ? <LockClosedIcon /> : <LockOpenIcon />}
        <div className={`${isLive ? `bg-[#F84A4A20]` : `bg-[#F8F8F8]`} px-2.5 rounded-lg items-center`}>{isLive ? <Label className="text-[#F84A4A]">Live</Label> : <Label className="text-[#656565]">Closed</Label>}</div>
        {isLive ? (
          <div className="flex flex-2">
            <ClockIcon />
            <CountdownTimer targetDate={new Date(Number(endTime))} />
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};
