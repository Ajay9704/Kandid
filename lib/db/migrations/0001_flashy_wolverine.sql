CREATE TABLE `activity_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text,
	`campaign_id` text,
	`activity_type` text NOT NULL,
	`description` text NOT NULL,
	`metadata` text,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `campaign_sequences` (
	`id` text PRIMARY KEY NOT NULL,
	`campaign_id` text NOT NULL,
	`step_number` integer NOT NULL,
	`step_type` text NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`delay_days` integer DEFAULT 0,
	`is_active` integer DEFAULT true,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `linkedin_accounts` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`linkedin_url` text NOT NULL,
	`is_active` integer DEFAULT true,
	`daily_limit` integer DEFAULT 50,
	`weekly_limit` integer DEFAULT 200,
	`current_daily_count` integer DEFAULT 0,
	`current_weekly_count` integer DEFAULT 0,
	`last_reset_date` integer,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`lead_id` text NOT NULL,
	`campaign_id` text,
	`sequence_step_id` text,
	`message_type` text NOT NULL,
	`subject` text,
	`content` text NOT NULL,
	`status` text DEFAULT 'draft',
	`sent_at` integer,
	`read_at` integer,
	`replied_at` integer,
	`user_id` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`lead_id`) REFERENCES `leads`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`campaign_id`) REFERENCES `campaigns`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`sequence_step_id`) REFERENCES `campaign_sequences`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
ALTER TABLE `leads` ADD `position` text;--> statement-breakpoint
ALTER TABLE `leads` ADD `linkedin_url` text;--> statement-breakpoint
ALTER TABLE `leads` ADD `profile_image` text;--> statement-breakpoint
ALTER TABLE `leads` ADD `location` text;--> statement-breakpoint
ALTER TABLE `leads` ADD `connection_status` text DEFAULT 'not_connected';--> statement-breakpoint
ALTER TABLE `leads` ADD `sequence_step` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `leads` ADD `last_activity` text;--> statement-breakpoint
ALTER TABLE `leads` ADD `last_activity_date` integer;