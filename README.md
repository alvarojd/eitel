# HexaSense IoT Dashboard

HexaSense es una plataforma avanzada de monitoreo para redes de sensores IoT, diseñada específicamente para el seguimiento de condiciones ambientales en hogares vulnerables y la lucha contra la pobreza energética.

## 🚀 Características Principales

*   **📊 Monitoreo en Tiempo Real**: Visualización inmediata de datos ambientales (Temperatura, Humedad, CO2, Presencia y Nivel de Batería).
*   **🗺️ Vistas de Mapa Dual**: 
    *   **Mapa Hexagonal**: Visualización abstracta perfecta para una visión rápida del estado de salud de la red.
    *   **Mapa Geográfico**: Localización precisa de dispositivos sobre el terreno mediante Leaflet.
*   **🕒 Crono-Panel (Heatmap)**: Historial visual de las últimas 24 horas para detectar patrones de confort y ocupación.
*   **📈 Análisis Predictivo y Reportes**: Gráficos interactivos de tendencias y exportación de datos históricos filtrables.
*   **🔐 Seguridad y RBAC**: Sistema de autenticación con roles diferenciados (Administrador y Espectador).
*   **🛠️ Gestión de Dispositivos**: Panel administrativo para configurar, editar y monitorizar el estado técnico de cada sensor (RSSI, SNR, Batería).

## 🛠️ Stack Tecnológico

*   **Frontend**: React + Vite + TypeScript
*   **Estilo**: TailwindCSS para una interfaz moderna y "glassmorphism".
*   **Visualización**: Recharts (gráficos), Lucide React (iconografía) y Leaflet (mapas).
*   **Backend**: Vercel Serverless Functions (API).
*   **Base de Datos**: Vercel Postgres para almacenamiento de históricos y gestión de usuarios.
*   **Integración**: Webhooks para procesamiento de datos desde The Things Network (TTN).

## 📂 Estructura del Proyecto

*   `/api`: Funciones serverless para la API del backend.
*   `/src`: Código fuente del frontend (Componentes, Servicios, Hooks).
*   `/scripts`: Scripts de utilidad para simulación y mantenimiento.

## 🏁 Comenzando

### Requisitos Previos

*   Node.js (v18+)
*   Cuenta en Vercel (para despliegue y base de datos)

### Instalación

1.  Clona el repositorio:
    ```bash
    git clone https://github.com/alvarojd/eitel.git
    cd hexasense-iot-dashboard
    ```

2.  Instala las dependencias:
    ```bash
    npm install
    ```

3.  Inicia el servidor de desarrollo:
    ```bash
    npm run dev
    ```

### Simulación de Datos

Para probar la entrada de datos sin el hardware físico, puedes usar el script de simulación incluido:
```bash
node simulate_ttn.cjs
```

---
© 2026 HexaSense - Proyecto para la monitorización ambiental y social.

