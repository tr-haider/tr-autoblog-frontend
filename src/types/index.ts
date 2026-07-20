export interface TrendingTopic {
  title: string;
  description: string;
  keywords: string[];
  category: string;
  relevance: number;
  source?: string;
}

export interface TechnologyRiversLink {
  title: string;
  url: string;
  category: string;
  type: 'resource' | 'blog' | 'portfolio';
  description?: string;
}

export interface BlogPost {
  title: string;
  summary: string;
  content: string;
  topic: string;
  keywords: string[];
  wordCount: number;
  readingTime: number;
  status: string;
  createdAt: string;
}

export interface ResearchQuestion {
  id: string;
  question: string;
  answer: string;
  source: 'ai' | 'manual';
}

export interface OutlineHeading {
  id: string;
  level: 2 | 3;
  text: string;
}

export interface ManualLink {
  id: string;
  title: string;
  url: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  url?: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  company: string;
  source: 'sheet' | 'manual';
}

export interface VideoTestimonial {
  id: string;
  title: string;
  url: string;
  speaker?: string;
}

/** Payload accepted by POST /blog-generator/generate */
export interface BlogGenerationRequest {
  topic: string;
  keywords: string[];
  targetWordCount: number;
  tone: 'professional' | 'casual' | 'technical' | 'executive';
  includeRegulatoryInfo: boolean;
  selectedLinks: string[];
  metaTitle?: string;
  metaDescription?: string;
  angle?: string;
  cta?: string;
}

export interface ContentTrackerRow {
  title: string;
  owner: string;
  writer: string;
  status: string;
  primaryKeyword: string;
  secondaryKeywords: string;
  metaTitle: string;
  metaDescription: string;
  servicePage: string;
  relatedBlog: string;
  portfolioCaseStudy: string;
  ebookLink: string;
  otherInternalLinks: string;
  cta: string;
  angle: string;
}

export interface SheetTab {
  title: string;
  sheetId?: number;
  rowCount?: number;
  columnCount?: number;
}

export interface ContentTrackerMetadata {
  title: string;
  sheets: SheetTab[];
}

export interface ContentTrackerSummary {
  published: number;
  inProgress: number;
}

export interface ContentTrackerResponse {
  sheet: string;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  statuses: string[];
  summary: ContentTrackerSummary;
  rows: ContentTrackerRow[];
}

export type AppView = 'generate' | 'preview' | 'tracker';

export const WORKFLOW_STEP_COUNT = 8;
