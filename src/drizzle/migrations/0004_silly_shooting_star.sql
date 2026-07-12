CREATE TABLE `pages` (
	`id` text PRIMARY KEY NOT NULL,
	`section_id` text,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`content` text,
	`meta_title` text,
	`meta_description` text,
	`is_published` integer DEFAULT false NOT NULL,
	`is_home` integer DEFAULT false NOT NULL,
	`published_at` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`deleted_at` text,
	FOREIGN KEY (`section_id`) REFERENCES `sections`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `sections` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`content` text,
	`meta_title` text,
	`meta_description` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sections_slug_unique` ON `sections` (`slug`);