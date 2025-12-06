# AutoBlog AI - Frontend Dashboard

🌐 **Modern React-based dashboard for generating professional software development blogs using AI.**

## 🎯 Features

### Smart Topic Selection
- **AI-Generated Suggestions**: Fresh topics focused on HIPAA, AI, and tech trends
- **Refresh Functionality**: Generate new topics on-demand with LLM
- **Custom Topics**: Enter any topic with keyword suggestions
- **Visual Feedback**: Loading states and success messages

### Technology Rivers Integration
- **Dynamic Link Scraping**: Real-time fetching of Technology Rivers content
- **Resource Categorization**: Separate resources and blog posts
- **Pagination**: Load more blog links as needed
- **Smart Selection**: Auto-select relevant links based on keywords

### Blog Configuration
- **Word Count Control**: Precise targeting of content length (500-3000 words)
- **Tone Selection**: Professional, casual, technical, or executive
- **Keyword Management**: Add, remove, and organize keywords
- **Regulatory Info**: Option to include HIPAA and compliance information

### Content Generation
- **AI-Powered**: Uses GROQ/Llama models for high-quality content
- **Professional Formatting**: HTML structure with headings, lists, links
- **SEO Optimization**: Keyword integration and meta information
- **Dynamic Resources**: User-selected resources appended to content

### Export & Distribution
- **Multiple Formats**: Download as DOCX or HTML
- **Email Integration**: Direct email to marketing team
- **Rich Formatting**: Preserves headings, lists, and links
- **Live Preview**: Real-time HTML preview with proper formatting

## 🚀 Quick Start

### 1. Installation

```bash
npm install
```

### 2. Environment Setup

Create `.env` file (optional, defaults to localhost):

```bash
REACT_APP_API_URL=http://localhost:3000
```

### 3. Start Development Server

```bash
npm start
```

The app will open at `http://localhost:3001`

### 4. Build for Production

```bash
npm run build
```

## 🏗️ Project Structure

```
src/
├── App.tsx          # Main application component
├── index.tsx        # Application entry point
└── ...

public/
├── index.html       # HTML template
└── ...

autoblog-api/        # Vercel serverless functions
└── index.js         # API proxy function
```

## 🔌 API Integration

The frontend connects to the AutoBlog AI backend API:

### Base URL
- **Development**: `http://localhost:3000`
- **Production**: Configure via `REACT_APP_API_URL` environment variable

### Key Endpoints Used
- `GET /blog-generator/suggested-topics` - Get AI-generated topics
- `POST /blog-generator/generate` - Generate blog post
- `POST /blog-generator/download-docx` - Download as DOCX
- `POST /blog-generator/download-html` - Download as HTML
- `GET /blog-generator/separated-links` - Get Technology Rivers links
- `GET /blog-generator/load-more-blogs/:page` - Load more blog links

## 🎨 UI Components

Built with **Material-UI (MUI)** for a modern, responsive interface:
- Material Design components
- Responsive layout
- Dark/Light theme support (if configured)
- Accessible components

## 📦 Dependencies

### Core
- **React**: UI library
- **TypeScript**: Type-safe JavaScript
- **Material-UI**: Component library
- **Axios**: HTTP client

### Development
- **react-scripts**: Create React App tooling
- **TypeScript**: Type definitions

## 🚀 Deployment

### Vercel Deployment

1. Connect your repository to Vercel
2. Configure build settings:
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

3. Environment Variables (if needed):
   ```
   REACT_APP_API_URL=https://your-backend-api.com
   ```

4. The `vercel.json` is already configured for:
   - React app routing
   - Serverless API functions (`/api/*` routes)

### Other Platforms

The `build` folder contains static files that can be deployed to:
- Netlify
- AWS S3 + CloudFront
- GitHub Pages
- Any static hosting service

## 🔧 Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start development server (port 3001) |
| `npm run build` | Build for production |
| `npm test` | Run tests |
| `npm run eject` | Eject from Create React App |

### Port Configuration

Default port is **3001** (configured to avoid conflicts with backend on 3000).

To change:
```bash
PORT=3002 npm start
```

Or set in `.env`:
```
PORT=3002
```

## 🚦 Troubleshooting

### Common Issues

**Backend Connection Errors:**
```bash
# Verify backend is running
curl http://localhost:3000/blog-generator/health

# Check CORS configuration in backend
```

**Port Conflicts:**
```bash
# Check what's running on port 3001
lsof -i :3001

# Kill existing process
kill -9 $(lsof -t -i:3001)
```

**Build Errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 🔮 Future Enhancements

- [ ] User authentication
- [ ] Blog history and saved drafts
- [ ] Advanced SEO tools
- [ ] Social media integration
- [ ] Analytics dashboard
- [ ] Dark mode theme
- [ ] Mobile app version

---

**Built with**: React, TypeScript, Material-UI, Axios

**License**: MIT
