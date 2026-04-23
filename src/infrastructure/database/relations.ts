import { relations } from "drizzle-orm/relations";
import { users, auditLogs, devices, measurements } from "./schema";

export const auditLogsRelations = relations(auditLogs, ({one}) => ({
	user: one(users, {
		fields: [auditLogs.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	auditLogs: many(auditLogs),
}));

export const measurementsRelations = relations(measurements, ({one}) => ({
	device: one(devices, {
		fields: [measurements.devEui],
		references: [devices.devEui]
	}),
}));

export const devicesRelations = relations(devices, ({many}) => ({
	measurements: many(measurements),
}));