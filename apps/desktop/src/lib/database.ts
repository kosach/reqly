import ReqlyDatabase from '@reqly/database'
import { homedir } from 'os'
import { join } from 'path'

let dbInstance: ReqlyDatabase | null = null

export function getDatabase(): ReqlyDatabase {
  if (!dbInstance) {
    // Store database in user's home directory
    const dbPath = join(homedir(), '.reqly', 'reqly.db')
    dbInstance = new ReqlyDatabase(dbPath)
  }
  return dbInstance
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}
