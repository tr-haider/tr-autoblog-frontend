export interface ResearchQuestionsPromptParams {
  topic: string;
  primaryKeywords: string[];
  secondaryKeywords?: string[];
}

export function buildResearchQuestionsPrompt(params: ResearchQuestionsPromptParams): string {
  const { topic, primaryKeywords, secondaryKeywords = [] } = params;
  const keywords = [...primaryKeywords, ...secondaryKeywords].filter(Boolean).join(', ');

  return `Generate 5–7 research questions for a blog post on the following topic.

These questions are NOT for an FAQ section. They define which topics, angles, and concerns the article must address in depth throughout the body.

TOPIC: ${topic}
PRIMARY KEYWORDS: ${keywords || topic}

Requirements:
- Each question should explore a distinct angle readers care about
- Cover technical depth, business impact, compliance (if relevant), and practical implementation
- Write questions that guide comprehensive coverage, not short FAQ answers
- Return one question per line, no numbering or bullet prefixes`;
}
