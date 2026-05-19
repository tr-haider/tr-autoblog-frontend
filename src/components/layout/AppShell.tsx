import React from 'react';
import {
  AppBar,
  Box,
  Container,
  Toolbar,
  Typography,
  alpha,
  useTheme,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface AppShellProps {
  children: React.ReactNode;
  navigation: React.ReactNode;
}

export function AppShell({ children, navigation }: AppShellProps) {
  const theme = useTheme();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar
        position="sticky"
        elevation={0}
        sx={{
          bgcolor: alpha(theme.palette.background.paper, 0.85),
          backdropFilter: 'blur(12px)',
          borderBottom: `1px solid ${theme.palette.divider}`,
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ gap: 2, py: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
              color: '#fff',
            }}
          >
            <AutoAwesomeIcon fontSize="small" />
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ lineHeight: 1.2 }}>
              AutoBlog AI
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Content tracker & intelligent blog generation
            </Typography>
          </Box>
          {navigation}
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }, flexGrow: 1 }}>
        {children}
      </Container>
    </Box>
  );
}
