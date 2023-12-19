// import { useState } from 'react';
// import { Label } from '../Label';
// import { OptionType } from '@/types';

// interface CheckerButtonProps {
//   option: OptionType;
//   onCheckboxChange: (name: string, isChecked: boolean) => void;
// }

// const CheckerButton: React.FC<CheckerButtonProps> = ({ option, onCheckboxChange }) => {
//   const [isChecked, setIsChecked] = useState<boolean>(option.isChecked);
//   const [inputValue, setInputValue] = useState<string>(option.name);

//   const handleCheckboxChange = () => {
//     const newCheckedValue = !isChecked;
//     setIsChecked(newCheckedValue);
//     onCheckboxChange(inputValue, newCheckedValue); // Notify parent of the change
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setInputValue(e.target.value);
//   };

//   return (
//     <label className="flex items-center space-x-2 cursor-pointer" onClick={handleCheckboxChange}>
//       <span className={`text-lg font-bold ${isChecked ? 'text-blue-500' : 'text-gray-700'}`}>{isChecked ? '✔️' : ''}</span>
//       <span className={`w-full rounded-full relative transition-all duration-300 items-center px-4 py-2 ${isChecked ? 'bg-blue-500' : 'bg-white'}`}>
//         <input
//           type="text"
//           value={inputValue}
//           onChange={handleInputChange}
//           className="w-full h-full border-none outline-none bg-transparent cursor-pointer"
//         />
//       </span>
//     </label>
//   );
// };

// export default CheckerButton;

import React, { useState, useEffect } from 'react';
import { Label } from '../Label';
import { OptionType } from '@/types';

interface CheckerButtonProps {
  option: OptionType;
  onOptionChange: (option: OptionType) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CheckerButton: React.FC<CheckerButtonProps> = ({ option, onOptionChange, onInputChange }) => {
  // const [isChecked, setIsChecked] = useState<boolean>(option.isChecked);
  // const [inputValue, setInputValue] = useState<string>(option.name);

  // useEffect(() => {
  //   // Update the local state when the option prop changes
  //   setIsChecked(option.isChecked);
  //   setInputValue(option.name);
  // }, [option]);

  const handleCheckboxClick = () => {
    // const updatedOption = { ...option, isChecked: !isChecked };
    // setIsChecked(!isChecked);
    // onOptionChange(updatedOption); // Notify parent of the change
    onOptionChange({ ...option, isChecked: !option.isChecked });
  };

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const updatedOption = { ...option, name: e.target.value };
  //   setInputValue(e.target.value);
  //   onOptionChange(updatedOption); // Notify parent of the change
  // };

  //   return (
  //     <label className="flex items-center space-x-2 cursor-pointer">
  //       <span className={`text-lg font-bold ${isChecked ? 'text-blue-500' : 'text-gray-700'}`}>
  //         {isChecked ? '✔️' : ''}
  //       </span>
  //       <span className={`w-full rounded-full relative transition-all duration-300 items-center px-4 py-2 ${isChecked ? 'bg-blue-500' : 'bg-white'}`}>
  //         <input
  //           type="text"
  //           value={inputValue}
  //           onChange={handleInputChange}
  //           className="w-full h-full border-none outline-none bg-transparent cursor-pointer"
  //           onClick={(e) => e.stopPropagation()} // Prevent label's onClick when input is clicked
  //         />
  //       </span>
  //       <input type="checkbox" checked={isChecked} onChange={handleCheckboxClick} className="hidden" />
  //     </label>
  //   );
  // };

  return (
    <div className="flex items-center space-x-2 cursor-pointer">
      <input type="checkbox" checked={option.isChecked} onChange={handleCheckboxClick} className="text-lg font-bold" />
      <input
        type="text"
        value={option.name}
        onChange={onInputChange}
        className="w-full h-full border-none outline-none bg-transparent cursor-pointer bg-gray-100 rounded-full px-4 py-2"
        placeholder="Yes/No"
      />
    </div>
  );
};
export default CheckerButton;
