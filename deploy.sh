#!/bin/bash

# FloorPlanner Standalone Deployment Script

set -e

echo "🚀 Starting FloorPlanner deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the frontend directory."
    exit 1
fi

# Parse command line arguments
ENVIRONMENT=${1:-production}
BUILD_MODE=${2:-standalone}

echo "📦 Environment: $ENVIRONMENT"
echo "🔧 Build Mode: $BUILD_MODE"

# Install dependencies
echo "📥 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Running linting..."
npm run lint

# Run type checking
echo "🔍 Running type checking..."
npm run type-check

# Run tests
echo "🧪 Running tests..."
npm run test

# Clean previous builds
echo "🧹 Cleaning previous builds..."
npm run clean

# Build the application
echo "🏗️ Building application..."
if [ "$BUILD_MODE" = "django" ]; then
    npm run build:django
else
    npm run build:standalone
fi

echo "✅ Build completed successfully!"

# Optional: Deploy to specific platforms
case $ENVIRONMENT in
    "vercel")
        echo "🚀 Deploying to Vercel..."
        npx vercel --prod
        ;;
    "netlify")
        echo "🚀 Deploying to Netlify..."
        npx netlify deploy --prod --dir=dist
        ;;
    "s3")
        echo "🚀 Deploying to AWS S3..."
        if [ -z "$AWS_S3_BUCKET" ]; then
            echo "❌ Error: AWS_S3_BUCKET environment variable not set"
            exit 1
        fi
        aws s3 sync dist/ s3://$AWS_S3_BUCKET --delete
        ;;
    "production")
        echo "✅ Production build ready in dist/ directory"
        echo "📁 Deploy the contents of the dist/ directory to your web server"
        ;;
    *)
        echo "✅ Build completed for environment: $ENVIRONMENT"
        ;;
esac

echo "🎉 Deployment completed successfully!"
echo ""
echo "📋 Next steps:"
echo "   • Test the application thoroughly"
echo "   • Monitor performance and errors"
echo "   • Update documentation if needed"