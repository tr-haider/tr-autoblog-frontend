import type {
  BlogGenerationRequest,
  Testimonial,
} from '../../types';

export type ApiBlogTone = BlogGenerationRequest['tone'];

export interface BlogWorkflowContext {
  authorStyle?: string;
  researchQuestionsText?: string;
  portfolioSummaries?: Record<string, string>;
  testimonials?: Testimonial[];
  selectedServices?: string[];
  introInstructions?: string;
  summaryInstructions?: string;
}

export function mapToneToApi(tone: string): ApiBlogTone {
  const map: Record<string, ApiBlogTone> = {
    professional: 'professional',
    conversational: 'casual',
    casual: 'casual',
    technical: 'technical',
    'thought-leadership': 'executive',
    executive: 'executive',
  };
  return map[tone] ?? 'professional';
}

function buildEnrichedAngle(angle: string | undefined, authorStyle: string | undefined): string | undefined {
  const parts = [
    angle?.trim(),
    authorStyle?.trim() ? `Author voice: ${authorStyle.trim()}` : '',
  ].filter(Boolean);
  return parts.length ? parts.join('\n\n') : undefined;
}

function parseResearchQuestions(text: string): string[] {
  return text
    .split('\n')
    .map((line) => line.replace(/^\s*[\d]+[.)]\s*/, '').trim())
    .filter(Boolean);
}

function buildEnrichedCta(
  cta: string | undefined,
  context: BlogWorkflowContext,
): string | undefined {
  const parts: string[] = [];
  if (cta?.trim()) parts.push(cta.trim());

  if (context.introInstructions?.trim()) {
    parts.push(`Introduction guidance: ${context.introInstructions.trim()}`);
  }
  if (context.summaryInstructions?.trim()) {
    parts.push(`Conclusion guidance: ${context.summaryInstructions.trim()}`);
  }

  const questions = parseResearchQuestions(context.researchQuestionsText ?? '');
  if (questions.length > 0) {
    parts.push(
      'Topics the blog must address (cover in the body, not as an FAQ section):\n' +
        questions.map((q, i) => `${i + 1}. ${q}`).join('\n'),
    );
  }

  const summaries = Object.values(context.portfolioSummaries ?? {}).filter(Boolean);
  if (summaries.length > 0) {
    parts.push('Portfolio references:\n' + summaries.join('\n'));
  }

  if (context.testimonials?.length) {
    parts.push(
      'Testimonials:\n' +
        context.testimonials
          .map((t) => `"${t.quote}" — ${t.name}${t.company ? `, ${t.company}` : ''}`)
          .join('\n'),
    );
  }

  if (context.selectedServices?.length) {
    parts.push('Services to highlight: ' + context.selectedServices.join(', '));
  }

  return parts.length ? parts.join('\n\n') : undefined;
}

export function buildBlogApiRequest(
  base: Omit<BlogGenerationRequest, 'tone'> & { tone: string },
  context: BlogWorkflowContext = {},
): BlogGenerationRequest {
  return {
    topic: base.topic,
    keywords: base.keywords,
    targetWordCount: base.targetWordCount,
    tone: mapToneToApi(base.tone),
    includeRegulatoryInfo: base.includeRegulatoryInfo,
    selectedLinks: base.selectedLinks,
    metaTitle: base.metaTitle,
    metaDescription: base.metaDescription,
    angle: buildEnrichedAngle(base.angle, context.authorStyle),
    cta: buildEnrichedCta(base.cta, context),
  };
}
