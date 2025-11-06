import { cn } from '@/styles/cn';
import { FC } from 'react';

export interface IProps {
  onDefaultTab: () => void;
  onScrollToResults: () => void;
  onScrollToDetails: () => void;
}

const ResultQuickAccessTab: FC<IProps> = ({
  onDefaultTab,
  onScrollToResults,
  onScrollToDetails,
}) => {
  return (
    <div className="flex justify-start px-[5px] border-b border-black/10">
      <div className="flex flex-1">
        <div
          className={cn(
            'px-[14px] py-[10px] text-center opacity-70 font-[500] text-[16px] leading-[1.2]',
            'border-b-2 border-black'
          )}
          onClick={onDefaultTab}
        >
          Poll Info
        </div>
        <div
          className={cn(
            'px-[14px] py-[10px] text-center opacity-50 font-[500] text-[16px] leading-[1.2] cursor-pointer',
            'hover: opacity-70'
          )}
          onClick={onScrollToResults}
        >
          Results
        </div>
      </div>
      <div className="block md:hidden">
        <div
          className={cn(
            'px-[14px] py-[10px] text-center opacity-50 font-[500] text-[16px] leading-[1.2] cursor-pointer',
            'hover: opacity-70'
          )}
          onClick={onScrollToDetails}
        >
          Details
        </div>
      </div>
    </div>
  );
};

export default ResultQuickAccessTab;
