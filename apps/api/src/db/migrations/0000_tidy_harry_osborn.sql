CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"activity_type" varchar(100) NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone,
	"location" varchar(255),
	"capacity" integer,
	"participant_count" integer DEFAULT 0 NOT NULL,
	"requires_golfbox_reservation" boolean DEFAULT false NOT NULL,
	"golfbox_reservation_completed" boolean DEFAULT false NOT NULL,
	"golfbox_reservation_note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
