# Salón de Belleza Pamela Viury

Plataforma web profesional para **Salón de Belleza Pamela Viury**, ubicado en **Blvd. Tomás Fernández 8245, Zona Campos Elíseos, Cd. Juárez, Chihuahua**.

La aplicación ofrece una experiencia editorial de alto nivel, reservación de citas en tiempo real, folios oficiales descargables en PDF con código QR, catálogo de servicios, paquetes, guía nupcial, certificados de regalo y administración de citas conectada a PostgreSQL.

## Características principales

- Identidad visual Pamela Viury con logotipo PV, sello certificado y firma editorial.
- Página completa con animaciones, fotografía editorial y diseño responsivo.
- Catálogo de servicios de belleza y tratamientos con precios en MXN.
- Paquetes: Esencial Pamela Viury, Signature Pamela Viury y Novia Privé Pamela Viury.
- Reservación de citas en línea con verificación de horarios ocupados.
- Folio oficial único con formato **PV-2026-XXXX**.
- Descarga de folio PDF de dos páginas con:
  - Logotipo y datos del salón en Cd. Juárez.
  - Código QR verificable y código de barras.
  - Sello digital y firma de Pamela Viury.
  - Guía de bienvenida, recomendaciones y croquis de Campos Elíseos.
- Centro de descargas PDF:
  - Catálogo Signature 2026.
  - Guía Nupcial Privé.
  - Certificado de Regalo personalizable.
  - Guía de Cuidado en Casa.
  - Folio oficial de cita.
- Consulta, reprogramación y cancelación de folios.
- Descarga de cita en formato de calendario `.ics`.
- Base de datos PostgreSQL con Drizzle ORM.

## Tecnologías

- **Next.js 16** · App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS 4**
- **PostgreSQL**
- **Drizzle ORM**
- **Framer Motion**
- **Lucide React**
- **jsPDF**
- **QRCode**

## Requisitos

- Node.js 20 o superior
- PostgreSQL 15 o superior
- npm

## Instalación local

1. Clona el repositorio:

   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd salon-de-belleza-pamela-viury
   ```

2. Instala las dependencias:

   ```bash
   npm install
   ```

3. Crea el archivo de variables de entorno:

   ```bash
   cp .env.example .env
   ```

4. Actualiza `DATABASE_URL` en `.env` con tu conexión de PostgreSQL:

   ```env
   DATABASE_URL=postgresql://usuario:password@127.0.0.1:5432/app_db
   ```

5. Aplica el esquema de base de datos:

   ```bash
   npx drizzle-kit push
   ```

6. Inicia el servidor de desarrollo:

   ```bash
   npm run dev
   ```

7. Abre la aplicación:

   ```text
   http://localhost:3000
   ```

Al iniciar, la aplicación crea las tablas necesarias y carga el catálogo inicial de servicios, especialistas y folios de demostración si la base de datos está vacía.

## Comandos disponibles

```bash
npm run dev        # Servidor de desarrollo
npm run build      # Compilación de producción
npm run start      # Servidor de producción
npm run lint       # Revisión con ESLint
npm run typecheck  # Revisión con TypeScript
```

Validación recomendada antes de publicar:

```bash
npx next typegen
npm exec tsc -- --noEmit --pretty false
npm run build
```

## Estructura del proyecto

```text
public/
  images/                    Fotografía editorial del salón
src/
  app/
    api/
      appointments/          Citas, disponibilidad y búsqueda de folios
      appointments/[folio]/  Consulta, reprogramación y cancelación
      catalog/               Servicios y especialistas
      health/                Health check
    globals.css              Sistema visual y animaciones
    layout.tsx               Tipografías y metadatos
    page.tsx                 Carga SSR desde PostgreSQL
  components/
    BrandLogo.tsx            Logotipo PV y sello oficial
    FolioTicketModal.tsx     Pase digital con QR y gestión de folio
    PamelaViurySections.tsx  Secciones editoriales y descargas
    SalonExperience.tsx      Experiencia principal y reservaciones
  db/
    index.ts                 Cliente PostgreSQL / Drizzle
    schema.ts                Tablas principales
    seed.ts                  Inicialización y datos de demostración
  lib/
    brand.ts                 Constantes oficiales de marca
    pdfGenerator.ts          Generador de PDFs y archivo .ics
```

## API principal

### Catálogo

```http
GET /api/catalog
```

### Disponibilidad por especialista

```http
GET /api/appointments?date=2026-06-18&stylistId=1
```

### Buscar citas o folios

```http
GET /api/appointments?query=PV-2026-1042
GET /api/appointments?query=6563184920
```

### Crear una cita

```http
POST /api/appointments
Content-Type: application/json
```

### Consultar o actualizar un folio

```http
GET   /api/appointments/PV-2026-1042
PATCH /api/appointments/PV-2026-1042
```

## Folios de demostración

- `PV-2026-1042`
- `PV-2026-1089`
- `PV-2026-1104`
- `PV-2026-1127`

## Ubicación

**Salón de Belleza Pamela Viury**  
Blvd. Tomás Fernández 8245, Local 4B  
Zona Campos Elíseos, C.P. 32472  
Cd. Juárez, Chihuahua, México

**Horario:** Martes a Sábado · 9:00 AM – 8:00 PM  
**Concierge:** (656) 688-4920  
**Correo:** concierge@pamelaviury.mx

---

© Salón de Belleza Pamela Viury. Todos los derechos reservados.
