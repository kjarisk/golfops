CREATE TABLE "activity_trainers" (
	"activity_id" integer NOT NULL,
	"trainer_id" integer NOT NULL,
	CONSTRAINT "activity_trainers_activity_id_trainer_id_pk" PRIMARY KEY("activity_id","trainer_id")
);
--> statement-breakpoint
CREATE TABLE "trainers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255),
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "activity_trainers" ADD CONSTRAINT "activity_trainers_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "activity_trainers" ADD CONSTRAINT "activity_trainers_trainer_id_trainers_id_fk" FOREIGN KEY ("trainer_id") REFERENCES "public"."trainers"("id") ON DELETE cascade ON UPDATE no action;