sql viewer para ver los datos de la BD
thunder client para hacer pruebas tipo postman


levanta servidor backend: node server.js

levanta servidor frontend: npm run dev

---Dentro de FRONTEND

src/
├── pages/
├── components/
└── services/


pages → pantallas completas (Login, Registro, Dashboard)
components → piezas reutilizables (botones, formularios, etc.)
services → llamadas al backend con axios



npm install bootstrap desde la carpeta de frontend


el modelo sería:

Cada empresa se registra → el primero en registrarse de esa empresa es su admin
El admin de cada empresa → gestiona sus categorías, productos y usuarios
Cada empresa ve solo sus datos → categorías, productos y usuarios propios:

companies
    ↓
users (pertenecen a una empresa)
    ↓
products + categories (pertenecen a una empresa)


Resumen de lo que tienes ahora:

✅ Empresas independientes con su propio inventario
✅ Admin por empresa (el primero en registrarse)
✅ Trabajadores que se unen a una empresa existente
✅ Panel admin con navegación por secciones
✅ Gestión de categorías (crear, editar, eliminar)
✅ Gestión de usuarios (ver, editar rol)
✅ Trabajadores solo pueden actualizar stock


npm install pg para instalar PostgreSQL