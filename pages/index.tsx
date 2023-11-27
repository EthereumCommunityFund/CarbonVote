import { Label } from "@/components/ui/Label";
import { useUserPassportContext } from "../context/PassportContext";
import { polls } from "@/constant/mockPolls";
import { PollType } from "@/types";
import { PollCardTemplate } from "@/components/templates/PollCard";
import Button from "@/components/ui/buttons/Button";
import { PlusCirceIcon } from "@/components/icons";

export default function Home() {
  const pollList: PollType[] = polls;


  return (
    <div className="flex flex-col p-5 gap-2.5 text-black">
      <div className="flex gap-3 pt-5 px-5 bg-gradient-to-r from-red-400 to-white rounded-lg justify-center">
        <div className="flex flex-col gap-2.5 py-10 font-share-tech-mono lg:w-2/3">
          <Label className="text-[39px]">Carbonvote V 2.0</Label>
          <Label className="lg:text-[69px] md:text-[59px]">Empowering Consensus for a Sustainable Future.</Label>
        </div>
      </div>
      <div className="px-[273px] flex flex-col gap-[30px]">
        <div className="flex justify-end">
          <Button className="rounded-full" leftIcon={PlusCirceIcon}>Create a Poll</Button>
        </div>
        <div className="flex flex-col gap-2.5 h-[400px] overflow-y-auto">
          {pollList.map((poll) => {
            return (
              <PollCardTemplate
                key={poll.id}
                id={poll.id}
                title={poll.title}
                creator={poll.creator}
                startDate={poll.startDate}
                endDate={poll.endDate}
                isLive={poll.isLive}
                topic={poll.topic}
                subTopic={poll.subTopic}
                isZuPassRequired={poll.isZuPassRequired}
              />
            )
          })}
        </div>
      </div>
    </div>
  );
}
