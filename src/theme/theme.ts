import { createTheme, alpha } from '@mui/material/styles';

const palette = {
  primary: { main: '#6366f1', light: '#818cf8', dark: '#4f46e5' },
  secondary: { main: '#0ea5e9', light: '#38bdf8', dark: '#0284c7' },
  success: { main: '#10b981' },
  warning: { main: '#f59e0b' },
  error: { main: '#ef4444' },
  background: {
    default: '#f1f5f9',
    paper: '#ffffff',
  },
  text: {
    primary: '#0f172a',
    secondary: '#64748b',
  },
  divider: '#e2e8f0',
};

export const appTheme = createTheme({
  palette,
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", system-ui, sans-serif',
    h4: { fontWeight: 700, letterSpacing: '-0.02em' },
    h5: { fontWeight: 700, letterSpacing: '-0.01em' },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 500 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: `radial-gradient(ellipse 80% 50% at 50% -20%, ${alpha(
            palette.primary.main,
            0.12,
          )}, transparent)`,
          minHeight: '100vh',
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          border: `1px solid ${palette.divider}`,
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 10, boxShadow: 'none' },
        contained: {
          '&:hover': { boxShadow: `0 8px 24px ${alpha(palette.primary.main, 0.35)}` },
        },
      },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500 } },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 48,
          fontWeight: 600,
          textTransform: 'none',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 600,
          color: palette.text.secondary,
          backgroundColor: '#f8fafc',
        },
      },
    },
  },
});

export const statusColors: Record<string, { bg: string; color: string }> = {
  Published: { bg: alpha('#10b981', 0.12), color: '#059669' },
  'In Progress': { bg: alpha('#f59e0b', 0.12), color: '#d97706' },
  Draft: { bg: alpha('#64748b', 0.12), color: '#475569' },
  default: { bg: alpha('#6366f1', 0.1), color: '#4f46e5' },
};
