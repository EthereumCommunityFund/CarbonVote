import SimpleMdeReact from 'react-simplemde-editor';
import "easymde/dist/easymde.min.css";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ value, onChange }) => {

  return (
    <SimpleMdeReact className='w-[700px]' value={value} onChange={onChange} />
  );
};

export default TextEditor;
