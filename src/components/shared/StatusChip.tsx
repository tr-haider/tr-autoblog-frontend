import React from 'react';
import { Chip } from '@mui/material';
import { statusColors } from '../../theme/theme';

interface StatusChipProps {
  status: string;
  size?: 'small' | 'medium';
}

export function StatusChip({ status, size = 'small' }: StatusChipProps) {
  const style = statusColors[status] || statusColors.default;
  return (
    <Chip
      label={status || '—'}
      size={size}
      sx={{
        bgcolor: style.bg,
        color: style.color,
        fontWeight: 600,
        border: 'none',
      }}
    />
  );
}
