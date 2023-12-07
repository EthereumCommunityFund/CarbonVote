import { useState } from 'react';
import { Label } from '../Label';
import { OptionType } from '@/types';

interface CheckerButtonProps {
  option: OptionType;
  onCheckboxChange: (name: string, isChecked: boolean) => void;
}

const CheckerButton: React.FC<CheckerButtonProps> = ({ option, onCheckboxChange }) => {
  const [isChecked, setIsChecked] = useState<boolean>(option.isChecked);

  const handleCheckboxChange = () => {
    const newCheckedValue = !isChecked;
    setIsChecked(newCheckedValue);
    onCheckboxChange(option.name, newCheckedValue); // Notify parent of the change
  };

  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <span className={`text-lg font-bold ${isChecked ? 'text-blue-500' : 'text-gray-700'}`}>{isChecked ? '✔️' : ''}</span>
      <span className={`w-full rounded-full relative transition-all duration-300 items-center px-4 py-2 ${isChecked ? 'bg-blue-500' : 'bg-white'}`}>
        <Label>{option.name}</Label>
      </span>
      <input type="checkbox" className="hidden" checked={isChecked} onChange={handleCheckboxChange} />
    </label>
  );
};

export default CheckerButton;
