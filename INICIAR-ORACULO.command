#!/bin/zsh

set -u

PROJECT_DIR="/Users/chris/Documents/Codex/2026-08-06/files-mentioned-by-the-user-proyecto"
ORACULO_URL="http://localhost:3000/"

cd "$PROJECT_DIR" || {
  echo "No se encontró la carpeta del proyecto."
  read -r "?Presiona Enter para cerrar."
  exit 1
}

clear
echo "========================================"
echo "        INICIANDO ORÁCULO"
echo "========================================"
echo

if curl --silent --fail --max-time 2 "$ORACULO_URL" >/dev/null 2>&1; then
  echo "ORÁCULO ya está funcionando. Abriendo el navegador…"
  open "$ORACULO_URL"
  exit 0
fi

if ! command -v npm >/dev/null 2>&1; then
  echo "No se encontró npm. Abre Codex y solicita ayuda para instalar Node.js."
  read -r "?Presiona Enter para cerrar."
  exit 1
fi

if [[ ! -d node_modules ]]; then
  echo "Preparando dependencias por primera vez…"
  npm install || {
    echo
    echo "No fue posible preparar el proyecto."
    read -r "?Presiona Enter para cerrar."
    exit 1
  }
fi

(
  for attempt in {1..60}; do
    if curl --silent --fail --max-time 1 "$ORACULO_URL" >/dev/null 2>&1; then
      open "$ORACULO_URL"
      exit 0
    fi
    sleep 0.5
  done
  echo "ORÁCULO tardó demasiado en responder. Revisa esta ventana."
) &

echo "La plataforma se abrirá automáticamente."
echo "Mantén esta ventana abierta mientras uses ORÁCULO."
echo "Para detenerlo, presiona Control + C o cierra la ventana."
echo

exec npm run dev
