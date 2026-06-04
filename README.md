# Gestión de inventario para pequeñas empresas

Aplicación web para la gestión de inventario en pequeñas empresas.
Cada empresa dispone de su propio espacio aislado donde administra sus
categorías, productos y usuarios, con dos roles diferenciados:
administrador y trabajador.

Proyecto Final de CFGS Desarrollo de Aplicaciones Web (DAW)
CIFP Avilés · Curso 2025/2026

**Aplicación desplegada:** https://pfc-gestion-inventario.vercel.app


## Características

- Multi-empresa.
- Autenticación con JWT y contraseñas cifradas con bcrypt.
- Gestión de productos, categorías y usuarios.
- Alertas visuales de productos con stock bajo.
- Diseño responsive.


## Stack

**Backend:** Node.js · Express · PostgreSQL · JWT · bcrypt · Jest
**Frontend:** React · Vite · React Router · Axios · Bootstrap 5
**Despliegue:** Vercel (frontend) y Render (backend + BD)


## Arranque local

Necesitas Node.js 22, npm y acceso a una base de datos PostgreSQL.

```bash
git clone https://github.com/LibertadLorda/PFC_gestion_inventario.git
cd PFC_gestion_inventario
```

**Backend** - crear `backend/.env` con:

PORT=3001
DATABASE_URL=postgresql://usuario:password@host:puerto/nombre_bd
JWT_SECRET=cadena

Y ejecutar:

```bash
cd backend
npm install
node server.js
```

**Frontend** - en otra terminal:

```bash
cd frontend
npm install
npm run dev
```

La aplicación queda accesible en `http://localhost:5173`.
Las tablas de la base de datos se crean automáticamente en el primer arranque.

## Pruebas

```bash
cd backend
npm test
```
