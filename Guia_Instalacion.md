# Guía de Instalación: Hexasense IoT Dashboard V2

Bienvenido a la guía oficial de configuración y despliegue de **Hexasense IoT Dashboard V2**. Este documento detalla paso a paso cómo preparar el entorno de desarrollo y realizar el pase a producción de la plataforma basada en Next.js 15+ y Arquitectura Limpia.

## 1. Requisitos Previos del Sistema y Dependencias

Antes de iniciar la instalación, asegúrate de que el entorno cumpla con las siguientes herramientas instaladas:

*   **Node.js (v20 o superior):** Es el entorno de ejecución indispensable para Next.js 15 y el ecosistema del proyecto.
*   **Gestor de Paquetes:** Preferiblemente **NPM** (incluido por defecto con Node), aunque también puedes utilizar Yarn, pnpm o bun.
*   **PostgreSQL:** Sistema de base de datos relacional. Puede ser una instalación local o una instancia administrada en la nube (ej. Supabase, Vercel Postgres o AWS RDS).
*   **Git:** Sistema de control de versiones para interactuar con el repositorio.

## 2. Guía Paso a Paso para la Configuración del Entorno

### Paso 2.1: Clonar el Repositorio

Obtén la última versión del código fuente clonando el repositorio alojado en GitHub y accede a la carpeta generada:

```bash
git clone https://github.com/alvarojd/eitel.git
cd eitel
```

### Paso 2.2: Instalar Dependencias

Usa tu gestor de paquetes para descargar e instalar todas las dependencias declaradas en el archivo `package.json` (como `drizzle-orm`, `recharts`, `leaflet`, `framer-motion`, etc.):

```bash
npm install
```

### Paso 2.3: Variables de Entorno

El proyecto requiere parámetros de configuración para la conexión a servicios, seguridad, alertas de correo y tareas programadas.

En el directorio raíz del proyecto, haz una copia del archivo de plantilla incluido llamado `.env.example` y renómbrala a `.env.local`:

```bash
cp .env.example .env.local
```

Abre `.env.local` y configura cada servicio con tus credenciales reales. A continuación se detalla cada sección obligatoria y recomendada:

#### Variables Requeridas para el Funcionamiento Básico:
*   `POSTGRES_URL`: Cadena de conexión principal a tu base de datos PostgreSQL (ej: Vercel Postgres, Supabase).
*   `JWT_SECRET`: Clave secreta (de al menos 32 caracteres) para firmar y validar las sesiones de usuario y seguridad corporativa.
*   `NEXT_PUBLIC_APP_URL`: URL base pública donde se despliega tu dashboard (ej: `https://midashboard.com`). Necesario para redirecciones web.
*   `TTN_WEBHOOK_SECRET`: Clave privada requerida para validar la autenticidad de los payloads procedentes de The Things Network (TTN).

#### Variables Requeridas para Tareas en Segundo Plano (Cron Jobs):
*   `CRON_SECRET`: Secreto utilizado para autorizar la ejecución de tareas programadas (alertas de desconexión o batería). En Vercel, se genera automáticamente; en entornos autohospedados, debes crear uno y enviar las peticiones con este secreto en el header `Authorization: Bearer <token>`.

#### Variables Recomendadas para Alertas por Correo Electrónico (SMTP):
*   `SMTP_USER` y `SMTP_PASS`: Credenciales de autenticación para el servidor SMTP (ej: SendGrid, Resend, o Contraseña de Aplicación de Gmail).
*   `SMTP_FROM_EMAIL`: Dirección de remitente desde la cual se despacharán las notificaciones del sistema.

> **Aviso de Seguridad:** Reemplaza los valores de estas variables con las credenciales correspondientes a tu entorno. Jamás agregues el archivo `.env.local` a tus commits de control de versiones.

### Paso 2.4: Migración de Base de Datos (Drizzle ORM)

El proyecto incluye *Drizzle ORM* para modelar y sincronizar la base de datos de manera tipada. Aplica el esquema directamente a tu instancia PostgreSQL con el siguiente comando:

```bash
npx drizzle-kit push
```

## 3. Instrucciones de Ejecución y Despliegue

### Entorno de Desarrollo Local

Para arrancar el servidor en modo desarrollo, con *Hot-Reloading* (recarga en caliente de módulos), ejecuta:

```bash
npm run dev
```
La aplicación estará levantada y accesible desde tu navegador abriendo [http://localhost:3000](http://localhost:3000).

### Compilación para Producción

En un servidor físico, máquina virtual o contenedor, se requiere construir una versión optimizada (assets minificados, pre-renderizado de páginas, etc.). Ejecuta el proceso de build seguido del arranque:

```bash
npm run build
npm run start
```

### Despliegue en Vercel (Recomendado)

Dado el stack tecnológico, Hexasense IoT Dashboard V2 tiene total afinidad para un despliegue continuo en **Vercel** sin necesidad de complejas configuraciones de servidor:

1. Ingresa a Vercel y enlaza el repositorio de GitHub de `eitel`.
2. En la configuración del proyecto, navega a la pestaña de **Settings > Environment Variables** y añade exactamente las mismas claves declaradas en tu paso 2.3 (`POSTGRES_URL`, `JWT_SECRET`, etc.).
3. Presiona **Deploy**. Vercel detectará el framework como Next.js, instalará las dependencias y ejecutará el comando `npm run build` de manera automática para brindarte una URL productiva con CDN global.

## 4. Recuperación de la Cuenta de Administrador

En caso de que pierdas u olvides las credenciales de la cuenta administradora, el proyecto incluye un script seguro y rápido para restablecer la contraseña directamente desde el servidor/consola:

### Opción A: Autogenerar una contraseña segura aleatoria
```bash
npm run reset-admin
```
El script buscará el usuario `admin`, generará una contraseña aleatoria de 14 caracteres altamente segura, actualizará su hash en la base de datos y la imprimirá por pantalla.

### Opción B: Establecer una contraseña personalizada
```bash
npm run reset-admin "MiNuevaContrasenaSegura123"
```
Establecerá la contraseña proporcionada para el usuario predeterminado `admin`.

### Opción C: Crear/Restablecer un usuario administrador personalizado
```bash
npm run reset-admin "mi_usuario_personalizado" "MiSuperContrasena"
```
Si el usuario especificado no existe, se creará un nuevo perfil con rol de `ADMIN`. Si ya existe, se actualizará su contraseña actual.

