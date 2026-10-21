"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QRCode from "qrcode";
import {
  Download,
  CalendarPlus,
  Check,
  Copy,
  X,
  MapPin,
  Clock,
  Sparkles,
  RefreshCw,
  Ban,
  ShieldCheck,
} from "lucide-react";
import type { AppointmentRecord } from "@/db/schema";
import { BrandLogo, OfficialSealBadge } from "@/components/BrandLogo";
import {
  downloadAppointmentFolioPDF,
  downloadCalendarICS,
  downloadHomeCarePDF,
  formatDateSpanish,
  formatMxn,
} from "@/lib/pdfGenerator";

interface FolioTicketModalProps {
  appointment: AppointmentRecord | null;
  onClose: () => void;
  onUpdated: (updated: AppointmentRecord) => void;
}

const AVAILABLE_HOURS = [
  "09:00",
  "10:30",
  "11:00",
  "12:30",
  "13:00",
  "15:00",
  "16:30",
  "17:00",
  "18:30",
];

export function FolioTicketModal({
  appointment,
  onClose,
  onUpdated,
}: FolioTicketModalProps) {
  const [qrUrl, setQrUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [downloadedSuccess, setDownloadedSuccess] = useState(false);

  const [isRescheduling, setIsRescheduling] = useState(false);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [savingUpdate, setSavingUpdate] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    if (!appointment) return;
    setNewDate(appointment.appointmentDate);
    setNewTime(appointment.appointmentTime);
    setIsRescheduling(false);
    setActionError("");
    setDownloadedSuccess(false);

    const payload = `SALON DE BELLEZA PAMELA VIURY - CD. JUAREZ | FOLIO:${appointment.folio} | VERIF:${appointment.verificationCode} | CLIENTA:${appointment.clientName} | FECHA:${appointment.appointmentDate} ${appointment.appointmentTime}`;
    QRCode.toDataURL(payload, {
      width: 180,
      margin: 1,
      color: { dark: "#21171D", light: "#FBF8F3" },
    })
      .then(setQrUrl)
      .catch(() => setQrUrl(""));
  }, [appointment]);

  if (!appointment) return null;

  const handleCopyFolio = async () => {
    try {
      await navigator.clipboard.writeText(appointment.folio);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // Fallback ignored safely
    }
  };

  const handleDownloadPdf = async () => {
    setDownloadingPdf(true);
    try {
      await downloadAppointmentFolioPDF(appointment);
      setDownloadedSuccess(true);
      setTimeout(() => setDownloadedSuccess(false), 3500);
    } finally {
      setDownloadingPdf(false);
    }
  };

  const handleSaveReschedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUpdate(true);
    setActionError("");
    try {
      const res = await fetch(
        `/api/appointments/${encodeURIComponent(appointment.folio)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            appointmentDate: newDate,
            appointmentTime: newTime,
          }),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        setActionError(data.error || "No se pudo reprogramar la cita.");
      } else {
        onUpdated(data.appointment);
        setIsRescheduling(false);
      }
    } catch {
      setActionError("Error de conexión al actualizar el folio.");
    } finally {
      setSavingUpdate(false);
    }
  };

  const handleCancelAppointment = async () => {
    setSavingUpdate(true);
    setActionError("");
    try {
      const res = await fetch(
        `/api/appointments/${encodeURIComponent(appointment.folio)}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "cancelada" }),
        }
      );
      const data = await res.json();
      if (res.ok && data.appointment) {
        onUpdated(data.appointment);
      }
    } catch {
      setActionError("No fue posible cancelar la cita.");
    } finally {
      setSavingUpdate(false);
    }
  };

  const statusColor =
    appointment.status === "cancelada"
      ? "bg-rose-900/15 text-rose-800 border-rose-800/30"
      : appointment.status === "reprogramada"
      ? "bg-amber-900/15 text-amber-900 border-amber-800/30"
      : "bg-[#2E6F54]/15 text-[#2E6F54] border-[#2E6F54]/30";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-[#171016]/75 p-4 backdrop-blur-md overflow-y-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative my-8 w-full max-w-2xl overflow-hidden rounded-3xl border border-[#D5C3AA] bg-[#FBF8F3] shadow-2xl"
        >
          {/* Luxury Dark Header */}
          <div className="relative bg-[#21171D] px-6 py-6 sm:px-8 text-[#FBF8F3]">
            <button
              onClick={onClose}
              aria-label="Cerrar comprobante"
              className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/75 transition hover:border-[#B8915C] hover:text-white cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-wrap items-center justify-between gap-4 pr-10">
              <BrandLogo variant="light" />
              <div className="text-left sm:text-right">
                <p className="text-[11px] font-medium tracking-[0.25em] uppercase text-[#B8915C]">
                  Folio Oficial Verificado
                </p>
                <button
                  onClick={handleCopyFolio}
                  className="mt-1 inline-flex items-center gap-2 font-mono text-xl font-bold tracking-wider text-white hover:text-[#D9C3A3] transition cursor-pointer"
                  title="Copiar número de folio"
                >
                  <span>{appointment.folio}</span>
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <Copy className="h-4 w-4 opacity-70" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Perforated Ticket Cutout Divider */}
          <div className="relative flex items-center justify-between bg-[#F2EADF] px-6 py-3 border-b border-[#E3D6C6]">
            <div className="flex items-center gap-2 text-xs text-[#6B5E53]">
              <ShieldCheck className="h-4 w-4 text-[#9A7440]" />
              <span>
                Sello Criptográfico:{" "}
                <strong className="font-mono text-[#21171D]">
                  {appointment.verificationCode}
                </strong>
              </span>
            </div>
            <span
              className={`rounded-full border px-3 py-0.5 text-[11px] font-semibold tracking-widest uppercase ${statusColor}`}
            >
              Cita {appointment.status}
            </span>
          </div>

          {/* Ticket Main Body */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 rounded-2xl border border-[#E5DDD3] bg-white p-5">
              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#9A7440]">
                  Clienta Titular
                </p>
                <p className="mt-1 font-serif text-xl font-semibold text-[#21171D]">
                  {appointment.clientName}
                </p>
                <p className="mt-0.5 text-sm text-[#6B5E53]">
                  Tel. {appointment.clientPhone}
                </p>
                <p className="text-xs text-[#8C7E72]">{appointment.clientEmail}</p>
              </div>

              <div>
                <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#9A7440]">
                  Fecha y Horario (Cd. Juárez)
                </p>
                <p className="mt-1 font-serif text-lg font-semibold capitalize text-[#21171D]">
                  {formatDateSpanish(appointment.appointmentDate)}
                </p>
                <p className="mt-1 inline-flex items-center gap-1.5 font-mono text-sm font-semibold text-[#21171D]">
                  <Clock className="h-4 w-4 text-[#B8915C]" />
                  {appointment.appointmentTime} HRS ({appointment.durationMinutes}{" "}
                  min)
                </p>
              </div>
            </div>

            {/* Service Details & Investment */}
            <div className="rounded-2xl border border-[#E5DDD3] bg-white p-5 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-[#9A7440]">
                    {appointment.category}
                  </span>
                  <h4 className="font-serif text-xl font-semibold text-[#21171D]">
                    {appointment.serviceName}
                  </h4>
                  <p className="text-sm text-[#6B5E53]">
                    Especialista asignada:{" "}
                    <strong className="text-[#21171D]">
                      {appointment.stylistName}
                    </strong>
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-[11px] uppercase tracking-widest text-[#8C7E72]">
                    Inversión Total
                  </span>
                  <p className="font-mono text-2xl font-bold text-[#21171D]">
                    {formatMxn(appointment.priceMxn)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#F0EAE2] pt-3 text-xs text-[#6B5E53]">
                <span className="inline-flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-[#B8915C]" />
                  Cortesía Barra Pamela Viury:{" "}
                  <strong className="text-[#21171D]">
                    {appointment.beveragePreference}
                  </strong>
                </span>
                <span className="inline-flex items-center gap-1 text-[#9A7440] font-medium">
                  <MapPin className="h-3.5 w-3.5" />
                  Blvd. Tomás Fernández 8245, Campos Elíseos
                </span>
              </div>
            </div>

            {/* QR Code + Official Seal Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 rounded-2xl bg-[#F4EDE4] p-4 border border-[#E5D9C8]">
              <div className="flex items-center gap-4">
                {qrUrl && (
                  <img
                    src={qrUrl}
                    alt={`Código QR del folio ${appointment.folio}`}
                    className="h-24 w-24 rounded-xl border border-[#D8C7B0] bg-white p-1.5 shadow-xs"
                  />
                )}
                <div className="text-xs text-[#5E5248] space-y-1 max-w-xs">
                  <p className="font-semibold uppercase tracking-wider text-[#21171D]">
                    Pase Digital con Código QR
                  </p>
                  <p>
                    Descarga tu comprobante oficial en PDF con logotipo, sello
                    digital y código QR para recepción y valet parking gratuito.
                  </p>
                </div>
              </div>

              <OfficialSealBadge className="shrink-0" />
            </div>

            {/* Pamela Viury Experience Route — visual 4-act journey */}
            <div className="rounded-2xl border border-[#E7D8E1] bg-[#21171D] p-5 text-[#FBF8F3]">
              <p className="text-[10px] font-bold tracking-[0.26em] uppercase text-[#E3C99B]">
                Tu visita en 4 actos · Pamela Viury
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["I", "Bienvenida", "QR + cortesía"],
                  ["II", "Diagnóstico", "Diseño a medida"],
                  ["III", "Atención Signature", "Técnica profesional"],
                  ["IV", "Salida", "Styling editorial"],
                ].map(([roman, title, body]) => (
                  <div
                    key={roman}
                    className="rounded-xl border border-white/12 bg-white/[0.055] p-3 text-center"
                  >
                    <span className="font-display mx-auto flex h-8 w-8 items-center justify-center rounded-full border border-[#E3C99B]/70 text-sm text-[#E3C99B]">
                      {roman}
                    </span>
                    <p className="font-serif mt-2 text-base font-semibold">
                      {title}
                    </p>
                    <p className="text-[10px] text-[#CDBFCE]">{body}</p>
                  </div>
                ))}
              </div>
              <p className="font-script mt-4 text-center text-3xl text-[#E3C99B]">
                Pamela Viury
              </p>
            </div>

            {actionError && (
              <div className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {actionError}
              </div>
            )}

            {/* Inline Reschedule Drawer */}
            {isRescheduling && (
              <form
                onSubmit={handleSaveReschedule}
                className="rounded-2xl border border-[#B8915C] bg-white p-5 space-y-4"
              >
                <p className="font-serif text-lg font-semibold text-[#21171D]">
                  Reprogramar Fecha y Horario de este Folio
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E53] mb-1">
                      Nueva Fecha
                    </label>
                    <input
                      type="date"
                      required
                      min={new Date().toISOString().split("T")[0]}
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full rounded-xl border border-[#D8C7B0] px-3.5 py-2.5 text-sm text-[#21171D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#6B5E53] mb-1">
                      Nuevo Horario
                    </label>
                    <select
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      className="w-full rounded-xl border border-[#D8C7B0] px-3.5 py-2.5 text-sm text-[#21171D]"
                    >
                      {AVAILABLE_HOURS.map((hr) => (
                        <option key={hr} value={hr}>
                          {hr} HRS
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsRescheduling(false)}
                    className="rounded-xl border border-[#D8C7B0] px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#6B5E53] cursor-pointer"
                  >
                    Cancelar cambio
                  </button>
                  <button
                    type="submit"
                    disabled={savingUpdate}
                    className="rounded-xl bg-[#21171D] px-5 py-2 text-xs font-semibold uppercase tracking-wider text-[#FBF8F3] hover:bg-[#9A7440] transition cursor-pointer"
                  >
                    {savingUpdate ? "Guardando..." : "Guardar Nuevo Horario"}
                  </button>
                </div>
              </form>
            )}

            {/* Primary Download & Management Actions */}
            <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3 pt-1">
              <button
                onClick={handleDownloadPdf}
                disabled={downloadingPdf}
                className="flex-1 inline-flex items-center justify-center gap-2.5 rounded-full bg-[#21171D] px-6 py-4 text-sm font-semibold tracking-wider uppercase text-[#FBF8F3] shadow-lg transition hover:bg-[#9A7440] cursor-pointer"
              >
                <Download className="h-4 w-4 text-[#D9C3A3]" />
                <span>
                  {downloadingPdf
                    ? "Generando PDF Oficial..."
                    : downloadedSuccess
                    ? "¡Folio Pamela Viury Descargado!"
                    : "Descargar Folio PDF · 2 Páginas"}
                </span>
              </button>

              <button
                onClick={() => downloadCalendarICS(appointment)}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#C9B69E] bg-white px-5 py-4 text-xs font-semibold tracking-wider uppercase text-[#21171D] transition hover:border-[#21171D] cursor-pointer"
              >
                <CalendarPlus className="h-4 w-4 text-[#9A7440]" />
                <span>Calendario .ICS</span>
              </button>

              <button
                onClick={() => downloadHomeCarePDF()}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-[#7A2E43] bg-[#F7EFF2] px-5 py-4 text-xs font-semibold tracking-wider uppercase text-[#7A2E43] transition hover:bg-[#7A2E43] hover:text-white cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Guía de Cuidado PDF</span>
              </button>
            </div>

            {appointment.status !== "cancelada" && (
              <div className="flex items-center justify-between border-t border-[#E6DDD2] pt-4 text-xs">
                <button
                  type="button"
                  onClick={() => setIsRescheduling((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 font-semibold text-[#9A7440] hover:text-[#21171D] transition cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reprogramar fecha u horario</span>
                </button>

                <button
                  type="button"
                  disabled={savingUpdate}
                  onClick={handleCancelAppointment}
                  className="inline-flex items-center gap-1.5 font-medium text-rose-800/80 hover:text-rose-900 transition cursor-pointer"
                >
                  <Ban className="h-3.5 w-3.5" />
                  <span>Cancelar esta cita</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
