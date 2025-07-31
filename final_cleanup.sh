#!/bin/bash
cd /Users/shzz/docs-local/hd-django/hd/floorplanner/frontend

echo "=== Removing ALL .jsx files from ui components ==="

# Remove all .jsx files in ui directory
find src/components/ui -name "*.jsx" -type f -delete

echo "=== Clearing build caches ==="

# Remove all build and cache directories
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf .vite/
rm -rf node_modules/.cache/

echo "=== Files and caches cleared ==="

# List remaining files to verify
echo "Remaining .jsx files (should be none):"
find src/components/ui -name "*.jsx" 2>/dev/null || echo "No .jsx files found"

echo "Available .tsx files:"
find src/components/ui -name "*.tsx" | head -10

echo "=== Ready for clean build ==="
