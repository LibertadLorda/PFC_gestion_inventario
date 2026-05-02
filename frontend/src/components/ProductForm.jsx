import { useState, useEffect } from 'react';
import api from '../services/api';

function ProductForm({ onSubmit, initialData, onCancel }) {
  const [name, setName] = useState(initialData?.name || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [category, setCategory] = useState(initialData?.category || '');
  const [stock, setStock] = useState(initialData?.stock || '');
  const [stockMin, setStockMin] = useState(initialData?.stock_min || '');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await api.get('/categories');
        setCategories(res.data);
      } catch {
        console.error('Error al cargar las categorías');
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, description, category, stock, stock_min: stockMin });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Nombre *</label>
          <input
            type="text"
            className="form-control"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Categoría</label>
          {/* Desplegable con categorías de la empresa */}
          <select
            className="form-select"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Sin categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.name}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="mb-3">
        <label className="form-label">Descripción</label>
        <input
          type="text"
          className="form-control"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label className="form-label">Stock actual</label>
          <input
            type="number"
            className="form-control"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            min="0"
          />
        </div>
        <div className="col-md-6 mb-3">
          <label className="form-label">Stock mínimo</label>
          <input
            type="number"
            className="form-control"
            value={stockMin}
            onChange={(e) => setStockMin(e.target.value)}
            min="0"
          />
        </div>
      </div>
      <div className="d-flex gap-2">
        <button type="submit" className="btn btn-warning fw-semibold">
          Guardar
        </button>
        {onCancel && (
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
}

export default ProductForm;