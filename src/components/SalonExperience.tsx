"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FileText,
  Download,
  Calendar,
  Clock,
  Sparkles,
  Search,
  MapPin,
  Phone,
  Star,
  CheckCircle2,
  ArrowUpRight,
  QrCode,
  ShieldCheck,
  Award,
  Coffee,
  Car,
  Menu,
  X,
  Copy,
  Check,
} from "lucide-react";
import type {
  AppointmentRecord,
  ServiceRecord,
  StylistRecord,
} from "@/db/schema";
import { BrandLogo, OfficialSealBadge } from "@/components/BrandLogo";
import { FolioTicketModal } from "@/components/FolioTicketModal";
import {
  PamelaDownloadsCentre,
  PamelaEditorialGallery,
  PamelaFaq,
  PamelaManifesto,
  PamelaPackages,
  PamelaSignatureExperience,
} from "@/components/PamelaViurySections";
import {
  downloadAppointmentFolioPDF,
  downloadSalonMenuPDF,
  formatDateSpanish,
  formatMxn,
} from "@/lib/pdfGenerator";

interface SalonExperienceProps {
  initialServices: ServiceRecord[];
  initialStylists: StylistRecord[];
  initialAppointments: AppointmentRecord[];
  initialTotalCount: number;
}

const HOURS_SLOTS = [
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

const BEVERAGE_OPTIONS = [
  "Matcha Latte Helado con Leche de Almendra",
  "Mimosa Rosé Sin Alcohol",
  "Capuccino Vainilla Gourmet",
  "Infusión Botánica de Rosas & Lavanda",
  "Café de Olla Artesanal Helado",
  "Agua Mineral Perrier con Cítricos",
];

const MARQUEE_BRANDS = [
  "KÉRASTASE PARIS",
  "OLAPLEX PRO SALON",
  "DIOR BACKSTAGE",
  "DYSON SUPERSONIC PRO",
  "CHARLOTTE TILBURY",
  "BIAB JAPÓN COUTURE",
  "NATURA BISSÉ",
  "CAMPOS ELÍSEOS · CD. JUÁREZ",
];

const LOOKBOOK_ITEMS = [
  {
    num: "01",
    title: "Balayage Miel & Seda",
    subtitle: "Iluminación orgánica sin daño",
    image: "/images/service-balayage.jpg",
  },
  {
    num: "02",
    title: "Novias Alta Costura",
    subtitle: "Suite privada & maquillaje 16h",
    image: "/images/service-bridal.jpg",
  },
  {
    num: "03",
    title: "Piel de Porcelana HD",
    subtitle: "Acabado luminoso editorial",
    image: "/images/service-makeup.jpg",
  },
  {
    num: "04",
    title: "Manicura Rusa & Oro 24k",
    subtitle: "Precisión estructural BIAB",
    image: "/images/service-nails.jpg",
  },
  {
    num: "05",
    title: "Hidrafacial Cuarzo Rosa",
    subtitle: "Oxigenación profunda de cabina",
    image: "/images/service-facial.jpg",
  },
  {
    num: "06",
    title: "Hospitalidad Lounge Pamela Viury",
    subtitle: "Barra de autor en cortesía",
    image: "/images/salon-lounge.jpg",
  },
];

const TESTIMONIALS = [
  {
    name: "Alejandra Luján Bermúdez",
    zone: "Residencial Campestre · Cd. Juárez",
    service: "Balayage Couture & Diseño de Color",
    quote:
      "El mejor salón en toda Ciudad Juárez. Desde que agendas y descargas tu folio en PDF con código QR hasta que llegas y te reciben con tu matcha helado, todo se siente de nivel internacional.",
  },
  {
    name: "Sofía Terrazas Villalobos",
    zone: "Misión de los Lagos · Cd. Juárez",
    service: "Experiencia Novia Pamela Viury Privé",
    quote:
      "Camila y su equipo me arreglaron para mi boda y mi maquillaje duró intacto hasta las 3 de la mañana pese al clima de Juárez. La atención en suite privada fue inolvidable.",
  },
  {
    name: "Victoria Armendáriz",
    zone: "Coronado / Campos Elíseos · El Paso & Juárez",
    service: "Manicura Rusa & Hidrafacial Diamante",
    quote:
      "Cruzo cada tres semanas desde El Paso exclusivamente para atenderme en Pamela Viury. Su sistema digital de citas y folios es súper puntual y las instalaciones son preciosas.",
  },
];

function getUpcomingDays(countDays = 7) {
  const days: { iso: string; dayName: string; dayNum: string; monthShort: string }[] = [];
  for (let i = 1; i <= countDays; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    days.push({
      iso: `${yyyy}-${mm}-${dd}`,
      dayName: d
        .toLocaleDateString("es-MX", { weekday: "short" })
        .replace(".", ""),
      dayNum: dd,
      monthShort: d
        .toLocaleDateString("es-MX", { month: "short" })
        .replace(".", ""),
    });
  }
  return days;
}

export function SalonExperience({
  initialServices,
  initialStylists,
  initialAppointments,
  initialTotalCount,
}: SalonExperienceProps) {
  const [services] = useState<ServiceRecord[]>(initialServices);
  const [stylists] = useState<StylistRecord[]>(initialStylists);
  const [appointmentsList, setAppointmentsList] =
    useState<AppointmentRecord[]>(initialAppointments);
  const [totalConfirmedCount, setTotalConfirmedCount] =
    useState<number>(initialTotalCount);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("Todos");

  // Booking form state
  const upcomingDays = useMemo(() => getUpcomingDays(7), []);
  const [selectedServiceId, setSelectedServiceId] = useState<number>(
    initialServices[0]?.id ?? 1
  );
  const [selectedStylistId, setSelectedStylistId] = useState<number>(
    initialStylists[0]?.id ?? 1
  );
  const [appointmentDate, setAppointmentDate] = useState<string>(
    upcomingDays[0]?.iso ?? ""
  );
  const [appointmentTime, setAppointmentTime] = useState<string>("11:00");
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [clientName, setClientName] = useState<string>("");
  const [clientPhone, setClientPhone] = useState<string>("");
  const [clientEmail, setClientEmail] = useState<string>("");
  const [beveragePreference, setBeveragePreference] = useState<string>(
    BEVERAGE_OPTIONS[0]
  );
  const [notes, setNotes] = useState<string>("");
  const [submittingBooking, setSubmittingBooking] = useState<boolean>(false);
  const [bookingError, setBookingError] = useState<string>("");
  const [justBookedBanner, setJustBookedBanner] =
    useState<AppointmentRecord | null>(null);

  // Folio Lookup & PDF Center state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchingFolios, setSearchingFolios] = useState<boolean>(false);
  const [downloadingFolioId, setDownloadingFolioId] = useState<number | null>(
    null
  );
  const [activeModalAppointment, setActiveModalAppointment] =
    useState<AppointmentRecord | null>(null);
  const [addressCopied, setAddressCopied] = useState(false);

  const categories = useMemo(
    () => [
      "Todos",
      "Cabello & Color",
      "Maquillaje & Novias",
      "Uñas & Nail Couture",
      "Spa Facial & Cejas",
    ],
    []
  );

  const filteredServices = useMemo(() => {
    if (selectedCategory === "Todos") return services;
    return services.filter((item) => item.category === selectedCategory);
  }, [services, selectedCategory]);

  const currentService = useMemo(
    () =>
      services.find((s) => s.id === selectedServiceId) || services[0] || null,
    [services, selectedServiceId]
  );

  const currentStylist = useMemo(
    () =>
      stylists.find((s) => s.id === selectedStylistId) || stylists[0] || null,
    [stylists, selectedStylistId]
  );

  // Live check occupied slots whenever date or stylist changes
  useEffect(() => {
    if (!appointmentDate || !selectedStylistId) return;
    let active = true;
    fetch(
      `/api/appointments?date=${encodeURIComponent(
        appointmentDate
      )}&stylistId=${selectedStylistId}`
    )
      .then((res) => res.json())
      .then((data) => {
        if (!active) return;
        const slots: string[] = Array.isArray(data.bookedSlots)
          ? data.bookedSlots
          : [];
        setBookedSlots(slots);
        if (slots.includes(appointmentTime)) {
          const firstFree = HOURS_SLOTS.find((h) => !slots.includes(h));
          if (firstFree) setAppointmentTime(firstFree);
        }
      })
      .catch(() => {
        if (active) setBookedSlots([]);
      });
    return () => {
      active = false;
    };
  }, [appointmentDate, selectedStylistId]);

  const handleSelectServiceAndScroll = (serviceId: number) => {
    setSelectedServiceId(serviceId);
    const el = document.getElementById("agendar");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleSelectStylistAndScroll = (stylistId: number) => {
    setSelectedStylistId(stylistId);
    const el = document.getElementById("agendar");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError("");

    if (!clientName.trim() || !clientPhone.trim()) {
      setBookingError(
        "Por favor ingresa tu nombre completo y teléfono WhatsApp para emitir tu folio oficial."
      );
      return;
    }

    setSubmittingBooking(true);
    try {
      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: clientName.trim(),
          clientPhone: clientPhone.trim(),
          clientEmail: clientEmail.trim() || "clienta@pamelaviury.mx",
          serviceId: selectedServiceId,
          stylistId: selectedStylistId,
          appointmentDate,
          appointmentTime,
          beveragePreference,
          notes: notes.trim(),
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setBookingError(
          data.error || "Ocurrió un inconveniente al generar tu reservación."
        );
        return;
      }

      const created: AppointmentRecord = data.appointment;
      setAppointmentsList((prev) => [created, ...prev]);
      setTotalConfirmedCount((prev) => prev + 1);
      setBookedSlots((prev) => [...prev, created.appointmentTime]);
      setJustBookedBanner(created);
      setActiveModalAppointment(created);

      // Reset personal fields cleanly so another booking can be made effortlessly
      setClientName("");
      setClientPhone("");
      setClientEmail("");
      setNotes("");
    } catch {
      setBookingError(
        "No se pudo conectar con el servidor. Intenta nuevamente en unos segundos."
      );
    } finally {
      setSubmittingBooking(false);
    }
  };

  const executeFolioSearch = async (queryText: string) => {
    setSearchingFolios(true);
    try {
      const url = queryText.trim()
        ? `/api/appointments?query=${encodeURIComponent(queryText.trim())}`
        : `/api/appointments`;
      const res = await fetch(url);
      const data = await res.json();
      if (Array.isArray(data.appointments)) {
        setAppointmentsList(data.appointments);
      }
    } finally {
      setSearchingFolios(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeFolioSearch(searchQuery);
  };

  const handleQuickDirectPdfDownload = async (item: AppointmentRecord) => {
    setDownloadingFolioId(item.id);
    try {
      await downloadAppointmentFolioPDF(item);
    } finally {
      setTimeout(() => setDownloadingFolioId(null), 600);
    }
  };

  const handleAppointmentUpdated = (updated: AppointmentRecord) => {
    setAppointmentsList((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    setActiveModalAppointment(updated);
  };

  const handleCopyStudioAddress = async () => {
    try {
      await navigator.clipboard.writeText(
        "Blvd. Tomás Fernández 8245, Local 4B, Campos Elíseos, C.P. 32472, Cd. Juárez, Chih."
      );
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2500);
    } catch {
      // Ignore clipboard restriction safely
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF8F3] text-[#21171D] overflow-x-clip">
      {/* Top Cd. Juárez Concierge Ribbon */}
      <div className="bg-[#21171D] text-[#E6D7C3] border-b border-[#B8915C]/25">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 sm:px-8 py-2.5 text-[11px] sm:text-xs tracking-wide">
          <div className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-[#B8915C] shrink-0" />
            <span>
              Blvd. Tomás Fernández 8245, Zona Campos Elíseos ·{" "}
              <strong className="text-white">Cd. Juárez, Chihuahua</strong>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[#D8C5AC]">
            <span>Martes a Sábado · 9:00 AM – 8:00 PM</span>
            <span>•</span>
            <span>Concierge: (656) 688-4920</span>
            <span>•</span>
            <span className="text-[#B8915C] font-semibold">
              Valet Parking en Cortesía
            </span>
          </div>
        </div>
      </div>

      {/* Sticky Architectural Glass Navbar */}
      <header className="sticky top-0 z-40 border-b border-[#E5DDD3]/90 bg-[#FBF8F3]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-8 py-4">
          <a href="#" className="focus:outline-none">
            <BrandLogo variant="dark" />
          </a>

          <nav className="hidden xl:flex items-center gap-6 text-[11px] font-semibold tracking-[0.16em] uppercase text-[#554550]">
            <a href="#la-casa" className="hover:text-[#7A2E43] transition-colors">
              La Casa
            </a>
            <a href="#servicios" className="hover:text-[#7A2E43] transition-colors">
              Servicios
            </a>
            <a href="#paquetes" className="hover:text-[#7A2E43] transition-colors">
              Paquetes
            </a>
            <a href="#experiencia" className="hover:text-[#7A2E43] transition-colors">
              Experiencia
            </a>
            <a href="#especialistas" className="hover:text-[#7A2E43] transition-colors">
              Especialistas
            </a>
            <a
              href="#descargas"
              className="inline-flex items-center gap-1.5 text-[#7A2E43] hover:text-[#21171D] transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Descargas PDF</span>
            </a>
            <a
              href="#folios"
              className="inline-flex items-center gap-1.5 text-[#7A2E43] hover:text-[#21171D] transition-colors"
            >
              <QrCode className="h-3.5 w-3.5" />
              <span>Mi Folio</span>
            </a>
          </nav>

          <div className="hidden sm:flex items-center gap-3">
            <button
              onClick={() => downloadSalonMenuPDF(services, stylists)}
              className="inline-flex items-center gap-2 rounded-full border border-[#C9B69E] bg-white/80 px-4 py-2.5 text-xs font-semibold tracking-wider uppercase text-[#21171D] transition hover:border-[#21171D] cursor-pointer"
              title="Descargar Catálogo Signature Pamela Viury en PDF"
            >
              <FileText className="h-3.5 w-3.5 text-[#7A2E43]" />
              <span>Catálogo PDF</span>
            </button>

            <a
              href="#agendar"
              className="inline-flex items-center gap-2 rounded-full bg-[#21171D] px-5 py-2.5 text-xs font-semibold tracking-wider uppercase text-[#FBF8F3] shadow-sm transition hover:bg-[#9A7440]"
            >
              <Calendar className="h-3.5 w-3.5 text-[#D9C3A3]" />
              <span>Agendar Cita</span>
            </a>
          </div>

          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Abrir menú"
            className="xl:hidden rounded-full border border-[#D8C7B0] p-2.5 text-[#21171D]"
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-[#E5DDD3] bg-[#FBF8F3] px-6 py-5 space-y-4">
            <div className="flex flex-col space-y-3 text-xs font-semibold tracking-[0.18em] uppercase">
              <a
                href="#la-casa"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1"
              >
                La Casa Pamela Viury
              </a>
              <a
                href="#servicios"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1"
              >
                Servicios de Belleza
              </a>
              <a
                href="#paquetes"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1"
              >
                Paquetes Signature
              </a>
              <a
                href="#experiencia"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1"
              >
                Experiencia en 4 Actos
              </a>
              <a
                href="#lookbook"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1"
              >
                Lookbook Editorial
              </a>
              <a
                href="#especialistas"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1"
              >
                Especialistas Cd. Juárez
              </a>
              <a
                href="#descargas"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-[#7A2E43]"
              >
                Centro de Descargas PDF & Regalos
              </a>
              <a
                href="#folios"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-[#9A7440]"
              >
                Descargar Folios & Citas en PDF
              </a>
              <a
                href="#ubicacion"
                onClick={() => setMobileMenuOpen(false)}
                className="py-1"
              >
                Ubicación Campos Elíseos
              </a>
            </div>
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => {
                  downloadSalonMenuPDF(services, stylists);
                  setMobileMenuOpen(false);
                }}
                className="flex-1 rounded-full border border-[#C9B69E] bg-white px-4 py-3 text-xs font-semibold uppercase tracking-wider"
              >
                Descargar Catálogo Signature PDF
              </button>
              <a
                href="#agendar"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center rounded-full bg-[#21171D] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-white"
              >
                Reservar Cita
              </a>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION — Desert Luxury Editorial Atelier */}
      <section className="relative overflow-hidden border-b border-[#E5DDD3] py-14 sm:py-20 lg:py-24">
        {/* Subtle decorative background radial glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 right-0 h-[520px] w-[520px] rounded-full bg-[#E6D5CA]/45 blur-3xl"
        />

        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-10">
            {/* Left Editorial Narrative */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7 space-y-7"
            >
              <div className="inline-flex items-center gap-2.5 rounded-full border border-[#D8C5AC] bg-white/80 px-4 py-1.5 text-[11px] font-semibold tracking-[0.22em] uppercase text-[#7A2E43]">
                <Sparkles className="h-3.5 w-3.5 text-[#B8915C]" />
                <span>Salón de Belleza Pamela Viury · Cd. Juárez, Chih.</span>
              </div>

              <div>
                <p className="font-script text-5xl leading-none text-[#7A2E43] sm:text-6xl">
                  Pamela Viury
                </p>
                <h1 className="font-display mt-3 text-4xl leading-[1.04] tracking-[0.05em] text-[#21171D] uppercase sm:text-6xl lg:text-[4.35rem]">
                  Un espacio dedicado al arte de la{" "}
                  <span className="text-[#8C6A3F]">belleza y la distinción</span>
                </h1>
              </div>

              <p className="max-w-xl text-base sm:text-lg leading-relaxed text-[#675661]">
                Le damos la bienvenida a{" "}
                <strong className="font-semibold text-[#21171D]">
                  Salón de Belleza Pamela Viury
                </strong>
                , en{" "}
                <strong className="font-semibold text-[#21171D]">
                  Zona Campos Elíseos, Ciudad Juárez
                </strong>
                . Ofrecemos colorimetría internacional, arreglo nupcial Privé
                y tratamientos de alta estética con atención personalizada,
                reservación en línea y{" "}
                <strong className="font-semibold text-[#21171D]">
                  folios oficiales PV-2026 descargables en PDF.
                </strong>
              </p>

              {/* Hero CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <a
                  href="#agendar"
                  className="group inline-flex items-center gap-3 rounded-full bg-[#21171D] px-7 py-4 text-xs sm:text-sm font-semibold tracking-[0.16em] uppercase text-[#FBF8F3] shadow-lg transition hover:bg-[#9A7440]"
                >
                  <span>Agendar Cita & Crear Folio</span>
                  <ArrowUpRight className="h-4 w-4 text-[#D9C3A3] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>

                <a
                  href="#descargas"
                  className="inline-flex items-center gap-2.5 rounded-full border border-[#7A2E43] bg-white px-6 py-4 text-xs sm:text-sm font-semibold tracking-[0.14em] uppercase text-[#21171D] transition hover:bg-[#F7EFF2]"
                >
                  <Download className="h-4 w-4 text-[#7A2E43]" />
                  <span>Descargas & Folio PDF</span>
                </a>
              </div>

              {/* Architectural Shimmer Divider */}
              <div className="h-[1px] w-full max-w-xl gold-shimmer-line" />

              {/* Trust Metrics Strip */}
              <div className="grid grid-cols-3 gap-6 max-w-xl pt-1">
                <div>
                  <p className="font-serif text-3xl sm:text-4xl font-semibold text-[#21171D]">
                    +{totalConfirmedCount.toLocaleString("es-MX")}
                  </p>
                  <p className="mt-1 text-xs text-[#6E6055]">
                    Folios digitales emitidos
                  </p>
                </div>
                <div>
                  <p className="font-serif text-3xl sm:text-4xl font-semibold text-[#21171D]">
                    5.0 ★
                  </p>
                  <p className="mt-1 text-xs text-[#6E6055]">
                    Calificación en Cd. Juárez
                  </p>
                </div>
                <div>
                  <p className="font-serif text-3xl sm:text-4xl font-semibold text-[#9A7440]">
                    100%
                  </p>
                  <p className="mt-1 text-xs text-[#6E6055]">
                    Productos originales Pro
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Arched Architectural Frame + Floating Official Stamp & Folio Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5 relative flex justify-center"
            >
              <div className="relative w-full max-w-md">
                {/* Rotating Gold Seal Stamp at top right */}
                <div className="animate-float-seal hidden sm:block absolute -top-8 -right-6 z-20 rounded-full bg-[#FBF8F3]/95 p-1.5 shadow-md border border-[#E5D7C4]">
                  <OfficialSealBadge />
                </div>

                {/* Arch Framed Real Salon Photo */}
                <div className="overflow-hidden rounded-t-[13rem] rounded-b-3xl border-2 border-[#D8C5AC] bg-white p-2.5 shadow-2xl">
                  <div className="overflow-hidden rounded-t-[12.4rem] rounded-b-2xl aspect-[4/5] relative">
                    <img
                      src="/images/hero-salon.jpg"
                      alt="Interior de lujo del Salón de Belleza Pamela Viury en Campos Elíseos, Ciudad Juárez"
                      className="animate-ken-burns h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#21171D]/65 via-transparent to-transparent" />
                    <div className="absolute bottom-5 left-5 right-5 text-[#FBF8F3]">
                      <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#E6CFA8]">
                        Suite Principal · Campos Elíseos
                      </p>
                      <p className="font-serif text-xl italic">
                        La casa de Pamela Viury: calma, luz y detalle
                      </p>
                    </div>
                  </div>
                </div>

                {/* Interactive Floating Mini Folio Card */}
                {appointmentsList[0] && (
                  <motion.button
                    whileHover={{ y: -3 }}
                    onClick={() =>
                      setActiveModalAppointment(appointmentsList[0])
                    }
                    className="mt-4 sm:mt-0 sm:absolute sm:-bottom-6 sm:-left-8 z-20 flex w-full sm:w-auto items-center justify-between gap-4 rounded-2xl border border-[#D5C3AA] bg-white/95 px-4 py-3.5 text-left shadow-xl backdrop-blur-md cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#21171D] text-[#D9C3A3]">
                        <QrCode className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#9A7440]">
                          Ejemplo Folio Real PDF
                        </p>
                        <p className="font-mono text-sm font-bold text-[#21171D]">
                          {appointmentsList[0].folio} · Ver Boleto
                        </p>
                      </div>
                    </div>
                    <Download className="h-4 w-4 text-[#9A7440] shrink-0" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* LUXURY PARTNER MARQUEE RIBBON */}
      <div className="overflow-hidden bg-[#21171D] py-4 border-b border-[#B8915C]/30">
        <div className="animate-marquee-pamela">
          {[...MARQUEE_BRANDS, ...MARQUEE_BRANDS].map((brand, idx) => (
            <div
              key={`${brand}-${idx}`}
              className="mx-8 inline-flex items-center gap-8 text-xs font-medium tracking-[0.28em] uppercase text-[#D9C3A3]"
            >
              <span>{brand}</span>
              <span className="text-[#B8915C]">✦</span>
            </div>
          ))}
        </div>
      </div>

      {/* LA CASA PAMELA VIURY — Founder manifesto */}
      <PamelaManifesto />

      {/* SECTION 01: CARTA DE SERVICIOS DE BELLEZA */}
      <section id="servicios" className="py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] uppercase text-[#9A7440]">
                01 · Carta de Alta Estética 2026
              </p>
              <h2 className="mt-2 font-serif text-4xl sm:text-5xl font-medium text-[#21171D]">
                Servicios Exclusivos de Belleza
              </h2>
            </div>

            <button
              onClick={() => downloadSalonMenuPDF(services, stylists)}
              className="self-start md:self-auto inline-flex items-center gap-2.5 rounded-full border border-[#B8915C] bg-white px-5 py-3 text-xs font-semibold tracking-[0.16em] uppercase text-[#21171D] shadow-xs transition hover:bg-[#21171D] hover:text-white cursor-pointer"
            >
              <Download className="h-4 w-4 text-[#B8915C]" />
              <span>Descargar Catálogo Signature PDF</span>
            </button>
          </div>

          {/* Animated Category Filter Pills */}
          <div className="flex flex-wrap gap-2.5 mb-12">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative rounded-full px-5 py-2.5 text-xs font-semibold tracking-wider uppercase transition cursor-pointer ${
                    active
                      ? "bg-[#21171D] text-[#FBF8F3] shadow-sm"
                      : "border border-[#DDD1C2] bg-white text-[#5C5046] hover:border-[#B8915C]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filteredServices.map((srv, index) => (
              <motion.article
                key={srv.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (index % 4) * 0.07 }}
                className="group flex flex-col sm:flex-row overflow-hidden rounded-3xl border border-[#E3D8CA] bg-white shadow-xs transition-all duration-300 hover:shadow-xl hover:border-[#B8915C]"
              >
                <div className="sm:w-52 shrink-0 overflow-hidden relative aspect-[16/10] sm:aspect-auto">
                  <img
                    src={srv.imageUrl}
                    alt={srv.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 rounded-full bg-[#21171D]/85 px-3 py-1 text-[10px] font-semibold tracking-wider uppercase text-[#E6CFA8] backdrop-blur-xs">
                    {srv.durationMinutes} min
                  </div>
                </div>

                <div className="flex flex-1 flex-col justify-between p-6">
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#9A7440]">
                        {srv.category}
                      </span>
                      <span className="font-mono text-lg font-bold text-[#21171D]">
                        {formatMxn(srv.priceMxn)}
                      </span>
                    </div>

                    <h3 className="mt-1.5 font-serif text-2xl font-semibold text-[#21171D]">
                      {srv.name}
                    </h3>

                    <p className="mt-2 text-sm leading-relaxed text-[#5E5248]">
                      {srv.description}
                    </p>

                    <p className="mt-3 rounded-xl bg-[#FBF8F3] px-3.5 py-2.5 text-xs text-[#6B5E53] border border-[#EFE7DC]">
                      <strong className="text-[#21171D]">Incluye:</strong>{" "}
                      {srv.includes}
                    </p>
                  </div>

                  <div className="mt-5 pt-3 border-t border-[#F1EBE3] flex items-center justify-between">
                    <span className="text-xs text-[#8C7E72]">
                      Folio digital inmediato
                    </span>
                    <button
                      onClick={() => handleSelectServiceAndScroll(srv.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold tracking-[0.15em] uppercase text-[#21171D] group-hover:text-[#9A7440] transition cursor-pointer"
                    >
                      <span>Reservar Servicio</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* PAQUETES SIGNATURE PAMELA VIURY */}
      <PamelaPackages
        services={services}
        onReserveService={handleSelectServiceAndScroll}
      />

      {/* SECTION 02: EDITORIAL LOOKBOOK & BARRA DE HOSPITALIDAD (Dark Luxury Contrast) */}
      <section
        id="lookbook"
        className="bg-[#21171D] py-20 sm:py-24 text-[#FBF8F3] border-y border-[#B8915C]/30"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-14">
            <div>
              <p className="text-xs font-semibold tracking-[0.28em] uppercase text-[#B8915C]">
                02 · Galería Real & Hospitalidad Pamela Viury
              </p>
              <h2 className="mt-2 font-serif text-4xl sm:text-5xl font-medium">
                Resultados que hablan por sí mismos
              </h2>
            </div>
            <p className="max-w-md text-sm text-[#CFC4B8] leading-relaxed">
              Cada visita incluye acceso sin costo a nuestra{" "}
              <span className="text-[#E6CFA8] font-medium">
                Barra Botánica & Café de Autor
              </span>
              , Wi-Fi de alta velocidad y atención personalizada en cabinas
              iluminadas naturalmente.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {LOOKBOOK_ITEMS.map((item, idx) => (
              <motion.div
                key={item.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.06 }}
                className="group relative overflow-hidden rounded-3xl border border-white/15 bg-[#29221E] aspect-[4/4.3]"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-108"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#171016]/90 via-[#171016]/20 to-transparent" />
                <div className="absolute top-4 left-4 rounded-full border border-white/25 bg-black/40 px-3 py-1 font-mono text-xs text-[#E6CFA8] backdrop-blur-xs">
                  {item.num}
                </div>
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-xs uppercase tracking-[0.2em] text-[#D9C3A3]">
                    {item.subtitle}
                  </p>
                  <h3 className="mt-1 font-serif text-2xl font-medium text-white">
                    {item.title}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Luxury Amenities Strip */}
          <div className="mt-14 grid grid-cols-1 sm:grid-cols-3 gap-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-8">
            <div className="flex items-start gap-4">
              <Coffee className="h-6 w-6 text-[#B8915C] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif text-xl font-medium text-white">
                  Barra Gourmet en Cortesía
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-[#CFC4B8]">
                  Matcha latte helado, mimosas rosé sin alcohol, capuccino
                  vainilla e infusiones orgánicas seleccionadas al agendar.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Car className="h-6 w-6 text-[#B8915C] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif text-xl font-medium text-white">
                  Valet Parking Privado
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-[#CFC4B8]">
                  Estacionamiento vigilado y recepción directa en Plaza Campos
                  Elíseos presentando tu folio PDF o código QR.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Award className="h-6 w-6 text-[#B8915C] shrink-0 mt-0.5" />
              <div>
                <h4 className="font-serif text-xl font-medium text-white">
                  Garantía de Satisfacción Total
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-[#CFC4B8]">
                  Diagnóstico previo personalizado y fórmulas hipoalergénicas de
                  grado dermatológico y capilar europeo.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 03: ESPECIALISTAS MASTER EN CD. JUÁREZ */}
      <section
        id="especialistas"
        className="py-20 sm:py-24 border-b border-[#E5DDD3]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <p className="text-xs font-semibold tracking-[0.28em] uppercase text-[#9A7440]">
              03 · Dirección Artística
            </p>
            <h2 className="mt-2 font-serif text-4xl sm:text-5xl font-medium text-[#21171D]">
              Nuestras Especialistas en Cd. Juárez
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#5E5248]">
              Talento certificado internacionalmente dedicado a realzar tu
              esencia con calidez, puntualidad y técnica impecable.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {stylists.map((artist, idx) => (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="flex flex-col justify-between rounded-3xl border border-[#E3D8CA] bg-white p-6 shadow-xs transition hover:shadow-xl"
              >
                <div>
                  <div className="mx-auto w-52 overflow-hidden rounded-t-full border-2 border-[#D8C5AC] p-1.5 bg-[#FBF8F3]">
                    <img
                      src={artist.avatarUrl}
                      alt={artist.name}
                      className="aspect-[3/3.6] w-full rounded-t-full object-cover"
                    />
                  </div>

                  <div className="mt-6 text-center">
                    <div className="inline-flex items-center gap-1 rounded-full bg-[#FBF8F3] px-3 py-1 text-xs font-semibold text-[#9A7440] border border-[#E6DACB]">
                      <Star className="h-3.5 w-3.5 fill-[#B8915C] text-[#B8915C]" />
                      <span>
                        {artist.rating} · {artist.experienceYears} años exp.
                      </span>
                    </div>

                    <h3 className="mt-3 font-serif text-2xl font-semibold text-[#21171D]">
                      {artist.name}
                    </h3>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#9A7440]">
                      {artist.role}
                    </p>
                    <p className="mt-3 text-sm leading-relaxed text-[#5E5248]">
                      {artist.bio}
                    </p>
                    <p className="mt-2 font-mono text-xs text-[#8C7E72]">
                      {artist.instagramHandle}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleSelectStylistAndScroll(artist.id)}
                  className="mt-6 w-full rounded-full border border-[#21171D] py-3 text-xs font-semibold tracking-[0.18em] uppercase text-[#21171D] transition hover:bg-[#21171D] hover:text-white cursor-pointer"
                >
                  Agendar con {artist.name.split(" ")[0]}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* EXPERIENCIA PAMELA VIURY EN 4 ACTOS */}
      <PamelaSignatureExperience />

      {/* EDITORIAL REAL PAMELA VIURY */}
      <PamelaEditorialGallery />

      {/* SECTION 04: AGENDAR CITA EN LÍNEA & GENERAR FOLIO OFICIAL */}
      <section
        id="agendar"
        className="py-20 sm:py-24 bg-[#F4EDE4] border-b border-[#E2D6C5]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="max-w-2xl mb-12">
            <p className="text-xs font-semibold tracking-[0.28em] uppercase text-[#9A7440]">
              04 · Reservación en Tiempo Real
            </p>
            <h2 className="mt-2 font-serif text-4xl sm:text-5xl font-medium text-[#21171D]">
              Agenda tu Cita & Obtén tu Folio Oficial en PDF
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#5E5248]">
              Selecciona tu servicio, especialista y horario disponible en Ciudad
              Juárez. Al confirmar recibirás al instante tu{" "}
              <strong className="text-[#21171D]">
                Folio Oficial Verificado con Código QR y descarga PDF
              </strong>{" "}
              sin pagos anticipados en tarjeta.
            </p>
          </div>

          {/* Celebratory Banner if user just created an appointment */}
          {justBookedBanner && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-3xl border-2 border-[#2E6F54] bg-white p-6 shadow-md"
            >
              <div className="flex items-start gap-3.5">
                <CheckCircle2 className="h-7 w-7 text-[#2E6F54] shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#2E6F54]">
                    ¡Reservación Registrada con Éxito!
                  </p>
                  <p className="font-serif text-xl font-semibold text-[#21171D]">
                    Folio Oficial:{" "}
                    <span className="font-mono">{justBookedBanner.folio}</span>{" "}
                    para {justBookedBanner.clientName}
                  </p>
                  <p className="text-xs text-[#6B5E53]">
                    {formatDateSpanish(justBookedBanner.appointmentDate)} ·{" "}
                    {justBookedBanner.appointmentTime} HRS con{" "}
                    {justBookedBanner.stylistName}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => downloadAppointmentFolioPDF(justBookedBanner)}
                  className="inline-flex items-center gap-2 rounded-full bg-[#21171D] px-5 py-3 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#9A7440] transition cursor-pointer"
                >
                  <Download className="h-4 w-4 text-[#D9C3A3]" />
                  <span>Descargar PDF Ahora</span>
                </button>
                <button
                  onClick={() => setActiveModalAppointment(justBookedBanner)}
                  className="inline-flex items-center gap-2 rounded-full border border-[#21171D] px-4 py-3 text-xs font-semibold uppercase tracking-wider text-[#21171D] cursor-pointer"
                >
                  <QrCode className="h-4 w-4" />
                  <span>Ver Pase QR</span>
                </button>
              </div>
            </motion.div>
          )}

          <form
            onSubmit={handleCreateAppointment}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
          >
            {/* Left 8 Columns: Interactive Steps */}
            <div className="lg:col-span-8 space-y-6 rounded-3xl border border-[#DFD2C0] bg-white p-6 sm:p-8 shadow-sm">
              {/* Step 1: Service Selection */}
              <div>
                <label className="block text-xs font-bold tracking-[0.2em] uppercase text-[#9A7440] mb-3">
                  Paso 1 · Elige tu Servicio
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.map((srv) => {
                    const isSelected = srv.id === selectedServiceId;
                    return (
                      <button
                        type="button"
                        key={srv.id}
                        onClick={() => setSelectedServiceId(srv.id)}
                        className={`text-left rounded-2xl border p-4 transition cursor-pointer ${
                          isSelected
                            ? "border-2 border-[#21171D] bg-[#FBF8F3] shadow-xs"
                            : "border-[#E6DDD2] bg-white hover:border-[#B8915C]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-serif text-lg font-semibold text-[#21171D] leading-snug">
                            {srv.name}
                          </span>
                          <span className="font-mono text-sm font-bold text-[#9A7440] shrink-0">
                            {formatMxn(srv.priceMxn)}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-[#7A6C60]">
                          {srv.category} · {srv.durationMinutes} min
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 2: Specialist Selection */}
              <div className="pt-2 border-t border-[#F0EAE2]">
                <label className="block text-xs font-bold tracking-[0.2em] uppercase text-[#9A7440] mb-3">
                  Paso 2 · Selecciona tu Especialista
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {stylists.map((st) => {
                    const active = st.id === selectedStylistId;
                    return (
                      <button
                        type="button"
                        key={st.id}
                        onClick={() => setSelectedStylistId(st.id)}
                        className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition cursor-pointer ${
                          active
                            ? "border-2 border-[#21171D] bg-[#FBF8F3]"
                            : "border-[#E6DDD2] bg-white hover:border-[#B8915C]"
                        }`}
                      >
                        <img
                          src={st.avatarUrl}
                          alt={st.name}
                          className="h-12 w-12 rounded-full object-cover border border-[#D8C5AC] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-serif text-base font-semibold text-[#21171D] truncate">
                            {st.name}
                          </p>
                          <p className="text-[11px] text-[#7A6C60] truncate">
                            {st.role}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 3: Date & Available Hour Slots */}
              <div className="pt-2 border-t border-[#F0EAE2] space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-bold tracking-[0.2em] uppercase text-[#9A7440]">
                    Paso 3 · Fecha y Horario Disponible (Hora Cd. Juárez)
                  </label>
                  <input
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    aria-label="Seleccionar otra fecha en calendario"
                    className="rounded-xl border border-[#D8C7B0] bg-[#FBF8F3] px-3 py-1.5 text-xs font-semibold text-[#21171D]"
                  />
                </div>

                {/* Quick 7-day pills */}
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                  {upcomingDays.map((d) => {
                    const isPicked = d.iso === appointmentDate;
                    return (
                      <button
                        type="button"
                        key={d.iso}
                        onClick={() => setAppointmentDate(d.iso)}
                        className={`flex flex-col items-center rounded-2xl border py-2.5 px-2 transition cursor-pointer ${
                          isPicked
                            ? "border-[#21171D] bg-[#21171D] text-white"
                            : "border-[#E6DDD2] bg-[#FBF8F3]/60 text-[#21171D] hover:border-[#B8915C]"
                        }`}
                      >
                        <span className="text-[10px] uppercase tracking-wider opacity-80">
                          {d.dayName}
                        </span>
                        <span className="font-mono text-base font-bold mt-0.5">
                          {d.dayNum}
                        </span>
                        <span className="text-[10px] uppercase opacity-75">
                          {d.monthShort}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Time slots grid with live conflict disable */}
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5 pt-1">
                  {HOURS_SLOTS.map((slot) => {
                    const isOccupied = bookedSlots.includes(slot);
                    const isSelected = appointmentTime === slot && !isOccupied;
                    return (
                      <button
                        type="button"
                        key={slot}
                        disabled={isOccupied}
                        onClick={() => setAppointmentTime(slot)}
                        className={`rounded-xl border py-2.5 px-3 font-mono text-xs font-semibold transition ${
                          isOccupied
                            ? "border-[#EAE4DC] bg-[#F5F2EE] text-[#B0A69C] line-through cursor-not-allowed"
                            : isSelected
                            ? "border-[#9A7440] bg-[#9A7440] text-white shadow-xs cursor-pointer"
                            : "border-[#DFD4C7] bg-white text-[#21171D] hover:border-[#21171D] cursor-pointer"
                        }`}
                      >
                        {isOccupied ? `${slot} Ocupado` : `${slot} HRS`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Step 4: Personal Details & Hospitality Beverage */}
              <div className="pt-2 border-t border-[#F0EAE2] space-y-4">
                <label className="block text-xs font-bold tracking-[0.2em] uppercase text-[#9A7440]">
                  Paso 4 · Datos para Emitir tu Folio Oficial
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#4E433B] mb-1.5">
                      Nombre Completo de la Clienta *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Sofía Chávez Luján"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full rounded-xl border border-[#D8C7B0] bg-[#FBF8F3]/50 px-4 py-3 text-sm text-[#21171D] focus:border-[#21171D] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4E433B] mb-1.5">
                      Teléfono / WhatsApp (Cd. Juárez o El Paso) *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="Ej. 656-392-8410"
                      value={clientPhone}
                      onChange={(e) => setClientPhone(e.target.value)}
                      className="w-full rounded-xl border border-[#D8C7B0] bg-[#FBF8F3]/50 px-4 py-3 text-sm text-[#21171D] focus:border-[#21171D] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4E433B] mb-1.5">
                      Correo Electrónico (Opcional)
                    </label>
                    <input
                      type="email"
                      placeholder="sofia.chavez@correo.com"
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      className="w-full rounded-xl border border-[#D8C7B0] bg-[#FBF8F3]/50 px-4 py-3 text-sm text-[#21171D] focus:border-[#21171D] focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#4E433B] mb-1.5">
                      Bebida de Cortesía al Llegar
                    </label>
                    <select
                      value={beveragePreference}
                      onChange={(e) => setBeveragePreference(e.target.value)}
                      className="w-full rounded-xl border border-[#D8C7B0] bg-[#FBF8F3]/50 px-3.5 py-3 text-sm text-[#21171D] focus:border-[#21171D] focus:bg-white focus:outline-none"
                    >
                      {BEVERAGE_OPTIONS.map((bev) => (
                        <option key={bev} value={bev}>
                          {bev}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4E433B] mb-1.5">
                    Notas o Preferencias Especiales (Opcional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ej. Cabello largo a media espalda, evento de noche, alergia a algún ingrediente..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full rounded-xl border border-[#D8C7B0] bg-[#FBF8F3]/50 px-4 py-2.5 text-sm text-[#21171D] focus:border-[#21171D] focus:bg-white focus:outline-none"
                  />
                </div>

                {bookingError && (
                  <div className="rounded-xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900">
                    {bookingError}
                  </div>
                )}
              </div>
            </div>

            {/* Right 4 Columns: Live Summary Ticket Preview */}
            <div className="lg:col-span-4 lg:sticky lg:top-24 rounded-3xl border border-[#D5C3AA] bg-[#21171D] p-6 sm:p-7 text-[#FBF8F3] shadow-xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/15 pb-4">
                <BrandLogo variant="light" compact />
                <div className="text-right">
                  <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#B8915C]">
                    Vista Previa de Cita
                  </p>
                  <p className="font-mono text-xs text-white/80">
                    Folio Digital + QR PDF
                  </p>
                </div>
              </div>

              {currentService && currentStylist && (
                <div className="space-y-4 text-sm">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-[#D9C3A3]">
                      Servicio Seleccionado
                    </p>
                    <p className="font-serif text-2xl font-medium text-white mt-0.5">
                      {currentService.name}
                    </p>
                    <p className="text-xs text-[#CFC4B8]">
                      Duración estimada: {currentService.durationMinutes} min
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white/[0.06] p-4 border border-white/10">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#B8915C]">
                        Especialista
                      </p>
                      <p className="font-medium text-white text-xs mt-0.5">
                        {currentStylist.name}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#B8915C]">
                        Horario
                      </p>
                      <p className="font-mono font-bold text-white text-xs mt-0.5">
                        {appointmentDate} · {appointmentTime}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-white/15 pt-4 text-xs">
                    <div className="flex justify-between text-[#CFC4B8]">
                      <span>Barra de Cortesía & Valet</span>
                      <span className="text-[#8CE0B8] font-semibold">
                        INCLUIDO ($0.00)
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline pt-2">
                      <span className="text-sm font-semibold uppercase tracking-wider text-[#E6CFA8]">
                        Inversión Total
                      </span>
                      <span className="font-mono text-2xl font-bold text-white">
                        {formatMxn(currentService.priceMxn)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submittingBooking}
                className="w-full rounded-full bg-[#B8915C] py-4 px-6 text-xs sm:text-sm font-bold tracking-[0.18em] uppercase text-[#21171D] shadow-lg transition hover:bg-[#D9C3A3] disabled:opacity-60 cursor-pointer"
              >
                {submittingBooking
                  ? "Emitiendo Folio Oficial..."
                  : "Confirmar Cita & Generar Folio PDF"}
              </button>

              <p className="text-center text-[11px] leading-relaxed text-[#BFB3A5]">
                Al confirmar se generará tu{" "}
                <strong className="text-white">Folio Oficial PV-2026</strong>{" "}
                descargable en PDF con logotipo, código QR y sello del salón.
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* SECTION 05: CENTRO DE CONSULTA DE FOLIOS & DESCARGA DE CITAS EN PDF */}
      <section id="folios" className="py-20 sm:py-24 bg-[#FBF8F3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.28em] uppercase text-[#9A7440]">
                <ShieldCheck className="h-4 w-4" />
                <span>05 · Portal Oficial de Comprobantes</span>
              </div>
              <h2 className="mt-2 font-serif text-4xl sm:text-5xl font-medium text-[#21171D]">
                Consulta de Citas & Descarga de Folios en PDF
              </h2>
              <p className="mt-2 max-w-2xl text-sm sm:text-base text-[#5E5248]">
                Ingresa tu{" "}
                <strong className="text-[#21171D]">
                  número de folio (ej. PV-2026-1042)
                </strong>
                , tu teléfono de Ciudad Juárez o tu nombre para descargar tu
                comprobante oficial en PDF con logotipo, código QR y sello, o
                reprogramar tu visita.
              </p>
            </div>
          </div>

          {/* Search Bar + Instant Demo Folio Pills */}
          <div className="rounded-3xl border border-[#DFD2C0] bg-white p-6 shadow-xs mb-8">
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row gap-3"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9A7440]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por Folio (PV-2026-1042), Teléfono (656...) o Nombre de la Clienta..."
                  className="w-full rounded-full border border-[#D8C7B0] bg-[#FBF8F3] pl-11 pr-4 py-3.5 text-sm text-[#21171D] focus:border-[#21171D] focus:bg-white focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={searchingFolios}
                className="rounded-full bg-[#21171D] px-7 py-3.5 text-xs font-semibold tracking-[0.18em] uppercase text-white transition hover:bg-[#9A7440] cursor-pointer"
              >
                {searchingFolios ? "Buscando..." : "Buscar Folio"}
              </button>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    executeFolioSearch("");
                  }}
                  className="rounded-full border border-[#D8C7B0] px-5 py-3.5 text-xs font-semibold uppercase tracking-wider text-[#5E5248] hover:border-[#21171D] cursor-pointer"
                >
                  Ver Todos
                </button>
              )}
            </form>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[#6B5E53]">
              <span className="font-semibold text-[#21171D]">
                Folios rápidos verificables:
              </span>
              {["PV-2026-1042", "PV-2026-1089", "PV-2026-1104", "PV-2026-1127"].map(
                (sampleFolio) => (
                  <button
                    key={sampleFolio}
                    type="button"
                    onClick={() => {
                      setSearchQuery(sampleFolio);
                      executeFolioSearch(sampleFolio);
                    }}
                    className="rounded-full border border-[#E2D5C5] bg-[#FBF8F3] px-3 py-1 font-mono text-xs font-semibold text-[#9A7440] hover:border-[#9A7440] hover:bg-white transition cursor-pointer"
                  >
                    {sampleFolio}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Appointments & Downloadable Folios Grid */}
          {appointmentsList.length === 0 ? (
            <div className="rounded-3xl border border-[#E5DDD3] bg-white p-12 text-center">
              <p className="font-serif text-2xl text-[#21171D]">
                No encontramos citas con ese criterio de búsqueda.
              </p>
              <p className="mt-2 text-sm text-[#6B5E53]">
                Verifica tu número de folio o haz clic en &ldquo;Ver Todos&rdquo;
                para mostrar las reservaciones activas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {appointmentsList.map((item) => {
                const badgeClass =
                  item.status === "cancelada"
                    ? "bg-rose-900/10 text-rose-800 border-rose-800/25"
                    : item.status === "reprogramada"
                    ? "bg-amber-900/10 text-amber-900 border-amber-800/25"
                    : "bg-[#2E6F54]/10 text-[#2E6F54] border-[#2E6F54]/25";

                return (
                  <motion.div
                    key={item.id}
                    layout
                    className="flex flex-col justify-between rounded-3xl border border-[#E2D6C5] bg-white p-6 shadow-xs transition hover:shadow-md"
                  >
                    <div>
                      {/* Top Folio Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#F1EBE3] pb-4">
                        <div className="flex items-center gap-2.5">
                          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#21171D] text-[#D9C3A3]">
                            <FileText className="h-4 w-4" />
                          </span>
                          <div>
                            <p className="font-mono text-base font-bold text-[#21171D]">
                              {item.folio}
                            </p>
                            <p className="font-mono text-[10px] text-[#8C7E72]">
                              Verif: {item.verificationCode}
                            </p>
                          </div>
               </div>

                        <span
                          className={`rounded-full border px-3 py-1 text-[10px] font-bold tracking-widest uppercase ${badgeClass}`}
                        >
                          {item.status}
                        </span>
                      </div>

                      {/* Body info */}
                      <div className="py-4 space-y-2">
                        <div className="flex items-baseline justify-between gap-2">
                          <h3 className="font-serif text-xl font-semibold text-[#21171D]">
                            {item.clientName}
                          </h3>
                          <span className="font-mono text-base font-bold text-[#9A7440]">
                            {formatMxn(item.priceMxn)}
                          </span>
                        </div>

                        <p className="text-sm font-medium text-[#3A312B]">
                          {item.serviceName}
                        </p>

                        <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-[#6B5E53]">
                          <span className="inline-flex items-center gap-1.5 capitalize">
                            <Calendar className="h-3.5 w-3.5 text-[#B8915C]" />
                            {formatDateSpanish(item.appointmentDate)}
                          </span>
                          <span className="inline-flex items-center gap-1.5 font-mono font-semibold text-[#21171D]">
                            <Clock className="h-3.5 w-3.5 text-[#B8915C]" />
                            {item.appointmentTime} HRS
                          </span>
                        </div>

                        <p className="text-xs text-[#7A6C60]">
                          Especialista:{" "}
                          <strong className="text-[#21171D]">
                            {item.stylistName}
                          </strong>{" "}
                          · Tel: {item.clientPhone}
                        </p>
                      </div>
                    </div>

                    {/* Direct PDF & QR Actions */}
                    <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-[#F1EBE3]">
                      <button
                        onClick={() => handleQuickDirectPdfDownload(item)}
                        disabled={downloadingFolioId === item.id}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-[#21171D] px-4 py-3 text-xs font-semibold tracking-wider uppercase text-white transition hover:bg-[#9A7440] cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5 text-[#D9C3A3]" />
                        <span>
                          {downloadingFolioId === item.id
                            ? "Descargando PDF..."
                            : "Descargar Folio PDF"}
                        </span>
                      </button>

                      <button
                        onClick={() => setActiveModalAppointment(item)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-full border border-[#C9B69E] bg-[#FBF8F3] px-4 py-3 text-xs font-semibold tracking-wider uppercase text-[#21171D] transition hover:border-[#21171D] cursor-pointer"
                      >
                        <QrCode className="h-3.5 w-3.5 text-[#9A7440]" />
                        <span>Ver Pase QR / Editar</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CENTRO DE DESCARGAS PREMIUM PAMELA VIURY */}
      <PamelaDownloadsCentre
        services={services}
        stylists={stylists}
        featuredAppointment={appointmentsList[0] ?? null}
      />

      {/* SECTION 06: TESTIMONIOS REALES CD. JUÁREZ */}
      <section className="py-20 bg-[#F3ECE4] border-t border-[#E3D7C7]">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold tracking-[0.28em] uppercase text-[#9A7440]">
              06 · Reseñas Verificadas
            </p>
            <h2 className="mt-2 font-serif text-4xl font-medium text-[#21171D]">
              Lo que dicen nuestras clientas en Juárez y El Paso
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div
                key={t.name}
                className="flex flex-col justify-between rounded-3xl border border-[#DFD2C0] bg-white p-7 shadow-xs"
              >
                <div>
                  <div className="flex gap-1 text-[#B8915C] mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-[#B8915C] text-[#B8915C]"
                      />
                    ))}
                  </div>
                  <p className="font-serif text-lg italic leading-relaxed text-[#2D2520]">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[#F1EBE3]">
                  <p className="font-semibold text-sm text-[#21171D]">
                    {t.name}
                  </p>
                  <p className="text-xs text-[#8C7E72]">{t.zone}</p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-[#9A7440]">
                    {t.service}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PREGUNTAS FRECUENTES CONCIERGE PAMELA VIURY */}
      <PamelaFaq />

      {/* SECTION 07: UBICACIÓN EN CD. JUÁREZ, CHIHUAHUA */}
      <section id="ubicacion" className="py-20 sm:py-24 bg-[#FBF8F3]">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-6 space-y-6">
              <p className="text-xs font-semibold tracking-[0.28em] uppercase text-[#9A7440]">
                07 · Visítanos en Ciudad Juárez
              </p>
              <h2 className="font-serif text-4xl sm:text-5xl font-medium text-[#21171D]">
                Ubicación Privilegiada en Zona Campos Elíseos
              </h2>
              <p className="text-base leading-relaxed text-[#5E5248]">
                Encuéntranos sobre el corredor más exclusivo y seguro de{" "}
                <strong className="text-[#21171D]">
                  Ciudad Juárez, Chihuahua
                </strong>
                , a solo 12 minutos de los puentes internacionales para
                comodidad de nuestras clientas locales y de El Paso, Texas.
              </p>

              <div className="space-y-4 rounded-3xl border border-[#E2D6C5] bg-white p-6">
                <div className="flex items-start gap-3.5">
                  <MapPin className="h-5 w-5 text-[#B8915C] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-[#21171D]">
                      Dirección Exacta
                    </p>
                    <p className="text-sm text-[#5E5248]">
                      Blvd. Tomás Fernández 8245, Local 4B, Zona Campos Elíseos,
                      C.P. 32472, Cd. Juárez, Chihuahua, México.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Clock className="h-5 w-5 text-[#B8915C] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-[#21171D]">
                      Horario de Atención
                    </p>
                    <p className="text-sm text-[#5E5248]">
                      Martes a Sábado: 9:00 AM – 8:00 PM · Domingos: Eventos
                      Nupciales Privados.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <Phone className="h-5 w-5 text-[#B8915C] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-[#21171D]">
                      Recepción & Concierge WhatsApp
                    </p>
                    <p className="text-sm font-mono text-[#5E5248]">
                      +52 (656) 688-4920 · concierge@pamelaviury.mx
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleCopyStudioAddress}
                    className="inline-flex items-center gap-2 rounded-full border border-[#21171D] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#21171D] hover:bg-[#21171D] hover:text-white transition cursor-pointer"
                  >
                    {addressCopied ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        <span>Dirección Copiada</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        <span>Copiar Dirección</span>
                      </>
                    )}
                  </button>

                  <a
                    href="https://maps.google.com/?q=Blvd.+Tomas+Fernandez+Campos+Eliseos+Ciudad+Juarez+Chihuahua"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-full bg-[#9A7440] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-white hover:bg-[#21171D] transition"
                  >
                    <span>Abrir en Google Maps</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </div>

            {/* Illustrated Architectural Map Card of Campos Elíseos Cd. Juárez */}
            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-3xl border-2 border-[#D8C5AC] bg-[#21171D] p-7 sm:p-9 text-[#FBF8F3] shadow-xl">
                <div className="flex items-center justify-between border-b border-white/15 pb-4 mb-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B8915C]">
                      Croquis Arquitectónico · Cd. Juárez
                    </p>
                    <h3 className="font-serif text-2xl text-white">
                      Corredor Blvd. Tomás Fernández
                    </h3>
                  </div>
                  <span className="rounded-full bg-[#B8915C]/20 border border-[#B8915C]/40 px-3 py-1 font-mono text-xs text-[#E6CFA8]">
                    31.7189° N, 106.4062° W
                  </span>
                </div>

                {/* Custom Vector Street Map of Zona Campos Elíseos */}
                <svg
                  viewBox="0 0 500 310"
                  className="w-full rounded-2xl bg-[#27201C] border border-white/10"
                >
                  {/* Subtle grid */}
                  <g stroke="#3A302A" strokeWidth="1">
                    <line x1="0" y1="60" x2="500" y2="60" />
                    <line x1="0" y1="140" x2="500" y2="140" />
                    <line x1="0" y1="220" x2="500" y2="220" />
                    <line x1="110" y1="0" x2="110" y2="310" />
                    <line x1="260" y1="0" x2="260" y2="310" />
                    <line x1="400" y1="0" x2="400" y2="310" />
                  </g>

                  {/* Major Avenue: Blvd. Tomás Fernández */}
                  <path
                    d="M 20 245 Q 240 165 480 95"
                    stroke="#4E4239"
                    strokeWidth="22"
                    fill="none"
                  />
                  <path
                    d="M 20 245 Q 240 165 480 95"
                    stroke="#B8915C"
                    strokeWidth="1.5"
                    strokeDasharray="6 6"
                    fill="none"
                  />

                  {/* Intersecting Av. Antonio J. Bermúdez / Campos Elíseos */}
                  <path
                    d="M 185 20 L 295 295"
                    stroke="#433830"
                    strokeWidth="15"
                    fill="none"
                  />

                  {/* Street Labels */}
                  <text
                    x="95"
                    y="232"
                    fill="#D9C3A3"
                    fontSize="10"
                    fontWeight="bold"
                    letterSpacing="1.5"
                    transform="rotate(-17 95 232)"
                  >
                    BLVD. TOMÁS FERNÁNDEZ
                  </text>
                  <text
                    x="196"
                    y="68"
                    fill="#A6988B"
                    fontSize="9"
                    letterSpacing="1.2"
                    transform="rotate(68 196 68)"
                  >
                    AV. CAMPOS ELÍSEOS
                  </text>

                  {/* Reference Points */}
                  <circle cx="145" cy="128" r="4" fill="#8C7E72" />
                  <text x="52" y="124" fill="#CFC4B8" fontSize="9.5">
                    Club Campestre
                  </text>

                  <circle cx="385" cy="195" r="4" fill="#8C7E72" />
                  <text x="345" y="215" fill="#CFC4B8" fontSize="9.5">
                    Plaza Campos Elíseos
                  </text>

                  {/* Pamela Viury Pulsing Gold Pin */}
                  <circle
                    cx="268"
                    cy="162"
                    r="22"
                    fill="#B8915C"
                    fillOpacity="0.22"
                  />
                  <circle
                    cx="268"
                    cy="162"
                    r="11"
                    fill="#B8915C"
                    stroke="#FBF8F3"
                    strokeWidth="2"
                  />
                  <rect
                    x="286"
                    y="138"
                    width="176"
                    height="46"
                    rx="10"
                    fill="#21171D"
                    stroke="#B8915C"
                    strokeWidth="1.2"
                  />
                  <text
                    x="298"
                    y="157"
                    fill="#FBF8F3"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    PAMELA VIURY · LOCAL 4B
                  </text>
                  <text x="298" y="173" fill="#D9C3A3" fontSize="9">
                    Valet Parking Gratuito en Entrada
                  </text>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* LUXURY ARCHITECTURAL FOOTER */}
      <footer className="bg-[#180F16] text-[#D8CBBF] border-t border-[#B8915C]/30 py-14 mt-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-white/10">
            <div>
              <BrandLogo variant="light" />
              <p className="mt-3 max-w-md text-xs leading-relaxed text-[#A89B8E]">
                Alta Estética, Diseño de Color, Maquillaje Nupcial y Spa Facial
                exclusivo para mujeres en Ciudad Juárez, Chihuahua, México.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => downloadSalonMenuPDF(services, stylists)}
                className="inline-flex items-center gap-2 rounded-full border border-[#B8915C]/60 px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#FBF8F3] hover:bg-[#B8915C] hover:text-[#21171D] transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Descargar Catálogo Signature PDF</span>
              </button>
              <a
                href="#agendar"
                className="inline-flex items-center gap-2 rounded-full bg-[#B8915C] px-5 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#21171D] hover:bg-[#E6CFA8] transition"
              >
                <span>Agendar Cita Ahora</span>
              </a>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8E8175]">
            <p>
              © {new Date().getFullYear()} SALÓN DE BELLEZA PAMELA VIURY S.A. DE C.V. · Blvd.
              Tomás Fernández 8245, Cd. Juárez, Chih. Todos los derechos
              reservados.
            </p>
            <p className="font-mono">
              Sistema Oficial de Folios Digitales & QR Verificado
            </p>
          </div>
        </div>
      </footer>

      {/* Interactive Official Folio Ticket & QR Modal */}
      <FolioTicketModal
        appointment={activeModalAppointment}
        onClose={() => setActiveModalAppointment(null)}
        onUpdated={handleAppointmentUpdated}
      />
    </div>
  );
}
