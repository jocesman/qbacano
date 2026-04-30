#!/bin/bash
# Ejecuta migraciones primero (solo si es necesario)
npx prisma migrate deploy --skip-generate 2>/dev/null || true
# Inicia el servidor
node dist/main.js
