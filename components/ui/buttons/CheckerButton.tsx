import { useState } from 'react';
import { Label } from '../Label';

const CheckerButton = () => {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <label className="flex items-center space-x-2 cursor-pointer">
      <span className={`text-lg font-bold ${isChecked ? 'text-blue-500' : 'text-gray-700'}`}>{isChecked ? '✔️' : ''}</span>
      <span className={`w-full rounded-full relative transition-all duration-300 items-center px-4 py-2 ${isChecked ? 'bg-blue-500' : 'bg-white'}`}>
        <Label>Option 1</Label>
      </span>
      <input type="checkbox" className="hidden" checked={isChecked} onChange={handleCheckboxChange} />
    </label>
  );
};

export default CheckerButton;
