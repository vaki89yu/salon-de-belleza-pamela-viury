import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  includes: text("includes").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  priceMxn: integer("price_mxn").notNull(),
  imageUrl: text("image_url").notNull(),
  featured: boolean("featured").default(false).notNull(),
});

export const stylists = pgTable("stylists", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  specialty: text("specialty").notNull(),
  experienceYears: integer("experience_years").notNull(),
  bio: text("bio").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  instagramHandle: text("instagram_handle").notNull(),
  rating: text("rating").notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  folio: text("folio").notNull().unique(),
  verificationCode: text("verification_code").notNull(),
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone").notNull(),
  clientEmail: text("client_email").notNull(),
  serviceId: integer("service_id").notNull(),
  serviceName: text("service_name").notNull(),
  category: text("category").notNull(),
  stylistId: integer("stylist_id").notNull(),
  stylistName: text("stylist_name").notNull(),
  appointmentDate: text("appointment_date").notNull(),
  appointmentTime: text("appointment_time").notNull(),
  durationMinutes: integer("duration_minutes").notNull(),
  priceMxn: integer("price_mxn").notNull(),
  beveragePreference: text("beverage_preference").notNull(),
  notes: text("notes").default("").notNull(),
  status: text("status").default("confirmada").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type ServiceRecord = typeof services.$inferSelect;
export type StylistRecord = typeof stylists.$inferSelect;
export type AppointmentRecord = typeof appointments.$inferSelect;
