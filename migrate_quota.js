import postgres from 'postgres'
import fs from 'fs'
import path from 'path'

// Manually parse test.env
const envPath = path.join(process.cwd(), 'test.env')
const envContent = fs.readFileSync(envPath, 'utf8')
const dbUrlMatch = envContent.match(/DATABASE_URL=(.*)/)
const connectionString = dbUrlMatch ? dbUrlMatch[1].trim() : process.env.DATABASE_URL

if (!connectionString) {
  console.error('DATABASE_URL is not set')
  process.exit(1)
}

const sql = postgres(connectionString, {
  prepare: false,
  ssl: 'require',
})

async function migrate() {
  try {
    console.log('Adding usage quota columns to users table...')

    try {
      await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "request_count" integer DEFAULT 0 NOT NULL`
      console.log('Added request_count column')
    } catch (e) {
      console.log('request_count column error:', e.message)
    }

    try {
      await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "quota_reset_at" timestamp DEFAULT NOW() NOT NULL`
      console.log('Added quota_reset_at column')
    } catch (e) {
      console.log('quota_reset_at column error:', e.message)
    }

    try {
      await sql`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "quota_limit" integer DEFAULT 50 NOT NULL`
      console.log('Added quota_limit column')
    } catch (e) {
      console.log('quota_limit column error:', e.message)
    }

    console.log('Migration completed successfully')
  } catch (error) {
    console.error('Migration failed:', error)
  } finally {
    await sql.end()
  }
}

migrate()
