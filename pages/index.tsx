import { Label } from "@/components/ui/Label";
import { useUserPassportContext } from "../context/PassportContext";
import { polls, biggestPolls } from "@/constant/mockPolls";
import { PollType } from "@/types";
import { PollCardTemplate } from "@/components/templates/PollCard";

export default function Home() {
  const pollList: PollType[] = polls;
  const biggestPollList: PollType[] = biggestPolls;

  return (
    <div className="bg-pagePrimary flex flex-col p-5 gap-5 text-white">
      <div className="flex flex-col gap-3">
        <Label className="text-3xl">Biggest Polls</Label>
        <div className="flex gap-3">
          {
            biggestPollList.map((poll: PollType, index: number) => (
              <PollCardTemplate
                key={index}
                id={poll.id}
                name={poll.name}
                creator={poll.creator}
                startDate={poll.startDate}
                endDate={poll.endDate}
                isLive={poll.isLive}
              />
            ))
          }
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Label className="text-2xl">Polls</Label>
        <div className='flex gap-3'>
          {
            pollList.map((poll: PollType, index: number) => (
              <PollCardTemplate
                key={index}
                id={poll.id}
                name={poll.name}
                creator={poll.creator}
                startDate={poll.startDate}
                endDate={poll.endDate}
                isLive={poll.isLive}
              />
            ))
          }
        </div>
      </div>
    </div>
  );
}
