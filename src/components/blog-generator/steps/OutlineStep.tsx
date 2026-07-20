import React from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { OutlineHeading } from '../../../types';
import { uid } from '../utils';

interface OutlineStepProps {
  outline: OutlineHeading[];
  outlineFinalized: boolean;
  generating: boolean;
  onGenerateOutline: () => void;
  onUpdateHeading: (id: string, text: string) => void;
  onUpdateLevel: (id: string, level: 2 | 3) => void;
  onAddHeading: () => void;
  onRemoveHeading: (id: string) => void;
  onFinalizedChange: (v: boolean) => void;
}

export function OutlineStep({
  outline,
  outlineFinalized,
  generating,
  onGenerateOutline,
  onUpdateHeading,
  onUpdateLevel,
  onAddHeading,
  onRemoveHeading,
  onFinalizedChange,
}: OutlineStepProps) {
  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Blog outline & headings
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generate an outline from your research, then edit and finalize headings before
              generation.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
            onClick={onGenerateOutline}
            disabled={generating}
          >
            {generating ? 'Generating…' : 'Generate outline'}
          </Button>
        </Stack>
      </Paper>

      {outline.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">
            Generate an outline or add headings manually.
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Stack spacing={1.5}>
            {outline.map((heading, index) => (
              <Stack key={heading.id} direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" color="text.secondary" sx={{ width: 24 }}>
                  {index + 1}
                </Typography>
                <Select
                  size="small"
                  value={heading.level}
                  onChange={(e) => onUpdateLevel(heading.id, e.target.value as 2 | 3)}
                  sx={{ width: 72 }}
                >
                  <MenuItem value={2}>H2</MenuItem>
                  <MenuItem value={3}>H3</MenuItem>
                </Select>
                <TextField
                  fullWidth
                  size="small"
                  value={heading.text}
                  onChange={(e) => onUpdateHeading(heading.id, e.target.value)}
                  placeholder="Heading text"
                />
                <IconButton size="small" onClick={() => onRemoveHeading(heading.id)}>
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Stack>
            ))}
          </Stack>

          <Button startIcon={<AddIcon />} onClick={onAddHeading} sx={{ mt: 2 }}>
            Add heading
          </Button>
        </Paper>
      )}

      <FormControlLabel
        control={
          <Checkbox
            checked={outlineFinalized}
            onChange={(e) => onFinalizedChange(e.target.checked)}
            disabled={outline.length === 0}
          />
        }
        label="I have reviewed and finalized this outline"
      />
    </Stack>
  );
}

export function createEmptyHeading(): OutlineHeading {
  return { id: uid('oh'), level: 2, text: '' };
}
