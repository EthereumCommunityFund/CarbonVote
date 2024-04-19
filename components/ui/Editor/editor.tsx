import React, { FunctionComponent, useEffect, useState } from 'react';
import EditorJS, { ToolConstructable, ToolSettings } from '@editorjs/editorjs';
import { tools } from './tools';

export const useEditor = (
  toolsList: { [toolName: string]: ToolConstructable | ToolSettings<any> },
  { data, editorRef }: any,
  options: EditorJS.EditorConfig = {}
) => {
  const [editorInstance, setEditor] = useState<EditorJS | null>(null);
  const {
    data: ignoreData,
    tools: ignoreTools,
    holder: ignoreHolder,
    ...editorOptions
  } = options;

  // initialize
  useEffect(() => {
    const editor = new EditorJS({
      holder: 'editor-js',

      tools: toolsList,

      data: data || {},

      initialBlock: 'paragraph',

      ...editorOptions,
    });

    setEditor(editor);

    return () => {
      editor.isReady
        .then(() => {
          editor.destroy();
          setEditor(null);
        })
        .catch((e) => console.error('ERROR editor cleanup', e));
    };
  }, [toolsList]);

  useEffect(() => {
    if (!editorInstance) {
      return;
    }
    if (editorRef) {
      editorRef(editorInstance);
    }
  }, [editorInstance, editorRef]);

  return { editor: editorInstance };
};

export const EditorContainer = ({
  editorRef,
  children,
  data,
  options,
}: any) => {
  useEditor(tools, { data, editorRef }, options);

  return (
    <React.Fragment>
      {!children && (
        <div
          className="w-full bg-[#F0F0F0] p-[10px] sm:p-[20px] max-h-[197px] rounded-[10px] overflow-auto"
          id="editor-js"
        ></div>
      )}
      {children}
    </React.Fragment>
  );
};
