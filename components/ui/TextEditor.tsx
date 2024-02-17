import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import EditorJS from '@editorjs/editorjs';

const ReactQuillNoSSR = dynamic(() => import('react-quill'), { ssr: false });

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(500);

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = new EditorJS({
      holder: editorRef.current,
      tools: {
      },
      // data: initialData,
    });

    return () => {
      editor.destroy();
    };
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1 || !editorRef.current) return; // Check if left mouse button is pressed

    const newHeight = e.clientY - editorRef.current.getBoundingClientRect().top;
    setHeight(newHeight);
  };
  return (
    <div
      ref={editorRef}
      style={{ height: `${height}px`, resize: 'vertical', overflow: 'auto' }}
      onMouseMove={handleMouseMove}
      onMouseUp={() => setHeight(height)}
    ></div>
  );
};

export default TextEditor;
