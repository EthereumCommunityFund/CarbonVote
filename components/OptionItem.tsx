import CheckerButton from '@/components/ui/buttons/CheckerButton';

const OptionItem = ({ option, index, onInputChange, onRemove }: any) => {
  return (
    <div key={index} className="flex items-center space-x-2">
      <CheckerButton
        option={option}
        onInputChange={(e) => onInputChange(index, e)}
        idx={index}
      />
      <button onClick={() => onRemove(index)}>❌</button>
    </div>
  );
};

export default OptionItem;
