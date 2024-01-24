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
    <label className="flex flex-col items-start space-y-1 cursor-pointer w-full"> {/* 修改了这里 */}
      <div className="flex items-center space-x-2 w-full">
        <span className={`text-lg font-bold ${isChecked ? 'text-blue-500' : 'text-gray-700'}`}>{isChecked ? '✔️' : ''}</span>
        <span onClick={handleVote} className={`rounded-full relative transition-all duration-300 items-center px-4 py-3 flex ${isChecked ? 'bg-blue-500' : 'bg-white'} ${optionName === 'No' ? 'text-[#FF6384]' : 'text-[#00FF00]'} w-full`}>
          <Label className="w-full">{optionName} </Label>
        </span>
        <input type="checkbox" className="hidden" checked={isChecked} readOnly />
      </div>
      {optionAddress && (<div className='w-full flex justify-left px-4 py-2'>
        <span>Address: {optionAddress}</span>
      </div>
      )}
    </label>
  );
};

export default OptionButton;
