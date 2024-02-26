import { useEffect, useRef, useState } from 'react';
import "easymde/dist/easymde.min.css";
import dynamic from 'next/dynamic';

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const SimpleMdeReactWithNoSSR = dynamic(() => import('react-simplemde-editor'), { ssr: false }); // Import SimpleMdeReact dynamically with no SSR

const TextEditor: React.FC<TextEditorProps> = ({ value, onChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>(500);
  const [isClient, setIsClient] = useState<boolean>(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.buttons !== 1 || !editorRef.current) return; // Check if left mouse button is pressed

    const newHeight = e.clientY - editorRef.current.getBoundingClientRect().top;
    setHeight(newHeight);
  };

  useEffect(() => {
    setIsClient(true);
    // if (!editorRef.current) return;
  }, [])
  return (
    <>
      {isClient &&
        // <div ref={editorRef} className="relative" style={{ height: `${height}px` }} onMouseMove={handleMouseMove}>
        <SimpleMdeReactWithNoSSR value={value} onChange={onChange} style={{ height: `${height}px` }} />
        // </div> 
      }
    </>
  );
};

export default TextEditor;
