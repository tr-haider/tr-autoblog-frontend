import React from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  IconButton,
  Link,
  Typography,
  alpha,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import type { TechnologyRiversLink } from '../../../types';

interface LinkRowProps {
  link: TechnologyRiversLink;
  checked: boolean;
  onToggle: () => void;
  color?: 'primary' | 'secondary';
  badge?: string;
  onDismiss?: () => void;
  showUrl?: boolean;
}

export function LinkRow({
  link,
  checked,
  onToggle,
  color = 'primary',
  badge,
  onDismiss,
  showUrl = true,
}: LinkRowProps) {
  return (
    <Box
      sx={{
        mb: 1,
        p: 1,
        borderRadius: 2,
        border: '1px solid',
        borderColor: checked ? `${color}.main` : 'divider',
        bgcolor: checked ? (t) => alpha(t.palette[color].main, 0.06) : 'transparent',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 0.5,
      }}
    >
      <FormControlLabel
        control={<Checkbox checked={checked} onChange={onToggle} color={color} size="small" />}
        label={
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="body2" fontWeight={600}>
              {link.title}
              {badge && (
                <Typography component="span" variant="caption" color="success.main" sx={{ ml: 1 }}>
                  {badge}
                </Typography>
              )}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              {link.category}
            </Typography>
            {showUrl && (
              <Link
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                variant="caption"
                sx={{ display: 'block', wordBreak: 'break-all', mt: 0.25 }}
                onClick={(e) => e.stopPropagation()}
              >
                {link.url}
              </Link>
            )}
          </Box>
        }
        sx={{ m: 0, flex: 1, alignItems: 'flex-start' }}
      />
      {onDismiss && (
        <IconButton
          size="small"
          aria-label="Remove from list"
          onClick={onDismiss}
          sx={{ mt: 0.25, flexShrink: 0 }}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
