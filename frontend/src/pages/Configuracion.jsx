import { useState, useEffect } from 'react';
import { settingsAPI, categoriesAPI } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import Modal from '../components/Modal';
import { Save, Palette, Building2, Tags, MapPin, Plus, Trash2, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';

const Configuracion = () => {
  const { updateSettings, companySettings } = useTheme();
  const [settings, setSettings] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('general');
  const [showCatModal, setShowCatModal] = useState(false);
  const [editCat, setEditCat] = useState(null);
  const [catForm, setCatForm] = useState({ name: '', type: 'ingreso', description: '' });
  const [newSector, setNewSector] = useState('');

  const fetchData = async () => {
    try {
      const [settingsRes, catRes] = await Promise.all([settingsAPI.get(), categoriesAPI.getAll()]);
      setSettings(settingsRes.data.settings);
      setCategories(catRes.data.categories);
    } catch { toast.error('Error al cargar configuración'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSaveSettings = async () => {
    try {
      const { data } = await settingsAPI.update(settings);
      setSettings(data.settings);
      updateSettings(data.settings);
      toast.success('Configuración guardada');
    } catch { toast.error('Error al guardar'); }
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('logo', file);
    try {
      const { data } = await settingsAPI.uploadLogo(formData);
      setSettings((prev) => ({ ...prev, logo_path: data.logoUrl }));
      toast.success('Logo actualizado');
    } catch { toast.error('Error al subir logo'); }
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCat) { await categoriesAPI.update(editCat.id, catForm); toast.success('Categoría actualizada'); }
      else { await categoriesAPI.create(catForm); toast.success('Categoría creada'); }
      setShowCatModal(false); setEditCat(null);
      setCatForm({ name: '', type: 'ingreso', description: '' });
      fetchData();
    } catch (error) { toast.error(error.response?.data?.error || 'Error'); }
  };

  const handleDeleteCat = async (id) => {
    if (!confirm('¿Desactivar esta categoría?')) return;
    try { await categoriesAPI.delete(id); toast.success('Categoría desactivada'); fetchData(); } catch { toast.error('Error'); }
  };

  const addSector = () => {
    if (!newSector.trim()) return;
    const sectors = [...(settings.sectors || []), newSector.trim()];
    setSettings({ ...settings, sectors });
    setNewSector('');
  };

  const removeSector = (index) => {
    const sectors = (settings.sectors || []).filter((_, i) => i !== index);
    setSettings({ ...settings, sectors });
  };

  const tabs = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'colores', label: 'Colores', icon: Palette },
    { id: 'categorias', label: 'Categorías', icon: Tags },
    { id: 'sectores', label: 'Sectores', icon: MapPin },
  ];

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-surface-900 dark:text-white">Configuración</h1><p className="text-surface-500 text-sm mt-1">Personalización del sistema</p></div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-100 dark:bg-surface-800 rounded-xl p-1">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white dark:bg-surface-700 text-primary-600 shadow-sm' : 'text-surface-500 hover:text-surface-700'}`}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* General */}
      {activeTab === 'general' && settings && (
        <div className="card p-6 space-y-6">
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Nombre de la empresa</label><input value={settings.company_name} onChange={(e) => setSettings({ ...settings, company_name: e.target.value })} className="input max-w-md" /></div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Logo de la empresa</label>
            <div className="flex items-center gap-4">
              {settings.logo_path && <img src={settings.logo_path} alt="Logo" className="w-16 h-16 rounded-xl object-contain bg-surface-100 dark:bg-surface-700 p-2" />}
              <label className="btn-secondary cursor-pointer"><input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />Subir logo</label>
            </div>
          </div>
          <button onClick={handleSaveSettings} className="btn-primary"><Save size={18} /> Guardar cambios</button>
        </div>
      )}

      {/* Colors */}
      {activeTab === 'colores' && settings && (
        <div className="card p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { key: 'primary_color', label: 'Color primario' },
              { key: 'secondary_color', label: 'Color secundario' },
              { key: 'accent_color', label: 'Color de acento' },
            ].map(({ key, label }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">{label}</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={settings[key]} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-surface-200 dark:border-surface-600" />
                  <input value={settings[key]} onChange={(e) => setSettings({ ...settings, [key]: e.target.value })} className="input w-28" />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <div className="flex gap-2">
              <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: settings.primary_color }} />
              <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: settings.secondary_color }} />
              <div className="w-12 h-12 rounded-xl" style={{ backgroundColor: settings.accent_color }} />
            </div>
            <span className="text-sm text-surface-500">Vista previa</span>
          </div>
          <button onClick={handleSaveSettings} className="btn-primary"><Save size={18} /> Guardar colores</button>
        </div>
      )}

      {/* Categories */}
      {activeTab === 'categorias' && (
        <div className="card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-surface-900 dark:text-white">Categorías de ingresos/egresos</h3>
            <button onClick={() => { setEditCat(null); setCatForm({ name: '', type: 'ingreso', description: '' }); setShowCatModal(true); }} className="btn-primary text-sm"><Plus size={16} /> Nueva</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {['ingreso', 'egreso'].map((type) => (
              <div key={type}>
                <h4 className={`text-sm font-semibold mb-2 ${type === 'ingreso' ? 'text-emerald-600' : 'text-red-600'}`}>{type === 'ingreso' ? '↑ Ingresos' : '↓ Egresos'}</h4>
                <div className="space-y-1">
                  {categories.filter(c => c.type === type).map(cat => (
                    <div key={cat.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-50 dark:hover:bg-surface-700/50 group">
                      <span className={`text-sm ${!cat.active ? 'line-through text-surface-400' : ''}`}>{cat.name}</span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditCat(cat); setCatForm({ name: cat.name, type: cat.type, description: cat.description || '' }); setShowCatModal(true); }} className="p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-600"><Edit3 size={14} /></button>
                        <button onClick={() => handleDeleteCat(cat.id)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sectors */}
      {activeTab === 'sectores' && settings && (
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-surface-900 dark:text-white">Sectores y áreas de la empresa</h3>
          <div className="flex gap-2">
            <input value={newSector} onChange={(e) => setNewSector(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addSector()} className="input flex-1" placeholder="Nuevo sector..." />
            <button onClick={addSector} className="btn-primary"><Plus size={18} /></button>
          </div>
          <div className="space-y-2">
            {(settings.sectors || []).map((sector, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-700/50">
                <div className="flex items-center gap-3"><MapPin size={16} className="text-primary-500" /><span className="font-medium">{sector}</span></div>
                <button onClick={() => removeSector(idx)} className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 text-surface-400 hover:text-red-600"><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
          <button onClick={handleSaveSettings} className="btn-primary"><Save size={18} /> Guardar sectores</button>
        </div>
      )}

      {/* Category Modal */}
      <Modal isOpen={showCatModal} onClose={() => { setShowCatModal(false); setEditCat(null); }} title={editCat ? 'Editar Categoría' : 'Nueva Categoría'}>
        <form onSubmit={handleCatSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Nombre</label><input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="input" required /></div>
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Tipo</label><select value={catForm.type} onChange={(e) => setCatForm({ ...catForm, type: e.target.value })} className="select"><option value="ingreso">Ingreso</option><option value="egreso">Egreso</option></select></div>
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Descripción</label><textarea value={catForm.description} onChange={(e) => setCatForm({ ...catForm, description: e.target.value })} className="input" rows={2} /></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={() => setShowCatModal(false)} className="btn-secondary">Cancelar</button><button type="submit" className="btn-primary">{editCat ? 'Actualizar' : 'Crear'}</button></div>
        </form>
      </Modal>
    </div>
  );
};

export default Configuracion;
