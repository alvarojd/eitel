# Guía de Instalación - Hexasense IoT Dashboard V2

Bienvenido a la guía oficial de instalación y despliegue para Hexasense IoT Dashboard V2. Esta plataforma de monitoreo IoT está construida sobre Next.js 15+ y diseñada para un despliegue optimizado en Vercel.

## 1. Requisitos Previos del Sistema y Dependencias

Antes de comenzar, asegúrate de contar con los siguientes elementos:

- **Node.js**: Versión 18.x o superior (se recomienda Node.js 20+ LTS).
- **Gestor de paquetes**: `npm` (incluido con Node.js).
- **Git**: Para clonar el repositorio.
- **Cuenta en Vercel**: Para el despliegue en producción.
- **Base de Datos PostgreSQL**: Puede ser aprovisionada mediante Vercel Postgres, Supabase, Neon o cualquier servidor PostgreSQL accesible públicamente.

## 2. Configuración del Entorno (Variables de Entorno)

El sistema requiere de ciertas variables de entorno para funcionar correctamente. En un entorno de desarrollo local, estas deben ir en un archivo `.env.local`. Para producción, deben configurarse en el panel de Vercel.

- `POSTGRES_URL` **(Requerido)**: Cadena de conexión principal a la base de datos. Ejemplo: `postgres://usuario:contraseña@host:6543/nombre_db?sslmode=require`
- `JWT_SECRET` **(Requerido)**: Secreto para la firma y validación de JSON Web Tokens (Enterprise Security). Puedes generar uno con `openssl rand -base64 32`.
- `NEXT_PUBLIC_APP_URL` **(Requerido)**: URL base del dashboard (ej. `http://localhost:3000` en local o `https://tudominio.com` en producción).
- `TTN_WEBHOOK_SECRET` **(Requerido)**: Secreto de seguridad para validar la autenticidad de los datos provenientes de The Things Network (TTN).
- `CRON_SECRET` **(Requerido)**: Secreto para proteger las rutas de ejecución de tareas en segundo plano (`/api/cron/*`). En Vercel, este suele inyectarse de forma automática, pero es recomendable definirlo explícitamente.
- `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM_EMAIL` **(Recomendado)**: Credenciales para el envío de alertas automatizadas por correo.

## 3. Guía Paso a Paso para la Configuración Local (Desarrollo)

Si deseas probar o modificar el entorno localmente antes del despliegue, sigue estos pasos:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/alvarojd/eitel.git
   cd eitel
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar el entorno:**
   Copia el archivo de ejemplo para crear tu configuración local.
   ```bash
   cp .env.example .env.local
   ```
   Edita el archivo `.env.local` con las credenciales de tu base de datos y demás secretos.

4. **Inicializar la aplicación:**
   ```bash
   npm run dev
   ```
   El dashboard estará disponible en `http://localhost:3000`.

## 4. Instrucciones Claras para la Ejecución y Despliegue en Vercel (Producción)

El proyecto está optimizado para su despliegue continuo en **Vercel**, aprovechando al máximo las características de Next.js y el archivo de configuración `vercel.json` incluido en el repositorio.

1. **Importar el proyecto:**
   - Inicia sesión en [Vercel](https://vercel.com).
   - Selecciona "Add New..." > "Project".
   - Importa el repositorio de GitHub donde tienes alojado el proyecto (`alvarojd/eitel`).

2. **Configuración del proyecto en Vercel:**
   - Vercel detectará automáticamente que el Framework Preset es **Next.js**.
   - Deja los comandos de Build y Output Directory por defecto (Vercel los infiere correctamente del `package.json`).

3. **Configurar las Variables de Entorno:**
   - En la sección **Environment Variables** antes de desplegar, añade todas las variables listadas en la sección 2 (`POSTGRES_URL`, `JWT_SECRET`, `NEXT_PUBLIC_APP_URL`, `TTN_WEBHOOK_SECRET`, `CRON_SECRET` y las de SMTP si se utilizan).

4. **Despliegue:**
   - Haz clic en el botón **Deploy**.
   - Vercel instalará las dependencias, ejecutará el proceso de construcción (`npm run build`) y publicará la aplicación.

5. **Configuración de Tareas Programadas (Cron Jobs):**
   - El proyecto incluye un archivo `vercel.json` que define las tareas recurrentes.
   - Asegúrate de que el `CRON_SECRET` esté configurado en Vercel para que las llamadas automatizadas hacia las rutas `/api/cron/*` se ejecuten de manera segura.

¡Felicidades! Hexasense IoT Dashboard V2 ahora está activo y listo para monitorear tu red.
