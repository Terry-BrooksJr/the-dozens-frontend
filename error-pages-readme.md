# Error Pages Documentation

This directory contains custom-styled error pages that match The Dozens frontend branding and user experience.

## Available Error Pages

### 404.html - Page Not Found
- **When it's used**: When a requested page or resource doesn't exist
- **Features**:
  - Random joke functionality via API
  - Helpful navigation links
  - Responsive design matching main site
  - Yo mama joke theming

### 500.html - Internal Server Error
- **When it's used**: When the server encounters an internal error
- **Features**:
  - Emergency offline joke collection
  - Troubleshooting tips for users
  - Retry functionality
  - Contact information for persistent issues

### 403.html - Access Forbidden
- **When it's used**: When access to a resource is denied due to permissions
- **Features**:
  - Access-themed yo mama jokes
  - Explanation of common reasons for 403 errors
  - Login/authentication suggestions
  - Administrative contact information

## Implementation

### Apache (.htaccess)
The `.htaccess` file is included with proper ErrorDocument directives:
```apache
ErrorDocument 403 /403.html
ErrorDocument 404 /404.html
ErrorDocument 500 /500.html
```

### Nginx
Use the `nginx-error-config.conf` file as a reference for your nginx configuration:
```nginx
error_page 403 /403.html;
error_page 404 /404.html;
error_page 500 502 503 504 /500.html;
```

## Design Features

### Consistent Branding
- Uses the same fonts (YoMamaHeader, YoMamaBody)
- Matches color scheme (primary: #770071, secondary: #bd00b4, accent: #beda00)
- Includes the same navigation structure
- Responsive design following the main site patterns

### User Experience
- Mobile-first responsive design
- Touch-friendly interactions
- Accessibility considerations (focus states, ARIA labels)
- Progressive enhancement (works without JavaScript)

### Interactive Features
- **404 Page**: Fetches random jokes from the API with fallback content
- **500 Page**: Provides emergency joke collection when API is unavailable
- **403 Page**: Offers access-themed jokes and helpful guidance
- All pages include hover effects and animations on supported devices

## Customization

### API Configuration
The API base URL can be configured via the meta tag:
```html
<meta name="api-base-url" content="http://localhost:8000">
```

### Joke Collections
Each error page has its own themed joke collection:
- 404: General yo mama jokes
- 500: Emergency backup jokes
- 403: Access/permission-themed jokes

### Styling
Error pages inherit from the main `styles.css` file and include additional custom styles for error-specific elements.

## Testing

To test the error pages:

1. **404 Page**: Navigate to any non-existent URL
2. **500 Page**: Simulate server errors (requires server configuration)
3. **403 Page**: Access restricted content (requires server configuration)

For local testing, you can access the pages directly:
- `http://localhost:3000/404.html`
- `http://localhost:3000/500.html`
- `http://localhost:3000/403.html`

## Browser Support

The error pages support the same browsers as the main site:
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers
- Fallback fonts and basic functionality without external dependencies