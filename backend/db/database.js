const { Pool } = require('pg');

console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'definida' : 'NO definida');
// Conexión a PostgreSQL usando la variable de entorno DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// CREAR TABLAS SI NO EXISTEN
const initDB = async () => {
  try {

    //TABLA DE EMPRESAS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS companies (
        id   SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      )
    `);

    // TABLA DE USUARIOS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        name       TEXT NOT NULL,
        email      TEXT NOT NULL UNIQUE,
        password   TEXT NOT NULL,
        role       TEXT NOT NULL DEFAULT 'user',
        company_id INTEGER NOT NULL REFERENCES companies(id)
      )
    `);

    // TABLA DE CATEGORIAS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id          SERIAL PRIMARY KEY,
        name        TEXT NOT NULL,
        description TEXT,
        company_id  INTEGER NOT NULL REFERENCES companies(id)
      )
    `);

    // TABLA DE PRODUCTOS
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id          SERIAL PRIMARY KEY,
        name        TEXT NOT NULL,
        description TEXT,
        category    TEXT,
        stock       INTEGER NOT NULL DEFAULT 0,
        stock_min   INTEGER NOT NULL DEFAULT 5,
        company_id  INTEGER NOT NULL REFERENCES companies(id),
        created_at  TIMESTAMP DEFAULT NOW()
      )
    `);

    console.log('Base de datos inicializada correctamente');
  } catch (err) {
    console.error('Error al inicializar la base de datos:', err);
  }
};

initDB();

module.exports = pool;