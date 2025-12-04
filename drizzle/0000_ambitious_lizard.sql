CREATE TABLE "vps_machines" (
	"id" serial PRIMARY KEY NOT NULL,
	"vps_ip" varchar(100) NOT NULL,
	"vps_name" varchar(100) NOT NULL,
	"vps_password" text NOT NULL,
	"ssh_key" text,
	"expiry_date" timestamp NOT NULL,
	"added_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
