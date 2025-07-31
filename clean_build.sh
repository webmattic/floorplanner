#!/bin/bash
cd /Users/shzz/docs-local/hd-django/hd/floorplanner/frontend

# Remove the empty jsx file
rm -f src/components/ui/floating-panel.jsx

# Clean build cache and node_modules to force fresh build
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf .vite/

echo "Cleaned build cache and removed floating-panel.jsx"
echo "Files removed successfully"
