import { useState, useEffect } from 'react';
import api from '../services/api';
import ProductForm from '../components/ProductForm';
import Sidebar from '../components/Sidebar';
import ProductTable from '../components/ProductTable';

function Dashboard() {
  const isAdmin = localStorage.getItem('role') === 'admin';

  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingStock, setEditingStock] = useState(null);
  const [newStock, setNewStock] = useState('');
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  // Cuenta productos con stock bajo
  const lowStock = products.filter(p => p.stock < p.stock_min).length;

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await api.get('/products');
        setProducts(res.data);
      } catch {
        setError('Error al cargar los productos');
      }
    };
    loadProducts();
  }, []);

  const handleCreate = async (data) => {
    try {
      await api.post('/products', data);
      setShowForm(false);
      const res = await api.get('/products');
      setProducts(res.data);
    } catch {
      setError('Error al crear el producto');
    }
  };

  const handleEdit = async (data) => {
    try {
      await api.put(`/products/${editingProduct.id}`, data);
      setEditingProduct(null);
      const res = await api.get('/products');
      setProducts(res.data);
    } catch {
      setError('Error al editar el producto');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Seguro que quieres eliminar este producto?')) return;
    try {
      await api.delete(`/products/${id}`);
      const res = await api.get('/products');
      setProducts(res.data);
    } catch {
      setError('Error al eliminar el producto');
    }
  };

  const handleStockUpdate = async (id) => {
    try {
      await api.patch(`/products/${id}/stock`, { stock: parseInt(newStock) });
      setEditingStock(null);
      setNewStock('');
      const res = await api.get('/products');
      setProducts(res.data);
    } catch {
      setError('Error al actualizar el stock');
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === '' || product.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = [...new Set(products.map((p) => p.category).filter(Boolean))];

  return (
    <div>
      <Sidebar lowStock={lowStock}/>

      <div className="main-content">
        {error && <div className="alert alert-danger">{error}</div>}

        {/* Cabecera */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="fw-bold mb-0">Productos</h4>
          {isAdmin && !showForm && !editingProduct && (
            <button className="btn btn-warning fw-semibold" onClick={() => setShowForm(true)}>
              + Añadir producto
            </button>
          )}
        </div>

        {/* Formulario crear */}
        {showForm && (
          <div className="card border-warning-subtle mb-4">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">Nuevo producto</h5>
              <ProductForm onSubmit={handleCreate} onCancel={() => setShowForm(false)} />
            </div>
          </div>
        )}

        {/* Formulario editar */}
        {editingProduct && (
          <div className="card border-warning-subtle mb-4">
            <div className="card-body">
              <h5 className="card-title fw-bold mb-3">Editar producto</h5>
              <ProductForm
                initialData={editingProduct}
                onSubmit={handleEdit}
                onCancel={() => setEditingProduct(null)}
              />
            </div>
          </div>
        )}

        {/* Buscador y filtro */}
        <div className="row mb-3">
          <div className="col-md-6 mb-2">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-4 mb-2">
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla */}
        {filteredProducts.length === 0 ? (
          <p className="text-muted">No hay productos que coincidan con la búsqueda.</p>
        ) : (
          <ProductTable
            products={filteredProducts}
            isAdmin={isAdmin}
            editingStock={editingStock}
            newStock={newStock}
            setNewStock={setNewStock}
            setEditingStock={setEditingStock}
            setEditingProduct={setEditingProduct}
            onStockUpdate={handleStockUpdate}
            onDelete={handleDelete}
          />
        )}
      </div>
    </div>
  );
}

export default Dashboard;