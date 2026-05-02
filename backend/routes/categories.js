const express = require('express');
const router = express.Router();
const pool = require('../db/database');
const authMiddleware = require('../middleware/auth');

router.use(authMiddleware);

// ─── LISTAR CATEGORÍAS ────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM categories WHERE company_id = $1 ORDER BY name',
      [req.user.company_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── CREAR CATEGORÍA (solo admin) ────────────────────────────
router.post('/', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
  }

  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
  }

  try {
    const categoryExists = await pool.query(
      'SELECT id FROM categories WHERE name = $1 AND company_id = $2',
      [name, req.user.company_id]
    );

    if (categoryExists.rows.length > 0) {
      return res.status(400).json({ error: 'La categoría ya existe' });
    }

    await pool.query(
      'INSERT INTO categories (name, description, company_id) VALUES ($1, $2, $3)',
      [name, description || null, req.user.company_id]
    );

    res.status(201).json({ message: 'Categoría creada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── EDITAR CATEGORÍA (solo admin) ───────────────────────────
router.put('/:id', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
  }

  const { name, description } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
  }

  try {
    const category = await pool.query(
      'SELECT * FROM categories WHERE id = $1 AND company_id = $2',
      [req.params.id, req.user.company_id]
    );

    if (category.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    const nameExists = await pool.query(
      'SELECT id FROM categories WHERE name = $1 AND company_id = $2 AND id != $3',
      [name, req.user.company_id, req.params.id]
    );

    if (nameExists.rows.length > 0) {
      return res.status(400).json({ error: 'Ya existe una categoría con ese nombre' });
    }

    await pool.query(
      'UPDATE categories SET name = $1, description = $2 WHERE id = $3 AND company_id = $4',
      [name, description || null, req.params.id, req.user.company_id]
    );

    res.json({ message: 'Categoría actualizada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ─── ELIMINAR CATEGORÍA (solo admin) ─────────────────────────
router.delete('/:id', async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'No tienes permisos para realizar esta acción' });
  }

  try {
    const category = await pool.query(
      'SELECT * FROM categories WHERE id = $1 AND company_id = $2',
      [req.params.id, req.user.company_id]
    );

    if (category.rows.length === 0) {
      return res.status(404).json({ error: 'Categoría no encontrada' });
    }

    await pool.query(
      'DELETE FROM categories WHERE id = $1 AND company_id = $2',
      [req.params.id, req.user.company_id]
    );

    res.json({ message: 'Categoría eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;