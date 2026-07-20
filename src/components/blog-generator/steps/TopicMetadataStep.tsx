import React from 'react';
import {
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';
import type { ContentTrackerRow } from '../../../types';
import { StatusChip } from '../../shared/StatusChip';
import { KeywordChipField } from '../shared/KeywordChipField';
import { SheetMetadataPanel } from '../shared/SheetMetadataPanel';
import { parseSecondaryKeywords } from '../utils';

interface TopicMetadataStepProps {
  sheetTopics: ContentTrackerRow[];
  loadingTopics: boolean;
  selectedTopic: string;
  selectedRow: ContentTrackerRow | null;
  customTopic: string;
  primaryKeywords: string[];
  primaryKeywordInput: string;
  secondaryKeywords: string[];
  secondaryKeywordInput: string;
  onRefreshTopics: () => void;
  onTopicSelect: (row: ContentTrackerRow) => void;
  onCustomTopicChange: (value: string) => void;
  onPrimaryKeywordInputChange: (value: string) => void;
  onAddPrimaryKeyword: () => void;
  onRemovePrimaryKeyword: (keyword: string) => void;
  onSecondaryKeywordInputChange: (value: string) => void;
  onAddSecondaryKeyword: () => void;
  onRemoveSecondaryKeyword: (keyword: string) => void;
  onMetadataChange: (field: keyof ContentTrackerRow, value: string) => void;
}

function KeywordFields(props: TopicMetadataStepProps) {
  return (
    <Stack spacing={2.5}>
      <KeywordChipField
        label="Primary keywords"
        placeholder="Add primary keyword…"
        keywords={props.primaryKeywords}
        inputValue={props.primaryKeywordInput}
        chipColor="primary"
        chipVariant="filled"
        onInputChange={props.onPrimaryKeywordInputChange}
        onAdd={props.onAddPrimaryKeyword}
        onRemove={props.onRemovePrimaryKeyword}
      />
      <KeywordChipField
        label="Secondary keywords"
        placeholder="Add secondary keyword…"
        keywords={props.secondaryKeywords}
        inputValue={props.secondaryKeywordInput}
        chipColor="secondary"
        chipVariant="outlined"
        onInputChange={props.onSecondaryKeywordInputChange}
        onAdd={props.onAddSecondaryKeyword}
        onRemove={props.onRemoveSecondaryKeyword}
      />
    </Stack>
  );
}

export function TopicMetadataStep(props: TopicMetadataStepProps) {
  const theme = useTheme();
  const {
    sheetTopics,
    loadingTopics,
    selectedTopic,
    selectedRow,
    customTopic,
    onRefreshTopics,
    onTopicSelect,
    onCustomTopicChange,
  } = props;
  const fromSheet = Boolean(selectedRow);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, lg: fromSheet ? 6 : 12 }}>
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
            <TopicOutlinedIcon color="primary" />
            <Typography variant="h6">
              {fromSheet ? 'Topic from sheet' : 'Topic selection'}
            </Typography>
          </Stack>

          {fromSheet ? (
            <Stack spacing={2.5}>
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  border: '2px solid',
                  borderColor: 'primary.main',
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={1}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700} color="primary">
                      {selectedRow!.title}
                    </Typography>
                    {selectedRow!.angle && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {selectedRow!.angle}
                      </Typography>
                    )}
                  </Box>
                  {selectedRow!.status && <StatusChip status={selectedRow!.status} />}
                </Stack>
              </Box>

              <Typography variant="body2" color="text.secondary">
                Keywords from your sheet row — add or remove as needed before continuing.
              </Typography>

              <KeywordFields {...props} />
            </Stack>
          ) : (
            <>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Topics from Google Sheets — Blogs AI Mostly
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={onRefreshTopics}
                  startIcon={<RefreshIcon />}
                  disabled={loadingTopics}
                >
                  {loadingTopics ? 'Loading…' : 'Refresh'}
                </Button>
              </Stack>

              {loadingTopics && <LinearProgress sx={{ mb: 2 }} />}

              <Box sx={{ maxHeight: 360, overflowY: 'auto', pr: 0.5 }}>
                {sheetTopics.length === 0 && !loadingTopics ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No topics available. Check the Content Tracker tab or refresh.
                  </Typography>
                ) : (
                  sheetTopics.map((row, index) => {
                    const selected = selectedTopic === row.title;
                    const primaryKws = parseSecondaryKeywords(row.primaryKeyword);
                    const secondaryKws = parseSecondaryKeywords(row.secondaryKeywords);
                    return (
                      <Card
                        key={`${index}-${row.title}`}
                        sx={{
                          mb: 1,
                          border: 2,
                          borderColor: selected ? 'primary.main' : 'divider',
                          bgcolor: selected
                            ? alpha(theme.palette.primary.main, 0.04)
                            : 'background.paper',
                        }}
                      >
                        <CardActionArea onClick={() => onTopicSelect(row)}>
                          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="flex-start"
                              gap={1}
                            >
                              <Typography variant="subtitle2" fontWeight={600} color="primary">
                                {row.title}
                              </Typography>
                              {row.status && <StatusChip status={row.status} />}
                            </Stack>
                            {row.angle && (
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5, fontSize: '0.8rem' }}
                              >
                                {row.angle}
                              </Typography>
                            )}
                            {(primaryKws.length > 0 || secondaryKws.length > 0) && (
                              <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
                                {primaryKws.slice(0, 3).map((kw) => (
                                  <Chip
                                    key={`p-${kw}`}
                                    label={kw}
                                    size="small"
                                    color="primary"
                                    sx={{ height: 22 }}
                                  />
                                ))}
                                {secondaryKws.slice(0, 4).map((kw) => (
                                  <Chip
                                    key={`s-${kw}`}
                                    label={kw}
                                    size="small"
                                    variant="outlined"
                                    sx={{ height: 22 }}
                                  />
                                ))}
                              </Stack>
                            )}
                          </CardContent>
                        </CardActionArea>
                      </Card>
                    );
                  })
                )}
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Custom topic
              </Typography>
              <TextField
                fullWidth
                size="small"
                placeholder="e.g. Solving API Integration Challenges with Modern Tools"
                value={customTopic}
                onChange={(e) => onCustomTopicChange(e.target.value)}
                sx={{ mb: 2 }}
              />

              {(customTopic || selectedTopic) && <KeywordFields {...props} />}
            </>
          )}
        </Paper>
      </Grid>

      {selectedRow && (
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Sheet metadata
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Edit sheet fields below. Links are only clickable when the value is a valid URL.
            </Typography>
            <SheetMetadataPanel
              key={selectedRow.title}
              row={selectedRow}
              onChange={props.onMetadataChange}
            />
          </Paper>
        </Grid>
      )}
    </Grid>
  );
}
