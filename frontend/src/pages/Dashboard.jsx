import { useState, useEffect } from 'react';
import { dashboardAPI, transactionsAPI } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  DollarSign, TrendingUp, TrendingDown, Package,
  ClipboardList, AlertTriangle, Clock, CheckCircle2, BarChart3,
  ShoppingCart, FileSignature
} from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import toast from 'react-hot-toast';

ChartJS.register(
  CategoryScale, LinearScale, BarElement, PointElement,
  LineElement, Title, Tooltip, Legend, Filler
);

const Dashboard = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, transRes] = await Promise.all([
          dashboardAPI.getSummary(),
          user.role !== 'operario' ? transactionsAPI.getSummary({ period: 'monthly' }) : null,
        ].filter(Boolean));

        setSummary(dashRes.data);

        if (transRes) {
          const dailyData = transRes.data.dailyData || [];
          const dates = [...new Set(dailyData.map((d) => d.date))].sort();
          const ingresos = dates.map((date) => {
            const entry = dailyData.find((d) => d.date === date && d.type === 'ingreso');
            return entry ? parseFloat(entry.total) : 0;
          });
          const egresos = dates.map((date) => {
            const entry = dailyData.find((d) => d.date === date && d.type === 'egreso');
            return entry ? parseFloat(entry.total) : 0;
          });

          setChartData({
            labels: dates.map((d) => {
              const date = new Date(d + 'T12:00:00');
              return date.toLocaleDateString('es', { day: '2-digit', month: 'short' });
            }),
            datasets: [
              {
                label: 'Ingresos',
                data: ingresos,
                backgroundColor: 'rgba(16, 185, 129, 0.7)',
                borderColor: 'rgb(16, 185, 129)',
                borderWidth: 1,
                borderRadius: 6,
              },
              {
                label: 'Egresos',
                data: egresos,
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderColor: 'rgb(239, 68, 68)',
                borderWidth: 1,
                borderRadius: 6,
              },
            ],
          });
        }
      } catch (error) {
        toast.error('Error al cargar el dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(value || 0);
  };

  const metricCards = [
    {
      title: 'Ingresos del Mes',
      value: formatCurrency(summary?.financial?.monthlyIncome),
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconBg: 'bg-emerald-100 dark:bg-emerald-800/40',
      show: ['admin', 'supervisor', 'contador'],
    },
    {
      title: 'Egresos del Mes',
      value: formatCurrency(summary?.financial?.monthlyExpense),
      icon: TrendingDown,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/20',
      iconBg: 'bg-red-100 dark:bg-red-800/40',
      show: ['admin', 'supervisor', 'contador'],
    },
    {
      title: 'Balance',
      value: formatCurrency(summary?.financial?.balance),
      icon: DollarSign,
      color: summary?.financial?.balance >= 0 ? 'text-emerald-600' : 'text-red-600',
      bg: summary?.financial?.balance >= 0 ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20',
      iconBg: summary?.financial?.balance >= 0 ? 'bg-emerald-100 dark:bg-emerald-800/40' : 'bg-red-100 dark:bg-red-800/40',
      show: ['admin', 'supervisor', 'contador'],
    },
    {
      title: 'OT Pendientes',
      value: summary?.workOrders?.pending || 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      iconBg: 'bg-amber-100 dark:bg-amber-800/40',
      show: ['admin', 'supervisor', 'operario'],
    },
    {
      title: 'OT En Curso',
      value: summary?.workOrders?.inProgress || 0,
      icon: ClipboardList,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      iconBg: 'bg-blue-100 dark:bg-blue-800/40',
      show: ['admin', 'supervisor', 'operario'],
    },
    {
      title: 'OT Urgentes',
      value: summary?.workOrders?.urgent || 0,
      icon: AlertTriangle,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/20',
      iconBg: 'bg-red-100 dark:bg-red-800/40',
      show: ['admin', 'supervisor', 'operario'],
    },
    {
      title: 'Stock Crítico',
      value: summary?.inventory?.criticalStock || 0,
      icon: Package,
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/20',
      iconBg: 'bg-red-100 dark:bg-red-800/40',
      show: ['admin', 'supervisor'],
    },
    {
      title: 'OT Completadas',
      value: summary?.workOrders?.completed || 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      iconBg: 'bg-emerald-100 dark:bg-emerald-800/40',
      show: ['admin', 'supervisor'],
    },
    {
      title: 'Solicitudes Compra',
      value: summary?.purchasing?.pendingRequests || 0,
      icon: FileSignature,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      iconBg: 'bg-indigo-100 dark:bg-indigo-800/40',
      show: ['admin', 'supervisor', 'contador'],
    },
    {
      title: 'Órdenes Activas',
      value: summary?.purchasing?.activeOrders || 0,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      iconBg: 'bg-purple-100 dark:bg-purple-800/40',
      show: ['admin', 'supervisor', 'contador'],
    },
  ];

  const visibleCards = metricCards.filter((card) => card.show.includes(user.role));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
          ¡Bienvenido, {user.first_name}!
        </h1>
        <p className="text-surface-500 mt-1">
          Resumen general del sistema · {new Date().toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Alert Banners */}
      {summary?.alerts && (
        <div className="space-y-3">
          {summary.alerts.financial === 'red' && (user.role === 'admin' || user.role === 'supervisor' || user.role === 'contador') && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-slide-in">
              <span className="alert-dot-red" />
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">⚠️ Balance negativo este mes. Revise los egresos.</p>
            </div>
          )}
          {summary.alerts.workOrders === 'red' && (user.role !== 'contador') && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-slide-in">
              <span className="alert-dot-red" />
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">⚠️ Hay {summary.workOrders.urgent} OT urgentes y {summary.workOrders.overdue} vencidas sin atender.</p>
            </div>
          )}
          {summary.alerts.inventory === 'red' && (user.role !== 'contador') && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-slide-in">
              <span className="alert-dot-red" />
              <p className="text-sm text-red-700 dark:text-red-400 font-medium">⚠️ {summary.inventory.criticalStock} productos con stock crítico.</p>
            </div>
          )}
          {summary.alerts.workOrders === 'yellow' && (user.role !== 'contador') && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 animate-slide-in">
              <span className="alert-dot-yellow" />
              <p className="text-sm text-amber-700 dark:text-amber-400 font-medium">⏰ Hay OT pendientes desde hace más de 48 horas.</p>
            </div>
          )}
          {summary.alerts.purchasing === 'red' && (user.role !== 'operario') && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 animate-slide-in">
              <span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span></span>
              <p className="text-sm text-indigo-700 dark:text-indigo-400 font-medium">🛒 Hay {summary.purchasing.pendingRequests} solicitudes de compra pendientes de revisión.</p>
            </div>
          )}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {visibleCards.map((card, index) => (
          <div
            key={index}
            className={`metric-card ${card.bg} animate-slide-up`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-surface-500 dark:text-surface-400 uppercase tracking-wide">
                  {card.title}
                </p>
                <p className={`text-2xl font-bold mt-2 ${card.color}`}>
                  {card.value}
                </p>
              </div>
              <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                <card.icon size={22} className={card.color} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      {chartData && (
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 size={20} className="text-primary-600" />
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
              Ingresos vs Egresos del Mes
            </h2>
          </div>
          <div className="h-72">
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    position: 'top',
                    labels: {
                      usePointStyle: true,
                      pointStyle: 'circle',
                      padding: 20,
                      font: { family: 'Inter', size: 12 },
                    },
                  },
                  tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    cornerRadius: 12,
                    padding: 12,
                    titleFont: { family: 'Inter', size: 13 },
                    bodyFont: { family: 'Inter', size: 12 },
                    callbacks: {
                      label: (ctx) => ` ${ctx.dataset.label}: ${formatCurrency(ctx.raw)}`,
                    },
                  },
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: {
                      font: { family: 'Inter', size: 11 },
                      callback: (v) => formatCurrency(v),
                    },
                  },
                  x: {
                    grid: { display: false },
                    ticks: { font: { family: 'Inter', size: 11 } },
                  },
                },
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
