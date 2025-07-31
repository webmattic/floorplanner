#!/bin/bash
cd /Users/shzz/docs-local/hd-django/hd/floorplanner/frontend

echo "Removing all empty .jsx files in ui components..."

# Remove all the empty .jsx files
rm -f src/components/ui/checkbox.jsx
rm -f src/components/ui/badge.jsx
rm -f src/components/ui/separator.jsx
rm -f src/components/ui/scroll-area.jsx
rm -f src/components/ui/label.jsx
rm -f src/components/ui/floating-panel.jsx
rm -f src/components/ui/tabs.jsx
rm -f src/components/ui/slider.jsx
rm -f src/components/ui/progress.jsx

# Clean build cache again
rm -rf dist/
rm -rf node_modules/.vite/
rm -rf .vite/

echo "All empty .jsx files removed and build cache cleaned"
