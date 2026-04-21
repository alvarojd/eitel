# 🚀 Hexasense IoT Dashboard V2

Bienvenido a la versión 2 de **Hexasense**, una plataforma de monitoreo IoT de última generación diseñada para la gestión inteligente de datos ambientales en tiempo real. Esta versión ha sido reconstruida desde cero utilizando **Next.js 15+** y **Clean Architecture** para garantizar máxima escalabilidad, seguridad y una experiencia de usuario de nivel premium.

## ✨ Características Principales

- **Dashboard de Resumen Hexagonal**: Visualización intuitiva del estado de la red mediante una malla hexagonal interactiva que facilita la identificación rápida de incidencias.
- **Analítica de Datos Avanzada**: Nuevo módulo de gráficas interactivas (Recharts) que permite analizar tendencias históricas por dispositivo, rango de fechas y variables específicas (Temp, Hum, CO2).
- **Mapa Geoespacial**: Localización precisa de nodos sensores en tiempo real sobre cartografía interactiva (Leaflet).
- **Heatmap Temporal (Crono)**: Análisis de actividad de las últimas 24 horas mediante un mapa de calor temporal que revela patrones de ocupación y uso.
- **Optimización Móvil (Mobile-First)**: Interfaz totalmente responsiva con una barra de navegación rápida por iconos, diseñada para el acceso inmediato desde cualquier lugar.
- **Arquitectura Limpia (Clean Architecture)**: Estructura modular (Core, Infrastructure, Presentation) que garantiza un mantenimiento sencillo y desacoplamiento de tecnologías.
- **Seguridad Enterprise**: Autenticación segura compatible con Edge Runtime y validación de datos estricta mediante esquemas Zod.
- **Diseño Premium**: Interfaz oscura moderna con efectos de Glassmorphism, animaciones fluidas y micro-interacciones que elevan la experiencia del usuario.

## 🛠️ Stack Tecnológico

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Gráficos**: [Recharts](https://recharts.org/)
- **Mapas**: [Leaflet](https://leafletjs.com/)
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/)
- **Base de Datos**: PostgreSQL
- **Validación**: [Zod](https://zod.dev/)

## 🏗️ Estructura del Proyecto

El proyecto sigue una organización basada en responsabilidades:

```text
src/
├── core/                # Entidades, casos de uso y lógica de negocio pura.
├── infrastructure/      # Adaptadores de DB, API Webhooks y Server Actions.
├── presentation/        # Componentes de React, Contextos, Hooks y Estilos.
└── app/                 # Definición de rutas (App Router) y Layouts.
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

3.  **Variables de Entorno**:
    Crea un archivo `.env.local` con:
    - `POSTGRES_URL`: Conexión a la DB.
    - `JWT_SECRET`: Secreto para autenticación.
    - `TTN_WEBHOOK_SECRET`: Secreto para validar datos de The Things Network.

4.  **Ejecutar**:
    ```bash
    npm run dev
    ```

## 🌐 Despliegue

Optimizado para despliegue continuo en **Vercel**. Configura tus variables de entorno en el panel y el dashboard se encargará del resto.

---

Desarrollado con ❤️ para el monitoreo inteligente de ciudades y edificios.
