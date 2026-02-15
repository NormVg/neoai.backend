CREATE TABLE "api_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"label" text NOT NULL,
	"key" text NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "api_keys_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "code_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"language" text NOT NULL,
	"input_format" text,
	"output_format" text,
	"test_cases" text,
	"cache_key" text NOT NULL,
	"code" text NOT NULL,
	"explanation" text NOT NULL,
	"time_complexity" text NOT NULL,
	"space_complexity" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"request_count" integer DEFAULT 1 NOT NULL,
	"last_accessed" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "code_cache_cache_key_unique" UNIQUE("cache_key")
);
--> statement-breakpoint
CREATE TABLE "mcq_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question" text NOT NULL,
	"options" jsonb NOT NULL,
	"code" text,
	"cache_key" text NOT NULL,
	"answer" integer NOT NULL,
	"selected_option" text NOT NULL,
	"explanation" text NOT NULL,
	"confidence" real NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"request_count" integer DEFAULT 1 NOT NULL,
	"last_accessed" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "mcq_cache_cache_key_unique" UNIQUE("cache_key")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"plan" text DEFAULT 'free' NOT NULL,
	"plan_expires_at" timestamp,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE INDEX "code_cache_key_idx" ON "code_cache" USING btree ("cache_key");--> statement-breakpoint
CREATE INDEX "mcq_cache_key_idx" ON "mcq_cache" USING btree ("cache_key");--> statement-breakpoint
CREATE INDEX "users_username_idx" ON "users" USING btree ("username");