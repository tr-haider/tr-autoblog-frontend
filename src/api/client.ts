import axios from 'axios';
import type {
  BlogGenerationRequest,
  BlogPost,
  ContentTrackerMetadata,
  ContentTrackerResponse,
  TechnologyRiversLink,
  TrendingTopic,
} from '../types';

export const API_BASE =
  process.env.REACT_APP_API_BASE || 'https://tr-autoblog-backend.vercel.app';

const api = axios.create({ baseURL: API_BASE });

export async function fetchSuggestedTopics(): Promise<TrendingTopic[]> {
  const { data } = await api.get<TrendingTopic[]>('/blog-generator/suggested-topics');
  return data;
}

export async function fetchSeparatedLinks(): Promise<{
  resources: TechnologyRiversLink[];
  blogs: TechnologyRiversLink[];
}> {
  const { data } = await api.get('/blog-generator/separated-links');
  return data;
}

export async function fetchMoreBlogs(page: number): Promise<TechnologyRiversLink[]> {
  const { data } = await api.get(`/blog-generator/load-more-blogs/${page}`);
  return data.blogs || [];
}

export async function generateBlog(
  request: BlogGenerationRequest,
): Promise<{ blogPost: BlogPost }> {
  const { data } = await api.post('/blog-generator/generate', request);
  return data;
}

export async function downloadBlog(
  blogPost: BlogPost,
  format: 'docx' | 'html',
): Promise<Blob> {
  const endpoint =
    format === 'docx'
      ? '/blog-generator/download-docx'
      : '/blog-generator/download-html';
  const { data } = await api.post(endpoint, blogPost, { responseType: 'blob' });
  return data;
}

export async function fetchContentTrackerMetadata(): Promise<ContentTrackerMetadata> {
  const { data } = await api.get<ContentTrackerMetadata>('/content-tracker/metadata');
  return data;
}

export async function fetchContentTrackerRows(params: {
  sheet?: string;
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ContentTrackerResponse> {
  const { data } = await api.get<ContentTrackerResponse>('/content-tracker/rows', {
    params,
  });
  return data;
}
