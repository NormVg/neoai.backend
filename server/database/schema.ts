import { pgTable, uuid, text, jsonb, integer, real, timestamp, boolean, index } from 'drizzle-orm/pg-core'

// MCQ Response Cache Table
export const mcqCache = pgTable('mcq_cache', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Request data
  question: text('question').notNull(),
  options: jsonb('options').notNull().$type<string[]>(),
  code: text('code'),
  cacheKey: text('cache_key').notNull().unique(),

  // Response data
  answer: integer('answer').notNull(),
  selectedOption: text('selected_option').notNull(),
  explanation: text('explanation').notNull(),
  confidence: real('confidence').notNull(), // 0.0 - 1.0

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  requestCount: integer('request_count').default(1).notNull(),
  lastAccessed: timestamp('last_accessed').defaultNow().notNull(),
}, (table) => [
  index('mcq_cache_key_idx').on(table.cacheKey),
])

// Code Response Cache Table
export const codeCache = pgTable('code_cache', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Request data
  question: text('question').notNull(),
  language: text('language').notNull(),
  inputFormat: text('input_format'),
  outputFormat: text('output_format'),
  testCases: text('test_cases'),
  cacheKey: text('cache_key').notNull().unique(),

  // Response data
  code: text('code').notNull(),
  explanation: text('explanation').notNull(),
  timeComplexity: text('time_complexity').notNull(),
  spaceComplexity: text('space_complexity').notNull(),

  // Metadata
  createdAt: timestamp('created_at').defaultNow().notNull(),
  requestCount: integer('request_count').default(1).notNull(),
  lastAccessed: timestamp('last_accessed').defaultNow().notNull(),
}, (table) => [
  index('code_cache_key_idx').on(table.cacheKey),
])

// API Keys Table — managed from admin panel, used for Gemini key rotation
export const apiKeys = pgTable('api_keys', {
  id: uuid('id').primaryKey().defaultRandom(),
  label: text('label').notNull(), // friendly name, e.g. "Key 1", "Vishnu personal"
  key: text('key').notNull().unique(), // the actual Google API key
  active: boolean('active').default(true).notNull(), // toggle on/off without deleting
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
