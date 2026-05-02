const express = require('express');
const router = express.Router();
const pool = require('../db/database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// ─── LISTAR PRODUCTOS ────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM products WHERE company_id = $1 ORDER BY created_at DESC',
      [req.user.company_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── CREAR PRODUCTO (solo admin) ─────────────────────────────
router.post('/', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
  }

  const { name, description, category, stock, stock_min } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'El nombre del producto es obligatorio' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO products (name, description, category, stock, stock_min, company_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
      [name, description, category, stock ?? 0, stock_min ?? 5, req.user.company_id]
    );
    res.status(201).json({ id: result.rows[0].id, message: 'Producto creado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── EDITAR PRODUCTO (solo admin) ────────────────────────────
router.put('/:id', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
  }

  const { name, description, category, stock, stock_min } = req.body;

  try {
    const product = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND company_id = $2',
      [req.params.id, req.user.company_id]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await pool.query(
      'UPDATE products SET name = $1, description = $2, category = $3, stock = $4, stock_min = $5 WHERE id = $6 AND company_id = $7',
      [name, description, category, stock, stock_min, req.params.id, req.user.company_id]
    );

    res.json({ message: 'Producto actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── ACTUALIZAR STOCK (admin y trabajadores) ─────────────────
router.patch('/:id/stock', async (req, res) => {
  const { stock } = req.body;

  if (stock === undefined || stock === null) {
    return res.status(400).json({ error: 'El stock es obligatorio' });
  }

  try {
    const product = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND company_id = $2',
      [req.params.id, req.user.company_id]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await pool.query(
      'UPDATE products SET stock = $1 WHERE id = $2 AND company_id = $3',
      [stock, req.params.id, req.user.company_id]
    );

    res.json({ message: 'Stock actualizado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── ELIMINAR PRODUCTO (solo admin) ──────────────────────────
router.delete('/:id', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
  }

  try {
    const product = await pool.query(
      'SELECT * FROM products WHERE id = $1 AND company_id = $2',
      [req.params.id, req.user.company_id]
    );

    if (product.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await pool.query(
      'DELETE FROM products WHERE id = $1 AND company_id = $2',
      [req.params.id, req.user.company_id]
    );

    res.json({ message: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;