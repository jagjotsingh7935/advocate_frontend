import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Box, CircularProgress } from '@mui/material';
import TiptapToolbar from './TiptapToolbar';

const TiptapEditor = ({ value, onChange, placeholder, theme, themeColors, isSmallMobile }) => {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Type your message here...',
      }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: theme === 'dark' ? 'tiptap-dark' : 'tiptap-light',
        style: 'min-height: 110px; padding: 12px; outline: none;',
      },
    },
  });

  // Update editor content when value changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [editor, value]);

  if (!editor) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '150px' }}>
        <CircularProgress size={24} sx={{ color: themeColors.primary }} />
      </Box>
    );
  }

  return (
    <Box sx={{ 
      border: 1, 
      borderColor: themeColors.border,
      borderRadius: 1,
      overflow: 'hidden',
      bgcolor: themeColors.quillBg,
    }}>
      <TiptapToolbar editor={editor} themeColors={themeColors} />
      <EditorContent editor={editor} />
      <style>
        {`
          .tiptap-dark .ProseMirror {
            color: white;
            background-color: #2a2a2a;
            min-height: 110px;
            padding: 12px;
          }
          .tiptap-light .ProseMirror {
            color: #1e293b;
            background-color: white;
            min-height: 110px;
            padding: 12px;
          }
          .tiptap-dark .ProseMirror p.is-editor-empty:first-child::before {
            color: rgba(255, 255, 255, 0.6);
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
          }
          .tiptap-light .ProseMirror p.is-editor-empty:first-child::before {
            color: rgba(0, 0, 0, 0.6);
            content: attr(data-placeholder);
            float: left;
            height: 0;
            pointer-events: none;
          }
          .ProseMirror:focus {
            outline: none;
          }
          .ProseMirror ul, .ProseMirror ol {
            padding-left: 24px;
          }
          .ProseMirror h1 {
            font-size: 2em;
            font-weight: bold;
            margin: 0.67em 0;
          }
          .ProseMirror h2 {
            font-size: 1.5em;
            font-weight: bold;
            margin: 0.75em 0;
          }
          .ProseMirror strong {
            font-weight: bold;
          }
          .ProseMirror em {
            font-style: italic;
          }
        `}
      </style>
    </Box>
  );
};

export default TiptapEditor;