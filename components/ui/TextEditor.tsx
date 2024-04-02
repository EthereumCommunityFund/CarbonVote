import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import "easymde/dist/easymde.min.css";

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

// Import SimpleMdeReact dynamically with no SSR
const SimpleMdeReactWithNoSSR = dynamic(() => import('react-simplemde-editor'), { ssr: false });

const TextEditor: React.FC<TextEditorProps> = ({ value, onChange }) => {
  const [height, setHeight] = useState<number>(400);
  const [isClient, setIsClient] = useState<boolean>(false);

  useEffect(() => {
    setIsClient(true);
    // if (!editorRef.current) return;
  }, [])
  return (
    <>
      {isClient &&
        // <div ref={editorRef} className="relative" style={{ height: `${height}px` }} onMouseMove={handleMouseMove}>
        <div style={{ maxHeight: "400px", overflowY: "auto" ,width: "100%"}}>
        <SimpleMdeReactWithNoSSR value={value} onChange={onChange} />
      </div>
        // </div> 
      }
    </>
  );
};

export default TextEditor;