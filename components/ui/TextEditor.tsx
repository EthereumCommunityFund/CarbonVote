import dynamic from 'next/dynamic';
import { EditorConfig, OutputData } from '@editorjs/editorjs';
import { useState } from 'react';
import { options, useLoadData } from './Editor';

const Editor = dynamic<{
  editorRef: any;
  children?: any;
  data: OutputData | null;
  options: EditorConfig;
}>(() => import('./Editor/editor').then((mod) => mod.EditorContainer), {
  ssr: false,
});

export default function TextEditor() {
  const [editor, setEditor] = useState(null);
  const { data } = useLoadData();

  return <Editor editorRef={setEditor} options={options} data={data}></Editor>;
}
