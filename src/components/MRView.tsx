import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  CheckCircle2, 
  XCircle, 
  ShoppingCart, 
  Clock, 
  Eye, 
  FileText, 
  AlertCircle,
  Building,
  Calendar,
  ChevronRight
} from 'lucide-react';
import { MaterialRequest, User } from '../types';
import { formatDate, formatRupiah } from '../lib/utils';

interface MRViewProps {
  currentUser: User;
  mrs: MaterialRequest[];
  onOpenCreateMR: () => void;
  onPrintMR: (mr: MaterialRequest) => void;
  onApproveMR: (mr: MaterialRequest) => void;
  onRejectMR: (mr: MaterialRequest) => void;
  onGeneratePOFromMR?: (mr: MaterialRequest) => void;
  onCreatePOFromMR?: (mr: MaterialRequest) => void;
}

export const MRView: React.FC<MRViewProps> = ({
  currentUser,
  mrs = [],
  onOpenCreateMR,
  onPrintMR,
  onApproveMR,
  onRejectMR,
  onGeneratePOFromMR,
  onCreatePOFromMR
}) => {
  const handleGeneratePO = onGeneratePOFromMR || onCreatePOFromMR || (() => {});
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedMR, setSelectedMR] = useState<MaterialRequest | null>(null);

  const term = searchTerm.trim().toLowerCase();

  const filteredMRs = mrs.filter((mr) => {
    const matchesSearch = !term || (
      (mr.mrNumber || '').toLowerCase().includes(term) ||
      (mr.project || '').toLowerCase().includes(term) ||
      (mr.requesterName || '').toLowerCase().includes(term) ||
      (mr.department || '').toLowerCase().includes(term) ||
      (mr.purpose || '').toLowerCase().includes(term) ||
      (Array.isArray(mr.items) && mr.items.some(i => 
        (i.name || '').toLowerCase().includes(term) ||
        (i.itemCode || '').toLowerCase().includes(term) ||
        (i.notes || '').toLowerCase().includes(term)
      ))
    );

    const matchesStatus = statusFilter === 'ALL' || mr.status === statusFilter;
    return Boolean(matchesSearch && matchesStatus);
  });

  const getStatusBadge = (status: MaterialRequest['status']) => {
    switch (status) {
      case 'DRAFT':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-300">DRAFT</span>;
      case 'PENDING_APPROVAL':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">MENUNGGU APPROVAL</span>;
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">DISETUJUI (APPROVED)</span>;
      case 'PO_CREATED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">PO DITERBITKAN</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">DITOLAK</span>;
      case 'COMPLETED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">SELESAI (COMPLETED)</span>;
      default:
        return null;
    }
  };

  const getPriorityBadge = (priority: MaterialRequest['priority']) => {
    switch (priority) {
      case 'URGENT':
        return <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-600 text-white">URGENT</span>;
      case 'HIGH':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white">HIGH</span>;
      case 'MEDIUM':
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-400 text-white">LOW</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Modul Pengadaan Material</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-serif">
            Material Request (MR)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pengajuan kebutuhan material proyek lapangan sebelum diterbitkan Purchase Order (PO).
          </p>
        </div>

        <button
          id="btn-create-mr"
          onClick={onOpenCreateMR}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengajuan MR Baru</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        
        {/* Search */}
        <div className="w-full md:w-96 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            id="mr-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari No. MR, Proyek, Pemohon, Item..."
            className="w-full text-xs pl-9 pr-8 py-2.5 bg-slate-50 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
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

        {/* Status Tab Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'PENDING_APPROVAL', 'APPROVED', 'PO_CREATED', 'DRAFT', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-blue-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' && `Semua (${mrs.length})`}
              {st === 'PENDING_APPROVAL' && `Menunggu Approval (${mrs.filter(m => m.status === 'PENDING_APPROVAL').length})`}
              {st === 'APPROVED' && `Disetujui (${mrs.filter(m => m.status === 'APPROVED').length})`}
              {st === 'PO_CREATED' && `PO Dibuat (${mrs.filter(m => m.status === 'PO_CREATED').length})`}
              {st === 'DRAFT' && `Draft`}
              {st === 'REJECTED' && `Ditolak`}
            </button>
          ))}
        </div>
      </div>

      {/* Search Result Feedback */}
      {term && (
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            Menampilkan <strong>{filteredMRs.length}</strong> dari total <strong>{mrs.length}</strong> Material Request untuk kata kunci "<strong>{searchTerm}</strong>"
          </span>
          {statusFilter !== 'ALL' && (
            <button
              onClick={() => setStatusFilter('ALL')}
              className="text-blue-700 hover:underline font-semibold cursor-pointer"
            >
              Tampilkan di Semua Status
            </button>
          )}
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <th className="p-4">No. Dokumen MR</th>
                <th className="p-4">Tanggal Pengajuan</th>
                <th className="p-4">Pemohon & Dept</th>
                <th className="p-4">Proyek / Site</th>
                <th className="p-4 text-center">Prioritas</th>
                <th className="p-4 text-center">Total Item</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Aksi Dokumen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMRs.map((mr) => (
                <tr key={mr.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  <td className="p-4 font-mono font-bold text-blue-900 text-sm">
                    {mr.mrNumber}
                  </td>

                  <td className="p-4 text-slate-600">
                    <div>{formatDate(mr.requestDate)}</div>
                    <div className="text-[10px] text-slate-400">Target: {formatDate(mr.requiredDate)}</div>
                  </td>

                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{mr.requesterName}</div>
                    <div className="text-[11px] text-slate-500">{mr.department}</div>
                  </td>

                  <td className="p-4">
                    <div className="font-medium text-slate-800">{mr.project}</div>
                    <div className="text-[11px] text-slate-400 truncate max-w-xs">{mr.purpose}</div>
                  </td>

                  <td className="p-4 text-center">
                    {getPriorityBadge(mr.priority)}
                  </td>

                  <td className="p-4 text-center">
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full">
                      {mr.items.length} Item
                    </span>
                  </td>

                  <td className="p-4 text-center">
                    {getStatusBadge(mr.status)}
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      
                      {/* Print button */}
                      <button
                        onClick={() => onPrintMR(mr)}
                        className="p-1.5 text-slate-600 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Cetak Formulir MR Resmi"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {/* Approval buttons for Manager/Director/Admin */}
                      {mr.status === 'PENDING_APPROVAL' && (
                        currentUser.role === 'SUPER_ADMIN' || 
                        currentUser.role === 'MANAGER_HO' || 
                        currentUser.role === 'KBB_PURCHASING' || 
                        (currentUser.role as any) === 'DIRECTOR' || 
                        (currentUser.role as any) === 'ADMIN'
                      ) && (
                        <>
                          <button
                            onClick={() => onApproveMR(mr)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                            title="Setujui Permintaan Material"
                          >
                            Setujui
                          </button>
                          <button
                            onClick={() => onRejectMR(mr)}
                            className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                            title="Tolak Permintaan Material"
                          >
                            Tolak
                          </button>
                        </>
                      )}

                      {/* Convert to PO button */}
                      {mr.status === 'APPROVED' && (
                        <button
                          onClick={() => handleGeneratePO(mr)}
                          className="flex items-center gap-1 px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                          title="Terbitkan Purchase Order dari MR ini"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Buat PO</span>
                        </button>
                      )}

                    </div>
                  </td>

                </tr>
              ))}

              {filteredMRs.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <FileText className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600 text-sm">Tidak Ada Dokumen Material Request Ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Coba sesuaikan kata kunci pencarian atau filter status.</p>
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
