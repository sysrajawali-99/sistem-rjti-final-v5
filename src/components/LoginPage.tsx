import React, { useState, useRef } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  KeyRound, 
  ShieldAlert, 
  Sparkles,
  UserCheck,
  ArrowRight,
  Sun,
  Moon
} from 'lucide-react';
import { User, CompanyProfile } from '../types';
import { RtiLogo } from './RtiLogo';

interface LoginPageProps {
  company: CompanyProfile;
  users: User[];
  onLogin: (user: User) => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  company,
  users,
  onLogin,
  theme = 'dark',
  onToggleTheme
}) => {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const identifier = emailOrUsername.trim().toLowerCase();
    if (!identifier) {
      setErrorMessage('Silakan masukkan Email Perusahaan atau Nama Pengguna.');
      return;
    }

    if (!password) {
      setErrorMessage('Silakan masukkan kata sandi Anda.');
      passwordInputRef.current?.focus();
      return;
    }

    // Find user by email, username, or name
    const foundUser = users.find(u => 
      u.email.toLowerCase() === identifier ||
      (u.username && u.username.toLowerCase() === identifier) ||
      u.name.toLowerCase() === identifier
    );

    if (foundUser) {
      const expectedPassword = foundUser.password || (foundUser.role === 'SUPER_ADMIN' ? 'superadmin123' : 'admin123');
      if (password !== expectedPassword) {
        setErrorMessage('Kata sandi yang Anda masukkan salah. Mohon periksa kembali.');
        return;
      }
      onLogin(foundUser);
    } else {
      setErrorMessage(`Akun "${emailOrUsername}" tidak terdaftar dalam database pengguna.`);
    }
  };

  // Quick fill handler: ONLY fills the email/username and leaves password blank
  const handleQuickFillEmail = (emailVal: string) => {
    setEmailOrUsername(emailVal);
    setPassword('');
    setErrorMessage(null);
    // Focus into password input for manual entry
    setTimeout(() => {
      passwordInputRef.current?.focus();
    }, 100);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100 selection:bg-amber-500 selection:text-slate-950 font-sans">
      
      {/* Background Graphic Accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -left-40 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/3 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-30"></div>
      </div>

      {/* Top Corporate Brand Banner */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-slate-800/60">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white/10 border border-slate-700/60 shadow-lg backdrop-blur-xs flex items-center justify-center p-1.5 shrink-0">
            <RtiLogo variant="symbol" size={40} />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-black tracking-tight text-white uppercase font-sans">
              {company.name || 'PT. RAJAWALI TALENTA INDONESIA'}
            </h1>
            <p className="text-[11px] text-amber-400 font-medium tracking-wider">
              Integrated Enterprise Resource Planning & Procurement System
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-850 border border-slate-800 text-[11px] text-slate-300 hover:text-white transition-all cursor-pointer"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Mode Terang</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Mode Gelap</span>
                </>
              )}
            </button>
          )}

          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>SSL 256-Bit Encrypted Portal</span>
          </div>
        </div>
      </header>

      {/* Main Authentication Card */}
      <main className="relative z-10 w-full max-w-5xl mx-auto px-4 py-8 sm:py-12 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Welcome & System Info */}
          <div className="lg:col-span-5 space-y-6 text-left">
            
            {/* Logo Emblem Stack */}
            <div className="hidden lg:block p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-md backdrop-blur-xs w-fit">
              <RtiLogo variant="horizontal" size={64} theme="dark" />
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal Resmi Karyawan & HO</span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white font-sans leading-tight">
                Sistem Manajemen <br className="hidden sm:inline" />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300 bg-clip-text text-transparent">
                  Pengadaan & Logistik Proyek
                </span>
              </h2>
              <p className="text-sm text-slate-400 mt-3 leading-relaxed">
                Platform terpusat untuk alur Material Request (MR), Purchase Order (PO), Surat Jalan (DO), Invoicing, Retur, dan Pengawasan Stok Material Proyek.
              </p>
            </div>

            {/* Feature Points */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <div className="p-1 rounded-md bg-blue-900/50 text-blue-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Persetujuan berjenjang otomatis (*Multi-Tier Approval Matrix*)</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <div className="p-1 rounded-md bg-amber-900/50 text-amber-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Dukungan cetak dokumen resmi format legal A4 dengan QR Barcode</span>
              </div>
              <div className="flex items-start gap-3 text-xs text-slate-300">
                <div className="p-1 rounded-md bg-emerald-900/50 text-emerald-400 shrink-0 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>Sinkronisasi database Cloud Firestore secara langsung & aman</span>
              </div>
            </div>

            {/* Company Legal Notice */}
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="text-slate-300 font-bold flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <span>PT. Rajawali Talenta Indonesia</span>
              </div>
              <div>NPWP: <span className="font-mono text-slate-300">{company.npwp || '01.234.567.8-901.000'}</span></div>
              <div className="text-slate-500 text-[10px]">Akses terbatas hanya untuk staf, manajemen, dan divisi berwenang.</div>
            </div>
          </div>

          {/* Right Column: Secure Login Form */}
          <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
            
            {/* Header Form */}
            <div className="text-left mb-6 border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base sm:text-lg">
                      Masuk ke Akun Anda
                    </h3>
                    <p className="text-xs text-slate-400">
                      Silakan masukkan kredensial resmi akun Anda untuk mengakses sistem
                    </p>
                  </div>
                </div>
                <div className="lg:hidden w-11 h-11 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-1 shrink-0">
                  <RtiLogo variant="symbol" size={36} />
                </div>
              </div>
            </div>

            {/* ERROR ALERT */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/70 border border-rose-800/80 text-rose-200 text-xs flex items-center gap-2.5 animate-shake">
                <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* FORM LOGIN */}
            <form onSubmit={handleSubmit} className="space-y-4 text-left">
              
              {/* Input Email / Username */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Perusahaan atau Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    placeholder="Contoh: sys.rajawali@gmail.com atau username"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-4 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                  />
                </div>
              </div>

              {/* Input Password (Strictly Manual Entry) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    Kata Sandi (Password)
                  </label>
                  <span className="text-[11px] text-slate-400">
                    Masukkan secara manual
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ketik kata sandi akun..."
                    className="w-full bg-slate-950 border border-slate-700 focus:border-blue-500 rounded-xl pl-10 pr-10 py-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    title={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500"
                  />
                  <span>Ingat Sesi di Perangkat Ini</span>
                </label>
                <span className="text-slate-500 text-[11px]">Bantuan IT Support HO</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-amber-600 hover:from-blue-500 hover:to-amber-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-900/40 transition-all flex items-center justify-center gap-2 cursor-pointer mt-3 active:scale-[0.99]"
              >
                <KeyRound className="w-4 h-4" />
                <span>Masuk ke Sistem ERP</span>
              </button>

              {/* Pre-fill quick helper for Email / Username ONLY */}
              <div className="pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-400" />
                    Pilih Cepat Email / Username:
                  </span>
                  <span className="text-[10px] text-amber-400/90 font-medium">
                    (Kata sandi tetap diketik manual)
                  </span>
                </div>
                
                <div className="flex flex-wrap gap-1.5">
                  {users.map(u => (
                    <button
                      type="button"
                      key={u.id}
                      onClick={() => handleQuickFillEmail(u.email || u.username || '')}
                      className={`px-2.5 py-1.5 rounded-lg border text-left text-[11px] transition-all cursor-pointer flex items-center gap-1.5 ${
                        emailOrUsername.toLowerCase() === (u.email || '').toLowerCase() || emailOrUsername.toLowerCase() === (u.username || '').toLowerCase()
                          ? 'bg-blue-600/20 border-blue-500 text-blue-200 font-semibold'
                          : 'bg-slate-950/80 hover:bg-slate-800 border-slate-800 text-slate-300'
                      }`}
                      title={`Isi username ${u.name} (${u.role})`}
                    >
                      <span className="font-mono text-[10px]">{u.username || u.email.split('@')[0]}</span>
                      <span className="text-[9px] text-slate-500">({u.role.replace('_', ' ')})</span>
                    </button>
                  ))}
                </div>
              </div>

            </form>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-800/60 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <RtiLogo variant="symbol" size={16} />
            <span>PT. Rajawali Talenta Indonesia &copy; {new Date().getFullYear()} - Hak Cipta Dilindungi.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-400">
            <span>Keamanan Terenkripsi</span>
            <span>&bull;</span>
            <span>Standar ISO 9001 & 45001</span>
            <span>&bull;</span>
            <span>Bantuan Portal: sys.rajawali@gmail.com</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
