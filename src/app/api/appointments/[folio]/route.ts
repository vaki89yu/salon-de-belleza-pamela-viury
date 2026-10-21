import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { ensureDatabaseReady } from "@/db/seed";
import { and, eq, ne } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ folio: string }> }
) {
  try {
    await ensureDatabaseReady();
    const { folio } = await context.params;
    const decodedFolio = decodeURIComponent(folio).trim().toUpperCase();

    const [record] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.folio, decodedFolio));

    if (!record) {
      return NextResponse.json(
        { error: "No se encontró ninguna cita con ese número de folio." },
        { status: 404 }
      );
    }

    return NextResponse.json({ appointment: record });
  } catch (error) {
    console.error("GET /api/appointments/[folio] error:", error);
    return NextResponse.json(
      { error: "Error al buscar el folio solicitado." },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ folio: string }> }
) {
  try {
    await ensureDatabaseReady();
    const { folio } = await context.params;
    const decodedFolio = decodeURIComponent(folio).trim().toUpperCase();
    const body = await request.json();

    const [existing] = await db
      .select()
      .from(appointments)
      .where(eq(appointments.folio, decodedFolio));

    if (!existing) {
      return NextResponse.json(
        { error: "El folio indicado no existe." },
        { status: 404 }
      );
    }

    if (body.status === "cancelada") {
      const [cancelled] = await db
        .update(appointments)
        .set({ status: "cancelada" })
        .where(eq(appointments.id, existing.id))
        .returning();

      return NextResponse.json({ appointment: cancelled });
    }

    const nextDate = body.appointmentDate
      ? String(body.appointmentDate).trim()
      : existing.appointmentDate;
    const nextTime = body.appointmentTime
      ? String(body.appointmentTime).trim()
      : existing.appointmentTime;
    const nextNotes =
      body.notes !== undefined ? String(body.notes).trim() : existing.notes;
    const nextBeverage = body.beveragePreference
      ? String(body.beveragePreference).trim()
      : existing.beveragePreference;

    if (
      nextDate !== existing.appointmentDate ||
      nextTime !== existing.appointmentTime
    ) {
      const conflict = await db
        .select()
        .from(appointments)
        .where(
          and(
            eq(appointments.stylistId, existing.stylistId),
            eq(appointments.appointmentDate, nextDate),
            eq(appointments.appointmentTime, nextTime),
            ne(appointments.status, "cancelada"),
            ne(appointments.id, existing.id)
          )
        )
        .limit(1);

      if (conflict.length > 0) {
        return NextResponse.json(
          {
            error: `El horario ${nextTime} del ${nextDate} ya se encuentra ocupado con ${existing.stylistName}.`,
          },
          { status: 409 }
        );
      }
    }

    const [updated] = await db
      .update(appointments)
      .set({
        appointmentDate: nextDate,
        appointmentTime: nextTime,
        notes: nextNotes,
        beveragePreference: nextBeverage,
        status: "reprogramada",
      })
      .where(eq(appointments.id, existing.id))
      .returning();

    return NextResponse.json({ appointment: updated });
  } catch (error) {
    console.error("PATCH /api/appointments/[folio] error:", error);
    return NextResponse.json(
      { error: "No fue posible actualizar el folio." },
      { status: 500 }
    );
  }
}
