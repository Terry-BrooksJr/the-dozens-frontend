# =============================================================================
# Stage 1: Build - Minify JS and CSS using Node.js
# =============================================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package manifest first to leverage layer caching.
# If package.json doesn't change, npm install is skipped on rebuild.
COPY package.json ./

# Install dev dependencies (terser, clean-css-cli).
# --ignore-scripts prevents any postinstall hooks from running.
RUN npm install --ignore-scripts

# Copy all source files into the build context.
# .dockerignore excludes node_modules, .git, *.bak, pre-built assets, etc.
COPY . .

# Run the build: minify-js then minify-css.
# Produces js/scripts.min.js and css/styles.min.css.
RUN npm run build

# =============================================================================
# Stage 2: Serve - Apache httpd on Alpine
# =============================================================================
FROM httpd:alpine

# Create a dedicated non-root user for Apache worker processes.
# The master httpd process still starts as root to bind port 80, then
# drops privileges to www-app for all request-handling workers.
RUN addgroup -S www-app && adduser -S www-app -G www-app

# Copy custom Apache configuration over the default httpd.conf.
COPY httpd.conf /usr/local/apache2/conf/httpd.conf

# Copy the entrypoint script and make it executable.
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

# Copy built static files from the builder stage into the Apache document root.
# Granular per-directory copies avoid accidentally pulling in node_modules
# or other builder-stage artifacts.
COPY --from=builder /app/index.html  /usr/local/apache2/htdocs/index.html
COPY --from=builder /app/403.html    /usr/local/apache2/htdocs/403.html
COPY --from=builder /app/404.html    /usr/local/apache2/htdocs/404.html
COPY --from=builder /app/500.html    /usr/local/apache2/htdocs/500.html
COPY --from=builder /app/css/        /usr/local/apache2/htdocs/css/
COPY --from=builder /app/js/         /usr/local/apache2/htdocs/js/
COPY --from=builder /app/fonts/      /usr/local/apache2/htdocs/fonts/
COPY --from=builder /app/assets/     /usr/local/apache2/htdocs/assets/
COPY --from=builder /app/includes/   /usr/local/apache2/htdocs/includes/

# Transfer ownership of the document root to www-app so that Apache
# worker processes (running as www-app) can read all static assets.
# The entrypoint still runs as root and can write to www-app-owned files.
RUN chown -R www-app:www-app /usr/local/apache2/htdocs

# Default runtime API base URL. Override via -e API_BASE_URL=... at container run.
ENV API_BASE_URL=http://localhost:8000

EXPOSE 80

# Verify Apache is healthy by fetching the index page every 30 s.
# Allow 15 s for initial startup; retry up to 3 times before marking unhealthy.
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD wget -q --spider http://localhost/ || exit 1

# The entrypoint injects API_BASE_URL via sed into static files, then starts Apache.
ENTRYPOINT ["/docker-entrypoint.sh"]
