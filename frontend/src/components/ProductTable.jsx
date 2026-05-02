import { useState } from 'react';

// Número de productos por página
const ITEMS_PER_PAGE = 10;

function ProductTable({ products, isAdmin, editingStock, newStock, setNewStock, setEditingStock, setEditingProduct, onStockUpdate, onDelete }) {

  // Página actual
  const [currentPage, setCurrentPage] = useState(1);

  // Calcula el total de páginas
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  // Obtiene los productos de la página actual
  const paginatedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Si hay un cambio en los productos (búsqueda/filtro), vuelve a la página 1
  // Esto evita quedarse en una página que ya no existe
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(1);
  }

  return (
    <div>
      <div className="table-responsive">
        <table className="table table-bordered table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Categoría</th>
              <th>Stock</th>
              <th>Mínimo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => (
              <tr key={product.id}>
                <td className="fw-semibold">{product.name}</td>
                <td className="text-muted">{product.description || '-'}</td>
                <td>
                  {product.category
                    ? <span className="badge bg-warning-subtle text-warning-emphasis">{product.category}</span>
                    : <span className="text-muted">-</span>
                  }
                </td>
                <td>
                  {editingStock === product.id ? (
                    <div className="d-flex gap-2 align-items-center">
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        style={{ width: '80px' }}
                        value={newStock}
                        onChange={(e) => setNewStock(e.target.value)}
                        min="0"
                      />
                      <button className="btn btn-success btn-sm" onClick={() => onStockUpdate(product.id)}>✓</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setEditingStock(null)}>✕</button>
                    </div>
                  ) : (
                    <span className={product.stock < product.stock_min ? 'text-danger fw-bold' : ''}>
                      {product.stock} {product.stock < product.stock_min ? '⚠️' : ''}
                    </span>
                  )}
                </td>
                <td>{product.stock_min}</td>
                <td>
                  {editingStock !== product.id && (
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => { setEditingStock(product.id); setNewStock(product.stock); }}
                    >
                      Stock
                    </button>
                  )}
                  {isAdmin && (
                    <>
                      <button
                        className="btn btn-outline-dark btn-sm me-2"
                        onClick={() => setEditingProduct(product)}
                      >
                        Editar
                      </button>
                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => onDelete(product.id)}
                      >
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación, solo visible si hay más de una página */}
      {totalPages > 1 && (
        <div className="d-flex flex-column align-items-center mt-5 gap-2">
          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link text-dark" onClick={() => setCurrentPage(currentPage - 1)}>
                  ←
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                  <button
                    className={`page-link ${currentPage === page ? 'bg-warning border-warning text-dark' : 'text-dark'}`}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                <button className="page-link text-dark" onClick={() => setCurrentPage(currentPage + 1)}>
                  →
                </button>
              </li>
            </ul>
          </nav>
          <p className="text-muted small mb-0">
            Mostrando {(currentPage - 1) * ITEMS_PER_PAGE + 1} - {Math.min(currentPage * ITEMS_PER_PAGE, products.length)} de {products.length} productos
          </p>
        </div>
      )}
    </div>
  );
}

export default ProductTable;