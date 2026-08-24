import React, { useState } from 'react';
import { 
  Truck, 
  Plus, 
  Search, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  FileCheck, 
  RotateCcw,
  Calendar,
  Building
} from 'lucide-react';
import { DeliveryOrder, User } from '../types';
import { formatDate } from '../lib/utils';

interface DOViewProps {
  currentUser: User;
  dos: DeliveryOrder[];
  onOpenCreateDO: () => void;
  onPrintDO: (doDoc: DeliveryOrder) => void;
  onConfirmReceipt: (doDoc: DeliveryOrder) => void;
  onCreateReturFromDO: (doDoc: DeliveryOrder) => void;
}

export const DOView: React.FC<DOViewProps> = ({
  currentUser,
  dos,
  onOpenCreateDO,
  onPrintDO,
  onConfirmReceipt,
  onCreateReturFromDO
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const term = searchTerm.trim().toLowerCase();

  const filteredDOs = dos.filter((d) => {
    const matchesSearch = !term || (
      (d.doNumber || '').toLowerCase().includes(term) ||
      (d.poNumber || '').toLowerCase().includes(term) ||
      (d.driverName || '').toLowerCase().includes(term) ||
      (d.vehiclePlate || '').toLowerCase().includes(term) ||
      (d.warehouseDestination || '').toLowerCase().includes(term) ||
      (d.notes || '').toLowerCase().includes(term) ||
      (Array.isArray(d.items) && d.items.some(i => 
        (i.name || '').toLowerCase().includes(term) ||
        (i.itemCode || '').toLowerCase().includes(term)
      ))
    );

    const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
    return Boolean(matchesSearch && matchesStatus);
  });

  const getStatusBadge = (status: DeliveryOrder['status']) => {
    switch (status) {
      case 'IN_TRANSIT':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">DALAM PERJALANAN</span>;
      case 'RECEIVED_FULL':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">DITERIMA LENGKAP</span>;
      case 'RECEIVED_PARTIAL':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-cyan-100 text-cyan-900 border border-cyan-300">DITERIMA SEBAGIAN</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300">DITOLAK GUDANG</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">DRAFT</span>;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
            <Truck className="w-4 h-4" />
            <span>Modul Logistik & Pengiriman</span>
            {currentUser.role === 'ADMIN_HO' && (
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] rounded-full border border-emerald-300">
                Mode Admin HO: Pantau Status & Cetak
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-serif">
            Surat Jalan & Delivery Order (DO)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Pencatatan bukti penerimaan barang masuk ke gudang dan pengiriman logistik site.
          </p>
        </div>

        {currentUser.role !== 'ADMIN_HO' && (
          <button
            id="btn-create-do"
            onClick={onOpenCreateDO}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Catat Surat Jalan Baru</span>
          </button>
        )}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari No SJ, PO, Supir, Plat Nomor..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'RECEIVED_FULL', 'IN_TRANSIT', 'RECEIVED_PARTIAL', 'REJECTED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-emerald-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' && `Semua Surat Jalan (${dos.length})`}
              {st === 'RECEIVED_FULL' && `Diterima Lengkap (${dos.filter(d => d.status === 'RECEIVED_FULL').length})`}
              {st === 'IN_TRANSIT' && `Dalam Pengiriman (${dos.filter(d => d.status === 'IN_TRANSIT').length})`}
              {st === 'RECEIVED_PARTIAL' && `Sebagian`}
              {st === 'REJECTED' && `Ditolak`}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 uppercase text-[11px] tracking-wider">
                <th className="p-4">No. Surat Jalan</th>
                <th className="p-4">Referensi PO</th>
                <th className="p-4">Tanggal Kirim / Terima</th>
                <th className="p-4">Pengemudi & Plat Kendaraan</th>
                <th className="p-4">Gudang Tujuan</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDOs.map((doDoc) => (
                <tr key={doDoc.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  <td className="p-4 font-mono font-bold text-emerald-950 text-sm">
                    {doDoc.doNumber}
                  </td>

                  <td className="p-4 font-mono font-bold text-blue-900">
                    {doDoc.poNumber}
                  </td>

                  <td className="p-4 text-slate-600">
                    <div>{formatDate(doDoc.deliveryDate)}</div>
                    {doDoc.receivedDate && (
                      <div className="text-[10px] text-emerald-700 font-medium">{doDoc.receivedDate}</div>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="font-semibold text-slate-900">{doDoc.driverName}</div>
                    <div className="font-mono text-[11px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded inline-block mt-0.5">
                      {doDoc.vehiclePlate}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="font-medium text-slate-800">{doDoc.warehouseDestination}</div>
                    <div className="text-[10px] text-slate-500">Penerima: {doDoc.recipientName}</div>
                  </td>

                  <td className="p-4 text-center">
                    {getStatusBadge(doDoc.status)}
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      
                      <button
                        onClick={() => onPrintDO(doDoc)}
                        className="p-1.5 text-slate-600 hover:text-emerald-900 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        title="Cetak Surat Jalan Resmi"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {doDoc.status === 'IN_TRANSIT' && (currentUser.role === 'WAREHOUSE' || currentUser.role === 'ADMIN') && (
                        <button
                          onClick={() => onConfirmReceipt(doDoc)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                          title="Konfirmasi Penerimaan Barang"
                        >
                          Konfirmasi Terima
                        </button>
                      )}

                      <button
                        onClick={() => onCreateReturFromDO(doDoc)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Ajukan Retur Barang Cacat / Salah"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>

                    </div>
                  </td>

                </tr>
              ))}

              {filteredDOs.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    <Truck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600 text-sm">Tidak Ada Dokumen Surat Jalan Ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Gunakan tombol 'Catat Surat Jalan Baru' untuk menambahkan tanda terima logistik.</p>
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
