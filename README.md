# Sistema de Gestión Empresarial

Sistema web de gestión interna para PYMEs. Incluye control financiero, inventario, órdenes de trabajo y administración de usuarios con roles diferenciados.

## 🚀 Requisitos

- **Docker** y **Docker Compose** instalados
- Alternativa sin Docker: **Node.js 20+** y **PostgreSQL 16+**

## 📦 Instalación con Docker (Recomendado)

### 1. Clonar o copiar el proyecto
```bash
# Copiar el proyecto al servidor
cd /ruta/del/proyecto
```

### 2. Configurar variables de entorno
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar las variables (especialmente las contraseñas y JWT secrets)
nano .env
```

**Variables importantes a cambiar:**
- `POSTGRES_PASSWORD` — Contraseña de la base de datos
- `JWT_SECRET` — Clave secreta para tokens JWT (usar cadena aleatoria larga)
- `JWT_REFRESH_SECRET` — Clave para refresh tokens

### 3. Iniciar los servicios
```bash
docker-compose up -d
```

### 4. Acceder al sistema
- **Frontend:** http://localhost:3000
- **API:** http://localhost:4000/api
- **Health check:** http://localhost:4000/api/health

### 5. Credenciales iniciales
El sistema crea automáticamente los siguientes usuarios:

| Usuario | Contraseña | Rol |
|---------|-----------|-----|
| admin | admin123 | Administrador |
| supervisor1 | supervisor123 | Supervisor |
| operario1 | operario123 | Operario |
| contador1 | contador123 | Contador |

> ⚠️ **Cambiar las contraseñas después del primer acceso.**

---

## 🛠 Instalación sin Docker (Desarrollo)

### 1. Base de datos PostgreSQL
```bash
# Crear la base de datos
createdb gestion_empresarial
```

### 2. Backend
```bash
cd backend
npm install
npm run dev
```

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 📋 Módulos

### Autenticación y Roles
- Login con JWT + refresh tokens
- 4 roles: Admin, Supervisor, Operario, Contador
- Log de auditoría de acciones

### Dashboard
- Métricas en tiempo real
- Alertas visuales (🔴 rojo, 🟡 amarillo, 🟢 verde)
- Gráficos de ingresos vs egresos

### Control Financiero
- Ingresos y egresos con categorías
- Resúmenes diarios, semanales y mensuales
- Balance con indicadores de color

### Inventario
- Control de stock con umbrales mínimos
- Registro de entradas y salidas
- Alertas de stock crítico/bajo

### Órdenes de Trabajo
- Estados: Pendiente → En curso → Completada → Cerrada
- Prioridades: Alta, Media, Baja
- Archivos adjuntos y firma digital
- Historial de cambios

### Configuración (Admin)
- Nombre y logo de la empresa
- Paleta de colores personalizable
- Categorías de ingresos/egresos
- Sectores y áreas

---

## 🔧 API Endpoints

| Ruta | Descripción |
|------|-------------|
| `POST /api/auth/login` | Iniciar sesión |
| `POST /api/auth/refresh` | Refrescar token |
| `GET /api/auth/me` | Usuario actual |
| `GET/POST /api/users` | Gestión de usuarios (admin) |
| `GET/POST /api/transactions` | Transacciones |
| `GET /api/transactions/summary` | Resumen financiero |
| `GET/POST /api/categories` | Categorías |
| `GET/POST /api/products` | Productos/inventario |
| `POST /api/products/:id/movements` | Movimientos de stock |
| `GET/POST /api/work-orders` | Órdenes de trabajo |
| `PATCH /api/work-orders/:id/status` | Cambiar estado OT |
| `GET /api/dashboard/summary` | Resumen dashboard |
| `GET/PUT /api/settings` | Configuración |

---

## 🌐 Stack Tecnológico

- **Frontend:** React 18, Vite, TailwindCSS, Chart.js, Lucide Icons
- **Backend:** Node.js, Express, Sequelize ORM, BullMQ (Redis)
- **Base de datos:** PostgreSQL 16
- **Cache / Tareas:** Redis 7
- **Auth:** JWT con refresh tokens, bcrypt
- **Despliegue:** Docker + Docker Compose
- **Monitoreo:** Uptime Kuma

---

## 🛡 Infraestructura y Mantenimiento Remoto (V2)

El sistema ahora soporta herramientas profesionales para la administración remota, automatización y seguridad integral.

### Script de Actualización Automática
Para liberar una nueva versión del código en el servidor del cliente, ejecuta:
```bash
./scripts/update.sh
```
Esto descargará los cambios vía `git pull`, reconstruirá los contenedores optimizados y limpiará imágenes viejas.

### Backups Automáticos
El script `scripts/backup.sh` realiza un dump de PostgreSQL comprimido (`.sql.gz`) y elimina automáticamente los backups de más de 30 días. Para ejecutarlo automáticamente, agrégalo al cron del servidor Linux:
```bash
# Editar cron
crontab -e

# Agregar la siguiente línea para ejecutar el backup a las 2 AM todos los días:
0 2 * * * /ruta/al/proyecto/scripts/backup.sh >> /var/log/erp_backup.log 2>&1
```

### Monitoreo del Sistema
El ERP incluye **Uptime Kuma** integrado en la infraestructura.
- **Acceso:** http://localhost:3001
- Configura aquí los tests HTTP locales (`http://frontend:3000` y `http://backend:4000/api/health`) para recibir alertas instantáneas por Email o WhatsApp si alguno se cae.

### Acceso Remoto Seguro y Entorno de Desarrollo
Para dar soporte a la instalación sin exponer contraseñas:

1. **SSH con Claves Públicas:** Evita usar contraseñas. Configura tu clave pública (generada con `ssh-keygen`) en el archivo `~/.ssh/authorized_keys` del cliente.
2. **WireGuard VPN:** En redes corporativas cerradas o de alta seguridad, pide al administrador del cliente que instale WireGuard y te provea un archivo `.conf` para tu PC. Así estarás en la misma red local que el servidor.
3. **VS Code Remote - SSH:** Usa esta extensión para abrir la carpeta del proyecto directamente desde tu computadora y editar archivos en vivo en el cliente.
4. **DBeaver:** Para analizar bugs de datos, puedes conectar DBeaver directo al PostgreSQL remoto usando el túnel SSH nativo incluido en DBeaver.

