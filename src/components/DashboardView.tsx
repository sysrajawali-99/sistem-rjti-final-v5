import React from 'react';
import { 
  DollarSign, 
  ShoppingCart, 
  FileText, 
  Truck, 
  Receipt, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight, 
  Plus, 
  Eye, 
  Printer,
  ChevronRight,
  Boxes,
  Users,
  Building,
  Building2
} from 'lucide-react';
import { 
  PurchaseOrder, 
  MaterialRequest, 
  DeliveryOrder, 
  Invoice, 
  InventoryItem, 
  AuditLog, 
  User,
  CompanyProfile,
  Retur,
  NavTab
} from '../types';
import { formatRupiah, formatDate } from '../lib/utils';
import { StorageService } from '../lib/storage';

interface DashboardViewProps {
  currentUser: User;
  pos: PurchaseOrder[];
  mrs: MaterialRequest[];
  dos: DeliveryOrder[];
  invoices: Invoice[];
  inventory: InventoryItem[];
  auditLogs?: AuditLog[];
  company?: CompanyProfile;
  returs?: Retur[];
  onNavigate: (tab: NavTab) => void;
  onOpenCreateMR?: () => void;
  onOpenCreatePO?: () => void;
  onOpenCreateDO?: () => void;
  onOpenCreateInvoice?: () => void;
  onOpenMRModal?: () => void;
  onOpenPOModal?: () => void;
  onOpenDOModal?: () => void;
  onOpenInvoiceModal?: () => void;
  onPrintDoc?: (type: 'PO' | 'MR' | 'DO' | 'INV', data: any) => void;
  onApprovePO?: (po: PurchaseOrder) => void;
  onApproveMR?: (mr: MaterialRequest) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  currentUser,
  pos = [],
  mrs = [],
  dos = [],
  invoices = [],
  inventory = [],
  auditLogs = [],
  company,
  returs = [],
  onNavigate,
  onOpenCreateMR,
  onOpenCreatePO,
  onOpenCreateDO,
  onOpenCreateInvoice,
  onOpenMRModal,
  onOpenPOModal,
  onOpenDOModal,
  onOpenInvoiceModal,
  onPrintDoc = (_type: any, _data: any) => {},
  onApprovePO = (_po: PurchaseOrder) => {},
  onApproveMR = (_mr: MaterialRequest) => {}
}) => {
  const handleOpenMR = onOpenCreateMR || onOpenMRModal || (() => onNavigate('MR'));
  const handleOpenPO = onOpenCreatePO || onOpenPOModal || (() => onNavigate('PO'));
  const handleOpenDO = onOpenCreateDO || onOpenDOModal || (() => onNavigate('DO'));
  const handleOpenInvoice = onOpenCreateInvoice || onOpenInvoiceModal || (() => onNavigate('INVOICE'));

  // Financial & Operational calculations
  const totalPOValue = pos.reduce((acc, p) => acc + (p.status !== 'CANCELLED' ? p.grandTotal : 0), 0);
  const totalUnpaidInvoices = invoices.reduce((acc, inv) => acc + inv.balanceDue, 0);
  const totalInventoryAsset = inventory.reduce((acc, item) => acc + (item.currentStock * item.unitPrice), 0);
  
  const pendingMRs = mrs.filter(m => m.status === 'PENDING_APPROVAL');
  const pendingPOs = pos.filter(p => p.status === 'PENDING_APPROVAL');
  const lowStockItems = inventory.filter(i => i.currentStock <= i.minStock);

  // Live Accounts Payable, Receivable & Bank Balances
  const bankAccounts = StorageService.getBankAccounts();
  const payables = StorageService.getPayables();
  const receivables = StorageService.getReceivables();

  const totalBankBalance = bankAccounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  const totalHutangOutstanding = payables
    .filter(p => p.status !== 'PAID')
    .reduce((sum, p) => sum + p.balanceDue, 0);
  const totalPiutangOutstanding = receivables
    .filter(r => r.status !== 'PAID')
    .reduce((sum, r) => sum + r.balanceDue, 0);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white p-6 sm:p-8 shadow-xl border border-blue-800/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold mb-3">
              <span>PT. Rajawali Talenta Indonesia • Enterprise Management</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-serif">
              Selamat Datang, {currentUser?.name || 'Administrator'}
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
              Portal Terpadu Pengadaan (Procurement), Material Request, Purchase Order, Surat Jalan (DO), Invoicing, dan Monitoring Inventaris Gudang.
            </p>
          </div>

          {/* Quick Action Shortcuts */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              id="btn-quick-create-mr"
              onClick={handleOpenMR}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Ajukan MR</span>
            </button>
            <button
              id="btn-quick-create-po"
              onClick={handleOpenPO}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Buat PO</span>
            </button>
            <button
              id="btn-quick-create-do"
              onClick={handleOpenDO}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Truck className="w-4 h-4" />
              <span>Terima DO</span>
            </button>
          </div>
        </div>

        {/* Decorative background watermark */}
        <div className="absolute right-0 -bottom-10 opacity-10 pointer-events-none select-none">
          <Building className="w-96 h-96 text-white" />
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total PO Value */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Nilai PO</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-slate-900 font-mono">
              {formatRupiah(totalPOValue)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="font-bold text-blue-700">{pos.length} Pesanan</span>
              <span>tercatat di sistem</span>
            </div>
          </div>
        </div>

        {/* Card 2: Tagihan Belum Lunas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tagihan Outstanding</span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-rose-700 font-mono">
              {formatRupiah(totalUnpaidInvoices)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="font-bold text-rose-600">
                {invoices.filter(i => i.status !== 'PAID').length} Faktur
              </span>
              <span>menunggu pelunasan</span>
            </div>
          </div>
        </div>

        {/* Card 3: Nilai Aset Gudang */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Aset Stok</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-slate-900 font-mono">
              {formatRupiah(totalInventoryAsset)}
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="font-bold text-emerald-700">{inventory.length} SKU Material</span>
              <span>aktif di gudang</span>
            </div>
          </div>
        </div>

        {/* Card 4: Antrean Approval & Warning */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Perhatian & Approval</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-xl font-extrabold text-amber-600">
              {pendingMRs.length + pendingPOs.length} Dokumen
            </div>
            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
              <span>{lowStockItems.length} Stok Kritis</span>
              <span className="text-blue-700 font-bold hover:underline cursor-pointer" onClick={() => onNavigate('PO')}>
                Lihat Detail &rarr;
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* FINANCIAL STATUS & RECONCILIATION BAR */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Posisi Keuangan Terkini (Kas, Hutang PO & Piutang DO)</h3>
              <p className="text-xs text-slate-500">Rekonsiliasi saldo per nomor rekening dan rekapitulasi kewajiban supplier serta hak tagih pelanggan</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('KAS_BANK')}
              className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
            >
              Update Saldo &rarr;
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Kas & Bank */}
          <div 
            onClick={() => onNavigate('KAS_BANK')}
            className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 hover:border-blue-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Total Kas & Bank</span>
              <Building2 className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl font-bold text-blue-900 font-mono mt-1">
              {formatRupiah(totalBankBalance)}
            </div>
            <p className="text-xs text-blue-700 mt-1 flex items-center justify-between">
              <span>{bankAccounts.length} Rekening/Pos Aktif</span>
              <span className="font-bold group-hover:underline">Buka Mutasi &rarr;</span>
            </p>
          </div>

          {/* Hutang Usaha PO */}
          <div 
            onClick={() => onNavigate('HUTANG')}
            className="p-4 rounded-xl bg-red-50/60 border border-red-100 hover:border-red-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-800 uppercase tracking-wider">Hutang Usaha (PO Supplier)</span>
              <TrendingDown className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl font-bold text-red-900 font-mono mt-1">
              {formatRupiah(totalHutangOutstanding)}
            </div>
            <p className="text-xs text-red-700 mt-1 flex items-center justify-between">
              <span>{payables.filter(p => p.status !== 'PAID').length} PO Belum Lunas</span>
              <span className="font-bold group-hover:underline">Bayar Hutang &rarr;</span>
            </p>
          </div>

          {/* Piutang Usaha DO */}
          <div 
            onClick={() => onNavigate('PIUTANG')}
            className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100 hover:border-emerald-300 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Piutang Usaha (DO Pelanggan)</span>
              <TrendingUp className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
            </div>
            <div className="text-xl font-bold text-emerald-900 font-mono mt-1">
              {formatRupiah(totalPiutangOutstanding)}
            </div>
            <p className="text-xs text-emerald-700 mt-1 flex items-center justify-between">
              <span>{receivables.filter(r => r.status !== 'PAID').length} DO Belum Terbayar</span>
              <span className="font-bold group-hover:underline">Catat Pelunasan &rarr;</span>
            </p>
          </div>
        </div>
      </div>

      {/* APPROVAL QUEUE & LOW STOCK ALERT (SPLIT GRID) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PENDING APPROVALS BOX */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-100 text-blue-800 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Antrean Persetujuan Dokumen (Pending Approvals)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Dokumen pengadaan yang menunggu otorisasi Direksi / Manager
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                {pendingMRs.length + pendingPOs.length} Menunggu
              </span>
            </div>

            <div className="space-y-3">
              {/* Pending POs */}
              {pendingPOs.map((po) => (
                <div key={po.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-900">{po.poNumber}</span>
                      <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">PO PENDING</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 mt-1 truncate">
                      {po.vendorName}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {po.items.length} Item • Total: <strong className="text-slate-800">{formatRupiah(po.grandTotal)}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onPrintDoc('PO', po)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Pratinjau Dokumen PO"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    {(currentUser.role === 'DIRECTOR' || currentUser.role === 'ADMIN') && (
                      <button
                        onClick={() => onApprovePO(po)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                      >
                        Setujui PO
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Pending MRs */}
              {pendingMRs.map((mr) => (
                <div key={mr.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-blue-900">{mr.mrNumber}</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">MR PENDING</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-900 mt-1 truncate">
                      {mr.project} ({mr.requesterName})
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {mr.items.length} Material Diminta • Prioritas: <strong className="text-slate-800">{mr.priority}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onPrintDoc('MR', mr)}
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                      title="Pratinjau Dokumen MR"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                    {(currentUser.role === 'DIRECTOR' || currentUser.role === 'PROCUREMENT' || currentUser.role === 'ADMIN') && (
                      <button
                        onClick={() => onApproveMR(mr)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                      >
                        Setujui MR
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {pendingMRs.length === 0 && pendingPOs.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                  <p className="text-xs font-bold text-slate-700">Semua Pengajuan Telah Disetujui</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Tidak ada dokumen PO atau MR yang tertahan.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Otorisasi Resmi Rajawali ERP</span>
            <button 
              onClick={() => onNavigate('PO')} 
              className="text-blue-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Buka Modul PO <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* LOW STOCK ALERTS & WAREHOUSE STATUS */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Peringatan Batas Minimum Stok (Low Stock)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Barang yang berada di bawah batas persediaan aman
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold px-2 py-1 bg-amber-50 text-amber-700 rounded-full border border-amber-200">
                {lowStockItems.length} Item
              </span>
            </div>

            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div key={item.id} className="p-3.5 rounded-xl bg-amber-50/50 border border-amber-200 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-800">{item.itemCode}</span>
                      <span className="text-[10px] bg-red-100 text-red-800 font-bold px-1.5 py-0.5 rounded">KRITIS</span>
                    </div>
                    <p className="text-xs font-bold text-slate-900 mt-1 truncate">
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Lokasi: {item.warehouseLocation}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs font-extrabold text-red-600">
                      Sisa: {item.currentStock} {item.unit}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Min: {item.minStock} {item.unit}
                    </div>
                  </div>
                </div>
              ))}

              {lowStockItems.length === 0 && (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Boxes className="w-8 h-8 mx-auto text-emerald-500 mb-2 opacity-80" />
                  <p className="text-xs font-bold text-slate-700">Persediaan Gudang Aman</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Semua item material berada di atas batas minimum stok.</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Gudang Utama & Site Plant</span>
            <button 
              onClick={() => onNavigate('INVENTORY')} 
              className="text-blue-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
            >
              Buka Inventaris & Mutasi <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* RECENT OPERATIONAL LOGS & QUICK STATS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">
              Jejak Aktivitas & Mutasi Terakhir (Audit Trail)
            </h3>
            <p className="text-xs text-slate-500">
              Catatan riwayat transaksi pengadaan, penerimaan, dan pengeluaran barang
            </p>
          </div>
          <button
            onClick={() => onNavigate('AUDIT_LOG')}
            className="text-xs font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
          >
            Lihat Semua Log <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                <th className="p-3 w-40">Waktu</th>
                <th className="p-3 w-44">Pengguna</th>
                <th className="p-3 w-28">Modul</th>
                <th className="p-3 w-36">No. Dokumen</th>
                <th className="p-3">Keterangan Aktivitas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {auditLogs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3 text-slate-500 font-mono text-[11px]">{log.timestamp}</td>
                  <td className="p-3 font-semibold text-slate-900">{log.user} ({log.role})</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-800 font-bold rounded text-[10px] border border-blue-200">
                      {log.module}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-blue-900">{log.docNumber || '-'}</td>
                  <td className="p-3 text-slate-700">{log.details}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
