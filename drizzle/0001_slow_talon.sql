PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_seller_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`department` text NOT NULL,
	`city` text NOT NULL,
	`brand` text NOT NULL,
	`model` text NOT NULL,
	`version` text,
	`year` integer NOT NULL,
	`mileage` integer NOT NULL,
	`fuel` text NOT NULL,
	`transmission` text NOT NULL,
	`engine` text,
	`color` text,
	`doors` integer,
	`asking_price` integer,
	`currency` text DEFAULT 'USD' NOT NULL,
	`condition` text NOT NULL,
	`description` text NOT NULL,
	`registration` text,
	`registry_number` text,
	`is_owner` text NOT NULL,
	`debt_status` text NOT NULL,
	`lien_status` text NOT NULL,
	`accepts_trade_in` text NOT NULL,
	`minimum_price` integer,
	`visit_zone` text NOT NULL,
	`status` text DEFAULT 'PENDIENTE' NOT NULL,
	`terms_version` text NOT NULL,
	`terms_accepted_at` text NOT NULL,
	`converted_vehicle_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_seller_requests`("id", "name", "phone", "email", "department", "city", "brand", "model", "version", "year", "mileage", "fuel", "transmission", "engine", "color", "doors", "asking_price", "currency", "condition", "description", "registration", "registry_number", "is_owner", "debt_status", "lien_status", "accepts_trade_in", "minimum_price", "visit_zone", "status", "terms_version", "terms_accepted_at", "converted_vehicle_id", "created_at", "updated_at") SELECT "id", "name", "phone", "email", "department", "city", "brand", "model", "version", "year", "mileage", "fuel", "transmission", "engine", "color", "doors", "asking_price", "currency", "condition", "description", NULL, NULL, 'unknown', 'unknown', 'unknown', 'unknown', NULL, "department" || CASE WHEN "city" <> '' THEN ' · ' || "city" ELSE '' END, CASE "status" WHEN 'NUEVA' THEN 'PENDIENTE' WHEN 'CONTACTADO' THEN 'EN_REVISION' WHEN 'ACEPTADO' THEN 'ACEPTADA' WHEN 'RECHAZADO' THEN 'RECHAZADA' ELSE "status" END, "terms_version", "terms_accepted_at", "converted_vehicle_id", "created_at", "updated_at" FROM `seller_requests`;--> statement-breakpoint
DROP TABLE `seller_requests`;--> statement-breakpoint
ALTER TABLE `__new_seller_requests` RENAME TO `seller_requests`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `idx_seller_requests_status_created` ON `seller_requests` (`status`,`created_at`);--> statement-breakpoint
ALTER TABLE `buyer_requests` ADD `payment_method` text DEFAULT 'undecided' NOT NULL;--> statement-breakpoint
ALTER TABLE `buyer_requests` ADD `has_trade_in` text DEFAULT 'no' NOT NULL;--> statement-breakpoint
ALTER TABLE `buyer_requests` ADD `purchase_timeline` text DEFAULT 'evaluating' NOT NULL;--> statement-breakpoint
ALTER TABLE `buyer_requests` ADD `priorities` text;--> statement-breakpoint
ALTER TABLE `vehicles` ADD `review_notes` text;--> statement-breakpoint
CREATE UNIQUE INDEX `idx_vehicles_seller_request_id` ON `vehicles` (`seller_request_id`);
