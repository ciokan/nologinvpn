CREATE TYPE "public"."protocol" AS ENUM('wireguard', 'amnezia');--> statement-breakpoint
ALTER TABLE "devices" ADD COLUMN "protocol" "protocol" DEFAULT 'wireguard' NOT NULL;--> statement-breakpoint
ALTER TABLE "nodes" ADD COLUMN "protocol" "protocol" DEFAULT 'wireguard' NOT NULL;--> statement-breakpoint
ALTER TABLE "nodes" ADD COLUMN "amnezia_params" json;