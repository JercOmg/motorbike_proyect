import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { motosService } from '../api/motos';
import { usersService } from '../api/users';

// --- Sub-componentes ---

const StatCard = ({ label, value, sub, accentClass, glowClass, loading }) => (
  <div className={`glass p-6 rounded-2xl border border-white/5 relative overflow-hidden group transition-all ${glowClass}`}>
    <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl transition-all ${accentClass}`}></div>
    <span className="text-xs text-brand-text-muted uppercase font-bold tracking-wider">{label}</span>
    {loading ? (
      <div className="mt-3 h-9 w-24 bg-white/5 rounded-lg animate-pulse"></div>
    ) : (
      <h3 className="text-3xl font-extrabold text-white mt-2 mb-1">{value}</h3>
    )}
    <p className="text-xs text-brand-text-muted">{sub}</p>
  </div>
);

const Badge = ({ estado }) => {
  const map = {
    'En Mantenimiento':   'bg-brand-accent-yellow/10 text-brand-accent-yellow border-brand-accent-yellow/20 bg-brand-accent-yellow',
    'Listo para Entrega': 'bg-brand-accent-green/10  text-brand-accent-green  border-brand-accent-green/20  bg-brand-accent-green',
    'Ingresado':          'bg-brand-primary/10        text-brand-primary        border-brand-primary/20        bg-brand-primary',
    'En Diagnóstico':     'bg-brand-secondary/10      text-brand-secondary      border-brand-secondary/20      bg-brand-secondary',
  };
  const dot = {
    'En Mantenimiento':   'bg-brand-accent-yellow',
    'Listo para Entrega': 'bg-brand-accent-green',
    'Ingresado':          'bg-brand-primary',
    'En Diagnóstico':     'bg-brand-secondary',
  };
  const base = map[estado] ?? 'bg-white/10 text-white/60 border-white/10';
  const d    = dot[estado]  ?? 'bg-white/40';
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${base}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${d}`}></span>
      {estado}
    </span>
  );
};

// --- Componente principal ---

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [motos, setMotos]           = useState([]);
  const [totalMotos, setTotalMotos] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalClientes, setTotalClientes] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  // Filtros y búsqueda
  const [searchPlaca, setSearchPlaca] = useState('');
  const [page, setPage]               = useState(1);
  const [totalPages, setTotalPages]   = useState(1);
  const LIMIT = 8;

  // Formulario nueva moto
  const [showForm, setShowForm]     = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError]   = useState('');
  const [newMoto, setNewMoto]       = useState({ placa: '', marca: '', modelo: '', color: '', cilindraje: '', anio: new Date().getFullYear(), id_cliente: '' });

  const canEdit = user?.rol === 'admin' || user?.rol === 'empleado';

  // ── Carga de datos ──────────────────────────────────────────────────────────
  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    setError('');

    const params = { page, limit: LIMIT };
    if (searchPlaca) params.placa = searchPlaca;

    // Peticiones en paralelo
    const [motosRes, usersRes, clientesRes] = await Promise.all([
      motosService.getAll(params),
      user?.rol === 'admin' ? usersService.getAll({ limit: 1 }) : Promise.resolve(null),
      user?.rol === 'admin' ? usersService.getAll({ rol: 'cliente', limit: 1 }) : Promise.resolve(null),
    ]);

    if (!motosRes.success) {
      setError(motosRes.error || 'Error al cargar motos.');
      setLoading(false);
      return;
    }

    // La API devuelve { items, totalItems, totalPages, currentPage }
    const motosData = motosRes.data;
    setMotos(Array.isArray(motosData) ? motosData : (motosData?.items ?? []));
    setTotalMotos(motosData?.totalItems ?? (Array.isArray(motosData) ? motosData.length : 0));
    setTotalPages(motosData?.totalPages ?? 1);

    if (usersRes?.success)    setTotalUsers(usersRes.data?.totalItems ?? 0);
    if (clientesRes?.success) setTotalClientes(clientesRes.data?.totalItems ?? 0);

    setLoading(false);
  }, [page, searchPlaca, user?.rol]);

  useEffect(() => { fetchDashboard(); }, [fetchDashboard]);

  // Búsqueda con debounce liviano
  const handleSearch = (e) => {
    setSearchPlaca(e.target.value);
    setPage(1);
  };

  // ── Crear moto ──────────────────────────────────────────────────────────────
  const handleCreateMoto = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    const body = {
      placa:      newMoto.placa.toUpperCase(),
      marca:      newMoto.marca,
      modelo:     newMoto.modelo,
      color:      newMoto.color,
      cilindraje: newMoto.cilindraje,
      anio:       parseInt(newMoto.anio),
      id_cliente: parseInt(newMoto.id_cliente),
    };

    const res = await motosService.create(body);
    if (res.success) {
      setNewMoto({ placa: '', marca: '', modelo: '', color: '', cilindraje: '', anio: new Date().getFullYear(), id_cliente: '' });
      setShowForm(false);
      fetchDashboard();
    } else {
      setFormError(res.error || 'No se pudo registrar la moto.');
    }
    setFormLoading(false);
  };

  // ── Eliminar moto ───────────────────────────────────────────────────────────
  const handleDelete = async (moto) => {
    if (!confirm(`¿Eliminar la moto ${moto.placa}? Esta acción no se puede deshacer.`)) return;
    const res = await motosService.remove(moto.id);
    if (res.success) {
      fetchDashboard();
    } else {
      alert(res.error || 'No se pudo eliminar la moto.');
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col font-sans relative overflow-hidden">

      {/* Luces de fondo */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-brand-primary/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-brand-secondary/10 blur-[120px] pointer-events-none"></div>

      {/* ── HEADER ── */}
      <header className="glass border-b border-white/5 py-4 px-6 md:px-10 flex items-center justify-between z-10 sticky top-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-secondary to-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/20 animate-pulse-subtle">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-base font-bold tracking-tight text-white leading-none">MOTO<span className="text-brand-primary">BOSS</span></p>
            <span className="text-[10px] uppercase tracking-widest text-brand-text-muted">Enterprise Console</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Chip de usuario */}
          <div className="hidden sm:flex items-center gap-2 bg-brand-surface border border-white/5 px-3 py-1.5 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-brand-accent-green animate-pulse"></div>
            <span className="text-xs text-white font-medium">{user?.nombre}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-primary/20 text-brand-primary font-bold uppercase">{user?.rol}</span>
          </div>
          <button
            onClick={logout}
            className="text-xs bg-white/5 hover:bg-brand-accent-red/20 border border-white/10 hover:border-brand-accent-red/30 px-3 py-1.5 rounded-lg text-brand-text-muted hover:text-white transition-all cursor-pointer"
          >
            Salir
          </button>
        </div>
      </header>

      {/* ── CONTENIDO ── */}
      <main className="flex-1 p-6 md:p-10 z-10 space-y-6 max-w-7xl mx-auto w-full">

        {/* Saludo */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-primary tracking-wider uppercase mb-1">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-ping"></span>
              Conectado a la API
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight m-0">Hola, {user?.nombre} 👋</h2>
            <p className="text-xs text-brand-text-muted mt-0.5">{new Date().toLocaleDateString('es-CO', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          {canEdit && (
            <button
              onClick={() => setShowForm(v => !v)}
              className="self-start sm:self-auto inline-flex items-center gap-2 bg-gradient-to-r from-brand-secondary to-brand-primary hover:brightness-110 text-white font-semibold px-4 py-2.5 rounded-xl shadow-lg shadow-brand-primary/20 transition-all text-xs cursor-pointer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              {showForm ? 'Cancelar' : 'Nueva Moto'}
            </button>
          )}
        </div>

        {/* Error global */}
        {error && (
          <div className="p-4 bg-brand-accent-red/10 border border-brand-accent-red/20 rounded-xl text-brand-accent-red text-xs flex items-center gap-2">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {error} — Verificá que el backend esté corriendo en el puerto 3000.
          </div>
        )}

        {/* ── TARJETAS DE MÉTRICAS ── */}
        <div className={`grid gap-5 ${user?.rol === 'admin' ? 'grid-cols-1 sm:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2'}`}>
          <StatCard
            label="Motos Registradas"
            value={totalMotos}
            sub="Total en la base de datos"
            accentClass="bg-brand-primary/5 group-hover:bg-brand-primary/10"
            glowClass="hover:border-brand-primary/20"
            loading={loading}
          />
          <StatCard
            label="Página actual"
            value={`${motos.length} motos`}
            sub={`Página ${page} de ${totalPages}`}
            accentClass="bg-brand-secondary/5 group-hover:bg-brand-secondary/10"
            glowClass="hover:border-brand-secondary/20"
            loading={loading}
          />
          {user?.rol === 'admin' && (
            <StatCard
              label="Clientes Registrados"
              value={totalClientes}
              sub={`${totalUsers} usuarios totales`}
              accentClass="bg-brand-accent-green/5 group-hover:bg-brand-accent-green/10"
              glowClass="hover:border-brand-accent-green/20"
              loading={loading}
            />
          )}
        </div>

        {/* ── FORMULARIO NUEVA MOTO (colapsable) ── */}
        {showForm && canEdit && (
          <div className="glass rounded-2xl border border-white/10 p-6">
            <h3 className="text-base font-bold text-white mb-4 tracking-tight">Registrar nueva motocicleta</h3>
            {formError && (
              <p className="mb-4 text-xs text-brand-accent-red bg-brand-accent-red/10 border border-brand-accent-red/20 rounded-xl px-4 py-3">{formError}</p>
            )}
            <form onSubmit={handleCreateMoto} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { key: 'placa',      label: 'Placa',         placeholder: 'ABC-123' },
                { key: 'marca',      label: 'Marca',         placeholder: 'Yamaha' },
                { key: 'modelo',     label: 'Modelo',        placeholder: 'MT-09' },
                { key: 'color',      label: 'Color',         placeholder: 'Negro Mate' },
                { key: 'cilindraje', label: 'Cilindraje',    placeholder: '847cc' },
                { key: 'anio',       label: 'Año',           placeholder: '2024', type: 'number' },
                { key: 'id_cliente', label: 'ID del Cliente', placeholder: '1', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-[10px] font-bold text-brand-text-muted mb-1.5 uppercase tracking-wider">{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    required
                    placeholder={f.placeholder}
                    value={newMoto[f.key]}
                    onChange={e => setNewMoto(prev => ({ ...prev, [f.key]: e.target.value }))}
                    className="w-full bg-brand-bg border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                  />
                </div>
              ))}
              <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-brand-secondary to-brand-primary hover:brightness-110 disabled:brightness-75 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-xl transition-all text-sm cursor-pointer"
                >
                  {formLoading ? (
                    <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Guardando...</>
                  ) : 'Guardar Moto'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── TABLA DE MOTOS ── */}
        <div className="glass rounded-2xl border border-white/5 overflow-hidden">
          {/* Cabecera de tabla con búsqueda */}
          <div className="p-5 border-b border-white/5 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
            <h3 className="text-base font-bold text-white tracking-tight">Motocicletas en el Sistema</h3>
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por placa..."
                value={searchPlaca}
                onChange={handleSearch}
                className="bg-brand-bg border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-primary transition-all w-48"
              />
              <svg className="w-3.5 h-3.5 text-brand-text-muted absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-surface/40 text-[10px] text-brand-text-muted uppercase tracking-wider border-b border-white/5">
                  <th className="px-5 py-3.5 font-semibold">Placa</th>
                  <th className="px-5 py-3.5 font-semibold">Vehículo</th>
                  <th className="px-5 py-3.5 font-semibold">Año</th>
                  <th className="px-5 py-3.5 font-semibold">Cilindraje</th>
                  <th className="px-5 py-3.5 font-semibold">Color</th>
                  {canEdit && <th className="px-5 py-3.5 font-semibold text-right">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {loading ? (
                  // Skeleton rows
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: canEdit ? 6 : 5 }).map((__, j) => (
                        <td key={j} className="px-5 py-4">
                          <div className="h-3 bg-white/5 rounded animate-pulse"></div>
                        </td>
                      ))}
                    </tr>
                  ))
                ) : motos.length === 0 ? (
                  <tr>
                    <td colSpan={canEdit ? 6 : 5} className="px-5 py-12 text-center text-brand-text-muted">
                      <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      No se encontraron motos{searchPlaca ? ` con placa "${searchPlaca}"` : ''}.
                    </td>
                  </tr>
                ) : (
                  motos.map((moto) => (
                    <tr key={moto.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-brand-primary">{moto.placa}</td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-white">{moto.marca}</div>
                        <div className="text-[10px] text-brand-text-muted">{moto.modelo}</div>
                      </td>
                      <td className="px-5 py-4 text-brand-text-muted">{moto.anio}</td>
                      <td className="px-5 py-4 text-brand-text-muted">{moto.cilindraje}</td>
                      <td className="px-5 py-4 text-brand-text-muted">{moto.color}</td>
                      {canEdit && (
                        <td className="px-5 py-4 text-right">
                          <button
                            onClick={() => handleDelete(moto)}
                            className="text-brand-accent-red bg-brand-accent-red/10 border border-brand-accent-red/20 px-2.5 py-1 rounded-lg hover:bg-brand-accent-red/20 transition-all text-[10px] cursor-pointer"
                          >
                            Eliminar
                          </button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {!loading && totalPages > 1 && (
            <div className="p-4 border-t border-white/5 flex items-center justify-between text-xs text-brand-text-muted">
              <span>Página <span className="text-white font-semibold">{page}</span> de <span className="text-white font-semibold">{totalPages}</span></span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 bg-brand-surface border border-white/10 rounded-lg hover:border-brand-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  ← Anterior
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 bg-brand-surface border border-white/10 rounded-lg hover:border-brand-primary/40 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </div>

      </main>

      {/* ── FOOTER ── */}
      <footer className="glass border-t border-white/5 py-3 px-6 text-center text-[10px] text-brand-text-muted z-10 flex flex-col sm:flex-row justify-between items-center gap-1">
        <p className="m-0">© {new Date().getFullYear()} MotoBoss — Sistema de Gestión de Taller · Colombia</p>
        <p className="m-0 font-mono">API: <span className="text-brand-primary">http://localhost:3000/api</span></p>
      </footer>

    </div>
  );
}
