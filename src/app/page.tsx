import React from "react";
import { db } from "@/db";
import { appointments, services, stylists } from "@/db/schema";
import { ensureDatabaseReady } from "@/db/seed";
import { asc, count, desc } from "drizzle-orm";
import { SalonExperience } from "@/components/SalonExperience";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await ensureDatabaseReady();

  const [serviceList, stylistList, recentAppointments, apptCountRows] =
    await Promise.all([
      db.select().from(services).orderBy(asc(services.id)),
      db.select().from(stylists).orderBy(asc(stylists.id)),
      db.select().from(appointments).orderBy(desc(appointments.id)).limit(12),
      db.select({ value: count() }).from(appointments),
    ]);

  const totalConfirmedCount = 1480 + (apptCountRows[0]?.value ?? 0);

  return (
    <SalonExperience
      initialServices={serviceList}
      initialStylists={stylistList}
      initialAppointments={recentAppointments}
      initialTotalCount={totalConfirmedCount}
    />
  );
}
