# 🚀 Hexasense IoT Dashboard V2

Bienvenido a la versión 2 de **Hexasense**, una plataforma avanzada de monitoreo IoT diseñada para la gestión inteligente de datos de sensores en tiempo real. Esta versión ha sido reconstruida desde cero utilizando **Next.js 15+** y **Clean Architecture** para garantizar máxima escalabilidad, seguridad y rendimiento.

## ✨ Características Principales

- **Visualización Hexagonal**: Representación intuitiva del estado de los sensores mediante una malla hexagonal interactiva.
- **Análisis de Confort**: Generación de informes automáticos basados en temperatura, humedad y CO2 con filtros de presencia.
- **Arquitectura Limpia**: Separación estricta de responsabilidades (Core, Infrastructure, Presentation) para un mantenimiento sencillo.
- **Seguridad Enterprise**: Autenticación basada en JWT (Web Crypto API) compatible con Edge Runtime y validación de esquemas con Zod.
- **Diseño Premium**: Interfaz oscura moderna (Glassmorphism) optimizada para una experiencia de usuario fluida.
- **Exportación de Datos**: Generación de reportes detallados en CSV y PDF.

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Base de Datos**: PostgreSQL (via `pg`)
- **Mapas**: [Leaflet](https://leafletjs.com/)
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/)
- **Validación**: [Zod](https://zod.dev/)

## 🏗️ Estructura del Proyecto

El proyecto sigue los principios de **Arquitectura Hexagonal / Clean Architecture**:

```text
src/
├── core/                # Reglas de negocio y entidades (Puro JS/TS)
├── infrastructure/      # Implementaciones externas (DB, API, Acciones)
├── presentation/        # Componentes de UI, Contextos y Hooks
└── app/                 # Rutas y configuración de Next.js
```

## 🚀 Instalación y Desarrollo Local

1.  **Clonar el repositorio**:
    ```bash
    git clone https://github.com/alvarojd/eitel.git
    cd eitel
    ```

2.  **Instalar dependencias**:
    ```bash
    npm install
    ```

3.  **Configurar variables de entorno**:
    Crea un archivo `.env.local` basado en las variables necesarias:
    - `POSTGRES_URL`: URL de conexión a tu base de datos.
    - `JWT_SECRET`: Llave secreta para las sesiones.
    - `NEXT_PUBLIC_APP_URL`: URL base de la aplicación.

4.  **Iniciar el servidor de desarrollo**:
    ```bash
    npm run dev
    ```

## 🌐 Despliegue

Este proyecto está optimizado para ser desplegado en **Vercel**. Asegúrate de configurar las variables de entorno en el panel de Vercel y establecer el `Root Directory` como `./`.

---

Desarrollado con ❤️ para el monitoreo inteligente de ciudades y edificios.
