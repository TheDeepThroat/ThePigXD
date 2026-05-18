# API App Segura

Aplicación de autenticación con React + Vite en el frontend y Express en el backend, utilizando cookies HTTP-only para el manejo seguro de sesiones.

## Requisitos previos

- [Node.js](https://nodejs.org/) (v18 o superior)
- npm

## Instalación

```bash
npm install
```

## Ejecución

La aplicación requiere **dos procesos** ejecutándose simultáneamente: el servidor backend (Express) y el servidor de desarrollo frontend (Vite).

### 1. Iniciar el servidor backend

En una terminal, ejecuta:

```bash
npm run server
```

Esto levanta el servidor Express en `http://localhost:4000`, que expone los endpoints de la API:

| Método | Endpoint        | Descripción                        |
|--------|-----------------|------------------------------------|
| POST   | `/api/login`    | Inicia sesión y establece la cookie |
| POST   | `/api/logout`   | Cierra sesión y elimina la cookie   |
| GET    | `/api/session`  | Verifica si la sesión está activa   |

### 2. Iniciar el servidor frontend

En **otra terminal**, ejecuta:

```bash
npm run dev
```

Esto levanta Vite en `http://localhost:5173`. Las peticiones a `/api/*` se redirigen automáticamente al backend en el puerto 4000 mediante el proxy configurado en `vite.config.js`.

### Credenciales de prueba

| Usuario | Contraseña |
|---------|------------|
| admin   | password   |

## Scripts disponibles

| Script            | Comando             | Descripción                          |
|-------------------|---------------------|--------------------------------------|
| `npm run dev`     | `vite`              | Servidor de desarrollo frontend      |
| `npm run server`  | `node server.js`    | Servidor backend Express             |
| `npm run build`   | `vite build`        | Compilar para producción             |
| `npm run preview` | `vite preview`      | Previsualizar build de producción    |
| `npm run lint`    | `eslint .`          | Ejecutar linter                      |

## Tecnologías

- **Frontend:** React 19, React Router DOM, Vite
- **Backend:** Express, cookie-parser
- **Autenticación:** Cookies HTTP-only con `sameSite: lax`
