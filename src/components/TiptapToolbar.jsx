import React from 'react';
import { Box, IconButton, Divider, Tooltip } from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatListBulleted,
  FormatListNumbered,
  LooksOne,
  LooksTwo,
} from '@mui/icons-material';

const TiptapToolbar = ({ editor, themeColors }) => {
  if (!editor) {
    return null;
  }

  return (
    <Box sx={{ 
      borderBottom: 1, 
      borderColor: themeColors.border,
      p: 1,
      display: 'flex',
      flexWrap: 'wrap',
      gap: 0.5,
      bgcolor: themeColors.quillToolbar
    }}>
      <Tooltip title="Heading 1">
        <IconButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          size="small"
          sx={{
            color: editor.isActive('heading', { level: 1 }) ? themeColors.primary : themeColors.textPrimary,
            bgcolor: editor.isActive('heading', { level: 1 }) ? `${themeColors.primary}20` : 'transparent',
            '&:hover': {
              bgcolor: `${themeColors.primary}20`
            }
          }}
        >
          <LooksOne fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Heading 2">
        <IconButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          size="small"
          sx={{
            color: editor.isActive('heading', { level: 2 }) ? themeColors.primary : themeColors.textPrimary,
            bgcolor: editor.isActive('heading', { level: 2 }) ? `${themeColors.primary}20` : 'transparent',
            '&:hover': {
              bgcolor: `${themeColors.primary}20`
            }
          }}
        >
          <LooksTwo fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      <Tooltip title="Bold">
        <IconButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          size="small"
          sx={{
            color: editor.isActive('bold') ? themeColors.primary : themeColors.textPrimary,
            bgcolor: editor.isActive('bold') ? `${themeColors.primary}20` : 'transparent',
            '&:hover': {
              bgcolor: `${themeColors.primary}20`
            }
          }}
        >
          <FormatBold fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Italic">
        <IconButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          size="small"
          sx={{
            color: editor.isActive('italic') ? themeColors.primary : themeColors.textPrimary,
            bgcolor: editor.isActive('italic') ? `${themeColors.primary}20` : 'transparent',
            '&:hover': {
              bgcolor: `${themeColors.primary}20`
            }
          }}
        >
          <FormatItalic fontSize="small" />
        </IconButton>
      </Tooltip>

      <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

      <Tooltip title="Bullet List">
        <IconButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          size="small"
          sx={{
            color: editor.isActive('bulletList') ? themeColors.primary : themeColors.textPrimary,
            bgcolor: editor.isActive('bulletList') ? `${themeColors.primary}20` : 'transparent',
            '&:hover': {
              bgcolor: `${themeColors.primary}20`
            }
          }}
        >
          <FormatListBulleted fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Numbered List">
        <IconButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          size="small"
          sx={{
            color: editor.isActive('orderedList') ? themeColors.primary : themeColors.textPrimary,
            bgcolor: editor.isActive('orderedList') ? `${themeColors.primary}20` : 'transparent',
            '&:hover': {
              bgcolor: `${themeColors.primary}20`
            }
          }}
        >
          <FormatListNumbered fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default TiptapToolbar;