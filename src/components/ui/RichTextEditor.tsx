import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Bold, Italic, List, ListOrdered, Heading2, Quote, Code } from 'lucide-react';
import { useEffect, useState } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

const MenuBar = ({ editor, isHtmlMode, setHtmlMode }: { editor: any, isHtmlMode: boolean, setHtmlMode: (val: boolean) => void }) => {
  if (!editor && !isHtmlMode) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 p-2 border-b border-gray-100 bg-gray-50 rounded-t-xl items-center">
      {!isHtmlMode && editor && (
        <>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={!editor.can().chain().focus().toggleBold().run()}
            className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${editor.isActive('bold') ? 'is-active bg-gray-200 text-blue-600' : ''}`}
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={!editor.can().chain().focus().toggleItalic().run()}
            className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${editor.isActive('italic') ? 'is-active bg-gray-200 text-blue-600' : ''}`}
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'is-active bg-gray-200 text-blue-600' : ''}`}
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${editor.isActive('bulletList') ? 'is-active bg-gray-200 text-blue-600' : ''}`}
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${editor.isActive('orderedList') ? 'is-active bg-gray-200 text-blue-600' : ''}`}
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded-lg hover:bg-gray-200 transition-colors ${editor.isActive('blockquote') ? 'is-active bg-gray-200 text-blue-600' : ''}`}
          >
            <Quote className="h-4 w-4" />
          </button>
        </>
      )}
      <div className="flex-1" />
      <button
        type="button"
        onClick={() => setHtmlMode(!isHtmlMode)}
        className={`p-2 px-3 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1 text-xs font-bold ${isHtmlMode ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
      >
        <Code className="h-4 w-4" /> 
        HTML
      </button>
    </div>
  );
};

export const RichTextEditor = ({ value, onChange }: RichTextEditorProps) => {
  const [isHtmlMode, setHtmlMode] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose-base lg:prose-lg xl:prose-2xl m-4 focus:outline-none min-h-[150px] max-w-none',
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML() && !isHtmlMode) {
      editor.commands.setContent(value);
    }
  }, [value, editor, isHtmlMode]);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-600 transition-all bg-gray-50 flex flex-col">
      <MenuBar editor={editor} isHtmlMode={isHtmlMode} setHtmlMode={setHtmlMode} />
      <div className="bg-white min-h-[150px] flex-1 flex flex-col relative">
         {isHtmlMode ? (
           <textarea 
             className="w-full min-h-[300px] p-4 text-sm font-mono text-gray-800 focus:outline-none resize-y"
             value={value}
             onChange={(e) => {
               onChange(e.target.value);
               if (editor) {
                 editor.commands.setContent(e.target.value);
               }
             }}
             placeholder="<p>Écrivez votre HTML ici...</p>"
           />
         ) : (
           <div className="px-4 py-2 flex-1">
             <EditorContent editor={editor} />
           </div>
         )}
      </div>
    </div>
  );
};
