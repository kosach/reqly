# Contributing to Reqly

## Monorepo Structure

```
reqly/
├── apps/
│   └── desktop/              # Tauri desktop app
├── packages/
│   ├── types/                # Shared TypeScript types
│   ├── mcp-server/           # MCP protocol server
│   └── database/             # SQLite database layer
├── docs/                     # Documentation (research)
│   ├── research/             # Original research docs
│   └── reviews/              # Architecture reviews
└── package.json              # Root package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Rust (for Tauri)

### Installation

```bash
# Install dependencies for all packages
pnpm install

# Build all packages
pnpm build

# Run development mode
pnpm dev
```

### Working on packages

```bash
# Work on types package
cd packages/types
pnpm dev

# Work on MCP server
cd packages/mcp-server
pnpm dev

# Run desktop app
cd apps/desktop
pnpm tauri:dev
```

## Development Workflow

1. **Types first** - Define types in `@reqly/types`
2. **Database layer** - Implement in `@reqly/database`
3. **MCP server** - Build MCP tools in `@reqly/mcp-server`
4. **Desktop UI** - Create React components in `@reqly/desktop`

## Scripts

```bash
pnpm dev          # Run desktop app in dev mode
pnpm build        # Build all packages
pnpm test         # Run tests (all packages)
pnpm lint         # Lint all packages
pnpm typecheck    # Type check all packages
```

## Code Style

- TypeScript strict mode
- ESLint + Prettier (TODO: configure)
- Conventional commits

## Testing

- Unit tests: Vitest
- E2E tests: Playwright (TODO)

## License

MIT
