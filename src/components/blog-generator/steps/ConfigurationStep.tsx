import React from 'react';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { TONE_OPTIONS } from '../constants';

interface ConfigurationStepProps {
  tone: string;
  authorStyle: string;
  targetWordCount: number;
  includeRegulatoryInfo: boolean;
  onToneChange: (value: string) => void;
  onAuthorStyleChange: (value: string) => void;
  onTargetWordCountChange: (n: number) => void;
  onIncludeRegulatoryChange: (v: boolean) => void;
}

export function ConfigurationStep({
  tone,
  authorStyle,
  targetWordCount,
  includeRegulatoryInfo,
  onToneChange,
  onAuthorStyleChange,
  onTargetWordCountChange,
  onIncludeRegulatoryChange,
}: ConfigurationStepProps) {
  return (
    <Paper sx={{ p: 3, maxWidth: 720 }}>
      <Typography variant="h6" gutterBottom>
        Tone & author style
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Configure how the blog should be written before research and generation.
      </Typography>

      <Stack spacing={3}>
        <FormControl fullWidth size="small">
          <InputLabel>Writing tone</InputLabel>
          <Select label="Writing tone" value={tone} onChange={(e) => onToneChange(e.target.value)}>
            {TONE_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          fullWidth
          size="small"
          label="Author style"
          placeholder="e.g. Paul Graham, Seth Godin, or describe a public writing voice"
          value={authorStyle}
          onChange={(e) => onAuthorStyleChange(e.target.value)}
          helperText="Mimic a well-known public writer or describe the voice you want — not an internal author list."
        />

        <Grid container spacing={2}>
          <Grid size={6}>
            <TextField
              fullWidth
              size="small"
              label="Target word count"
              type="number"
              value={targetWordCount}
              onChange={(e) => onTargetWordCountChange(Number(e.target.value))}
              inputProps={{ min: 500, max: 5000 }}
            />
          </Grid>
        </Grid>

        <FormControlLabel
          control={
            <Checkbox
              checked={includeRegulatoryInfo}
              onChange={(e) => onIncludeRegulatoryChange(e.target.checked)}
            />
          }
          label="Include regulatory information (HIPAA, compliance, etc.)"
        />
      </Stack>
    </Paper>
  );
}
