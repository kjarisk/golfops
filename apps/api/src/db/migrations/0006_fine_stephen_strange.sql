ALTER TABLE "activities" ADD COLUMN "external_id" varchar(255);--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_external_id_unique" UNIQUE("external_id");