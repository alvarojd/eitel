CREATE TABLE "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"username" text,
	"action" text NOT NULL,
	"details" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "devices" (
	"dev_eui" text PRIMARY KEY NOT NULL,
	"device_id" text NOT NULL,
	"name" text,
	"battery" integer DEFAULT 100,
	"rssi" integer DEFAULT '-100',
	"latitude" numeric,
	"longitude" numeric,
	"gateway_id" text,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	"snr" numeric DEFAULT '0',
	"temperature" numeric,
	"humidity" numeric,
	"co2" numeric,
	"estado_id" integer,
	"presence" boolean,
	"last_measured_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "devices" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "measurements" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"dev_eui" text,
	"temperature" numeric NOT NULL,
	"humidity" numeric NOT NULL,
	"co2" integer NOT NULL,
	"presence" boolean DEFAULT false,
	"estado_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
ALTER TABLE "measurements" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "system_settings" (
	"key" varchar(255) PRIMARY KEY NOT NULL,
	"value" text,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"role" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "users_username_key" UNIQUE("username"),
	CONSTRAINT "users_role_check" CHECK (role = ANY (ARRAY['ADMIN'::text, 'VIEWER'::text]))
);
--> statement-breakpoint
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_dev_eui_fkey" FOREIGN KEY ("dev_eui") REFERENCES "public"."devices"("dev_eui") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_measurements_dev_eui_time" ON "measurements" USING btree ("dev_eui" text_ops,"created_at" text_ops);--> statement-breakpoint
CREATE INDEX "idx_measurements_time" ON "measurements" USING btree ("created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_measurements_presence" ON "measurements" USING btree ("dev_eui" text_ops,"created_at" text_ops) WHERE presence = true;--> statement-breakpoint
CREATE POLICY "Deny all public access" ON "audit_logs" AS PERMISSIVE FOR ALL TO public USING (false);--> statement-breakpoint
CREATE POLICY "Deny all public access" ON "devices" AS PERMISSIVE FOR ALL TO public USING (false);--> statement-breakpoint
CREATE POLICY "Deny all public access" ON "measurements" AS PERMISSIVE FOR ALL TO public USING (false);--> statement-breakpoint
CREATE POLICY "Deny all public access" ON "users" AS PERMISSIVE FOR ALL TO public USING (false);