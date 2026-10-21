import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appointments, services, stylists } from "@/db/schema";
import { ensureDatabaseReady } from "@/db/seed";
import { and, desc, eq, ne, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

function generateOfficialFolio(existingCount: number): string {
  const suffix = String(1140 + existingCount * 7 + Math.floor(Math.random() * 89))
    .padStart(4, "0")
    .slice(-4);
  return `PV-2026-${suffix}`;
}

function generateVerificationHash(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let block = "";
  for (let i = 0; i < 4; i++) {
    block += chars[Math.floor(Math.random() * chars.length)];
  }
  return `PVJZ-${block}-2026`;
}

export async function GET(request: NextRequest) {
  try {
    await ensureDatabaseReady();
    const { searchParams } = new URL(request.url);

    const date = searchParams.get("date");
    const stylistIdParam = searchParams.get("stylistId");

    if (date && stylistIdParam) {
      const stylistId = Number(stylistIdParam);
      const bookedRows = await db
        .select({
          appointmentTime: appointments.appointmentTime,
          folio: appointments.folio,
        })
        .from(appointments)
        .where(
          and(
            eq(appointments.appointmentDate, date),
            eq(appointments.stylistId, stylistId),
            ne(appointments.status, "cancelada")
          )
        );

      return NextResponse.json({
        bookedSlots: bookedRows.map((row) => row.appointmentTime),
      });
    }

    const rawQuery = (
      searchParams.get("query") ||
      searchParams.get("folio") ||
      searchParams.get("phone") ||
      ""
    ).trim();

    if (rawQuery) {
      const normalizedDigits = rawQuery.replace(/\D/g, "");
      const likePattern = `%${rawQuery.toLowerCase()}%`;

      const results = await db
        .select()
        .from(appointments)
        .where(
          normalizedDigits.length >= 4
            ? sql`(
                LOWER(${appointments.folio}) LIKE ${likePattern}
                OR LOWER(${appointments.clientName}) LIKE ${likePattern}
                OR LOWER(${appointments.clientEmail}) LIKE ${likePattern}
                OR REGEXP_REPLACE(${appointments.clientPhone}, '[^0-9]', '', 'g') LIKE ${`%${normalizedDigits}%`}
              )`
            : sql`(
                LOWER(${appointments.folio}) LIKE ${likePattern}
                OR LOWER(${appointments.clientName}) LIKE ${likePattern}
                OR LOWER(${appointments.clientEmail}) LIKE ${likePattern}
              )`
        )
        .orderBy(desc(appointments.id))
        .limit(20);

      return NextResponse.json({ appointments: results });
    }

    const recent = await db
      .select()
      .from(appointments)
      .orderBy(desc(appointments.id))
      .limit(12);

    return NextResponse.json({ appointments: recent });
  } catch (error) {
    console.error("GET /api/appointments error:", error);
    return NextResponse.json(
      { error: "Error al consultar las citas y folios." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseReady();
    const body = await request.json();

    const clientName = String(body.clientName || "").trim();
    const clientPhone = String(body.clientPhone || "").trim();
    const clientEmail = String(body.clientEmail || "clienta@pamelaviury.mx").trim();
    const serviceId = Number(body.serviceId);
    const stylistId = Number(body.stylistId);
    const appointmentDate = String(body.appointmentDate || "").trim();
    const appointmentTime = String(body.appointmentTime || "").trim();
    const beveragePreference = String(
      body.beveragePreference || "Matcha Latte Helado con Leche de Almendra"
    ).trim();
    const notes = String(body.notes || "").trim();

    if (
      !clientName ||
      !clientPhone ||
      !serviceId ||
      !stylistId ||
      !appointmentDate ||
      !appointmentTime
    ) {
      return NextResponse.json(
        { error: "Por favor completa todos los datos obligatorios para generar tu folio." },
        { status: 400 }
      );
    }

    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, serviceId));
    const [stylist] = await db
      .select()
      .from(stylists)
      .where(eq(stylists.id, stylistId));

    if (!service || !stylist) {
      return NextResponse.json(
        { error: "El servicio o la especialista seleccionada no es válida." },
        { status: 404 }
      );
    }

    const conflict = await db
      .select()
      .from(appointments)
      .where(
        and(
          eq(appointments.stylistId, stylistId),
          eq(appointments.appointmentDate, appointmentDate),
          eq(appointments.appointmentTime, appointmentTime),
          ne(appointments.status, "cancelada")
        )
      )
      .limit(1);

    if (conflict.length > 0) {
      return NextResponse.json(
        {
          error: `El horario ${appointmentTime} con ${stylist.name} acaba de ser reservado. Por favor elige otro horario disponible.`,
        },
        { status: 409 }
      );
    }

    const allExisting = await db
      .select({ id: appointments.id })
      .from(appointments);

    let folio = generateOfficialFolio(allExisting.length + 1);
    const existingFolio = await db
      .select({ id: appointments.id })
      .from(appointments)
      .where(eq(appointments.folio, folio));

    if (existingFolio.length > 0) {
      folio = `PV-2026-${Math.floor(2000 + Math.random() * 7999)}`;
    }

    const verificationCode = generateVerificationHash();

    const [created] = await db
      .insert(appointments)
      .values({
        folio,
        verificationCode,
        clientName,
        clientPhone,
        clientEmail: clientEmail || "clienta@pamelaviury.mx",
        serviceId: service.id,
        serviceName: service.name,
        category: service.category,
        stylistId: stylist.id,
        stylistName: stylist.name,
        appointmentDate,
        appointmentTime,
        durationMinutes: service.durationMinutes,
        priceMxn: service.priceMxn,
        beveragePreference,
        notes,
        status: "confirmada",
      })
      .returning();

    return NextResponse.json({ appointment: created }, { status: 201 });
  } catch (error) {
    console.error("POST /api/appointments error:", error);
    return NextResponse.json(
      { error: "No fue posible registrar tu cita en este momento." },
      { status: 500 }
    );
  }
}
