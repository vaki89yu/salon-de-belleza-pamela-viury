"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Car,
  Check,
  ChevronDown,
  Coffee,
  Crown,
  Download,
  FileText,
  Gift,
  Heart,
  Home,
  QrCode,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type {
  AppointmentRecord,
  ServiceRecord,
  StylistRecord,
} from "@/db/schema";
import { PamelaSignature } from "@/components/BrandLogo";
import {
  downloadAppointmentFolioPDF,
  downloadBridalGuidePDF,
  downloadGiftCardPDF,
  downloadHomeCarePDF,
  downloadSalonMenuPDF,
  formatMxn,
} from "@/lib/pdfGenerator";

/* ------------------------------------------------------------------ */
/*  Real editorial photography (Pexels) + Pamela Viury house imagery   */
/* ------------------------------------------------------------------ */

const STOCK = {
  hairService:
    "https://images.pexels.com/photos/3331488/pexels-photo-3331488.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  hairCurls:
    "https://images.pexels.com/photos/3065171/pexels-photo-3065171.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  blowout:
    "https://images.pexels.com/photos/14615063/pexels-photo-14615063.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  vanity:
    "https://images.pexels.com/photos/2263142/pexels-photo-2263142.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  salonInterior:
    "https://images.pexels.com/photos/7750108/pexels-photo-7750108.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  makeupBold:
    "https://images.pexels.com/photos/36143086/pexels-photo-36143086.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
  makeupGrace:
    "https://images.pexels.com/photos/10176348/pexels-photo-10176348.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
  makeupNatural:
    "https://images.pexels.com/photos/10658354/pexels-photo-10658354.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=1200&w=800",
  facialMask:
    "https://images.pexels.com/photos/12115040/pexels-photo-12115040.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  facialGlow:
    "https://images.pexels.com/photos/5659018/pexels-photo-5659018.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
};

const fadeUp = {
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
};

/* ================================================================== */
/*  LA CASA — Founder manifesto                                        */
/* ================================================================== */

export function PamelaManifesto() {
  const pillars = [
    {
      icon: Sparkles,
      title: "Diagnóstico Couture",
      body: "Cada servicio inicia con análisis de cabello, piel y estilo de vida bajo el clima único de Cd. Juárez.",
    },
    {
      icon: Crown,
      title: "Dirección de Pamela Viury",
      body: "La fundadora supervisa personalmente los diseños de color y las experiencias nupciales Privé.",
    },
    {
      icon: Coffee,
      title: "Hospitalidad de Casa",
      body: "Barra botánica, capuccino gourmet y valet parking en cortesía presentando tu folio QR.",
    },
    {
      icon: QrCode,
      title: "Folio Digital Certificado",
      body: "Tu cita queda registrada con folio PV-2026, código QR, sello y firma descargables en PDF.",
    },
  ];

  return (
    <section id="la-casa" className="viury-grain border-b border-[#E7DCEB] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <motion.div {...fadeUp} className="relative lg:col-span-5">
            <div className="viury-arch-frame overflow-hidden border-2 border-[#D9C3A3] bg-white p-2.5 shadow-2xl">
              <div className="viury-arch-frame relative aspect-[4/5] overflow-hidden">
                <img
                  src="/images/stylist-valeria.jpg"
                  alt="Pamela Viury, fundadora del Salón de Belleza Pamela Viury en Cd. Juárez"
                  className="animate-ken-burns h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#21171D]/70 via-transparent to-transparent" />
                <div className="absolute right-5 bottom-5 left-5 text-[#FBF8F3]">
                  <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-[#E3C99B]">
                    Fundadora & Directora Creativa
                  </p>
                  <p className="font-display mt-1 text-3xl tracking-[0.12em] uppercase">
                    Pamela Viury
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -right-3 -bottom-5 rounded-2xl border border-[#E3C99B] bg-[#21171D] px-5 py-4 text-[#FBF8F3] shadow-xl sm:-right-6">
              <p className="font-display text-3xl text-[#E3C99B]">14 AÑOS</p>
              <p className="text-[10px] font-semibold tracking-[0.22em] uppercase opacity-80">
                Creando belleza en Juárez
              </p>
            </div>
          </motion.div>

          <motion.div {...fadeUp} className="space-y-7 lg:col-span-7">
            <div>
              <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#7A2E43]">
                La Casa · Manifiesto Pamela Viury
              </p>
              <h2 className="font-display mt-3 text-4xl leading-tight tracking-[0.06em] text-[#21171D] uppercase sm:text-6xl">
                Una casa de belleza con nombre, firma y palabra
              </h2>
            </div>

            <blockquote className="border-l-2 border-[#7A2E43] pl-5">
              <p className="font-serif text-2xl leading-relaxed text-[#463640] italic">
                “Mi nombre está en la puerta porque mi compromiso está en cada
                detalle: en el diagnóstico honesto, en la técnica impecable y
                en la calma con la que sales de mi casa sintiéndote tú, en tu
                versión más luminosa.”
              </p>
            </blockquote>

            <PamelaSignature />

            <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-2">
              {pillars.map((pillar) => (
                <div
                  key={pillar.title}
                  className="rounded-3xl border border-[#E4D6C9] bg-white/85 p-5 shadow-xs transition hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <pillar.icon className="h-6 w-6 text-[#7A2E43]" />
                  <h3 className="font-serif mt-3 text-xl font-semibold text-[#21171D]">
                    {pillar.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#675661]">
                    {pillar.body}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  EXPERIENCIA — The signature visit in four acts                              */
/* ================================================================== */

export function PamelaSignatureExperience() {
  const acts = [
    {
      roman: "I",
      title: "Bienvenida Privé",
      body: "Valet parking, escaneo de tu folio QR y tu bebida de cortesía servida en cristalería fina.",
      image: STOCK.vanity,
    },
    {
      roman: "II",
      title: "Diagnóstico & Diseño",
      body: "Análisis de cabello, piel y facciones; diseñamos juntas el resultado antes de comenzar.",
      image: STOCK.hairService,
    },
    {
      roman: "III",
      title: "Atención Signature",
      body: "Técnica europea, productos profesionales originales y masaje de cortesía en cabina.",
      image: STOCK.hairCurls,
    },
    {
      roman: "IV",
      title: "Salida Editorial",
      body: "Styling final, fotografía de cortesía y tu guía de cuidado en casa descargable en PDF.",
      image: STOCK.blowout,
    },
  ];

  return (
    <section
      id="experiencia"
      className="border-y border-[#B8915C]/30 bg-[#21171D] py-20 text-[#FBF8F3] sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#E3C99B]">
              La Experiencia Pamela Viury
            </p>
            <h2 className="font-display mt-3 text-4xl tracking-[0.06em] uppercase sm:text-6xl">
              Tu visita, en cuatro actos
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#D8CBD7]">
            Nada es improvisado. Cada cita con folio{" "}
            <span className="font-mono text-[#E3C99B]">PV-2026</span> sigue el
            protocolo de hospitalidad creado por Pamela Viury para que solo
            tengas que llegar y disfrutar.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {acts.map((act, idx) => (
            <motion.article
              key={act.roman}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: idx * 0.08 }}
              className="group overflow-hidden rounded-3xl border border-white/12 bg-white/[0.045]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={act.image}
                  alt={`${act.title} en Salón de Belleza Pamela Viury`}
                  className="h-full w-full object-cover transition duration-700 group-hover:scale-108"
                  loading="lazy"
                />
                <span className="font-display absolute top-4 left-4 flex h-11 w-11 items-center justify-center rounded-full border border-[#E3C99B]/70 bg-[#21171D]/80 text-lg text-[#E3C99B] backdrop-blur-sm">
                  {act.roman}
                </span>
              </div>
              <div className="p-6">
                <h3 className="font-serif text-2xl font-semibold">{act.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#CDBFCE]">
                  {act.body}
                </p>
              </div>
            </motion.article>
          ))}
        </div>

        <div className="mt-10 grid grid-cols-1 gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:grid-cols-3 sm:p-7">
          {[
            { icon: Car, text: "Valet parking gratuito en Plaza Campos Elíseos con tu folio QR" },
            { icon: ShieldCheck, text: "Instrumental esterilizado y productos originales de grado profesional" },
            { icon: Award, text: "Garantía Pamela Viury: retoque de satisfacción dentro de 7 días" },
          ].map((item) => (
            <div key={item.text} className="flex items-start gap-3">
              <item.icon className="mt-0.5 h-5 w-5 shrink-0 text-[#E3C99B]" />
              <p className="text-xs leading-relaxed text-[#D8CBD7]">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  PAQUETES — Signature collections & memberships                     */
/* ================================================================== */

interface PackagesProps {
  services: ServiceRecord[];
  onReserveService: (serviceId: number) => void;
}

export function PamelaPackages({ services, onReserveService }: PackagesProps) {
  const findService = (needle: string) =>
    services.find(
      (s) =>
        s.slug.toLowerCase().includes(needle) ||
        s.name.toLowerCase().includes(needle)
    );

  const packages = [
    {
      eyebrow: "Cuidado Mensual",
      name: "Esencial Pamela Viury",
      price: 1890,
      tagline: "Tu mantenimiento de luminosidad cada mes",
      features: [
        "Corte de autor + Tratamiento Kérastase Caviar",
        "Manicura rusa estructural BIAB",
        "Diseño de cejas HD con mapeo áureo",
        "Bebida de cortesía + valet parking",
      ],
      service: findService("kerastase"),
      featured: false,
    },
    {
      eyebrow: "El Favorito de la Casa",
      name: "Signature Pamela Viury",
      price: 4490,
      tagline: "La transformación completa, de cabello a piel",
      features: [
        "Balayage Couture protegido con Olaplex",
        "Hidrafacial Diamante & Cuarzo Rosa",
        "Maquillaje social HD + alto peinado",
        "Guía de cuidado en casa firmada por Pamela",
      ],
      service: findService("balayage"),
      featured: true,
    },
    {
      eyebrow: "Suite Privada",
      name: "Novia Privé Pamela Viury",
      price: 7950,
      tagline: "El gran día, con la calma de una suite solo para ti",
      features: [
        "Prueba completa de maquillaje y peinado",
        "Maquillaje blindado 16 horas + kit de retoque",
        "Colocación de velo, tocado y brindis rosé",
        "Guía Nupcial Privé PDF con cronograma 90 días",
      ],
      service: findService("nupcial"),
      featured: false,
    },
  ];

  return (
    <section id="paquetes" className="border-b border-[#E7DCEB] bg-[#F7EFF2] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#7A2E43]">
            Colecciones & Membresías 2026
          </p>
          <h2 className="font-display mt-3 text-4xl tracking-[0.06em] text-[#21171D] uppercase sm:text-6xl">
            Paquetes Signature Pamela Viury
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-[#675661] sm:text-base">
            Experiencias completas diseñadas por Pamela con ahorro frente a
            servicios individuales. Al reservar recibes el mismo folio oficial{" "}
            <span className="font-mono font-semibold">PV-2026</span> descargable
            en PDF.
          </p>
        </div>

        <div className="grid grid-cols-1 items-stretch gap-7 lg:grid-cols-3">
          {packages.map((pkg, idx) => (
            <motion.article
              key={pkg.name}
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: idx * 0.09 }}
              className={`relative flex flex-col justify-between rounded-[2rem] p-7 shadow-xs ${
                pkg.featured
                  ? "border border-[#B8915C] bg-[#21171D] text-[#FBF8F3] shadow-2xl lg:-my-4 lg:py-11"
                  : "border border-[#E1D2DB] bg-white text-[#21171D]"
              }`}
            >
              {pkg.featured && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#7A2E43] px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-white shadow-lg">
                  Favorito de Pamela
                </span>
              )}
              <div>
                <p
                  className={`text-[10px] font-bold tracking-[0.28em] uppercase ${
                    pkg.featured ? "text-[#E3C99B]" : "text-[#7A2E43]"
                  }`}
                >
                  {pkg.eyebrow}
                </p>
                <h3 className="font-serif mt-2 text-3xl font-semibold">{pkg.name}</h3>
                <p
                  className={`font-serif mt-1 text-lg italic ${
                    pkg.featured ? "text-[#E3C99B]" : "text-[#8C6A3F]"
                  }`}
                >
                  {pkg.tagline}
                </p>
                <p className="mt-5">
                  <span className="font-mono text-4xl font-bold">
                    {formatMxn(pkg.price)}
                  </span>
                  <span className={`text-xs ${pkg.featured ? "text-[#CDBFCE]" : "text-[#675661]"}`}>
                    {" "}
                    MXN / sesión
                  </span>
                </p>

                <ul className="mt-6 space-y-3">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${
                          pkg.featured ? "text-[#E3C99B]" : "text-[#7A2E43]"
                        }`}
                      />
                      <span className={pkg.featured ? "text-[#E9DEEA]" : "text-[#554550]"}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => pkg.service && onReserveService(pkg.service.id)}
                className={`mt-8 w-full rounded-full py-3.5 text-xs font-bold tracking-[0.2em] uppercase transition ${
                  pkg.featured
                    ? "bg-[#B8915C] text-[#21171D] hover:bg-[#E3C99B]"
                    : "border border-[#21171D] text-[#21171D] hover:bg-[#21171D] hover:text-white"
                } cursor-pointer`}
              >
                Reservar esta experiencia
              </button>
            </motion.article>
          ))}
        </div>

        <p className="mt-10 text-center text-xs text-[#7A6A74]">
          ¿Buscas membresía anual o evento privado para damas y XV años? Escribe a{" "}
          <span className="font-semibold text-[#7A2E43]">concierge@pamelaviury.mx</span>{" "}
          o llama al (656) 688-4920 — diseñamos tu propuesta a medida.
        </p>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  EDITORIAL — filterable real gallery                                */
/* ================================================================== */

const EDITORIAL_FILTERS = ["Todo", "Cabello", "Maquillaje", "Spa & Piel", "La Casa"] as const;

const EDITORIAL_ITEMS: Array<{
  title: string;
  subtitle: string;
  category: (typeof EDITORIAL_FILTERS)[number];
  image: string;
}> = [
  { title: "Color en Movimiento", subtitle: "Diseño y styling en cabina", category: "Cabello", image: STOCK.hairService },
  { title: "Ondas de Seda", subtitle: "Acabado editorial Pamela Viury", category: "Cabello", image: STOCK.hairCurls },
  { title: "Blowout Signature", subtitle: "Volumen luminoso sin frizz", category: "Cabello", image: STOCK.blowout },
  { title: "Mirada Editorial", subtitle: "Maquillaje de gala de alta precisión", category: "Maquillaje", image: STOCK.makeupBold },
  { title: "Gracia Natural", subtitle: "Piel luminosa efecto porcelana", category: "Maquillaje", image: STOCK.makeupGrace },
  { title: "Belleza Atemporal", subtitle: "Acabado HD para fotografía", category: "Maquillaje", image: STOCK.makeupNatural },
  { title: "Tratamiento de Arcillas", subtitle: "Purificación profunda de cabina", category: "Spa & Piel", image: STOCK.facialMask },
  { title: "Glow Hidratante", subtitle: "Oxigenación y ácido hialurónico", category: "Spa & Piel", image: STOCK.facialGlow },
  { title: "Suite Pamela Viury", subtitle: "Espejos de autor en Campos Elíseos", category: "La Casa", image: STOCK.salonInterior },
  { title: "Novia Privé", subtitle: "Recogido nupcial con perlas", category: "La Casa", image: "/images/service-bridal.jpg" },
];

export function PamelaEditorialGallery() {
  const [filter, setFilter] =
    useState<(typeof EDITORIAL_FILTERS)[number]>("Todo");

  const items = useMemo(
    () =>
      filter === "Todo"
        ? EDITORIAL_ITEMS
        : EDITORIAL_ITEMS.filter((item) => item.category === filter),
    [filter]
  );

  return (
    <section id="editorial" className="border-b border-[#E7DCEB] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#7A2E43]">
              Editorial Real · @pamela.viury
            </p>
            <h2 className="font-display mt-3 text-4xl tracking-[0.06em] text-[#21171D] uppercase sm:text-6xl">
              Inspiración de la casa
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {EDITORIAL_FILTERS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full px-4 py-2.5 text-[11px] font-bold tracking-[0.16em] uppercase transition ${
                  filter === item
                    ? "bg-[#7A2E43] text-white shadow-md"
                    : "border border-[#DECFDA] bg-white text-[#675661] hover:border-[#7A2E43]"
                } cursor-pointer`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {items.map((item, idx) => (
            <motion.figure
              key={`${item.title}-${item.image}`}
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: (idx % 5) * 0.06 }}
              className={`group relative overflow-hidden rounded-3xl border border-[#E1D2DB] ${
                idx % 5 === 0 ? "sm:col-span-2 lg:row-span-2 aspect-[4/3] lg:aspect-auto" : "aspect-[4/5]"
              }`}
            >
              <img
                src={item.image}
                alt={`${item.title} — Salón de Belleza Pamela Viury`}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-108"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#21171D]/85 via-transparent to-transparent" />
              <figcaption className="absolute right-4 bottom-4 left-4 text-[#FBF8F3]">
                <p className="text-[9px] font-bold tracking-[0.24em] uppercase text-[#E3C99B]">
                  {item.category}
                </p>
                <p className="font-serif mt-0.5 text-xl font-semibold">{item.title}</p>
                <p className="text-[11px] text-[#E9DEEA]">{item.subtitle}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  DESCARGAS — Pamela Viury premium document atelier                  */
/* ================================================================== */

interface DownloadsProps {
  services: ServiceRecord[];
  stylists: StylistRecord[];
  featuredAppointment: AppointmentRecord | null;
}

export function PamelaDownloadsCentre({
  services,
  stylists,
  featuredAppointment,
}: DownloadsProps) {
  const [busyDoc, setBusyDoc] = useState<string>("");
  const [giftAmount, setGiftAmount] = useState(1000);
  const [giftRecipient, setGiftRecipient] = useState("");

  const runDownload = async (key: string, fn: () => Promise<void>) => {
    setBusyDoc(key);
    try {
      await fn();
    } finally {
      setTimeout(() => setBusyDoc(""), 700);
    }
  };

  const documents = [
    {
      key: "catalog",
      icon: BookOpen,
      eyebrow: "PDF Editorial · 4 páginas",
      title: "Catálogo Signature 2026",
      body: "Portada de casa, carta completa con fotografía, paquetes, especialistas y croquis de Campos Elíseos.",
      action: () => runDownload("catalog", () => downloadSalonMenuPDF(services, stylists)),
      cover: "/images/hero-salon.jpg",
    },
    {
      key: "bridal",
      icon: Heart,
      eyebrow: "PDF Nupcial · Cronograma 90 días",
      title: "Guía Nupcial Privé",
      body: "El paso a paso de Pamela para llegar radiante al altar: prueba, faciales, uñas y el gran día en suite privada.",
      action: () => runDownload("bridal", downloadBridalGuidePDF),
      cover: "/images/service-bridal.jpg",
    },
    {
      key: "homecare",
      icon: Home,
      eyebrow: "PDF de Cortesía · Firmado por Pamela",
      title: "Guía de Cuidado en Casa",
      body: "Rutinas de cabello, piel y uñas adaptadas al clima desértico de Cd. Juárez, con sello oficial de la casa.",
      action: () => runDownload("homecare", downloadHomeCarePDF),
      cover: "/images/service-facial.jpg",
    },
    {
      key: "folio",
      icon: QrCode,
      eyebrow: "PDF Oficial · QR + Guía de Bienvenida",
      title: "Folio de Cita de Ejemplo",
      body: featuredAppointment
        ? `Descarga el folio real ${featuredAppointment.folio} de 2 páginas con QR, código de barras, sello y firma.`
        : "Agenda tu cita para generar tu folio oficial descargable de 2 páginas.",
      action: () =>
        featuredAppointment &&
        runDownload("folio", () => downloadAppointmentFolioPDF(featuredAppointment)),
      cover: "/images/salon-lounge.jpg",
    },
  ];

  return (
    <section
      id="descargas"
      className="border-y border-[#B8915C]/30 bg-[#21171D] py-20 text-[#FBF8F3] sm:py-24"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="mb-14 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.3em] uppercase text-[#E3C99B]">
              <FileText className="h-4 w-4" />
              <span>Atelier Documental Pamela Viury</span>
            </div>
            <h2 className="font-display mt-3 text-4xl tracking-[0.06em] uppercase sm:text-6xl">
              Centro de descargas PDF
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-[#D8CBD7]">
            Documentos oficiales de la casa generados al instante con logotipo
            PV, fotografía editorial, sello certificado y firma de Pamela
            Viury. Sin registros ni pagos en línea.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
          {documents.map((docItem) => (
            <motion.article
              key={docItem.key}
              {...fadeUp}
              className="flex flex-col overflow-hidden rounded-3xl border border-white/12 bg-white/[0.045]"
            >
              <div className="relative aspect-[16/9] overflow-hidden">
                <img
                  src={docItem.cover}
                  alt={docItem.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 rounded-full bg-[#21171D]/85 px-3 py-1 font-mono text-[10px] font-bold text-[#E3C99B] backdrop-blur-sm">
                  PDF
                </span>
              </div>
              <div className="flex flex-1 flex-col justify-between p-6">
                <div>
                  <docItem.icon className="h-6 w-6 text-[#E3C99B]" />
                  <p className="mt-3 text-[10px] font-bold tracking-[0.22em] uppercase text-[#C9A7B8]">
                    {docItem.eyebrow}
                  </p>
                  <h3 className="font-serif mt-1.5 text-2xl font-semibold">
                    {docItem.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#CDBFCE]">
                    {docItem.body}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={docItem.action}
                  disabled={busyDoc === docItem.key || (docItem.key === "folio" && !featuredAppointment)}
                  className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#B8915C] px-5 py-3.5 text-xs font-bold tracking-[0.18em] uppercase text-[#21171D] transition hover:bg-[#E3C99B] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>
                    {busyDoc === docItem.key ? "Generando PDF…" : "Descargar PDF"}
                  </span>
                </button>
              </div>
            </motion.article>
          ))}
        </div>

        {/* Personalizable Gift Certificate studio */}
        <motion.div
          {...fadeUp}
          className="mt-8 grid grid-cols-1 overflow-hidden rounded-[2rem] border border-[#B8915C]/50 bg-gradient-to-br from-[#2B1B27] to-[#171016] lg:grid-cols-12"
        >
          <div className="relative min-h-64 lg:col-span-5">
            <img
              src="/images/salon-lounge.jpg"
              alt="Certificado de regalo Salón de Belleza Pamela Viury"
              className="absolute inset-0 h-full w-full object-cover"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#21171D]/55" />
            <div className="absolute bottom-5 left-5 rounded-2xl bg-[#FBF8F3] px-5 py-4 text-[#21171D] shadow-2xl">
              <p className="text-[9px] font-bold tracking-[0.26em] uppercase text-[#7A2E43]">
                Certificado Pamela Viury
              </p>
              <p className="font-mono mt-1 text-3xl font-bold">{formatMxn(giftAmount)}</p>
              <p className="font-script text-3xl text-[#7A2E43]">Pamela Viury</p>
            </div>
          </div>

          <form
            className="p-7 sm:p-9 lg:col-span-7"
            onSubmit={(e) => {
              e.preventDefault();
              runDownload("gift", () =>
                downloadGiftCardPDF(
                  giftAmount,
                  giftRecipient.trim()
                    ? `Para ${giftRecipient.trim()}`
                    : "Para una mujer extraordinaria",
                  "Un detalle del Salón de Belleza Pamela Viury"
                )
              );
            }}
          >
            <div className="flex items-center gap-3">
              <Gift className="h-7 w-7 text-[#E3C99B]" />
              <div>
                <p className="text-[10px] font-bold tracking-[0.26em] uppercase text-[#C9A7B8]">
                  Regala belleza · PDF apaisado con QR
                </p>
                <h3 className="font-serif text-3xl font-semibold">
                  Crea tu Certificado de Regalo Pamela Viury
                </h3>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold tracking-wider uppercase text-[#D8CBD7]">
                  Monto del certificado
                </label>
                <div className="flex flex-wrap gap-2">
                  {[500, 1000, 1500, 2500].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setGiftAmount(amount)}
                      className={`rounded-full px-4 py-2.5 font-mono text-sm font-bold transition ${
                        giftAmount === amount
                          ? "bg-[#B8915C] text-[#21171D]"
                          : "border border-white/25 text-white hover:border-[#E3C99B]"
                      } cursor-pointer`}
                    >
                      ${amount.toLocaleString("es-MX")}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label
                  htmlFor="gift-recipient"
                  className="mb-2 block text-xs font-semibold tracking-wider uppercase text-[#D8CBD7]"
                >
                  Nombre de quien lo recibe
                </label>
                <input
                  id="gift-recipient"
                  value={giftRecipient}
                  onChange={(e) => setGiftRecipient(e.target.value)}
                  placeholder="Ej. Mariana — ¡Feliz cumpleaños!"
                  className="w-full rounded-full border border-white/25 bg-white/10 px-5 py-3 text-sm text-white placeholder:text-white/50 focus:border-[#E3C99B] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={busyDoc === "gift"}
              className="mt-7 inline-flex items-center gap-2.5 rounded-full bg-[#7A2E43] px-7 py-4 text-xs font-bold tracking-[0.2em] uppercase text-white shadow-xl transition hover:bg-[#9A3D57] disabled:opacity-60 cursor-pointer"
            >
              <Download className="h-4 w-4 text-[#E3C99B]" />
              <span>
                {busyDoc === "gift"
                  ? "Generando certificado…"
                  : "Descargar Certificado de Regalo PDF"}
              </span>
            </button>
            <p className="mt-3 text-[11px] text-[#BFAFC2]">
              Incluye código único <span className="font-mono">PV-GIFT-2026</span>, QR
              verificable y vigencia de 6 meses en cualquier servicio de la casa.
            </p>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

/* ================================================================== */
/*  PREGUNTAS — Interactive concierge FAQ                              */
/* ================================================================== */

const FAQS = [
  {
    q: "¿Cómo descargo mi folio oficial de cita en PDF?",
    a: "Al confirmar tu reservación aparece tu pase digital con el botón «Descargar Folio Oficial PDF». También puedes recuperarlo cuando quieras en la sección Consultar Folio buscando por tu número PV-2026, tu teléfono 656 o tu nombre.",
  },
  {
    q: "¿Necesito pagar anticipo para agendar en línea?",
    a: "No. En Pamela Viury confirmas sin tarjeta y liquidas en salón el día de tu cita. Solo te pedimos puntualidad: cuentas con 15 minutos de tolerancia y puedes reprogramar sin cargo hasta 6 horas antes.",
  },
  {
    q: "Vivo en El Paso, Texas. ¿Puedo atenderme con ustedes?",
    a: "Por supuesto, muchas de nuestras clientas cruzan desde El Paso. Estamos en Blvd. Tomás Fernández 8245, Zona Campos Elíseos, a minutos de los puentes internacionales, con valet parking gratuito y horarios pensados para tu visita.",
  },
  {
    q: "¿Qué incluye la Experiencia Novia Pamela Viury Privé?",
    a: "Prueba completa previa, facial luminoso, maquillaje blindado de 16 horas, alto peinado, colocación de velo y tocado, suite privada con brindis rosé y kit de retoque. Descarga gratis la Guía Nupcial Privé en PDF desde nuestro Centro de Descargas.",
  },
  {
    q: "¿Los certificados de regalo tienen vigencia?",
    a: "Sí, 6 meses a partir de su emisión. Puedes crear el tuyo aquí mismo desde $500 MXN: se descarga en PDF apaisado con código QR único PV-GIFT-2026 listo para imprimir o enviar por WhatsApp.",
  },
  {
    q: "¿Qué productos utilizan y son seguros para piel sensible?",
    a: "Trabajamos únicamente líneas profesionales originales —Kérastase, Olaplex, Dior Backstage, Natura Bissé y BIAB japonés— y realizamos diagnóstico previo para adaptar cada servicio a pieles y cabellos sensibles.",
  },
];

export function PamelaFaq() {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <section id="preguntas" className="border-b border-[#E7DCEB] bg-[#FBF8F3] py-20 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-8">
        <div className="mb-12 text-center">
          <p className="text-xs font-semibold tracking-[0.3em] uppercase text-[#7A2E43]">
            Concierge Pamela Viury Responde
          </p>
          <h2 className="font-display mt-3 text-4xl tracking-[0.06em] text-[#21171D] uppercase sm:text-6xl">
            Preguntas frecuentes
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const open = openIndex === idx;
            return (
              <div
                key={faq.q}
                className={`overflow-hidden rounded-3xl border transition ${
                  open ? "border-[#7A2E43] bg-white shadow-lg" : "border-[#E1D2DB] bg-white/70"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? -1 : idx)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
                  aria-expanded={open}
                >
                  <span className="font-serif text-xl font-semibold text-[#21171D]">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-[#7A2E43] transition-transform duration-300 ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {open && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6"
                  >
                    <p className="max-w-3xl text-sm leading-relaxed text-[#675661]">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
