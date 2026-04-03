import { useState, useEffect } from 'react';
import { workOrdersAPI, usersAPI, comprasAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Modal from '../components/Modal';
import {
  Plus, Search, ClipboardList, Clock, PlayCircle, CheckCircle2, Lock,
  ArrowRight, Paperclip, Trash2, Edit3, Eye, FileText, AlertCircle, Wrench,
  Mail, Inbox, Send
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_LABELS = { pendiente: 'Pendiente', en_curso: 'En Curso', esperando_repuesto: 'Falta de Repuesto', completada: 'Completada', cerrada: 'Cerrada' };
const STATUS_COLORS = { pendiente: 'badge-yellow', en_curso: 'badge-blue', esperando_repuesto: 'badge-red', completada: 'badge-green', cerrada: 'badge-gray' };
const PRIORITY_COLORS = { alta: 'badge-red', media: 'badge-yellow', baja: 'badge-green' };
const STATUS_ICONS = { pendiente: Clock, en_curso: PlayCircle, esperando_repuesto: AlertCircle, completada: CheckCircle2, cerrada: Lock };

const HelpCircle = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={props.size || 24} height={props.size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const MantenimientoDashboard = () => {
  const { user, hasRole } = useAuth();
  const { companySettings } = useTheme();
  
  // Estado
  const [workOrders, setWorkOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [purchaseRequests, setPurchaseRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  
  // Modales y formularios
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [showInbox, setShowInbox] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selectedOT, setSelectedOT] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', priority: 'media', sector: '', assigned_to: '', due_date: '' });
  const [statusForm, setStatusForm] = useState({ status: '', comment: '', digital_signature: false });
  const [purchaseForm, setPurchaseForm] = useState({ title: '', description: '', quantity: 1, estimatedCost: null, justification: '' });
  
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const isAdminOrSupervisor = hasRole('admin', 'supervisor');

  const fetchData = async () => {
    try {
      const [otRes, usersRes, prRes] = await Promise.all([
        workOrdersAPI.getAll({ page, search, status: filterStatus || undefined, priority: filterPriority || undefined }),
        isAdminOrSupervisor ? usersAPI.getAll({ limit: 100 }) : Promise.resolve({ data: { users: [] } }),
        isAdminOrSupervisor ? comprasAPI.getRequests() : Promise.resolve({ data: [] }),
      ]);
      
      let fetchedOTs = otRes.data.workOrders || [];
      const fetchedPRs = prRes.data || [];
      
      // Filtrar por rol en el frontend asegurando que el operario solo vea las suyas si la API no lo hace
      if (!isAdminOrSupervisor && user?.id) {
        fetchedOTs = fetchedOTs.filter(ot => 
          (ot.assignee && ot.assignee.id === user.id) || 
          (ot.creator && ot.creator.id === user.id) ||
          ot.assigned_to === user.id
        );
      }

      setWorkOrders(fetchedOTs);
      setPurchaseRequests(fetchedPRs);
      setTotalPages(otRes.data.totalPages || 1);
      setUsers(usersRes.data.users || []);
    } catch { 
      toast.error('Error al cargar datos del Dashboard de Mantenimiento'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, [page, search, filterStatus, filterPriority]);

  // KPIs calculados
  const totalOts = workOrders.length;
  const pendingOts = workOrders.filter(ot => ot.status === 'pendiente').length;
  const inProgressOts = workOrders.filter(ot => ot.status === 'en_curso').length;
  const highPriorityOts = workOrders.filter(ot => ot.priority === 'alta' && ot.status !== 'cerrada' && ot.status !== 'completada').length;

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form };
      if (!payload.assigned_to) payload.assigned_to = null;
      if (!payload.sector) payload.sector = null;
      if (!payload.due_date) payload.due_date = null;

      if (editItem) { 
        await workOrdersAPI.update(editItem.id, payload); 
        toast.success('OT actualizada'); 
      } else { 
        await workOrdersAPI.create(payload); 
        toast.success('OT creada'); 
      }
      setShowModal(false); setEditItem(null);
      setForm({ title: '', description: '', priority: 'media', sector: '', assigned_to: '', due_date: '' });
      fetchData();
    } catch (error) { 
      toast.error(error.response?.data?.error || 'Error al guardar'); 
    }
  };

  const handlePurchaseStatus = async (id, newStatus) => {
    try {
      await comprasAPI.updateRequestStatus(id, newStatus);
      toast.success(`Solicitud ${newStatus === 'Aprobada' ? 'aprobada' : 'rechazada'}`);
      fetchData();
    } catch (error) {
      toast.error('Error al actualizar solicitud');
    }
  };

  const handlePurchaseRequest = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...purchaseForm };
      if (payload.estimatedCost === '') payload.estimatedCost = null;
      await workOrdersAPI.createPurchaseRequest(selectedOT.id, payload);
      toast.success('Solicitud de compra emitida correctamente');
      setShowPurchaseModal(false);
      // Cambiar estado a esperando repuesto automáticamente
      await workOrdersAPI.changeStatus(selectedOT.id, { 
        status: 'esperando_repuesto', 
        comment: `Solicitud de compra emitida: ${purchaseForm.title}` 
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Error al emitir solicitud de compra');
    }
  };

  const calculateDuration = (curr, prev) => {
    if (!prev) return null;
    const diff = new Date(curr) - new Date(prev);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  const openDetail = async (id) => {
    try {
      const { data } = await workOrdersAPI.getById(id);
      setSelectedOT(data.workOrder);
      setShowDetail(true);
    } catch { toast.error('Error al cargar detalle'); }
  };

  const openEdit = (item) => {
    setEditItem(item);
    setForm({ 
      title: item.title, 
      description: item.description || '', 
      priority: item.priority, 
      sector: item.sector || '', 
      assigned_to: item.assigned_to || '', 
      due_date: item.due_date || '' 
    });
    setShowModal(true);
  };

  const openStatusChange = (ot, newStatus) => {
    setSelectedOT(ot);
    setStatusForm({ status: newStatus, comment: '', digital_signature: false });
    setShowStatusModal(true);
  };

  const handleStatusChange = async (e) => {
    e.preventDefault();
    try {
      if (!selectedOT?.id) throw new Error('No se ha seleccionado una OT');
      
      await workOrdersAPI.changeStatus(selectedOT.id, statusForm);
      toast.success('Estado de la OT actualizado correctamente');
      setShowStatusModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || error.message || 'Error al actualizar estado');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta orden de trabajo resolutivamente?')) return;
    try { 
      await workOrdersAPI.delete(id); 
      toast.success('OT eliminada'); 
      fetchData(); 
    } catch { 
      toast.error('Error al eliminar'); 
    }
  };

  const getOTAlert = (ot) => {
    if (ot.status === 'cerrada' || ot.status === 'completada') return 'green';
    if (ot.priority === 'alta') return 'red';
    if (ot.due_date && new Date(ot.due_date) < new Date()) return 'red';
    const daysDiff = ot.due_date ? Math.ceil((new Date(ot.due_date) - new Date()) / (1000 * 60 * 60 * 24)) : null;
    if (daysDiff !== null && daysDiff <= 2) return 'yellow';
    return 'green';
  };

  const VALID_TRANSITIONS = { 
    pendiente: ['en_curso', 'esperando_repuesto'], 
    en_curso: ['completada', 'pendiente', 'esperando_repuesto'], 
    esperando_repuesto: ['en_curso', 'pendiente'],
    completada: ['cerrada', 'en_curso'], 
    cerrada: [] 
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      <span className="text-surface-500 font-medium">Cargando Dashboard...</span>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Cabecera del Dashboard */}
      <div className="flex items-center justify-between flex-wrap gap-4 bg-white dark:bg-surface-900 p-6 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary-100 dark:bg-primary-900/30 rounded-lg text-primary-600 dark:text-primary-400">
            <Wrench size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
              Gestión de Mantenimiento
            </h1>
            <p className="text-surface-500 text-sm mt-1">
              {isAdminOrSupervisor ? 'Panel administrativo y gestión de OTs.' : 'Vista de OTs asignadas a tu cuenta.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isAdminOrSupervisor && (
            <button 
              onClick={() => setShowInbox(true)} 
              className={`relative flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all ${purchaseRequests.filter(pr => pr.status === 'Pendiente').length > 0 ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-800' : 'bg-surface-50 border-surface-200 text-surface-600 dark:bg-surface-800 dark:border-surface-700'}`}
              title="Buzón de Solicitudes"
            >
              <Mail size={20} className={purchaseRequests.filter(pr => pr.status === 'Pendiente').length > 0 ? 'animate-bounce' : ''} />
              <span className="font-bold text-sm hidden sm:inline">Buzón de Mensajes</span>
              {purchaseRequests.filter(pr => pr.status === 'Pendiente').length > 0 && (
                <span className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-white dark:border-surface-900">
                  {purchaseRequests.filter(pr => pr.status === 'Pendiente').length}
                </span>
              )}
            </button>
          )}
          {isAdminOrSupervisor && (
            <button onClick={() => { setEditItem(null); setForm({ title: '', description: '', priority: 'media', sector: '', assigned_to: '', due_date: '' }); setShowModal(true); }} className="btn-primary flex items-center gap-2 shadow-lg shadow-primary-500/20">
              <Plus size={20} /> <span className="hidden sm:inline">Nueva OT</span>
            </button>
          )}
        </div>
      </div>

      {/* Tarjetas KPI de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-surface-900 p-5 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-surface-100 dark:bg-surface-800 rounded-lg text-surface-600 dark:text-surface-400"><ClipboardList size={24} /></div>
          <div>
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Total OTs</p>
            <h3 className="text-2xl font-bold text-surface-900 dark:text-white">{totalOts}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-surface-900 p-5 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600"><Clock size={24} /></div>
          <div>
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Pendientes</p>
            <h3 className="text-2xl font-bold text-surface-900 dark:text-white">{pendingOts}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-surface-900 p-5 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600"><PlayCircle size={24} /></div>
          <div>
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400">En Curso</p>
            <h3 className="text-2xl font-bold text-surface-900 dark:text-white">{inProgressOts}</h3>
          </div>
        </div>
        <div className="bg-white dark:bg-surface-900 p-5 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600"><AlertCircle size={24} /></div>
          <div>
            <p className="text-sm font-medium text-surface-500 dark:text-surface-400">Alta Prioridad</p>
            <h3 className="text-2xl font-bold text-surface-900 dark:text-white">{highPriorityOts}</h3>
          </div>
        </div>
      </div>



      {/* Filtros */}
      <h2 className="text-lg font-bold text-surface-900 dark:text-white pt-2 border-b border-surface-200 dark:border-surface-700 pb-2">Listado de Órdenes de Trabajo</h2>
      <div className="card p-4 flex flex-wrap items-center gap-3 shadow-sm bg-white dark:bg-surface-900">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input pl-10 bg-surface-50 dark:bg-surface-800" placeholder="Buscar OT por título o descripción..." />
        </div>
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="select w-auto bg-surface-50 dark:bg-surface-800">
          <option value="">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_curso">En Curso</option>
          <option value="esperando_repuesto">Falta de Repuesto</option>
          <option value="completada">Completada</option>
          <option value="cerrada">Cerrada</option>
        </select>
        <select value={filterPriority} onChange={(e) => { setFilterPriority(e.target.value); setPage(1); }} className="select w-auto bg-surface-50 dark:bg-surface-800">
          <option value="">Todas las prioridades</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
      </div>

      {/* Lista OTs Detallada */}
      <div className="grid grid-cols-1 gap-4">
        {workOrders.map((ot) => {
          const alert = getOTAlert(ot);
          const StatusIcon = STATUS_ICONS[ot.status] || HelpCircle;
          return (
            <div key={ot.id} className={`bg-white dark:bg-surface-900 rounded-xl border border-surface-200 dark:border-surface-700 p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${alert === 'red' ? 'border-l-4 border-l-red-500' : alert === 'yellow' ? 'border-l-4 border-l-amber-500' : ''}`}>
              <div className="flex flex-col md:flex-row items-start gap-4">
                
                {/* Icono de estado decorativo */}
                <div className={`p-3 rounded-xl flex-shrink-0 ${ot.status === 'pendiente' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : ot.status === 'en_curso' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : ot.status === 'completada' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-surface-100 dark:bg-surface-700 text-surface-400'}`}>
                  <StatusIcon size={26} />
                </div>
                
                {/* Información Principal */}
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-bold text-surface-900 dark:text-white cursor-pointer hover:text-primary-600 transition-colors" onClick={() => openDetail(ot.id)}>
                        {ot.title}
                      </h3>
                      {alert !== 'green' && <AlertCircle size={16} className={alert === 'red' ? 'text-red-500' : 'text-amber-500'} />}
                    </div>

                    
                    <div className="flex gap-2 flex-wrap text-sm">
                      <span className={STATUS_COLORS[ot.status]}>{STATUS_LABELS[ot.status]}</span>
                      <span className={PRIORITY_COLORS[ot.priority]}>PRIORIDAD {ot.priority.toUpperCase()}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-surface-600 dark:text-surface-300 mb-4 line-clamp-2">
                    <FileText size={14} className="inline mr-1 text-surface-400 relative -top-0.5" />
                    Tarea: {ot.description || 'Sin descripción detallada registrada.'}
                  </p>
                  
                  {/* Detalles Explícitos */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-surface-50 dark:bg-surface-800/50 p-3 rounded-lg border border-surface-100 dark:border-surface-700/50">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Sector Ocupado</span>
                      <span className="text-sm text-surface-900 dark:text-surface-200 font-medium truncate">{ot.sector || 'General'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Creador</span>
                      <span className="text-sm text-surface-900 dark:text-surface-200 truncate">{ot.creator ? `${ot.creator.first_name} ${ot.creator.last_name}` : 'Sistema'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Asignado a</span>
                      <span className="text-sm text-surface-900 dark:text-surface-200 truncate">{ot.assignee ? `${ot.assignee.first_name} ${ot.assignee.last_name}` : <span className="text-surface-400 italic">Sin asignar</span>}</span>
                    </div>
                    <div className="flex flex-col border-l border-surface-200 dark:border-surface-700 pl-3">
                      <span className="text-[11px] font-semibold text-surface-400 uppercase tracking-wider">Fechas Clave</span>
                      <span className="text-[11px] block truncate text-surface-700 dark:text-surface-300">Emisión: {new Date(ot.created_at).toLocaleDateString('es-AR')}</span>
                      <span className="text-[11px] block truncate text-primary-600 dark:text-primary-400 font-bold">Últ. Cambio: {new Date(ot.updated_at).toLocaleDateString('es-AR')}</span>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex md:flex-col items-center gap-2 mt-4 md:mt-0 w-full md:w-auto p-3 bg-surface-50 md:bg-transparent rounded-lg justify-end md:justify-start">
                  {VALID_TRANSITIONS[ot.status]?.map((nextStatus) => (
                    <button 
                      key={nextStatus} 
                      onClick={() => {
                        if (nextStatus === 'esperando_repuesto') {
                          setSelectedOT(ot);
                          setPurchaseForm({ 
                            title: 'Solicitud de repuesto', 
                            description: '', 
                            quantity: 1, 
                            estimatedCost: null, 
                            justification: `Falta de stock para realizar la reparación indicada en OT #${ot.id}` 
                          });
                          setShowPurchaseModal(true);
                        } else {
                          openStatusChange(ot, nextStatus);
                        }
                      }} 
                      className={`w-full text-xs py-1.5 px-3 border rounded-md flex items-center justify-center gap-1 transition-all font-bold ${nextStatus === 'esperando_repuesto' ? 'bg-red-600 text-white border-red-600 hover:bg-red-700 shadow-sm' : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-600 hover:border-primary-500 hover:text-primary-600'}`}
                      title={nextStatus === 'esperando_repuesto' ? 'Emitir Solicitud de Repuesto' : `Cambiar a ${STATUS_LABELS[nextStatus]}`}
                    >
                      {nextStatus === 'esperando_repuesto' ? <Plus size={14} /> : <ArrowRight size={14} />}
                      {nextStatus === 'esperando_repuesto' ? 'Pedir Repuesto' : STATUS_LABELS[nextStatus]}
                    </button>
                  ))}
                  
                  <div className="flex gap-1 md:w-full mt-1 justify-end md:justify-center">
                    <button onClick={() => openDetail(ot.id)} className="p-2 rounded-md bg-surface-100 hover:bg-primary-100 dark:bg-surface-800 dark:hover:bg-primary-900/30 text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors" title="Ver Detalles">
                      <Eye size={18} />
                    </button>
                    {isAdminOrSupervisor && ot.status !== 'cerrada' && (
                      <button onClick={() => openEdit(ot)} className="p-2 rounded-md bg-surface-100 hover:bg-amber-100 dark:bg-surface-800 dark:hover:bg-amber-900/30 text-surface-600 dark:text-surface-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors" title="Editar">
                        <Edit3 size={18} />
                      </button>
                    )}
                    {isAdminOrSupervisor && (
                      <button onClick={() => handleDelete(ot.id)} className="p-2 rounded-md bg-surface-100 hover:bg-red-100 dark:bg-surface-800 dark:hover:bg-red-900/30 text-surface-600 dark:text-surface-400 hover:text-red-600 dark:hover:text-red-400 transition-colors" title="Eliminar">
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        
        {workOrders.length === 0 && (
          <div className="bg-white dark:bg-surface-900 p-12 text-center text-surface-400 rounded-xl border border-surface-200 dark:border-surface-700 shadow-sm flex flex-col items-center">
            <ClipboardList size={48} className="text-surface-300 mb-3" />
            <h3 className="text-lg font-medium text-surface-900 dark:text-surface-200">No hay órdenes de trabajo</h3>
            <p className="mt-1">No se encontraron tareas asignadas o que coincidan con los filtros.</p>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-secondary">Anterior</button>
          <span className="text-sm font-medium bg-surface-100 dark:bg-surface-800 px-4 py-2 rounded-lg">Página {page} de {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="btn-secondary">Siguiente</button>
        </div>
      )}

      {/* Modal - Crear/Editar OT */}
      <Modal isOpen={showModal} onClose={() => { setShowModal(false); setEditItem(null); }} title={editItem ? 'Editar OT de Mantenimiento' : 'Nueva OT de Mantenimiento'} maxWidth="max-w-xl">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Título / Tarea Corta</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input" required /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Prioridad</label><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="select"><option value="baja">Baja</option><option value="media">Media</option><option value="alta">Alta</option></select></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Sector (Ubicación de trabajo)</label><select value={form.sector} onChange={(e) => setForm({ ...form, sector: e.target.value })} className="select"><option value="">Sin sector</option>{(companySettings.sectors || []).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Asignar Operario</label><select value={form.assigned_to} onChange={(e) => setForm({ ...form, assigned_to: e.target.value })} className="select"><option value="">Sin asignar</option>{users.map(u => <option key={u.id} value={u.id}>{u.first_name} {u.last_name}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Registro del Sistema</label><div className="flex items-center gap-2 p-2.5 bg-surface-50 dark:bg-surface-800 rounded-lg border border-surface-200 dark:border-surface-700 text-surface-500 text-sm"><Clock size={16} className="text-primary-500" /> <span>Fecha de alta automática: <strong>{new Date().toLocaleDateString('es-AR')}</strong></span></div></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Fecha límite de ejecución</label><input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} className="input" /></div>
          </div>
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Instrucciones Detalladas</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input min-h-[100px]" rows={4} placeholder="Describe qué necesita reparación o mantenimiento preventivo." /></div>
          <div className="flex justify-end gap-3 pt-4 mb-2"><button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary px-6">{editItem ? 'Actualizar Orden' : 'Emitir Orden'}</button></div>
        </form>
      </Modal>

      {/* Modal - Cambiar Estado */}
      <Modal isOpen={showStatusModal} onClose={() => setShowStatusModal(false)} title={`Actualizar progreso → ${STATUS_LABELS[statusForm.status]}`}>
        <form onSubmit={handleStatusChange} className="space-y-4">
          <div className="bg-primary-50 dark:bg-primary-900/10 p-3 rounded-lg border border-primary-100 dark:border-primary-800/30 flex items-center gap-3 mb-4">
            <Clock size={20} className="text-primary-600 dark:text-primary-400" />
            <div>
              <p className="text-xs font-bold text-primary-900 dark:text-primary-100">Registro Automático de Fecha/Hora</p>
              <p className="text-[11px] text-primary-700 dark:text-primary-400">Este cambio quedará registrado con fecha: {new Date().toLocaleDateString('es-AR')}</p>
            </div>
          </div>
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Reporte / Comentario</label><textarea value={statusForm.comment} onChange={(e) => setStatusForm({ ...statusForm, comment: e.target.value })} className="input min-h-[80px]" rows={3} placeholder="Detalles de lo realizado o problemas detectados..." /></div>
          {statusForm.status === 'cerrada' && (
            <label className="flex items-center gap-3 p-4 rounded-xl bg-surface-100 dark:bg-surface-800 cursor-pointer border border-surface-200 dark:border-surface-700 hover:border-primary-400 transition-colors">
              <input type="checkbox" checked={statusForm.digital_signature} onChange={(e) => setStatusForm({ ...statusForm, digital_signature: e.target.checked })} className="w-5 h-5 rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
              <div><span className="font-bold text-surface-900 dark:text-white block">Firma del Supervisor</span><p className="text-xs text-surface-500 mt-1">Conformidad de cumplimiento de la labor de mantenimiento</p></div>
            </label>
          )}
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowStatusModal(false)} className="btn-secondary">Atrás</button><button type="submit" className="btn-primary">Registrar Progreso</button></div>
        </form>
      </Modal>

      {/* Modal - Vista Detallada */}
      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title={selectedOT?.title} maxWidth="max-w-3xl">
        {selectedOT && (
          <div className="space-y-6">
            <div className="flex gap-2 flex-wrap items-center">
              <span className={STATUS_COLORS[selectedOT.status]}>{STATUS_LABELS[selectedOT.status]}</span>
              <span className={PRIORITY_COLORS[selectedOT.priority]}>PRIORIDAD {selectedOT.priority.toUpperCase()}</span>
              {selectedOT.sector && <span className="bg-surface-200 dark:bg-surface-700 text-surface-800 dark:text-surface-200 text-xs px-2 py-1 rounded-md font-semibold font-mono">{selectedOT.sector}</span>}
              <span className="text-sm font-mono text-surface-400 ml-auto">ID: #{selectedOT.id?.toString().slice(-6) || 'N/A'}</span>
            </div>
            
            <div className="bg-surface-50 dark:bg-surface-800/60 p-5 rounded-lg border border-surface-200 dark:border-surface-700 flex flex-col">
              <span className="text-xs font-bold text-surface-400 mb-2 uppercase tracking-wider">Instrucciones de Trabajo</span>
              <div className="max-w-none text-surface-800 dark:text-surface-200 text-base leading-relaxed whitespace-pre-wrap">
                {selectedOT.description || <span className="italic text-surface-400">Sin descripción aportada al emitir la orden.</span>}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-700 p-4 rounded-lg shadow-sm">
              <div><span className="text-xs text-surface-500 uppercase font-semibold block mb-1">Emisor</span><p className="text-sm font-medium text-surface-900 dark:text-white">{selectedOT.creator?.first_name} {selectedOT.creator?.last_name}</p></div>
              <div><span className="text-xs text-surface-500 uppercase font-semibold block mb-1">Responsable</span><p className="text-sm font-medium text-surface-900 dark:text-white">{selectedOT.assignee ? `${selectedOT.assignee.first_name} ${selectedOT.assignee.last_name}` : 'Pendiente Asignación'}</p></div>
              <div><span className="text-xs text-surface-500 uppercase font-semibold block mb-1">Emisión / Registro</span><p className="text-sm font-bold text-surface-900 dark:text-white">{new Date(selectedOT.created_at).toLocaleDateString('es-AR')}</p></div>
              <div><span className="text-xs text-surface-500 uppercase font-semibold block mb-1">Vencimiento</span><p className="text-sm font-medium text-red-600 dark:text-red-400">{selectedOT.due_date ? new Date(selectedOT.due_date + 'T12:00:00').toLocaleDateString('es-AR') : 'Sin Fecha'}</p></div>
              <div><span className="text-xs text-surface-500 uppercase font-semibold block mb-1">Último Cambio</span><p className="text-sm font-bold text-primary-600 dark:text-primary-400">{new Date(selectedOT.updated_at).toLocaleDateString('es-AR')}</p></div>
            </div>

            {selectedOT.digital_signature && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 text-emerald-800 dark:text-emerald-400 text-sm">
                <CheckCircle2 size={24} className="text-emerald-500/80" /> 
                <div>
                  <strong className="block">Trabajo avalado y cerrado.</strong>
                  <span className="opacity-80">La firma digital de conformidad avala que los requerimientos de la orden fueron cumplidos.</span>
                </div>
              </div>
            )}
            
            {/* Historial */}
            {selectedOT.history?.length > 0 && (
              <div className="mt-8 border-t border-surface-200 dark:border-surface-700 pt-6">
                <h4 className="font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2"><Clock size={16} className="text-primary-500" /> Historial de Avances</h4>
                <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {selectedOT.history.map((h, index) => {
                    const duration = index > 0 
                      ? calculateDuration(selectedOT.history[index-1].created_at, h.created_at) 
                      : null;
                    
                    return (
                      <div key={h.id} className="relative pl-6 pb-4 last:pb-0">
                        <div className="absolute left-1.5 top-1.5 w-2 h-2 rounded-full bg-primary-500 z-10 box-content border-4 border-white dark:border-surface-900" />
                        {index !== selectedOT.history.length - 1 && <div className="absolute left-2.5 top-3 w-px h-full bg-surface-200 dark:bg-surface-700" />}
                        <div className="bg-surface-50 dark:bg-surface-800 border border-surface-100 dark:border-surface-700/50 p-3 rounded-lg shadow-sm text-sm">
                          <div className="flex justify-between items-start mb-1">
                            <p className="font-semibold text-surface-900 dark:text-white">
                              {h.previous_status ? `${STATUS_LABELS[h.previous_status] || h.previous_status} ➔ ${STATUS_LABELS[h.new_status] || h.new_status}` : `Reporte Inicial (${STATUS_LABELS[h.new_status] || h.new_status})`}
                            </p>
                            {duration && <span className="text-[10px] font-bold bg-primary-50 dark:bg-primary-900/20 text-primary-600 px-1.5 py-0.5 rounded-full flex items-center gap-1"><Clock size={10} /> Duración: {duration}</span>}
                          </div>
                          {h.comment && <p className="text-surface-600 dark:text-surface-300 bg-white dark:bg-surface-900 p-2 rounded border border-surface-200 dark:border-surface-800 my-2 shadow-inner leading-relaxed">{h.comment}</p>}
                          <p className="text-xs text-surface-400 font-medium">Registrado por {h.user?.first_name || h.user?.username} el {new Date(h.created_at).toLocaleDateString('es-AR')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Adjuntos */}
            {selectedOT.attachments?.length > 0 && (
              <div className="mt-6 border-t border-surface-200 dark:border-surface-700 pt-6">
                <h4 className="font-bold text-surface-900 dark:text-white mb-4 flex items-center gap-2"><Paperclip size={16} className="text-primary-500" /> Archivos de Apoyo</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedOT.attachments.map((att) => (
                    <a key={att.id} href={`/uploads/${att.filename}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-3 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 hover:border-primary-400 dark:hover:border-primary-500 transition-colors group">
                      <div className="p-2 bg-surface-100 dark:bg-surface-700 rounded-md group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 text-surface-500 group-hover:text-primary-500 transition-colors"><Paperclip size={16} /></div>
                      <div className="flex-1 min-w-0"><p className="text-xs font-semibold text-surface-700 dark:text-surface-200 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400">{att.original_name}</p><p className="text-[10px] text-surface-400">{(att.size / 1024).toFixed(1)} KB</p></div>
                    </a>
                  ))}
                </div>
              </div>
            )}
            {/* Sección de Orden de Compra unificada con el estado */}
            {(selectedOT.status === 'pendiente' || selectedOT.status === 'en_curso') && (
              <div className="mt-6 p-5 rounded-xl border-2 border-dashed border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/30 flex flex-col items-center text-center gap-3">
                <div className="p-3 bg-red-100 dark:bg-red-900/40 rounded-full text-red-600"><AlertCircle size={24} /></div>
                <div>
                  <h5 className="font-bold text-surface-900 dark:text-white">¿No puedes continuar por falta de repuestos?</h5>
                  <p className="text-xs text-surface-500 mt-1 max-w-sm">Si necesitas un insumo, puedes solicitarlo aquí. La OT pasará automáticamente al estado "Falta de Repuesto".</p>
                </div>
                <button onClick={() => { setPurchaseForm({ title: 'Solicitud de repuesto', description: '', quantity: 1, estimatedCost: null, justification: `Solicitado desde detalle de OT #${selectedOT.id}` }); setShowPurchaseModal(true); }} className="btn-primary bg-red-600 hover:bg-red-700 border-red-600 text-white px-8">
                  Emitir Solicitud de Repuesto
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Modal - Solicitar Compra */}
      <Modal isOpen={showPurchaseModal} onClose={() => setShowPurchaseModal(false)} title="Solicitud de repuesto" maxWidth="max-w-lg">
        <form onSubmit={handlePurchaseRequest} className="space-y-4">
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Repuesto / Insumo</label><input value={purchaseForm.title} onChange={(e) => setPurchaseForm({ ...purchaseForm, title: e.target.value })} className="input" required /></div>
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Cantidad de unidades requeridas</label><input type="number" min="1" value={purchaseForm.quantity} onChange={(e) => setPurchaseForm({ ...purchaseForm, quantity: parseInt(e.target.value) })} className="input" required /></div>
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Justificación Técnica</label><textarea value={purchaseForm.justification} onChange={(e) => setPurchaseForm({ ...purchaseForm, justification: e.target.value })} className="input min-h-[80px]" rows={3} placeholder="Explica por qué es crítico para la OT..." /></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowPurchaseModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">Emitir Solicitud</button></div>
        </form>
      </Modal>

      {/* Modal - Casilla de Mensajes (Inbox) */}
      <Modal isOpen={showInbox} onClose={() => setShowInbox(false)} title="Casilla de Mensajes - Solicitudes de Repuesto" maxWidth="max-w-2xl">
        <div className="space-y-4">
          {purchaseRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-surface-400">
              <Inbox size={48} className="opacity-20 mb-4" />
              <p className="font-medium">No tienes mensajes nuevos</p>
              <p className="text-xs">Todas las solicitudes han sido gestionadas.</p>
            </div>
          ) : (
            <div className="divide-y divide-surface-100 dark:divide-surface-800 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
              {purchaseRequests.map((pr) => (
                <div key={pr.id} className="py-4 first:pt-0 group hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors rounded-lg px-3">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold text-sm shrink-0">
                      {pr.requester?.first_name?.charAt(0) || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold text-surface-900 dark:text-white truncate">
                          {pr.requester?.first_name} {pr.requester?.last_name}
                        </h4>
                        <span className="text-[10px] text-surface-400 whitespace-nowrap ml-2">
                          {new Date(pr.createdAt).toLocaleDateString('es-AR')}
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-primary-600 dark:text-primary-400 mb-1">
                        <span className="opacity-60 text-surface-500 uppercase text-[9px] mr-1">Asunto:</span> 
                        {pr.title} 
                        <span className="mx-2 text-surface-300">|</span> 
                        <span className="text-surface-500">OT #{pr.work_order_id}</span>
                      </p>
                      <div className="bg-white dark:bg-surface-900 p-3 rounded-lg border border-surface-200 dark:border-surface-700 text-[13px] text-surface-600 dark:text-surface-300 italic mb-3 shadow-sm">
                        "{pr.justification}"
                        <div className="mt-2 pt-2 border-t border-surface-100 dark:border-surface-800 flex justify-between items-center not-italic uppercase text-[9px] font-bold tracking-widest text-surface-400">
                          <span>Cantidad: {pr.quantity} un.</span>
                          <span className={pr.status === 'Aprobada' ? 'text-emerald-500' : pr.status === 'Rechazada' ? 'text-red-500' : ''}>
                            Estado: {pr.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        {pr.status === 'Pendiente' ? (
                          <>
                            <button 
                              onClick={() => handlePurchaseStatus(pr.id, 'Rechazada')} 
                              className="px-4 py-1.5 text-xs font-bold text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 transition-colors"
                            >
                              Rechazar
                            </button>
                            <button 
                              onClick={() => handlePurchaseStatus(pr.id, 'Aprobada')} 
                              className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition-colors flex items-center gap-1"
                            >
                              <Send size={12} /> Aprobar Solicitud
                            </button>
                          </>
                        ) : (
                          <span className="flex items-center gap-1.5 text-[10px] font-bold text-surface-400 bg-surface-100 dark:bg-surface-800 px-3 py-1 rounded-full uppercase tracking-tighter">
                            <CheckCircle2 size={12} className={pr.status === 'Aprobada' ? 'text-emerald-500' : 'text-red-400'} />
                            Acción registrada como {pr.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

      {/* Botón Flotante para Nueva OT */}
      {isAdminOrSupervisor && (
        <button 
          onClick={() => { setEditItem(null); setForm({ title: '', description: '', priority: 'media', sector: '', assigned_to: '', due_date: '' }); setShowModal(true); }} 
          className="fixed bottom-10 right-10 w-16 h-16 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-2xl shadow-primary-500/40 flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-50 group border-4 border-white dark:border-surface-800"
          id="btn-new-ot-fab"
        >
          <Plus size={32} strokeWidth={2.5} />
          <span className="absolute right-full mr-4 px-3 py-1.5 bg-surface-900/90 backdrop-blur-sm text-white text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl border border-white/10">
            Nueva OT
          </span>
        </button>
      )}
    </div>
  );
};

export default MantenimientoDashboard;
