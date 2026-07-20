import React from 'react';
import {
  Box,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { TONE_OPTIONS } from '../constants';

interface GenerateStepProps {
  topic: string;
  tone: string;
  authorStyle: string;
  primaryKeywords: string[];
  secondaryKeywords: string[];
  researchQuestionsText: string;
  selectedLinkCount: number;
  selectedPortfolioCount: number;
  testimonialCount: number;
  selectedServiceCount: number;
  selectedPodcastCount: number;
  externalLinkCount: number;
  introInstructions: string;
  summaryInstructions: string;
  onIntroChange: (v: string) => void;
  onSummaryChange: (v: string) => void;
}

export function GenerateStep({
  topic,
  tone,
  authorStyle,
  primaryKeywords,
  secondaryKeywords,
  researchQuestionsText,
  selectedLinkCount,
  selectedPortfolioCount,
  testimonialCount,
  selectedServiceCount,
  selectedPodcastCount,
  externalLinkCount,
  introInstructions,
  summaryInstructions,
  onIntroChange,
  onSummaryChange,
}: GenerateStepProps) {
  const toneLabel = TONE_OPTIONS.find((t) => t.value === tone)?.label ?? tone;
  const questionCount = researchQuestionsText
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean).length;

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Pre-flight review
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Review your configuration before generating the full blog draft.
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <SummaryItem label="Topic" value={topic} />
            <SummaryItem label="Tone" value={toneLabel} />
            <SummaryItem label="Author style" value={authorStyle || '—'} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {primaryKeywords.length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Primary keywords
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                  {primaryKeywords.map((kw) => (
                    <Chip key={kw} label={kw} size="small" color="primary" />
                  ))}
                </Stack>
              </Box>
            )}
            {secondaryKeywords.length > 0 && (
              <Box sx={{ mb: 1.5 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Secondary keywords
                </Typography>
                <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 0.5 }}>
                  {secondaryKeywords.map((kw) => (
                    <Chip key={kw} label={kw} size="small" variant="outlined" />
                  ))}
                </Stack>
              </Box>
            )}
            <SummaryItem
              label="Research topics"
              value={questionCount > 0 ? `${questionCount} topics to address` : 'None'}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" flexWrap="wrap" gap={1}>
          <Chip label={`${selectedLinkCount} internal links`} size="small" />
          <Chip label={`${selectedPortfolioCount} portfolio items`} size="small" />
          <Chip label={`${testimonialCount} testimonials`} size="small" />
          <Chip label={`${selectedServiceCount} services`} size="small" />
          <Chip label={`${selectedPodcastCount} podcasts`} size="small" />
          <Chip label={`${externalLinkCount} external links`} size="small" />
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Intro & summary instructions
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Optional guidance for how the blog should open and close.
        </Typography>
        <Stack spacing={2}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Introduction instructions"
            placeholder="e.g. Open with a client pain point and tie to Technology Rivers expertise…"
            value={introInstructions}
            onChange={(e) => onIntroChange(e.target.value)}
          />
          <TextField
            fullWidth
            multiline
            minRows={3}
            label="Summary / conclusion instructions"
            placeholder="e.g. End with a soft CTA to schedule a consultation…"
            value={summaryInstructions}
            onChange={(e) => onSummaryChange(e.target.value)}
          />
        </Stack>
      </Paper>
    </Stack>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
