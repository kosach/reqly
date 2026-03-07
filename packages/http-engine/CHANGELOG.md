# Changelog

All notable changes to the HTTP Engine package will be documented in this file.

## [0.1.0] - 2026-03-07

### Added
- HTTP client with support for GET, POST, PUT, DELETE, PATCH methods
- Variable interpolation using `{{variableName}}` syntax
- Pre-request script execution with Postman-compatible `pm` API
- Test script execution with assertions and data extraction
- Environment variable resolution with priority (environment > collection)
- Authentication support:
  - Bearer token
  - Basic authentication
  - API key (header and query params)
  - OAuth2 configuration structure
- Request/response logging for debugging
- Comprehensive error handling:
  - Network timeouts
  - Connection errors
  - HTTP error responses
  - Script execution errors
- Support for multiple content types:
  - JSON (application/json)
  - Form data (application/x-www-form-urlencoded)
  - Raw text (text/plain)
  - XML (application/xml)
- E2E test suite with real HTTP calls to httpbin.org
- TypeScript strict mode with full type safety
- Professional API documentation

### Test Coverage
- 102 tests passing
- Unit tests for all core modules
- E2E tests with real HTTP endpoints
- Authentication integration tests
- Script execution tests

## [Unreleased]

### Planned
- Response caching
- Request retry logic
- Rate limiting
- Cookie management
- File upload support (multipart/form-data)
- Streaming responses
- WebSocket support
