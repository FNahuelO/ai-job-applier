#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "==> Verificando login en Vercel..."
if ! vercel whoami >/dev/null 2>&1; then
  echo "No hay sesión. Ejecutá: vercel login"
  exit 1
fi

if [[ ! -f .vercel/project.json ]]; then
  echo "==> Vinculando proyecto (elegí tu cuenta; root = raíz del repo, NO apps/dashboard)..."
  vercel link
fi

PROJECT_NAME="$(node -e "console.log(JSON.parse(require('fs').readFileSync('.vercel/project.json','utf8')).projectName)")"
VERCEL_ROOT="$(vercel project inspect "$PROJECT_NAME" 2>/dev/null | awk -F': ' '/Root Directory/{print $2}' | tr -d '[:space:]')"

if [[ "$VERCEL_ROOT" == "apps/dashboard" ]]; then
  echo ""
  echo "ERROR: El proyecto '$PROJECT_NAME' tiene Root Directory = apps/dashboard"
  echo "Debe ser la raíz del monorepo para API + dashboard."
  echo ""
  echo "Corregilo en: https://vercel.com → Project → Settings → General → Root Directory"
  echo "Dejalo vacío (.) y guardá. Luego volvé a ejecutar: npm run deploy:vercel"
  echo ""
  exit 1
fi

echo "==> Build local (mismo comando que Vercel)..."
npm install
npm run build:vercel

echo "==> Deploy a producción..."
vercel deploy --prod

echo "==> Listo. Probá /api/health en tu dominio."
