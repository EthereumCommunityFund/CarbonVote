import { Editor, Extension } from '@tiptap/core';
import MarkdownIt from 'markdown-it';
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';
import { EditorView } from 'prosemirror-view';
import type { JSONContent } from '@tiptap/core';

const md = new MarkdownIt('zero', {
  html: false,
  breaks: true,
  linkify: false,
  typographer: false,
});

(md.options as any).maxNesting = 20;

md.enable([
  'blockquote',
  'code',
  'fence',
  'heading',
  'lheading',
  'paragraph',
  'reference',
  'text',
]);

/**
 * Detects if text contains Markdown formatting
 */
function containsMarkdown(text: string): boolean {
  // More complete Markdown detection patterns
  const patterns = [
    /^#{1,6}\s+.+$/m, // Headers with space
    /^#{1,6}[^ ].*$/m, // Headers without space (common mistake)
    /\*\*(.+?)\*\*/, // Bold
    /\*(.+?)\*/, // Italic
    /\[([^\]]+)\]\(([^)]+)\)/, // Links
    /!\[([^\]]*)\]\(([^)]+)\)/, // Images
    /^[*\-+]\s+.+$/m, // Unordered lists
    /^\s*[*\-+]\s+.+$/m, // Indented unordered lists
    /^[0-9]+\.\s+.+$/m, // Ordered lists
    /^\s*[0-9]+\.\s+.+$/m, // Indented ordered lists
    /^```[\s\S]*?```$/m, // Code blocks
    /`(.+?)`/, // Inline code
    /^>\s+.+$/m, // Blockquotes
    /^\s*>\s+.+$/m, // Indented blockquotes
    /(https?:\/\/[^\s]+)/, // URL links
  ];

  return patterns.some((pattern) => pattern.test(text));
}

/**
 * Handles pasting of URLs
 */
function handleUrlPaste(view: EditorView, event: ClipboardEvent): boolean {
  const clipboardText = event.clipboardData?.getData('text/plain');
  if (!clipboardText) return false;

  const urlRegex = /(https?:\/\/[^\s]+)/;
  const match = clipboardText.trim().match(urlRegex);
  if (!match) return false;

  const [fullUrl] = match;
  const isOnlyUrl = clipboardText.trim() === fullUrl;

  if (isOnlyUrl) {
    const { state, dispatch } = view;
    const { selection } = state;
    const { from } = selection;

    // Create a single transaction
    const tr = state.tr;

    // Insert URL text
    tr.insertText(fullUrl, from);

    // Add link mark only to the URL text
    const linkMark = state.schema.marks.link.create({ href: fullUrl });
    tr.addMark(from, from + fullUrl.length, linkMark);

    // Explicitly remove the link mark from the stored marks to prevent it from being applied to future text
    tr.removeStoredMark(linkMark);

    // Add a space after the link to separate it from future text
    tr.insertText(' ', from + fullUrl.length);

    // Move cursor to after the space
    const newPos = from + fullUrl.length + 1;
    tr.setSelection(TextSelection.create(tr.doc, newPos));

    // Dispatch the transaction
    dispatch(tr);

    // Prevent default paste behavior
    event.preventDefault();

    // Ensure the view has focus after the paste
    setTimeout(() => {
      // Double-check that the link mark is removed
      const newState = view.state;
      const cleanTr = newState.tr.removeStoredMark(newState.schema.marks.link);
      view.dispatch(cleanTr);
      view.focus();
    }, 0);

    return true;
  }

  return false;
}

/**
 * Handles pasting of Markdown links
 */
function handleMarkdownLinkPaste(
  view: EditorView,
  event: ClipboardEvent
): boolean {
  const clipboardText = event.clipboardData?.getData('text/plain');
  if (!clipboardText) return false;

  // Check for Markdown link format
  if (!/\[([^\]]+)\]\(([^)]+)\)/.test(clipboardText)) return false;

  const { state, dispatch } = view;
  const { selection } = state;
  const { from } = selection;

  // Extract link parts using regex
  const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const matches = [...clipboardText.matchAll(linkRegex)];

  if (matches.length === 0) return false;

  event.preventDefault();

  // Create a single transaction for all links
  let tr = state.tr;
  let currentPos = from;

  // Process each matched link
  for (const match of matches) {
    const [_fullMatch, linkText, linkUrl] = match;

    let processedUrl = linkUrl.trim();
    if (
      !processedUrl.startsWith('http://') &&
      !processedUrl.startsWith('https://')
    ) {
      if (processedUrl.startsWith('www.')) {
        processedUrl = `https://${processedUrl}`;
      } else if (processedUrl.indexOf('.') > 0) {
        processedUrl = `https://${processedUrl}`;
      }
    }

    // Insert link text
    tr.insertText(linkText, currentPos);

    // Add link mark
    const linkMark = state.schema.marks.link.create({
      href: processedUrl,
    });
    tr.addMark(currentPos, currentPos + linkText.length, linkMark);

    // Update position
    currentPos += linkText.length;

    // Add space between links if needed
    if (match !== matches[matches.length - 1]) {
      tr.insertText(' ', currentPos);
      currentPos += 1;
    }
  }

  // Explicitly remove the link mark from the stored marks
  tr.removeStoredMark(state.schema.marks.link);

  // Add a space after the links to separate from future text
  tr.insertText(' ', currentPos);
  currentPos += 1;

  // Set selection to after the space
  tr.setSelection(TextSelection.create(tr.doc, currentPos));

  // Dispatch transaction once
  dispatch(tr);

  // Important: Double-check that the link mark is removed
  setTimeout(() => {
    const newState = view.state;
    const cleanTr = newState.tr.removeStoredMark(newState.schema.marks.link);
    view.dispatch(cleanTr);
    view.focus();
  }, 0);

  return true;
}

/**
 * Converts Markdown to HTML using simple regex replacements
 */
function convertMarkdownToHTML(text: string): string {
  let processedText = text;

  processedText = processedText.replace(/^(#{1,6})([^ \n])/gm, '$1 $2');

  processedText = processedText.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
  processedText = processedText.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  processedText = processedText.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');

  processedText = processedText.replace(
    /^[ \t]*[*\-+]\s+(.+)$/gm,
    '<li>$1</li>'
  );

  // Process ordered lists (supports multiple formats)
  processedText = processedText.replace(
    /^[ \t]*[0-9]+\.\s+(.+)$/gm,
    '<li>$1</li>'
  );

  // Process code blocks (simplified version)
  processedText = processedText.replace(
    /```([\s\S]*?)```/g,
    '<pre><code>$1</code></pre>'
  );

  // Process inline code
  processedText = processedText.replace(/`([^`]+)`/g, '<code>$1</code>');

  // Process blockquotes
  processedText = processedText.replace(
    /^>\s+(.+)$/gm,
    '<blockquote>$1</blockquote>'
  );

  // Process bold text
  processedText = processedText.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong>$1</strong>'
  );

  // Process italic text
  processedText = processedText.replace(/\*([^*]+)\*/g, '<em>$1</em>');

  // Process links (simplified version, only handles explicit links)
  processedText = processedText.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Ensure all paragraphs are wrapped
  const paragraphs = processedText.split(/\n\n+/);
  processedText = paragraphs
    .map((p) => {
      if (
        !p.trim().startsWith('<h') &&
        !p.trim().startsWith('<li') &&
        !p.trim().startsWith('<blockquote') &&
        !p.trim().startsWith('<pre')
      ) {
        return `<p>${p}</p>`;
      }
      return p;
    })
    .join('\n\n');

  // Process list item wrapping
  if (processedText.includes('<li>')) {
    // Simply wrap all list items with ul
    processedText = processedText.replace(
      /(<li>[\s\S]*?<\/li>)+/g,
      '<ul>$&</ul>'
    );
  }

  return processedText;
}

/**
 * Process inline formatting (bold, italic, links) in a text string
 */
function processInlineFormatting(text: string): JSONContent[] {
  const content: JSONContent[] = [];
  let currentPosition = 0;

  // Combined regex for bold and italic
  const formattingRegex = /(\*\*([^*]+)\*\*|\*([^*\s][^*]*[^*\s])\*)/g;
  let match;

  while ((match = formattingRegex.exec(text)) !== null) {
    const [_fullMatch, _, boldText, italicText] = match;
    const startIndex = match.index;
    const endIndex = startIndex + _fullMatch.length;

    // Add text before formatted text if exists
    if (startIndex > currentPosition) {
      const textBefore = text.substring(currentPosition, startIndex);
      content.push({
        type: 'text',
        text: textBefore,
      });
    }

    // Determine format type and add formatted text
    if (boldText) {
      // Bold text
      content.push({
        type: 'text',
        text: boldText,
        marks: [{ type: 'bold' }],
      });
    } else if (italicText) {
      // Italic text
      content.push({
        type: 'text',
        text: italicText,
        marks: [{ type: 'italic' }],
      });
    }

    currentPosition = endIndex;
  }

  // Add remaining text if exists
  if (currentPosition < text.length) {
    const _remainingText = text.substring(currentPosition);
    content.push({
      type: 'text',
      text: _remainingText,
    });
  }

  return content;
}

/**
 * Direct TipTap node processing for Markdown content
 */
function handleMarkdownDirectly(editor: Editor, text: string): boolean {
  // Split content by lines
  const lines = text.split('\n');
  let content: JSONContent[] = [];

  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    if (!line) {
      // Handle empty lines
      if (i > 0 && i < lines.length - 1) {
        content.push({ type: 'paragraph' });
      }
      continue;
    }

    // Check if line contains inline formatting
    const hasBold = /\*\*([^*]+)\*\*/.test(line);
    const hasItalic = /\*([^*]+)\*/.test(line);
    const hasLink = /\[([^\]]+)\]\(([^)]+)\)/.test(line);

    // If the line is just a single bold text without other elements
    if (hasBold && line.match(/^\*\*([^*]+)\*\*$/) && !hasLink) {
      content.push({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: line.replace(/^\*\*|\*\*$/g, ''),
            marks: [{ type: 'bold' }],
          },
        ],
      });
      continue;
    }

    // If the line has any inline formatting, process it
    if (hasBold || hasItalic || hasLink) {
      // Process both regular inline formatting and links
      const paragraphContent: JSONContent[] = [];

      // First check for links
      if (hasLink) {
        let linkCurrentPosition = 0;
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let linkMatch;

        while ((linkMatch = linkRegex.exec(line)) !== null) {
          const [_fullMatch, linkText, linkUrl] = linkMatch;
          const startIndex = linkMatch.index;

          // Add text before link if exists
          if (startIndex > linkCurrentPosition) {
            const textBefore = line.substring(linkCurrentPosition, startIndex);

            // Process inline formatting in text before link
            if (/\*\*([^*]+)\*\*/.test(textBefore)) {
              paragraphContent.push(...processInlineFormatting(textBefore));
            } else {
              paragraphContent.push({
                type: 'text',
                text: textBefore,
              });
            }
          }

          // Process URL
          let processedUrl = linkUrl.trim();
          if (
            !processedUrl.startsWith('http://') &&
            !processedUrl.startsWith('https://')
          ) {
            if (processedUrl.startsWith('www.')) {
              processedUrl = `https://${processedUrl}`;
            } else if (processedUrl.indexOf('.') > 0) {
              processedUrl = `https://${processedUrl}`;
            }
          }

          // Add link
          paragraphContent.push({
            type: 'text',
            text: linkText,
            marks: [
              {
                type: 'link',
                attrs: {
                  href: processedUrl,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                },
              },
            ],
          });

          linkCurrentPosition = startIndex + _fullMatch.length;
        }

        // Add remaining text after last link if exists
        if (linkCurrentPosition < line.length) {
          const textAfter = line.substring(linkCurrentPosition);

          // Process inline formatting in text after link
          if (/\*\*([^*]+)\*\*/.test(textAfter)) {
            paragraphContent.push(...processInlineFormatting(textAfter));
          } else {
            paragraphContent.push({
              type: 'text',
              text: textAfter,
            });
          }
        }
      } else {
        // No links, just inline formatting
        paragraphContent.push(...processInlineFormatting(line));
      }

      content.push({
        type: 'paragraph',
        content: paragraphContent,
      });
      continue;
    }

    // Process different Markdown elements

    // Process blockquotes
    if (line.startsWith('>')) {
      // Find all consecutive blockquote lines
      let blockquoteContent = '';
      let j = i;

      // Collect all blockquote lines
      const blockquoteLines: string[] = [];
      while (j < lines.length && lines[j].trim().startsWith('>')) {
        // Remove the '>' prefix and add the content
        const quoteText = lines[j].trim().substring(1).trim();
        blockquoteLines.push(quoteText);
        j++;
      }

      // Join the blockquote lines
      blockquoteContent = blockquoteLines.join('\n');

      // Check for links in the blockquote
      const hasLinks = /\[([^\]]+)\]\(([^)]+)\)/.test(blockquoteContent);

      if (hasLinks) {
        // Process paragraph with links
        const paragraphContent: JSONContent[] = [];
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let match;
        let currentPosition = 0;
        let remainingText = blockquoteContent;

        while ((match = linkRegex.exec(blockquoteContent)) !== null) {
          const [fullMatch, linkText, linkUrl] = match;
          const startIndex = match.index;

          // Add text before link if exists
          if (startIndex > currentPosition) {
            const textBefore = blockquoteContent.substring(
              currentPosition,
              startIndex
            );
            paragraphContent.push({
              type: 'text',
              text: textBefore,
            });
          }

          // Process URL
          let processedUrl = linkUrl.trim();
          if (
            !processedUrl.startsWith('http://') &&
            !processedUrl.startsWith('https://')
          ) {
            if (processedUrl.startsWith('www.')) {
              processedUrl = `https://${processedUrl}`;
            } else if (processedUrl.indexOf('.') > 0) {
              processedUrl = `https://${processedUrl}`;
            }
          }

          // Add link
          paragraphContent.push({
            type: 'text',
            text: linkText,
            marks: [
              {
                type: 'link',
                attrs: {
                  href: processedUrl,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                },
              },
            ],
          });

          currentPosition = startIndex + fullMatch.length;
        }

        // Add remaining text after last link if exists
        if (currentPosition < blockquoteContent.length) {
          (paragraphContent as JSONContent[]).push({
            type: 'text',
            text: blockquoteContent.substring(currentPosition),
          });
        }

        // Create blockquote node with links
        content.push({
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: paragraphContent,
            },
          ],
        });
      } else {
        // Create simple blockquote node
        content.push({
          type: 'blockquote',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: blockquoteContent }],
            },
          ],
        });
      }

      // Skip the processed blockquote lines
      i = j - 1;
      continue;
    }

    // Headings
    const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2];
      content.push({
        type: 'heading',
        attrs: { level },
        content: [{ type: 'text', text }],
      });
      continue;
    }

    // Unordered lists
    const unorderedListMatch = line.match(/^[*\-+]\s+(.+)$/);
    if (unorderedListMatch) {
      content.push({
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: unorderedListMatch[1] }],
              },
            ],
          },
        ],
      });
      continue;
    }

    // Ordered lists
    const orderedListMatch = line.match(/^[0-9]+\.\s+(.+)$/);
    if (orderedListMatch) {
      content.push({
        type: 'orderedList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: orderedListMatch[1] }],
              },
            ],
          },
        ],
      });
      continue;
    }

    // Code blocks
    if (line.startsWith('```')) {
      let codeContent = '';
      let j = i + 1;
      while (j < lines.length && !lines[j].trim().startsWith('```')) {
        codeContent += lines[j] + '\n';
        j++;
      }

      content.push({
        type: 'codeBlock',
        content: [{ type: 'text', text: codeContent }],
      });

      i = j; // Skip processed lines
      continue;
    }

    // Process Markdown link
    const linkMatch = line.match(/\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      const [fullMatch, linkText, linkUrl] = linkMatch;

      // Process URL
      let processedUrl = linkUrl.trim();
      if (
        !processedUrl.startsWith('http://') &&
        !processedUrl.startsWith('https://')
      ) {
        if (processedUrl.startsWith('www.')) {
          processedUrl = `https://${processedUrl}`;
        } else if (processedUrl.indexOf('.') > 0) {
          processedUrl = `https://${processedUrl}`;
        }
      }

      content.push({
        type: 'paragraph',
        content: [
          {
            type: 'text',
            text: linkText,
            marks: [
              {
                type: 'link',
                attrs: {
                  href: processedUrl,
                  target: '_blank',
                  rel: 'noopener noreferrer',
                },
              },
            ],
          },
        ],
      });
      continue;
    }

    // Process inline content with links
    if (line.includes('[') && line.includes('](')) {
      const paragraphContent: JSONContent[] = [];
      let currentPosition = 0;
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;

      while ((match = linkRegex.exec(line)) !== null) {
        const [fullMatch, linkText, linkUrl] = match;
        const startIndex = match.index;

        // Add text before link if exists
        if (startIndex > currentPosition) {
          const textBefore = line.substring(currentPosition, startIndex);
          paragraphContent.push({
            type: 'text',
            text: textBefore,
          });
        }

        // Process URL
        let processedUrl = linkUrl.trim();
        if (
          !processedUrl.startsWith('http://') &&
          !processedUrl.startsWith('https://')
        ) {
          if (processedUrl.startsWith('www.')) {
            processedUrl = `https://${processedUrl}`;
          } else if (processedUrl.indexOf('.') > 0) {
            processedUrl = `https://${processedUrl}`;
          }
        }

        // Add link
        paragraphContent.push({
          type: 'text',
          text: linkText,
          marks: [
            {
              type: 'link',
              attrs: {
                href: processedUrl,
                target: '_blank',
                rel: 'noopener noreferrer',
              },
            },
          ],
        });

        currentPosition = startIndex + fullMatch.length;
      }

      // Add remaining text after last link if exists
      if (currentPosition < line.length) {
        paragraphContent.push({
          type: 'text',
          text: line.substring(currentPosition),
        });
      }

      content.push({
        type: 'paragraph',
        content: paragraphContent,
      });
      continue;
    }

    // Regular paragraphs
    content.push({
      type: 'paragraph',
      content: [{ type: 'text', text: line }],
    });
  }

  // Insert content into editor
  editor.commands.insertContent(content);
  return true;
}

/**
 * Main handler for Markdown paste operations
 */
function handleMarkdownPaste(
  editor: Editor,
  view: EditorView,
  event: ClipboardEvent
): boolean {
  // Try handling URL paste first
  if (handleUrlPaste(view, event)) {
    return true; // handleUrlPaste now has its own cleanup
  }

  const clipboardText = event.clipboardData?.getData('text/plain');
  if (!clipboardText) return false;

  // Check for single Markdown link
  const onlyContainsSingleLink = /^\s*\[([^\]]+)\]\(([^)]+)\)\s*$/.test(
    clipboardText
  );
  if (onlyContainsSingleLink) {
    return handleMarkdownLinkPaste(view, event); // handleMarkdownLinkPaste now has its own cleanup
  }

  // Check for any Markdown formatting
  if (containsMarkdown(clipboardText)) {
    try {
      event.preventDefault();

      // Use direct TipTap node manipulation
      handleMarkdownDirectly(editor, clipboardText);

      // Ensure link format is cleared after paste - these commands use the editor API
      setTimeout(() => {
        // Force removal of all marks that shouldn't continue
        editor.commands.unsetLink();
        editor.commands.unsetBold();
        editor.commands.unsetItalic();
        editor.commands.unsetAllMarks();

        // Force set selection at end of content and focus
        editor.commands.focus('end');
      }, 10);

      return true;
    } catch (error) {
      console.error('Error handling markdown:', error);

      // Fallback to HTML conversion if direct approach fails
      try {
        const html = convertMarkdownToHTML(clipboardText);
        editor.commands.insertContent(html);

        // Clear any active formats after paste
        setTimeout(() => {
          editor.commands.unsetAllMarks();
          editor.commands.focus('end');
        }, 10);

        return true;
      } catch (e) {
        // Final fallback: insert raw text
        editor.commands.insertContent(clipboardText);

        // Still clear marks
        setTimeout(() => {
          editor.commands.unsetAllMarks();
          editor.commands.focus();
        }, 10);

        return true;
      }
    }
  }

  return false;
}

/**
 * Extension that adds Markdown paste handling to TipTap
 */
export const MarkdownPastePlugin = Extension.create({
  name: 'markdownPasteHandler',

  addProseMirrorPlugins() {
    const editor = this.editor;

    return [
      new Plugin({
        key: new PluginKey('markdownPasteHandler'),
        props: {
          handlePaste: (view, event) => {
            return handleMarkdownPaste(editor, view, event as ClipboardEvent);
          },
        },
      }),
    ];
  },
});
