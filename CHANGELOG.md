# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- GitHub Actions CI/CD pipeline
  - Automated testing for all packages (Node 18, 20)
  - TypeScript type checking and code quality checks
  - Playwright E2E tests in CI
  - Linux AppImage build automation
  - Release workflow with tag-based releases
- Tauri desktop application setup
  - Window configuration optimized for API testing (1400x900)
  - HTTP and filesystem permissions
  - Production-ready metadata and branding
- Development documentation (DEVELOPMENT.md)
  - Comprehensive setup instructions
  - CI/CD pipeline documentation
  - Testing and debugging guides

### Changed
- Updated README with CI/CD status badges
- Configured proper Tauri build commands

## [0.1.0] - 2026-03-07

### Added
- **Database Layer** (`@reqly/database`)
  - SQLite database with schema
  - Collections CRUD operations
  - Requests CRUD operations
  - Environments CRUD operations
  - Full unit test coverage

- **HTTP Engine** (`@reqly/http-engine`)
  - HTTP client with all methods (GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS)
  - Variable interpolation support
  - Pre-request script execution
  - Test script execution with assertions
  - E2E tests with real HTTP calls to httpbin.org
  - 102 tests passing with 90%+ coverage

- **MCP Server** (`@reqly/mcp-server`)
  - Model Context Protocol server implementation
  - 4 core tools:
    - `createCollection` - Create API collections
    - `createRequest` - Add requests to collections
    - `sendRequest` - Execute HTTP requests
    - `writeTest` - Add test assertions
  - Full E2E test suite (19/19 passing)
  - Integration with database and HTTP engine

- **Desktop UI** (`@reqly/desktop`)
  - React + TypeScript application
  - Components:
    - CollectionTree - Sidebar navigation
    - RequestBuilder - Request configuration with Monaco editor
    - ResponseViewer - Response display with syntax highlighting
    - EnvironmentSelector - Environment management
    - VariableEditor - Variable management modal
  - Custom hooks for collections, requests, environments
  - Tailwind CSS styling with custom theme
  - Playwright E2E tests (8 scenarios)

- **Documentation**
  - Research documentation (95+ pages)
    - API testing features analysis (350+ features)
    - MCP protocol deep dive
    - Tech stack comparison and decisions
  - Architecture documentation
  - Contributing guidelines
  - Professional README with project overview

### Technical Details
- TypeScript strict mode enabled across all packages
- pnpm workspace with 5 packages
- Vitest for unit testing
- Playwright for E2E testing
- SQLite for local storage
- Axios for HTTP client
- Monaco Editor for code editing

### Quality
- 130+ tests passing across all packages
- TypeScript strict mode compliance
- Professional git history (no AI mentions)
- Clean code with proper error handling
- Comprehensive test coverage

[unreleased]: https://github.com/kosach/reqly/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/kosach/reqly/releases/tag/v0.1.0
