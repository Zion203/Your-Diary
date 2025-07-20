"use client"

import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Image from "@tiptap/extension-image"
import { Button } from "@/components/ui/button"
import { Bold, Italic, List, ListOrdered, Quote, Undo, Redo, Heading1, Heading2 } from "lucide-react"

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

export function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded-xl shadow-sm",
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: "prose prose-lg max-w-none focus:outline-none min-h-[300px] px-8 py-6",
      },
    },
  })

  if (!editor) {
    return null
  }

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-800/50">
        <div className="flex flex-wrap gap-1">
          <Button
            variant="ghost"
            size="sm"
            type="button"

            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`h-9 px-3 ${editor.isActive("heading", { level: 1 })
                ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700"
              }`}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"

            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`h-9 px-3 ${editor.isActive("heading", { level: 2 })
                ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700"
              }`}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 my-1.5" />
          <Button
            variant="ghost"
            size="sm"
            type="button"

            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-9 px-3 ${editor.isActive("bold")
                ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700"
              }`}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"

            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`h-9 px-3 ${editor.isActive("italic")
                ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700"
              }`}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 my-1.5" />
          <Button
            variant="ghost"
            size="sm"
            type="button"

            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`h-9 px-3 ${editor.isActive("bulletList")
                ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700"
              }`}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"

            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`h-9 px-3 ${editor.isActive("orderedList")
                ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700"
              }`}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`h-9 px-3 ${editor.isActive("blockquote")
                ? "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700"
              }`}
          >
            <Quote className="h-4 w-4" />
          </Button>
          <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1 my-1.5" />
          <Button
            variant="ghost"
            size="sm"
            type="button"

            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="h-9 px-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            type="button"

            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="h-9 px-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-700 disabled:opacity-50"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <EditorContent editor={editor} className="min-h-[300px] bg-white dark:bg-slate-800" />
    </div>
  )
}
