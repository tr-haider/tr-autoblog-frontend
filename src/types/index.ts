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
  type: 'resource' | 'blog';
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

export interface BlogGenerationRequest {
  topic: string;
  keywords: string[];
  targetWordCount: number;
  tone: string;
  includeRegulatoryInfo: boolean;
  selectedLinks: string[];
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
