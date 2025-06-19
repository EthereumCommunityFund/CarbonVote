import { Popover, Button, TextField } from '@mui/material';
import { styled } from '@mui/system';
import {
  Link as LinkIcon,
  ListBullets,
  ListNumbers,
  Quotes,
  TextBolder,
  TextHOne,
  TextHThree,
  TextHTwo,
  TextItalic,
} from '@phosphor-icons/react';
import Bold from '@tiptap/extension-bold';
import Link from '@tiptap/extension-link';
import Text from '@tiptap/extension-text';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import React, { useEffect, useRef, useState } from 'react';
import { MarkdownLinkPlugin } from './mdLinkPlugin';
import { MarkdownPastePlugin } from './mdPasteHandler';
import clsx from 'clsx';

interface EditorValue {
  content: string;
  type: 'doc' | 'text';
  isEmpty: boolean;
}

export interface EditorProProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: {
    base?: string;
    menuBar?: string;
    editorWrapper?: string;
    editor?: string;
  };
  isEdit?: boolean;
  onClick?: () => void;
  collapsable?: boolean;
  collapseHeight?: number;
  collapsed?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

const isContentEmpty = (content: string): boolean => {
  const plainText = content
    .replace(/<br\s*\/?>/g, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plainText.length === 0;
};

const isValidEditorValue = (value: any): value is EditorValue => {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof value.content === 'string' &&
    (value.type === 'doc' || value.type === 'text') &&
    typeof value.isEmpty === 'boolean'
  );
};

const LinkInput = ({ editor, isOpen }: { editor: any; isOpen: boolean }) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    if (isOpen) {
      const previousUrl = editor.getAttributes('link').href;
      setUrl(previousUrl || '');
    }
  }, [isOpen, editor]);

  const addLink = () => {
    if (!url || !editor) return;

    let processedUrl = url.trim();
    if (processedUrl.startsWith('www.')) {
      processedUrl = `https://${processedUrl}`;
    }

    const { empty, from, to } = editor.state.selection;
    if (empty) {
      alert('Please select the text you want to link');
      return;
    }

    const isUpdatingLink = editor.isActive('link');

    const { state, view } = editor;
    const { tr } = state;
    const linkMark = state.schema.marks.link.create({ href: processedUrl });

    let transaction = tr.addMark(from, to, linkMark);

    if (!isUpdatingLink) {
      transaction = transaction.setSelection(
        state.selection.constructor.near(transaction.doc.resolve(to))
      );

      transaction = transaction.insertText(' ', to);

      transaction = transaction.removeStoredMark(linkMark);
    }

    view.dispatch(transaction);

    view.focus();

    setUrl('');
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
    setUrl('');
  };

  return (
    <div className="flex flex-col gap-2 p-2">
      <StyledTextField
        size="small"
        placeholder="Enter link URL..."
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            addLink();
          }
        }}
      />
      <div className="flex gap-2">
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={addLink}
        >
          {editor.isActive('link') ? 'Update Link' : 'Add Link'}
        </Button>
        {editor.isActive('link') && (
          <Button
            size="small"
            variant="outlined"
            color="secondary"
            onClick={removeLink}
          >
            Remove Link
          </Button>
        )}
      </div>
    </div>
  );
};

const MenuBar = ({
  editor,
  className,
}: {
  editor: any;
  className?: string;
}) => {
  const [isLinkOpen, setIsLinkOpen] = useState(false);
  const linkButtonRef = useRef<HTMLButtonElement>(null);

  if (!editor) {
    return null;
  }

  return (
    <div
      className={`flex flex-wrap gap-1 border-b border-white/10 p-[10px] ${className}`}
    >
      <EditorButton
        size="small"
        variant="text"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={editor.isActive('heading', { level: 1 }) ? 'active' : ''}
        title="Heading 1"
      >
        <TextHOne size={20} />
      </EditorButton>
      <EditorButton
        size="small"
        variant="text"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}
        title="Heading 2"
      >
        <TextHTwo size={20} />
      </EditorButton>
      <EditorButton
        size="small"
        variant="text"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={editor.isActive('heading', { level: 3 }) ? 'active' : ''}
        title="Heading 3"
      >
        <TextHThree size={20} />
      </EditorButton>
      <div className="mx-1 my-auto h-6 w-px bg-white/10" />
      <EditorButton
        size="small"
        variant="text"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'active' : ''}
        title="Bold"
      >
        <TextBolder size={20} />
      </EditorButton>
      <EditorButton
        size="small"
        variant="text"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'active' : ''}
        title="Italic"
      >
        <TextItalic size={20} />
      </EditorButton>
      <div className="mx-1 my-auto h-6 w-px bg-white/10" />
      <EditorButton
        size="small"
        variant="text"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={editor.isActive('bulletList') ? 'active' : ''}
        title="Bullet List"
      >
        <ListBullets size={20} />
      </EditorButton>
      <EditorButton
        size="small"
        variant="text"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={editor.isActive('orderedList') ? 'active' : ''}
        title="Ordered List"
      >
        <ListNumbers size={20} />
      </EditorButton>
      <EditorButton
        size="small"
        variant="text"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={editor.isActive('blockquote') ? 'active' : ''}
        title="Quote"
      >
        <Quotes size={20} />
      </EditorButton>
      <EditorButton
        size="small"
        variant="text"
        className={editor.isActive('link') ? 'active' : ''}
        title={editor.isActive('link') ? 'Edit Link' : 'Add Link'}
        onClick={() => setIsLinkOpen(true)}
        ref={linkButtonRef}
      >
        <LinkIcon size={20} />
      </EditorButton>
      <Popover
        open={isLinkOpen}
        onClose={() => setIsLinkOpen(false)}
        anchorEl={linkButtonRef.current}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <div style={{ padding: '10px' }}>
          <LinkInput editor={editor} isOpen={isLinkOpen} />
        </div>
      </Popover>
    </div>
  );
};

const defaultValue = JSON.stringify({
  content: '',
  type: 'doc',
  isEmpty: true,
});

// 创建自定义样式组件
const EditorButton = styled(Button)(({ theme }) => ({
  padding: '5px',
  minWidth: 'auto',
  margin: '2px',
  color: '#000',
  '&.active': {
    backgroundColor: '#F0F0F0',
  },
  '&:hover': {
    backgroundColor: '#F2F2F2',
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiInputBase-root': {
    fontSize: '14px',
  },
}));

const EditorPro: React.FC<EditorProProps> = ({
  value = '',
  onChange,
  placeholder = 'Start writing...',
  className,
  isEdit = true,
  onClick,
  collapsable = false,
  collapseHeight = 150,
  collapsed = false,
  onCollapse,
}) => {
  const [isInitialized, setIsInitialized] = useState(false);

  const editorValue = React.useMemo(() => {
    if (!value) return JSON.parse(defaultValue);
    try {
      const parsedValue = JSON.parse(value);

      if (!isValidEditorValue(parsedValue)) {
        return JSON.parse(defaultValue);
      }

      const contentIsEmpty = isContentEmpty(parsedValue.content);
      return {
        ...parsedValue,
        isEmpty: contentIsEmpty,
      };
    } catch (e) {
      return JSON.parse(defaultValue);
    }
  }, [value]);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          HTMLAttributes: {
            class: 'custom-bullet-list pl-4 my-[10px] list-disc',
          },
        },
        orderedList: {
          HTMLAttributes: {
            class: 'custom-ordered-list pl-4 my-[10px] list-decimal',
          },
        },
        blockquote: {
          HTMLAttributes: {
            class: 'custom-blockquote border-l-[3px] border-white/20 my-6 pl-4',
          },
        },
        code: {
          HTMLAttributes: {
            class:
              'custom-code bg-[#1f1f1f] rounded-[0.4rem] text-[0.85rem] px-[0.3em] py-[0.25em]',
          },
        },
        codeBlock: {
          HTMLAttributes: {
            class: 'custom-code-block bg-[#1f1f1f] rounded-[0.5rem] my-6 p-4',
          },
        },
        heading: {
          levels: [1, 2, 3],
          HTMLAttributes: {
            class: 'custom-heading',
          },
        },
      }),
      Text.configure({
        HTMLAttributes: {
          class: `text-[16px]`,
        },
      }),
      Bold.configure({
        HTMLAttributes: {
          class: 'font-bold font-[700]',
        },
      }),
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class:
            'custom-link underline cursor-pointer transition-colors text-[#E24848]',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
        autolink: true,
      }),
      MarkdownPastePlugin,
      MarkdownLinkPlugin,
    ],
    content: editorValue.content,
    editable: isEdit,
    editorProps: {
      attributes: {
        class: clsx(
          'tiptap prose prose-invert max-w-none focus:outline-none',
          '[&_.tiptap]:first:mt-0',
          '[&_h1]:text-[1.6rem] [&_h1]:leading-[1.4]',
          '[&_h2]:text-[1.3rem] [&_h2]:leading-[1.4]',
          '[&_h3]:text-[1.1rem] [&_h3]:leading-[1.4]',
          isEdit ? 'text-[14px]' : 'text-[16px]',
          !isEdit && 'cursor-default',
          className?.editor
        ),
      },
    },
    onUpdate: ({ editor }) => {
      if (!isEdit || !isInitialized) return;
      const html = editor.getHTML();
      const contentIsEmpty = isContentEmpty(html);
      const jsonValue: EditorValue = {
        content: html,
        type: 'doc',
        isEmpty: contentIsEmpty,
      };
      onChange?.(JSON.stringify(jsonValue));
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && editorValue.content !== editor.getHTML()) {
      editor.commands.setContent(editorValue.content);
    }
  }, [editorValue.content, editor]);

  useEffect(() => {
    if (editor) {
      setIsInitialized(true);
    }
  }, [editor]);

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEdit);
    }
  }, [isEdit, editor]);

  const [canCollapse, setCanCollapse] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!collapsable || isEdit || !contentRef.current) return;

    const checkHeight = () => {
      const contentHeight = contentRef.current?.scrollHeight || 0;
      const shouldCollapse = contentHeight > collapseHeight * 1.5;

      setCanCollapse(shouldCollapse);

      if (shouldCollapse) {
        onCollapse?.(shouldCollapse);
      }
    };

    setTimeout(checkHeight, 100);

    window.addEventListener('resize', checkHeight);
    return () => window.removeEventListener('resize', checkHeight);
  }, [
    collapsable,
    isEdit,
    collapseHeight,
    editor,
    editorValue.content,
    onCollapse,
  ]);

  return (
    <div className="w-full">
      <div
        className={clsx(
          'rounded-[10px] border border-black/10 bg-[#F9F9F9]',
          collapsable &&
            !isEdit &&
            canCollapse &&
            collapsed &&
            'overflow-hidden',
          className?.base
        )}
        onClick={onClick}
        style={
          collapsable && !isEdit && canCollapse && collapsed
            ? { maxHeight: `${collapseHeight}px` }
            : undefined
        }
      >
        {isEdit && <MenuBar editor={editor} className={className?.menuBar} />}
        <div
          ref={contentRef}
          className={clsx(
            'relative p-[10px]',
            collapsable &&
              !isEdit &&
              canCollapse &&
              'transition-all duration-300',
            isEdit && 'min-h-[130px]',
            className?.editorWrapper
          )}
          onClick={(e) => {
            e.stopPropagation();
            editor?.commands.focus();
          }}
        >
          <EditorContent editor={editor} className={className?.editor} />
          {/* {editorValue.isEmpty && isEdit && (
            <div className="pointer-events-none absolute left-[10px] top-[10px] text-[#333] text-[20px] font-bold leading-[28px]">
              {placeholder}
            </div>
          )} */}
        </div>
      </div>
    </div>
  );
};

export default EditorPro;
