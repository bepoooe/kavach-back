<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Kavach Privacy Guardian - Chrome Extension

## Project Overview
This is a Chrome extension built with React and TypeScript that provides advanced privacy protection features:

- Real-time third-party tracker detection and blocking
- AI-powered privacy policy analysis and summarization
- Data Trust Score calculation (0-100) for websites
- Visual data flow mapping between domains
- One-click GDPR/CCPA opt-out functionality

## Development Guidelines

### Architecture
- **Background Script**: Handles web request monitoring, tracker detection, and data storage
- **Content Script**: Detects privacy policies, injects tracking detection, and provides opt-out UI
- **Injected Script**: Runs in page context to detect client-side tracking attempts
- **Popup UI**: React-based interface showing privacy metrics and controls

### Key Components
- `TrustScore`: Displays website trust rating with visual indicators
- `TrackerList`: Shows detected trackers with blocking status
- `PrivacyAnalysis`: AI-powered privacy policy analysis results
- `DataFlowVisualization`: Interactive graph of data flows between domains
- `ActionButtons`: Quick controls for blocking and opt-out actions

### Chrome Extension APIs Used
- `webRequest`: Monitor and analyze network requests
- `declarativeNetRequest`: Block tracking requests
- `storage`: Persist user preferences and site data
- `tabs`: Track active tabs and website changes
- `scripting`: Inject content scripts

### Coding Standards
- Use TypeScript for all source files
- Follow React best practices and hooks patterns
- Implement proper error handling for Chrome API calls
- Use semantic CSS class names
- Add comprehensive comments for complex privacy logic

### Privacy Focus
- Prioritize user privacy and data protection
- Implement transparent data collection practices
- Provide clear user controls and opt-out mechanisms
- Follow GDPR/CCPA compliance guidelines
