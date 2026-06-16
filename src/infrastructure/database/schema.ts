import { pgTable, unique, pgPolicy, check, uuid, text, timestamp, foreignKey, index, bigserial, integer, boolean, varchar, real } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const users = pgTable("users", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	username: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	role: text().notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("users_username_key").on(table.username),
	pgPolicy("Deny all public access", { as: "permissive", for: "all", to: ["public"], using: sql`false` }),
	check("users_role_check", sql`role = ANY (ARRAY['ADMIN'::text, 'VIEWER'::text])`),
]);

export const auditLogs = pgTable("audit_logs", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	userId: uuid("user_id"),
	username: text(),
	action: text().notNull(),
	details: text(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "audit_logs_user_id_fkey"
		}).onDelete("set null"),
	pgPolicy("Deny all public access", { as: "permissive", for: "all", to: ["public"], using: sql`false` }),
]);

export const measurements = pgTable("measurements", {
	id: bigserial({ mode: "bigint" }).primaryKey().notNull(),
	devEui: text("dev_eui"),
	temperature: real().notNull(),
	humidity: real().notNull(),
	co2: integer().notNull(),
	presence: boolean().default(false),
	estadoId: integer("estado_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_measurements_dev_eui_time").using("btree", table.devEui.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_measurements_time").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_measurements_presence").using("btree", table.devEui.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsFirst().op("timestamptz_ops")).where(sql`presence = true`),
	foreignKey({
			columns: [table.devEui],
			foreignColumns: [devices.devEui],
			name: "measurements_dev_eui_fkey"
		}).onDelete("cascade"),
	pgPolicy("Deny all public access", { as: "permissive", for: "all", to: ["public"], using: sql`false` }),
]);

export const systemSettings = pgTable("system_settings", {
	key: varchar({ length: 255 }).primaryKey().notNull(),
	value: text(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`),
});

export const alertEmails = pgTable("alert_emails", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	email: varchar({ length: 255 }).notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	unique("alert_emails_email_key").on(table.email),
	pgPolicy("Deny all public access", { as: "permissive", for: "all", to: ["public"], using: sql`false` }),
]);

export const devices = pgTable("devices", {
	devEui: text("dev_eui").primaryKey().notNull(),
	deviceId: text("device_id").notNull(),
	name: text(),
	battery: integer().default(100),
	rssi: integer().default(sql`'-100'`),
	latitude: real(),
	longitude: real(),
	gatewayId: text("gateway_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`),
	snr: real().default(0),
	temperature: real(),
	humidity: real(),
	co2: real(),
	estadoId: integer("estado_id"),
	presence: boolean(),
	lastMeasuredAt: timestamp("last_measured_at", { withTimezone: true, mode: 'date' }),
	lastBatteryAlertSentAt: timestamp("last_battery_alert_sent_at", { withTimezone: true, mode: 'date' }),
	lastOfflineAlertSentAt: timestamp("last_offline_alert_sent_at", { withTimezone: true, mode: 'date' }),
	notificationEmail: varchar("notification_email", { length: 255 }),
	notificationsEnabled: boolean("notifications_enabled").default(false),
	monthlyReportConfiguredAt: timestamp("monthly_report_configured_at", { withTimezone: true, mode: 'date' }),
	lastMonthlyReportSentAt: timestamp("last_monthly_report_sent_at", { withTimezone: true, mode: 'date' }),
}, (table) => [
	pgPolicy("Deny all public access", { as: "permissive", for: "all", to: ["public"], using: sql`false` }),
]);
