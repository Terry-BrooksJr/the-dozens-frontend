# The Dozens - Frontend

Static frontend for The Dozens Yo' Mama Jokes API. This project provides a clean separation between the frontend presentation layer and the Django REST API backend.

## 🏗️ Project Structure

```
the-dozens-frontend/
├── index.html              # Main homepage
├── assets/                 # Static media files
│   ├── images/
│   ├── videos/
│   └── icons/
├── css/
│   └── styles.css         # Main stylesheet
├── js/
│   ├── api-client.js      # API communication layer
│   ├── component-loader.js # HTML component loader
│   └── scripts.js         # Main application logic
├── fonts/                 # Custom web fonts
├── includes/              # HTML component includes
│   ├── history-modal.html
│   ├── joke-reporting-form.html
│   └── getting-started.html
├── package.json           # Node.js build tools
└── README.md             # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ (optional, for build tools)
- The Dozens API running on `http://localhost:8000`

### Development Setup

1. **Clone/Navigate to frontend directory:**
   ```bash
   cd the-dozens-frontend
   ```

2. **Install dependencies (optional):**
   ```bash
   npm install
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   Or serve directly with any static file server:
   ```bash
   python -m http.server 3000
   # or
   npx serve . -p 3000
   ```

4. **Access the site:**
   Open `http://localhost:3000` in your browser

### Production Build

```bash
npm run build
```

This will:
- Minify JavaScript files
- Minify CSS files
- Generate source maps for debugging

## 🔧 Configuration

### API Base URL

Update the API base URL in the HTML meta tag:

```html
<meta name="api-base-url" content="https://your-api-domain.com">
```

Or modify the `DozensAPIClient` constructor in `js/api-client.js`:

```javascript
const api = new DozensAPIClient('https://your-api-domain.com');
```

### Environment Variables

For production deployment, update the following in `index.html`:

- API endpoints (Swagger, GraphQL, etc.)
- Highlight.io project ID
- External service URLs

## 📦 Dependencies

### External CDN Dependencies

- **Bootstrap 5.3.2** - UI framework
- **UIKit 3.17.4** - Additional UI components
- **jQuery 3.6.1** - DOM manipulation
- **FontAwesome** - Icons
- **GSAP 3.13.0** - Animations
- **Animate.css** - CSS animations

### Optional Build Tools

- **serve** - Development server
- **terser** - JavaScript minification
- **clean-css-cli** - CSS minification

## 🌐 API Integration

The frontend communicates with the Django REST API through the `DozensAPIClient` class:

```javascript
// Get random joke
const joke = await dozensAPI.getRandomInsult({ category: 'P', nsfw: false });

// Get all categories
const categories = await dozensAPI.getCategories();

// Report a joke
await dozensAPI.reportJoke({
    insult_id: 'GIGGLE_123',
    review_type: 'inappropriate',
    rationale_for_review: 'Contains offensive content'
});
```

### Available API Methods

- `getRandomInsult(filters)` - Get random joke with optional filters
- `getCategories()` - Get all joke categories
- `getInsultsByCategory(category, filters)` - Get jokes by category
- `getAllInsults(filters)` - Get paginated list of all jokes
- `getInsult(referenceId)` - Get specific joke by ID
- `reportJoke(data)` - Report inappropriate content
- `createInsult(data, token)` - Create new joke (auth required)
- `updateInsult(id, data, token)` - Update joke (auth required)
- `deleteInsult(id, token)` - Delete joke (auth required)
- `login(username, password)` - Authenticate user
- `logout(token)` - End user session

## 🎨 Customization

### Styling

Modify `css/styles.css` to customize the appearance. The project uses CSS custom properties:

```css
:root {
    --color-primary: #770071;
    --color-secondary: #bd00b4;
    --color-accent: #beda00;
    --color-white: #ffffff;
}
```

### Components

Add new HTML components in the `includes/` directory and load them using:

```javascript
ComponentLoader.loadComponent('./includes/new-component.html', 'target-id');
```

### JavaScript

Extend functionality by modifying `js/scripts.js` or adding new JavaScript files:

```javascript
// Add new functionality
class NewFeature {
    constructor() {
        this.init();
    }

    init() {
        // Feature initialization
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    new NewFeature();
});
```

## 🚀 Deployment

### Static Hosting (Recommended)

Deploy to any static hosting service:

1. **Netlify:**
   ```bash
   # Build and deploy
   npm run build
   # Drag/drop dist folder to Netlify
   ```

2. **Vercel:**
   ```bash
   npx vercel --prod
   ```

3. **GitHub Pages:**
   ```bash
   # Commit and push to gh-pages branch
   git checkout -b gh-pages
   git push origin gh-pages
   ```

4. **AWS S3 + CloudFront:**
   ```bash
   aws s3 sync . s3://your-bucket-name --delete
   ```

### CDN Configuration

For production, consider:

1. **Hosting assets on CDN** for better performance
2. **Enabling gzip compression** on your web server
3. **Setting appropriate cache headers** for static assets
4. **Using HTTP/2** for improved loading speeds

## 🔒 CORS Configuration

Ensure your Django API includes the frontend domain in CORS settings:

```python
# In Django settings.py
CORS_ALLOWED_ORIGINS = [
    "https://your-frontend-domain.com",
    "http://localhost:3000",  # Development
]
```

## 🛠️ Troubleshooting

### Common Issues

1. **API calls failing:**
   - Check if Django API is running
   - Verify CORS configuration
   - Check browser network tab for errors

2. **Components not loading:**
   - Ensure files exist in `includes/` directory
   - Check browser console for 404 errors
   - Verify component-loader.js is included

3. **Styles not applying:**
   - Check CSS file paths
   - Verify Bootstrap CSS is loading
   - Check for CSS syntax errors

### Debug Mode

Enable debug logging in the browser console:

```javascript
// In browser console
dozensAPI.debug = true;
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m "Add new feature"`
6. Push: `git push origin feature/new-feature`
7. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Support

- **Documentation:** [API Documentation](http://localhost:8000/api/schema/redoc/)
- **Issues:** [GitHub Issues](https://github.com/your-username/the-dozens-frontend/issues)
- **Email:** terry@brooksjr.com

## 🔄 Migration from Django Templates

This frontend was extracted from Django templates. Key changes:

- ✅ Removed Django template tags (`{% %}`, `{{ }}`)
- ✅ Converted static file URLs to relative paths
- ✅ Replaced Django forms with JavaScript API calls
- ✅ Added API client for backend communication
- ✅ Implemented component loading system
- ✅ Updated Bootstrap modal syntax to v5
- ✅ Added build system for optimization

The API backend continues to run independently on Django.