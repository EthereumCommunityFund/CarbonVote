import React from 'react';
import CheckerButton from '@/components/ui/buttons/CheckerButton';

interface OptionItemProps {
  option: string;
  index: number;
  onInputChange: (index: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
}

const OptionItem: React.FC<OptionItemProps> = ({ 
  option, 
  index, 
  onInputChange, 
  onRemove 
}) => {
  return (
    <div className="flex items-center gap-2">
      <CheckerButton
        option={option}
        onInputChange={(e: React.ChangeEvent<HTMLInputElement>) => onInputChange(index, e)}
        idx={index}
      />
      <button 
        onClick={() => onRemove(index)}
        className="text-red-500 hover:text-red-700 transition-colors"
        type="button"
        aria-label={`Remove option ${index + 1}`}
      >
        ❌
      </button>
    </div>
  );
};

export default OptionItem;
