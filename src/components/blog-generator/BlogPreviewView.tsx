import React from 'react';
import {
  Box,
  Button,
  Chip,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import type { BlogPost } from '../../types';

interface BlogPreviewViewProps {
  blog: BlogPost;
  onBlogChange: (blog: BlogPost) => void;
  onCopy: () => void;
  onDownload: (format: 'docx' | 'html') => void;
  onBackToGenerate: () => void;
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  return text ? text.split(' ').length : 0;
}

const scrollPanelHeight = { xs: '60vh', lg: 'calc(100vh - 280px)' };

const previewContentStyles = {
  p: 2.5,
  borderRadius: 2,
  bgcolor: (t: { palette: { primary: { main: string } } }) => alpha(t.palette.primary.main, 0.03),
  border: '1px solid',
  borderColor: 'divider',
  '& h1, & h2, & h3': { color: 'primary.main', mt: 2, mb: 1 },
  '& p': { mb: 2, lineHeight: 1.75 },
  '& a': { color: 'primary.main' },
  '& ul': { pl: 3, mb: 2 },
  '& li': { mb: 1 },
};

export function BlogPreviewView({
  blog,
  onBlogChange,
  onCopy,
  onDownload,
  onBackToGenerate,
}: BlogPreviewViewProps) {
  const handleContentChange = (content: string) => {
    const wordCount = countWords(content);
    onBlogChange({
      ...blog,
      content,
      wordCount,
      readingTime: Math.max(1, Math.ceil(wordCount / 200)),
    });
  };

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', sm: 'center' }}
          gap={2}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6">Blog draft</Typography>
          <Stack direction="row" flexWrap="wrap" gap={1}>
            <Button size="small" variant="outlined" startIcon={<ContentCopyOutlinedIcon />} onClick={onCopy}>
              Copy
            </Button>
            <Button size="small" variant="contained" startIcon={<DownloadOutlinedIcon />} onClick={() => onDownload('docx')}>
              Download DOCX
            </Button>
            <Button size="small" variant="outlined" startIcon={<DownloadOutlinedIcon />} onClick={() => onDownload('html')}>
              Download HTML
            </Button>
            <Button size="small" variant="text" onClick={onBackToGenerate}>
              Generate another
            </Button>
          </Stack>
        </Stack>

        <Stack direction="row" flexWrap="wrap" gap={1} alignItems="center">
          <Chip label={`${blog.wordCount} words`} size="small" />
          <Chip label={`${blog.readingTime} min read`} size="small" />
          <Chip label={blog.topic} size="small" color="primary" variant="outlined" />
          {blog.keywords.map((kw) => (
            <Chip key={kw} label={kw} size="small" variant="outlined" />
          ))}
          <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
            Generated {new Date(blog.createdAt).toLocaleString()}
          </Typography>
        </Stack>
      </Paper>

      <Paper
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column',
          maxHeight: scrollPanelHeight,
        }}
      >
        <Grid container spacing={2} sx={{ mb: 1.5, flexShrink: 0 }}>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Content (HTML)
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, lg: 6 }}>
            <Typography variant="subtitle2" fontWeight={700}>
              Rendered preview
            </Typography>
          </Grid>
        </Grid>

        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflowY: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
          }}
        >
          <Grid container spacing={0} sx={{ alignItems: 'flex-start' }}>
            <Grid
              size={{ xs: 12, lg: 6 }}
              sx={{
                borderRight: { lg: '1px solid' },
                borderColor: { lg: 'divider' },
                borderBottom: { xs: '1px solid', lg: 'none' },
              }}
            >
              <TextField
                fullWidth
                multiline
                value={blog.content}
                onChange={(e) => handleContentChange(e.target.value)}
                variant="standard"
                slotProps={{
                  input: {
                    disableUnderline: true,
                  },
                }}
                sx={{
                  '& .MuiInputBase-root': {
                    p: 2,
                    alignItems: 'flex-start',
                  },
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                    lineHeight: 1.6,
                    overflow: 'hidden !important',
                  },
                }}
              />
            </Grid>

            <Grid size={{ xs: 12, lg: 6 }}>
              <Box sx={previewContentStyles} dangerouslySetInnerHTML={{ __html: blog.content }} />
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Stack>
  );
}
