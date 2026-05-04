import { pgTable, unique, pgPolicy, check, uuid, text, timestamp, foreignKey, index, bigserial, numeric, integer, boolean, varchar } from "drizzle-orm/pg-core"
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
	temperature: numeric().notNull(),
	humidity: numeric().notNull(),
	co2: integer().notNull(),
	presence: boolean().default(false),
	estadoId: integer("estado_id").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`),
}, (table) => [
	index("idx_measurements_dev_eui_time").using("btree", table.devEui.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsFirst().op("text_ops")),
	index("idx_measurements_time").using("btree", table.createdAt.desc().nullsFirst().op("timestamptz_ops")),
	index("idx_measurements_presence").using("btree", table.devEui.asc().nullsLast().op("text_ops"), table.createdAt.desc().nullsFirst().op("text_ops")).where(sql`presence = true`),
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

export const devices = pgTable("devices", {
	devEui: text("dev_eui").primaryKey().notNull(),
	deviceId: text("device_id").notNull(),
	name: text(),
	battery: integer().default(100),
	rssi: integer().default(sql`'-100'`),
	latitude: numeric(),
	longitude: numeric(),
	gatewayId: text("gateway_id"),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'date' }).default(sql`CURRENT_TIMESTAMP`),
	snr: numeric().default('0'),
	temperature: numeric(),
	humidity: numeric(),
	co2: numeric(),
	estadoId: integer("estado_id"),
	presence: boolean(),
	lastMeasuredAt: timestamp("last_measured_at", { withTimezone: true, mode: 'date' }),
}, (table) => [
	pgPolicy("Deny all public access", { as: "permissive", for: "all", to: ["public"], using: sql`false` }),
]);
