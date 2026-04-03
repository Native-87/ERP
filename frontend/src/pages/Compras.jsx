import { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { toast } from 'react-hot-toast';
import { ShoppingCart, Truck, FileSignature } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Compras() {
  const [activeTab, setActiveTab] = useState('proveedores');
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { hasRole } = useAuth();

  const [requests, setRequests] = useState([]);
  const [orders, setOrders] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [provRes, reqRes, ordRes] = await Promise.all([
        apiClient.get('/compras/providers'),
        apiClient.get('/compras/requests'),
        (hasRole('admin') || hasRole('contador')) ? apiClient.get('/compras/orders') : Promise.resolve({ data: [] })
      ]);
      setProviders(provRes.data);
      setRequests(reqRes.data);
      setOrders(ordRes.data);
    } catch (error) {
      toast.error('Error cargando datos de compras');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Gestión de Compras</h1>
      </div>

      <div className="flex border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <button
          className={`shrink-0 pb-2 px-4 font-medium text-sm flex items-center gap-2 ${activeTab === 'proveedores' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('proveedores')}
        >
          <Truck className="w-4 h-4" /> Proveedores
        </button>
        <button
          className={`shrink-0 pb-2 px-4 font-medium text-sm flex items-center gap-2 relative ${activeTab === 'solicitudes' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
          onClick={() => setActiveTab('solicitudes')}
        >
          <FileSignature className="w-4 h-4" /> Solicitudes
          {requests.filter(r => r.status === 'Aprobada').length > 0 && (
            <span className="ml-1 bg-primary-100 text-primary-600 text-[10px] px-1.5 py-0.5 rounded-full font-bold">
              {requests.filter(r => r.status === 'Aprobada').length}
            </span>
          )}
        </button>
        {(hasRole('admin') || hasRole('contador')) && (
          <button
            className={`shrink-0 pb-2 px-4 font-medium text-sm flex items-center gap-2 ${activeTab === 'ordenes' ? 'border-b-2 border-primary-600 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveTab('ordenes')}
          >
            <ShoppingCart className="w-4 h-4" /> Órdenes de Compra
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        {loading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {activeTab === 'proveedores' && (
              <div>
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Directorio de Proveedores</h2>
                {providers.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No hay proveedores registrados.</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {providers.map(prov => (
                      <div key={prov.id} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col gap-2 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-gray-900 dark:text-white">{prov.name}</h3>
                          <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full font-medium">Activo</span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          <p><span className="font-medium">Contacto:</span> {prov.contactName}</p>
                          <p><span className="font-medium">Email:</span> {prov.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'solicitudes' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Buzón de Solicitudes (Falta de Repuesto)</h2>
                </div>
                {requests.length === 0 ? (
                  <p className="text-gray-500 py-8 text-center italic">No hay solicitudes de compra registradas.</p>
                ) : (
                  <div className="space-y-3">
                    {requests.map(req => (
                      <div key={req.id} className={`p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between gap-4 transition-all ${req.status === 'Aprobada' ? 'bg-primary-50/30 dark:bg-primary-900/10 border-primary-100' : ''}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900 dark:text-white">{req.title}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                              req.status === 'Pendiente' ? 'bg-amber-100 text-amber-700' : 
                              req.status === 'Aprobada' ? 'bg-emerald-100 text-emerald-700' : 
                              'bg-red-100 text-red-700'
                            }`}>
                              {req.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{req.justification}</p>
                          <div className="flex flex-wrap gap-4 text-[11px] font-medium text-gray-500">
                            <span>OT Vínculo: #{req.work_order_id}</span>
                            <span>Solicitante: {req.requester?.first_name} {req.requester?.last_name}</span>
                            <span>Cantidad: {req.quantity} un.</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {req.status === 'Aprobada' && (hasRole('admin') || hasRole('contador')) && (
                            <button className="btn-primary py-1.5 px-4 text-xs shadow-none">Generar Orden de Compra</button>
                          )}
                          {req.status === 'Pendiente' && <span className="text-xs text-amber-600 font-medium italic">Esperando aprobación del Supervisor</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ordenes' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">Histórico de Órdenes de Compra</h2>
                {orders.length === 0 ? (
                  <div className="text-center p-8 text-gray-500 dark:text-gray-400 border-2 border-dashed rounded-xl">
                    <p>No hay órdenes de compra emitidas aún.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {orders.map(order => (
                      <div key={order.id} className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40">
                        <div className="flex justify-between items-start mb-2">
                          <span className="font-bold">OC #{order.id}</span>
                          <span className="text-xs font-semibold bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">{order.status}</span>
                        </div>
                        <p className="text-xs text-gray-500 mb-2">Proveedor: {order.provider?.name || 'No especificado'}</p>
                        <div className="text-sm font-medium">Módulo de seguimiento de recepción activo.</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Compras;
