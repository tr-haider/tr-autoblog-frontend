import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Collapse, LinearProgress, Snackbar } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppShell } from './components/layout/AppShell';
import { ViewNav } from './components/layout/ViewNav';
import { ContentTrackerView } from './components/content-tracker/ContentTrackerView';
import { BlogGeneratorView } from './components/blog-generator/BlogGeneratorView';
import { BlogPreviewView } from './components/blog-generator/BlogPreviewView';
import { MOCK_VIDEO_TESTIMONIALS } from './components/blog-generator/constants';
import { buildBlogApiRequest } from './components/blog-generator/buildApiRequest';
import {
  combineKeywords,
  extractExternalLinksFromRow,
  extractInternalLinksFromRow,
  extractPrimaryKeywordsFromRow,
  extractSecondaryKeywordsFromRow,
  extractPodcastLinksFromRow,
  generateMockResearchQuestions,
  generatePortfolioSummary,
  getRelevantLinks,
  normalizeLinkUrl,
  portfolioLinksToItems,
} from './components/blog-generator/utils';
import { appTheme } from './theme/theme';
import {
  downloadBlog,
  fetchContentTrackerRows,
  fetchSeparatedLinks,
  generateBlog,
} from './api/client';
import type {
  AppView,
  BlogPost,
  ContentTrackerRow,
  ManualLink,
  PortfolioItem,
  TechnologyRiversLink,
  Testimonial,
} from './types';

function App() {
  const [view, setView] = useState<AppView>('tracker');
  const [workflowStep, setWorkflowStep] = useState(0);

  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [primaryKeywords, setPrimaryKeywords] = useState<string[]>([]);
  const [primaryKeywordInput, setPrimaryKeywordInput] = useState('');
  const [secondaryKeywords, setSecondaryKeywords] = useState<string[]>([]);
  const [secondaryKeywordInput, setSecondaryKeywordInput] = useState('');
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [suggestedLinks, setSuggestedLinks] = useState<string[]>([]);
  const [dismissedLinks, setDismissedLinks] = useState<string[]>([]);
  const [manualLinks, setManualLinks] = useState<ManualLink[]>([]);
  const [targetWordCount, setTargetWordCount] = useState(1200);
  const [tone, setTone] = useState('professional');
  const [authorStyle, setAuthorStyle] = useState('');
  const [includeRegulatoryInfo, setIncludeRegulatoryInfo] = useState(true);

  const [researchQuestionsText, setResearchQuestionsText] = useState('');
  const [generatingQuestions, setGeneratingQuestions] = useState(false);

  const [selectedPortfolioIds, setSelectedPortfolioIds] = useState<string[]>([]);
  const [portfolioSummaries, setPortfolioSummaries] = useState<Record<string, string>>({});
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [podcastLinks, setPodcastLinks] = useState<string[]>([]);
  const [selectedPodcasts, setSelectedPodcasts] = useState<string[]>([]);
  const [bookLink, setBookLink] = useState('');
  const [externalLinks, setExternalLinks] = useState<string[]>([]);
  const [introInstructions, setIntroInstructions] = useState('');
  const [summaryInstructions, setSummaryInstructions] = useState('');

  const [sheetTopics, setSheetTopics] = useState<ContentTrackerRow[]>([]);
  const [selectedRow, setSelectedRow] = useState<ContentTrackerRow | null>(null);
  const [resourceLinks, setResourceLinks] = useState<TechnologyRiversLink[]>([]);
  const [blogLinks, setBlogLinks] = useState<TechnologyRiversLink[]>([]);
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);
  const [loadingLinks, setLoadingLinks] = useState(false);

  const [generatedBlog, setGeneratedBlog] = useState<BlogPost | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadSheetTopics();
    loadSeparatedLinks();
  }, []);

  const loadSheetTopics = async (isRefresh = false) => {
    if (isRefresh) {
      setLoadingTopics(true);
      setError('');
    }
    try {
      const data = await fetchContentTrackerRows({ limit: 100 });
      setSheetTopics(data.rows);
      if (isRefresh) {
        setSuccess('Topics refreshed from Google Sheets');
      }
    } catch {
      setError('Failed to load topics from Google Sheets');
    } finally {
      if (isRefresh) setLoadingTopics(false);
    }
  };

  const loadSeparatedLinks = async (isRefresh = false) => {
    setLoadingLinks(true);
    if (isRefresh) setError('');
    try {
      const data = await fetchSeparatedLinks(isRefresh);
      setResourceLinks(data.resources || []);
      setBlogLinks(data.blogs || []);
      setPortfolioItems(portfolioLinksToItems(data.portfolio || []));
      if (isRefresh) {
        setSuccess('Site map refreshed from technologyrivers.com');
      }
    } catch {
      setResourceLinks([]);
      setBlogLinks([]);
      setPortfolioItems([]);
      if (isRefresh) setError('Failed to refresh site map');
    } finally {
      setLoadingLinks(false);
    }
  };

  const resetWorkflowState = useCallback(() => {
    setWorkflowStep(0);
    setResearchQuestionsText('');
    setSelectedPortfolioIds([]);
    setPortfolioSummaries({});
    setTestimonials([]);
    setSelectedVideoIds([]);
    setSelectedServices([]);
    setSelectedPodcasts([]);
    setPodcastLinks([]);
    setBookLink('');
    setExternalLinks([]);
    setIntroInstructions('');
    setSummaryInstructions('');
    setManualLinks([]);
    setSuggestedLinks([]);
    setDismissedLinks([]);
  }, []);

  const mergeRelevantLinksIntoSelection = useCallback(
    (baseUrls: string[], catalog: TechnologyRiversLink[], topic: string, keywords: string[]) => {
      if (!topic.trim() && keywords.length === 0) return baseUrls;

      const relevant = getRelevantLinks(catalog, keywords, topic, { minScore: 4, limit: 6 });
      const merged = [...baseUrls];
      const seen = new Set(baseUrls.map(normalizeLinkUrl));

      for (const link of relevant) {
        const key = normalizeLinkUrl(link.url);
        if (!seen.has(key)) {
          seen.add(key);
          merged.push(link.url);
        }
      }

      return merged;
    },
    [],
  );

  const applyRowToGenerator = useCallback((row: ContentTrackerRow) => {
    const internal = extractInternalLinksFromRow(row);
    const podcasts = extractPodcastLinksFromRow(row);
    const external = extractExternalLinksFromRow(row);

    setSelectedRow(row);
    setSelectedTopic(row.title);
    setCustomTopic('');
    setPrimaryKeywords(extractPrimaryKeywordsFromRow(row));
    setSecondaryKeywords(extractSecondaryKeywordsFromRow(row));
    setSelectedLinks(
      mergeRelevantLinksIntoSelection(
        internal,
        [...resourceLinks, ...blogLinks],
        row.title,
        extractPrimaryKeywordsFromRow(row).concat(extractSecondaryKeywordsFromRow(row)),
      ),
    );
    setSuggestedLinks(internal);
    setDismissedLinks([]);
    setBookLink(row.ebookLink?.split(/[\n,]+/)[0]?.trim() || '');
    setPodcastLinks(podcasts.length > 0 ? podcasts : ['https://ghazenfer.com/podcast']);
    setSelectedPodcasts(podcasts);
    setExternalLinks(external);

    if (row.servicePage) {
      const serviceName = row.servicePage.includes('healthcare')
        ? 'Healthcare IT / HIPAA'
        : 'Custom Software Development';
      setSelectedServices([serviceName]);
    }

    if (row.portfolioCaseStudy && portfolioItems.length > 0) {
      const portfolioUrl = row.portfolioCaseStudy.split(/[\n,]+/)[0]?.trim();
      const matched = portfolioItems.find(
        (item) => item.url && normalizeLinkUrl(item.url) === normalizeLinkUrl(portfolioUrl),
      );
      if (matched) {
        setSelectedPortfolioIds([matched.id]);
        setPortfolioSummaries({
          [matched.id]: generatePortfolioSummary(matched.title, matched.description),
        });
      }
    }

    setWorkflowStep(0);
  }, [mergeRelevantLinksIntoSelection, resourceLinks, blogLinks, portfolioItems]);

  const handleTopicSelect = (row: ContentTrackerRow) => {
    applyRowToGenerator(row);
  };

  const handleMetadataChange = useCallback((field: keyof ContentTrackerRow, value: string) => {
    setSelectedRow((prev) => {
      if (!prev) return null;
      const updated = { ...prev, [field]: value };

      const linkFields: (keyof ContentTrackerRow)[] = [
        'servicePage',
        'relatedBlog',
        'portfolioCaseStudy',
        'ebookLink',
        'otherInternalLinks',
      ];
      if (linkFields.includes(field) || field === 'cta') {
        const internal = extractInternalLinksFromRow(updated);
        setSuggestedLinks(internal);
        setSelectedLinks(
          mergeRelevantLinksIntoSelection(
            internal,
            [...resourceLinks, ...blogLinks],
            updated.title,
            extractPrimaryKeywordsFromRow(updated).concat(extractSecondaryKeywordsFromRow(updated)),
          ),
        );
        if (field === 'ebookLink') {
          setBookLink(value.split(/[\n,]+/).map((s) => s.trim()).find(Boolean) || '');
        }
      }

      return updated;
    });
  }, [mergeRelevantLinksIntoSelection, resourceLinks, blogLinks]);

  const handleCustomTopicChange = (value: string) => {
    setCustomTopic(value);
    setSelectedTopic('');
    setSelectedRow(null);
    setSuggestedLinks([]);
    const suggested: string[] = [];
    const v = value.toLowerCase();
    if (v.includes('ai')) suggested.push('AI');
    if (v.includes('hipaa')) suggested.push('HIPAA compliance');
    if (v.includes('mobile')) suggested.push('mobile app development');
    if (v.includes('cloud')) suggested.push('cloud hosting');
    if (v.includes('security')) suggested.push('security');
    if (suggested.length) {
      setPrimaryKeywords([suggested[0]]);
      setSecondaryKeywords(suggested.slice(1));
    }
  };

  const handleClearTopic = () => {
    setSelectedTopic('');
    setCustomTopic('');
    setSelectedRow(null);
    setPrimaryKeywords([]);
    setPrimaryKeywordInput('');
    setSecondaryKeywords([]);
    setSecondaryKeywordInput('');
    setSelectedLinks([]);
    setDismissedLinks([]);
    resetWorkflowState();
  };

  const handleUseTrackerRow = useCallback(
    (row: ContentTrackerRow) => {
      applyRowToGenerator(row);
      setView('generate');
      setSuccess(`Loaded "${row.title}" into the blog generator`);
    },
    [applyRowToGenerator],
  );

  const isKeywordTaken = (k: string, lists: string[][]) =>
    lists.some((list) => list.some((existing) => existing.toLowerCase() === k.toLowerCase()));

  const addPrimaryKeyword = () => {
    const k = primaryKeywordInput.trim();
    if (!k || isKeywordTaken(k, [primaryKeywords, secondaryKeywords])) return;
    setPrimaryKeywords([...primaryKeywords, k]);
    setPrimaryKeywordInput('');
  };

  const addSecondaryKeyword = () => {
    const k = secondaryKeywordInput.trim();
    if (!k || isKeywordTaken(k, [primaryKeywords, secondaryKeywords])) return;
    setSecondaryKeywords([...secondaryKeywords, k]);
    setSecondaryKeywordInput('');
  };

  const handleGenerateQuestions = async () => {
    const topic = selectedTopic || customTopic;
    if (!topic) return;
    setGeneratingQuestions(true);
    await new Promise((r) => setTimeout(r, 600));
    setResearchQuestionsText(generateMockResearchQuestions(topic, primaryKeywords));
    setGeneratingQuestions(false);
    setSuccess('Research questions generated');
  };

  const handleToggleLink = (url: string) => {
    const key = normalizeLinkUrl(url);
    setSelectedLinks((prev) => {
      const exists = prev.some((u) => normalizeLinkUrl(u) === key);
      return exists ? prev.filter((u) => normalizeLinkUrl(u) !== key) : [...prev, url];
    });
  };

  const handleDismissLink = (url: string) => {
    const key = normalizeLinkUrl(url);
    setDismissedLinks((prev) =>
      prev.some((u) => normalizeLinkUrl(u) === key) ? prev : [...prev, url],
    );
    setSelectedLinks((prev) => prev.filter((u) => normalizeLinkUrl(u) !== key));
  };

  const handleAddManualLink = (link: ManualLink) => {
    setManualLinks((prev) => [...prev, link]);
    setSelectedLinks((prev) => (prev.includes(link.url) ? prev : [...prev, link.url]));
  };

  const handleRemoveManualLink = (id: string) => {
    const link = manualLinks.find((l) => l.id === id);
    if (link) {
      setSelectedLinks((prev) => prev.filter((u) => u !== link.url));
    }
    setManualLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const handleTogglePortfolio = (id: string) => {
    setSelectedPortfolioIds((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      if (!next.includes(id)) {
        setPortfolioSummaries((s) => {
          const copy = { ...s };
          delete copy[id];
          return copy;
        });
      }
      return next;
    });
  };

  const handleGeneratePortfolioSummary = (id: string) => {
    const item = portfolioItems.find((p) => p.id === id);
    if (!item) return;
    setPortfolioSummaries((prev) => ({
      ...prev,
      [id]: generatePortfolioSummary(item.title, item.description),
    }));
  };

  const allSelectedLinks = [
    ...selectedLinks,
    ...selectedPodcasts,
    ...externalLinks,
    ...(bookLink ? [bookLink] : []),
  ].filter((url, i, arr) => arr.indexOf(url) === i);

  const generateBlogPost = async () => {
    if (!selectedTopic && !customTopic) {
      setError('Please select or enter a topic');
      return;
    }
    if (primaryKeywords.length === 0) {
      setError('Please add at least one primary keyword');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const request = buildBlogApiRequest(
        {
          topic: selectedTopic || customTopic,
          keywords: combineKeywords(primaryKeywords, secondaryKeywords),
          targetWordCount,
          tone,
          includeRegulatoryInfo,
          selectedLinks: allSelectedLinks,
          metaTitle: selectedRow?.metaTitle || undefined,
          metaDescription: selectedRow?.metaDescription || undefined,
          angle: selectedRow?.angle || undefined,
          cta: selectedRow?.cta || undefined,
        },
        {
          authorStyle,
          researchQuestionsText,
          portfolioSummaries,
          testimonials,
          selectedServices,
          introInstructions,
          summaryInstructions,
        },
      );
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
          <ViewNav view={view} onChange={setView} previewDisabled={!generatedBlog} />
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
            workflowStep={workflowStep}
            sheetTopics={sheetTopics}
            loadingTopics={loadingTopics}
            selectedTopic={selectedTopic}
            selectedRow={selectedRow}
            customTopic={customTopic}
            primaryKeywords={primaryKeywords}
            primaryKeywordInput={primaryKeywordInput}
            secondaryKeywords={secondaryKeywords}
            secondaryKeywordInput={secondaryKeywordInput}
            tone={tone}
            authorStyle={authorStyle}
            targetWordCount={targetWordCount}
            includeRegulatoryInfo={includeRegulatoryInfo}
            researchQuestionsText={researchQuestionsText}
            generatingQuestions={generatingQuestions}
            selectedLinks={selectedLinks}
            suggestedLinks={suggestedLinks}
            manualLinks={manualLinks}
            portfolioItems={portfolioItems}
            selectedPortfolioIds={selectedPortfolioIds}
            portfolioSummaries={portfolioSummaries}
            testimonials={testimonials}
            videoTestimonials={MOCK_VIDEO_TESTIMONIALS}
            selectedVideoIds={selectedVideoIds}
            selectedServices={selectedServices}
            podcastLinks={podcastLinks}
            selectedPodcasts={selectedPodcasts}
            bookLink={bookLink}
            externalLinks={externalLinks}
            introInstructions={introInstructions}
            summaryInstructions={summaryInstructions}
            resourceLinks={resourceLinks}
            blogLinks={blogLinks}
            dismissedLinks={dismissedLinks}
            loadingLinks={loadingLinks}
            loading={loading}
            onStepChange={setWorkflowStep}
            onRefreshTopics={() => loadSheetTopics(true)}
            onTopicSelect={handleTopicSelect}
            onClearTopic={handleClearTopic}
            onCustomTopicChange={handleCustomTopicChange}
            onPrimaryKeywordInputChange={setPrimaryKeywordInput}
            onAddPrimaryKeyword={addPrimaryKeyword}
            onRemovePrimaryKeyword={(k) =>
              setPrimaryKeywords(primaryKeywords.filter((x) => x !== k))
            }
            onSecondaryKeywordInputChange={setSecondaryKeywordInput}
            onAddSecondaryKeyword={addSecondaryKeyword}
            onRemoveSecondaryKeyword={(k) =>
              setSecondaryKeywords(secondaryKeywords.filter((x) => x !== k))
            }
            onMetadataChange={handleMetadataChange}
            onToneChange={setTone}
            onAuthorStyleChange={setAuthorStyle}
            onTargetWordCountChange={setTargetWordCount}
            onIncludeRegulatoryChange={setIncludeRegulatoryInfo}
            onGenerateQuestions={handleGenerateQuestions}
            onResearchQuestionsTextChange={setResearchQuestionsText}
            onToggleLink={handleToggleLink}
            onAddManualLink={handleAddManualLink}
            onRemoveManualLink={handleRemoveManualLink}
            onDismissLink={handleDismissLink}
            onRefreshLinks={() => loadSeparatedLinks(true)}
            onTogglePortfolio={handleTogglePortfolio}
            onGeneratePortfolioSummary={handleGeneratePortfolioSummary}
            onAddTestimonial={(t) => setTestimonials((prev) => [...prev, t])}
            onRemoveTestimonial={(id) =>
              setTestimonials((prev) => prev.filter((t) => t.id !== id))
            }
            onToggleVideo={(id) =>
              setSelectedVideoIds((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
              )
            }
            onToggleService={(service) =>
              setSelectedServices((prev) =>
                prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service],
              )
            }
            onTogglePodcast={(url) =>
              setSelectedPodcasts((prev) =>
                prev.includes(url) ? prev.filter((u) => u !== url) : [...prev, url],
              )
            }
            onBookLinkChange={setBookLink}
            onAddExternalLink={(url) =>
              setExternalLinks((prev) => (prev.includes(url) ? prev : [...prev, url]))
            }
            onRemoveExternalLink={(url) =>
              setExternalLinks((prev) => prev.filter((u) => u !== url))
            }
            onIntroChange={setIntroInstructions}
            onSummaryChange={setSummaryInstructions}
            onGenerate={generateBlogPost}
          />
        )}

        {view === 'preview' && generatedBlog && (
          <BlogPreviewView
            blog={generatedBlog}
            onBlogChange={setGeneratedBlog}
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
