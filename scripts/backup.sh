#!/bin/bash
# Script de backup de PostgreSQL con rotación de 30 días
# Este script se puede agregar al cron diario del servidor:
# 0 2 * * * /ruta/al/proyecto/scripts/backup.sh

BACKUP_DIR="/root/backups/gestion_empresarial"
DB_CONTAINER="gestion_db"
DB_USER="postgres"
DB_NAME="gestion_empresarial"

mkdir -p "$BACKUP_DIR"
DATE=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql.gz"

echo "[$(date)] Iniciando backup de la base de datos..."
# Ejecutamos el volcado de la BD desde el contenedor y lo comprimimos
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "[$(date)] Backup guardado exitosamente en: $BACKUP_FILE"
else
    echo "[$(date)] Error al realizar el backup!"
    exit 1
fi

# Eliminar backups antiguos (más de 30 días)
echo "Ejecutando limpieza de backups antiguos..."
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +30 -exec rm {} \;
echo "[$(date)] Backups de más de 30 días eliminados."
