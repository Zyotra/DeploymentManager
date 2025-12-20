import { integer, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const vpsMachines = pgTable("vps_machines", {
    id: serial("id").primaryKey(),
    vps_ip: varchar("vps_ip", { length: 100 }).notNull(),
    vps_name: varchar("vps_name", { length: 100 }).notNull(),
    vps_password: text("vps_password").notNull(),
    ownerId: integer("ownerId").notNull(),
    ssh_key: text("ssh_key"),
    ram: integer("ram").notNull(),
    storage: integer("storage").notNull(),
    cpu_cores: integer("cpu_cores").notNull(),
    expiryDate: timestamp("expiry_date").notNull(),
    added_at: timestamp("added_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull()
})

export const userDomains=pgTable("user_domains",{
    id:serial("id").primaryKey(),
    domain_address:varchar("domain_address",{length:255}).notNull(),
    vps_ip:varchar("vps_ip",{length:100}).notNull(),
    ownerId:integer("owner").notNull(),
    isDeployed:integer("is_deployed").default(0).notNull(),
    added_at: timestamp("added_at").defaultNow().notNull()
});

export const githubAuths=pgTable("github_auths",{
    id:serial("id").primaryKey(),
    vpsId:integer("vps_id").notNull(),
    github_username:varchar("github_username",{length:100}).notNull(),
    added_at: timestamp("added_at").defaultNow().notNull()
});