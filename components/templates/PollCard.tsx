import { ClockIcon } from "../icons/clock";
import { LockClosedIcon } from "../icons/lockclosed";
import { LockOpenIcon } from "../icons/lockopen";
import CountdownTimer from "../ui/CountDownTimer";
import { Label } from "../ui/Label";
import { useRouter } from "next/router";

interface IPollCard {
  id: string,
  title: string,
  startDate: string | Date,
  endDate: string | Date,
  isLive: boolean,
  creator: string,
  topic: string,
  subTopic: string,
  isZuPassRequired: boolean,
}

export const PollCardTemplate = ({
  id,
  title,
  startDate,
  endDate,
  isLive,
  topic,
  subTopic,
  isZuPassRequired
}: IPollCard) => {
  const router = useRouter();
  const handleClickItem = () => {
    router.push({
      pathname: '/poll',
      query: id,
    })
  }

  return (
    <div className="bg-white flex flex-col justify-between rounded-lg p-3 hover:cursor-pointer w-full gap-3.5" onClick={handleClickItem}>
      <Label className="text-whilte/60">{topic}/{subTopic}</Label>
      <Label>{title}</Label>
      <div className="flex gap-3.5">
        {isZuPassRequired ?
          <LockClosedIcon /> :
          <LockOpenIcon />
        }
        <div className="bg-[#F84A4A20] px-2.5 rounded-lg items-center">
          {isLive ?
            <Label className="text-[#F84A4A]">Live</Label> :
            <Label className="text-">Ended</Label>
          }
        </div>
        {
          isLive ?
            <div className="flex flex-2">
              <ClockIcon />
              <CountdownTimer targetDate={new Date('2023-12-25T00:00:00')} />
            </div> :
            <></>
        }
      </div>
    </div>
  )
}