import { useState, useEffect } from 'react';
import { productsAPI } from '../api/client';
import Modal from '../components/Modal';
import { Plus, Search, Package, ArrowUpCircle, ArrowDownCircle, AlertTriangle, Trash2, Edit3, History } from 'lucide-react';
import toast from 'react-hot-toast';

const Inventario = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showMovModal, setShowMovModal] = useState(false);
  const [showHistorial, setShowHistorial] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [movements, setMovements] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', unit: 'unidad', current_stock: 0, min_stock: 0 });
  const [movForm, setMovForm] = useState({ type: 'entrada', quantity: '', description: '', date: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    try {
      const { data } = await productsAPI.getAll({ page, search });
      setProducts(data.products);
      setTotalPages(data.totalPages);
    } catch { toast.error('Error al cargar productos'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await productsAPI.update(editItem.id, form);
        toast.success('Producto actualizado');
      } else {
        await productsAPI.create(form);
        toast.success('Producto creado');
      }
      setShowModal(false); setEditItem(null);
      setForm({ name: '', description: '', unit: 'unidad', current_stock: 0, min_stock: 0 });
      fetchProducts();
    } catch (error) { toast.error(error.response?.data?.error || 'Error'); }
  };

  const handleMovement = async (e) => {
    e.preventDefault();
    try {
      await productsAPI.addMovement(selectedProduct.id, { ...movForm, date: movForm.date || new Date().toISOString().split('T')[0] });
      toast.success(`${movForm.type === 'entrada' ? 'Entrada' : 'Salida'} registrada`);
      setShowMovModal(false);
      setMovForm({ type: 'entrada', quantity: '', description: '', date: '' });
      fetchProducts();
    } catch (error) { toast.error(error.response?.data?.error || 'Error'); }
  };

  const openHistorial = async (product) => {
    setSelectedProduct(product);
    try {
      const { data } = await productsAPI.getMovements(product.id);
      setMovements(data.movements);
      setShowHistorial(true);
    } catch { toast.error('Error al cargar historial'); }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ name: item.name, description: item.description || '', unit: item.unit, current_stock: item.current_stock, min_stock: item.min_stock });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Desactivar este producto?')) return;
    try { await productsAPI.delete(id); toast.success('Producto desactivado'); fetchProducts(); } catch { toast.error('Error'); }
  };

  const getStockStatus = (product) => {
    const stock = parseFloat(product.current_stock);
    const min = parseFloat(product.min_stock);
    if (min <= 0) return 'normal';
    if (stock <= min) return 'critical';
    if (stock <= min * 1.5) return 'low';
    return 'normal';
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-surface-900 dark:text-white">Inventario</h1><p className="text-surface-500 text-sm mt-1">Control de stock y mercadería</p></div>
        <button onClick={() => { setEditItem(null); setForm({ name: '', description: '', unit: 'unidad', current_stock: 0, min_stock: 0 }); setShowModal(true); }} className="btn-primary" id="btn-new-product"><Plus size={18} /> Nuevo Producto</button>
      </div>

      <div className="card p-4">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input pl-10" placeholder="Buscar productos..." id="search-products" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => {
          const status = getStockStatus(p);
          return (
            <div key={p.id} className={`card-hover p-5 ${status === 'critical' ? 'border-red-300 dark:border-red-700' : status === 'low' ? 'border-amber-300 dark:border-amber-700' : ''}`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${status === 'critical' ? 'bg-red-100 dark:bg-red-900/30' : status === 'low' ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-primary-100 dark:bg-primary-900/30'}`}>
                    <Package size={20} className={status === 'critical' ? 'text-red-600' : status === 'low' ? 'text-amber-600' : 'text-primary-600'} />
                  </div>
                  <div><h3 className="font-semibold text-surface-900 dark:text-white">{p.name}</h3>{p.description && <p className="text-xs text-surface-500 truncate max-w-[150px]">{p.description}</p>}</div>
                </div>
                {status !== 'normal' && <span className={status === 'critical' ? 'alert-dot-red' : 'alert-dot-yellow'} />}
              </div>

              <div className="flex items-end justify-between mt-4">
                <div>
                  <p className="text-xs text-surface-500 uppercase font-medium">Stock actual</p>
                  <p className={`text-2xl font-bold ${status === 'critical' ? 'text-red-600' : status === 'low' ? 'text-amber-600' : 'text-surface-900 dark:text-white'}`}>{parseFloat(p.current_stock)} <span className="text-sm font-normal text-surface-400">{p.unit}</span></p>
                  <p className="text-xs text-surface-400">Mínimo: {parseFloat(p.min_stock)} {p.unit}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setSelectedProduct(p); setMovForm({ type: 'entrada', quantity: '', description: '', date: new Date().toISOString().split('T')[0] }); setShowMovModal(true); }} className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-surface-400 hover:text-emerald-600 transition-colors" title="Agregar entrada/salida"><ArrowUpCircle size={18} /></button>
                  <button onClick={() => openHistorial(p)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-primary-600 transition-colors" title="Historial"><History size={18} /></button>
                  <button onClick={() => openEdit(p)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-primary-600 transition-colors" title="Editar"><Edit3 size={18} /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-600 transition-colors" title="Eliminar"><Trash2 size={18} /></button>
                </div>
              </div>
            </div>
          );
        })}
        {products.length === 0 && <div className="col-span-full text-center py-12 text-surface-400">No hay productos</div>}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-ghost">Anterior</button>
          <span className="text-sm text-surface-500">Página {page} de {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="btn-ghost">Siguiente</button>
        </div>
      )}

      {/* Product Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Editar Producto' : 'Nuevo Producto'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Nombre</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Unidad</label><input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="input" /></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Stock mínimo</label><input type="number" step="0.01" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} className="input" /></div>
          </div>
          {!editItem && <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Stock inicial</label><input type="number" step="0.01" value={form.current_stock} onChange={(e) => setForm({ ...form, current_stock: e.target.value })} className="input" /></div>}
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Descripción</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={2} /></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Actualizar' : 'Crear'}</button></div>
        </form>
      </Modal>

      {/* Movement Modal */}
      <Modal isOpen={showMovModal} onClose={() => setShowMovModal(false)} title={`Movimiento: ${selectedProduct?.name}`}>
        <form onSubmit={handleMovement} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Tipo</label><select value={movForm.type} onChange={(e) => setMovForm({ ...movForm, type: e.target.value })} className="select"><option value="entrada">Entrada</option><option value="salida">Salida</option></select></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Cantidad</label><input type="number" step="0.01" min="0.01" value={movForm.quantity} onChange={(e) => setMovForm({ ...movForm, quantity: e.target.value })} className="input" required /></div>
          </div>
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Fecha</label><input type="date" value={movForm.date} onChange={(e) => setMovForm({ ...movForm, date: e.target.value })} className="input" /></div>
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Descripción</label><textarea value={movForm.description} onChange={(e) => setMovForm({ ...movForm, description: e.target.value })} className="input" rows={2} /></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowMovModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-success">Registrar</button></div>
        </form>
      </Modal>

      {/* Historial Modal */}
      <Modal isOpen={showHistorial} onClose={() => setShowHistorial(false)} title={`Historial: ${selectedProduct?.name}`} maxWidth="max-w-2xl">
        <div className="table-container"><table className="table"><thead><tr><th>Fecha</th><th>Tipo</th><th>Cantidad</th><th>Responsable</th><th>Descripción</th></tr></thead><tbody>
          {movements.map((m) => (
            <tr key={m.id}><td>{new Date(m.date + 'T12:00:00').toLocaleDateString('es-AR')}</td><td><span className={m.type === 'entrada' ? 'badge-green' : 'badge-red'}>{m.type === 'entrada' ? '↑ Entrada' : '↓ Salida'}</span></td><td className="font-semibold">{parseFloat(m.quantity)}</td><td>{m.user?.first_name} {m.user?.last_name}</td><td className="max-w-[200px] truncate">{m.description || '-'}</td></tr>
          ))}
          {movements.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-surface-400">Sin movimientos</td></tr>}
        </tbody></table></div>
      </Modal>
    </div>
  );
};

export default Inventario;
