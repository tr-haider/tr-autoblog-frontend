import React from 'react';
import { Button, Chip, Paper, Stack, Typography, alpha, useTheme } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';
import type { ContentTrackerRow } from '../../../types';
import { StatusChip } from '../../shared/StatusChip';

interface TopicBannerProps {
  activeTopic: string;
  selectedRow: ContentTrackerRow | null;
  customTopic: string;
  primaryKeywords: string[];
  secondaryKeywords: string[];
  onClear: () => void;
}

export function TopicBanner({
  activeTopic,
  selectedRow,
  customTopic,
  primaryKeywords,
  secondaryKeywords,
  onClear,
}: TopicBannerProps) {
  const theme = useTheme();

  if (!activeTopic) {
    return (
      <Paper
        sx={{
          p: 2.5,
          bgcolor: alpha(theme.palette.warning.main, 0.06),
          border: '1px dashed',
          borderColor: alpha(theme.palette.warning.main, 0.4),
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <TopicOutlinedIcon color="warning" />
          <Typography variant="body2" color="text.secondary">
            Select a topic from the list below, or enter a custom topic to begin.
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      sx={{
        p: 2.5,
        border: 2,
        borderColor: 'primary.main',
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.03)} 100%)`,
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" gap={2}>
        <Stack spacing={1} sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap">
            <EditNoteOutlinedIcon color="primary" fontSize="small" />
            <Typography variant="overline" color="primary.main" fontWeight={700}>
              Writing about
            </Typography>
            {selectedRow?.status && <StatusChip status={selectedRow.status} />}
            {customTopic && !selectedRow && (
              <Chip label="Custom topic" size="small" color="secondary" variant="outlined" />
            )}
            {selectedRow && (
              <Chip label="From sheet" size="small" color="primary" variant="outlined" />
            )}
          </Stack>
          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3 }}>
            {activeTopic}
          </Typography>
          {selectedRow?.angle && (
            <Typography variant="body2" color="text.secondary">
              {selectedRow.angle}
            </Typography>
          )}
          <Stack direction="row" flexWrap="wrap" gap={0.5} alignItems="center">
            {primaryKeywords.map((kw) => (
              <Chip key={`p-${kw}`} label={kw} size="small" color="primary" />
            ))}
            {secondaryKeywords.slice(0, 5).map((kw) => (
              <Chip key={`s-${kw}`} label={kw} size="small" variant="outlined" />
            ))}
          </Stack>
        </Stack>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          startIcon={<CloseIcon />}
          onClick={onClear}
          sx={{ flexShrink: 0 }}
        >
          Clear
        </Button>
      </Stack>
    </Paper>
  );
}
