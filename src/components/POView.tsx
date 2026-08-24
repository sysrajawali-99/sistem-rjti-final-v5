import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Printer, 
  ShoppingCart, 
  Truck, 
  Receipt, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  DollarSign, 
  Building2, 
  Calendar,
  FileCheck,
  ChevronRight,
  Send
} from 'lucide-react';
import { PurchaseOrder, User } from '../types';
import { formatDate, formatRupiah } from '../lib/utils';

interface POViewProps {
  currentUser: User;
  pos: PurchaseOrder[];
  onOpenCreatePO: () => void;
  onPrintPO: (po: PurchaseOrder) => void;
  onApprovePO: (po: PurchaseOrder) => void;
  onCancelPO: (po: PurchaseOrder) => void;
  onGenerateDOFromPO: (po: PurchaseOrder) => void;
  onGenerateInvoiceFromPO: (po: PurchaseOrder) => void;
}

export const POView: React.FC<POViewProps> = ({
  currentUser,
  pos,
  onOpenCreatePO,
  onPrintPO,
  onApprovePO,
  onCancelPO,
  onGenerateDOFromPO,
  onGenerateInvoiceFromPO
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const term = searchTerm.trim().toLowerCase();

  const filteredPOs = pos.filter((po) => {
    const matchesSearch = !term || (
      (po.poNumber || '').toLowerCase().includes(term) ||
      (po.mrReference || '').toLowerCase().includes(term) ||
      (po.vendorName || '').toLowerCase().includes(term) ||
      (po.projectOrCostCenter || '').toLowerCase().includes(term) ||
      (po.preparedBy || '').toLowerCase().includes(term) ||
      (po.notes || '').toLowerCase().includes(term) ||
      (po.paymentTerms || '').toLowerCase().includes(term) ||
      (Array.isArray(po.items) && po.items.some(i => 
        (i.name || '').toLowerCase().includes(term) ||
        (i.itemCode || '').toLowerCase().includes(term) ||
        (i.notes || '').toLowerCase().includes(term)
      ))
    );

    const matchesStatus = statusFilter === 'ALL' || po.status === statusFilter;
    return Boolean(matchesSearch && matchesStatus);
  });

  const getStatusBadge = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-300">DRAFT</span>;
      case 'PENDING_APPROVAL':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">MENUNGGU PERSETUJUAN</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">DISETUJUI (APPROVED)</span>;
      case 'SENT_TO_VENDOR':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-900 border border-indigo-300">DIKIRIM KE VENDOR</span>;
      case 'PARTIALLY_DELIVERED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-100 text-cyan-900 border border-cyan-300">TERKIRIM SEBAGIAN</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">BARANG DITERIMA</span>;
      case 'INVOICED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-300">FAKTUR DITERBITKAN</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300">DIBATALKAN</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-amber-700 font-bold text-xs uppercase tracking-wider">
            <ShoppingCart className="w-4 h-4" />
            <span>Modul Pembelian Resmi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-serif">
            Purchase Order (PO)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Surat Pesanan Pembelian resmi ke vendor rekanan PT. Rajawali Talenta Indonesia.
          </p>
        </div>

        <button
          id="btn-create-po"
          onClick={onOpenCreatePO}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-amber-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Purchase Order Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        
        {/* Search Input */}
        <div className="w-full md:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="po-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari No. PO, Ref MR, Vendor, Proyek, Barang..."
            className="w-full text-xs pl-9 pr-8 py-2.5 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs px-1 py-0.5 rounded cursor-pointer"
              title="Hapus pencarian"
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'DELIVERED', 'INVOICED', 'DRAFT'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-amber-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' && `Semua PO (${pos.length})`}
              {st === 'PENDING_APPROVAL' && `Menunggu Approval (${pos.filter(p => p.status === 'PENDING_APPROVAL').length})`}
              {st === 'APPROVED' && `Disetujui (${pos.filter(p => p.status === 'APPROVED').length})`}
              {st === 'DELIVERED' && `Terkirim (${pos.filter(p => p.status === 'DELIVERED').length})`}
              {st === 'INVOICED' && `Ditagihkan (${pos.filter(p => p.status === 'INVOICED').length})`}
              {st === 'DRAFT' && `Draft`}
            </button>
          ))}
        </div>
      </div>

      {/* Search Result Feedback */}
      {term && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Menampilkan <strong>{filteredPOs.length}</strong> dari total <strong>{pos.length}</strong> Purchase Order untuk kata kunci "<strong>{searchTerm}</strong>"
          </span>
          {statusFilter !== 'ALL' && (
            <button
              onClick={() => setStatusFilter('ALL')}
              className="text-amber-700 hover:underline font-semibold cursor-pointer"
            >
              Tampilkan di Semua Status
            </button>
          )}
        </div>
      )}

      {/* PO Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <th className="p-4">No. PO & Ref MR</th>
                <th className="p-4">Tanggal Order & Kirim</th>
                <th className="p-4">Vendor / Pemasok</th>
                <th className="p-4">Proyek / Alokasi Biaya</th>
                <th className="p-4 text-right">Total Nilai (IDR)</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Aksi & Alur Lanjutan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPOs.map((po) => (
                <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  <td className="p-4">
                    <div className="font-mono font-bold text-amber-950 text-sm">{po.poNumber}</div>
                    {po.mrReference && (
                      <div className="text-[10px] text-blue-700 font-mono mt-0.5">
                        Ref: {po.mrReference}
                      </div>
                    )}
                  </td>

                  <td className="p-4 text-slate-600">
                    <div>{formatDate(po.orderDate)}</div>
                    <div className="text-[10px] text-slate-400">Tenggat: {formatDate(po.expectedDeliveryDate)}</div>
                  </td>

                  <td className="p-4">
                    <div className="font-bold text-slate-900">{po.vendorName}</div>
                    <div className="text-[11px] text-slate-500">{po.items.length} Item Material</div>
                  </td>

                  <td className="p-4">
                    <div className="font-medium text-slate-800">{po.projectOrCostCenter}</div>
                    <div className="text-[10px] text-slate-400">{po.paymentTerms}</div>
                  </td>

                  <td className="p-4 text-right">
                    <div className="font-mono font-extrabold text-slate-900 text-sm">
                      {formatRupiah(po.grandTotal)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Termasuk PPN 11%
                    </div>
                  </td>

                  <td className="p-4 text-center">
                    {getStatusBadge(po.status)}
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      
                      {/* Print button */}
                      <button
                        onClick={() => onPrintPO(po)}
                        className="p-1.5 text-slate-600 hover:text-amber-900 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                        title="Cetak Surat Pesanan PO Resmi"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Approval button */}
                      {po.status === 'PENDING_APPROVAL' && (currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'MANAGER_HO' || (currentUser.role as any) === 'DIRECTOR' || (currentUser.role as any) === 'ADMIN') && (
                        <button
                          onClick={() => onApprovePO(po)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                          title="Setujui Purchase Order"
                        >
                          Setujui
                        </button>
                      )}

                      {/* Create Delivery Order Button */}
                      {(po.status === 'APPROVED' || po.status === 'SENT_TO_VENDOR') && (
                        <button
                          onClick={() => onGenerateDOFromPO(po)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                          title="Terbitkan Bukti Surat Jalan / Penerimaan Barang"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Buat DO</span>
                        </button>
                      )}

                      {/* Create Invoice Button */}
                      {(po.status === 'DELIVERED' || po.status === 'APPROVED') && (
                        <button
                          onClick={() => onGenerateInvoiceFromPO(po)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                          title="Terbitkan Faktur Tagihan / Invoice"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          <span>Invoice</span>
                        </button>
                      )}

                    </div>
                  </td>

                </tr>
              ))}

              {filteredPOs.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <ShoppingCart className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600 text-sm">Tidak Ada Dokumen Purchase Order Ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Gunakan tombol 'Buat Purchase Order Baru' untuk membuat PO resmi.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
