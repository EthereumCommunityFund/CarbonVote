import Header from "@editorjs/header"
import Paragraph from "@editorjs/paragraph"
import Embed from "@editorjs/embed"
import LinkTool from "@editorjs/link"
import Quote from "@editorjs/quote"
import CheckList from "@editorjs/checklist"
import Delimiter from "@editorjs/delimiter"
import InlineCode from "@editorjs/inline-code"
import SimpleImage from "@editorjs/simple-image"
import { ToolConstructable, ToolSettings } from "@editorjs/editorjs"

export const tools: { [toolName: string]: ToolConstructable | ToolSettings<any> } = {
    header: {
        class: Header,
        inlineToolbar: ["link"],
    },
    paragraph: {
        class: Paragraph,
        inlineToolbar: true,
    },
    embed: Embed,
    linkTool: LinkTool,
    quote: Quote,
    checklist: CheckList,
    delimiter: Delimiter,
    inlineCode: InlineCode,
    simpleImage: SimpleImage,
}