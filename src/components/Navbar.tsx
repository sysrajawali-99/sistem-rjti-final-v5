import React, { useState } from 'react';
import { 
  Building2, 
  Shield, 
  RefreshCw, 
  Download, 
  Upload, 
  User as UserIcon,
  ChevronDown,
  AlertTriangle,
  FileCheck,
  Package,
  Trash2,
  LogOut,
  ShieldAlert,
  Sun,
  Moon,
  Settings
} from 'lucide-react';
import { User, UserRole, CompanyProfile, NavTab } from '../types';
import { ROLE_INFO } from '../lib/initialData';
import { RtiLogo } from './RtiLogo';

interface NavbarProps {
  company?: CompanyProfile;
  currentUser: User;
  users: User[];
  onSwitchUser: (user: User | string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  pendingApprovalsCount?: number;
  lowStockCount?: number;
  onOpenResetBlankModal?: () => void;
  onLogout?: () => void;
  onExportData?: () => void;
  onImportData?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenNotifications?: () => void;
  onOpenMR?: () => void;
  onOpenPO?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
  onNavigate?: (tab: NavTab) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  company,
  currentUser,
  users = [],
  onSwitchUser,
  pendingApprovalsCount = 0,
  lowStockCount = 0,
  onOpenResetBlankModal = () => {},
  onLogout = () => {},
  onExportData = () => {},
  onImportData = (_e: React.ChangeEvent<HTMLInputElement>) => {},
  onOpenNotifications = () => {},
  onOpenMR,
  onOpenPO,
  theme = 'dark',
  onToggleTheme,
  onNavigate
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const currentRoleInfo = ROLE_INFO[currentUser.role] || ROLE_INFO.ADMIN_HO;
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  return (
    <header className="no-print sticky top-0 z-30 bg-slate-900 text-white shadow-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Company Title */}
          <div 
            onClick={() => onNavigate && onNavigate('DASHBOARD')}
            className="flex items-center gap-3.5 shrink-0 cursor-pointer group"
          >
            <div className="w-11 h-11 rounded-xl bg-slate-950 border border-slate-700/80 shadow-md flex items-center justify-center p-1 shrink-0 group-hover:border-blue-500 transition-colors">
              <RtiLogo variant="symbol" size={38} />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white uppercase font-sans leading-tight group-hover:text-blue-200 transition-colors">
                {company?.name || "PT. RAJAWALI TALENTA INDONESIA"}
              </h1>
              <p className="text-[11px] text-amber-400 font-medium tracking-wider">
                {company?.tagline || "Integrated Procurement & ERP Cloud"}
              </p>
            </div>
          </div>

          {/* Right Header Navigation & Theme / Role Switcher */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Cloud Firestore Status Badge */}
            <div 
              title="Terhubung ke Database Cloud Firebase Firestore (Sinkronisasi Real-Time Aktif)"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 text-xs font-semibold"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
              <span>Cloud Realtime</span>
            </div>

            {/* Low Stock Alert Pill */}
            {lowStockCount > 0 && (
              <div 
                title={`${lowStockCount} barang mencapai batas minimum stok`}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-semibold"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                <span>{lowStockCount} Stok Rendah</span>
              </div>
            )}

            {/* Pending Approvals Pill */}
            {pendingApprovalsCount > 0 && (
              <div 
                title={`${pendingApprovalsCount} dokumen menunggu persetujuan`}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/40 text-xs font-semibold"
              >
                <FileCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>{pendingApprovalsCount} Approval</span>
              </div>
            )}

            {/* Theme Toggle Button (Light / Dark Mode) */}
            {onToggleTheme && (
              <button
                id="btn-theme-toggle"
                type="button"
                onClick={onToggleTheme}
                title={theme === 'dark' ? 'Beralih ke Mode Terang (Light Mode)' : 'Beralih ke Mode Gelap (Dark Mode)'}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all text-xs font-semibold cursor-pointer"
              >
                {theme === 'dark' ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180" />
                    <span className="hidden sm:inline text-[11px]">Terang</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-indigo-300 animate-in spin-in-180" />
                    <span className="hidden sm:inline text-[11px]">Gelap</span>
                  </>
                )}
              </button>
            )}

            {/* Role & User Switcher */}
            <div className="relative">
              <button
                id="btn-user-role-switcher"
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-all text-xs cursor-pointer"
              >
                <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs uppercase shadow-inner">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="text-left hidden md:block">
                  <div className="font-semibold text-slate-100 leading-tight flex items-center gap-1.5">
                    <span>{currentUser.name}</span>
                  </div>
                  <div className="text-[10px] text-amber-400 font-medium">
                    {currentRoleInfo.label}
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div 
                  className="absolute right-0 mt-2 w-72 bg-slate-800 rounded-xl shadow-2xl border border-slate-700 py-2 z-50 text-xs animate-fade-in"
                  onMouseLeave={() => setShowRoleMenu(false)}
                >
                  <div className="px-3 py-2 text-slate-300 border-b border-slate-700 bg-slate-850">
                    <div className="font-bold text-white text-xs">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono truncate">{currentUser.email}</div>
                    <div className="mt-1 inline-block text-[10px] font-bold px-2 py-0.5 rounded border border-amber-500/40 text-amber-300 bg-amber-500/10">
                      {currentRoleInfo.label}
                    </div>
                  </div>

                  {/* Super admin company settings shortcut */}
                  {isSuperAdmin && onNavigate && (
                    <div className="border-b border-slate-700/80 pb-1">
                      <button
                        onClick={() => {
                          setShowRoleMenu(false);
                          onNavigate('COMPANY_SETTINGS');
                        }}
                        className="w-full text-left px-3 py-2 text-purple-300 hover:bg-purple-950/40 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Building2 className="w-4 h-4 text-purple-400" />
                        <span className="font-semibold">Pengaturan Perusahaan (PT)</span>
                      </button>
                    </div>
                  )}

                  <div className="px-3 py-1.5 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-700/60 mt-1">
                    Ganti Peran Cepat (Switch User)
                  </div>
                  
                  <div className="max-h-52 overflow-y-auto py-1">
                    {users.map((u) => {
                      const uRoleInfo = ROLE_INFO[u.role] || ROLE_INFO.ADMIN_HO;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            onSwitchUser(u);
                            setShowRoleMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-slate-700 transition-colors cursor-pointer ${
                            u.id === currentUser.id ? 'bg-blue-900/40 text-blue-300 font-bold' : 'text-slate-200'
                          }`}
                        >
                          <div>
                            <div className="font-medium text-slate-100">{u.name}</div>
                            <div className="text-[10px] text-slate-400">{u.department}</div>
                          </div>
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border shrink-0 ml-2 ${uRoleInfo.badgeColor}`}>
                            {uRoleInfo.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Super admin reset shortcut inside profile */}
                  {isSuperAdmin && (
                    <div className="border-t border-slate-700/80 pt-1">
                      <button
                        onClick={() => {
                          setShowRoleMenu(false);
                          onOpenResetBlankModal();
                        }}
                        className="w-full text-left px-3 py-2 text-rose-300 hover:bg-rose-950/50 flex items-center gap-2 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-rose-400" />
                        <span className="font-medium">Reset Total Database Kosong</span>
                      </button>
                    </div>
                  )}

                  {/* Logout Button */}
                  <div className="border-t border-slate-700/80 pt-1">
                    <button
                      onClick={() => {
                        setShowRoleMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 text-amber-300 hover:bg-slate-700 flex items-center gap-2 transition-colors cursor-pointer font-semibold"
                    >
                      <LogOut className="w-4 h-4 text-amber-400" />
                      <span>Keluar (Logout Halaman Login)</span>
                    </button>
                  </div>

                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
