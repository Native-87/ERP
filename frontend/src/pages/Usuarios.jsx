import { useState, useEffect } from 'react';
import { usersAPI } from '../api/client';
import Modal from '../components/Modal';
import { Plus, Search, UserCircle, Shield, Edit3, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLE_LABELS = { admin: 'Administrador', supervisor: 'Supervisor', operario: 'Operario', contador: 'Contador' };
const ROLE_COLORS = { admin: 'badge-red', supervisor: 'badge-blue', operario: 'badge-green', contador: 'badge-yellow' };

const Usuarios = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ username: '', email: '', password: '', first_name: '', last_name: '', role: 'operario', area: 'General' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    try {
      const { data } = await usersAPI.getAll({ page, search });
      setUsers(data.users);
      setTotalPages(data.totalPages);
    } catch { toast.error('Error al cargar usuarios'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await usersAPI.update(editItem.id, payload);
        toast.success('Usuario actualizado');
      } else {
        await usersAPI.create(form);
        toast.success('Usuario creado');
      }
      setShowModal(false); setEditItem(null);
      setForm({ username: '', email: '', password: '', first_name: '', last_name: '', role: 'operario', area: 'General' });
      fetchUsers();
    } catch (error) { toast.error(error.response?.data?.error || 'Error'); }
  };

  const openEdit = (user) => {
    setEditItem(user);
    setForm({ username: user.username, email: user.email, password: '', first_name: user.first_name, last_name: user.last_name, role: user.role, area: user.area || 'General' });
    setShowModal(true);
  };

  const handleToggleActive = async (user) => {
    try {
      await usersAPI.update(user.id, { active: !user.active });
      toast.success(user.active ? 'Usuario desactivado' : 'Usuario activado');
      fetchUsers();
    } catch { toast.error('Error'); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div><h1 className="text-2xl font-bold text-surface-900 dark:text-white">Gestión de Usuarios</h1><p className="text-surface-500 text-sm mt-1">Administración de cuentas y roles</p></div>
        <button onClick={() => { setEditItem(null); setForm({ username: '', email: '', password: '', first_name: '', last_name: '', role: 'operario', area: 'General' }); setShowModal(true); }} className="btn-primary" id="btn-new-user"><Plus size={18} /> Nuevo Usuario</button>
      </div>

      <div className="card p-4"><div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" /><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input pl-10" placeholder="Buscar usuarios..." /></div></div>

      <div className="card overflow-hidden">
        <div className="table-container"><table className="table"><thead><tr><th>Usuario</th><th>Email</th><th>Nombre</th><th>Rol</th><th>Área</th><th>Estado</th><th>Último acceso</th><th className="text-right">Acciones</th></tr></thead><tbody>
          {users.map((u) => (
            <tr key={u.id} className="group">
              <td><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold">{u.first_name?.[0]}{u.last_name?.[0]}</div><span className="font-medium">{u.username}</span></div></td>
              <td className="text-surface-500">{u.email}</td>
              <td>{u.first_name} {u.last_name}</td>
              <td><span className={ROLE_COLORS[u.role]}><Shield size={12} /> {ROLE_LABELS[u.role]}</span></td>
              <td><span className="text-xs font-semibold bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-300 px-2 py-1 rounded-md border border-surface-200 dark:border-surface-700">{u.area || 'General'}</span></td>
              <td>{u.active ? <span className="badge-green"><CheckCircle2 size={12} /> Activo</span> : <span className="badge-red"><XCircle size={12} /> Inactivo</span>}</td>
              <td className="text-sm text-surface-400">{u.last_login ? new Date(u.last_login).toLocaleString('es-AR') : 'Nunca'}</td>
              <td className="text-right"><div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-400 hover:text-primary-600"><Edit3 size={15} /></button>
                <button onClick={() => handleToggleActive(u)} className={`p-1.5 rounded-lg ${u.active ? 'hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-600' : 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-surface-400 hover:text-emerald-600'}`}>{u.active ? <XCircle size={15} /> : <CheckCircle2 size={15} />}</button>
              </div></td>
            </tr>
          ))}
          {users.length === 0 && <tr><td colSpan={8} className="text-center py-12 text-surface-400">No hay usuarios</td></tr>}
        </tbody></table></div>
        {totalPages > 1 && <div className="flex items-center justify-between px-4 py-3 border-t border-surface-200 dark:border-surface-700"><button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-ghost text-sm">Anterior</button><span className="text-sm text-surface-500">Página {page} de {totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="btn-ghost text-sm">Siguiente</button></div>}
      </div>

      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Editar Usuario' : 'Nuevo Usuario'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Nombre</label><input value={form.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} className="input" required /></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Apellido</label><input value={form.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} className="input" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Usuario</label><input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="input" required /></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Rol</label><select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="select"><option value="operario">Operario</option><option value="supervisor">Supervisor</option><option value="contador">Contador</option><option value="admin">Administrador</option></select></div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Área Sectorial</label>
              <select value={form.area} onChange={(e) => setForm({ ...form, area: e.target.value })} className="select">
                <option value="General">General</option>
                <option value="Mantenimiento">Mantenimiento</option>
                <option value="Producción">Producción</option>
                <option value="Ventas">Ventas</option>
                <option value="Recursos Humanos">Recursos Humanos</option>
              </select>
            </div>
          </div>
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">{editItem ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña'}</label><input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input" {...(!editItem && { required: true })} /></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editItem ? 'Actualizar' : 'Crear'}</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default Usuarios;
