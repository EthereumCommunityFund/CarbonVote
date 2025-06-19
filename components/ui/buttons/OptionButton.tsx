import { useState } from 'react';
import { Label } from '../Label';
import styles from '@/styles/OptionButton.module.css';
import { CheckIcon } from '@/components/icons';
import { cn } from '@/styles/cn';

interface OptionButtonProps {
  optionName: string;
  onVote: (identifier: string | number) => void;
  isChecked?: boolean;
  index: number;
  id?: string;
  type?: 'api' | 'contract';
  optionAddress: string | undefined;
}

const OptionButton: React.FC<OptionButtonProps> = ({
  optionName,
  onVote,
  isChecked,
  index,
  id,
  type,
  optionAddress,
}) => {
  const handleVote = () => {
    onVote(id as string);
  };

  return (
    <label className="flex flex-col items-start space-y-1 relative cursor-pointer w-full">
      {/**/}
      <div className="flex items-center w-full">
        <div
          onClick={handleVote}
          className={cn(
            'h-[48px] flex justify-start items-center gap-[10px] w-full text-[16px] font-[700] leading-[1.6] text-black px-[14px] py-[10px] rounded-[10px] bg-white  border border-[rgba(0,0,0,0.1)] ',
            'hover:bg-[#EDEDED] hover:border-[rgba(0,0,0,0.14) hover:border-[3px]',
            isChecked
              ? 'bg-black text-white border-[rgba(248,74,74,0.10)] border-2'
              : ''
          )}
        >
          <span className="mr-[10px]">{index + 1}.</span>
          {isChecked ? <CheckIcon /> : ''}
          <span>{optionName}</span>
        </div>
        <input
          type="checkbox"
          className="hidden"
          checked={isChecked}
          readOnly
        />
      </div>
      {optionAddress && (
        <div className="w-full flex justify-left px-4 py-2">
          <span>Address: {optionAddress}</span>
        </div>
      )}
    </label>
  );
};

export default OptionButton;
