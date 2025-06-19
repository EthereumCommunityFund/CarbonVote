import { Extension } from '@tiptap/core';
import { Plugin, PluginKey, TextSelection } from 'prosemirror-state';

export const MarkdownLinkPlugin = Extension.create({
  name: 'markdownLinks',

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('markdownLinks'),
        props: {
          handleKeyDown: (view, event) => {
            if (event.key === ' ' || event.key === 'Enter') {
              const { state, dispatch } = view;

              if (!state.selection.empty) return false;
              const $head = state.selection.$head;

              const lineStart = $head.nodeBefore
                ? $head.pos - $head.nodeBefore.nodeSize
                : 0;
              const textBefore = state.doc.textBetween(
                lineStart,
                $head.pos,
                ' '
              );

              // Process URL links
              const urlRegex = /(https?:\/\/[^\s]+)$/;
              const urlMatch = textBefore.match(urlRegex);
              if (urlMatch) {
                return processLink(
                  urlMatch[0],
                  urlMatch[0],
                  $head.pos,
                  state,
                  dispatch
                );
              }

              // Process markdown links [text](url)
              const linkMatch = textBefore.match(/\[([^\]]+)\]\(([^)]+)\)$/);
              if (linkMatch) {
                const [fullMatch, linkText, linkUrl] = linkMatch;
                const processedUrl = processUrl(linkUrl);
                return processMarkdownLink(
                  fullMatch,
                  linkText,
                  processedUrl,
                  $head.pos,
                  state,
                  dispatch
                );
              }

              // Process markdown image links ![alt](url)
              const imageMatch = textBefore.match(/!\[([^\]]*)\]\(([^)]+)\)$/);
              if (imageMatch) {
                const [fullMatch, altText, imageUrl] = imageMatch;
                const processedUrl = processUrl(imageUrl);
                return processMarkdownLink(
                  fullMatch,
                  altText,
                  processedUrl,
                  $head.pos,
                  state,
                  dispatch
                );
              }
            }

            return false;
          },
        },
      }),
    ];
  },
});

// Helper functions

function processUrl(url: string): string {
  let processedUrl = url.trim();
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
  return processedUrl;
}

function processLink(
  fullUrl: string,
  url: string,
  pos: number,
  state: any,
  dispatch: any
): boolean {
  const start = pos - fullUrl.length;
  const tr = state.tr;

  const linkMark = state.schema.marks.link.create({ href: url });
  tr.addMark(start, pos, linkMark);
  tr.insertText(' ', pos);
  tr.setSelection(TextSelection.create(tr.doc, pos + 1));
  tr.removeStoredMark(linkMark);

  dispatch(tr);
  return true;
}

function processMarkdownLink(
  fullMatch: string,
  text: string,
  url: string,
  pos: number,
  state: any,
  dispatch: any
): boolean {
  const start = pos - fullMatch.length;
  const tr = state.tr;

  tr.delete(start, pos);
  tr.insertText(text, start);

  const linkMark = state.schema.marks.link.create({ href: url });
  tr.addMark(start, start + text.length, linkMark);
  tr.insertText(' ', start + text.length);
  tr.setSelection(TextSelection.create(tr.doc, start + text.length + 1));
  tr.removeStoredMark(linkMark);

  dispatch(tr);
  return true;
}
