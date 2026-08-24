import React, { useState } from 'react';
import { 
  Receipt, 
  Plus, 
  Search, 
  Printer, 
  DollarSign, 
  CreditCard, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Calendar,
  Building2,
  ChevronRight
} from 'lucide-react';
import { Invoice, User } from '../types';
import { formatDate, formatRupiah } from '../lib/utils';

interface InvoiceViewProps {
  currentUser: User;
  invoices: Invoice[];
  onOpenCreateInvoice: () => void;
  onPrintInvoice: (inv: Invoice) => void;
  onOpenPaymentModal: (inv: Invoice) => void;
}

export const InvoiceView: React.FC<InvoiceViewProps> = ({
  currentUser,
  invoices,
  onOpenCreateInvoice,
  onPrintInvoice,
  onOpenPaymentModal
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const term = searchTerm.trim().toLowerCase();

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch = !term || (
      (inv.invoiceNumber || '').toLowerCase().includes(term) ||
      (inv.poNumber || '').toLowerCase().includes(term) ||
      (inv.vendorName || '').toLowerCase().includes(term) ||
      (inv.taxInvoiceNumber && inv.taxInvoiceNumber.toLowerCase().includes(term)) ||
      (inv.notes && inv.notes.toLowerCase().includes(term))
    );

    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return Boolean(matchesSearch && matchesStatus);
  });

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'PAID':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">LUNAS (PAID)</span>;
      case 'PARTIAL':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">SEBAGIAN (PARTIAL)</span>;
      case 'UNPAID':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300">BELUM DIBAYAR</span>;
      case 'OVERDUE':
        return <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-600 text-white animate-pulse">JATUH TEMPO (OVERDUE)</span>;
      default:
        return null;
    }
  };

  const totalOutstanding = invoices.reduce((sum, inv) => sum + inv.balanceDue, 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + inv.paidAmount, 0);

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
            <Receipt className="w-4 h-4" />
            <span>Modul Keuangan & Pembayaran</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-serif">
            Invoicing & Faktur Tagihan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manajemen tagihan vendor, faktur pajak, dan pencatatan pelunasan keuangan.
          </p>
        </div>

        <button
          id="btn-create-invoice"
          onClick={onOpenCreateInvoice}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Catat Faktur Tagihan Baru</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-500">Total Nilai Tagihan Masuk</span>
          <div className="text-lg font-mono font-extrabold text-slate-900 mt-1">
            {formatRupiah(totalOutstanding + totalPaid)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-emerald-700">Total Telah Dibayar (Paid)</span>
          <div className="text-lg font-mono font-extrabold text-emerald-700 mt-1">
            {formatRupiah(totalPaid)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-rose-700">Sisa Hutang Dagang (Due)</span>
          <div className="text-lg font-mono font-extrabold text-rose-700 mt-1">
            {formatRupiah(totalOutstanding)}
          </div>
        </div>
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="w-full md:w-80 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari No Invoice, No PO, Vendor..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {['ALL', 'UNPAID', 'PARTIAL', 'PAID', 'OVERDUE'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-rose-800 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st === 'ALL' && `Semua Faktur (${invoices.length})`}
              {st === 'UNPAID' && `Belum Lunas (${invoices.filter(i => i.status === 'UNPAID').length})`}
              {st === 'PARTIAL' && `Sebagian (${invoices.filter(i => i.status === 'PARTIAL').length})`}
              {st === 'PAID' && `Lunas (${invoices.filter(i => i.status === 'PAID').length})`}
              {st === 'OVERDUE' && `Jatuh Tempo`}
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
                <th className="p-4">No. Invoice & Pajak</th>
                <th className="p-4">Ref PO & Vendor</th>
                <th className="p-4">Tanggal & Jatuh Tempo</th>
                <th className="p-4 text-right">Total Tagihan</th>
                <th className="p-4 text-right">Sudah Dibayar</th>
                <th className="p-4 text-right">Sisa Hutang</th>
                <th className="p-4 text-center">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  
                  <td className="p-4">
                    <div className="font-mono font-bold text-rose-950 text-sm">{inv.invoiceNumber}</div>
                    {inv.taxInvoiceNumber && (
                      <div className="text-[10px] text-slate-500 font-mono">FP: {inv.taxInvoiceNumber}</div>
                    )}
                  </td>

                  <td className="p-4">
                    <div className="font-bold text-slate-900">{inv.vendorName}</div>
                    <div className="font-mono text-[10px] text-blue-700">{inv.poNumber}</div>
                  </td>

                  <td className="p-4 text-slate-600">
                    <div>{formatDate(inv.invoiceDate)}</div>
                    <div className="text-[10px] text-rose-700 font-semibold">Jatuh Tempo: {formatDate(inv.dueDate)}</div>
                  </td>

                  <td className="p-4 text-right font-mono font-bold text-slate-900">
                    {formatRupiah(inv.totalAmount)}
                  </td>

                  <td className="p-4 text-right font-mono font-bold text-emerald-700">
                    {formatRupiah(inv.paidAmount)}
                  </td>

                  <td className="p-4 text-right font-mono font-extrabold text-rose-700">
                    {formatRupiah(inv.balanceDue)}
                  </td>

                  <td className="p-4 text-center">
                    {getStatusBadge(inv.status)}
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      
                      <button
                        onClick={() => onPrintInvoice(inv)}
                        className="p-1.5 text-slate-600 hover:text-rose-900 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Cetak Faktur Invoice Resmi"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      {inv.balanceDue > 0 && (
                        <button
                          onClick={() => onOpenPaymentModal(inv)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all cursor-pointer"
                          title="Catat Pembayaran Masuk / Pelunasan"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Bayar</span>
                        </button>
                      )}

                    </div>
                  </td>

                </tr>
              ))}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600 text-sm">Tidak Ada Dokumen Invoice Ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Gunakan tombol 'Catat Faktur Tagihan Baru' untuk mencatat invoice rekanan.</p>
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
