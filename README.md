# IELTS Speaking Results App

A React-based web application that displays IELTS speaking test results with comprehensive analysis, scores, and feedback.

## Features

- ✅ **Modern React Architecture** - Built with React 18, hooks, and functional components
- ✅ **Comprehensive Logging** - Detailed logging system for debugging and monitoring
- ✅ **API Integration** - Fetches data from IELTS API with retry logic and caching
- ✅ **Responsive Design** - Mobile-first responsive design with CSS Grid/Flexbox
- ✅ **Error Handling** - Robust error boundaries and user-friendly error messages
- ✅ **Performance** - Request caching, lazy loading, and optimized rendering
- ✅ **Accessibility** - ARIA labels, keyboard navigation, and screen reader support

## File Structure

```
src/
├── components/          # React components
│   ├── LoadingSpinner.jsx
│   ├── ErrorMessage.jsx
│   ├── SessionInfo.jsx
│   ├── ScoresGrid.jsx
│   └── ConversationCard.jsx
├── services/           # API and logging services
│   ├── logger.js
│   └── apiService.js
├── utils/             # Utility functions
│   └── helpers.js
├── styles/            # CSS styles
│   └── index.css
├── App.js             # Main app component
└── index.js           # React entry point
```

## Getting Started

### Prerequisites

- Node.js 16+ and npm
- Modern web browser

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the development server**:
   ```bash
   npm start
   ```

3. **Open in browser**:
   Navigate to `http://localhost:3000/s23Tq9` (replace `23Tq9` with actual session code)

### Building for Production

```bash
npm run build
```

This creates an optimized production build in the `build/` folder.

## URL Formats Supported

The app automatically extracts session codes from these URL formats:

- **Path-based**: `/s23Tq9`
- **Hash-based**: `#s23Tq9` 
- **Query parameter**: `?session=23Tq9`

## API Integration

The app connects to: `https://ieltsspeakingbot-production.up.railway.app/session/{sessionCode}`

### API Features:
- Automatic retry with exponential backoff
- Request/response caching (5-minute cache)
- Comprehensive error handling
- Request timeout protection (15 seconds)
- Network connectivity detection

## Logging System

Comprehensive logging captures:

- **User Actions**: Clicks, navigation, interactions
- **API Calls**: Request/response timing, errors, caching
- **Component Lifecycle**: Mount/unmount events
- **Performance**: Timer measurements, render times
- **Errors**: Global error handling, component errors

### Log Export

In development mode, use the debug panel to export logs as JSON for analysis.

## Components Overview

### LoadingSpinner
- Displays animated loading state
- Customizable message
- Accessibility support

### ErrorMessage  
- Smart error display based on error type
- Retry functionality for recoverable errors
- Session code display for debugging

### SessionInfo
- Session metadata display
- Student information
- Topic and timing details
- Status indicators

### ScoresGrid
- IELTS score visualization
- Color-coded score ranges
- Score descriptions
- Responsive grid layout

### ConversationCard
- Individual conversation analysis
- Question and transcript display
- Detailed scores breakdown
- AI feedback and suggestions
- Additional metrics (CEFR levels, fluency metrics)

## Development Features

### Debug Panel (Development Only)
- Real-time app state monitoring
- Log export functionality
- Cache management
- URL and session code debugging

### Error Boundary
- Catches React rendering errors
- Displays user-friendly error messages
- Technical error details for debugging
- Page refresh option

## Styling

- **CSS-in-JS**: Minimal inline styles for dynamic values
- **CSS Classes**: Main styling via CSS classes
- **Responsive Design**: Mobile-first approach with breakpoints
- **Color System**: Consistent color palette for scores and states
- **Animations**: Smooth transitions and loading animations

## Performance Optimizations

- **API Caching**: 5-minute session storage cache
- **Request Deduplication**: Prevents duplicate API calls
- **Component Optimization**: useCallback and useEffect optimization
- **Bundle Size**: Tree-shaking and code splitting ready

## Browser Support

- Chrome 88+
- Firefox 85+  
- Safari 14+
- Edge 88+

## Environment Variables

Create `.env` file for customization:

```env
REACT_APP_API_BASE_URL=https://ieltsspeakingbot-production.up.railway.app
REACT_APP_LOG_LEVEL=INFO
```

## Troubleshooting

### Common Issues

1. **"Results Not Found"**: Check session code format and spelling
2. **Network Errors**: Check internet connection and API availability
3. **Slow Loading**: Clear cache or check network speed

### Debug Information

Enable debug panel in development mode for:
- Session code extraction
- API request/response details  
- Component render states
- Error stack traces

## Contributing

1. Follow React best practices
2. Add comprehensive logging for new features
3. Test responsive design across devices
4. Update documentation for new components

## License

This project is for educational and demonstration purposes.