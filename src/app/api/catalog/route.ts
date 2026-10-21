import { NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, services, stylists } from "@/db/schema";
import { ensureDatabaseReady } from "@/db/seed";
import { asc, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await ensureDatabaseReady();

    const [serviceList, stylistList, totalCountResult] = await Promise.all([
      db.select().from(services).orderBy(asc(services.id)),
      db.select().from(stylists).orderBy(asc(stylists.id)),
      db.select({ value: count() }).from(appointments),
    ]);

    return NextResponse.json({
      services: serviceList,
      stylists: stylistList,
      stats: {
        totalAppointments: 1480 + (totalCountResult[0]?.value ?? 0),
        clientSatisfaction: "99.8%",
        yearsInJuarez: 8,
      },
    });
  } catch (error) {
    console.error("Error loading salon catalog:", error);
    return NextResponse.json(
      { error: "No fue posible cargar el catálogo del salón." },
      { status: 500 }
    );
  }
}
