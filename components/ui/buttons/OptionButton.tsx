import { useState } from 'react';
import { Label } from '../Label';
import styles from '@/styles/OptionButton.module.css';

interface OptionButtonProps {
  optionName: string;
  onVote: (identifier: string | number) => void;
  isChecked?: boolean;
  index?: number;
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
        <span
          className={`text-lg font-bold ${isChecked ? 'text-blue-500' : 'text-gray-700'}`}
        >
          {isChecked ? '✔️' : ''}
        </span>
        {/* <span onClick={handleVote} className={`rounded relative transition-all duration-300 items-center px-4 py-3 flex ${isChecked ? 'bg-blue-500' : 'bg-white'} text-black font-bold w-full`}>
          <Label className="w-full">{optionName} </Label>
        </span> */}
        <span onClick={handleVote} className={styles.option}>
          {optionName}
        </span>
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
