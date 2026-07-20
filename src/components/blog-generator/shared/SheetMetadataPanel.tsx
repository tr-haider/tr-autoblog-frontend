import React, { useState } from 'react';
import { Box, Chip, Link, Stack, TextField, Typography, alpha } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import type { ContentTrackerRow } from '../../../types';
import { StatusChip } from '../../shared/StatusChip';
import {
  combineCtaFields,
  isValidUrl,
  parseCtaFields,
  toHref,
  type CtaFields,
  type CtaItem,
} from '../utils';
import { CtaListEditor } from './CtaListEditor';

interface SheetMetadataPanelProps {
  row: ContentTrackerRow;
  onChange: (field: keyof ContentTrackerRow, value: string) => void;
}

function EditableTextField({
  label,
  value,
  onChange,
  multiline,
  minRows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  minRows?: number;
}) {
  return (
    <TextField
      fullWidth
      size="small"
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      multiline={multiline}
      minRows={minRows}
    />
  );
}

function EditableLinkField({
  label,
  value,
  onChange,
  multiline,
  minRows,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  minRows?: number;
}) {
  const lines = value.split(/\n/).map((s) => s.trim()).filter(Boolean);
  const validLinks = lines.filter(isValidUrl);

  return (
    <Box>
      <TextField
        fullWidth
        size="small"
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        multiline={multiline}
        minRows={minRows}
        placeholder="URL or plain text reference"
      />
      {lines.length > 0 && (
        <Stack spacing={0.5} sx={{ mt: 1 }}>
          {lines.map((line) =>
            isValidUrl(line) ? (
              <Link
                key={line}
                href={toHref(line)}
                target="_blank"
                rel="noopener noreferrer"
                variant="body2"
                sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, wordBreak: 'break-all' }}
              >
                {line}
                <OpenInNewIcon sx={{ fontSize: 14, flexShrink: 0 }} />
              </Link>
            ) : (
              <Typography key={line} variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap' }}>
                {line}
              </Typography>
            ),
          )}
        </Stack>
      )}
      {validLinks.length > 1 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {validLinks.length} valid links detected
        </Typography>
      )}
    </Box>
  );
}

export function SheetMetadataPanel({ row, onChange }: SheetMetadataPanelProps) {
  const [ctaState, setCtaState] = useState<CtaFields>(() => parseCtaFields(row.cta));

  const persistCtaState = (updater: CtaFields | ((prev: CtaFields) => CtaFields)) => {
    setCtaState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      onChange('cta', combineCtaFields(next));
      return next;
    });
  };

  const updateCtaSection = (section: 'primary' | 'secondary', items: CtaItem[]) => {
    persistCtaState((prev) => ({ ...prev, [section]: items }));
  };

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
        <StatusChip status={row.status} />
        {row.writer && <Chip label={`Writer: ${row.writer}`} size="small" variant="outlined" />}
        {row.owner && <Chip label={`Owner: ${row.owner}`} size="small" variant="outlined" />}
      </Stack>

      <EditableTextField
        label="Blog angle"
        value={row.angle}
        onChange={(v) => onChange('angle', v)}
        multiline
        minRows={2}
      />

      <EditableTextField
        label="Meta title"
        value={row.metaTitle}
        onChange={(v) => onChange('metaTitle', v)}
      />

      <EditableTextField
        label="Meta description"
        value={row.metaDescription}
        onChange={(v) => onChange('metaDescription', v)}
        multiline
        minRows={3}
      />

      <Box>
        <Typography variant="overline" color="text.secondary" fontWeight={700} sx={{ mb: 1.5, display: 'block' }}>
          Call to action
        </Typography>
        <Stack spacing={2}>
          <CtaListEditor
            title="Primary CTA"
            color="primary"
            items={ctaState.primary}
            onChange={(items) => updateCtaSection('primary', items)}
            addLabel="Add primary CTA"
          />
          <CtaListEditor
            title="Secondary CTA"
            color="secondary"
            items={ctaState.secondary}
            onChange={(items) => updateCtaSection('secondary', items)}
            addLabel="Add secondary CTA"
          />
        </Stack>
      </Box>

      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: (t) => alpha(t.palette.divider, 0.04),
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="overline" color="text.secondary" fontWeight={700}>
          Links & references
        </Typography>
        <Stack spacing={2} sx={{ mt: 1.5 }}>
          <EditableLinkField
            label="Service page"
            value={row.servicePage}
            onChange={(v) => onChange('servicePage', v)}
          />
          <EditableLinkField
            label="Related blog"
            value={row.relatedBlog}
            onChange={(v) => onChange('relatedBlog', v)}
            multiline
            minRows={2}
          />
          <EditableLinkField
            label="Portfolio / case study"
            value={row.portfolioCaseStudy}
            onChange={(v) => onChange('portfolioCaseStudy', v)}
          />
          <EditableLinkField
            label="eBook link"
            value={row.ebookLink}
            onChange={(v) => onChange('ebookLink', v)}
          />
          <EditableLinkField
            label="Other internal links"
            value={row.otherInternalLinks}
            onChange={(v) => onChange('otherInternalLinks', v)}
            multiline
            minRows={2}
          />
        </Stack>
      </Box>
    </Stack>
  );
}
