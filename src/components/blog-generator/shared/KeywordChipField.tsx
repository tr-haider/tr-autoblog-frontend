import React from 'react';
import { Box, Button, Chip, Stack, TextField, Typography } from '@mui/material';

interface KeywordChipFieldProps {
  label: string;
  placeholder: string;
  keywords: string[];
  inputValue: string;
  chipColor?: 'primary' | 'secondary';
  chipVariant?: 'filled' | 'outlined';
  onInputChange: (value: string) => void;
  onAdd: () => void;
  onRemove: (keyword: string) => void;
}

export function KeywordChipField({
  label,
  placeholder,
  keywords,
  inputValue,
  chipColor = 'primary',
  chipVariant = 'outlined',
  onInputChange,
  onAdd,
  onRemove,
}: KeywordChipFieldProps) {
  return (
    <Box>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {label}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
        <TextField
          size="small"
          fullWidth
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onAdd()}
        />
        <Button variant="outlined" onClick={onAdd}>
          Add
        </Button>
      </Stack>
      <Stack direction="row" flexWrap="wrap" gap={0.5}>
        {keywords.length === 0 ? (
          <Typography variant="caption" color="text.secondary">
            None added yet
          </Typography>
        ) : (
          keywords.map((kw) => (
            <Chip
              key={kw}
              label={kw}
              onDelete={() => onRemove(kw)}
              color={chipColor}
              variant={chipVariant}
              size="small"
            />
          ))
        )}
      </Stack>
    </Box>
  );
}
