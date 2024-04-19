import { ToolConstructable, ToolSettings } from '@editorjs/editorjs';
const Header = require('@editorjs/header') as any;
const Paragraph = require('@editorjs/paragraph') as any;
const Embed = require('@editorjs/embed') as any;
const LinkTool = require('@editorjs/link') as any;
const Quote = require('@editorjs/quote') as any;
const CheckList = require('@editorjs/checklist') as any;
const Delimiter = require('@editorjs/delimiter') as any;
const InlineCode = require('@editorjs/inline-code') as any;
const SimpleImage = require('@editorjs/simple-image') as any;

export const tools: {
  [toolName: string]: ToolConstructable | ToolSettings<any>;
} = {
  header: {
    class: Header,
    inlineToolbar: ['link'],
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
};
