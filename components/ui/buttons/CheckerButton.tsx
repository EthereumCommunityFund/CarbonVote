import React from 'react';
import { OptionType } from '@/types';

interface CheckerButtonProps {
  option: OptionType
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  idx: number
}

const CheckerButton: React.FC<CheckerButtonProps> = ({ option, onInputChange, idx }) => {
  return (
    <div className="space-x-2 w-full cursor-pointer">
      <input
        type="text"
        value={option.name}
        onChange={onInputChange}
        className="w-full h-full border-none outline-none bg-transparent cursor-text bg-gray-200 rounded px-4 py-2"
        placeholder={`Write option #${idx}`}
      />
    </div>
  );
};
export default CheckerButton;
