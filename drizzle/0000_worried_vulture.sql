CREATE TABLE `leads` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`contact` text NOT NULL,
	`sex` text NOT NULL,
	`age` integer NOT NULL,
	`weight` real NOT NULL,
	`height` real NOT NULL,
	`activity` real NOT NULL,
	`goal` text NOT NULL,
	`bmr` integer NOT NULL,
	`tdee` integer NOT NULL,
	`calorie_target` integer NOT NULL,
	`consented_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
