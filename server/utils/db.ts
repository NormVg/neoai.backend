import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from '../database/schema'

let db: ReturnType<typeof drizzle<typeof schema>> | null = null

export function getDatabase() {
  if (!db) {
    const config = useRuntimeConfig()
    const connectionString = config.databaseUrl

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set')
    }

    // Create postgres client (prepare: false required for Supabase pgbouncer)
    const client = postgres(connectionString, {
      prepare: false,
      idle_timeout: 20,
      connect_timeout: 10,
    })

    db = drizzle(client, { schema })
  }

  return db
}

export { schema }
