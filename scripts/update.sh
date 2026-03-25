#!/bin/bash
# Script de actualización remota del sistema ERP
# USO: ./update.sh

echo "🔄 Iniciando actualización del sistema ERP..."

# 1. Obtener últimos cambios de git
echo "📥 Descargando últimos cambios del repositorio..."
git fetch origin
git pull origin main

# 2. Reconstruir los contenedores por si hay cambios en package.json o configuraciones
echo "🐳 Reconstruyendo y actualizando contenedores Docker..."
docker-compose down
docker-compose up -d --build

# 3. Limpieza opcional de imágenes huérfanas
echo "🧹 Limpiando imágenes sin uso para liberar espacio..."
docker image prune -f

echo "✅ Actualización completada exitosamente. El sistema está arriba."
