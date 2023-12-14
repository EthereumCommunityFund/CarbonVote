import { useState } from 'react';
import { Label } from '../Label';
import { OptionType } from '@/types';

interface CheckerButtonProps {
  option: OptionType;
  onCheckboxChange: (name: string, isChecked: boolean) => void;
}

const CheckerButton: React.FC<CheckerButtonProps> = ({ option, onCheckboxChange }) => {
  const [isChecked, setIsChecked] = useState<boolean>(option.isChecked);
  const [inputValue, setInputValue] = useState<string>(option.name);


  const handleCheckboxChange = () => {
    const newCheckedValue = !isChecked;
    setIsChecked(newCheckedValue);
    onCheckboxChange(inputValue, newCheckedValue); // Notify parent of the change
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return (
    <label className="flex items-center space-x-2 cursor-pointer" onClick={handleCheckboxChange}>
      <span className={`text-lg font-bold ${isChecked ? 'text-blue-500' : 'text-gray-700'}`}>{isChecked ? '✔️' : ''}</span>
      <span className={`w-full rounded-full relative transition-all duration-300 items-center px-4 py-2 ${isChecked ? 'bg-blue-500' : 'bg-white'}`}>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          className="w-full h-full border-none outline-none bg-transparent cursor-pointer"
        />
      </span>
    </label>
  );
};

export default CheckerButton;
