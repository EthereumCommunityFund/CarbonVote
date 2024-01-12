import { useEffect, useState } from 'react';
import { ClockIcon } from '../icons/clock';
import { LockClosedIcon } from '../icons/lockclosed';
import { LockOpenIcon } from '../icons/lockopen';
import CountdownTimer from '../ui/CountDownTimer';
import { Label } from '../ui/Label';
import { useRouter } from 'next/router';
import { useUserPassportContext } from '@/context/PassportContext';
import { PollStatusType, PollType, RemainingTime } from '@/types';
import { getPollStatus } from '@/utils';

export const PollCardTemplate = ({ id, title, description, options, votingMethod, created_at, credentials, time_limit }: PollType) => {
  const router = useRouter();
  const { signIn, isPassportConnected } = useUserPassportContext();
  const [isClosed, setIsClosed] = useState<boolean>();
  const [remainingTime, setRemainingTime] = useState<RemainingTime>();
  const handleClickItem = () => {
    if (!isPassportConnected) {
      signIn();
      return;
    }

    // Define the base path
    let path = '/poll'; // Default path for API polls
    const pollId = votingMethod === 'headCount' ? id : id;
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
    const interval = setInterval(() => {
      const pollStatus = getPollStatus({ id, title, description, options, votingMethod, created_at, credentials, time_limit });
      setRemainingTime(pollStatus.remainingTime);
      setIsClosed(pollStatus.closed);
    }, 1000)

    return () => {
      clearInterval(interval);
    };
  }, []);
  return (
    <div className="bg-white flex flex-col justify-between rounded-lg p-3 hover:cursor-pointer w-full gap-3.5" onClick={handleClickItem}>
      <Label className="text-whilte/60">{votingMethod?.toLocaleUpperCase()}</Label>
      <Label>{title}</Label>
      <span dangerouslySetInnerHTML={{ __html: description }} />
      <div className="flex gap-3.5">
        {credentials && credentials[0]?.credential_type === "zupass" ? <LockClosedIcon /> : <LockOpenIcon />}
        <div className={`${!isClosed ? `bg-[#F84A4A20]` : `bg-[#F8F8F8]`} px-2.5 rounded-lg items-center`}>{!isClosed ? <Label className="text-[#F84A4A]">Live</Label> : <Label className="text-[#656565]">Closed</Label>}</div>
        {!isClosed && remainingTime ? (
          <div className="flex flex-2">
            <ClockIcon />
            <CountdownTimer remainingTime={remainingTime} />
          </div>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
};
