import React, { useState } from 'react';
import { 
  RotateCcw, 
  Plus, 
  Search, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  Calendar 
} from 'lucide-react';
import { Retur, User } from '../types';
import { formatDate } from '../lib/utils';

interface ReturViewProps {
  currentUser: User;
  returs: Retur[];
  onOpenCreateRetur: () => void;
  onPrintRetur: (retur: Retur) => void;
  onResolveRetur: (retur: Retur) => void;
}

export const ReturView: React.FC<ReturViewProps> = ({
  currentUser,
  returs,
  onOpenCreateRetur,
  onPrintRetur,
  onResolveRetur
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const term = searchTerm.trim().toLowerCase();

  const filteredReturs = returs.filter((r) => {
    return !term || (
      (r.returNumber || '').toLowerCase().includes(term) ||
      (r.poNumber || '').toLowerCase().includes(term) ||
      (r.vendorName || '').toLowerCase().includes(term) ||
      (r.requestedBy || '').toLowerCase().includes(term) ||
      (r.reason || '').toLowerCase().includes(term) ||
      (r.doNumber && r.doNumber.toLowerCase().includes(term))
    );
  });

  const getStatusBadge = (status: Retur['status']) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">MENUNGGU VERIFIKASI</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300">DISETUJUI</span>;
      case 'ITEM_RETURNED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-300">BARANG DIKEMBALIKAN</span>;
      case 'REFUNDED_REPLACED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">SELESAI (DIGANTI / REFUND)</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300">DITOLAK</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
            <RotateCcw className="w-4 h-4" />
            <span>Klaim & Pengembalian Logistik</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-serif">
            Berita Acara Retur Barang
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Dokumentasi pengembalian barang rusak, cacat mutu, atau ketidaksesuaian spesifikasi PO.
          </p>
        </div>

        <button
          id="btn-create-retur"
          onClick={onOpenCreateRetur}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengajuan Retur Baru</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari No Retur, PO, Vendor..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <th className="p-4">No. Retur</th>
                <th className="p-4">Ref PO & SJ</th>
                <th className="p-4">Vendor Rekanan</th>
                <th className="p-4">Tanggal Retur</th>
                <th className="p-4">Kategori Alasan</th>
                <th className="p-4">Pemohon</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReturs.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono font-bold text-rose-950 text-sm">
                    {r.returNumber}
                  </td>
                  <td className="p-4">
                    <div className="font-mono text-blue-900 font-bold">{r.poNumber}</div>
                    {r.doNumber && <div className="text-[10px] text-slate-500">{r.doNumber}</div>}
                  </td>
                  <td className="p-4 font-bold text-slate-900">{r.vendorName}</td>
                  <td className="p-4 text-slate-600">{formatDate(r.returDate)}</td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                      {r.reasonCategory}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700">{r.requestedBy}</td>
                  <td className="p-4 text-center">{getStatusBadge(r.status)}</td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onPrintRetur(r)}
                        className="p-1.5 text-slate-600 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Cetak Berita Acara Retur Resmi"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                      {r.status !== 'REFUNDED_REPLACED' && (
                        <button
                          onClick={() => onResolveRetur(r)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          Selesaikan
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredReturs.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <RotateCcw className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600 text-sm">Tidak Ada Dokumen Retur</p>
                    <p className="text-xs text-slate-400 mt-1">Semua penerimaan barang berjalan lancar tanpa klaim.</p>
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
