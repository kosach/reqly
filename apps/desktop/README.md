# @reqly/desktop

Reqly desktop application built with Tauri + React.

## Tech Stack

- **Frontend:** React 18 + TypeScript
- **Backend:** Tauri (Rust)
- **Build:** Vite
- **MCP:** Embedded MCP server

## Development

```bash
pnpm dev          # Vite dev server
pnpm tauri:dev    # Run Tauri app in development
pnpm tauri:build  # Build production app
```

## Project Structure

```
apps/desktop/
├── src/          # React app
├── src-tauri/    # Tauri backend (Rust)
└── package.json
```
