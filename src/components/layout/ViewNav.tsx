import React from 'react';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import PreviewOutlinedIcon from '@mui/icons-material/PreviewOutlined';
import type { AppView } from '../../types';

interface ViewNavProps {
  view: AppView;
  onChange: (view: AppView) => void;
  previewDisabled: boolean;
}

export function ViewNav({ view, onChange, previewDisabled }: ViewNavProps) {
  return (
    <ToggleButtonGroup
      exclusive
      value={view}
      onChange={(_, v) => v && onChange(v)}
      size="small"
      sx={{
        bgcolor: 'action.hover',
        borderRadius: 2,
        p: 0.5,
        '& .MuiToggleButton-root': {
          border: 'none',
          borderRadius: '8px !important',
          px: { xs: 1.5, sm: 2 },
          py: 0.75,
          gap: 0.75,
          '&.Mui-selected': {
            bgcolor: 'background.paper',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          },
        },
      }}
    >
      <ToggleButton value="tracker">
        <TableChartOutlinedIcon sx={{ fontSize: 18 }} />
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          Tracker
        </Box>
      </ToggleButton>
      <ToggleButton value="generate">
        <CreateOutlinedIcon sx={{ fontSize: 18 }} />
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          Generate
        </Box>
      </ToggleButton>
      <ToggleButton value="preview" disabled={previewDisabled}>
        <PreviewOutlinedIcon sx={{ fontSize: 18 }} />
        <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
          Preview
        </Box>
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
