import { db } from "@/db";
import { appointments, services, stylists } from "@/db/schema";
import { count, sql } from "drizzle-orm";

let initializedPromise: Promise<void> | null = null;

function futureDateISO(daysAhead: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function ensureDatabaseReady(): Promise<void> {
  if (!initializedPromise) {
    initializedPromise = runBootstrap().catch((err) => {
      initializedPromise = null;
      throw err;
    });
  }
  return initializedPromise;
}

async function runBootstrap(): Promise<void> {
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS services (
      id SERIAL PRIMARY KEY,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      includes TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      price_mxn INTEGER NOT NULL,
      image_url TEXT NOT NULL,
      featured BOOLEAN NOT NULL DEFAULT FALSE
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS stylists (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL,
      specialty TEXT NOT NULL,
      experience_years INTEGER NOT NULL,
      bio TEXT NOT NULL,
      avatar_url TEXT NOT NULL,
      instagram_handle TEXT NOT NULL,
      rating TEXT NOT NULL
    );
  `);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS appointments (
      id SERIAL PRIMARY KEY,
      folio TEXT NOT NULL UNIQUE,
      verification_code TEXT NOT NULL,
      client_name TEXT NOT NULL,
      client_phone TEXT NOT NULL,
      client_email TEXT NOT NULL,
      service_id INTEGER NOT NULL,
      service_name TEXT NOT NULL,
      category TEXT NOT NULL,
      stylist_id INTEGER NOT NULL,
      stylist_name TEXT NOT NULL,
      appointment_date TEXT NOT NULL,
      appointment_time TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL,
      price_mxn INTEGER NOT NULL,
      beverage_preference TEXT NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'confirmada',
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    );
  `);

  const [{ value: serviceCount }] = await db
    .select({ value: count() })
    .from(services);

  if (serviceCount === 0) {
    await db.insert(services).values([
      {
        slug: "balayage-couture-iluminado",
        name: "Balayage Couture & Diseño de Color",
        category: "Cabello & Color",
        description:
          "Diseño de iluminación tridimensional personalizado con técnica mano alzada, matiz gloss sin amoniaco y protección molecular Olaplex.",
        includes:
          "Diagnóstico capilar · Decoloración protegida Olaplex Paso 1 y 2 · Matiz Redken Shades EQ · Ampolleta Kérastase · Moldeado ondas de seda",
        durationMinutes: 180,
        priceMxn: 2650,
        imageUrl: "/images/service-balayage.jpg",
        featured: true,
      },
      {
        slug: "maquillaje-peinado-editorial",
        name: "Maquillaje Social HD & Alto Peinado",
        category: "Maquillaje & Novias",
        description:
          "Piel luminosa de larga duración adaptada al clima de Cd. Juárez con productos Dior Backstage y Charlotte Tilbury más peinado de gala.",
        includes:
          "Preparación de piel con suero hidratante · Maquillaje aerógrafo/HD · Pestañas de visón ligero · Peinado ondas glam o recogido · Kit retoque",
        durationMinutes: 120,
        priceMxn: 1890,
        imageUrl: "/images/service-makeup.jpg",
        featured: true,
      },
      {
        slug: "suite-nupcial-pamela-viury",
        name: "Experiencia Novia Pamela Viury Privé",
        category: "Maquillaje & Novias",
        description:
          "Experiencia exclusiva para novias en suite privada con prueba previa completa, diseño de imagen nupcial, velo y brindis rosé.",
        includes:
          "Sesión de prueba completa · Facial luminoso previo · Maquillaje y peinado nupcial blindado 16h · Colocación de tocado y velo · Bebida de cortesía",
        durationMinutes: 210,
        priceMxn: 4950,
        imageUrl: "/images/service-bridal.jpg",
        featured: true,
      },
      {
        slug: "manicura-rusa-couture",
        name: "Manicura Rusa & Nail Art Hoja de Oro",
        category: "Uñas & Nail Couture",
        description:
          "Perfección milimétrica de cutícula en seco, nivelación estructural BIAB japonés y diseño minimalista francés o detalles en oro 24k.",
        includes:
          "Limpieza rusa de alta precisión · Nivelación ruber/BIAB · Esmaltado japonés · Diseño fino en hoja de oro · Exfoliación e hidratación tibia",
        durationMinutes: 90,
        priceMxn: 780,
        imageUrl: "/images/service-nails.jpg",
        featured: true,
      },
      {
        slug: "hidrafacial-cuarzo-rosa",
        name: "Hidrafacial Diamante & Cuarzo Rosa",
        category: "Spa Facial & Cejas",
        description:
          "Renovación celular profunda para combatir la resequedad del desierto con hidrodermoabrasión, oxígeno hiperbárico y drenaje Gua Sha.",
        includes:
          "Doble limpieza botánica · Punta diamante · Infusión ácido hialurónico puro · Masaje escultor Cuarzo Rosa · Máscara LED colágeno",
        durationMinutes: 75,
        priceMxn: 1490,
        imageUrl: "/images/service-facial.jpg",
        featured: true,
      },
      {
        slug: "tratamiento-kerastase-corte-autor",
        name: "Corte de Autor & Tratamiento Kérastase Caviar",
        category: "Cabello & Color",
        description:
          "Diseño de corte visagista acompañado del tratamiento regenerador Chronologiste de Kérastase con masaje craneal relajante.",
        includes:
          "Asesoría de visagismo · Lavado spa con aromaterapia · Mascarilla Chronologiste · Corte de precisión · Secado Dyson Supersonic",
        durationMinutes: 90,
        priceMxn: 1250,
        imageUrl: "/images/hero-salon.jpg",
        featured: false,
      },
      {
        slug: "cejas-hd-lifting-pestanas",
        name: "Diseño de Cejas HD + Lash Lifting Keratina",
        category: "Spa Facial & Cejas",
        description:
          "Arquitectura de cejas con mapeo áureo, laminado nutritivo, tinte híbrido orgánico y rizado natural de pestañas con keratina.",
        includes:
          "Mapeo facial áureo · Depilación con hilo hindú · Laminado orgánico · Lifting de pestañas con botox · Tinte negro intenso",
        durationMinutes: 75,
        priceMxn: 890,
        imageUrl: "/images/salon-lounge.jpg",
        featured: false,
      },
      {
        slug: "alaciado-seda-botanica",
        name: "Alaciado Espejo Seda & Aceite de Argán",
        category: "Cabello & Color",
        description:
          "Alaciado progresivo 100% libre de formol enriquecido con aminoácidos de seda, perla y argán marroquí para un brillo espejo impecable.",
        includes:
          "Lavado quelante · Aplicación fórmula orgánica · Sellado térmico de titanio controlado · Corte de puntas · Suero sellador en casa",
        durationMinutes: 180,
        priceMxn: 2350,
        imageUrl: "/images/service-balayage.jpg",
        featured: false,
      },
    ]);
  }

  const [{ value: stylistCount }] = await db
    .select({ value: count() })
    .from(stylists);

  if (stylistCount === 0) {
    await db.insert(stylists).values([
      {
        name: "Pamela Viury",
        role: "Fundadora, Directora Creativa & Master Colorist",
        specialty: "Balayage Signature Pamela Viury, Rubios Luminosos & Corrección de Color",
        experienceYears: 14,
        bio: "Fundadora de la casa. Formada en París y Ciudad de México, Pamela Viury es el referente en diseño de color luminoso, imagen editorial y salud capilar de lujo en Cd. Juárez.",
        avatarUrl: "/images/stylist-valeria.jpg",
        instagramHandle: "@pamela.viury",
        rating: "5.0",
      },
      {
        name: "Camila Sofía Reyes",
        role: "Directora Nupcial & Makeup Artist",
        specialty: "Novias Editorial, Piel Luminosa HD & Alto Peinado",
        experienceYears: 9,
        bio: "Especialista en maquillaje blindado de alta gama para bodas y galas en Chihuahua, El Paso TX y destinos exclusivos.",
        avatarUrl: "/images/stylist-camila.jpg",
        instagramHandle: "@camilamakeup.jz",
        rating: "5.0",
      },
      {
        name: "Renata Villalobos",
        role: "Especialista Nail Couture & Facialista",
        specialty: "Manicura Rusa BIAB, Nail Art Minimalista & Hidrafacial",
        experienceYears: 7,
        bio: "Certificada en técnicas rusas y dermoestética botánica, reconocida por su delicadeza y acabados impecables.",
        avatarUrl: "/images/stylist-renata.jpg",
        instagramHandle: "@renata.skinandnails",
        rating: "4.9",
      },
    ]);
  }

  const [{ value: apptCount }] = await db
    .select({ value: count() })
    .from(appointments);

  if (apptCount === 0) {
    const allServices = await db.select().from(services);
    const allStylists = await db.select().from(stylists);

    const s1 = allServices[0];
    const s2 = allServices[1];
    const s3 = allServices[3];
    const s4 = allServices[4];

    const st1 = allStylists[0];
    const st2 = allStylists[1];
    const st3 = allStylists[2];

    await db.insert(appointments).values([
      {
        folio: "PV-2026-1042",
        verificationCode: "PVJZ-8F4A-2026",
        clientName: "Mariana Trevizo Luján",
        clientPhone: "656-318-4920",
        clientEmail: "mariana.trevizo@ejemplo.mx",
        serviceId: s1.id,
        serviceName: s1.name,
        category: s1.category,
        stylistId: st1.id,
        stylistName: st1.name,
        appointmentDate: futureDateISO(2),
        appointmentTime: "11:00",
        durationMinutes: s1.durationMinutes,
        priceMxn: s1.priceMxn,
        beveragePreference: "Matcha Latte Helado con Leche de Almendra",
        notes: "Deseo tonos caramelo miel luminosos respetando mi base natural.",
        status: "confirmada",
      },
      {
        folio: "PV-2026-1089",
        verificationCode: "PVJZ-3C9D-2026",
        clientName: "Fernanda Samaniego Chávez",
        clientPhone: "656-492-7105",
        clientEmail: "fer.samaniego@ejemplo.mx",
        serviceId: s2.id,
        serviceName: s2.name,
        category: s2.category,
        stylistId: st2.id,
        stylistName: st2.name,
        appointmentDate: futureDateISO(3),
        appointmentTime: "15:00",
        durationMinutes: s2.durationMinutes,
        priceMxn: s2.priceMxn,
        beveragePreference: "Mimosa Rosé Sin Alcohol",
        notes: "Boda civil en Hacienda San José a las 7:30 PM, vestido color champagne.",
        status: "confirmada",
      },
      {
        folio: "PV-2026-1104",
        verificationCode: "PVJZ-7B2E-2026",
        clientName: "Daniela Terrazas Fuentes",
        clientPhone: "656-274-8831",
        clientEmail: "d.terrazas@ejemplo.mx",
        serviceId: s3.id,
        serviceName: s3.name,
        category: s3.category,
        stylistId: st3.id,
        stylistName: st3.name,
        appointmentDate: futureDateISO(1),
        appointmentTime: "13:00",
        durationMinutes: s3.durationMinutes,
        priceMxn: s3.priceMxn,
        beveragePreference: "Capuccino Vainilla Gourmet",
        notes: "Uña almendra corta en tono milky rose con fino detalle dorado.",
        status: "confirmada",
      },
      {
        folio: "PV-2026-1127",
        verificationCode: "PVJZ-5E1C-2026",
        clientName: "Paulina Gallegos Armendáriz",
        clientPhone: "656-510-3394",
        clientEmail: "pau.gallegos@ejemplo.mx",
        serviceId: s4.id,
        serviceName: s4.name,
        category: s4.category,
        stylistId: st3.id,
        stylistName: st3.name,
        appointmentDate: futureDateISO(4),
        appointmentTime: "17:00",
        durationMinutes: s4.durationMinutes,
        priceMxn: s4.priceMxn,
        beveragePreference: "Infusión Botánica de Rosas & Lavanda",
        notes: "Piel sensible por cambio de clima, evitar fragancias fuertes.",
        status: "confirmada",
      },
    ]);
  }

  /* ---------------------------------------------------------------- */
  /* Pamela Viury rebrand migration — safe & idempotent for live data  */
  /* Converts any legacy folios, codes, services and founder records   */
  /* to the Salón de Belleza Pamela Viury identity without data loss.  */
  /* ---------------------------------------------------------------- */
  await db.execute(sql`
    UPDATE stylists
    SET name = 'Pamela Viury',
        role = 'Fundadora, Directora Creativa & Master Colorist',
        specialty = 'Balayage Signature Pamela Viury, Rubios Luminosos & Corrección de Color',
        bio = 'Fundadora de la casa. Formada en París y Ciudad de México, Pamela Viury es el referente en diseño de color luminoso, imagen editorial y salud capilar de lujo en Cd. Juárez.',
        instagram_handle = '@pamela.viury'
    WHERE name = 'Valeria Montemayor'
       OR instagram_handle LIKE '%veliaatelier%';
  `);

  await db.execute(sql`
    UPDATE services
    SET name = 'Experiencia Novia Pamela Viury Privé',
        slug = 'suite-nupcial-pamela-viury'
    WHERE name = 'Experiencia Novia Atelier Privada';
  `);

  await db.execute(sql`
    UPDATE appointments
    SET folio = REPLACE(folio, 'VLA-2026-', 'PV-2026-')
    WHERE folio LIKE 'VLA-2026-%';
  `);

  await db.execute(sql`
    UPDATE appointments
    SET verification_code = REPLACE(verification_code, 'JZR-', 'PVJZ-')
    WHERE verification_code LIKE 'JZR-%';
  `);

  await db.execute(sql`
    UPDATE appointments
    SET stylist_name = 'Pamela Viury'
    WHERE stylist_name = 'Valeria Montemayor';
  `);

  await db.execute(sql`
    UPDATE appointments
    SET service_name = 'Experiencia Novia Pamela Viury Privé'
    WHERE service_name = 'Experiencia Novia Atelier Privada';
  `);

  await db.execute(sql`
    UPDATE appointments
    SET client_email = REPLACE(client_email, '@veliaatelier.mx', '@pamelaviury.mx')
    WHERE client_email LIKE '%@veliaatelier.mx';
  `);

  /* Formal Pamela Viury terminology — services & treatments naming. */
  await db.execute(sql`
    UPDATE services
    SET name = REPLACE(name, 'Ritual', 'Tratamiento'),
        slug = REPLACE(slug, 'ritual-', 'tratamiento-'),
        description = REPLACE(description, 'Ritual exclusivo', 'Experiencia exclusiva')
    WHERE name LIKE '%Ritual%'
       OR slug LIKE '%ritual%'
       OR description LIKE '%Ritual%';
  `);

  await db.execute(sql`
    UPDATE appointments
    SET service_name = REPLACE(service_name, 'Ritual', 'Tratamiento')
    WHERE service_name LIKE '%Ritual%';
  `);
}
