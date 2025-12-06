// Simple proxy to handle the API routes
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // For now, return a simple response to test deployment
    if (req.url.includes('suggested-topics')) {
      return res.json([
        {
          title: 'Automating HIPAA Compliance with AI-Powered Audit Tools',
          description: 'How AI can streamline HIPAA compliance monitoring and reduce manual audit workload',
          keywords: ['hipaa', 'ai', 'compliance', 'automation', 'monitoring'],
          category: 'healthcare-software-development',
          relevance: 10,
          source: 'fallback'
        }
      ]);
    }
    
    // Default response
    res.json({ 
      message: 'AutoBlog AI API is running on Vercel',
      timestamp: new Date().toISOString(),
      url: req.url,
      method: req.method
    });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
};
