# RealTime Chat

Una plataforma de mensajería empresarial en tiempo real, diseñada con una arquitectura **Full Stack** moderna y escalable. Este proyecto replica funcionalidades clave de herramientas como Slack o Discord, incluyendo canales temáticos, autenticación segura y comunicación instantánea bidireccional.

##  Demo en Vivo
¡Prueba la aplicación ahora mismo!
- **Frontend (App Web/Móvil):** [https://realtime-chat-project-three.vercel.app](https://realtime-chat-project-three.vercel.app)
- **Backend (API & Sockets):** [https://chat-backend-miriam.onrender.com](https://chat-backend-miriam.onrender.com)

---

## Tech Stack

### Frontend (Cliente)
- **Framework:** React + Ionic (Cross-platform: Web, iOS, Android).
- **Estilos:** CSS Modules + Ionic Components (Diseño Responsivo & Dark Mode).
- **Comunicación:** `socket.io-client` para eventos en tiempo real.
- **Avatar:** Integración con **DiceBear API** para generación procedural de avatares.
- **Despliegue:** Vercel.

### Backend (Servidor)
- **Framework:** NestJS (Node.js con TypeScript).
- **Real-Time:** `socket.io` (WebSockets Gateway).
- **Base de Datos:** MongoDB Atlas (NoSQL en la nube).
- **Autenticación:** JWT (JSON Web Tokens) & Bcrypt para hasheo de contraseñas.
- **Arquitectura:** Modular (Services, Controllers, Gateways).
- **Despliegue:** Render.

---

## Características Principales

1.  **Comunicación en Tiempo Real:** Mensajería instantánea sin recargar la página (Zero-latency feel).
2.  **Canales Temáticos:** Separación lógica de conversaciones (`#General`, `#Proyectos`, `#Ventas`).
3.  **UI Corporativa:** Interfaz limpia con barra lateral colapsable y diseño adaptativo (Móvil/Desktop).
4.  **Persistencia de Datos:** Historial de chat guardado en MongoDB; los mensajes no se pierden al recargar.
5.  **Identidad Visual:** Avatares únicos generados automáticamente basados en el nombre de usuario.
6.  **Seguridad:** Sistema de Login/Registro con validación de credenciales y protección de rutas.
7.  **Feedback de Usuario:** Indicadores visuales de "Usuario escribiendo..." y notificaciones de conexión/desconexión.

---

## Instalación y Configuración Local

Si deseas correr este proyecto en tu máquina local, sigue estos pasos:

### 1. Clonar el repositorio
```bash
git clone [https://github.com/miriam1006/realtime-chat-project.git](https://github.com/miriam1006/realtime-chat-project.git)
cd realtime-chat-project
2. Configurar el Backend
Bash
cd chat-backend
npm install
Crea un archivo .env en chat-backend con tus variables:

Fragmento de código
MONGO_URI=tu_cadena_de_conexion_mongodb
JWT_SECRET=tu_palabra_secreta
PORT=3000
Iniciar el servidor:

Bash
npm run start:dev
3. Configurar el Frontend
En una nueva terminal:

Bash
cd chat-frontend
npm install
Asegúrate de que el socket apunte a tu localhost en src/pages/Home.tsx (si no usas la nube):

JavaScript
const socket = io('http://localhost:3000');
Iniciar la aplicación:

Bash
ionic serve
📂 Estructura del Proyecto (Monorepo)
realtime-chat-project/
├── chat-backend/       # Servidor NestJS (API & WebSockets)
│   ├── src/
│   │   ├── auth/       # Módulo de Autenticación
│   │   ├── chat/       # Gateway de WebSockets y Lógica de Chat
│   │   └── database/   # Esquemas de MongoDB (Mongoose)
│
├── chat-frontend/      # Cliente React + Ionic
│   ├── src/
│   │   ├── pages/      # Vistas (Login, Home/Chat)
│   │   └── components/ # Componentes reutilizables

Desarrollado por Miriam G. como parte de un proyecto de arquitectura Full Stack en tiempo real.