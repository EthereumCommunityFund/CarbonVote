import { PollResultComponentType, PollTypes } from '@/types';
import { Label } from './ui/Label';
import Button from './ui/buttons/Button';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import { TbChevronDown } from 'react-icons/tb';
import { EthHoding } from './icons';
import PieChartComponent from './ui/PieChart';
import { convertOptionsToPollOptions } from '@/utils';

export const PollResultComponent = ({ pollType, optionsData }: PollResultComponentType) => {
  return (
    <div className='bg-white pt-5 px-3 rounded-md'>
      <div className="flex justify-between mb-6">
        <Label className="text-2xl">Poll Results</Label>
        <Button variant="primary" className="rounded-md">
          Expand All Results
        </Button>
      </div>
      {pollType === PollTypes.ETH_HOLDING ?
        <div className='w-full flex flex-col gap-2.5'>
          <Label className='flex gap-2.5 items-center text-base'><EthHoding />Ether Holding Credential</Label>
          <Label className='text-xs'>Ether Holding results are updated every n block until the end of the poll's selected time.</Label>
          <Button variant="primary" className='w-full rounded-md flex justify-between'>
            <Label className='flex gap-2.5 items-center text-base'><EthHoding />Ether Holding Results</Label>
            <TbChevronDown />
          </Button>
        </div> :
        <div></div>
      }
      <PieChartComponent votes={convertOptionsToPollOptions(optionsData)} votingType={pollType} />
    </div>
  );
};
