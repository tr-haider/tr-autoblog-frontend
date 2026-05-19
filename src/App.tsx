import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Box, Collapse, LinearProgress, Snackbar } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppShell } from './components/layout/AppShell';
import { ViewNav } from './components/layout/ViewNav';
import { ContentTrackerView } from './components/content-tracker/ContentTrackerView';
import { BlogGeneratorView } from './components/blog-generator/BlogGeneratorView';
import { BlogPreviewView } from './components/blog-generator/BlogPreviewView';
import { appTheme } from './theme/theme';
import {
  downloadBlog,
  fetchMoreBlogs,
  fetchSeparatedLinks,
  fetchSuggestedTopics,
  generateBlog,
} from './api/client';
import type {
  AppView,
  BlogGenerationRequest,
  BlogPost,
  ContentTrackerRow,
  TechnologyRiversLink,
  TrendingTopic,
} from './types';

function App() {
  const [view, setView] = useState<AppView>('tracker');

  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState('');
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [targetWordCount, setTargetWordCount] = useState(1200);
  const [tone, setTone] = useState('professional');
  const [includeRegulatoryInfo, setIncludeRegulatoryInfo] = useState(true);

  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [resourceLinks, setResourceLinks] = useState<TechnologyRiversLink[]>([]);
  const [blogLinks, setBlogLinks] = useState<TechnologyRiversLink[]>([]);
  const [currentBlogPage, setCurrentBlogPage] = useState(1);
  const [hasMoreBlogs, setHasMoreBlogs] = useState(true);

  const [loading, setLoading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingMoreBlogs, setLoadingMoreBlogs] = useState(false);

  const [generatedBlog, setGeneratedBlog] = useState<BlogPost | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTrendingTopics();
    loadSeparatedLinks();
  }, []);

  const loadTrendingTopics = async (isRefresh = false) => {
    if (isRefresh) {
      setLoadingTopics(true);
      setError('');
    }
    try {
      const data = await fetchSuggestedTopics();
      setTrendingTopics(data);
      if (isRefresh) {
        setSuccess('Fresh topics generated');
      }
    } catch {
      setError('Failed to load topic suggestions');
      if (trendingTopics.length === 0) {
        setTrendingTopics([
          {
            title: 'Automating HIPAA Compliance Audits with AI-Powered Monitoring Tools',
            description: 'How AI can streamline HIPAA compliance monitoring',
            keywords: ['hipaa', 'ai', 'compliance'],
            category: 'healthcare-software-development',
            relevance: 10,
            source: 'fallback',
          },
        ]);
      }
    } finally {
      if (isRefresh) setLoadingTopics(false);
    }
  };

  const loadSeparatedLinks = async () => {
    try {
      const data = await fetchSeparatedLinks();
      setResourceLinks(data.resources || []);
      setBlogLinks(data.blogs || []);
      setCurrentBlogPage(1);
      setHasMoreBlogs(true);
    } catch {
      setResourceLinks([]);
      setBlogLinks([]);
    }
  };

  const loadMoreBlogs = async () => {
    if (loadingMoreBlogs || !hasMoreBlogs) return;
    setLoadingMoreBlogs(true);
    try {
      const nextPage = currentBlogPage + 1;
      const newBlogs = await fetchMoreBlogs(nextPage);
      if (newBlogs.length === 0) {
        setHasMoreBlogs(false);
      } else {
        setBlogLinks((prev) => {
          const urls = new Set(prev.map((b) => b.url));
          const titles = new Set(prev.map((b) => b.title.toLowerCase().trim()));
          const unique = newBlogs.filter(
            (b) => !urls.has(b.url) && !titles.has(b.title.toLowerCase().trim()),
          );
          if (unique.length === 0) {
            setHasMoreBlogs(false);
            return prev;
          }
          return [...prev, ...unique];
        });
        setCurrentBlogPage(nextPage);
      }
    } catch {
      setError('Failed to load more blog posts');
      setHasMoreBlogs(false);
    } finally {
      setLoadingMoreBlogs(false);
    }
  };

  const handleTopicSelect = (topic: TrendingTopic) => {
    setSelectedTopic(topic.title);
    setCustomTopic('');
    setKeywords(topic.keywords);
    const all = [...resourceLinks, ...blogLinks];
    const relevant = all
      .filter((link) =>
        topic.keywords.some(
          (kw) =>
            link.title.toLowerCase().includes(kw.toLowerCase()) ||
            link.category.toLowerCase().includes(kw.toLowerCase()),
        ),
      )
      .map((l) => l.url)
      .slice(0, 3);
    setSelectedLinks(relevant);
  };

  const handleCustomTopicChange = (value: string) => {
    setCustomTopic(value);
    setSelectedTopic('');
    const suggested: string[] = [];
    const v = value.toLowerCase();
    if (v.includes('ai')) suggested.push('AI');
    if (v.includes('hipaa')) suggested.push('HIPAA compliance');
    if (v.includes('mobile')) suggested.push('mobile app development');
    if (v.includes('cloud')) suggested.push('cloud hosting');
    if (v.includes('security')) suggested.push('security');
    if (suggested.length) setKeywords(suggested);
  };

  const handleUseTrackerRow = useCallback((row: ContentTrackerRow) => {
    setCustomTopic(row.title);
    setSelectedTopic('');
    const kws: string[] = [];
    if (row.primaryKeyword) kws.push(row.primaryKeyword);
    if (row.secondaryKeywords) {
      row.secondaryKeywords
        .split(/[\n,]+/)
        .map((s) => s.trim().replace(/^'/, ''))
        .filter(Boolean)
        .slice(0, 5)
        .forEach((k) => {
          if (!kws.includes(k)) kws.push(k);
        });
    }
    setKeywords(kws.length ? kws : [row.title.split(' ').slice(0, 3).join(' ')]);
    const links = [row.servicePage, row.relatedBlog, row.portfolioCaseStudy, row.ebookLink].filter(
      Boolean,
    );
    setSelectedLinks(links);
    setView('generate');
    setSuccess(`Loaded "${row.title}" into the blog generator`);
  }, []);

  const addKeyword = () => {
    const k = keywordInput.trim();
    if (k && !keywords.includes(k)) {
      setKeywords([...keywords, k]);
      setKeywordInput('');
    }
  };

  const generateBlogPost = async () => {
    if (!selectedTopic && !customTopic) {
      setError('Please select or enter a topic');
      return;
    }
    if (keywords.length === 0) {
      setError('Please add at least one keyword');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const request: BlogGenerationRequest = {
        topic: selectedTopic || customTopic,
        keywords,
        targetWordCount,
        tone,
        includeRegulatoryInfo,
        selectedLinks,
      };
      const { blogPost } = await generateBlog(request);
      setGeneratedBlog(blogPost);
      setSuccess('Blog generated successfully');
      setView('preview');
    } catch (e: unknown) {
      const msg =
        e && typeof e === 'object' && 'response' in e
          ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
          : undefined;
      setError('Failed to generate blog: ' + (msg || (e instanceof Error ? e.message : 'Unknown error')));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (format: 'docx' | 'html') => {
    if (!generatedBlog) return;
    try {
      const blob = await downloadBlog(generatedBlog, format);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${generatedBlog.title.toLowerCase().replace(/\s+/g, '_')}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      setSuccess(`Downloaded as ${format.toUpperCase()}`);
    } catch (e: unknown) {
      setError('Download failed: ' + (e instanceof Error ? e.message : 'Unknown error'));
    }
  };

  const copyBlogContent = async () => {
    if (!generatedBlog) return;
    try {
      const htmlContent = generatedBlog.content;
      const plain = generatedBlog.content
        .replace(/<[^>]*>/g, '')
        .replace(/&nbsp;/g, ' ')
        .trim();

      if (navigator.clipboard?.write) {
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': new Blob([htmlContent], { type: 'text/html' }),
            'text/plain': new Blob([plain], { type: 'text/plain' }),
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(plain);
      }
      setSuccess('Copied to clipboard');
    } catch {
      setError('Failed to copy content');
    }
  };

  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <AppShell
        navigation={
          <ViewNav
            view={view}
            onChange={setView}
            previewDisabled={!generatedBlog}
          />
        }
      >
        <Collapse in={!!error}>
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        </Collapse>

        {loading && <LinearProgress sx={{ mb: 2, borderRadius: 1 }} />}

        {view === 'tracker' && (
          <ContentTrackerView onUseForGeneration={handleUseTrackerRow} />
        )}

        {view === 'generate' && (
          <BlogGeneratorView
            trendingTopics={trendingTopics}
            loadingTopics={loadingTopics}
            selectedTopic={selectedTopic}
            customTopic={customTopic}
            keywords={keywords}
            keywordInput={keywordInput}
            selectedLinks={selectedLinks}
            targetWordCount={targetWordCount}
            tone={tone}
            includeRegulatoryInfo={includeRegulatoryInfo}
            resourceLinks={resourceLinks}
            blogLinks={blogLinks}
            loading={loading}
            loadingMoreBlogs={loadingMoreBlogs}
            hasMoreBlogs={hasMoreBlogs}
            currentBlogPage={currentBlogPage}
            onRefreshTopics={() => loadTrendingTopics(true)}
            onTopicSelect={handleTopicSelect}
            onCustomTopicChange={handleCustomTopicChange}
            onKeywordInputChange={setKeywordInput}
            onAddKeyword={addKeyword}
            onRemoveKeyword={(k) => setKeywords(keywords.filter((x) => x !== k))}
            onToggleLink={(url) =>
              setSelectedLinks((prev) =>
                prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
              )
            }
            onTargetWordCountChange={setTargetWordCount}
            onToneChange={setTone}
            onIncludeRegulatoryChange={setIncludeRegulatoryInfo}
            onLoadMoreBlogs={loadMoreBlogs}
            onGenerate={generateBlogPost}
          />
        )}

        {view === 'preview' && generatedBlog && (
          <BlogPreviewView
            blog={generatedBlog}
            onCopy={copyBlogContent}
            onDownload={handleDownload}
            onBackToGenerate={() => setView('generate')}
          />
        )}
      </AppShell>

      <Snackbar
        open={!!success}
        autoHideDuration={4000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </ThemeProvider>
  );
}

export default App;
