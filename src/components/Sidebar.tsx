import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  ShoppingCart, 
  Truck, 
  Receipt, 
  CreditCard,
  RotateCcw, 
  Boxes, 
  Database, 
  History, 
  Settings,
  ChevronRight,
  Sparkles,
  Building2,
  ShieldAlert,
  Users,
  ShieldCheck,
  Sun,
  Moon
} from 'lucide-react';
import { User, NavTab } from '../types';
import { getUserEffectiveMenus, ROLE_INFO } from '../lib/initialData';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  counts?: {
    mrPending?: number;
    poPending?: number;
    doActive?: number;
    invoiceUnpaid?: number;
    lowStock?: number;
  };
  currentUser: User;
  pendingMRCount?: number;
  pendingPOCount?: number;
  inTransitDOCount?: number;
  unpaidInvoiceCount?: number;
  pendingReturCount?: number;
  lowStockCount?: number;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  counts,
  currentUser,
  pendingMRCount = 0,
  pendingPOCount = 0,
  inTransitDOCount = 0,
  unpaidInvoiceCount = 0,
  pendingReturCount = 0,
  lowStockCount = 0,
  theme = 'dark',
  onToggleTheme
}) => {
  const safeCounts = {
    mrPending: counts?.mrPending ?? pendingMRCount,
    poPending: counts?.poPending ?? pendingPOCount,
    doActive: counts?.doActive ?? inTransitDOCount,
    invoiceUnpaid: counts?.invoiceUnpaid ?? unpaidInvoiceCount,
    lowStock: counts?.lowStock ?? lowStockCount,
    returPending: pendingReturCount
  };

  const effectiveMenus = getUserEffectiveMenus(currentUser);

  const allMenuItems: {
    id: NavTab;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeColor?: string;
  }[] = [
    {
      id: 'DASHBOARD',
      label: 'Dashboard Eksekutif',
      description: 'Ringkasan KPI, Pengeluaran & Status',
      icon: LayoutDashboard
    },
    {
      id: 'MR',
      label: 'Material Request (MR)',
      description: 'Pengajuan kebutuhan bahan proyek',
      icon: FileText,
      badge: safeCounts.mrPending,
      badgeColor: 'bg-blue-600 text-white'
    },
    {
      id: 'PO',
      label: 'Purchase Order (PO)',
      description: 'Pemesanan pembelian ke vendor',
      icon: ShoppingCart,
      badge: safeCounts.poPending,
      badgeColor: 'bg-amber-600 text-white'
    },
    {
      id: 'DO',
      label: 'Surat Jalan (DO)',
      description: 'Penerimaan & pengiriman logistik',
      icon: Truck,
      badge: safeCounts.doActive,
      badgeColor: 'bg-emerald-600 text-white'
    },
    {
      id: 'INVOICE',
      label: 'Invoicing & Tagihan',
      description: 'Faktur pembayaran & pelunasan',
      icon: Receipt,
      badge: safeCounts.invoiceUnpaid,
      badgeColor: 'bg-rose-600 text-white'
    },
    {
      id: 'HUTANG',
      label: 'Hutang Usaha (AP)',
      description: 'Kewajiban bayar PO ke supplier',
      icon: CreditCard,
      badgeColor: 'bg-red-600 text-white'
    },
    {
      id: 'PIUTANG',
      label: 'Piutang Usaha (AR)',
      description: 'Hak tagih pengiriman DO pelanggan',
      icon: Receipt,
      badgeColor: 'bg-emerald-600 text-white'
    },
    {
      id: 'KAS_BANK',
      label: 'Kas & Bank (Update Saldo)',
      description: 'Rekap saldo rekening & mutasi kas',
      icon: Building2,
      badgeColor: 'bg-blue-600 text-white'
    },
    {
      id: 'RETUR',
      label: 'Retur & Pengembalian',
      description: 'Klaim barang rusak & salah spek',
      icon: RotateCcw,
      badge: safeCounts.returPending,
      badgeColor: 'bg-orange-600 text-white'
    },
    {
      id: 'INVENTORY',
      label: 'Gudang & Stok Barang',
      description: 'Monitoring saldo & mutasi logistik',
      icon: Boxes,
      badge: safeCounts.lowStock,
      badgeColor: 'bg-amber-500 text-white'
    },
    {
      id: 'USERS',
      label: 'Manajemen Pengguna',
      description: 'Kelola Akun & Hak Akses Menu',
      icon: Users
    },
    {
      id: 'COMPANY_SETTINGS',
      label: 'Pengaturan Perusahaan',
      description: 'Legalitas PT, NPWP, Bank & Pejabat',
      icon: Building2
    },
    {
      id: 'AUDIT_LOG',
      label: 'Audit Log & Riwayat',
      description: 'Catatan jejak aktivitas user',
      icon: History
    }
  ];

  // Filter to only allowed menus for the current user
  const visibleMenuItems = allMenuItems.filter(item => effectiveMenus.includes(item.id));
  const roleInfo = ROLE_INFO[currentUser.role] || ROLE_INFO.ADMIN_HO;

  return (
    <aside className="no-print w-full md:w-64 bg-slate-900 text-slate-300 flex flex-col justify-between border-r border-slate-800 shrink-0 select-none">
      
      {/* Navigation menu */}
      <div className="p-3 space-y-1">
        <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
          <span>Modul Operasional</span>
          <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 font-mono">
            {visibleMenuItems.length} Menu
          </span>
        </div>

        <nav className="space-y-1">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`sidebar-nav-${item.id.toLowerCase()}`}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-md shadow-blue-900/40'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-blue-400'}`} />
                  <div className="text-left truncate">
                    <div className="truncate">{item.label}</div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 ml-2">
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${item.badgeColor || 'bg-blue-600 text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 text-blue-200" />}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User info card & Theme switcher in footer */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
        
        {/* Quick Theme Switcher Button */}
        {onToggleTheme && (
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer"
          >
            <div className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Moon className="w-3.5 h-3.5 text-amber-400" />
              ) : (
                <Sun className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span>Mode: {theme === 'dark' ? 'Gelap (Dark)' : 'Terang (Light)'}</span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-700 text-amber-300 font-bold">
              Ubah
            </span>
          </button>
        )}

        <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600/30 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold text-xs uppercase shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0) : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-slate-100 truncate flex items-center gap-1">
              <span className="truncate">{currentUser?.name || 'Administrator'}</span>
            </div>
            <div className="text-[10px] text-slate-400 truncate flex items-center gap-1 mt-0.5">
              <span className={`px-1.5 py-0.2 rounded text-[9px] font-semibold border ${roleInfo.badgeColor}`}>
                {roleInfo.label}
              </span>
            </div>
          </div>
        </div>

        <div className="text-[10px] text-center text-slate-500">
          PT. Rajawali Talenta Indonesia &copy; 2026
        </div>
      </div>

    </aside>
  );
};
