import jsPDF from "jspdf";
import QRCode from "qrcode";
import type {
  AppointmentRecord,
  ServiceRecord,
  StylistRecord,
} from "@/db/schema";

/* ------------------------------------------------------------------ */
/*  SALON DE BELLEZA PAMELA VIURY — Official PDF Atelier (Cd. Juarez)  */
/*  Palette: Viury Noir #21171D · Champagne Gold #B8915C · Rosewood    */
/*  #7A2E43 · Ivory #FBF8F3. Documents are generated as true vector    */
/*  PDF (Carta MX) with embedded photography, QR and official seal.    */
/* ------------------------------------------------------------------ */

const NOIR: [number, number, number] = [33, 23, 29];
const IVORY: [number, number, number] = [251, 248, 243];
const GOLD: [number, number, number] = [184, 145, 92];
const GOLD_DARK: [number, number, number] = [140, 106, 63];
const ROSEWOOD: [number, number, number] = [122, 46, 67];
const BLUSH: [number, number, number] = [243, 232, 224];
const INK_SOFT: [number, number, number] = [104, 91, 101];

const BRAND_LINE_1 = "SALON DE BELLEZA";
const BRAND_NAME = "PAMELA VIURY";
const ADDRESS_LINE =
  "Blvd. Tomas Fernandez 8245, Local 4B, Zona Campos Eliseos, C.P. 32472, Cd. Juarez, Chih.";
const CONTACT_LINE =
  "Concierge: (656) 688-4920  |  concierge@pamelaviury.mx  |  RFC: SPV210914JZ8";

export function formatDateSpanish(isoDate: string): string {
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const year = Number(parts[0]);
  const month = Number(parts[1]) - 1;
  const day = Number(parts[2]);
  const dateObj = new Date(year, month, day);
  return dateObj.toLocaleDateString("es-MX", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatMxn(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 2,
  }).format(amount);
}

/* ------------------------- Image utilities ------------------------- */

const imageCache = new Map<string, string | null>();

async function loadImageDataUrl(src: string): Promise<string | null> {
  if (imageCache.has(src)) return imageCache.get(src) ?? null;
  try {
    const response = await fetch(src);
    if (!response.ok) throw new Error("image load failed");
    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error("reader failed"));
      reader.readAsDataURL(blob);
    });
    imageCache.set(src, dataUrl);
    return dataUrl;
  } catch {
    imageCache.set(src, null);
    return null;
  }
}

/** Draw an image covering a frame (center-cropped) when possible. */
function addImageCover(
  doc: jsPDF,
  dataUrl: string,
  x: number,
  y: number,
  w: number,
  h: number
) {
  try {
    const props = doc.getImageProperties(dataUrl);
    const imgRatio = props.width / props.height;
    const frameRatio = w / h;
    let drawW = w;
    let drawH = h;
    let drawX = x;
    let drawY = y;
    if (imgRatio > frameRatio) {
      drawH = h;
      drawW = h * imgRatio;
      drawX = x - (drawW - w) / 2;
    } else {
      drawW = w;
      drawH = w / imgRatio;
      drawY = y - (drawH - h) / 2;
    }
    doc.saveGraphicsState();
    doc.rect(x, y, w, h);
    doc.clip();
    doc.discardPath();
    doc.addImage(dataUrl, "JPEG", drawX, drawY, drawW, drawH);
    doc.restoreGraphicsState();
  } catch {
    try {
      doc.addImage(dataUrl, "JPEG", x, y, w, h);
    } catch {
      /* photography is decorative — never block the document */
    }
  }
}

/* ------------------------- Vector brand marks ---------------------- */

function drawVectorMonogram(
  doc: jsPDF,
  cx: number,
  topY: number,
  scale = 1,
  lightStroke = true
) {
  const primary: [number, number, number] = lightStroke ? IVORY : NOIR;

  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.55 * scale);
  doc.roundedRect(cx - 8 * scale, topY, 16 * scale, 18 * scale, 8 * scale, 8 * scale, "S");

  doc.setDrawColor(...ROSEWOOD);
  doc.setLineWidth(0.25 * scale);
  doc.roundedRect(
    cx - 6.6 * scale,
    topY + 1.4 * scale,
    13.2 * scale,
    15.2 * scale,
    6.6 * scale,
    6.6 * scale,
    "S"
  );

  // Desert star jewel
  doc.setFillColor(...GOLD);
  doc.circle(cx, topY + 4.1 * scale, 0.85 * scale, "F");

  // PV monogram letterforms
  doc.setTextColor(...primary);
  doc.setFont("times", "bold");
  doc.setFontSize(10.5 * scale);
  doc.text("PV", cx, topY + 13.6 * scale, { align: "center" });

  // Rosewood signature dot
  doc.setFillColor(...ROSEWOOD);
  doc.circle(cx + 5.4 * scale, topY + 14.6 * scale, 0.8 * scale, "F");
}

function drawOfficialSealStamp(doc: jsPDF, cx: number, cy: number) {
  doc.setDrawColor(...GOLD_DARK);
  doc.setLineWidth(0.5);
  doc.circle(cx, cy, 15, "S");
  doc.setDrawColor(...ROSEWOOD);
  doc.setLineWidth(0.25);
  doc.circle(cx, cy, 13.4, "S");
  doc.setDrawColor(...GOLD_DARK);
  doc.circle(cx, cy, 8.8, "S");

  doc.setTextColor(...GOLD_DARK);
  doc.setFont("times", "bold");
  doc.setFontSize(6);
  doc.text("SELLO DIGITAL AUTORIZADO", cx, cy - 10, { align: "center" });
  doc.setFontSize(8.2);
  doc.text("PAMELA VIURY", cx, cy - 0.8, { align: "center" });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.2);
  doc.setTextColor(...ROSEWOOD);
  doc.text("SALON DE BELLEZA", cx, cy + 2.6, { align: "center" });
  doc.setTextColor(...GOLD_DARK);
  doc.text("CD. JUAREZ, CHIH.", cx, cy + 11.4, { align: "center" });

  // Pamela Viury calligraphic signature
  doc.setTextColor(...ROSEWOOD);
  doc.setFont("times", "italic");
  doc.setFontSize(13);
  doc.text("Pamela Viury", cx, cy + 21.5, { align: "center" });
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.25);
  doc.line(cx - 22, cy + 23.4, cx + 22, cy + 23.4);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.3);
  doc.setTextColor(...INK_SOFT);
  doc.text("Pamela Viury · Fundadora & Directora Creativa", cx, cy + 27, {
    align: "center",
  });
}

/** Official pseudo-barcode derived deterministically from the folio. */
function drawFolioBarcode(doc: jsPDF, folio: string, x: number, y: number) {
  doc.setDrawColor(...NOIR);
  let cursor = x;
  const seedText = `${folio}PAMELAVIURYJUAREZ`;
  for (let i = 0; i < seedText.length; i++) {
    const code = seedText.charCodeAt(i);
    const barW = 0.35 + ((code * 7) % 10) / 12;
    if (code % 2 === 0) {
      doc.setLineWidth(barW);
      doc.line(cursor, y, cursor, y + 8);
    }
    cursor += barW + 0.85;
  }
}

function drawMiniMap(doc: jsPDF, x: number, y: number, w: number, h: number) {
  doc.setFillColor(39, 29, 37);
  doc.roundedRect(x, y, w, h, 2.5, 2.5, "F");

  // Street grid
  doc.setDrawColor(74, 60, 70);
  doc.setLineWidth(0.25);
  for (let gx = x + 14; gx < x + w - 6; gx += 16) doc.line(gx, y + 4, gx, y + h - 4);
  for (let gy = y + 12; gy < y + h - 4; gy += 13) doc.line(x + 4, gy, x + w - 4, gy);

  // Blvd. Tomas Fernandez avenue
  doc.setDrawColor(104, 84, 96);
  doc.setLineWidth(4.5);
  doc.line(x + 6, y + h - 10, x + w - 8, y + 14);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.35);
  doc.setLineDashPattern([1.6, 1.6], 0);
  doc.line(x + 6, y + h - 10, x + w - 8, y + 14);
  doc.setLineDashPattern([], 0);

  doc.setTextColor(227, 201, 155);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(5.6);
  doc.text("BLVD. TOMAS FERNANDEZ", x + 9, y + h - 12.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.4);
  doc.setTextColor(205, 192, 204);
  doc.text("Club Campestre", x + 9, y + 12);
  doc.text("Plaza Campos Eliseos", x + w - 42, y + h - 7);

  // Pamela Viury pin
  const pinX = x + w * 0.56;
  const pinY = y + h * 0.5;
  doc.setFillColor(...GOLD);
  doc.circle(pinX, pinY, 5.5, "F");
  doc.setFillColor(...ROSEWOOD);
  doc.circle(pinX, pinY, 2.4, "F");
  doc.setFillColor(...NOIR);
  doc.roundedRect(pinX + 7, pinY - 9, 44, 13, 1.6, 1.6, "F");
  doc.setTextColor(...IVORY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6);
  doc.text("PAMELA VIURY · L-4B", pinX + 10, pinY - 4);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(227, 201, 155);
  doc.text("Valet parking en cortesia", pinX + 10, pinY + 0.5);
}

/* --------------------------- Page furniture ------------------------ */

function addIvoryFrame(doc: jsPDF) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFillColor(...IVORY);
  doc.rect(0, 0, pageW, pageH, "F");
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.rect(8, 8, pageW - 16, pageH - 16, "S");
  doc.setDrawColor(...ROSEWOOD);
  doc.setLineWidth(0.18);
  doc.rect(10, 10, pageW - 20, pageH - 20, "S");
}

function addDarkHeader(doc: jsPDF, eyebrow: string, title: string) {
  const pageW = doc.internal.pageSize.getWidth();
  doc.setFillColor(...NOIR);
  doc.rect(10, 10, pageW - 20, 38, "F");
  doc.setFillColor(...ROSEWOOD);
  doc.rect(10, 48, pageW - 20, 1.1, "F");

  drawVectorMonogram(doc, 26, 19, 1.05, true);

  doc.setTextColor(227, 201, 155);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(6.6);
  doc.text(BRAND_LINE_1, 40, 20.5);

  doc.setTextColor(...IVORY);
  doc.setFont("times", "bold");
  doc.setFontSize(20);
  doc.text(BRAND_NAME, 40, 28.5);

  doc.setTextColor(227, 201, 155);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.4);
  doc.text(eyebrow.toUpperCase(), 40, 34);

  doc.setTextColor(214, 202, 214);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.3);
  doc.text(`${title}  |  ${ADDRESS_LINE}`, 40, 39.7);
  doc.text(CONTACT_LINE, 40, 44.2);
}

function addDocumentFooter(doc: jsPDF, label: string) {
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  doc.setTextColor(...INK_SOFT);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(6.4);
  doc.text(
    `Salon de Belleza Pamela Viury · ${label} · Documento generado digitalmente en pamelaviury.mx · Cd. Juarez, Chihuahua`,
    pageW / 2,
    pageH - 12.5,
    { align: "center" }
  );
}

function sectionHeading(
  doc: jsPDF,
  eyebrow: string,
  title: string,
  x: number,
  y: number
) {
  doc.setTextColor(...ROSEWOOD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.2);
  doc.text(eyebrow.toUpperCase(), x, y);
  doc.setTextColor(...NOIR);
  doc.setFont("times", "bold");
  doc.setFontSize(17);
  doc.text(title, x, y + 7.5);
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.55);
  doc.line(x, y + 10.4, x + 22, y + 10.4);
}

function careRecommendations(category: string): string[] {
  if (category.includes("Cabello")) {
    return [
      "Evita lavar tu cabello durante las primeras 48 horas para sellar el tratamiento.",
      "Usa shampoo sin sulfatos y mascarilla nutritiva una vez por semana.",
      "Aplica protector termico antes de secadora o plancha, especialmente con el sol de Juarez.",
      "Agenda tu gloss de mantenimiento entre la semana 6 y 8 para conservar el brillo espejo.",
    ];
  }
  if (category.includes("Novias") || category.includes("Maquillaje")) {
    return [
      "Hidrata labios y contorno de ojos la noche previa; evita productos nuevos 72 h antes.",
      "Llega con el rostro limpio y el cabello lavado la noche anterior, sin aceites pesados.",
      "Trae fotografias de inspiracion y, si es posible, una foto de tu vestido y tocado.",
      "Tu kit de retoque incluye labial y papel matificante para lucir impecable todo el evento.",
    ];
  }
  if (category.includes("Uñas") || category.includes("Unas")) {
    return [
      "Aplica aceite de cuticula cada noche para prolongar el acabado de tu manicura rusa.",
      "Evita usar tus unas como herramienta y utiliza guantes al lavar trastes.",
      "No retires el producto en casa: tu retiro profesional en salon cuida tu una natural.",
      "El retoque ideal BIAB se realiza entre los 18 y 24 dias posteriores.",
    ];
  }
  return [
    "Mantente hidratada: el clima desertico de Cd. Juarez exige 1.5 a 2 litros de agua al dia.",
    "Usa protector solar FPS 50 y reaplica cada 3 horas tras tu tratamiento facial.",
    "Evita exfoliantes fuertes y sauna durante las primeras 48 horas.",
    "Duerme sobre funda limpia y evita tocar tu rostro para proteger el resultado.",
  ];
}

function serviceImageFor(appointment: AppointmentRecord): string {
  const name = appointment.serviceName.toLowerCase();
  if (name.includes("novia")) return "/images/service-bridal.jpg";
  if (appointment.category.includes("Cabello")) return "/images/service-balayage.jpg";
  if (appointment.category.includes("Maquillaje")) return "/images/service-makeup.jpg";
  if (appointment.category.includes("Uñas") || appointment.category.includes("Unas"))
    return "/images/service-nails.jpg";
  return "/images/service-facial.jpg";
}

/* ================================================================== */
/*  1) FOLIO OFICIAL DE CITA — 2 pages: voucher + welcome guide        */
/* ================================================================== */

export async function downloadAppointmentFolioPDF(
  appointment: AppointmentRecord
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();

  const [serviceImg, heroImg] = await Promise.all([
    loadImageDataUrl(serviceImageFor(appointment)),
    loadImageDataUrl("/images/hero-salon.jpg"),
  ]);

  /* ------------------------------ PAGE 1 ------------------------------ */
  addIvoryFrame(doc);
  addDarkHeader(doc, "Comprobante Oficial de Cita · Folio Digital Verificado", "Reserva Confirmada");

  // Folio ribbon + barcode + status
  doc.setFillColor(...BLUSH);
  doc.rect(10, 49.1, pageW - 20, 23, "F");
  doc.setTextColor(...ROSEWOOD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("FOLIO OFICIAL PAMELA VIURY  /  PRESENTAR EN RECEPCION", 18, 56);
  doc.setTextColor(...NOIR);
  doc.setFont("courier", "bold");
  doc.setFontSize(17);
  doc.text(appointment.folio, 18, 65);
  drawFolioBarcode(doc, appointment.folio, 92, 57.5);

  const statusUpper = appointment.status.toUpperCase();
  if (appointment.status === "cancelada") doc.setFillColor(154, 48, 62);
  else if (appointment.status === "reprogramada") doc.setFillColor(165, 120, 52);
  else doc.setFillColor(46, 111, 84);
  doc.roundedRect(pageW - 64, 54, 46, 11, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text(`CITA ${statusUpper}`, pageW - 41, 61, { align: "center" });

  // Date / time banner
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(222, 208, 219);
  doc.setLineWidth(0.35);
  doc.roundedRect(18, 78, pageW - 36, 23, 2.5, 2.5, "FD");
  const formattedDate = formatDateSpanish(appointment.appointmentDate);
  const capitalizedDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  doc.setTextColor(...ROSEWOOD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("FECHA PROGRAMADA", 25, 85);
  doc.text("HORARIO RESERVADO (CD. JUAREZ)", 122, 85);
  doc.setTextColor(...NOIR);
  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.text(capitalizedDate, 25, 94, { maxWidth: 92 });
  doc.text(
    `${appointment.appointmentTime} HRS (${appointment.durationMinutes} min aprox.)`,
    122,
    94
  );

  // Client + specialist cards
  const colW = (pageW - 42) / 2;
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(18, 106, colW, 55, 2.5, 2.5, "FD");
  doc.roundedRect(24 + colW, 106, colW, 55, 2.5, 2.5, "FD");

  doc.setTextColor(...ROSEWOOD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("DATOS DE LA CLIENTA", 24, 114);
  doc.text("ESPECIALISTA & REGISTRO", 30 + colW, 114);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.4);
  doc.setTextColor(...INK_SOFT);
  doc.text("Nombre titular:", 24, 123);
  doc.text("Artista asignada:", 30 + colW, 123);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...NOIR);
  doc.text(appointment.clientName, 24, 128.5, { maxWidth: colW - 12 });
  doc.text(appointment.stylistName, 30 + colW, 128.5, { maxWidth: colW - 12 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.4);
  doc.setTextColor(...INK_SOFT);
  doc.text("Telefono / WhatsApp:", 24, 137);
  doc.text("Departamento:", 30 + colW, 137);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.3);
  doc.setTextColor(...NOIR);
  doc.text(appointment.clientPhone, 24, 142);
  doc.text(appointment.category, 30 + colW, 142, { maxWidth: colW - 12 });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.4);
  doc.setTextColor(...INK_SOFT);
  doc.text("Cortesia Barra Pamela Viury:", 24, 150.5);
  doc.text("Codigo criptografico del salon:", 30 + colW, 150.5);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8.3);
  doc.setTextColor(...ROSEWOOD);
  doc.text(appointment.beveragePreference, 24, 155.5, { maxWidth: colW - 12 });
  doc.setFont("courier", "bold");
  doc.setFontSize(9.3);
  doc.setTextColor(...NOIR);
  doc.text(appointment.verificationCode, 30 + colW, 155.5);

  // Investment breakdown with service photography
  doc.setFillColor(...NOIR);
  doc.roundedRect(18, 167, pageW - 36, 9.5, 1.5, 1.5, "F");
  doc.setTextColor(...IVORY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("SERVICIO SELECCIONADO", 24, 173.2);
  doc.text("DURACION", 140, 173.2);
  doc.text("INVERSION MXN", pageW - 24, 173.2, { align: "right" });

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(222, 208, 219);
  doc.rect(18, 176.5, pageW - 36, 28, "FD");

  let textX = 24;
  if (serviceImg) {
    addImageCover(doc, serviceImg, 21, 179.5, 24, 22);
    textX = 49;
  }
  doc.setTextColor(...NOIR);
  doc.setFont("times", "bold");
  doc.setFontSize(11.5);
  doc.text(appointment.serviceName, textX, 185.5, { maxWidth: 86 });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(...INK_SOFT);
  doc.text(
    appointment.notes
      ? `Notas personalizadas: ${appointment.notes}`
      : "Incluye diagnostico personalizado, bebida de cortesia y valet parking sin costo.",
    textX,
    191,
    { maxWidth: 86 }
  );
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(...NOIR);
  doc.text(`${appointment.durationMinutes} min`, 140, 185.5);
  doc.setFont("courier", "bold");
  doc.setFontSize(11.5);
  doc.text(formatMxn(appointment.priceMxn), pageW - 24, 185.5, { align: "right" });

  doc.setDrawColor(238, 228, 236);
  doc.line(24, 196, pageW - 24, 196);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(...INK_SOFT);
  doc.text("Valet Parking Plaza Campos Eliseos + Barra Gourmet de Bienvenida", 24, 201.2);
  doc.setTextColor(46, 111, 84);
  doc.setFont("helvetica", "bold");
  doc.text("CORTESIA INCLUIDA", pageW - 24, 201.2, { align: "right" });

  doc.setFillColor(...BLUSH);
  doc.rect(112, 207, pageW - 130, 12.5, "F");
  doc.setTextColor(...ROSEWOOD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("TOTAL A LIQUIDAR EN SALON:", 116, 214.6);
  doc.setTextColor(...NOIR);
  doc.setFont("courier", "bold");
  doc.setFontSize(12);
  doc.text(formatMxn(appointment.priceMxn), pageW - 22, 214.6, { align: "right" });

  // QR + reception notes + seal
  const qrPayload = [
    "SALON DE BELLEZA PAMELA VIURY - CD. JUAREZ",
    `FOLIO:${appointment.folio}`,
    `VERIF:${appointment.verificationCode}`,
    `CLIENTA:${appointment.clientName}`,
    `SERVICIO:${appointment.serviceName}`,
    `FECHA:${appointment.appointmentDate} ${appointment.appointmentTime}`,
    `TOTAL:${formatMxn(appointment.priceMxn)}`,
  ].join(" | ");

  const qrDataUrl = await QRCode.toDataURL(qrPayload, {
    width: 240,
    margin: 1,
    color: { dark: "#21171D", light: "#FFFFFF" },
  });

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...GOLD);
  doc.roundedRect(18, 224, 33, 33, 2, 2, "FD");
  doc.addImage(qrDataUrl, "PNG", 19.5, 225.5, 30, 30);

  doc.setTextColor(...NOIR);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("INDICACIONES DE RECEPCION:", 56, 229.5);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.3);
  doc.setTextColor(...INK_SOFT);
  const policies = [
    "1. Presenta este PDF, tu folio o el codigo QR en recepcion al llegar.",
    "2. Tienes 15 minutos de tolerancia para proteger la agenda de todas.",
    "3. Cambios sin cargo hasta 6 horas antes desde el portal web.",
    "4. Valet parking gratuito frente al Local 4B en Campos Eliseos.",
  ];
  let py = 235.5;
  policies.forEach((line) => {
    doc.text(line, 56, py, { maxWidth: 88 });
    py += 6;
  });

  drawOfficialSealStamp(doc, pageW - 39, 237);
  addDocumentFooter(doc, `Folio ${appointment.folio} · Pagina 1 de 2`);

  /* ------------------------------ PAGE 2 ------------------------------ */
  doc.addPage("letter", "portrait");
  addIvoryFrame(doc);
  addDarkHeader(doc, "Guia de Bienvenida Personalizada", "Tu Experiencia Pamela Viury");

  if (heroImg) {
    addImageCover(doc, heroImg, 18, 56, pageW - 36, 52);
    doc.setFillColor(33, 23, 29);
    doc.setTextColor(...IVORY);
    doc.setFont("times", "italic");
    doc.setFontSize(13);
    doc.text("Suite Principal Pamela Viury - Zona Campos Eliseos", 24, 103);
  }

  sectionHeading(doc, "Antes de tu visita", "Preparacion recomendada", 18, 118);
  const care = careRecommendations(appointment.category);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.4);
  doc.setTextColor(74, 62, 70);
  let cy = 135;
  care.forEach((item, idx) => {
    doc.setFillColor(...ROSEWOOD);
    doc.circle(21, cy - 1.2, 2.1, "F");
    doc.setTextColor(...IVORY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.5);
    doc.text(String(idx + 1), 21, cy + 0.25, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.4);
    doc.setTextColor(74, 62, 70);
    doc.text(item, 26, cy, { maxWidth: pageW - 46 });
    cy += 9;
  });

  sectionHeading(doc, "Tu visita en salon", "Tu experiencia en 4 actos", 18, 176);
  const acts = [
    ["I. Bienvenida", "Valet, QR y bebida de cortesia Pamela Viury."],
    ["II. Diagnostico", "Analisis personalizado y diseno a tu medida."],
    ["III. Atencion Signature", "Tecnica profesional con productos de alta gama."],
    ["IV. Salida Editorial", "Styling final, foto y guia de cuidado en casa."],
  ];
  const actW = (pageW - 36 - 9) / 4;
  acts.forEach(([title, body], i) => {
    const ax = 18 + i * (actW + 3);
    doc.setFillColor(i % 2 === 0 ? 255 : 246, i % 2 === 0 ? 255 : 239, i % 2 === 0 ? 255 : 244);
    doc.setDrawColor(222, 208, 219);
    doc.roundedRect(ax, 193, actW, 27, 2, 2, "FD");
    doc.setTextColor(...ROSEWOOD);
    doc.setFont("times", "bold");
    doc.setFontSize(9.5);
    doc.text(title, ax + 4, 200, { maxWidth: actW - 8 });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.2);
    doc.setTextColor(...INK_SOFT);
    doc.text(body, ax + 4, 205.5, { maxWidth: actW - 8 });
  });

  sectionHeading(doc, "Como llegar", "Croquis Campos Eliseos", 18, 231);
  drawMiniMap(doc, 18, 248, 108, 48 > 20 ? 44 : 44);
  // The mini-map above is intentionally compact; contact card sits beside it.
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(222, 208, 219);
  doc.roundedRect(131, 248, pageW - 149, 44, 2, 2, "FD");
  doc.setTextColor(...ROSEWOOD);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("CONCIERGE PAMELA VIURY", 137, 256);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(74, 62, 70);
  doc.text(
    [
      "WhatsApp: (656) 688-4920",
      "concierge@pamelaviury.mx",
      ADDRESS_LINE,
      "Mar-Sab 9:00 a 20:00 hrs",
    ],
    137,
    262,
    { maxWidth: pageW - 161 }
  );

  addDocumentFooter(doc, `Guia de bienvenida · Folio ${appointment.folio} · Pagina 2 de 2`);

  doc.save(`Folio_${appointment.folio}_PamelaViury_CdJuarez.pdf`);
}

/* ================================================================== */
/*  2) CATALOGO SIGNATURE 2026 — editorial multi-page lookbook         */
/* ================================================================== */

const VIURY_PACKAGES: Array<{
  name: string;
  price: number;
  tagline: string;
  includes: string[];
}> = [
  {
    name: "Esencial Pamela Viury",
    price: 1890,
    tagline: "Tu cuidado mensual de luminosidad",
    includes: ["Corte de autor + tratamiento Kerastase", "Manicura rusa BIAB", "Diseno de cejas HD"],
  },
  {
    name: "Signature Pamela Viury",
    price: 4490,
    tagline: "La transformacion completa de la casa",
    includes: ["Balayage Couture Olaplex", "Hidrafacial diamante", "Maquillaje social HD + peinado"],
  },
  {
    name: "Novia Prive Pamela Viury",
    price: 7950,
    tagline: "Suite privada para el gran dia",
    includes: ["Prueba completa previa", "Maquillaje blindado 16 h", "Suite privada + brindis rose"],
  },
];

export async function downloadSalonMenuPDF(
  serviceList: ServiceRecord[],
  stylistList: StylistRecord[]
): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  const heroImg = await loadImageDataUrl("/images/hero-salon.jpg");
  const bridalImg = await loadImageDataUrl("/images/service-bridal.jpg");

  /* COVER */
  doc.setFillColor(...NOIR);
  doc.rect(0, 0, pageW, pageH, "F");
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.6);
  doc.rect(8, 8, pageW - 16, pageH - 16, "S");
  drawVectorMonogram(doc, pageW / 2, 26, 1.7, true);

  doc.setTextColor(227, 201, 155);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text(BRAND_LINE_1, pageW / 2, 68, { align: "center" });
  doc.setTextColor(...IVORY);
  doc.setFont("times", "bold");
  doc.setFontSize(34);
  doc.text(BRAND_NAME, pageW / 2, 82, { align: "center" });
  doc.setFont("times", "italic");
  doc.setFontSize(15);
  doc.setTextColor(227, 201, 155);
  doc.text("Catalogo Signature de Servicios de Belleza 2026", pageW / 2, 93, {
    align: "center",
  });

  if (heroImg) addImageCover(doc, heroImg, 18, 104, pageW - 36, 98);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(214, 202, 214);
  doc.text(ADDRESS_LINE, pageW / 2, 216, { align: "center", maxWidth: pageW - 36 });
  doc.text(CONTACT_LINE, pageW / 2, 222, { align: "center" });
  doc.setTextColor(...GOLD);
  doc.setFont("helvetica", "bold");
  doc.text("RESERVA EN LINEA Y DESCARGA TU FOLIO OFICIAL CON CODIGO QR", pageW / 2, 236, {
    align: "center",
  });

  /* SERVICES */
  doc.addPage("letter", "portrait");
  addIvoryFrame(doc);
  addDarkHeader(doc, "Carta Signature 2026", "Servicios de Belleza");
  let y = 58;

  for (const srv of serviceList) {
    if (y > 238) {
      addDocumentFooter(doc, "Catalogo Signature 2026");
      doc.addPage("letter", "portrait");
      addIvoryFrame(doc);
      addDarkHeader(doc, "Carta Signature 2026", "Servicios de Belleza (cont.)");
      y = 58;
    }
    const img = await loadImageDataUrl(srv.imageUrl);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(224, 212, 221);
    doc.roundedRect(15, y, pageW - 30, 20, 1.8, 1.8, "FD");
    let tx = 20;
    if (img) {
      addImageCover(doc, img, 17.5, y + 2.5, 22, 15);
      tx = 43;
    }
    doc.setTextColor(...ROSEWOOD);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(6.6);
    doc.text(`${srv.category.toUpperCase()}  ·  ${srv.durationMinutes} MIN`, tx, y + 5.2);
    doc.setTextColor(...NOIR);
    doc.setFont("times", "bold");
    doc.setFontSize(10.8);
    doc.text(srv.name, tx, y + 10.8, { maxWidth: pageW - tx - 42 });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.1);
    doc.setTextColor(...INK_SOFT);
    doc.text(srv.includes, tx, y + 16, { maxWidth: pageW - tx - 42 });
    doc.setFont("courier", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...NOIR);
    doc.text(formatMxn(srv.priceMxn), pageW - 20, y + 11, { align: "right" });
    y += 22.6;
  }
  addDocumentFooter(doc, "Catalogo Signature 2026 · Servicios");

  /* PACKAGES */
  doc.addPage("letter", "portrait");
  addIvoryFrame(doc);
  addDarkHeader(doc, "Paquetes & Membresias", "Experiencias Pamela Viury");
  sectionHeading(doc, "Colecciones 2026", "Paquetes Signature", 18, 62);

  let py = 80;
  VIURY_PACKAGES.forEach((pkg, idx) => {
    doc.setFillColor(idx === 1 ? 33 : 255, idx === 1 ? 23 : 255, idx === 1 ? 29 : 255);
    doc.setDrawColor(...GOLD);
    doc.roundedRect(18, py, pageW - 36, 34, 2.4, 2.4, "FD");
    doc.setTextColor(...(idx === 1 ? IVORY : NOIR));
    doc.setFont("times", "bold");
    doc.setFontSize(15);
    doc.text(pkg.name, 25, py + 10);
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(...(idx === 1 ? [227, 201, 155] as [number, number, number] : ROSEWOOD));
    doc.text(pkg.tagline, 25, py + 16);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(...(idx === 1 ? [228, 218, 228] as [number, number, number] : INK_SOFT));
    doc.text(pkg.includes.map((i) => `- ${i}`).join("   "), 25, py + 23, {
      maxWidth: pageW - 92,
    });
    doc.setFont("courier", "bold");
    doc.setFontSize(14);
    doc.setTextColor(...(idx === 1 ? IVORY : NOIR));
    doc.text(formatMxn(pkg.price), pageW - 25, py + 13, { align: "right" });
    if (idx === 1) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(6.5);
      doc.setTextColor(227, 201, 155);
      doc.text("EL FAVORITO DE LA CASA", pageW - 25, py + 19, { align: "right" });
    }
    py += 39;
  });

  if (bridalImg) addImageCover(doc, bridalImg, 18, py + 2, pageW - 36, 52);
  addDocumentFooter(doc, "Catalogo Signature 2026 · Paquetes");

  /* SPECIALISTS + LOCATION */
  doc.addPage("letter", "portrait");
  addIvoryFrame(doc);
  addDarkHeader(doc, "Direccion Artistica & Ubicacion", "La Casa Pamela Viury");
  sectionHeading(doc, "Especialistas", "Talento certificado en Cd. Juarez", 18, 62);

  let sy = 80;
  for (const st of stylistList) {
    const avatar = await loadImageDataUrl(st.avatarUrl);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(224, 212, 221);
    doc.roundedRect(18, sy, pageW - 36, 27, 2.2, 2.2, "FD");
    if (avatar) addImageCover(doc, avatar, 21, sy + 3, 20, 21);
    doc.setTextColor(...NOIR);
    doc.setFont("times", "bold");
    doc.setFontSize(13);
    doc.text(st.name, 46, sy + 9);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.2);
    doc.setTextColor(...ROSEWOOD);
    doc.text(`${st.role.toUpperCase()}  ·  ${st.experienceYears} ANOS  ·  ${st.rating}`, 46, sy + 14.5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.8);
    doc.setTextColor(...INK_SOFT);
    doc.text(st.bio, 46, sy + 20, { maxWidth: pageW - 70 });
    sy += 31;
  }

  sectionHeading(doc, "Ubicacion", "Zona Campos Eliseos", 18, sy + 4);
  drawMiniMap(doc, 18, sy + 22, 108, 46);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.2);
  doc.setTextColor(74, 62, 70);
  doc.text(
    [ADDRESS_LINE, CONTACT_LINE, "Martes a Sabado 9:00 a 20:00 hrs.", "Valet parking gratuito con tu folio QR."],
    132,
    sy + 30,
    { maxWidth: pageW - 152 }
  );
  addDocumentFooter(doc, "Catalogo Signature 2026 · La Casa");

  doc.save("Catalogo_Signature_PamelaViury_CdJuarez_2026.pdf");
}

/* ================================================================== */
/*  3) GUIA NUPCIAL PRIVE — bridal editorial brochure                  */
/* ================================================================== */

export async function downloadBridalGuidePDF(): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const bridalImg = await loadImageDataUrl("/images/service-bridal.jpg");
  const makeupImg = await loadImageDataUrl("/images/service-makeup.jpg");

  doc.setFillColor(...NOIR);
  doc.rect(0, 0, pageW, pageH, "F");
  doc.setDrawColor(...GOLD);
  doc.rect(8, 8, pageW - 16, pageH - 16, "S");
  if (bridalImg) addImageCover(doc, bridalImg, 18, 18, pageW - 36, 132);
  drawVectorMonogram(doc, pageW / 2, 162, 1.25, true);
  doc.setTextColor(227, 201, 155);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("SALON DE BELLEZA PAMELA VIURY", pageW / 2, 194, { align: "center" });
  doc.setTextColor(...IVORY);
  doc.setFont("times", "bold");
  doc.setFontSize(28);
  doc.text("GUIA NUPCIAL PRIVE", pageW / 2, 207, { align: "center" });
  doc.setFont("times", "italic");
  doc.setFontSize(12);
  doc.setTextColor(227, 201, 155);
  doc.text("El arte de llegar radiante al altar - Cd. Juarez & El Paso", pageW / 2, 216, {
    align: "center",
  });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(214, 202, 214);
  doc.text(`${ADDRESS_LINE}  ·  ${CONTACT_LINE}`, pageW / 2, 238, {
    align: "center",
    maxWidth: pageW - 32,
  });

  doc.addPage("letter", "portrait");
  addIvoryFrame(doc);
  addDarkHeader(doc, "Cronograma de Belleza Nupcial", "Novia Prive Pamela Viury");

  const timeline: Array<[string, string]> = [
    ["90 dias antes", "Reserva tu fecha y agenda la prueba completa de maquillaje y peinado. Inicia faciales mensuales de luminosidad."],
    ["30 dias antes", "Prueba nupcial definitiva con fotografia en luz natural y de salon. Define tocado, velo y joyeria."],
    ["7 dias antes", "Hidrafacial suave, diseno de cejas HD y manicura rusa de la novia. Evita cambios drasticos de color."],
    ["1 dia antes", "Lava tu cabello por la noche, hidrata labios y duerme temprano. Prepara tu bolsa de emergencia."],
    ["El gran dia", "Suite privada Pamela Viury: brindis rose, maquillaje blindado 16 h, peinado, velo y kit de retoque."],
  ];

  let y = 62;
  timeline.forEach(([when, what], idx) => {
    doc.setFillColor(...ROSEWOOD);
    doc.circle(25, y + 4, 5, "F");
    doc.setTextColor(...IVORY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.text(String(idx + 1), 25, y + 6.8, { align: "center" });
    if (idx < timeline.length - 1) {
      doc.setDrawColor(...GOLD);
      doc.setLineWidth(0.4);
      doc.line(25, y + 10, 25, y + 24);
    }
    doc.setTextColor(...NOIR);
    doc.setFont("times", "bold");
    doc.setFontSize(13);
    doc.text(when, 35, y + 5);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.4);
    doc.setTextColor(...INK_SOFT);
    doc.text(what, 35, y + 11, { maxWidth: pageW - 56 });
    y += 26;
  });

  if (makeupImg) addImageCover(doc, makeupImg, 18, y + 2, 82, 48);
  doc.setFillColor(...NOIR);
  doc.roundedRect(106, y + 2, pageW - 124, 48, 2.4, 2.4, "F");
  doc.setTextColor(227, 201, 155);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.5);
  doc.text("NOVIA PRIVE PAMELA VIURY", 114, y + 12);
  doc.setTextColor(...IVORY);
  doc.setFont("courier", "bold");
  doc.setFontSize(15);
  doc.text("$7,950.00 MXN", 114, y + 21);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  doc.setTextColor(228, 218, 228);
  doc.text(
    "Incluye prueba completa, facial luminoso, suite privada, colocacion de velo y kit de retoque. Reserva con folio oficial en pamelaviury.mx",
    114,
    y + 28,
    { maxWidth: pageW - 140 }
  );

  addDocumentFooter(doc, "Guia Nupcial Prive 2026");
  doc.save("Guia_Nupcial_Prive_PamelaViury_CdJuarez.pdf");
}

/* ================================================================== */
/*  4) CERTIFICADO DE REGALO — landscape luxury gift card              */
/* ================================================================== */

export async function downloadGiftCardPDF(
  amountMxn = 1000,
  recipient = "Para una mujer extraordinaria",
  sender = "Con carino"
): Promise<void> {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const code = `PV-GIFT-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  doc.setFillColor(...NOIR);
  doc.rect(0, 0, pageW, pageH, "F");
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.7);
  doc.rect(9, 9, pageW - 18, pageH - 18, "S");
  doc.setDrawColor(...ROSEWOOD);
  doc.setLineWidth(0.25);
  doc.rect(12, 12, pageW - 24, pageH - 24, "S");

  const loungeImg = await loadImageDataUrl("/images/salon-lounge.jpg");
  if (loungeImg) addImageCover(doc, loungeImg, pageW - 92, 18, 74, pageH - 36);

  drawVectorMonogram(doc, 38, 24, 1.35, true);
  doc.setTextColor(227, 201, 155);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text(BRAND_LINE_1, 54, 31);
  doc.setTextColor(...IVORY);
  doc.setFont("times", "bold");
  doc.setFontSize(24);
  doc.text(BRAND_NAME, 54, 41);

  doc.setFont("times", "italic");
  doc.setFontSize(20);
  doc.setTextColor(227, 201, 155);
  doc.text("Certificado de Regalo", 26, 72);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(228, 218, 228);
  doc.text(recipient, 26, 86, { maxWidth: 150 });
  doc.setFontSize(9);
  doc.setTextColor(190, 176, 190);
  doc.text(sender, 26, 94);

  doc.setTextColor(...IVORY);
  doc.setFont("courier", "bold");
  doc.setFontSize(28);
  doc.text(formatMxn(amountMxn), 26, 116);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(227, 201, 155);
  doc.text("Aplicable en cualquier servicio, paquete o producto profesional en salon.", 26, 124, {
    maxWidth: 150,
  });

  const qrDataUrl = await QRCode.toDataURL(
    `SALON DE BELLEZA PAMELA VIURY | GIFT:${code} | MONTO:${formatMxn(amountMxn)} | ${recipient}`,
    { width: 200, margin: 1, color: { dark: "#21171D", light: "#FFFFFF" } }
  );
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(26, 138, 34, 34, 2, 2, "F");
  doc.addImage(qrDataUrl, "PNG", 28, 140, 30, 30);

  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  doc.setTextColor(...IVORY);
  doc.text(code, 66, 150);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(190, 176, 190);
  doc.text(
    "Vigencia 6 meses · Presenta este certificado o su codigo QR en recepcion · No canjeable por efectivo",
    66,
    157,
    { maxWidth: 112 }
  );
  doc.text(`${ADDRESS_LINE} · (656) 688-4920`, 66, 168, { maxWidth: 112 });

  doc.save(`Certificado_Regalo_${code}_PamelaViury.pdf`);
}

/* ================================================================== */
/*  5) GUIA DE CUIDADO EN CASA — home-care keepsake guide            */
/* ================================================================== */

export async function downloadHomeCarePDF(): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "letter" });
  const pageW = doc.internal.pageSize.getWidth();
  addIvoryFrame(doc);
  addDarkHeader(doc, "Guía de Cuidado en Casa", "Belleza Pamela Viury en tu hogar");

  const facialImg = await loadImageDataUrl("/images/service-facial.jpg");
  if (facialImg) addImageCover(doc, facialImg, 18, 56, pageW - 36, 58);

  const columns: Array<{ title: string; items: string[] }> = [
    {
      title: "Cabello Signature",
      items: [
        "Shampoo sin sulfatos 2-3 veces por semana.",
        "Mascarilla nutritiva dominical de 10 minutos.",
        "Protector termico y solar capilar diario en Juarez.",
        "Funda de seda para dormir sin frizz.",
      ],
    },
    {
      title: "Piel Luminosa",
      items: [
        "Doble limpieza nocturna suave, sin tallar.",
        "Suero de acido hialuronico sobre piel humeda.",
        "FPS 50 cada manana, reaplica cada 3 horas.",
        "Gua Sha de cuarzo 3 noches por semana.",
      ],
    },
    {
      title: "Unas Couture",
      items: [
        "Aceite de cuticula cada noche antes de dormir.",
        "Guantes para tareas con agua y detergentes.",
        "Nunca retires el producto en casa.",
        "Retoque BIAB entre los dias 18 y 24.",
      ],
    },
  ];

  let y = 122;
  columns.forEach((col) => {
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(224, 212, 221);
    doc.roundedRect(18, y, pageW - 36, 32, 2.2, 2.2, "FD");
    doc.setTextColor(...ROSEWOOD);
    doc.setFont("times", "bold");
    doc.setFontSize(13);
    doc.text(col.title, 25, y + 9);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.2);
    doc.setTextColor(74, 62, 70);
    col.items.forEach((item, i) => {
      doc.text(`-  ${item}`, 25, y + 15.5 + i * 4.4, { maxWidth: pageW - 50 });
    });
    y += 36;
  });

  doc.setTextColor(...ROSEWOOD);
  doc.setFont("times", "italic");
  doc.setFontSize(14);
  doc.text("Pamela Viury", 18, y + 8);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(...INK_SOFT);
  doc.text("Fundadora & Directora Creativa · Salon de Belleza Pamela Viury, Cd. Juarez", 18, y + 13.5);
  drawOfficialSealStamp(doc, pageW - 39, y + 2);

  addDocumentFooter(doc, "Guía de Cuidado en Casa");
  doc.save("Guia_Cuidado_Casa_PamelaViury.pdf");
}

/* ------------------------- Calendar (.ics) -------------------------- */

export function downloadCalendarICS(appointment: AppointmentRecord): void {
  const [year, month, day] = appointment.appointmentDate.split("-").map(Number);
  const [hour, minute] = appointment.appointmentTime.split(":").map(Number);

  const pad = (n: number) => String(n).padStart(2, "0");
  const startStr = `${year}${pad(month)}${pad(day)}T${pad(hour)}${pad(minute)}00`;

  const endDate = new Date(year, month - 1, day, hour, minute + appointment.durationMinutes);
  const endStr = `${endDate.getFullYear()}${pad(endDate.getMonth() + 1)}${pad(
    endDate.getDate()
  )}T${pad(endDate.getHours())}${pad(endDate.getMinutes())}00`;

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Salon de Belleza Pamela Viury Cd Juarez//Citas Oficiales//ES",
    "BEGIN:VEVENT",
    `UID:${appointment.folio}@pamelaviury.mx`,
    `DTSTART;TZID=America/Ciudad_Juarez:${startStr}`,
    `DTEND;TZID=America/Ciudad_Juarez:${endStr}`,
    `SUMMARY:Cita Pamela Viury (${appointment.folio}) - ${appointment.serviceName}`,
    `LOCATION:Blvd. Tomás Fernández 8245\\, Campos Elíseos\\, Cd. Juárez\\, Chih.`,
    `DESCRIPTION:Folio Oficial Pamela Viury: ${appointment.folio}\\nEspecialista: ${appointment.stylistName}\\nCortesía: ${appointment.beveragePreference}\\nInversión: ${formatMxn(appointment.priceMxn)}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Cita_${appointment.folio}_PamelaViury.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
