import { PollType } from "@/types";
import { Label } from "./ui/Label";
import { useRouter } from "next/router";

export const PollComponent = ({
  id,
  name,
  startDate,
  endDate,
  isLive,
}: PollType) => {
  const router = useRouter();
  const handleClickItem = () => {
    router.push({
      pathname: '/poll',
      query: id,
    })
  }
  return (
    <div className="bg-itemBgPrimary flex w-full h-40 justify-between rounded-md p-3 hover:cursor-pointer" onClick={handleClickItem}>
      <div className="flex flex-col">
        <Label>{name}</Label>
      </div>
      <div>
        {isLive ?
          <Label className="rounded-sm bg-[#91F36F20] px-2.5 py-1 text-[#91F36E]">
            On-Going
          </Label> :
          <Label className="rounded-sm bg-[#F3966F20] px-2.5 py-1 text-[#F3966E]">
            Ended
          </Label>
        }
      </div>
    </div>
  )
}