import * as Progress from '@radix-ui/react-progress';
import { Label } from './ui/Label';

interface IOptionVotingCountProgress {
  description: string
  votes: number
}

export default function OptionVotingCountProgress({ description, votes }: IOptionVotingCountProgress) {
  return (
    <Progress.Root
      className="relative overflow-hidden bg-[#F84A4A46] rounded-full w-[300px] py-3 items-center"
      style={{
        // Fix overflow clipping in Safari
        // https://gist.github.com/domske/b66047671c780a238b51c51ffde8d3a0
        transform: 'translateZ(0)',
      }}
      value={votes}
    >
      <div className='flex justify-between text-black'>
        <Label className='pl-3'>{description}</Label>
        <Label></Label>
        <Label style={{ marginRight: '10px' }}>{votes}</Label>
      </div>
      <Progress.Indicator
        className="bg-[#F84A4A] w-full h-full transition-transform duration-[660ms] ease-[cubic-bezier(0.65, 0, 0.35, 1)]"
        style={{ transform: `translateX(-${100 - votes}%)` }}
      />
    </Progress.Root>
  )
}