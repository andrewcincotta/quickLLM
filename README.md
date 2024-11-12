# QuickLLM

A desktop application for instant access to various LLM chats, including ChatGPT and custom chat URLs.

## ✨ Key Features

* **Instant Toggle**: Quickly show/hide chats with keyboard shortcuts
* **Smart Positioning**: Window appears where you need it (mouse position, display center, or last position)
* **Quick Input**: Input field automatically activates when switching views
* **Multiple Chats**: Support for multiple chat interfaces and custom URLs

## 🚀 Getting Started

### Installation

Download the latest version for your platform from our [releases page](https://github.com/andrewcincotta/quickLLM/releases).

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+Space` | Show/Hide chat window |
| `Ctrl+Shift+1,2,3,4` | Switch between chat windows |
| `Ctrl+Shift+Q` | Toggle window display |

### Configuration
1. Launch the application
2. Open settings to customize:
   - Chat URLs
   - Window position preferences
   - Other display options


## 🗺️ Roadmap

- [ ] Option to toggle always on top
- [ ] Option to toggle launch on startup
- [ ] Ollama support (native or through OpenWebUI)
- [ ] Improved Linux and Windows support

## 💻 Development

### Initial Setup
```bash
# Clone the repository
git clone https://github.com/andrewcincotta/quickLLM.git
cd quickLLM

# Install dependencies
npm install
```

### Development Mode

For macOS:
```bash
npm run dev
```

For Windows:
```bash
npm run dev:win
```

### Building Applications

#### Build for macOS
```bash
npm run build:mac

# Output locations:
# - DMG installer: ./out/make/dmg/darwin
# - ZIP archive: ./out/make/zip/darwin
# - Unpackaged app: ./out/Quick-GPT-darwin-[arch]/Quick-GPT.app
```

#### Build for Windows
```bash
npm run build:win

# Output locations:
# - Installer: ./out/make/squirrel.windows/x64
# - Unpackaged app: ./out/Quick-GPT-win32-x64
```

#### Build for Linux
```bash
npm run build:linux

# Output locations:
# - DEB package: ./out/make/deb/x64
# - RPM package: ./out/make/rpm/x64
# - ZIP archive: ./out/make/zip/linux
```

#### Build for All Platforms
```bash
npm run build:all
```