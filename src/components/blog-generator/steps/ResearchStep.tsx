import React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Collapse,
  Paper,
  Stack,
  TextField,
  Typography,
  alpha,
} from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

interface ResearchStepProps {
  questionsText: string;
  generationPrompt: string;
  generating: boolean;
  onGenerateQuestions: () => void;
  onQuestionsTextChange: (text: string) => void;
}

export function ResearchStep({
  questionsText,
  generationPrompt,
  generating,
  onGenerateQuestions,
  onQuestionsTextChange,
}: ResearchStepProps) {
  const [promptExpanded, setPromptExpanded] = React.useState(true);

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Research questions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generate topic-related questions or edit them below. These guide which topics the blog
              must address — they are not FAQ items.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={generating ? <CircularProgress size={16} color="inherit" /> : <AutoAwesomeIcon />}
            onClick={onGenerateQuestions}
            disabled={generating}
          >
            {generating ? 'Generating…' : 'Generate questions'}
          </Button>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            Generation prompt
          </Typography>
          <Button
            size="small"
            startIcon={promptExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            onClick={() => setPromptExpanded(!promptExpanded)}
          >
            {promptExpanded ? 'Hide' : 'Show'}
          </Button>
        </Stack>
        <Collapse in={promptExpanded}>
          <Box
            sx={{
              p: 2,
              borderRadius: 1,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.04),
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              variant="body2"
              component="pre"
              sx={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit', m: 0, color: 'text.secondary' }}
            >
              {generationPrompt}
            </Typography>
          </Box>
        </Collapse>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>
          Topics to address
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          One question per line. The blog should cover each of these topics in the body — not as a
          separate FAQ section.
        </Typography>
        <TextField
          fullWidth
          multiline
          minRows={8}
          placeholder={
            'What are the main challenges organizations face with this topic?\nHow does this impact business outcomes?\nWhat best practices should teams follow?\n…'
          }
          value={questionsText}
          onChange={(e) => onQuestionsTextChange(e.target.value)}
        />
      </Paper>
    </Stack>
  );
}
