ALTER TABLE "system_settings" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP INDEX "idx_measurements_dev_eui_time";--> statement-breakpoint
DROP INDEX "idx_measurements_presence";--> statement-breakpoint
ALTER TABLE "devices" ADD COLUMN "notification_email" varchar(255);--> statement-breakpoint
ALTER TABLE "devices" ADD COLUMN "notifications_enabled" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "devices" ADD COLUMN "monthly_report_configured_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "devices" ADD COLUMN "last_monthly_report_sent_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "idx_measurements_dev_eui_time" ON "measurements" USING btree ("dev_eui" text_ops,"created_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_measurements_presence" ON "measurements" USING btree ("dev_eui" text_ops,"created_at" timestamptz_ops) WHERE presence = true;--> statement-breakpoint
CREATE POLICY "Deny all public access" ON "system_settings" AS PERMISSIVE FOR ALL TO public USING (false);