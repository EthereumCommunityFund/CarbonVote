import dynamic from "next/dynamic";

const ReactQuillNoSSR = dynamic(() => import('react-quill'), { ssr: false });

interface TextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const TextEditor: React.FC<TextEditorProps> = ({ value, onChange }) => {
  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ size: [] }],
      [{ font: [] }],
      [{ align: ["right", "center", "justify"] }],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      [{ color: ["red", "#785412"] }],
      [{ background: ["red", "#785412"] }]
    ]
  }

  const formats = [
    "header", "bold", "italic", "underline", "strike", "blockquote", "list", "bullet", "link", "color", "image", "background", "align", "size", "font"
  ]
  return (
    <ReactQuillNoSSR
      className={"w-full flex flex-col gap-2"}
      placeholder={"Enter Description"}
      value={value}
      onChange={onChange}
      modules={modules}
      formats={formats}
    />
  );
};

export default TextEditor;
