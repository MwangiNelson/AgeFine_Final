"use client";

import { forwardRef, useImperativeHandle } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export interface RichTextEditorHandle {
  setContent: (html: string) => void;
  focus: () => void;
}

function ToolbarButton({
  editor, label, isActive, onClick, children,
}: {
  editor: Editor;
  label: string;
  isActive: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={isActive}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      disabled={!editor}
      className="w-8 h-8 grid place-items-center rounded-md font-sans text-sm transition-colors"
      style={{
        background: isActive ? "var(--cream)" : "transparent",
        color: isActive ? "var(--plum)" : "var(--plum-soft)",
      }}
    >
      {children}
    </button>
  );
}

const RichTextEditor = forwardRef<RichTextEditorHandle, {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
}>(function RichTextEditor({ value, onChange }, ref) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: value,
    immediatelyRender: false,
    editorProps: {
      attributes: { class: "prose-admin field-input min-h-[200px] focus:outline-none", role: "textbox", "aria-multiline": "true" },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  useImperativeHandle(ref, () => ({
    setContent: (html: string) => {
      editor?.commands.setContent(html);
      if (editor) onChange(editor.getHTML());
    },
    focus: () => editor?.commands.focus(),
  }), [editor, onChange]);

  if (!editor) {
    return <div className="field-input min-h-[200px]" aria-hidden="true" />;
  }

  return (
    <div>
      <div className="flex items-center gap-1 mb-2 p-1 rounded-md border w-fit" style={{ borderColor: "var(--line)" }}>
        <ToolbarButton editor={editor} label="Bold" isActive={editor.isActive("bold")} onClick={() => editor.chain().focus().toggleBold().run()}>
          <span className="font-bold">B</span>
        </ToolbarButton>
        <ToolbarButton editor={editor} label="Italic" isActive={editor.isActive("italic")} onClick={() => editor.chain().focus().toggleItalic().run()}>
          <span className="italic font-serif">I</span>
        </ToolbarButton>
        <ToolbarButton editor={editor} label="Heading" isActive={editor.isActive("heading", { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
          <span className="font-semibold text-xs">H</span>
        </ToolbarButton>
        <ToolbarButton editor={editor} label="Bullet list" isActive={editor.isActive("bulletList")} onClick={() => editor.chain().focus().toggleBulletList().run()}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></svg>
        </ToolbarButton>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
});

export default RichTextEditor;
