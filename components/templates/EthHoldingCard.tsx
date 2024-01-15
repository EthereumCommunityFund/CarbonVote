import { useEffect, useState } from 'react';
import { ClockIcon } from '../icons/clock';
import { LockClosedIcon } from '../icons/lockclosed';
import { LockOpenIcon } from '../icons/lockopen';
import CountdownTimer from '../ui/CountDownTimer';
import { Label } from '../ui/Label';
import { useRouter } from 'next/router';
import { useUserPassportContext } from '@/context/PassportContext';
import { EthHoldingPollType, RemainingTime } from '@/types';
import { getEthHoldingPollStatus } from '@/utils';


export const EthHoldingPollCardComponent: React.FC<EthHoldingPollType> = ({
  id,
  description,
  options,
  votingMethod,
  endTime,
  name,
  pollMetadata,
  pollType,
}) => {
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
    let path = '/contract-poll'; // Default path for API polls
    const pollId = id;
    // Navigate to the appropriate path with the poll ID
    router.push({
      pathname: path,
      query: { id: pollId },
    });
  };

  useEffect(() => {
    console.log(id, 'id');
    const interval = setInterval(() => {
      const pollStatus = getEthHoldingPollStatus({ id, description, options, votingMethod, endTime, name, pollMetadata, pollType });
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
      <Label>{name}</Label>
      <span dangerouslySetInnerHTML={{ __html: description }} />
      <div className="flex gap-3.5">

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
