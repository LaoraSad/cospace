# CoSpace - Plataforma de Reservas de Espacios de Coworking

## 1. Descripción del Proyecto

**CoSpace** es una aplicación web fullstack desarrollada con **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4** y **Prisma ORM** conectada a una base de datos **PostgreSQL en Supabase**.

La plataforma permite a los usuarios:
- Explorar un catálogo actualizado de espacios de trabajo (*escritorios dedicados*, *salas de juntas* y *cabinas acústicas*) con precios por hora y capacidad.
- Registrarse e iniciar sesión mediante autenticación segura basada en **JWT (`jose`)** almacenados en cookies `HttpOnly` (Access Token y Refresh Token revocable en base de datos).
- Reservar espacios por bloques de horas enteras (de 1 a 4 horas, entre las 07:00 y las 21:00, hasta con 30 días de anticipación, máximo 3 reservas activas futuras y validación anti-solapamiento).
- Consultar sus reservas en su zona horaria local y cancelarlas con al menos 2 horas de anticipación.
- Administrar el inventario de espacios (crear y desactivar espacios) desde el panel exclusivo para el rol `ADMIN`, protegido mediante [`src/proxy.ts`](src/proxy.ts) y validaciones de servidor.
- Alternar el idioma de la interfaz en tiempo real entre **Español (`ES`)** e **Inglés (`EN`)**.

---

## 2. Requisitos Previos

Antes de comenzar, asegúrate de contar con lo siguiente instalado o creado:

- **Node.js**: versión `20.x` o superior (`node -v`).
- **Gestor de paquetes npm**: versión `10.x` o superior (`npm -v`, incluido con Node.js).
- **Git**: para clonar el repositorio (`git --version`).
- **Docker y Docker Compose**: *(opcional para desarrollo local, requerido si deseas ejecutar la aplicación en contenedor)*.
- **Cuenta y proyecto en Supabase**: un proyecto activo de PostgreSQL en [https://supabase.com](https://supabase.com) para obtener las cadenas de conexión (`DATABASE_URL` y `DIRECT_URL`).

---

## 3. Variables de Entorno

El archivo [`.env.example`](.env.example) incluye todas las variables necesarias para ejecutar el proyecto:

```env
DATABASE_URL=
DIRECT_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=
```

### Explicación detallada de cada variable:

| Variable | ¿Para qué sirve? | ¿Qué valor lleva y cómo obtenerlo? |
| :--- | :--- | :--- |
| `DATABASE_URL` | Cadena de conexión principal usada por Prisma Client en tiempo de ejecución mediante el **Connection Pooler (Supavisor)** de Supabase. | En tu proyecto de **Supabase** ve a **Project Settings → Database → Connection string → URI** (con la opción **Transaction pooler** activa, puerto `6543`) y agrega `?pgbouncer=true` al final.<br>Ejemplo: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true` |
| `DIRECT_URL` | Conexión directa a PostgreSQL requerida por Prisma CLI para ejecutar migraciones y sincronización de esquema (`db push` / `migrate`) sin pasar por PgBouncer. | En **Supabase → Project Settings → Database → Connection string → URI** (modo **Session pooler** en puerto `5432` o **Direct connection**).<br>Ejemplo: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres` |
| `JWT_ACCESS_SECRET` | Clave secreta simétrica (`HS256`) utilizada para firmar y verificar el **Access Token** de corta duración. | Cadena aleatoria segura de al menos 32 caracteres. Puedes generarla en tu terminal ejecutando:<br>`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | Clave secreta simétrica (`HS256`) utilizada para firmar y verificar el **Refresh Token** de larga duración. Debe ser distinta de `JWT_ACCESS_SECRET`. | Cadena aleatoria segura de al menos 32 caracteres generada con:<br>`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ACCESS_TOKEN_EXPIRES_IN` | Tiempo de expiración del token de acceso. | Valor por defecto: `15m` (15 minutos). |
| `REFRESH_TOKEN_EXPIRES_IN` | Tiempo de expiración del token de refresco. | Valor por defecto: `7d` (7 días). |
| `NEXT_PUBLIC_APP_URL` | URL base pública donde corre la aplicación. | En desarrollo local: `http://localhost:3000` (o `http://localhost:3002` si corres con `docker-compose.yml`). En producción: la URL pública de tu despliegue. |

---

## 4. Ejecución en Desarrollo (Paso a Paso)

Sigue estos comandos exactos y en orden desde tu terminal:

### a. Clonar el repositorio e instalar dependencias

```bash
git clone <URL_DEL_REPOSITORIO>
cd cospace
npm install
```

### b. Crear el archivo `.env` a partir de `.env.example` y completarlo

```bash
cp .env.example .env
```

Abre el archivo `.env` con tu editor y completa los valores de `DATABASE_URL`, `DIRECT_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET` y `NEXT_PUBLIC_APP_URL=http://localhost:3000` siguiendo las instrucciones de la sección anterior.

### c. Ejecutar las migraciones / sincronizar el esquema con la base de datos

```bash
npx prisma generate
npm run db:push
```

*(Alternativamente, si utilizas el historial de migraciones de Prisma: `npx prisma migrate dev`).*

### d. Ejecutar el seed (datos iniciales y usuarios de prueba)

```bash
npm run db:seed
```

### e. Levantar el proyecto en modo desarrollo

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 5. Credenciales del Administrador Creado por el Seed

Al ejecutar `npm run db:seed` ([`prisma/seed.ts`](prisma/seed.ts)), se crean automáticamente 4 espacios iniciales y las siguientes cuentas:



### Cuenta Usuario de Prueba (`USER`)
- **Correo electrónico:** `user@cospace.com`
- **Contraseña:** `User123!`
- **Permisos:** Exploración del catálogo (`/catalog`), creación de reservas y gestión de sus propias reservas en `/dashboard`.

---

## 6. Ejecución con Docker

El proyecto incluye un [`Dockerfile`](Dockerfile) multi-etapa optimizado para producción y un archivo [`docker-compose.yml`](docker-compose.yml).

### Opción A: Usando `docker build` y `docker run`

1. **Construir la imagen de Docker:**

```bash
docker build -t cospace-app .
```

2. **Correr el contenedor pasándole las variables de entorno con `--env-file`:**

```bash
docker run -d \
  --name cospace-container \
  -p 3000:3000 \
  --env-file .env \
  cospace-app
```

*(También puedes pasar variables individuales usando `-e DATABASE_URL="..." -e DIRECT_URL="..." -e JWT_ACCESS_SECRET="..." -e JWT_REFRESH_SECRET="..."`).*

La aplicación quedará disponible en [http://localhost:3000](http://localhost:3000).

### Opción B: Usando Docker Compose

```bash
docker compose up -d --build
```

El servicio definido en [`docker-compose.yml`](docker-compose.yml) inyecta automáticamente el archivo `.env` (`env_file: .env`) y expone la aplicación en [http://localhost:3002](http://localhost:3002).

---

## 7. Scripts Disponibles en `package.json`

| Script | Comando | Descripción |
| :--- | :--- | :--- |
| `npm run dev` | `next dev` | Inicia el servidor de desarrollo de Next.js con recarga en caliente en `http://localhost:3000`. |
| `npm run build` | `next build` | Compila y optimiza la aplicación para producción en la carpeta `.next`. |
| `npm run start` | `next start` | Inicia el servidor de producción de Next.js (requiere haber ejecutado `npm run build` previamente). |
| `npm run lint` | `next lint` / `eslint` | Analiza el código fuente en busca de errores de estilo y buenas prácticas de TypeScript y React. |
| `npm run db:push` | `prisma db push` | Sincroniza el esquema definido en `prisma/schema.prisma` directamente con la base de datos PostgreSQL. |
| `npm run db:seed` | `prisma db seed` | Ejecuta el script `prisma/seed.ts` mediante `tsx` para poblar la base de datos con el usuario administrador, el usuario de prueba y los espacios iniciales. |

---

## 8. Estructura de Carpetas del Proyecto

```text
cospace/
├── prisma/
│   ├── schema.prisma        # Modelos de datos (User, RefreshToken, Space, Booking) y enums
│   └── seed.ts              # Script de poblado inicial (Admin, Usuario de prueba y 4 espacios)
├── public/                  # Recursos estáticos públicos (iconos y vectores)
├── src/
│   ├── app/                 # Enrutamiento App Router de Next.js 16
│   │   ├── (public)/        # Grupo de rutas públicas (Inicio '/', Catálogo '/catalog' y detalle '/catalog/[id]')
│   │   ├── (auth)/          # Grupo de rutas de autenticación ('/login' y '/register')
│   │   ├── (private)/       # Grupo de rutas privadas para usuarios autenticados ('/dashboard')
│   │   ├── (admin)/         # Grupo de rutas exclusivas para administradores ('/admin')
│   │   ├── api/             # Route Handlers del backend (REST API)
│   │   │   ├── auth/        # Endpoints de login, register, logout, refresh y sesión activa (me)
│   │   │   ├── bookings/    # Creación/listado de reservas y cancelación ('/api/bookings/[id]/cancel')
│   │   │   └── spaces/      # Gestión de espacios del catálogo ('/api/spaces' y '/api/spaces/[id]')
│   │   ├── globals.css      # Estilos globales e importación de Tailwind CSS
│   │   └── layout.tsx       # Root Layout con proveedor global de idioma (LanguageProvider)
│   ├── components/          # Componentes reutilizables de cliente (LanguageSelector, ClientDateBadge)
│   ├── lib/                 # Utilidades de servidor y cliente (prisma, jwt, cookies, auth, i18n)
│   └── proxy.ts             # Proxy de Next.js 16 para protección de rutas por sesión y rol (RBAC)
├── .env.example             # Plantilla de variables de entorno requeridas
├── Dockerfile               # Construcción multi-etapa (deps, builder y runner) para producción
├── docker-compose.yml       # Orquestación del contenedor web con inyección de .env
├── next.config.ts           # Configuración de Next.js, Turbopack e imágenes remotas (Unsplash)
├── package.json             # Dependencias y scripts del proyecto
└── tsconfig.json            # Configuración de TypeScript y alias '@/*' -> './src/*'
```

---

## 9. URL de la Aplicación Desplegada

- **Producción:** *(Reemplaza este enlace con la URL pública de tu despliegue en Vercel / Railway / Render, por ejemplo: `https://cospace-app.vercel.app`)*
- **Entorno Local (Desarrollo):** [http://localhost:3000](http://localhost:3000)
- **Entorno Local (Docker Compose):** [http://localhost:3002](http://localhost:3002)
