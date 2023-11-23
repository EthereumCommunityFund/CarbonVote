import { StopCircleIcon, ThumbDownIcon, ThumbUpIcon } from "@/components/icons";
import Button from "@/components/ui/Button";
import HtmlString from "@/components/ui/Html";
import { Label } from "@/components/ui/Label";
import { PollType } from "@/types";

const PollPage = () => {
  const mockPoll: PollType = {
    id: '3333',
    name: 'Poll Name',
    creator: 'QJ',
    title: 'The ice age should not be extended without at least some decrease in block rewards.',
    description: 'Description',
    startDate: '23423',
    endDate: '23423',
    isLive: true,
  }
  return (
    <div className="px-36 py-20 bg-itemBgPrimary flex flex-col text-white">
      {/* Header */}
      <div className="p-5 flex flex-col gap-5">
        <div className="flex gap-10">
          <Label>{mockPoll.isLive ? `On-Going` : `Ended`}</Label>
          {mockPoll.isLive ?
            <Label>2 days remaining</Label>
            : ``}
        </div>
        <div className="flex flex-col gap-1">
          <Label className="text-lg">Motion:</Label>
          <Label className="text-2xl">{mockPoll.title}</Label>
        </div>
        <div className="flex gap-2 justify-end">
          <Label>By:</Label>
          <Label>{mockPoll.creator}</Label>
        </div>
      </div>
      {/* Description */}
      <div className="p-5 flex flex-col gap-2.5">
        <Label className="text-white/80">Description: </Label>
        <HtmlString htmlString={mockPoll.description} />
      </div>
      {/* Footer */}
      <div className="p-5 flex flex-col gap-2.5">
        <div className="flex gap-2.5 w-full justify-between">
          <Button className="w-full justify-center rounded-2xl" leftIcon={ThumbUpIcon}>Yes</Button>
          <Button className="w-full justify-center rounded-2xl" leftIcon={ThumbDownIcon}>No</Button>
        </div>
        <div className="flex justify-center w-full">
          <Label className="w-full text-center">OR</Label>
        </div>
        <div>
          <Button className="w-full justify-center rounded-2xl" leftIcon={StopCircleIcon}>Abstain</Button>
        </div>
      </div>
    </div>
  )
}

export default PollPage;