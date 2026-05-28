#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

if [[ ! -f .env ]]; then
  echo "ERROR: Falta .env en la raíz del repo."
  exit 1
fi

set -a
# shellcheck disable=SC1091
source .env
set +a

if [[ -z "${WORKER_API_SECRET:-}" ]]; then
  echo "ERROR: WORKER_API_SECRET no está definido en .env"
  exit 1
fi

if [[ "${API_BASE_URL:-}" == *"tu-proyecto.vercel.app"* ]]; then
  echo "ERROR: API_BASE_URL sigue con el placeholder. Usá tu dominio real de Vercel."
  exit 1
fi

BASE="${API_BASE_URL%/}"
echo "==> Probando $BASE/worker/users/active ..."

HTTP_CODE="$(curl -sS -o /tmp/worker-check-body.txt -w "%{http_code}" \
  -H "X-Worker-Secret: $WORKER_API_SECRET" \
  "$BASE/worker/users/active")"

if [[ "$HTTP_CODE" == "200" ]]; then
  echo "OK ($HTTP_CODE) — el worker puede hablar con la API."
  cat /tmp/worker-check-body.txt
  echo ""
  exit 0
fi

if [[ "$HTTP_CODE" == "401" ]]; then
  echo "ERROR ($HTTP_CODE): WORKER_API_SECRET no coincide con Vercel."
  echo "  1. Vercel → Project → Settings → Environment Variables"
  echo "  2. Copiá el mismo valor en .env → WORKER_API_SECRET"
  echo "  3. Redeploy en Vercel si cambiaste la variable"
  exit 1
fi

echo "ERROR ($HTTP_CODE):"
cat /tmp/worker-check-body.txt
exit 1
