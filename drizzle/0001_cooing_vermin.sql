CREATE TABLE "alert_emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT "alert_emails_email_key" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "alert_emails" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "devices" ALTER COLUMN "latitude" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "devices" ALTER COLUMN "longitude" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "devices" ALTER COLUMN "snr" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "devices" ALTER COLUMN "temperature" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "devices" ALTER COLUMN "humidity" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "devices" ALTER COLUMN "co2" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "measurements" ALTER COLUMN "temperature" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "measurements" ALTER COLUMN "humidity" SET DATA TYPE real;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "ip_address" text;--> statement-breakpoint
ALTER TABLE "audit_logs" ADD COLUMN "user_agent" text;--> statement-breakpoint
ALTER TABLE "devices" ADD COLUMN "last_battery_alert_sent_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "devices" ADD COLUMN "last_offline_alert_sent_at" timestamp with time zone;--> statement-breakpoint
CREATE POLICY "Deny all public access" ON "alert_emails" AS PERMISSIVE FOR ALL TO public USING (false);