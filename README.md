# FloorPlanner - Standalone React Application

A professional floor planning application with floating panels, 3D visualization, and collaboration features.

## Features

- 🏗️ **Intuitive Drag & Drop Interface** - One-click wall placement with automatic alignment
- 🎨 **Real-time 3D Visualization** - Instant 2D-to-3D sync without rendering delays
- 🎯 **Floating Panel System** - Repositionable, resizable panels with shadcn UI
- 🤝 **Real-time Collaboration** - Multi-user editing with shared cursors
- 📐 **Automated Measurements** - Auto-calculated dimensions and clearance validation
- 📤 **Advanced Export** - 8K renders, PDFs, and virtual walkthroughs
- 📱 **Mobile Optimized** - Touch controls and responsive design
- 🔧 **CAD Import** - Support for DXF, DWG, IFC, and Revit formats

## Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd floorplanner/frontend

# Install dependencies
npm install

# Copy environment configuration
cp .env.example .env

# Start development server
npm run dev:standalone
```

The application will be available at `http://localhost:5173`

## Development Scripts

```bash
# Development
npm run dev:standalone          # Start standalone development server
npm run dev                     # Start with Django integration

# Building
npm run build:standalone        # Build for standalone deployment
npm run build:django           # Build for Django integration
npm run build                  # Default build

# Testing & Quality
npm run test                   # Run tests
npm run test:watch            # Run tests in watch mode
npm run lint                  # Check code quality
npm run lint:fix             # Fix linting issues
npm run type-check           # TypeScript type checking

# Utilities
npm run preview:standalone    # Preview standalone build
npm run clean                # Clean build directories
```

## Configuration

The application uses environment variables for configuration. Copy `.env.example` to `.env` and customize:

```env
# Application
VITE_APP_TITLE=FloorPlanner
VITE_APP_VERSION=1.0.0

# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WS_URL=ws://localhost:3001/ws

# Authentication
VITE_ENABLE_AUTH=false
VITE_AUTH_PROVIDER=local

# Features
VITE_ENABLE_COLLABORATION=true
VITE_ENABLE_3D_VIEW=true
VITE_ENABLE_EXPORT=true
VITE_ENABLE_CAD_IMPORT=true

# Storage
VITE_STORAGE_TYPE=localStorage
VITE_AUTO_SAVE_INTERVAL=30000

# Development
VITE_DEBUG_MODE=true
VITE_MOCK_API=true
```

## Architecture

### Core Technologies

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components
- **Zustand** - State management
- **Konva.js** - 2D canvas rendering
- **Three.js** - 3D visualization
- **React Three Fiber** - React Three.js integration

### Project Structure

```
src/
├── components/           # React components
│   ├── panels/          # Floating panel components
│   ├── ui/              # shadcn UI components
│   └── ...
├── config/              # Configuration management
├── hooks/               # Custom React hooks
├── services/            # API and external services
├── stores/              # Zustand state stores
├── types/               # TypeScript type definitions
└── utils/               # Utility functions
```

### Floating Panel System

The application features a sophisticated floating panel system with:

- **Draggable & Resizable Panels** - Move and resize panels anywhere on screen
- **State Persistence** - Panel positions saved between sessions
- **Keyboard Shortcuts** - Quick panel operations
- **Mobile Responsive** - Adaptive layouts for different screen sizes
- **Accessibility** - Full keyboard navigation and screen reader support

## Deployment

### Standalone Deployment

1. Build the application:

```bash
npm run build:standalone
```

2. Deploy the `dist` folder to your web server or CDN

3. Configure your web server to serve `index.html` for all routes (SPA routing)

### Docker Deployment

```dockerfile
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:standalone

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Vercel/Netlify Deployment

The application is ready for deployment on modern hosting platforms:

- **Vercel**: Connect your repository and deploy automatically
- **Netlify**: Drag and drop the `dist` folder or connect via Git

## API Integration

### Mock API (Default)

The application includes a mock API service for standalone operation:

- **Local Storage** - Data persisted in browser
- **Simulated Network Delays** - Realistic API behavior
- **Sample Data** - Pre-loaded floor plans and projects

### Custom Backend Integration

To integrate with your own backend:

1. Set `VITE_MOCK_API=false` in `.env`
2. Update API endpoints in `src/config/app.config.ts`
3. Implement authentication if needed
4. Update WebSocket configuration for real-time features

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance

- **Code Splitting** - Automatic chunk splitting for optimal loading
- **Tree Shaking** - Unused code elimination
- **Asset Optimization** - Compressed images and fonts
- **Service Worker** - Offline support and caching

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Support

For support and questions:

- 📧 Email: support@floorplanner.com
- 📖 Documentation: [docs.floorplanner.com](https://docs.floorplanner.com)
- 🐛 Issues: [GitHub Issues](https://github.com/your-repo/issues)
