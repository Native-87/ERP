@echo off
echo ===================================================
echo   RECONSTRUCCION Y LIMPIEZA DE DOCKER - GESTION
echo ===================================================
echo.
echo DETENIENDO CONTENEDORES...
docker compose down

echo.
echo LIMPIANDO CACHE DE CONSTRUCCION...
docker builder prune -f

echo.
echo RECONSTRUYENDO IMAGENES DESDE CERO... (esto puede tardar unos minutos)
docker compose build --no-cache

echo.
echo INICIANDO SISTEMA...
docker compose up -d

echo.
echo ===================================================
echo   PROCESO COMPLETADO EXITOSAMENTE
echo   Accede a: http://localhost:3000
echo ===================================================
pause
