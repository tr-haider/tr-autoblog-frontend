import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Link,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LinkIcon from '@mui/icons-material/Link';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import type { CtaItem } from '../utils';
import { isValidUrl, toHref, uid } from '../utils';

interface CtaListEditorProps {
  title: string;
  color: 'primary' | 'secondary';
  items: CtaItem[];
  onChange: (items: CtaItem[]) => void;
  addLabel: string;
}

function CtaRow({
  item,
  onUpdate,
  onRemove,
}: {
  item: CtaItem;
  onUpdate: (patch: Partial<CtaItem>) => void;
  onRemove: () => void;
}) {
  const [showLink, setShowLink] = useState(Boolean(item.link.trim()));

  const handleToggleLink = () => {
    if (showLink) {
      onUpdate({ link: '' });
      setShowLink(false);
    } else {
      setShowLink(true);
    }
  };

  const preview = item.text.trim() && item.link.trim() && isValidUrl(item.link);

  return (
    <Box
      sx={{
        p: 1.5,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'flex-start' }}>
        <TextField
          fullWidth
          size="small"
          value={item.text}
          onChange={(e) => onUpdate({ text: e.target.value })}
          placeholder="Book a consultation to build your wearable-integrated healthcare app"
          sx={{ flex: 1 }}
        />
        {showLink ? (
          <TextField
            size="small"
            value={item.link}
            onChange={(e) => onUpdate({ link: e.target.value })}
            placeholder="https://..."
            sx={{ minWidth: { sm: 200 }, width: { xs: '100%', sm: 'auto' } }}
          />
        ) : (
          <Button
            size="small"
            type="button"
            variant="outlined"
            startIcon={<LinkIcon />}
            onClick={handleToggleLink}
            sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
          >
            Add link
          </Button>
        )}
        <IconButton size="small" onClick={onRemove} aria-label="Remove CTA" sx={{ mt: { sm: 0.25 } }}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </Stack>
      {showLink && (
        <Button
          size="small"
          type="button"
          onClick={handleToggleLink}
          sx={{ mt: 0.5, minWidth: 0, px: 0.5 }}
        >
          Remove link
        </Button>
      )}
      {preview && (
        <Link
          href={toHref(item.link)}
          target="_blank"
          rel="noopener noreferrer"
          variant="body2"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, mt: 1 }}
        >
          {item.text}
          <OpenInNewIcon sx={{ fontSize: 14 }} />
        </Link>
      )}
      {item.link.trim() && !isValidUrl(item.link) && (
        <Typography variant="caption" color="warning.main" display="block" sx={{ mt: 0.5 }}>
          Enter a valid URL or remove the link field.
        </Typography>
      )}
    </Box>
  );
}

export function CtaListEditor({ title, color, items, onChange, addLabel }: CtaListEditorProps) {
  const updateItem = (id: string, patch: Partial<CtaItem>) => {
    onChange(items.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const addItem = () => {
    onChange([...items, { id: uid('cta'), text: '', link: '' }]);
  };

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: (t) => alpha(t.palette[color].main, 0.05),
        border: '1px solid',
        borderColor: (t) => alpha(t.palette[color].main, 0.22),
      }}
    >
      <Typography variant="overline" color={`${color}.main`} fontWeight={700}>
        {title}
      </Typography>

      <Stack spacing={1.5} sx={{ mt: 1.5 }}>
        {items.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No CTAs yet. Add one below.
          </Typography>
        ) : (
          items.map((item) => (
            <CtaRow
              key={item.id}
              item={item}
              onUpdate={(patch) => updateItem(item.id, patch)}
              onRemove={() => removeItem(item.id)}
            />
          ))
        )}
      </Stack>

      <Button
        size="small"
        type="button"
        startIcon={<AddIcon />}
        onClick={addItem}
        sx={{ mt: 1.5 }}
      >
        {addLabel}
      </Button>
    </Box>
  );
}
