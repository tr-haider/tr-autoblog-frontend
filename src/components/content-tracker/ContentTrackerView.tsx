import React, { useCallback, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import RocketLaunchOutlinedIcon from '@mui/icons-material/RocketLaunchOutlined';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { fetchContentTrackerRows } from '../../api/client';
import type { ContentTrackerRow, ContentTrackerSummary } from '../../types';
import { StatusChip } from '../shared/StatusChip';

const ROWS_PER_PAGE_OPTIONS = [10, 15, 25, 50];

interface ContentTrackerViewProps {
  onUseForGeneration: (row: ContentTrackerRow) => void;
}

export function ContentTrackerView({ onUseForGeneration }: ContentTrackerViewProps) {
  const theme = useTheme();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(15);

  const [rows, setRows] = useState<ContentTrackerRow[]>([]);
  const [sheetName, setSheetName] = useState('');
  const [summary, setSummary] = useState<ContentTrackerSummary>({ published: 0, inProgress: 0 });
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [detailRow, setDetailRow] = useState<ContentTrackerRow | null>(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(0);
  }, [debouncedSearch, rowsPerPage]);

  const loadRows = useCallback(async () => {
    const data = await fetchContentTrackerRows({
      search: debouncedSearch || undefined,
      page: page + 1,
      limit: rowsPerPage,
    });
    setRows(data.rows);
    setSheetName(data.sheet);
    setSummary(data.summary ?? { published: 0, inProgress: 0 });
    setTotalCount(data.total);
    setTotalPages(data.totalPages);
  }, [debouncedSearch, page, rowsPerPage]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError('');
      try {
        await loadRows();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load content tracker');
      } finally {
        setLoading(false);
      }
    })();
  }, [debouncedSearch, page, rowsPerPage, loadRows]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadRows();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Refresh failed');
    } finally {
      setRefreshing(false);
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      <Paper
        sx={{
          p: 3,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${alpha(theme.palette.secondary.main, 0.06)} 100%)`,
        }}
      >
        <Typography variant="h5" gutterBottom>
          Blogs — AI Mostly
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {sheetName
            ? `Showing actionable topics from "${sheetName}" — select a row to generate a blog.`
            : 'Live content pipeline from Google Sheets — inspect and send topics to the blog generator.'}
        </Typography>
        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
          <Chip label={`${totalCount} topics`} color="primary" variant="outlined" />
          <Chip
            label={`${summary.inProgress} in progress`}
            sx={{ borderColor: 'warning.main', color: 'warning.dark' }}
            variant="outlined"
          />
        </Stack>
      </Paper>

      <Paper sx={{ p: 2 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ md: 'center' }}
        >
          <TextField
            size="small"
            placeholder="Search title, keywords, writer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ flexGrow: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" color="action" />
                </InputAdornment>
              ),
            }}
          />

          <Button
            variant="outlined"
            startIcon={refreshing ? <CircularProgress size={16} /> : <RefreshIcon />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Refresh
          </Button>
        </Stack>
      </Paper>

      {error && (
        <Paper sx={{ p: 2, bgcolor: alpha(theme.palette.error.main, 0.06), borderColor: 'error.light' }}>
          <Typography color="error.main">{error}</Typography>
        </Paper>
      )}

      <TableContainer component={Paper} sx={{ position: 'relative' }}>
        {refreshing && <LinearProgressOverlay />}
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 48 }}>#</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Writer</TableCell>
              <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Primary keyword</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.length === 0 && !refreshing ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                  <Typography color="text.secondary">No topics available</Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => {
                const rowNumber = page * rowsPerPage + index + 1;
                return (
                  <TableRow
                    key={`${rowNumber}-${row.title}`}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => setDetailRow(row)}
                  >
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {rowNumber}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 360 }}>
                      <Typography variant="body2" fontWeight={600} noWrap title={row.title}>
                        {row.title}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <StatusChip status={row.status} />
                    </TableCell>
                    <TableCell>{row.writer || '—'}</TableCell>
                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {row.primaryKeyword || row.secondaryKeywords?.slice(0, 40) || '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="small"
                        variant="contained"
                        startIcon={<RocketLaunchOutlinedIcon />}
                        onClick={() => onUseForGeneration(row)}
                      >
                        Use
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TablePagination
                colSpan={6}
                count={totalCount}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                labelDisplayedRows={({ from, to, count }) =>
                  `${from}–${to} of ${count !== -1 ? count : `more than ${to}`}`
                }
                labelRowsPerPage="Rows per page"
                showFirstButton
                showLastButton
              />
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      {totalPages > 1 && (
        <Typography variant="caption" color="text.secondary" align="center" display="block">
          Page {page + 1} of {totalPages}
        </Typography>
      )}

      <Dialog
        open={!!detailRow}
        onClose={() => setDetailRow(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        {detailRow && (
          <>
            <DialogTitle sx={{ pr: 6 }}>
              {detailRow.title}
              <IconButton
                onClick={() => setDetailRow(null)}
                sx={{ position: 'absolute', right: 12, top: 12 }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Stack spacing={2}>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <StatusChip status={detailRow.status} size="medium" />
                  {detailRow.writer && (
                    <Chip label={detailRow.writer} size="small" variant="outlined" />
                  )}
                </Stack>
                {detailRow.angle && (
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      Angle
                    </Typography>
                    <Typography variant="body2">{detailRow.angle}</Typography>
                  </Box>
                )}
                {detailRow.metaTitle && (
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      Meta title
                    </Typography>
                    <Typography variant="body2">{detailRow.metaTitle}</Typography>
                  </Box>
                )}
                {detailRow.metaDescription && (
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      Meta description
                    </Typography>
                    <Typography variant="body2">{detailRow.metaDescription}</Typography>
                  </Box>
                )}
                {detailRow.servicePage && (
                  <Button
                    size="small"
                    href={detailRow.servicePage}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<OpenInNewIcon />}
                  >
                    Service page
                  </Button>
                )}
                {detailRow.cta && (
                  <Box>
                    <Typography variant="overline" color="text.secondary">
                      CTA
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {detailRow.cta}
                    </Typography>
                  </Box>
                )}
                <Button
                  variant="contained"
                  fullWidth
                  startIcon={<RocketLaunchOutlinedIcon />}
                  onClick={() => {
                    onUseForGeneration(detailRow);
                    setDetailRow(null);
                  }}
                >
                  Use for blog generation
                </Button>
              </Stack>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Stack>
  );
}

function LinearProgressOverlay() {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        bgcolor: 'rgba(255,255,255,0.6)',
        minHeight: 120,
      }}
    >
      <CircularProgress size={28} />
    </Box>
  );
}
