import React from 'react';
import { OptionType } from '@/types';
import { Input } from "@/components/ui/Input"

interface CheckerButtonProps {
  option: OptionType
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  idx: number
}

const CheckerButton: React.FC<CheckerButtonProps> = ({ option, onInputChange, idx }) => {
  return (
    <div className="space-x-2 w-full cursor-pointer">
      <Input
        type="text"
        value={option.name}
        onChange={onInputChange}
        placeholder={`Write option #${idx+1}`}
        maxLength={60}
      />
    </div>
  );
};
export default CheckerButton;
