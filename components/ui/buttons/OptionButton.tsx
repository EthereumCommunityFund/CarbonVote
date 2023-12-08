import { useState } from 'react';
import { Label } from '../Label';

interface OptionButtonProps {
  optionName: string;
  onVote: (optionIndex: number) => void; // Changed to accept a number
  isChecked: boolean;
  index: number;
}

const OptionButton: React.FC<OptionButtonProps> = ({ optionName, onVote, isChecked, index }) => {
  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <span className={`text-lg font-bold ${isChecked ? 'text-blue-500' : 'text-gray-700'}`}>{isChecked ? '✔️' : ''}</span>
      <span onClick={() => onVote(index)} className={`w-full rounded-full relative transition-all duration-300 items-center px-4 py-2 ${isChecked ? 'bg-blue-500' : 'bg-white'}`}>
        <Label>{optionName}</Label>
      </span>
      {/* The checkbox can be hidden as you are controlling the state from the parent component */}
      <input type="checkbox" className="hidden" checked={isChecked} readOnly />
    </label>
  );
};

export default OptionButton;
