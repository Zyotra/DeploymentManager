import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const vpsMachines = pgTable("vps_machines", {
    id: serial("id").primaryKey(),
    vps_ip: varchar("vps_ip", { length: 100 }).notNull(),
    vps_name: varchar("vps_name", { length: 100 }).notNull(),
    vps_password: text("vps_password").notNull(),
    ownerId: integer("owner").notNull(),
    ssh_key: text("ssh_key"),
    expiryDate: timestamp("expiry_date").notNull(),
    added_at: timestamp("added_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull()
})