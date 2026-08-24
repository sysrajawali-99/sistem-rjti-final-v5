import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  ShieldCheck, 
  Download, 
  Calendar,
  Layers
} from 'lucide-react';
import { AuditLog } from '../types';

interface AuditLogViewProps {
  logs: AuditLog[];
}

export const AuditLogView: React.FC<AuditLogViewProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [moduleFilter, setModuleFilter] = useState('ALL');

  const modules = ['ALL', 'MR', 'PO', 'DO', 'INVOICE', 'RETUR', 'INVENTORY', 'MASTER_DATA'];

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.docNumber && log.docNumber.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesModule = moduleFilter === 'ALL' || log.module === moduleFilter;
    return matchesSearch && matchesModule;
  });

  const exportCSV = () => {
    const headers = ["Waktu", "Pengguna", "Role", "Modul", "No. Dokumen", "Aksi", "Keterangan Detail"];
    const rows = filteredLogs.map(l => [
      `"${l.timestamp}"`,
      `"${l.user}"`,
      `"${l.role}"`,
      `"${l.module}"`,
      `"${l.docNumber || '-'}"`,
      `"${l.action}"`,
      `"${l.details.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Audit_Log_Rajawali_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-900 font-bold text-xs uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>Audit Trail & Kepatuhan Sistem</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-serif">
            Riwayat Aktivitas & Audit Log
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Jejak digital seluruh aksi pengguna: persetujuan PO, approval MR, mutasi stok, dan pelunasan invoice.
          </p>
        </div>

        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Ekspor Log ke CSV</span>
        </button>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari user, aksi, nomor dokumen, detail..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {modules.map((m) => (
            <button
              key={m}
              onClick={() => setModuleFilter(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                moduleFilter === m
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {m === 'ALL' ? `Semua Log (${logs.length})` : m}
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
                <th className="p-4 w-44">Waktu (WIB)</th>
                <th className="p-4 w-48">Pengguna & Peran</th>
                <th className="p-4 w-28">Modul</th>
                <th className="p-4 w-36">No. Dokumen</th>
                <th className="p-4 w-32">Tipe Aksi</th>
                <th className="p-4">Keterangan Rinci Transaksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4 font-mono text-[11px] text-slate-600">{log.timestamp}</td>
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{log.user}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{log.role}</div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-900 font-bold rounded text-[10px] border border-blue-200">
                      {log.module}
                    </span>
                  </td>
                  <td className="p-4 font-mono font-bold text-blue-900">{log.docNumber || '-'}</td>
                  <td className="p-4">
                    <span className="font-mono text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4 text-slate-700 leading-relaxed">{log.details}</td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    <History className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600 text-sm">Tidak Ada Log Yang Cocok</p>
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
