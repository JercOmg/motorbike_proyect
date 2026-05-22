import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null); // { message: '', type: 'success' | 'error' }

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Si el usuario ya está autenticado, no debe poder ver el Login
  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setToast({ message: 'Por favor, ingresá tu correo y contraseña.', type: 'error' });
      return;
    }

    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setToast({ message: result.error || 'Credenciales inválidas. Inténtalo de nuevo.', type: 'error' });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Luces de fondo premium */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-brand-primary/10 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-brand-secondary/10 blur-[120px] pointer-events-none"></div>

      {/* HEADER DE BIENVENIDA */}
      <header className="glass border-b border-white/5 py-4 px-6 md:px-12 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-secondary to-brand-primary flex items-center justify-center shadow-lg shadow-brand-primary/20 animate-pulse-subtle">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white m-0 leading-none">MOTO<span className="text-brand-primary">BOSS</span></h1>
            <span className="text-[10px] uppercase tracking-widest text-brand-text-muted">Enterprise Console</span>
          </div>
        </div>
      </header>

      {/* FORMULARIO DE ACCESO */}
      <main className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-md glass rounded-3xl p-8 shadow-2xl relative border border-white/10">
          
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-secondary to-brand-primary items-center justify-center shadow-lg shadow-brand-primary/20 mb-4 animate-float">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Bienvenido de nuevo</h2>
            <p className="text-sm text-brand-text-muted mt-1">Ingresá tus credenciales para acceder a MotoBoss</p>
          </div>



          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-brand-text-muted mb-2 tracking-wide uppercase">Correo Electrónico</label>
              <div className="relative">
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-brand-bg/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                  placeholder="ejemplo@motoboss.com"
                  disabled={loading}
                />
                <div className="absolute right-4 top-3.5 text-brand-text-muted">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                  </svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text-muted mb-2 tracking-wide uppercase">Contraseña</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-brand-bg/50 border border-white/10 rounded-xl pl-4 pr-10 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                  placeholder="••••••••"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-brand-text-muted hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-brand-text-muted pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-white/10 bg-brand-bg/50 text-brand-primary focus:ring-0 focus:ring-offset-0" />
                Recordarme
              </label>
              <a href="#recuperar" className="hover:text-brand-primary transition-colors">¿Olvidaste la contraseña?</a>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-secondary to-brand-primary hover:brightness-110 disabled:brightness-75 disabled:cursor-not-allowed text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-brand-primary/20 transition-all transform active:scale-[0.98] cursor-pointer mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>
        </div>
      </main>

      {/* FOOTER GENERAL */}
      <footer className="glass border-t border-white/5 py-4 px-6 text-center text-xs text-brand-text-muted z-10 flex flex-col sm:flex-row justify-between items-center gap-2">
        <p className="m-0">© {new Date().getFullYear()} MotoBoss. Todos los derechos reservados.</p>
        <div className="flex gap-4">
          <a href="#terminos" className="hover:text-white transition-colors">Términos</a>
          <a href="#privacidad" className="hover:text-white transition-colors">Privacidad</a>
          <a href="#soporte" className="hover:text-white transition-colors">Soporte</a>
        </div>
      </footer>

      {/* Sistema global de notificaciones Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] animate-bounce-subtle pointer-events-none">
          <div className={`glass px-5 py-4 rounded-2xl border flex items-center gap-3 shadow-2xl backdrop-blur-xl ${
            toast.type === 'success' 
              ? 'border-brand-accent-green/20 bg-brand-accent-green/10 text-brand-accent-green shadow-brand-accent-green/10' 
              : 'border-brand-accent-red/20 bg-brand-accent-red/10 text-brand-accent-red shadow-brand-accent-red/10'
          }`}>
            <div className={`p-2 rounded-xl ${
              toast.type === 'success' ? 'bg-brand-accent-green/20' : 'bg-brand-accent-red/20'
            }`}>
              {toast.type === 'success' ? (
                <svg className="w-5 h-5 text-brand-accent-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-brand-accent-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">{toast.type === 'success' ? 'Éxito' : 'Error'}</p>
              <p className="text-[11px] text-brand-text-muted mt-0.5">{toast.message}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
