import React from 'react';
import { Box, Button, Paper, Stack } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';

interface WorkflowFooterProps {
  step: number;
  totalSteps: number;
  canContinue: boolean;
  isLastStep: boolean;
  loading?: boolean;
  onBack: () => void;
  onContinue: () => void;
  onGenerate: () => void;
}

export function WorkflowFooter({
  step,
  totalSteps,
  canContinue,
  isLastStep,
  loading,
  onBack,
  onContinue,
  onGenerate,
}: WorkflowFooterProps) {
  return (
    <Paper
      sx={{
        p: 2,
        position: 'sticky',
        bottom: 16,
        zIndex: 10,
        boxShadow: '0 -4px 24px rgba(0,0,0,0.06)',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={onBack}
          disabled={step === 0 || loading}
        >
          Back
        </Button>

        <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
          Step {step + 1} of {totalSteps}
        </Box>

        {isLastStep ? (
          <Button
            variant="contained"
            endIcon={<CreateOutlinedIcon />}
            onClick={onGenerate}
            disabled={!canContinue || loading}
          >
            {loading ? 'Generating…' : 'Generate blog'}
          </Button>
        ) : (
          <Button
            variant="contained"
            endIcon={<ArrowForwardIcon />}
            onClick={onContinue}
            disabled={!canContinue || loading}
          >
            Continue
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
