import React, { useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import type { Testimonial, VideoTestimonial } from '../../../types';
import { SERVICE_OPTIONS } from '../constants';
import { uid } from '../utils';

interface TestimonialsServicesStepProps {
  testimonials: Testimonial[];
  videoTestimonials: VideoTestimonial[];
  selectedVideoIds: string[];
  selectedServices: string[];
  onAddTestimonial: (t: Testimonial) => void;
  onRemoveTestimonial: (id: string) => void;
  onToggleVideo: (id: string) => void;
  onToggleService: (service: string) => void;
}

export function TestimonialsServicesStep({
  testimonials,
  videoTestimonials,
  selectedVideoIds,
  selectedServices,
  onAddTestimonial,
  onRemoveTestimonial,
  onToggleVideo,
  onToggleService,
}: TestimonialsServicesStepProps) {
  const [quote, setQuote] = useState('');
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');

  const handleAdd = () => {
    if (!quote.trim() || !name.trim()) return;
    onAddTestimonial({
      id: uid('t'),
      quote: quote.trim(),
      name: name.trim(),
      company: company.trim(),
      source: 'manual',
    });
    setQuote('');
    setName('');
    setCompany('');
  };

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
          <FormatQuoteIcon color="primary" />
          <Typography variant="h6">Testimonials</Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Review testimonials from the sheet or add new ones for inclusion in the blog.
        </Typography>

        {testimonials.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No testimonials yet. Add one below.
          </Typography>
        ) : (
          <Stack spacing={1.5}>
            {testimonials.map((t) => (
              <Box
                key={t.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: (theme) => alpha(theme.palette.primary.main, 0.02),
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="body2" fontStyle="italic">
                      &ldquo;{t.quote}&rdquo;
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      — {t.name}
                      {t.company && `, ${t.company}`}
                      {t.source === 'sheet' && ' · From sheet'}
                    </Typography>
                  </Box>
                  {t.source === 'manual' && (
                    <IconButton size="small" onClick={() => onRemoveTestimonial(t.id)}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  )}
                </Stack>
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Add testimonial
        </Typography>
        <Stack spacing={1.5}>
          <TextField
            fullWidth
            multiline
            minRows={2}
            size="small"
            label="Quote"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField fullWidth size="small" label="Name" value={name} onChange={(e) => setName(e.target.value)} />
            <TextField fullWidth size="small" label="Company" value={company} onChange={(e) => setCompany(e.target.value)} />
          </Stack>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAdd} sx={{ alignSelf: 'flex-start' }}>
            Add testimonial
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
          <VideocamOutlinedIcon color="secondary" />
          <Typography variant="h6">Video testimonials</Typography>
        </Stack>
        <Stack spacing={1}>
          {videoTestimonials.map((v) => (
            <FormControlLabel
              key={v.id}
              control={
                <Checkbox
                  checked={selectedVideoIds.includes(v.id)}
                  onChange={() => onToggleVideo(v.id)}
                />
              }
              label={
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {v.title}
                  </Typography>
                  {v.speaker && (
                    <Typography variant="caption" color="text.secondary">
                      {v.speaker}
                    </Typography>
                  )}
                </Box>
              }
            />
          ))}
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Services
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Select services to highlight in the blog.
        </Typography>
        <Stack direction="row" flexWrap="wrap" gap={1}>
          {SERVICE_OPTIONS.map((service) => {
            const selected = selectedServices.includes(service);
            return (
              <Chip
                key={service}
                label={service}
                onClick={() => onToggleService(service)}
                color={selected ? 'primary' : 'default'}
                variant={selected ? 'filled' : 'outlined'}
              />
            );
          })}
        </Stack>
      </Paper>
    </Stack>
  );
}
