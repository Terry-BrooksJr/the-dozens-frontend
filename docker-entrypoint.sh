#!/bin/sh
# =============================================================================
# docker-entrypoint.sh
# Injects the runtime API_BASE_URL into static files via sed,
# then starts Apache httpd in the foreground.
#
# Environment variables:
#   API_BASE_URL  - The API base URL (default: http://api.yo-momma.io)
# =============================================================================

set -e

HTDOCS="/usr/local/apache2/htdocs"
DEFAULT_URL="http://api.yo-momma.io"

# ---------------------------------------------------------------------------
# Fail fast if API_BASE_URL is unset or empty.
# The Dockerfile sets a default, but an explicit -e API_BASE_URL= at
# container run-time would override it with an empty string.
# ---------------------------------------------------------------------------
: "${API_BASE_URL:?Error: API_BASE_URL is not set or empty}"

# ---------------------------------------------------------------------------
# Escape the API_BASE_URL for safe use in a sed replacement string.
# We use '@' as the sed delimiter to avoid escaping '/' in URLs, so we
# must also escape '@' in the value in addition to '&' and '\'.
# ---------------------------------------------------------------------------
ESCAPED_URL=$(printf '%s\n' "${API_BASE_URL}" | sed 's/[&\@]/\\&/g')

echo "==> Injecting API_BASE_URL: ${API_BASE_URL}"

# ---------------------------------------------------------------------------
# index.html: 5 occurrences
#   - meta tag:  <meta name="api-base-url" content="http://api.yo-momma.io">
#   - 4 nav links: href="http://api.yo-momma.io/..."
# ---------------------------------------------------------------------------
sed -i "s@${DEFAULT_URL}@${ESCAPED_URL}@g" "${HTDOCS}/index.html"
echo "    [OK] index.html"

# ---------------------------------------------------------------------------
# 403.html: meta tag on line 10
# ---------------------------------------------------------------------------
sed -i "s@${DEFAULT_URL}@${ESCAPED_URL}@g" "${HTDOCS}/403.html"
echo "    [OK] 403.html"

# ---------------------------------------------------------------------------
# 500.html: meta tag on line 10
# ---------------------------------------------------------------------------
sed -i "s@${DEFAULT_URL}@${ESCAPED_URL}@g" "${HTDOCS}/500.html"
echo "    [OK] 500.html"

# ---------------------------------------------------------------------------
# js/api-client.js: constructor default on line 7
#   constructor(baseURL = 'http://api.yo-momma.io')
# This is the primary runtime API URL for all fetch() calls in the app.
# ---------------------------------------------------------------------------
sed -i "s@${DEFAULT_URL}@${ESCAPED_URL}@g" "${HTDOCS}/js/api-client.js"
echo "    [OK] js/api-client.js"

# ---------------------------------------------------------------------------
# includes/getting-started.html: modal footer href
# This file is fetched at runtime via fetch() in component-loader.js.
# ---------------------------------------------------------------------------
sed -i "s@${DEFAULT_URL}@${ESCAPED_URL}@g" "${HTDOCS}/includes/getting-started.html"
echo "    [OK] includes/getting-started.html"

echo "==> API_BASE_URL injection complete."
echo "==> Starting Apache httpd..."

# ---------------------------------------------------------------------------
# exec replaces this shell with httpd, making it PID 1.
# This is required for proper signal handling (SIGTERM, SIGINT) in Docker.
# ---------------------------------------------------------------------------
exec httpd -D FOREGROUND
