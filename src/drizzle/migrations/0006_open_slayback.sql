PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_page_blocks` (
	`id` text PRIMARY KEY NOT NULL,
	`page_id` text NOT NULL,
	`parent_id` text,
	`block_type` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`config` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`page_id`) REFERENCES `pages`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_id`) REFERENCES `page_blocks`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_page_blocks`("id", "page_id", "parent_id", "block_type", "sort_order", "config", "created_at", "updated_at") SELECT "id", "page_id", "parent_id", "block_type", "sort_order", "config", "created_at", "updated_at" FROM `page_blocks`;--> statement-breakpoint
DROP TABLE `page_blocks`;--> statement-breakpoint
ALTER TABLE `__new_page_blocks` RENAME TO `page_blocks`;--> statement-breakpoint
PRAGMA foreign_keys=ON;