# @reqly/database

SQLite database layer for Reqly using `better-sqlite3`.

## Features

- WAL mode for performance
- JSON1 extension for storing request/response bodies
- Type-safe queries with shared `@reqly/types`
- Migrations support (TODO)

## Usage

```typescript
import { ReqlyDatabase } from '@reqly/database';

const db = new ReqlyDatabase('./reqly.db');
// TODO: CRUD operations
db.close();
```

## Development

```bash
pnpm build        # Compile TypeScript
pnpm dev          # Watch mode
```
