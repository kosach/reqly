import { ReqlyDatabase } from '@reqly/database'

let dbInstance: ReqlyDatabase | null = null

export function getDatabase(): ReqlyDatabase {
  if (!dbInstance) {
    // Use in-memory database for now
    // TODO: Use Tauri API to get proper app data directory
    dbInstance = new ReqlyDatabase(':memory:')
  }
  return dbInstance
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}
