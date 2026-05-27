# AI Job Applier

Monorepo profesional para automatizar busqueda, filtrado y postulacion a empleos en LinkedIn con IA.

## Estructura

```text
apps/
  api/         NestJS + Sequelize + PostgreSQL
  dashboard/   React + TypeScript + TailwindCSS + shadcn/ui
  worker/      Playwright + OpenAI + automatizaciones
packages/
  shared/      Tipos, enums y contratos compartidos
```

## Inicio rapido

1. Copiar `.env.example` a `.env`.
2. Levantar PostgreSQL con `docker compose up -d postgres`.
3. Instalar dependencias con `npm install`.
4. Configurar el título de búsqueda desde el dashboard en **Jobs** (se guarda en la API y el worker lo lee en cada ejecución).
5. Ejecutar cada workspace con:
   - `npm run dev:api`
   - `npm run dev:dashboard`
   - `npm run dev:worker`

`DATABASE_URL` y `JWT_SECRET` son obligatorias para levantar la API.

## Despliegue en Vercel

El monorepo incluye configuracion para desplegar el **dashboard** (estatico) y la **API** (serverless) en un mismo proyecto de Vercel. El **worker** (Playwright) no puede ejecutarse en Vercel; debes correrlo en Docker, Railway, Render u otro servicio con proceso persistente.

### Requisitos

- Cuenta en [Vercel](https://vercel.com)
- Base PostgreSQL accesible desde internet (Neon, Supabase, Vercel Postgres, etc.)
- Repositorio conectado a Vercel (importar el proyecto desde Git)

### Variables de entorno en Vercel

Configura estas variables en **Project Settings → Environment Variables** (Production y Preview):

| Variable | Obligatoria | Descripcion |
|----------|-------------|-------------|
| `DATABASE_URL` | Si | URL de PostgreSQL |
| `JWT_SECRET` | Si | Secreto para tokens JWT |
| `VITE_API_URL` | No | Por defecto `/api` (mismo dominio). Ya viene en `vercel.json` |
| `JWT_EXPIRES_IN` | No | Por defecto `7d` |
| `API_PREFIX` | No | Por defecto `api` |

Copia el resto de variables del worker/OpenAI en `.env.example` solo en el entorno donde ejecutes el worker.

### Desplegar

1. Conecta el repositorio en Vercel (raiz del monorepo, sin cambiar el Root Directory).
2. Vercel detecta `vercel.json`: instala dependencias, ejecuta `npm run build:vercel` y publica `apps/dashboard/dist`.
3. Las rutas `/api/*` las atiende la funcion serverless en `api/[[...path]].ts` (NestJS).
4. Ejecuta migraciones en PostgreSQL antes de usar la API en produccion:
   ```bash
   psql "$DATABASE_URL" -f database/migrations/001_app_settings.sql
   ```

### CLI (opcional)

```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.local
vercel --prod
```

### Arquitectura en Vercel

```text
tu-proyecto.vercel.app/
  /              → dashboard (SPA)
  /jobs, /login  → index.html (rewrite)
  /api/health    → NestJS serverless
```

El worker debe apuntar `API_BASE_URL` a `https://tu-proyecto.vercel.app/api`.

## Worker 24/7 en tu maquina (opcion gratis)

Esta opcion permite que el worker atienda a todos los usuarios, pero depende de que tu maquina este prendida y con internet.

### 1) Configurar variables del worker

En tu `.env` local define al menos:

```env
API_BASE_URL=https://tu-proyecto.vercel.app/api
OPENAI_API_KEY=tu_api_key
LINKEDIN_EMAIL=tu_email
LINKEDIN_PASSWORD=tu_password
PLAYWRIGHT_HEADLESS=true
```

### 2) Levantar solo worker (sin api/postgres locales)

```bash
docker compose -f docker-compose.worker.yml up -d --build
docker compose -f docker-compose.worker.yml logs -f worker
```

### 3) Dejarlo como servicio al reiniciar (systemd)

El archivo `deploy/ai-job-worker.service` ya esta listo para Ubuntu/Linux con systemd.

1. Copialo al sistema:
   ```bash
   sudo cp deploy/ai-job-worker.service /etc/systemd/system/ai-job-worker.service
   ```
2. Recarga systemd y habilita el servicio:
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable --now ai-job-worker.service
   ```
3. Verifica estado y logs:
   ```bash
   sudo systemctl status ai-job-worker.service
   docker compose -f docker-compose.worker.yml logs -f worker
   ```

> Si tu repo esta en otra ruta, edita `WorkingDirectory`, `ExecStart` y `ExecStop` en `deploy/ai-job-worker.service`.

## Fases implementadas

- Fase 1: estructura base del monorepo
- Base de `api`, `dashboard`, `worker` y `shared`
- Docker Compose para desarrollo
