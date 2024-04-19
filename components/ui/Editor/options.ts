import { API, BlockMutationEvent, EditorConfig } from '@editorjs/editorjs';

// Editor options
export const options: EditorConfig = {
  placeholder: 'Enter for new paragraph',
  autofocus: false,
  hideToolbar: true,
  onReady: () => {},

  onChange: (api: API, event: BlockMutationEvent | BlockMutationEvent[]) => {},
};
