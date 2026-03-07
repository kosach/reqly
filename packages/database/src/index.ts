/**
 * SQLite database layer for Reqly
 */

import Database from 'better-sqlite3';
import type { Collection, Request, Environment, Variable, AuthConfig } from '@reqly/types';
import { randomUUID } from 'crypto';

export class ReqlyDatabase {
  private db: Database.Database;

  constructor(dbPath: string = ':memory:') {
    this.db = new Database(dbPath);
    this.initialize();
  }

  private initialize(): void {
    // Enable WAL mode for better performance
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');

    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS collections (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        variables TEXT, -- JSON
        auth TEXT, -- JSON
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS requests (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        method TEXT NOT NULL,
        url TEXT NOT NULL,
        headers TEXT, -- JSON
        body TEXT,
        collection_id TEXT,
        folder_id TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS environments (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        variables TEXT NOT NULL, -- JSON
        created_at INTEGER NOT NULL,
        updated_at INTEGER NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_requests_collection ON requests(collection_id);
    `);
  }

  // Collections CRUD
  createCollection(data: Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>): Collection {
    const now = Date.now();
    const collection: Collection = {
      id: randomUUID(),
      ...data,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    const stmt = this.db.prepare(`
      INSERT INTO collections (id, name, description, variables, auth, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      collection.id,
      collection.name,
      collection.description || null,
      collection.variables ? JSON.stringify(collection.variables) : null,
      collection.auth ? JSON.stringify(collection.auth) : null,
      now,
      now
    );

    return collection;
  }

  getCollection(id: string): Collection | null {
    const stmt = this.db.prepare(`
      SELECT * FROM collections WHERE id = ?
    `);
    const row = stmt.get(id) as DatabaseRow | undefined;

    if (!row) return null;

    return this.mapToCollection(row);
  }

  getAllCollections(): Collection[] {
    const stmt = this.db.prepare(`
      SELECT * FROM collections ORDER BY created_at DESC
    `);
    const rows = stmt.all() as DatabaseRow[];

    return rows.map(row => this.mapToCollection(row));
  }

  updateCollection(id: string, data: Partial<Omit<Collection, 'id' | 'createdAt' | 'updatedAt'>>): Collection | null {
    const existing = this.getCollection(id);
    if (!existing) return null;

    const now = Date.now();
    const updates: string[] = [];
    const params: unknown[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description);
    }
    if (data.variables !== undefined) {
      updates.push('variables = ?');
      params.push(JSON.stringify(data.variables));
    }
    if (data.auth !== undefined) {
      updates.push('auth = ?');
      params.push(JSON.stringify(data.auth));
    }

    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    const stmt = this.db.prepare(`
      UPDATE collections
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...params);

    return this.getCollection(id);
  }

  deleteCollection(id: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM collections WHERE id = ?
    `);
    const result = stmt.run(id);

    return result.changes > 0;
  }

  // Requests CRUD
  createRequest(data: Omit<Request, 'id' | 'createdAt' | 'updatedAt'>): Request {
    const now = Date.now();
    const request: Request = {
      id: randomUUID(),
      ...data,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    const stmt = this.db.prepare(`
      INSERT INTO requests (id, name, method, url, headers, body, collection_id, folder_id, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      request.id,
      request.name,
      request.method,
      request.url,
      JSON.stringify(request.headers),
      request.body || null,
      request.collectionId || null,
      request.folderId || null,
      now,
      now
    );

    return request;
  }

  getRequest(id: string): Request | null {
    const stmt = this.db.prepare(`
      SELECT * FROM requests WHERE id = ?
    `);
    const row = stmt.get(id) as RequestRow | undefined;

    if (!row) return null;

    return this.mapToRequest(row);
  }

  getRequestsByCollection(collectionId: string): Request[] {
    const stmt = this.db.prepare(`
      SELECT * FROM requests WHERE collection_id = ? ORDER BY created_at DESC
    `);
    const rows = stmt.all(collectionId) as RequestRow[];

    return rows.map(row => this.mapToRequest(row));
  }

  getAllRequests(): Request[] {
    const stmt = this.db.prepare(`
      SELECT * FROM requests ORDER BY created_at DESC
    `);
    const rows = stmt.all() as RequestRow[];

    return rows.map(row => this.mapToRequest(row));
  }

  updateRequest(id: string, data: Partial<Omit<Request, 'id' | 'createdAt' | 'updatedAt'>>): Request | null {
    const existing = this.getRequest(id);
    if (!existing) return null;

    const now = Date.now();
    const updates: string[] = [];
    const params: unknown[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name);
    }
    if (data.method !== undefined) {
      updates.push('method = ?');
      params.push(data.method);
    }
    if (data.url !== undefined) {
      updates.push('url = ?');
      params.push(data.url);
    }
    if (data.headers !== undefined) {
      updates.push('headers = ?');
      params.push(JSON.stringify(data.headers));
    }
    if (data.body !== undefined) {
      updates.push('body = ?');
      params.push(data.body);
    }
    if (data.collectionId !== undefined) {
      updates.push('collection_id = ?');
      params.push(data.collectionId);
    }
    if (data.folderId !== undefined) {
      updates.push('folder_id = ?');
      params.push(data.folderId);
    }

    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    const stmt = this.db.prepare(`
      UPDATE requests
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...params);

    return this.getRequest(id);
  }

  deleteRequest(id: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM requests WHERE id = ?
    `);
    const result = stmt.run(id);

    return result.changes > 0;
  }

  // Environments CRUD
  createEnvironment(data: Omit<Environment, 'id' | 'createdAt' | 'updatedAt'>): Environment {
    const now = Date.now();
    const environment: Environment = {
      id: randomUUID(),
      ...data,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };

    const stmt = this.db.prepare(`
      INSERT INTO environments (id, name, variables, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(
      environment.id,
      environment.name,
      JSON.stringify(environment.variables),
      now,
      now
    );

    return environment;
  }

  getEnvironment(id: string): Environment | null {
    const stmt = this.db.prepare(`
      SELECT * FROM environments WHERE id = ?
    `);
    const row = stmt.get(id) as EnvironmentRow | undefined;

    if (!row) return null;

    return this.mapToEnvironment(row);
  }

  getAllEnvironments(): Environment[] {
    const stmt = this.db.prepare(`
      SELECT * FROM environments ORDER BY created_at DESC
    `);
    const rows = stmt.all() as EnvironmentRow[];

    return rows.map(row => this.mapToEnvironment(row));
  }

  updateEnvironment(id: string, data: Partial<Omit<Environment, 'id' | 'createdAt' | 'updatedAt'>>): Environment | null {
    const existing = this.getEnvironment(id);
    if (!existing) return null;

    const now = Date.now();
    const updates: string[] = [];
    const params: unknown[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name);
    }
    if (data.variables !== undefined) {
      updates.push('variables = ?');
      params.push(JSON.stringify(data.variables));
    }

    updates.push('updated_at = ?');
    params.push(now);
    params.push(id);

    const stmt = this.db.prepare(`
      UPDATE environments
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

    stmt.run(...params);

    return this.getEnvironment(id);
  }

  deleteEnvironment(id: string): boolean {
    const stmt = this.db.prepare(`
      DELETE FROM environments WHERE id = ?
    `);
    const result = stmt.run(id);

    return result.changes > 0;
  }

  // Helper methods to map database rows to domain objects
  private mapToCollection(row: DatabaseRow): Collection {
    return {
      id: row.id,
      name: row.name,
      description: row.description || undefined,
      variables: row.variables ? JSON.parse(row.variables) : undefined,
      auth: row.auth ? JSON.parse(row.auth) : undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapToRequest(row: RequestRow): Request {
    return {
      id: row.id,
      name: row.name,
      method: row.method as Request['method'],
      url: row.url,
      headers: JSON.parse(row.headers),
      body: row.body || undefined,
      collectionId: row.collection_id || undefined,
      folderId: row.folder_id || undefined,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapToEnvironment(row: EnvironmentRow): Environment {
    return {
      id: row.id,
      name: row.name,
      variables: JSON.parse(row.variables),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  close(): void {
    this.db.close();
  }
}

// Database row types
interface DatabaseRow {
  id: string;
  name: string;
  description: string | null;
  variables: string | null;
  auth: string | null;
  created_at: number;
  updated_at: number;
}

interface RequestRow {
  id: string;
  name: string;
  method: string;
  url: string;
  headers: string;
  body: string | null;
  collection_id: string | null;
  folder_id: string | null;
  created_at: number;
  updated_at: number;
}

interface EnvironmentRow {
  id: string;
  name: string;
  variables: string;
  created_at: number;
  updated_at: number;
}

export default ReqlyDatabase;
