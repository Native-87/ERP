import { useState, useEffect } from 'react';
import { transactionsAPI, categoriesAPI } from '../api/client';
import Modal from '../components/Modal';
import { Plus, Search, Filter, TrendingUp, TrendingDown, DollarSign, Trash2, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

const Finanzas = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ type: 'ingreso', amount: '', description: '', date: '', category_id: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchData = async () => {
    try {
      const [transRes, catRes, sumRes] = await Promise.all([
        transactionsAPI.getAll({ page, search, type: filterType || undefined }),
        categoriesAPI.getAll(),
        transactionsAPI.getSummary({ period: 'monthly' }),
      ]);
      setTransactions(transRes.data.transactions);
      setTotalPages(transRes.data.totalPages);
      setCategories(catRes.data.categories);
      setSummary(sumRes.data.summary);
    } catch { toast.error('Error al cargar datos'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, search, filterType]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        await transactionsAPI.update(editItem.id, form);
        toast.success('Transacción actualizada');
      } else {
        await transactionsAPI.create(form);
        toast.success('Transacción creada');
      }
      setShowModal(false);
      setEditItem(null);
      setForm({ type: 'ingreso', amount: '', description: '', date: '', category_id: '' });
      fetchData();
    } catch (error) { toast.error(error.response?.data?.error || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar esta transacción?')) return;
    try {
      await transactionsAPI.delete(id);
      toast.success('Transacción eliminada');
      fetchData();
    } catch { toast.error('Error al eliminar'); }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ type: item.type, amount: item.amount, description: item.description || '', date: item.date, category_id: item.category_id || '' });
    setShowModal(true);
  };

  const formatCurrency = (v) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(v || 0);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Control Financiero</h1>
          <p className="text-surface-500 text-sm mt-1">Ingresos y egresos del período</p>
        </div>
        <button onClick={() => { setEditItem(null); setForm({ type: 'ingreso', amount: '', description: '', date: new Date().toISOString().split('T')[0], category_id: '' }); setShowModal(true); }} className="btn-primary" id="btn-new-transaction">
          <Plus size={18} /> Nueva Transacción
        </button>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="metric-card bg-emerald-50 dark:bg-emerald-900/20">
            <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-800/40"><TrendingUp size={20} className="text-emerald-600" /></div><div><p className="text-xs text-surface-500 uppercase font-medium">Ingresos</p><p className="text-xl font-bold text-emerald-600">{formatCurrency(summary.ingresos)}</p></div></div>
          </div>
          <div className="metric-card bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center gap-3"><div className="p-2 rounded-xl bg-red-100 dark:bg-red-800/40"><TrendingDown size={20} className="text-red-600" /></div><div><p className="text-xs text-surface-500 uppercase font-medium">Egresos</p><p className="text-xl font-bold text-red-600">{formatCurrency(summary.egresos)}</p></div></div>
          </div>
          <div className={`metric-card ${summary.balance >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
            <div className="flex items-center gap-3"><div className={`p-2 rounded-xl ${summary.balance >= 0 ? 'bg-emerald-100 dark:bg-emerald-800/40' : 'bg-red-100 dark:bg-red-800/40'}`}><DollarSign size={20} className={summary.balance >= 0 ? 'text-emerald-600' : 'text-red-600'} /></div><div><p className="text-xs text-surface-500 uppercase font-medium">Balance</p><p className={`text-xl font-bold ${summary.balance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>{formatCurrency(summary.balance)}</p></div></div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input pl-10" placeholder="Buscar transacciones..." id="search-transactions" />
        </div>
        <select value={filterType} onChange={(e) => { setFilterType(e.target.value); setPage(1); }} className="select w-auto" id="filter-type">
          <option value="">Todos</option>
          <option value="ingreso">Ingresos</option>
          <option value="egreso">Egresos</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Fecha</th><th>Tipo</th><th>Categoría</th><th>Descripción</th><th>Responsable</th><th className="text-right">Monto</th><th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id} className="group">
                  <td className="font-medium">{new Date(t.date + 'T12:00:00').toLocaleDateString('es-AR')}</td>
                  <td><span className={t.type === 'ingreso' ? 'badge-green' : 'badge-red'}>{t.type === 'ingreso' ? '↑ Ingreso' : '↓ Egreso'}</span></td>
                  <td>{t.category?.name || '-'}</td>
                  <td className="max-w-[200px] truncate">{t.description || '-'}</td>
                  <td>{t.user?.first_name} {t.user?.last_name}</td>
                  <td className={`text-right font-semibold ${t.type === 'ingreso' ? 'text-emerald-600' : 'text-red-600'}`}>{t.type === 'ingreso' ? '+' : '-'}{formatCurrency(t.amount)}</td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(t)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-primary-600"><Edit3 size={15} /></button>
                      <button onClick={() => handleDelete(t.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-600"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={7} className="text-center py-12 text-surface-400">No hay transacciones para mostrar</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-surface-700">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-ghost text-sm">Anterior</button>
            <span className="text-sm text-surface-500">Página {page} de {totalPages}</span>
            <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="btn-ghost text-sm">Siguiente</button>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Editar Transacción' : 'Nueva Transacción'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Tipo</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} className="select" required>
                <option value="ingreso">Ingreso</option>
                <option value="egreso">Egreso</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Monto</label>
              <input type="number" step="0.01" min="0.01" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="input" required />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Categoría</label>
            <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="select">
              <option value="">Sin categoría</option>
              {categories.filter(c => c.type === form.type && c.active !== false).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Fecha</label>
            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Descripción</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" rows={3} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => { setShowModal(false); setEditItem(null); }} className="btn-secondary">Cancelar</button>
            <button type="submit" className="btn-primary">{editItem ? 'Actualizar' : 'Crear'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Finanzas;
