# SyncStr - Nostr Profile Sync Tool

A modern web application for synchronizing your Nostr profile data between different relays. Keep your Nostr identity consistent across the decentralized network.

[![Built with MKStack](https://img.shields.io/badge/Built%20with-MKStack-purple)](https://soapbox.pub/mkstack)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![Nostr](https://img.shields.io/badge/Protocol-Nostr-orange)](https://nostr.com)

## 🎯 What is SyncStr?

SyncStr solves a key problem in the Nostr ecosystem: **profile data fragmentation**. When you publish your profile to one relay, it doesn't automatically appear on others. SyncStr lets you easily copy your complete Nostr identity between relays with just a few clicks.

### Why Use SyncStr?

- **🔄 Complete Profile Sync** - Transfer all 11 types of profile data between relays
- **🛡️ Secure & Private** - Your keys never leave your browser
- **⚡ Real-time Testing** - Verify relay connections before syncing
- **🎯 Selective Sync** - Choose exactly what data to transfer
- **📱 Mobile Friendly** - Works perfectly on all devices

## 🚀 Live Demo

Try SyncStr now: **[syncstr.com](https://syncstr.com)** *(replace with actual URL)*

## ✨ Supported Profile Data

SyncStr synchronizes all major Nostr profile event types:

| **Event Type** | **Kind** | **Description** | **Icon** |
|----------------|----------|-----------------|----------|
| **Profile Metadata** | 0 | Name, bio, avatar, banner, website | 👤 |
| **Contact Lists** | 3 | Following/followers, social graph | 👥 |
| **Mute Lists** | 10000 | Blocked users, hashtags, content | 🔇 |
| **Pinned Notes** | 10001 | Featured posts on your profile | 📌 |
| **Relay Lists** | 10002 | Your preferred read/write relays | 📡 |
| **Bookmarks** | 10003 | Saved notes, articles, links | 🔖 |
| **Communities** | 10004 | Group memberships and participation | 👥 |
| **Search Relays** | 10007 | Preferred relays for search queries | 🔍 |
| **Interests** | 10015 | Topics and hashtags you follow | #️⃣ |
| **Emoji Lists** | 10030 | Custom emoji preferences | 😀 |
| **DM Relays** | 10050 | Relays for private messaging | 💬 |

## 🎬 How It Works

### 1. **Connect Your Nostr Account**
- Login with browser extension (Alby, nos2x, etc.)
- Or securely enter your private key (nsec)
- Your npub will be displayed for verification

### 2. **Choose Source Relay**
- Enter the relay where your profile currently exists
- SyncStr automatically discovers and displays your data
- Review all available profile information

### 3. **Select Data to Sync**
- Choose individual event types or select all
- See detailed counts (e.g., "150 contacts", "25 bookmarks")
- Preview exactly what will be transferred

### 4. **Test Target Relay**
- Enter destination relay URL
- SyncStr tests the connection in real-time
- Get immediate feedback on relay availability

### 5. **Sync Your Profile**
- Start the transfer with one click
- Monitor progress in real-time
- Get detailed results for each event type

## 🛠️ Technology Stack

**Built with [MKStack](https://soapbox.pub/mkstack) - The AI-powered Nostr development framework**

- **Frontend**: React 18, TypeScript, Vite
- **Nostr**: Nostrify library (@nostrify/nostrify, @nostrify/react)
- **UI**: Custom components with Tailwind CSS + shadcn/ui
- **State**: TanStack Query for server state management
- **Icons**: Lucide React icon library
- **Testing**: Vitest + React Testing Library

## 📖 Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Nostr account (npub/nsec keypair)
- Access to Nostr relays

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/syncstr.git
   cd syncstr
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:5173
   ```

### Development Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run test         # Run test suite
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript checking
```

## 🔧 Configuration

### Popular Relays

SyncStr works with any Nostr relay. Here are some popular options:

```
wss://relay.damus.io          # Damus relay (iOS app)
wss://nos.lol                 # Nostros relay  
wss://relay.nostr.band        # Aggregator relay
wss://relay.primal.net        # Primal relay
wss://relay.snort.social      # Snort relay
wss://nostr.wine              # Wine relay
```

### Environment Variables

Create a `.env.local` file for local development:

```bash
# Optional: Custom relay defaults
VITE_DEFAULT_SOURCE_RELAY=wss://relay.damus.io
VITE_DEFAULT_TARGET_RELAY=wss://nos.lol

# Optional: Analytics/monitoring
VITE_ANALYTICS_ID=your-analytics-id
```

## 🧪 Testing

Run the comprehensive test suite:

```bash
npm run test
```

### Test Coverage

- ✅ Profile data fetching and parsing
- ✅ Relay connection testing  
- ✅ Sync functionality and error handling
- ✅ UI component interactions
- ✅ Authentication flows

## 🚀 Deployment

### Deploy to NostrDeploy.com

Built-in MKStack deployment:

```bash
npm run deploy
```

### Deploy to Vercel/Netlify

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Deploy the `dist` folder** to your preferred hosting platform

3. **Configure routing** for Single Page Application (SPA)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md).

### Development Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes with tests
4. Ensure all tests pass (`npm test`)
5. Commit with descriptive messages
6. Push and create a Pull Request

### Code Standards

- TypeScript for type safety
- React functional components with hooks
- Tailwind CSS for styling
- Comprehensive error handling
- Mobile-first responsive design

## 🐛 Troubleshooting

### Common Issues

**"No profile data found"**
- Verify your npub exists on the source relay
- Try a different relay where you've posted before
- Check that the relay URL is correct and accessible

**"Connection failed"** 
- Ensure relay URLs start with `wss://` or `ws://`
- Test your internet connection
- Some relays may be temporarily unavailable

**"Sync partially failed"**
- Some relays reject certain event types
- Rate limiting may cause temporary failures
- Check browser console for detailed error messages

**Authentication issues**
- Ensure browser extension is unlocked
- Verify nsec format if entering manually
- Try refreshing and reconnecting

### Getting Help

1. Check the [Issues page](https://github.com/yourusername/syncstr/issues)
2. Search existing discussions
3. Create a new issue with details:
   - Browser and version
   - Relay URLs being used
   - Error messages from console
   - Steps to reproduce

## 🔒 Privacy & Security

- **🛡️ Keys never leave your browser** - All signing happens locally
- **🔐 No data collection** - SyncStr doesn't track or store your information
- **🌐 Direct relay communication** - No intermediary servers
- **📱 Client-side only** - Fully decentralized architecture

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Nostr Protocol](https://nostr.com)** - The open protocol for decentralized social media
- **[MKStack](https://soapbox.pub/mkstack)** - AI-powered Nostr development framework  
- **[Nostrify](https://github.com/soapbox-pub/nostrify)** - Excellent TypeScript library for Nostr
- **[nostr-tools](https://github.com/nbd-wtf/nostr-tools)** - Essential Nostr utilities
- **The Nostr Community** - Building the decentralized future of social media

## 🔗 Links

- **Protocol**: [nostr.com](https://nostr.com)
- **MKStack Framework**: [soapbox.pub/mkstack](https://soapbox.pub/mkstack)  
- **Nostr Apps Directory**: [nostrhub.io](https://nostrhub.io)
- **Report Issues**: [GitHub Issues](https://github.com/yourusername/syncstr/issues)

---

**Built with ❤️ for the Nostr community**

*Keep your Nostr identity consistent across the decentralized network.*