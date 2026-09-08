CREATE TABLE `admins` (
	`id` text PRIMARY KEY NOT NULL,
	`external_user_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'ADMIN' NOT NULL,
	`enabled` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_admins_external_user_id` ON `admins` (`external_user_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `idx_admins_email` ON `admins` (`email`);--> statement-breakpoint
CREATE TABLE `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`admin_user_id` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_audit_events_entity` ON `audit_events` (`entity_type`,`entity_id`);--> statement-breakpoint
CREATE TABLE `buyer_requests` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`preferred_brand` text,
	`preferred_model` text,
	`vehicle_type` text,
	`min_budget` integer,
	`max_budget` integer,
	`currency` text DEFAULT 'USD' NOT NULL,
	`min_year` integer,
	`max_mileage` integer,
	`fuel` text,
	`transmission` text,
	`department` text,
	`nationwide` integer DEFAULT true NOT NULL,
	`comments` text,
	`status` text DEFAULT 'NUEVA' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_buyer_requests_status_created` ON `buyer_requests` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `inquiries` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`vehicle_id` text,
	`reason` text NOT NULL,
	`message` text NOT NULL,
	`offer_amount` integer,
	`currency` text DEFAULT 'USD' NOT NULL,
	`status` text DEFAULT 'NUEVA' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_inquiries_status_created` ON `inquiries` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_inquiries_vehicle` ON `inquiries` (`vehicle_id`);--> statement-breakpoint
CREATE TABLE `rate_limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 1 NOT NULL,
	`expires_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `seller_request_images` (
	`id` text PRIMARY KEY NOT NULL,
	`request_id` text NOT NULL,
	`object_key` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`position` integer NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_seller_request_images_request` ON `seller_request_images` (`request_id`,`position`);--> statement-breakpoint
CREATE TABLE `seller_requests` (
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
	`status` text DEFAULT 'NUEVA' NOT NULL,
	`terms_version` text NOT NULL,
	`terms_accepted_at` text NOT NULL,
	`converted_vehicle_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_seller_requests_status_created` ON `seller_requests` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `vehicle_images` (
	`id` text PRIMARY KEY NOT NULL,
	`vehicle_id` text NOT NULL,
	`object_key` text NOT NULL,
	`content_type` text NOT NULL,
	`size` integer NOT NULL,
	`position` integer DEFAULT 0 NOT NULL,
	`alt` text,
	`is_primary` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `idx_vehicle_images_vehicle_position` ON `vehicle_images` (`vehicle_id`,`position`);--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`brand` text NOT NULL,
	`model` text NOT NULL,
	`version` text,
	`year` integer NOT NULL,
	`price` integer,
	`currency` text DEFAULT 'USD' NOT NULL,
	`mileage` integer NOT NULL,
	`fuel` text NOT NULL,
	`transmission` text NOT NULL,
	`engine` text,
	`department` text NOT NULL,
	`city` text NOT NULL,
	`color` text,
	`doors` integer,
	`condition` text,
	`description` text NOT NULL,
	`equipment` text,
	`additional_info` text,
	`status` text DEFAULT 'BORRADOR' NOT NULL,
	`seller_request_id` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `idx_vehicles_slug` ON `vehicles` (`slug`);--> statement-breakpoint
CREATE INDEX `idx_vehicles_status_created` ON `vehicles` (`status`,`created_at`);--> statement-breakpoint
CREATE INDEX `idx_vehicles_brand_year` ON `vehicles` (`brand`,`year`);