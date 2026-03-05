# Reqly
## AI-First API Testing Tool with MCP Protocol

*Request elegantly* — AI-native альтернатива Postman з фокусом на Model Context Protocol (MCP).

**Дата дослідження:** 4-5 березня 2026  
**Тривалість:** 6 годин (21:00 → 03:28)  
**Команда:** Multi-agent дослідження (Gemini + Claude)

---

## 📋 Зміст документації

### 🔍 Дослідження (Research)

1. **[postman-features.md](research/postman-features.md)** (21 KB)
   - Повний аудит можливостей Postman (350+ features)
   - Організовано по категоріях: requests, collections, auth, testing, collaboration

2. **[mcp-protocol.md](research/mcp-protocol.md)** (32 KB)  
   - Глибокий розбір Model Context Protocol
   - Tools, Resources, Prompts architecture
   - Обмеження та можливості

3. **[tech-stack-options.md](research/tech-stack-options.md)** (25 KB)
   - Порівняння backend frameworks (Go, Rust, Node.js, Python)
   - Database опції (SQLite, PostgreSQL, IndexedDB)
   - UI підходи (Electron, Tauri, PWA)

4. **[architecture-draft.md](research/architecture-draft.md)** (59 KB)
   - Повна архітектура системи
   - Database schema, API endpoints
   - Performance optimizations, monitoring

### ✅ Рекомендації (Reviews)

1. **[postman-features-categorized.md](reviews/postman-features-categorized.md)** (22 KB)
   - MVP features (60)
   - Phase 2 features (85)  
   - Backlog (200+)
   - Пріоритизація по важливості

2. **[mcp-integration-design.md](reviews/mcp-integration-design.md)** (27 KB)
   - MCP як PRIMARY interface
   - 15 core tools (createCollection, sendRequest, writeTest, etc.)
   - Resources та Prompts дизайн

3. **[tech-stack-recommendation.md](reviews/tech-stack-recommendation.md)** (25 KB)  
   - **Рекомендований стек:** Node.js + SQLite + Tauri
   - Time to MVP: 8-12 тижнів
   - Performance target: 1000+ collections

---

## 🏆 Рекомендований Tech Stack

```
Backend:     Node.js 18+ (TypeScript) + MCP TypeScript SDK
Database:    SQLite 3.40+ with JSON1 extension
UI:          Tauri 2.0 + React 18
MCP:         TypeScript SDK (reference implementation)
Testing:     Vitest + Playwright
Build:       Vite + pnpm
```

**Переваги:**
- ✅ MCP TypeScript SDK — найзріліший (reference implementation)
- ✅ Швидкий розвиток (2-3x швидше Go/Rust)
- ✅ Легкий bundle (15-30 MB vs 150-200 MB Electron)
- ✅ Local-first (SQLite, працює offline)
- ✅ Handles 1000+ collections без лагів (virtualization + cache)

---

## 🎯 Ключові принципи

1. **MCP-First Design** — AI агенти first-class users, UI secondary
2. **Local-First** — всі дані на машині користувача (SQLite)
3. **Performance** — 1000+ колекцій без підвисань (на відміну від Postman)
4. **Type-Safe** — TypeScript full-stack
5. **Lightweight** — 10x легше Postman

---

## 📊 MVP Scope

**Core Features (Phase 1, 8-12 тижнів):**
- HTTP requests (GET/POST/PUT/DELETE/PATCH)
- Collections + folders (nested organization)  
- Environments + variables
- Basic auth (Bearer, API Key, Basic)
- Pre-request scripts + tests (JavaScript)
- MCP integration (15 core tools)
- Response viewer (JSON/XML/HTML)
- Request history

**Phase 2 (наступні 2-3 місяці):**
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

## 📁 Структура проекту

```
reqly/
├── README.md                          # Цей файл
├── research/                          # Дослідження (Gemini agents)
│   ├── postman-features.md           # Feature audit
│   ├── mcp-protocol.md               # MCP deep dive
│   ├── tech-stack-options.md         # Stack evaluation
│   └── architecture-draft.md         # System design
└── reviews/                           # Рекомендації (Claude agents)
    ├── postman-features-categorized.md   # MVP prioritization
    ├── mcp-integration-design.md         # MCP architecture
    └── tech-stack-recommendation.md      # Final tech decision
```

---

## 💡 Чому це потрібно?

**Проблеми Postman:**
1. ❌ Лагає з великою кількістю колекцій (>500)
2. ❌ Важкий (150-200 MB, 400-800 MB RAM)
3. ❌ Не оптимізований для AI/automation
4. ❌ Повільний startup (5-10 sec)
5. ❌ Electron overhead

**Наше рішення:**
1. ✅ Virtual lists + cache → 1000+ колекцій smooth
2. ✅ Tauri (15-30 MB) + optimized SQLite
3. ✅ MCP-first — AI може працювати без GUI
4. ✅ Instant startup (<2 sec)
5. ✅ Native WebView (lower memory)

---

## 🔗 Посилання

- **MCP Spec:** https://spec.modelcontextprotocol.io/
- **Postman API:** https://www.postman.com/  
- **Tauri:** https://tauri.app/
- **SQLite:** https://www.sqlite.org/

---

## 📝 Ліцензія

TBD (можливо MIT або Apache 2.0)

---

**Створено:** Multi-agent дослідження OpenClaw  
**Статус:** Дослідження завершено, готово до імплементації
