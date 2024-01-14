import CheckerButton from '@/components/ui/buttons/CheckerButton';

const OptionItem = ({ option, index, onCheckboxChange, onInputChange, onRemove }: any) => {
    return (
        <div key={index} className="flex items-center space-x-2" >
            <CheckerButton
                option={option}
                onOptionChange={(updatedOption) => onCheckboxChange(index, updatedOption.isChecked)}
                onInputChange={(e) => onInputChange(index, e)}
            />
            < button onClick={() => onRemove(index)}>❌</button>
        </div>
    );
};

export default OptionItem;
