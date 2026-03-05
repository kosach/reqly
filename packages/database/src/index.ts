/**
 * SQLite database layer for Reqly
 */

import Database from 'better-sqlite3';
import type { Collection, Request, Environment } from '@reqly/types';

export class ReqlyDatabase {
  private db: Database.Database;

  constructor(dbPath: string = ':memory:') {
    this.db = new Database(dbPath);
    this.initialize();
  }

  private initialize() {
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

  // TODO: Add CRUD methods for collections, requests, environments
  
  close() {
    this.db.close();
  }
}

export default ReqlyDatabase;
