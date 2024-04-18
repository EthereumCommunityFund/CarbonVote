import React, { FunctionComponent, useEffect, useState } from "react"
import EditorJS, { ToolConstructable, ToolSettings } from "@editorjs/editorjs"
import { tools } from "./tools"

export const useEditor = (
    toolsList: { [toolName: string]: ToolConstructable | ToolSettings<any> },
    { data, editorRef }: any,
    options: EditorJS.EditorConfig = {}
) => {
    const [editorInstance, setEditor] = useState<EditorJS | null>(null)
    const {
        data: ignoreData,
        tools: ignoreTools,
        holder: ignoreHolder,
        ...editorOptions
    } = options

    // initialize
    useEffect(() => {
        // create instance
        const editor = new EditorJS({
            /**
             * Id of Element that should contain the Editor
             */
            holder: "editor-js",

            /**
             * Available Tools list.
             * Pass Tool's class or Settings object for each Tool you want to use
             */
            tools: toolsList,

            /**
             * Previously saved data that should be rendered
             */
            data: data || {},

            initialBlock: "paragraph",

            // Override editor options
            ...editorOptions,
        })

        setEditor(editor)

        // cleanup
        return () => {
            editor.isReady
                .then(() => {
                    editor.destroy()
                    setEditor(null)
                })
                .catch((e) => console.error("ERROR editor cleanup", e))
        }
    }, [toolsList])

    // set reference
    useEffect(() => {
        if (!editorInstance) {
            return
        }
        // Send instance to the parent
        if (editorRef) {
            editorRef(editorInstance)
        }
    }, [editorInstance, editorRef])

    return { editor: editorInstance }
}

export const EditorContainer = ({ editorRef, children, data, options }: any) => {
    useEditor(tools, { data, editorRef }, options)

    return (
        <React.Fragment>
            {!children && <div className="w-full bg-[#F0F0F0] p-[10px] sm:p-[20px] max-h-[197px] rounded-[10px] overflow-auto" id="editor-js"></div>}
            {children}
        </React.Fragment>
    )
}