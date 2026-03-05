# Reqly
## AI-First API Testing Tool with MCP Protocol

*Request elegantly* — AI-native alternative to Postman with focus on Model Context Protocol (MCP).

**Research Date:** March 4-5, 2026  
**Duration:** 6 hours (21:00 → 03:28)  
**Team:** Multi-agent research (Gemini + Claude)

---

## 📋 Documentation

### 🔍 Research (Gemini agents)

1. **[postman-features.md](research/postman-features.md)** (21 KB)
   - Complete Postman feature audit (350+ features)
   - Organized by categories: requests, collections, auth, testing, collaboration

2. **[mcp-protocol.md](research/mcp-protocol.md)** (32 KB)  
   - Deep dive into Model Context Protocol
   - Tools, Resources, Prompts architecture
   - Limitations and capabilities

3. **[tech-stack-options.md](research/tech-stack-options.md)** (25 KB)
   - Backend frameworks comparison (Go, Rust, Node.js, Python)
   - Database options (SQLite, PostgreSQL, IndexedDB)
   - UI approaches (Electron, Tauri, PWA)

4. **[architecture-draft.md](research/architecture-draft.md)** (59 KB)
   - Complete system architecture
   - Database schema, API endpoints
   - Performance optimizations, monitoring

### ✅ Reviews & Recommendations (Claude agents)

1. **[postman-features-categorized.md](reviews/postman-features-categorized.md)** (22 KB)
   - MVP features (60)
   - Phase 2 features (85)  
   - Backlog (200+)
   - Priority scoring

2. **[mcp-integration-design.md](reviews/mcp-integration-design.md)** (27 KB)
   - MCP as PRIMARY interface
   - 15 core tools (createCollection, sendRequest, writeTest, etc.)
   - Resources and Prompts design

3. **[tech-stack-recommendation.md](reviews/tech-stack-recommendation.md)** (25 KB)  
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
- ✅ Lightweight bundle (15-30 MB vs 150-200 MB Electron)
- ✅ Local-first (SQLite, works offline)
- ✅ Handles 1000+ collections without lag (virtualization + cache)

---

## 🎯 Core Principles

1. **MCP-First Design** — AI agents are first-class users, UI is secondary
2. **Local-First** — All data on user's machine (SQLite)
3. **Performance** — Handle 1000+ collections without lag (unlike Postman)
4. **Type-Safe** — TypeScript full-stack
5. **Lightweight** — 10x lighter than Postman

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

- Startup time: <2 sec (vs 5-10 sec Postman)
- Render 1000 collections: <500ms (virtualized list)
- Request send latency: <50ms overhead
- Memory usage: 150-200 MB (vs 400-800 MB Postman)
- Bundle size: 15-30 MB (vs 150-200 MB Postman)

---

## 📁 Project Structure

```
reqly/
├── README.md                          # This file
├── research/                          # Research (Gemini agents)
│   ├── postman-features.md           # Feature audit
│   ├── mcp-protocol.md               # MCP deep dive
│   ├── tech-stack-options.md         # Stack evaluation
│   └── architecture-draft.md         # System design
└── reviews/                           # Recommendations (Claude agents)
    ├── postman-features-categorized.md   # MVP prioritization
    ├── mcp-integration-design.md         # MCP architecture
    └── tech-stack-recommendation.md      # Final tech decision
```

---

## 💡 Why Reqly?

**Postman Problems:**
1. ❌ Lags with large collections (>500)
2. ❌ Heavy (150-200 MB, 400-800 MB RAM)
3. ❌ Not optimized for AI/automation
4. ❌ Slow startup (5-10 sec)
5. ❌ Electron overhead

**Reqly Solutions:**
1. ✅ Virtual lists + cache → 1000+ collections smooth
2. ✅ Tauri (15-30 MB) + optimized SQLite
3. ✅ MCP-first — AI can work without GUI
4. ✅ Instant startup (<2 sec)
5. ✅ Native WebView (lower memory)

---

## 🔗 References

- **MCP Spec:** https://spec.modelcontextprotocol.io/
- **Postman API:** https://www.postman.com/  
- **Tauri:** https://tauri.app/
- **SQLite:** https://www.sqlite.org/

---

## 📝 License

TBD (likely MIT or Apache 2.0)

---

**Created by:** Multi-agent research (OpenClaw)  
**Status:** Research complete, ready for implementation  
**Tagline:** *Request elegantly* 🚀
