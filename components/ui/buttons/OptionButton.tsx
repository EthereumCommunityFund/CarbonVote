import { useState } from 'react';
import { Label } from '../Label';

interface OptionButtonProps {
  optionName: string;
  onVote: (identifier: string | number) => void;
  isChecked: boolean;
  index?: number;
  id?: string;
  type: 'api' | 'contract';
  optionAddress: string | undefined;
}

const OptionButton: React.FC<OptionButtonProps> = ({ optionName, onVote, isChecked, index, id, type, optionAddress }) => {
  const handleVote = () => {
    if (type === 'api') {
      onVote(id as string);
    } else {
      onVote(index as number);
    }
  };

  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <span className={`text-lg font-bold ${isChecked ? 'text-blue-500' : 'text-gray-700'}`}>{isChecked ? '✔️' : ''}</span>
      <span onClick={handleVote} className={`w-full rounded-full relative transition-all duration-300 items-center px-4 py-2 flex ${isChecked ? 'bg-blue-500' : 'bg-white'} ${optionName === 'No' ? 'text-[#FF6384]' : 'text-[#00FF00]'}`}>
        <Label>{optionName}: </Label>
        <div className='w-full flex justify-center'>
          <Label>{optionAddress}</Label>
        </div>
      </span>
      <input type="checkbox" className="hidden" checked={isChecked} readOnly />
    </label>
  );
};

export default OptionButton;
