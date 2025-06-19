import React from 'react';
import { OptionType } from '@/types';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { XCircle } from '@phosphor-icons/react';

interface CheckerButtonProps {
  option: OptionType;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  idx: number;
  disabled?: boolean;
  onDelete?: () => void;
}

const CheckerButton: React.FC<CheckerButtonProps> = ({
  option,
  onInputChange,
  idx,
  disabled,
  onDelete,
}) => {
  return (
    <div className="flex items-center w-full">
      <div className="relative flex-grow">
        <Input
          type="text"
          value={option.name}
          onChange={onInputChange}
          placeholder={`Write option #${idx + 1}`}
          maxLength={60}
          className={cn(
            'font-inter text-[15px] font-normal leading-[1.21] text-black w-full',
            'pr-[12px]'
          )}
        />
        {onDelete && (
          <button
            type="button"
            onClick={onDelete}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-black/30 hover:text-black/50"
          >
            <XCircle size={24} />
          </button>
        )}
      </div>
    </div>
  );
};
export default CheckerButton;
