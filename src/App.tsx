import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Chip,
  TextField,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  Autocomplete,
  FormControlLabel,
  Checkbox,
  Alert,
  LinearProgress,
  Tab,
  Tabs,
  Divider,
} from '@mui/material';
import {
  Create as CreateIcon,
  Download as DownloadIcon,
  Topic as TopicIcon,
  Link as LinkIcon,
  Refresh as RefreshIcon,
  Preview as PreviewIcon,
  ContentCopy as CopyIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import axios from 'axios';

// Types
interface TrendingTopic {
  title: string;
  description: string;
  keywords: string[];
  category: string;
  relevance: number;
  source?: string;
}

interface TechnologyRiversLink {
  title: string;
  url: string;
  category: string;
  type: 'resource' | 'blog';
  description?: string;
}

interface BlogPost {
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

interface BlogGenerationRequest {
  topic: string;
  keywords: string[];
  targetWordCount: number;
  tone: string;
  includeRegulatoryInfo: boolean;
  selectedLinks: string[];
}

// API Configuration
const API_BASE = process.env.REACT_APP_API_BASE || 'https://tr-autoblog-backend.vercel.app';

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2c3e50',
    },
    secondary: {
      main: '#3498db',
    },
    background: {
      default: '#f8f9fa',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
});



function App() {
  // State
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [customTopic, setCustomTopic] = useState<string>('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState<string>('');
  const [selectedLinks, setSelectedLinks] = useState<string[]>([]);
  const [targetWordCount, setTargetWordCount] = useState<number>(1200);
  const [tone, setTone] = useState<string>('professional');
  const [includeRegulatoryInfo, setIncludeRegulatoryInfo] = useState<boolean>(true);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingTopics, setLoadingTopics] = useState<boolean>(false);
  const [generatedBlog, setGeneratedBlog] = useState<BlogPost | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [currentTab, setCurrentTab] = useState<number>(0);
  const [blogExpanded, setBlogExpanded] = useState<boolean>(false);
  const [resourceLinks, setResourceLinks] = useState<TechnologyRiversLink[]>([]);
  const [blogLinks, setBlogLinks] = useState<TechnologyRiversLink[]>([]);
  const [currentBlogPage, setCurrentBlogPage] = useState<number>(1);
  const [loadingMoreBlogs, setLoadingMoreBlogs] = useState<boolean>(false);
  const [hasMoreBlogs, setHasMoreBlogs] = useState<boolean>(true);

  // Load trending topics on component mount
  useEffect(() => {
    loadTrendingTopics();
    loadSeparatedLinks();
  }, []);

  const loadTrendingTopics = async (isRefresh = false) => {
    if (isRefresh) {
      setLoadingTopics(true);
      setError(''); // Clear any previous errors
      setSuccess('Generating fresh AI-powered topics...');
    }
    
    try {
      console.log('🔄 Calling LLM to generate fresh trending topics...');
      const response = await axios.get(`${API_BASE}/blog-generator/suggested-topics`);
      setTrendingTopics(response.data);
      
      if (isRefresh) {
        setSuccess('✅ Fresh topics generated successfully!');
        setTimeout(() => setSuccess(''), 3000); // Clear success message after 3 seconds
      }
      
      console.log(`✅ Loaded ${response.data.length} fresh AI-generated topics`);
    } catch (error) {
      console.error('Failed to load trending topics:', error);
      setError('Failed to generate fresh topics. Please try again.');
      
      // Fallback to static topics only if no topics are currently loaded
      if (trendingTopics.length === 0) {
        setTrendingTopics([
          {
            title: 'Automating HIPAA Compliance Audits with AI-Powered Monitoring Tools',
            description: 'How AI can streamline HIPAA compliance monitoring and reduce manual audit workload',
            keywords: ['hipaa', 'ai', 'compliance', 'automation', 'monitoring'],
            category: 'healthcare-software-development',
            relevance: 10,
            source: 'fallback'
          },
          {
            title: 'Building AI-Powered Healthcare APIs with FHIR and Cloud Integration',
            description: 'Modern approaches to developing HIPAA-compliant healthcare APIs using AI and cloud technologies',
            keywords: ['hipaa', 'ai', 'fhir', 'apis', 'cloud', 'healthcare'],
            category: 'healthcare-software-development',
            relevance: 9,
            source: 'fallback'
          }
        ]);
      }
    } finally {
      if (isRefresh) {
        setLoadingTopics(false);
      }
    }
  };

  const loadSeparatedLinks = async () => {
    try {
      const response = await axios.get(`${API_BASE}/blog-generator/separated-links`);
      setResourceLinks(response.data.resources || []);
      setBlogLinks(response.data.blogs || []);
      setCurrentBlogPage(1); // Reset to first page
      setHasMoreBlogs(true); // Assume there are more pages available
    } catch (error) {
      console.error('Failed to load separated links:', error);
      // Fallback to empty arrays
      setResourceLinks([]);
      setBlogLinks([]);
    }
  };

  const loadMoreBlogs = async () => {
    if (loadingMoreBlogs || !hasMoreBlogs) return;

    setLoadingMoreBlogs(true);
    try {
      const nextPage = currentBlogPage + 1;
      const response = await axios.get(`${API_BASE}/blog-generator/load-more-blogs/${nextPage}`);
      const newBlogs = response.data.blogs || [];
      
      if (newBlogs.length === 0) {
        // No more blogs available
        setHasMoreBlogs(false);
      } else {
        // Filter out duplicates before adding to existing list
        setBlogLinks(prevBlogs => {
          const existingUrls = new Set(prevBlogs.map(blog => blog.url));
          const existingTitles = new Set(prevBlogs.map(blog => blog.title.toLowerCase().trim()));
          
          const uniqueNewBlogs = newBlogs.filter((blog: TechnologyRiversLink) => {
            const normalizedTitle = blog.title.toLowerCase().trim();
            return !existingUrls.has(blog.url) && !existingTitles.has(normalizedTitle);
          });
          
          console.log(`Loaded ${uniqueNewBlogs.length} unique new blogs from page ${nextPage} (filtered ${newBlogs.length - uniqueNewBlogs.length} duplicates)`);
          
          if (uniqueNewBlogs.length === 0) {
            // All blogs were duplicates, try to load next page or stop
            setHasMoreBlogs(false);
            return prevBlogs;
          }
          
          return [...prevBlogs, ...uniqueNewBlogs];
        });
        setCurrentBlogPage(nextPage);
      }
    } catch (error) {
      console.error('Failed to load more blogs:', error);
      setError('Failed to load more blog posts');
      // If we get an error, assume no more pages
      setHasMoreBlogs(false);
    } finally {
      setLoadingMoreBlogs(false);
    }
  };

  const handleTopicSelect = (topic: TrendingTopic) => {
    setSelectedTopic(topic.title);
    setCustomTopic('');
    setKeywords(topic.keywords);
    
    // Auto-select relevant links based on topic keywords
    const allLinks = [...resourceLinks, ...blogLinks];
    const relevantLinks = allLinks
      .filter(link => 
        topic.keywords.some(keyword => 
          link.title.toLowerCase().includes(keyword.toLowerCase()) ||
          link.category.toLowerCase().includes(keyword.toLowerCase())
        )
      )
      .map(link => link.url)
      .slice(0, 3);
    
    setSelectedLinks(relevantLinks);
  };

  const handleCustomTopicChange = (value: string) => {
    setCustomTopic(value);
    setSelectedTopic('');
    
    // Auto-suggest keywords based on custom topic
    const suggestedKeywords = [];
    if (value.toLowerCase().includes('ai')) suggestedKeywords.push('AI');
    if (value.toLowerCase().includes('hipaa')) suggestedKeywords.push('HIPAA compliance');
    if (value.toLowerCase().includes('mobile')) suggestedKeywords.push('mobile app development');
    if (value.toLowerCase().includes('cloud')) suggestedKeywords.push('cloud hosting');
    if (value.toLowerCase().includes('security')) suggestedKeywords.push('security');
    
    setKeywords(suggestedKeywords);
  };

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      setKeywords([...keywords, keywordInput.trim()]);
      setKeywordInput('');
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setKeywords(keywords.filter(k => k !== keywordToRemove));
  };

  const toggleLink = (linkUrl: string) => {
    if (selectedLinks.includes(linkUrl)) {
      setSelectedLinks(selectedLinks.filter(url => url !== linkUrl));
    } else {
      setSelectedLinks([...selectedLinks, linkUrl]);
    }
  };

  const generateBlog = async () => {
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

      const response = await axios.post(`${API_BASE}/blog-generator/generate`, request);
      setGeneratedBlog(response.data.blogPost);
      setSuccess('Blog generated successfully!');
      setCurrentTab(1); // Switch to preview tab
    } catch (error: any) {
      setError('Failed to generate blog: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const downloadBlog = async (format: 'docx' | 'html') => {
    if (!generatedBlog) return;

    try {
      const endpoint = format === 'docx' 
        ? `${API_BASE}/blog-generator/download-docx`
        : `${API_BASE}/blog-generator/download-html`;

      const response = await axios.post(
        endpoint,
        generatedBlog,
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], {
        type: format === 'docx' 
          ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          : 'text/html'
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${generatedBlog.title.toLowerCase().replace(/\s+/g, '_')}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess(`Blog downloaded as ${format.toUpperCase()} successfully!`);
    } catch (error: any) {
      setError('Failed to download blog: ' + (error.response?.data?.error || error.message));
    }
  };

  const copyBlogContent = async () => {
    if (!generatedBlog) return;

    try {
      // Blog content already contains the title as <h1>, so use it directly
      const htmlContent = generatedBlog.content;
      
      // Try to copy as HTML first (modern browsers)
      if (navigator.clipboard && navigator.clipboard.write) {
        const htmlBlob = new Blob([htmlContent], { type: 'text/html' });
        const textBlob = new Blob([
          generatedBlog.content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').trim()
        ], { type: 'text/plain' });
        
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': htmlBlob,
            'text/plain': textBlob
          })
        ]);
        setSuccess('Blog content copied with formatting to clipboard!');
      } else {
        // Fallback to plain text for older browsers
        const textContent = generatedBlog.content
          .replace(/<[^>]*>/g, '') // Remove HTML tags
          .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
          .replace(/&amp;/g, '&') // Replace HTML entities
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .trim();

        await navigator.clipboard.writeText(textContent);
        setSuccess('Blog content copied to clipboard!');
      }
    } catch (error) {
      // Ultimate fallback for older browsers
      const textArea = document.createElement('textarea');
      const textContent = generatedBlog.content.replace(/<[^>]*>/g, '').trim();
      textArea.value = textContent;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setSuccess('Blog content copied to clipboard!');
    }
  };
   console.log(selectedLinks)
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" color="primary">
          AutoBlog AI - Intelligent Blog Generation
        </Typography>
        <Typography variant="subtitle1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Generate professional software development blogs with AI-powered topic suggestions and Technology Rivers expertise
        </Typography>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={currentTab}
            onChange={(_, newValue) => setCurrentTab(newValue)}
            variant="fullWidth"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Generate Blog" icon={<CreateIcon />} />
            <Tab label="Preview & Actions" icon={<PreviewIcon />} disabled={!generatedBlog} />
          </Tabs>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {loading && <LinearProgress sx={{ mb: 2 }} />}

        {/* Tab 1: Generation Form */}
        {currentTab === 0 && (
          <Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              {/* Left Column - Topic Selection */}
              <Box sx={{ flex: 1 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    <TopicIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Topic Selection
                  </Typography>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Suggested Software Development Topics
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => loadTrendingTopics(true)}
                      startIcon={<RefreshIcon />}
                      disabled={loadingTopics}
                      sx={{ mb: 2 }}
                    >
                      {loadingTopics ? 'Generating...' : 'Refresh Topics'}
                    </Button>
                    <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                      {(loading && trendingTopics.length === 0) || loadingTopics ? (
                        <Box sx={{ textAlign: 'center', py: 3 }}>
                          <LinearProgress sx={{ mb: 2 }} />
                          <Typography variant="body2" color="text.secondary">
                            {loadingTopics ? 'Generating fresh AI-powered topics...' : 'Loading AI-powered topic suggestions...'}
                          </Typography>
                        </Box>
                      ) : null}
                      {trendingTopics.map((topic, index) => (
                        <Card 
                          key={index} 
                          sx={{ 
                            mb: 1, 
                            cursor: 'pointer',
                            border: selectedTopic === topic.title ? 2 : 1,
                            borderColor: selectedTopic === topic.title ? 'primary.main' : 'grey.300',
                            position: 'relative'
                          }}
                          onClick={() => handleTopicSelect(topic)}
                        >
                          <CardContent sx={{ py: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Typography variant="subtitle2" color="primary" sx={{ flex: 1, pr: 1 }}>
                                {topic.title}
                              </Typography>
                              {topic.source === 'ai-generated' && (
                                <Chip 
                                  label="AI" 
                                  size="small" 
                                  color="secondary"
                                  sx={{ fontSize: '0.6rem', height: '18px' }}
                                />
                              )}
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem', mt: 0.5 }}>
                              {topic.description}
                            </Typography>
                            <Box sx={{ mt: 1 }}>
                              {topic.keywords.map((keyword, idx) => (
                                <Chip 
                                  key={idx} 
                                  label={keyword} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ mr: 0.5, mb: 0.5, fontSize: '0.7rem' }} 
                                />
                              ))}
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Or Enter Custom Topic
                    </Typography>
                    <TextField
                      fullWidth
                      placeholder="e.g., Solving API Integration Challenges with Modern Tools"
                      value={customTopic}
                      onChange={(e) => handleCustomTopicChange(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                  </Box>
                </Paper>
              </Box>

              {/* Right Column - Configuration */}
              <Box sx={{ flex: 1 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Blog Configuration
                  </Typography>

                  {/* Keywords */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Keywords
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                      <TextField
                        size="small"
                        placeholder="Add keyword..."
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addKeyword()}
                        sx={{ flexGrow: 1 }}
                      />
                      <Button variant="outlined" onClick={addKeyword}>
                        Add
                      </Button>
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {keywords.map((keyword, index) => (
                        <Chip
                          key={index}
                          label={keyword}
                          onDelete={() => removeKeyword(keyword)}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Settings */}
                  <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                    <TextField
                      fullWidth
                      label="Word Count"
                      type="number"
                      value={targetWordCount}
                      onChange={(e) => setTargetWordCount(Number(e.target.value))}
                      inputProps={{ min: 500, max: 3000 }}
                    />
                    <Autocomplete
                      fullWidth
                      options={['professional', 'casual', 'technical', 'executive']}
                      value={tone}
                      onChange={(_, newValue) => setTone(newValue || 'professional')}
                      renderInput={(params) => <TextField {...params} label="Tone" />}
                    />
                  </Box>

                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={includeRegulatoryInfo}
                        onChange={(e) => setIncludeRegulatoryInfo(e.target.checked)}
                      />
                    }
                    label="Include Regulatory Information"
                    sx={{ mb: 2 }}
                  />
                </Paper>

                {/* Technology Rivers Links */}
                <Paper sx={{ p: 3, mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    <LinkIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Technology Rivers Links
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Select links to incorporate in your blog
                  </Typography>
                  
                  <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    {/* Resources Section */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'primary.main' }}>
                      📊 Resources
                    </Typography>
                    {resourceLinks.map((link, index) => {
                      const isSelected = selectedLinks.includes(link.url);
                      return (
                        <Box 
                          key={`resource-${index}`} 
                          sx={{ 
                            mb: 1, 
                            ml: 1,
                            p: 1,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: isSelected ? 'primary.main' : 'divider',
                            backgroundColor: isSelected ? 'primary.50' : 'transparent',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              borderColor: 'primary.main',
                              backgroundColor: isSelected ? 'primary.100' : 'primary.25'
                            }
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isSelected}
                                onChange={() => toggleLink(link.url)}
                                color="primary"
                              />
                            }
                            label={
                              <Box>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontWeight: 500,
                                    color: isSelected ? 'primary.main' : 'text.primary'
                                  }}
                                >
                                  {link.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {link.category} • {link.description?.substring(0, 60)}...
                                </Typography>
                                {isSelected && (
                                  <Typography variant="caption" color="primary.main" sx={{ display: 'block', fontWeight: 500 }}>
                                    ✓ Selected
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </Box>
                      );
                    })}
                    
                    <Divider sx={{ my: 2 }} />
                    
                    {/* Blog Posts Section */}
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: 'secondary.main' }}>
                      📝 Blog Posts
                    </Typography>
                    {blogLinks.map((link, index) => {
                      const isSelected = selectedLinks.includes(link.url);
                      return (
                        <Box 
                          key={`blog-${index}`} 
                          sx={{ 
                            mb: 1, 
                            ml: 1,
                            p: 1,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: isSelected ? 'secondary.main' : 'divider',
                            backgroundColor: isSelected ? 'secondary.50' : 'transparent',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              borderColor: 'secondary.main',
                              backgroundColor: isSelected ? 'secondary.100' : 'secondary.25'
                            }
                          }}
                        >
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={isSelected}
                                onChange={() => toggleLink(link.url)}
                                color="secondary"
                              />
                            }
                            label={
                              <Box>
                                <Typography 
                                  variant="body2" 
                                  sx={{ 
                                    fontWeight: 500,
                                    color: isSelected ? 'secondary.main' : 'text.primary'
                                  }}
                                >
                                  {link.title}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {link.category} • {link.description?.substring(0, 60)}...
                                </Typography>
                                {isSelected && (
                                  <Typography variant="caption" color="secondary.main" sx={{ display: 'block', fontWeight: 500 }}>
                                    ✓ Selected
                                  </Typography>
                                )}
                              </Box>
                            }
                          />
                        </Box>
                      );
                    })}
                    
                    {/* Load More Button */}
                    {hasMoreBlogs && (
                      <Box sx={{ textAlign: 'center', mt: 2, ml: 1 }}>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={loadMoreBlogs}
                          disabled={loadingMoreBlogs}
                          sx={{ 
                            borderStyle: 'dashed',
                            '&:hover': { borderStyle: 'solid' }
                          }}
                        >
                          {loadingMoreBlogs ? (
                            <>
                              <LinearProgress sx={{ width: 100, mr: 1 }} />
                              Loading...
                            </>
                          ) : (
                            `Load More Blog Posts (Page ${currentBlogPage + 1})`
                          )}
                        </Button>
                      </Box>
                    )}
                    
                    {/* Blog count info */}
                    {blogLinks.length > 0 && (
                      <Typography variant="caption" color="text.secondary" sx={{ ml: 1, mt: 1, display: 'block' }}>
                        Showing {blogLinks.length} blog posts from {currentBlogPage} page{currentBlogPage > 1 ? 's' : ''}
                      </Typography>
                    )}
                    
                    {resourceLinks.length === 0 && blogLinks.length === 0 && (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                        Loading links...
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Box>
            </Box>

            {/* Generate Button */}
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <Button
                variant="contained"
                size="large"
                onClick={generateBlog}
                disabled={loading || (!selectedTopic && !customTopic) || keywords.length === 0}
                startIcon={<CreateIcon />}
                sx={{ px: 4, py: 1.5 }}
              >
                {loading ? 'Generating Blog...' : 'Generate Blog'}
              </Button>
            </Box>
          </Box>
        )}

        {/* Tab 2: Preview & Actions */}
        {currentTab === 1 && generatedBlog && (
          <Box>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
              <Box sx={{ flex: 2 }}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Blog Preview
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CopyIcon />}
                        onClick={copyBlogContent}
                        sx={{ minWidth: 'auto' }}
                      >
                        Copy
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={blogExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        onClick={() => setBlogExpanded(!blogExpanded)}
                        sx={{ minWidth: 'auto' }}
                      >
                        {blogExpanded ? 'Collapse' : 'Expand'}
                      </Button>
                    </Box>
                  </Box>
                  
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="h5" color="primary" gutterBottom>
                      {generatedBlog.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                      {generatedBlog.summary}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                      <Chip label={`${generatedBlog.wordCount} words`} size="small" />
                      <Chip label={`${generatedBlog.readingTime} min read`} size="small" />
                      <Chip label={generatedBlog.topic} size="small" color="primary" />
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      {generatedBlog.keywords.map((keyword, index) => (
                        <Chip key={index} label={keyword} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                      ))}
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2 }} />
                  
                  <Box 
                    sx={{ 
                      maxHeight: blogExpanded ? 'none' : 400, 
                      overflowY: blogExpanded ? 'visible' : 'auto',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 2,
                      backgroundColor: 'grey.50',
                      position: 'relative',
                      '& h1, & h2, & h3': { 
                        color: 'primary.main',
                        marginTop: 2,
                        marginBottom: 1
                      },
                      '& ul': { pl: 3 },
                      '& li': { mb: 1 },
                      '& p': { mb: 2, lineHeight: 1.7 },
                      '& a': { color: 'primary.main', textDecoration: 'underline' },
                      '& strong': { fontWeight: 600 }
                    }}
                    dangerouslySetInnerHTML={{ __html: generatedBlog.content }}
                  />
                  
                  {!blogExpanded && (
                    <Box 
                      sx={{ 
                        textAlign: 'center', 
                        mt: 1,
                        opacity: 0.7
                      }}
                    >
                      <Typography variant="caption" color="text.secondary">
                        Scroll to read more or click "Expand" to view full content
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Box>

              <Box sx={{ flex: 1 }}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Actions
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Quick Actions
                    </Typography>
                    
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={copyBlogContent}
                      startIcon={<CopyIcon />}
                      sx={{ 
                        borderStyle: 'dashed',
                        '&:hover': { borderStyle: 'solid' }
                      }}
                    >
                      Copy Content
                    </Button>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Download Options
                    </Typography>
                    
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => downloadBlog('docx')}
                      startIcon={<DownloadIcon />}
                    >
                      Download DOCX
                    </Button>
                    
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => downloadBlog('html')}
                      startIcon={<DownloadIcon />}
                    >
                      Download HTML
                    </Button>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      Continue
                    </Typography>
                    
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={() => setCurrentTab(0)}
                    >
                      Generate Another Blog
                    </Button>
                  </Box>
                </Paper>

                {/* Blog Statistics */}
                <Paper sx={{ p: 3, mt: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Blog Statistics
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="body2">
                      <strong>Topic:</strong> {generatedBlog.topic}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Word Count:</strong> {generatedBlog.wordCount}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Reading Time:</strong> {generatedBlog.readingTime} minutes
                    </Typography>
                    <Typography variant="body2">
                      <strong>Generated At:</strong> {new Date(generatedBlog.createdAt).toLocaleString()}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Status:</strong> {generatedBlog.status}
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Box>
          </Box>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;