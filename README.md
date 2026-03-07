# Reqly
## AI-First API Testing Tool with MCP Protocol

*Request elegantly* — AI-native API testing and development platform built on Model Context Protocol (MCP).

**Research Date:** March 4-5, 2026  
**Duration:** 6 hours (21:00 → 03:28)  
**Team:** Multi-agent research (Gemini + Claude)

**Implementation Status:**
- ✅ **Phase 1:** Database layer (SQLite + TypeScript types) - Complete (Mar 7, 07:43)
- ✅ **Phase 2:** HTTP Engine (axios + scripting + tests) - Complete (Mar 7, 11:00)
- ✅ **Phase 3:** MCP Server (4 core tools + E2E tests) - Complete (Mar 7, 11:10)
- ✅ **Phase 4:** Basic UI (React + Tauri) - Complete (Mar 7, 11:30)

---

## 🎯 What is Reqly?

Reqly is a modern API testing tool designed from the ground up for AI collaboration. Unlike traditional GUI-first tools, Reqly treats AI agents as first-class users through the Model Context Protocol, while providing an elegant desktop interface for human developers.

### Key Features

- **MCP-First Architecture** — AI agents can create, test, and debug APIs through structured protocol
- **Local-First** — All data stored locally in SQLite, works offline
- **High Performance** — Handles 1000+ API collections without lag using virtualization and caching
- **Lightweight** — Native desktop app (15-30 MB) built with Tauri + React
- **Type-Safe** — Full TypeScript stack with shared types across frontend and backend
- **Developer-Friendly** — Built by developers, for developers

---

## 📋 Documentation

### 🔍 Research (Gemini agents)

1. **[api-testing-features.md](docs/research/api-testing-features.md)** (21 KB)
   - Complete API testing feature analysis (350+ features)
   - Organized by categories: requests, collections, auth, testing, collaboration

2. **[mcp-protocol.md](docs/research/mcp-protocol.md)** (32 KB)  
   - Deep dive into Model Context Protocol
   - Tools, Resources, Prompts architecture
   - Limitations and capabilities

3. **[tech-stack-options.md](docs/research/tech-stack-options.md)** (25 KB)
   - Backend frameworks comparison (Go, Rust, Node.js, Python)
   - Database options (SQLite, PostgreSQL, IndexedDB)
   - UI approaches (Electron, Tauri, PWA)

4. **[architecture-draft.md](docs/research/architecture-draft.md)** (59 KB)
   - Complete system architecture
   - Database schema, API endpoints
   - Performance optimizations, monitoring

### ✅ Reviews & Recommendations (Claude agents)

1. **[feature-prioritization.md](docs/reviews/feature-prioritization.md)** (22 KB)
   - MVP features (60)
   - Phase 2 features (85)  
   - Backlog (200+)
   - Priority scoring

2. **[mcp-integration-design.md](docs/reviews/mcp-integration-design.md)** (27 KB)
   - MCP as PRIMARY interface
   - 15 core tools (createCollection, sendRequest, writeTest, etc.)
   - Resources and Prompts design

3. **[tech-stack-recommendation.md](docs/reviews/tech-stack-recommendation.md)** (25 KB)  
   - **Recommended stack:** Node.js + SQLite + Tauri
   - Time to MVP: 8-12 weeks
   - Performance target: 1000+ collections

---

## 🏆 Recommended Tech Stack

```
Backend:     Node.js 18+ (TypeScript) + MCP TypeScript SDK
Database:    SQLite 3.40+ with JSON1 extension
UI:          Tauri 2.0 + React 18
MCP:         TypeScript SDK (reference implementation)
Testing:     Vitest + Playwright
Build:       Vite + pnpm
```

**Why this stack:**
- ✅ MCP TypeScript SDK is the most mature (reference implementation)
- ✅ Faster development (2-3x faster than Go/Rust)
- ✅ Lightweight bundle (15-30 MB vs 150+ MB for Electron-based apps)
- ✅ Local-first (SQLite, works offline)
- ✅ Handles 1000+ collections without lag (virtualization + cache)

---

## 🎯 Core Principles

1. **MCP-First Design** — AI agents are first-class users, UI is secondary
2. **Local-First** — All data on user's machine (SQLite)
3. **Performance** — Handle 1000+ collections smoothly with virtualization and caching
4. **Type-Safe** — TypeScript full-stack with shared types
5. **Lightweight** — Native WebView, minimal bundle size

---

## 📊 MVP Scope

**Core Features (Phase 1, 8-12 weeks):**
- HTTP requests (GET/POST/PUT/DELETE/PATCH)
- Collections + folders (nested organization)  
- Environments + variables
- Basic auth (Bearer, API Key, Basic)
- Pre-request scripts + tests (JavaScript)
- MCP integration (15 core tools)
- Response viewer (JSON/XML/HTML)
- Request history

**Phase 2 (next 2-3 months):**
- OAuth 2.0 flow
- Collection runner + data files
- GraphQL support
- WebSocket testing
- Advanced scripting (pm.* API)

---

## 🚀 Roadmap Overview

1. **Weeks 1-2:** Proof of concept (MCP + SQLite + basic HTTP)
2. **Weeks 3-6:** Core features (collections, environments, auth)
3. **Weeks 7-10:** Testing framework + scripts runtime  
4. **Weeks 11-12:** UI polish + documentation
5. **Phase 2:** Advanced features + marketplace

---

## 📈 Performance Targets

- Startup time: <2 sec
- Render 1000 collections: <500ms (virtualized list)
- Request send latency: <50ms overhead
- Memory usage: 150-200 MB for typical workload
- Bundle size: 15-30 MB

---

## 📁 Project Structure

```
reqly/                                 # Monorepo root
├── apps/
│   └── desktop/                      # Tauri + React desktop app
├── packages/
│   ├── types/                        # Shared TypeScript types
│   ├── database/                     # SQLite database layer
│   ├── http-engine/                  # HTTP client with scripting support
│   └── mcp-server/                   # MCP protocol server
├── docs/
│   ├── research/                     # Research (Gemini agents)
│   │   ├── api-testing-features.md  # Feature analysis
│   │   ├── mcp-protocol.md          # MCP deep dive
│   │   ├── tech-stack-options.md    # Stack evaluation
│   │   └── architecture-draft.md    # System design
│   └── reviews/                      # Recommendations (Claude agents)
│       ├── feature-prioritization.md        # MVP prioritization
│       ├── mcp-integration-design.md        # MCP architecture
│       └── tech-stack-recommendation.md     # Final tech decision
├── pnpm-workspace.yaml               # pnpm workspace config
├── package.json                      # Root package.json
└── CONTRIBUTING.md                   # Development guide
```

---

## 🚀 Quick Start

```bash
# Clone repository
git clone https://github.com/kosach/reqly.git
cd reqly

# Install dependencies (requires pnpm 8+)
pnpm install

# Build all packages
pnpm build

# Run desktop app in development
pnpm dev
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed development guide.

---

## 💡 Why Reqly?

**Modern API Development Challenges:**
1. ❌ Existing tools lag with large collections (>500 requests)
2. ❌ Heavy desktop apps (150-200 MB, 400-800 MB RAM)
3. ❌ Not optimized for AI/automation workflows
4. ❌ Slow startup times (5-10 seconds)
5. ❌ Inefficient rendering of large datasets

**Reqly Solutions:**
1. ✅ Virtual lists + intelligent caching → smooth performance with 1000+ collections
2. ✅ Lightweight native app (15-30 MB) using Tauri + optimized SQLite
3. ✅ MCP-first design — AI agents can work independently through structured protocol
4. ✅ Instant startup (<2 seconds) with lazy loading
5. ✅ Virtualized rendering with WebView optimization

---

## 🔗 References

- **MCP Spec:** https://spec.modelcontextprotocol.io/
- **Tauri:** https://tauri.app/
- **SQLite:** https://www.sqlite.org/

---

## 📝 License

TBD (likely MIT or Apache 2.0)

---

**Created by:** Multi-agent research (OpenClaw)  
**Status:** Research complete, ready for implementation  
**Tagline:** *Request elegantly* 🚀
