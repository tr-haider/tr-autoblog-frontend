import React, { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  Typography,
  alpha,
} from '@mui/material';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import type { BlogPost } from '../../types';

interface BlogPreviewViewProps {
  blog: BlogPost;
  onCopy: () => void;
  onDownload: (format: 'docx' | 'html') => void;
  onBackToGenerate: () => void;
}

export function BlogPreviewView({
  blog,
  onCopy,
  onDownload,
  onBackToGenerate,
}: BlogPreviewViewProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: 8 }}>
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Blog preview</Typography>
            <Stack direction="row" spacing={1}>
              <Button size="small" variant="outlined" startIcon={<ContentCopyOutlinedIcon />} onClick={onCopy}>
                Copy
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                onClick={() => setExpanded(!expanded)}
              >
                {expanded ? 'Collapse' : 'Expand'}
              </Button>
            </Stack>
          </Stack>

          <Typography variant="h5" color="primary" gutterBottom fontWeight={700}>
            {blog.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {blog.summary}
          </Typography>
          <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
            <Chip label={`${blog.wordCount} words`} size="small" />
            <Chip label={`${blog.readingTime} min read`} size="small" />
            <Chip label={blog.topic} size="small" color="primary" variant="outlined" />
          </Stack>
          <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mb: 2 }}>
            {blog.keywords.map((kw) => (
              <Chip key={kw} label={kw} size="small" variant="outlined" />
            ))}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              maxHeight: expanded ? 'none' : 420,
              overflowY: expanded ? 'visible' : 'auto',
              borderRadius: 2,
              p: 2.5,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.03),
              border: '1px solid',
              borderColor: 'divider',
              '& h1, & h2, & h3': { color: 'primary.main', mt: 2, mb: 1 },
              '& p': { mb: 2, lineHeight: 1.75 },
              '& a': { color: 'primary.main' },
            }}
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </Paper>
      </Grid>

      <Grid size={{ xs: 12, lg: 4 }}>
        <Stack spacing={2}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Actions
            </Typography>
            <Stack spacing={1.5}>
              <Button fullWidth variant="outlined" startIcon={<ContentCopyOutlinedIcon />} onClick={onCopy}>
                Copy content
              </Button>
              <Button fullWidth variant="contained" startIcon={<DownloadOutlinedIcon />} onClick={() => onDownload('docx')}>
                Download DOCX
              </Button>
              <Button fullWidth variant="outlined" startIcon={<DownloadOutlinedIcon />} onClick={() => onDownload('html')}>
                Download HTML
              </Button>
              <Divider />
              <Button fullWidth variant="text" onClick={onBackToGenerate}>
                Generate another
              </Button>
            </Stack>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Statistics
            </Typography>
            <Stack spacing={1}>
              <Stat label="Topic" value={blog.topic} />
              <Stat label="Words" value={String(blog.wordCount)} />
              <Stat label="Reading time" value={`${blog.readingTime} min`} />
              <Stat label="Generated" value={new Date(blog.createdAt).toLocaleString()} />
            </Stack>
          </Paper>
        </Stack>
      </Grid>
    </Grid>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={500}>
        {value}
      </Typography>
    </Box>
  );
}
