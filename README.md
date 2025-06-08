# Kavach Privacy Guardian - Chrome Extension

An advanced privacy protection Chrome extension built with React and TypeScript that provides real-time tracker blocking, AI-powered privacy policy analysis, and data flow visualization.

## Features

- 🛡️ **Real-time Tracker Blocking**: Detects and blocks third-party trackers as you browse
- 🧠 **AI Privacy Policy Analysis**: Automatically analyzes and summarizes privacy policies, flagging risky clauses
- 📊 **Data Trust Score**: Shows a live trust score (0-100) for each website based on privacy practices
- 🌊 **Data Flow Visualization**: Interactive visualization showing how your data flows between domains
- ⚡ **One-Click Opt-out**: GDPR/CCPA compliant opt-out tools for quick privacy protection
- 🔍 **Client-side Tracking Detection**: Monitors canvas fingerprinting and other tracking attempts

## Architecture

### Core Components

- **Background Script** (`src/background/index.ts`): Handles web request monitoring, tracker detection, and data storage
- **Content Script** (`src/content/index.ts`): Detects privacy policies and provides opt-out UI
- **Injected Script** (`src/injected/index.ts`): Runs in page context to detect client-side tracking
- **Popup UI** (`src/popup/`): React-based interface showing privacy metrics and controls

### React Components

- `TrustScore`: Displays website trust rating with visual indicators
- `TrackerList`: Shows detected trackers with blocking status
- `PrivacyAnalysis`: AI-powered privacy policy analysis results
- `DataFlowVisualization`: Interactive graph of data flows between domains
- `ActionButtons`: Quick controls for blocking and opt-out actions

## Development

### Prerequisites

- Node.js 16+ 
- npm or yarn

### Installation

```bash
npm install
```

### Building

```bash
# Development build with watch mode
npm run dev

# Production build
npm run build
```

### Loading the Extension

1. Build the extension using `npm run build`
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the `dist` folder
5. The extension should now appear in your browser toolbar

## Chrome Extension APIs Used

- `webRequest`: Monitor and analyze network requests
- `declarativeNetRequest`: Block tracking requests
- `storage`: Persist user preferences and site data
- `tabs`: Track active tabs and website changes
- `scripting`: Inject content scripts

## Privacy Focus

This extension prioritizes user privacy and data protection by:

- Implementing transparent data collection practices
- Providing clear user controls and opt-out mechanisms
- Following GDPR/CCPA compliance guidelines
- Operating with minimal data collection

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and ensure builds pass
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Roadmap

- [ ] Enhanced AI privacy policy analysis
- [ ] More comprehensive tracker database
- [ ] Custom blocking rules
- [ ] Export privacy reports
- [ ] Integration with popular privacy services
