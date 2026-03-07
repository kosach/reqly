# Development Guide

## Prerequisites

### Required
- **Node.js** 18+ or 20+ (LTS recommended)
- **pnpm** 8.0.0 or later
- **Rust** 1.60+ (for Tauri builds)

### Installing Rust

```bash
# Linux/macOS
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Or use your package manager
# Ubuntu/Debian
sudo apt install rustc cargo

# macOS
brew install rust
```

### Installing pnpm

```bash
npm install -g pnpm@8
```

## Quick Start

```bash
# Clone repository
git clone https://github.com/kosach/reqly.git
cd reqly

# Install dependencies (all workspaces)
pnpm install

# Run in development mode
pnpm dev

# Run tests (all packages)
pnpm test

# Type checking
pnpm typecheck

# Build desktop app
pnpm build
```

## Project Structure

```
reqly/
├── apps/
│   └── desktop/           # Tauri + React desktop app
│       ├── src/           # React components and UI
│       ├── src-tauri/     # Rust backend (Tauri)
│       └── e2e/           # Playwright E2E tests
├── packages/
│   ├── database/          # SQLite database layer
│   ├── http-engine/       # HTTP client and scripting
│   ├── mcp-server/        # Model Context Protocol server
│   └── types/             # Shared TypeScript types
└── .github/
    └── workflows/         # CI/CD pipelines
```

## Development Workflow

### 1. Database Development

```bash
cd packages/database
pnpm dev           # Watch mode
pnpm test          # Run tests
pnpm test:watch    # Watch tests
```

**Location:** `packages/database/src/`

- `collections.ts` - Collection CRUD operations
- `requests.ts` - Request CRUD operations
- `environments.ts` - Environment CRUD operations
- `index.ts` - Database singleton and exports

### 2. HTTP Engine Development

```bash
cd packages/http-engine
pnpm dev           # Watch mode
pnpm test          # Run unit tests
pnpm test:e2e      # Run E2E tests (real HTTP calls)
```

**Location:** `packages/http-engine/src/`

- `client.ts` - HTTP client (axios wrapper)
- `variables.ts` - Variable interpolation
- `scripts.ts` - Pre-request and test scripts
- `index.ts` - Main exports

**E2E Tests:** Uses httpbin.org for real HTTP testing

### 3. MCP Server Development

```bash
cd packages/mcp-server
pnpm dev           # Watch mode
pnpm test          # Run tests
pnpm start         # Run MCP server
```

**Location:** `packages/mcp-server/src/`

- `index.ts` - MCP server implementation
- `tools/` - MCP tool implementations
  - `createCollection.ts`
  - `createRequest.ts`
  - `sendRequest.ts`
  - `writeTest.ts`

**Testing:**
```bash
# Manual testing with mcpx
npx @michaellatman/mcp-client-cli
```

### 4. Desktop UI Development

```bash
cd apps/desktop

# Development mode (browser only, faster)
pnpm dev

# Tauri development mode (full app)
pnpm tauri dev

# Build for production
pnpm tauri build
```

**Location:** `apps/desktop/src/`

- `components/` - React components
  - `CollectionTree.tsx` - Sidebar navigation
  - `RequestBuilder.tsx` - Request configuration
  - `ResponseViewer.tsx` - Response display
  - `EnvironmentSelector.tsx` - Environment dropdown
  - `VariableEditor.tsx` - Variable management
- `hooks/` - Custom React hooks
  - `useCollections.ts`
  - `useRequests.ts`
  - `useEnvironments.ts`
- `App.tsx` - Main application

**E2E Tests:**
```bash
# Run Playwright tests
pnpm test:e2e

# UI mode (interactive)
pnpm exec playwright test --ui

# Debug mode
pnpm exec playwright test --debug
```

## CI/CD Pipeline

### Workflows

#### 1. **CI Workflow** (`.github/workflows/ci.yml`)

Runs on: Push to main/develop, Pull requests

**Jobs:**
- **test** - Run all package tests
  - Test matrix: Node 18, 20
  - TypeScript type checking
  - Database tests
  - HTTP engine tests
  - MCP server tests
  - Desktop E2E tests with Playwright
- **lint-commits** - Check commit messages for AI mentions
- **code-quality** - Verify TypeScript strict mode, check for console.logs

**Caching:**
- pnpm dependencies
- Playwright browsers

#### 2. **Build Workflow** (`.github/workflows/build.yml`)

Runs on: Push to main, Manual dispatch

**Jobs:**
- **build-tauri** - Build Linux AppImage
  - Install Rust toolchain
  - Cache Rust dependencies
  - Install Linux dependencies (GTK, WebKit)
  - Build Tauri desktop app
  - Upload AppImage artifact (30-day retention)

**Artifacts:**
- `reqly-linux-appimage` - Linux AppImage bundle

#### 3. **Release Workflow** (`.github/workflows/release.yml`)

Runs on: Git tags matching `v*.*.*`, Manual dispatch

**Jobs:**
- **create-release** - Create GitHub release
  - Generate changelog from commits or CHANGELOG.md
  - Create release with notes
  - Mark as prerelease for alpha/beta/rc tags
- **build-and-upload** - Build and upload assets
  - Run tests before release
  - Build Tauri app (AppImage, .deb)
  - Upload artifacts to release

**Release Process:**
```bash
# 1. Update version in package.json files
# 2. Create and push tag
git tag v0.1.0
git push origin v0.1.0

# 3. GitHub Actions will automatically:
#    - Run tests
#    - Build AppImage and .deb
#    - Create GitHub release
#    - Upload artifacts
```

### Status Badges

The README includes CI/CD status badges:

```markdown
[![CI](https://github.com/kosach/reqly/actions/workflows/ci.yml/badge.svg)](https://github.com/kosach/reqly/actions/workflows/ci.yml)
[![Build](https://github.com/kosach/reqly/actions/workflows/build.yml/badge.svg)](https://github.com/kosach/reqly/actions/workflows/build.yml)
```

## Testing

### Unit Tests

Each package has its own test suite:

```bash
# All tests
pnpm test

# Specific package
pnpm --filter @reqly/database test
pnpm --filter @reqly/http-engine test
pnpm --filter @reqly/mcp-server test
```

### E2E Tests

**HTTP Engine:**
```bash
cd packages/http-engine
pnpm test:e2e
```
Uses httpbin.org for real HTTP calls.

**Desktop App:**
```bash
cd apps/desktop
pnpm test:e2e
```
Uses Playwright for browser automation.

### Test Coverage

**Current Coverage:**
- Database: ~95% (all CRUD operations)
- HTTP Engine: ~90% (all HTTP methods + scripting)
- MCP Server: 100% (all 4 tools)
- Desktop UI: ~80% (critical user flows)

## Building

### Development Build

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @reqly/desktop build
```

### Production Build (Tauri)

```bash
cd apps/desktop

# Build for current platform
pnpm tauri build

# Output locations:
# - Linux AppImage: src-tauri/target/release/bundle/appimage/
# - Debian package: src-tauri/target/release/bundle/deb/
# - Binary: src-tauri/target/release/reqly
```

**Build Artifacts:**
- **AppImage** - Portable Linux application (~50-60 MB)
- **.deb** - Debian/Ubuntu package (~40-50 MB)
- **Binary** - Standalone executable (~30 MB)

## Code Quality Standards

### TypeScript

- **Strict mode** enabled in all packages
- No `any` types (use `unknown` if needed)
- No `console.log` in production code
- Proper error handling

### Git Commits

**Format:**
```
<type>: <short description>

<longer description if needed>
```

**Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `test:` - Tests
- `refactor:` - Code refactoring
- `perf:` - Performance improvement
- `chore:` - Maintenance tasks

**❌ Never include in commits:**
- AI mentions (GPT, Claude, Gemini, LLM)
- "Automated", "bot", "agent"
- References to AI authorship

**✅ Good commits:**
```
feat: add HTTP request timeout support
fix: resolve variable interpolation edge case
test: add E2E tests for request execution
docs: update API documentation
```

## Debugging

### Database

```typescript
// Enable verbose logging
process.env.DEBUG = 'reqly:database'
```

### HTTP Engine

```bash
# Enable axios debug mode
export DEBUG=axios
```

### Tauri

```bash
# Enable Tauri dev tools
pnpm tauri dev

# Build with debug symbols
TAURI_DEBUG=1 pnpm tauri build
```

### Playwright

```bash
# Headed mode (see browser)
pnpm exec playwright test --headed

# Debug mode (step through)
pnpm exec playwright test --debug

# UI mode (interactive)
pnpm exec playwright test --ui
```

## Performance

### Build Times

- **Development build**: ~10-20 seconds
- **Production build (Tauri)**: ~2-5 minutes (first build)
- **Incremental build**: ~30-60 seconds

### CI Pipeline

- **Test job**: ~3-5 minutes
- **Build job**: ~5-8 minutes (cached)
- **Release job**: ~6-10 minutes

### Optimization Tips

1. **Use pnpm workspaces** - Shared node_modules
2. **Cache dependencies** - GitHub Actions cache
3. **Run tests in parallel** - Vitest parallel mode
4. **Incremental TypeScript builds** - `tsc --incremental`

## Troubleshooting

### "Module not found" errors

```bash
# Clean install
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Tauri build fails

```bash
# Install Linux dependencies
sudo apt-get install -y \
  libgtk-3-dev \
  libwebkit2gtk-4.0-dev \
  libappindicator3-dev \
  librsvg2-dev \
  patchelf

# Update Rust
rustup update
```

### Tests fail in CI but pass locally

- Check Node.js version (use 18 or 20)
- Verify timezone (CI uses UTC)
- Check environment variables
- Review CI logs for specific errors

## Resources

- **Tauri Docs**: https://tauri.app/
- **Vite Docs**: https://vitejs.dev/
- **Vitest Docs**: https://vitest.dev/
- **Playwright Docs**: https://playwright.dev/
- **MCP Spec**: https://modelcontextprotocol.io/

## License

MIT - See LICENSE file for details.
