import { useState } from 'react';
import { Label } from '../Label';

// interface OptionButtonProps {
//   optionName: string;
//   onVote: (optionId: index) => void;
//   isChecked: boolean;
//   index: string;
//   id: string
// }

// const OptionButton: React.FC<OptionButtonProps> = ({ optionName, onVote, isChecked, index, id }) => {
//   return (
//     <label className="flex items-center space-x-2 cursor-pointer">
//       <span className={`text-lg font-bold ${isChecked ? 'text-blue-500' : 'text-gray-700'}`}>{isChecked ? '✔️' : ''}</span>
//       <span onClick={() => onVote(index)} className={`w-full rounded-full relative transition-all duration-300 items-center px-4 py-2 ${isChecked ? 'bg-blue-500' : 'bg-white'}`}>
//         <Label>{optionName}</Label>
//       </span>
//       {/* The checkbox can be hidden as you are controlling the state from the parent component */}
//       <input type="checkbox" className="hidden" checked={isChecked} readOnly />
//     </label>
//   );
// };

// export default OptionButton;

interface OptionButtonProps {
  optionName: string;
  onVote: (identifier: string | number) => void;
  isChecked: boolean;
  index?: number;
  id?: string;
  type: 'api' | 'contract';
}

const OptionButton: React.FC<OptionButtonProps> = ({ optionName, onVote, isChecked, index, id, type }) => {
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
      <span onClick={handleVote} className={`w-full rounded-full relative transition-all duration-300 items-center px-4 py-2 ${isChecked ? 'bg-blue-500' : 'bg-white'}`}>
        <Label>{optionName}</Label>
      </span>
      <input type="checkbox" className="hidden" checked={isChecked} readOnly />
    </label>
  );
};

export default OptionButton;
