import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import AddIcon from '@mui/icons-material/Add';
import RefreshIcon from '@mui/icons-material/Refresh';
import type { ManualLink, TechnologyRiversLink } from '../../../types';
import { LinkRow } from '../shared/LinkRow';
import {
  getRelevantLinks,
  normalizeLinkUrl,
  resolveLinksByUrls,
} from '../utils';

interface InternalLinkingStepProps {
  topic: string;
  keywords: string[];
  selectedLinks: string[];
  suggestedLinks: string[];
  manualLinks: ManualLink[];
  resourceLinks: TechnologyRiversLink[];
  blogLinks: TechnologyRiversLink[];
  dismissedLinks: string[];
  loadingLinks: boolean;
  onToggleLink: (url: string) => void;
  onAddManualLink: (link: ManualLink) => void;
  onRemoveManualLink: (id: string) => void;
  onDismissLink: (url: string) => void;
  onRefreshLinks: () => void;
}

function isDismissed(url: string, dismissedLinks: string[]): boolean {
  const key = normalizeLinkUrl(url);
  return dismissedLinks.some((d) => normalizeLinkUrl(d) === key);
}

function excludeUrls(
  links: TechnologyRiversLink[],
  excluded: Set<string>,
  dismissedLinks: string[],
): TechnologyRiversLink[] {
  return links.filter(
    (link) =>
      !excluded.has(normalizeLinkUrl(link.url)) &&
      !isDismissed(link.url, dismissedLinks),
  );
}

export function InternalLinkingStep({
  topic,
  keywords,
  selectedLinks,
  suggestedLinks,
  manualLinks,
  resourceLinks,
  blogLinks,
  dismissedLinks,
  loadingLinks,
  onToggleLink,
  onAddManualLink,
  onRemoveManualLink,
  onDismissLink,
  onRefreshLinks,
}: InternalLinkingStepProps) {
  const [manualTitle, setManualTitle] = useState('');
  const [manualUrl, setManualUrl] = useState('');

  const allCatalogLinks = useMemo(
    () => [...resourceLinks, ...blogLinks],
    [resourceLinks, blogLinks],
  );

  const suggestedLinkItems = useMemo(
    () => resolveLinksByUrls(suggestedLinks, allCatalogLinks),
    [suggestedLinks, allCatalogLinks],
  );

  const relevantLinkItems = useMemo(() => {
    const suggestedSet = new Set(suggestedLinks.map(normalizeLinkUrl));
    const catalog = allCatalogLinks.filter((link) => !isDismissed(link.url, dismissedLinks));
    return getRelevantLinks(catalog, keywords, topic).filter(
      (link) => !suggestedSet.has(normalizeLinkUrl(link.url)),
    );
  }, [allCatalogLinks, keywords, topic, suggestedLinks, dismissedLinks]);

  const suggestedUrlSet = useMemo(
    () => new Set([...suggestedLinks, ...relevantLinkItems.map((l) => l.url)].map(normalizeLinkUrl)),
    [suggestedLinks, relevantLinkItems],
  );

  const otherResourceLinks = useMemo(
    () => excludeUrls(resourceLinks, suggestedUrlSet, dismissedLinks),
    [resourceLinks, suggestedUrlSet, dismissedLinks],
  );

  const otherBlogLinks = useMemo(
    () => excludeUrls(blogLinks, suggestedUrlSet, dismissedLinks),
    [blogLinks, suggestedUrlSet, dismissedLinks],
  );

  const handleAddManual = () => {
    const title = manualTitle.trim();
    const url = manualUrl.trim();
    if (!title || !url) return;
    onAddManualLink({
      id: `ml-${Date.now()}`,
      title,
      url: url.startsWith('http') ? url : `https://${url}`,
    });
    setManualTitle('');
    setManualUrl('');
  };

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <LinkOutlinedIcon color="primary" />
              <Typography variant="h6">Site map & internal linking</Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Browse resources and blog posts from the technologyrivers.com sitemap. Check links to
              include in the draft, or remove items you do not want to see. Sheet suggestions and
              keyword matches are highlighted.
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            startIcon={loadingLinks ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={onRefreshLinks}
            disabled={loadingLinks}
          >
            {loadingLinks ? 'Fetching…' : 'Refresh site map'}
          </Button>
        </Stack>
        <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mt: 2 }}>
          <Chip label={`${selectedLinks.length} selected`} size="small" color="primary" />
          <Chip label={`${resourceLinks.length} resources`} size="small" variant="outlined" />
          <Chip label={`${blogLinks.length} blogs`} size="small" variant="outlined" />
        </Stack>
      </Paper>

      {loadingLinks && allCatalogLinks.length === 0 && (
        <Alert severity="info" icon={<CircularProgress size={18} />}>
          Loading site map from technologyrivers.com…
        </Alert>
      )}

      {suggestedLinkItems.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle2" color="success.main" fontWeight={700} gutterBottom>
            Suggested from sheet
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
            Links from your Google Sheet metadata — toggle to include or remove from the list.
          </Typography>
          <Box sx={{ maxHeight: 280, overflowY: 'auto' }}>
            {suggestedLinkItems.map((link) => (
              <LinkRow
                key={`sheet-${normalizeLinkUrl(link.url)}`}
                link={link}
                checked={selectedLinks.some((u) => normalizeLinkUrl(u) === normalizeLinkUrl(link.url))}
                onToggle={() => onToggleLink(link.url)}
                onDismiss={() => onDismissLink(link.url)}
                color={link.type === 'blog' ? 'secondary' : 'primary'}
                badge="Sheet"
              />
            ))}
          </Box>
        </Paper>
      )}

      {relevantLinkItems.length > 0 && (
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle2" color="info.main" fontWeight={700} gutterBottom>
            Relevant to your topic
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
            Matched from the live site map using your topic and keywords.
          </Typography>
          <Box sx={{ maxHeight: 280, overflowY: 'auto' }}>
            {relevantLinkItems.map((link) => (
              <LinkRow
                key={`rel-${normalizeLinkUrl(link.url)}`}
                link={link}
                checked={selectedLinks.some((u) => normalizeLinkUrl(u) === normalizeLinkUrl(link.url))}
                onToggle={() => onToggleLink(link.url)}
                onDismiss={() => onDismissLink(link.url)}
                color={link.type === 'blog' ? 'secondary' : 'primary'}
                badge="Relevant"
              />
            ))}
          </Box>
        </Paper>
      )}

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" gutterBottom>
          Add manual internal link
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ mb: 2 }}>
          <TextField
            size="small"
            fullWidth
            label="Title"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
          />
          <TextField
            size="small"
            fullWidth
            label="URL"
            value={manualUrl}
            onChange={(e) => setManualUrl(e.target.value)}
            placeholder="https://technologyrivers.com/..."
          />
          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddManual}>
            Add
          </Button>
        </Stack>

        {manualLinks.length > 0 && (
          <Stack direction="row" flexWrap="wrap" gap={1}>
            {manualLinks.map((link) => (
              <Chip
                key={link.id}
                label={link.title}
                onDelete={() => onRemoveManualLink(link.id)}
                onClick={() => onToggleLink(link.url)}
                color={selectedLinks.includes(link.url) ? 'primary' : 'default'}
                variant={selectedLinks.includes(link.url) ? 'filled' : 'outlined'}
              />
            ))}
          </Stack>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Box sx={{ maxHeight: 480, overflowY: 'auto' }}>
          <Typography variant="caption" fontWeight={700} color="primary.main" sx={{ display: 'block', mb: 1 }}>
            Resources (site map)
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
            Downloadable guides and resource pages from technologyrivers.com/resources.
          </Typography>
          {otherResourceLinks.length === 0 && !loadingLinks && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No resources loaded. Try refreshing the site map.
            </Typography>
          )}
          {otherResourceLinks.map((link) => (
            <LinkRow
              key={`r-${normalizeLinkUrl(link.url)}`}
              link={link}
              checked={selectedLinks.some((u) => normalizeLinkUrl(u) === normalizeLinkUrl(link.url))}
              onToggle={() => onToggleLink(link.url)}
              color="primary"
            />
          ))}

          <Divider sx={{ my: 2 }} />

          <Typography variant="caption" fontWeight={700} color="secondary.main" sx={{ display: 'block', mb: 1 }}>
            Blog posts
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
            All blog URLs from the site sitemap.
          </Typography>
          {otherBlogLinks.length === 0 && !loadingLinks && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              No blog posts loaded yet. Refresh the site map to load them.
            </Typography>
          )}
          {otherBlogLinks.map((link) => (
            <LinkRow
              key={`b-${normalizeLinkUrl(link.url)}`}
              link={link}
              checked={selectedLinks.some((u) => normalizeLinkUrl(u) === normalizeLinkUrl(link.url))}
              onToggle={() => onToggleLink(link.url)}
              color="secondary"
            />
          ))}
        </Box>
      </Paper>
    </Stack>
  );
}
