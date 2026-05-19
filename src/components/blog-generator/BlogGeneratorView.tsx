import React from 'react';
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
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
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import TopicOutlinedIcon from '@mui/icons-material/TopicOutlined';
import type { TechnologyRiversLink, TrendingTopic } from '../../types';

export interface BlogGeneratorViewProps {
  trendingTopics: TrendingTopic[];
  loadingTopics: boolean;
  selectedTopic: string;
  customTopic: string;
  keywords: string[];
  keywordInput: string;
  selectedLinks: string[];
  targetWordCount: number;
  tone: string;
  includeRegulatoryInfo: boolean;
  resourceLinks: TechnologyRiversLink[];
  blogLinks: TechnologyRiversLink[];
  loading: boolean;
  loadingMoreBlogs: boolean;
  hasMoreBlogs: boolean;
  currentBlogPage: number;
  onRefreshTopics: () => void;
  onTopicSelect: (topic: TrendingTopic) => void;
  onCustomTopicChange: (value: string) => void;
  onKeywordInputChange: (value: string) => void;
  onAddKeyword: () => void;
  onRemoveKeyword: (keyword: string) => void;
  onToggleLink: (url: string) => void;
  onTargetWordCountChange: (n: number) => void;
  onToneChange: (tone: string) => void;
  onIncludeRegulatoryChange: (v: boolean) => void;
  onLoadMoreBlogs: () => void;
  onGenerate: () => void;
}

export function BlogGeneratorView(props: BlogGeneratorViewProps) {
  const theme = useTheme();
  const {
    trendingTopics,
    loadingTopics,
    selectedTopic,
    customTopic,
    keywords,
    keywordInput,
    selectedLinks,
    targetWordCount,
    tone,
    includeRegulatoryInfo,
    resourceLinks,
    blogLinks,
    loading,
    loadingMoreBlogs,
    hasMoreBlogs,
    currentBlogPage,
    onRefreshTopics,
    onTopicSelect,
    onCustomTopicChange,
    onKeywordInputChange,
    onAddKeyword,
    onRemoveKeyword,
    onToggleLink,
    onTargetWordCountChange,
    onToneChange,
    onIncludeRegulatoryChange,
    onLoadMoreBlogs,
    onGenerate,
  } = props;

  const canGenerate =
    !loading && (selectedTopic || customTopic) && keywords.length > 0;

  return (
    <Stack spacing={3}>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
              <TopicOutlinedIcon color="primary" />
              <Typography variant="h6">Topic selection</Typography>
            </Stack>

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="text.secondary">
                AI-suggested topics
              </Typography>
              <Button
                size="small"
                variant="outlined"
                onClick={onRefreshTopics}
                startIcon={<RefreshIcon />}
                disabled={loadingTopics}
              >
                {loadingTopics ? 'Generating…' : 'Refresh'}
              </Button>
            </Stack>

            {loadingTopics && <LinearProgress sx={{ mb: 2 }} />}

            <Box sx={{ maxHeight: 320, overflowY: 'auto', pr: 0.5 }}>
              {trendingTopics.map((topic, index) => {
                const selected = selectedTopic === topic.title;
                return (
                  <Card
                    key={index}
                    sx={{
                      mb: 1,
                      border: 2,
                      borderColor: selected ? 'primary.main' : 'divider',
                      bgcolor: selected ? alpha(theme.palette.primary.main, 0.04) : 'background.paper',
                    }}
                  >
                    <CardActionArea onClick={() => onTopicSelect(topic)}>
                      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="subtitle2" fontWeight={600} color="primary">
                            {topic.title}
                          </Typography>
                          {topic.source === 'ai-generated' && (
                            <Chip label="AI" size="small" color="secondary" sx={{ height: 20, fontSize: '0.65rem' }} />
                          )}
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, fontSize: '0.8rem' }}>
                          {topic.description}
                        </Typography>
                        <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ mt: 1 }}>
                          {topic.keywords.slice(0, 5).map((kw, i) => (
                            <Chip key={i} label={kw} size="small" variant="outlined" sx={{ height: 22 }} />
                          ))}
                        </Stack>
                      </CardContent>
                    </CardActionArea>
                  </Card>
                );
              })}
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
            />
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, lg: 6 }}>
          <Stack spacing={3}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Configuration
              </Typography>

              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Keywords
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Add keyword…"
                  value={keywordInput}
                  onChange={(e) => onKeywordInputChange(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && onAddKeyword()}
                />
                <Button variant="outlined" onClick={onAddKeyword}>
                  Add
                </Button>
              </Stack>
              <Stack direction="row" flexWrap="wrap" gap={0.5}>
                {keywords.map((kw) => (
                  <Chip key={kw} label={kw} onDelete={() => onRemoveKeyword(kw)} color="primary" variant="outlined" size="small" />
                ))}
              </Stack>

              <Grid container spacing={2} sx={{ mt: 2 }}>
                <Grid size={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Word count"
                    type="number"
                    value={targetWordCount}
                    onChange={(e) => onTargetWordCountChange(Number(e.target.value))}
                    inputProps={{ min: 500, max: 3000 }}
                  />
                </Grid>
                <Grid size={6}>
                  <Autocomplete
                    size="small"
                    options={['professional', 'casual', 'technical', 'executive']}
                    value={tone}
                    onChange={(_, v) => onToneChange(v || 'professional')}
                    renderInput={(params) => <TextField {...params} label="Tone" />}
                  />
                </Grid>
              </Grid>

              <FormControlLabel
                sx={{ mt: 1 }}
                control={
                  <Checkbox
                    checked={includeRegulatoryInfo}
                    onChange={(e) => onIncludeRegulatoryChange(e.target.checked)}
                  />
                }
                label="Include regulatory information"
              />
            </Paper>

            <Paper sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <LinkOutlinedIcon color="primary" />
                <Typography variant="h6">Technology Rivers links</Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Select internal links to weave into the blog
              </Typography>

              <Box sx={{ maxHeight: 360, overflowY: 'auto' }}>
                <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ display: 'block', mb: 1 }}>
                  Resources
                </Typography>
                {resourceLinks.map((link, i) => (
                  <LinkRow
                    key={`r-${i}`}
                    link={link}
                    checked={selectedLinks.includes(link.url)}
                    onToggle={() => onToggleLink(link.url)}
                    color="primary"
                  />
                ))}
                <Divider sx={{ my: 2 }} />
                <Typography variant="caption" fontWeight={700} color="secondary.main" sx={{ display: 'block', mb: 1 }}>
                  Blog posts
                </Typography>
                {blogLinks.map((link, i) => (
                  <LinkRow
                    key={`b-${i}`}
                    link={link}
                    checked={selectedLinks.includes(link.url)}
                    onToggle={() => onToggleLink(link.url)}
                    color="secondary"
                  />
                ))}
                {hasMoreBlogs && (
                  <Button
                    fullWidth
                    size="small"
                    variant="text"
                    onClick={onLoadMoreBlogs}
                    disabled={loadingMoreBlogs}
                    sx={{ mt: 1 }}
                  >
                    {loadingMoreBlogs ? 'Loading…' : `Load more (page ${currentBlogPage + 1})`}
                  </Button>
                )}
              </Box>
            </Paper>
          </Stack>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          disabled={!canGenerate}
          onClick={onGenerate}
          startIcon={<CreateOutlinedIcon />}
          sx={{ px: 5, py: 1.5, borderRadius: 3 }}
        >
          {loading ? 'Generating blog…' : 'Generate blog'}
        </Button>
      </Box>
    </Stack>
  );
}

function LinkRow({
  link,
  checked,
  onToggle,
  color,
}: {
  link: TechnologyRiversLink;
  checked: boolean;
  onToggle: () => void;
  color: 'primary' | 'secondary';
}) {
  return (
    <Box
      sx={{
        mb: 1,
        p: 1,
        borderRadius: 2,
        border: '1px solid',
        borderColor: checked ? `${color}.main` : 'divider',
        bgcolor: checked ? (t) => alpha(t.palette[color].main, 0.06) : 'transparent',
      }}
    >
      <FormControlLabel
        control={<Checkbox checked={checked} onChange={onToggle} color={color} size="small" />}
        label={
          <Box>
            <Typography variant="body2" fontWeight={600}>
              {link.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {link.category}
            </Typography>
          </Box>
        }
        sx={{ m: 0, width: '100%' }}
      />
    </Box>
  );
}
