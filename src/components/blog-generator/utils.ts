import type {
  ContentTrackerRow,
  PortfolioItem,
  TechnologyRiversLink,
} from '../../types';

export function parseSecondaryKeywords(value?: string): string[] {
  if (!value?.trim()) return [];
  return value
    .split(/[\n,]+/)
    .map((s) => s.trim().replace(/^'/, ''))
    .filter(Boolean)
    .filter((k, i, arr) => arr.indexOf(k) === i);
}

export function extractKeywordsFromRow(row: ContentTrackerRow): string[] {
  const primary = row.primaryKeyword?.trim();
  const secondary = parseSecondaryKeywords(row.secondaryKeywords);
  if (primary) return [primary, ...secondary.filter((k) => k !== primary)];
  if (secondary.length) return secondary;
  return [row.title.split(' ').slice(0, 3).join(' ')];
}

export function extractPrimaryKeywordsFromRow(row: ContentTrackerRow): string[] {
  const fromSheet = parseSecondaryKeywords(row.primaryKeyword);
  if (fromSheet.length) return fromSheet;
  return [row.title.split(' ').slice(0, 3).join(' ')];
}

export function extractSecondaryKeywordsFromRow(row: ContentTrackerRow): string[] {
  const secondary = parseSecondaryKeywords(row.secondaryKeywords);
  const primarySet = new Set(
    parseSecondaryKeywords(row.primaryKeyword).map((k) => k.toLowerCase()),
  );
  return secondary.filter((k) => !primarySet.has(k.toLowerCase()));
}

export function combineKeywords(primary: string[], secondary: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const kw of [...primary, ...secondary]) {
    const trimmed = kw.trim();
    if (!trimmed) continue;
    const key = trimmed.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(trimmed);
  }
  return result;
}

export function extractInternalLinksFromRow(row: ContentTrackerRow): string[] {
  return [
    row.servicePage,
    row.relatedBlog,
    row.portfolioCaseStudy,
    row.ebookLink,
    row.otherInternalLinks,
    ...extractCtaLinks(row.cta),
  ]
    .flatMap((v) => (v ? v.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean) : []))
    .filter(isValidUrl)
    .filter((url, i, arr) => arr.indexOf(url) === i);
}

export function extractPodcastLinksFromRow(row: ContentTrackerRow): string[] {
  const all = extractInternalLinksFromRow(row);
  return all.filter((url) => /ghazenfer\.com|podcast/i.test(url));
}

export function extractExternalLinksFromRow(row: ContentTrackerRow): string[] {
  const all = extractInternalLinksFromRow(row);
  return all.filter(
    (url) =>
      /medium\.com|linkedin\.com\/posts/i.test(url) &&
      !/technologyrivers\.com/i.test(url),
  );
}

export function generateMockResearchQuestions(
  topic: string,
  primaryKeywords: string[],
): string {
  const primary = primaryKeywords[0]?.trim() || topic.split(' ').slice(0, 3).join(' ');
  const templates = [
    `What are the main challenges organizations face with ${primary}?`,
    `How does ${primary} impact business outcomes in 2025?`,
    `What best practices should teams follow when adopting ${primary}?`,
    `What regulatory or compliance considerations apply to ${primary}?`,
    `How can ${topic.toLowerCase()} differentiate a company from competitors?`,
  ];

  return templates.join('\n');
}

export function portfolioLinksToItems(links: TechnologyRiversLink[]): PortfolioItem[] {
  return links.map((link, index) => ({
    id: `pf-sitemap-${index}-${normalizeLinkUrl(link.url).slice(-24)}`,
    title: link.title,
    description: link.description || `${link.title} — Technology Rivers portfolio case study.`,
    category: link.category,
    url: link.url,
  }));
}

export function generatePortfolioSummary(title: string, description: string): string {
  return `${title}: ${description} This case study demonstrates Technology Rivers' expertise and can be referenced as a real-world example in the blog.`;
}

export function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function isValidUrl(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  try {
    const href = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    const parsed = new URL(href);
    return Boolean(parsed.hostname.includes('.'));
  } catch {
    return false;
  }
}

export function toHref(value: string): string {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export interface CtaItem {
  id: string;
  text: string;
  link: string;
}

export interface CtaFields {
  primary: CtaItem[];
  secondary: CtaItem[];
}

const CTA_PIPE_DELIMITER = ' | ';

function parseCtaLine(line: string): CtaItem | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const pipeIndex = trimmed.indexOf(CTA_PIPE_DELIMITER);
  if (pipeIndex !== -1) {
    const text = trimmed.slice(0, pipeIndex).trim();
    const link = trimmed.slice(pipeIndex + CTA_PIPE_DELIMITER.length).trim();
    if (!text) return null;
    return { id: uid('cta'), text, link };
  }

  return { id: uid('cta'), text: trimmed, link: '' };
}

function parseLegacyCtaBlock(block: string): CtaItem | null {
  const trimmed = block.trim();
  if (!trimmed) return null;

  const linkMatch = trimmed.match(/\n\s*Link:\s*(\S[^\n]*)$/i);
  if (linkMatch) {
    const text = trimmed.replace(/\n\s*Link:\s*\S[^\n]*$/i, '').trim();
    if (!text) return null;
    return { id: uid('cta'), text, link: linkMatch[1].trim() };
  }

  return { id: uid('cta'), text: trimmed, link: '' };
}

function parseCtaSectionBody(body: string): CtaItem[] {
  const trimmed = body.trim();
  if (!trimmed) return [];

  const hasPipeLines = trimmed.split('\n').some((line) => line.includes(CTA_PIPE_DELIMITER));
  if (hasPipeLines) {
    return trimmed
      .split('\n')
      .map(parseCtaLine)
      .filter((item): item is CtaItem => item !== null);
  }

  if (trimmed.includes('Link:') || trimmed.includes('\n\n')) {
    return trimmed
      .split(/\n\n+/)
      .map(parseLegacyCtaBlock)
      .filter((item): item is CtaItem => item !== null);
  }

  const lines = trimmed.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length > 1) {
    return lines
      .map((line) => parseCtaLine(line))
      .filter((item): item is CtaItem => item !== null);
  }

  const singleLine = parseCtaLine(trimmed);
  return singleLine ? [singleLine] : [];
}

export function parseCtaFields(cta: string): CtaFields {
  const empty: CtaFields = { primary: [], secondary: [] };
  if (!cta?.trim()) return empty;

  const secondarySplit = cta.split(/\n\s*Secondary CTA:\s*/i);
  if (secondarySplit.length > 1) {
    const primaryBody = secondarySplit[0].replace(/^\s*Primary CTA:\s*/i, '');
    return {
      primary: parseCtaSectionBody(primaryBody),
      secondary: parseCtaSectionBody(secondarySplit.slice(1).join('\n')),
    };
  }

  if (/^\s*Primary CTA:\s*/i.test(cta)) {
    return { primary: parseCtaSectionBody(cta.replace(/^\s*Primary CTA:\s*/i, '')), secondary: [] };
  }

  if (/^\s*Secondary CTA:\s*/i.test(cta)) {
    return { primary: [], secondary: parseCtaSectionBody(cta.replace(/^\s*Secondary CTA:\s*/i, '')) };
  }

  return { primary: parseCtaSectionBody(cta), secondary: [] };
}

export function hasCtaContent(item: CtaItem): boolean {
  return Boolean(item.text.trim() || item.link.trim());
}

function formatCtaItem(item: CtaItem): string {
  if (!item.text.trim()) return '';
  if (item.link.trim()) return `${item.text.trim()}${CTA_PIPE_DELIMITER}${item.link.trim()}`;
  return item.text.trim();
}

function formatCtaSection(label: string, items: CtaItem[]): string {
  const lines = items.filter(hasCtaContent).map(formatCtaItem).filter(Boolean);
  if (lines.length === 0) return '';
  return `${label}:\n${lines.join('\n')}`;
}

export function combineCtaFields(fields: CtaFields): string {
  const parts = [
    formatCtaSection('Primary CTA', fields.primary),
    formatCtaSection('Secondary CTA', fields.secondary),
  ].filter(Boolean);
  return parts.join('\n\n');
}

export function extractCtaLinks(cta: string): string[] {
  const { primary, secondary } = parseCtaFields(cta);
  return [...primary, ...secondary].map((item) => item.link).filter(isValidUrl);
}

export function normalizeLinkUrl(url: string): string {
  return toHref(url).replace(/\/$/, '').toLowerCase();
}

export function urlToFallbackLink(url: string): TechnologyRiversLink {
  const href = toHref(url);
  const path = href.replace(/^https?:\/\/[^/]+/i, '').replace(/\/$/, '');
  const slug = path.split('/').filter(Boolean).pop() || 'link';
  const title = slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
  const isBlog = /\/blog\//i.test(path);
  const isPortfolio = /\/portfolio\//i.test(path);

  return {
    title,
    url: href,
    category: isBlog ? 'Blog' : isPortfolio ? 'Portfolio' : 'Site resource',
    type: isBlog ? 'blog' : isPortfolio ? 'portfolio' : 'resource',
  };
}

export function resolveLinksByUrls(
  urls: string[],
  catalog: TechnologyRiversLink[],
): TechnologyRiversLink[] {
  const byUrl = new Map(catalog.map((link) => [normalizeLinkUrl(link.url), link]));

  return urls
    .filter(isValidUrl)
    .map((url) => byUrl.get(normalizeLinkUrl(url)) ?? urlToFallbackLink(url))
    .filter((link, index, arr) => {
      const key = normalizeLinkUrl(link.url);
      return arr.findIndex((item) => normalizeLinkUrl(item.url) === key) === index;
    });
}

export function scoreLinkRelevance(
  link: TechnologyRiversLink,
  keywords: string[],
  topic: string,
): number {
  const haystack = `${link.title} ${link.description ?? ''} ${link.category} ${link.url}`.toLowerCase();
  let score = 0;

  const terms = [topic, ...keywords]
    .map((term) => term.trim().toLowerCase())
    .filter(Boolean);

  for (const term of terms) {
    const words = term.split(/\s+/).filter((w) => w.length > 2);
    if (link.title.toLowerCase().includes(term)) score += 5;
    if (haystack.includes(term)) score += 3;
    for (const word of words) {
      if (haystack.includes(word)) score += 1;
    }
  }

  return score;
}

export function getRelevantLinks(
  links: TechnologyRiversLink[],
  keywords: string[],
  topic: string,
  options: { minScore?: number; limit?: number } = {},
): TechnologyRiversLink[] {
  const { minScore = 3, limit = 10 } = options;

  return links
    .map((link) => ({ link, score: scoreLinkRelevance(link, keywords, topic) }))
    .filter(({ score }) => score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ link }) => link);
}
