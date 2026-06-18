ALTER TABLE "activities" ADD COLUMN "source" varchar(20) DEFAULT 'manual' NOT NULL;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "acuity_id" integer;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "acuity_type_id" integer;--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "acuity_calendar" varchar(255);--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "client_name" varchar(255);--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "client_email" varchar(255);--> statement-breakpoint
ALTER TABLE "activities" ADD COLUMN "client_phone" varchar(50);--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_acuity_id_unique" UNIQUE("acuity_id");