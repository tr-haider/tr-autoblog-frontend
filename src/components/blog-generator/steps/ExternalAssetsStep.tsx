import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PodcastsIcon from '@mui/icons-material/Podcasts';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LinkIcon from '@mui/icons-material/Link';
import AddIcon from '@mui/icons-material/Add';

interface ExternalAssetsStepProps {
  podcastLinks: string[];
  selectedPodcasts: string[];
  bookLink: string;
  externalLinks: string[];
  onTogglePodcast: (url: string) => void;
  onBookLinkChange: (url: string) => void;
  onAddExternalLink: (url: string) => void;
  onRemoveExternalLink: (url: string) => void;
}

export function ExternalAssetsStep({
  podcastLinks,
  selectedPodcasts,
  bookLink,
  externalLinks,
  onTogglePodcast,
  onBookLinkChange,
  onAddExternalLink,
  onRemoveExternalLink,
}: ExternalAssetsStepProps) {
  const [newExternal, setNewExternal] = useState('');

  const handleAddExternal = () => {
    const url = newExternal.trim();
    if (!url) return;
    onAddExternalLink(url.startsWith('http') ? url : `https://${url}`);
    setNewExternal('');
  };

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <PodcastsIcon color="primary" />
          <Typography variant="h6">Podcasts (ghazenfer.com)</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select relevant podcast episodes to reference in the blog.
        </Typography>
        {podcastLinks.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No podcast links found in sheet data. Add external links below if needed.
          </Typography>
        ) : (
          <Stack spacing={0.5}>
            {podcastLinks.map((url) => (
              <FormControlLabel
                key={url}
                control={
                  <Checkbox
                    checked={selectedPodcasts.includes(url)}
                    onChange={() => onTogglePodcast(url)}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {url}
                  </Typography>
                }
              />
            ))}
          </Stack>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <MenuBookIcon color="secondary" />
          <Typography variant="h6">Book link</Typography>
        </Stack>
        <TextField
          fullWidth
          size="small"
          label="eBook / book URL"
          value={bookLink}
          onChange={(e) => onBookLinkChange(e.target.value)}
          placeholder="https://..."
        />
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <LinkIcon color="action" />
          <Typography variant="h6">Medium & external links</Typography>
        </Stack>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <TextField
            fullWidth
            size="small"
            placeholder="https://medium.com/..."
            value={newExternal}
            onChange={(e) => setNewExternal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddExternal()}
          />
          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddExternal}>
            Add
          </Button>
        </Stack>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {externalLinks.map((url) => (
            <Chip key={url} label={url} onDelete={() => onRemoveExternalLink(url)} size="small" />
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}
