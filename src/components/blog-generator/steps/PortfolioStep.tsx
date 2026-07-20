import React from 'react';
import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import type { PortfolioItem } from '../../../types';

interface PortfolioStepProps {
  items: PortfolioItem[];
  selectedIds: string[];
  summaries: Record<string, string>;
  onToggle: (id: string) => void;
  onGenerateSummary: (id: string) => void;
}

export function PortfolioStep({
  items,
  selectedIds,
  summaries,
  onToggle,
  onGenerateSummary,
}: PortfolioStepProps) {
  const theme = useTheme();

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <WorkOutlineIcon color="primary" />
          <Typography variant="h6">Portfolio library</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Select portfolio case studies from the site sitemap to reference in the blog. Summaries are
          auto-generated for selected items.
        </Typography>
        <Chip label={`${selectedIds.length} selected`} size="small" color="primary" sx={{ mt: 2 }} />
      </Paper>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 2,
        }}
      >
        {items.map((item) => {
          const selected = selectedIds.includes(item.id);
          return (
            <Card
              key={item.id}
              sx={{
                border: 2,
                borderColor: selected ? 'primary.main' : 'divider',
                bgcolor: selected ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
              }}
            >
              <CardActionArea onClick={() => onToggle(item.id)}>
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="flex-start">
                    <Checkbox checked={selected} size="small" sx={{ p: 0, mt: 0.25 }} />
                    <Box>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {item.title}
                      </Typography>
                      <Chip label={item.category} size="small" variant="outlined" sx={{ my: 0.5 }} />
                      <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                        {item.description}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>

      {selectedIds.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            Selected item summaries
          </Typography>
          <Stack spacing={2}>
            {selectedIds.map((id) => {
              const item = items.find((i) => i.id === id);
              if (!item) return null;
              return (
                <Box key={id}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Typography variant="body2" fontWeight={600}>
                      {item.title}
                    </Typography>
                    {!summaries[id] && (
                      <Chip
                        label="Generate summary"
                        size="small"
                        color="primary"
                        onClick={() => onGenerateSummary(id)}
                        sx={{ cursor: 'pointer' }}
                      />
                    )}
                  </Stack>
                  <TextField
                    fullWidth
                    multiline
                    minRows={2}
                    size="small"
                    value={summaries[id] || ''}
                    placeholder="Summary will appear here after generation…"
                    InputProps={{ readOnly: true }}
                  />
                </Box>
              );
            })}
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
