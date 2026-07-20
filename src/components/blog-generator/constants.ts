import type { VideoTestimonial } from '../../types';

export const WORKFLOW_STEPS = [
  'Topic & metadata',
  'Tone & style',
  'Research',
  'Internal linking',
  'Portfolio',
  'Testimonials & services',
  'External assets',
  'Generate',
] as const;

export const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'technical', label: 'Technical' },
  { value: 'thought-leadership', label: 'Thought leadership' },
] as const;

export const SERVICE_OPTIONS = [
  'Custom Software Development',
  'Mobile App Development',
  'AI & Machine Learning',
  'Cloud & DevOps',
  'Healthcare IT / HIPAA',
  'UI/UX Design',
  'QA & Testing',
] as const;

export const MOCK_VIDEO_TESTIMONIALS: VideoTestimonial[] = [
  {
    id: 'vt-1',
    title: 'Client success story — Healthcare startup',
    url: 'https://ghazenfer.com',
    speaker: 'Healthcare CEO',
  },
  {
    id: 'vt-2',
    title: 'Why we chose Technology Rivers',
    url: 'https://ghazenfer.com',
    speaker: 'SaaS Founder',
  },
];
