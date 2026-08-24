import React, { useState } from 'react';
import { 
  ReceivableRecord, 
  BankAccount, 
  User, 
  CustomerClient 
} from '../types';
import { StorageService } from '../lib/storage';
import { formatRupiah, formatDate } from '../lib/utils';
import { 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Building2, 
  User as UserIcon, 
  Phone, 
  FileText, 
  DollarSign, 
  Calendar, 
  Download, 
  RefreshCw,
  Wallet,
  X,
  History,
  TrendingUp
} from 'lucide-react';

interface PiutangViewProps {
  currentUser: User;
  onRefresh?: () => void;
}

export const PiutangView: React.FC<PiutangViewProps> = ({ currentUser, onRefresh }) => {
  const [receivables, setReceivables] = useState<ReceivableRecord[]>(StorageService.getReceivables());
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(StorageService.getBankAccounts());
  const [customers, setCustomers] = useState<CustomerClient[]>(StorageService.getCustomers());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Receive Payment Modal State
  const [selectedReceivableForPayment, setSelectedReceivableForPayment] = useState<ReceivableRecord | null>(null);
  const [receivedAmount, setReceivedAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'CASH' | 'GIRO' | 'CHEQUE'>('BANK_TRANSFER');
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>('');
  const [paymentRefNumber, setPaymentRefNumber] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  // History & Detail Modal
  const [selectedReceivableDetail, setSelectedReceivableDetail] = useState<ReceivableRecord | null>(null);

  // Manual Receivable Modal
  const [showAddManualModal, setShowAddManualModal] = useState(false);
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [manualCustomerPhone, setManualCustomerPhone] = useState('');
  const [manualCustomerAddress, setManualCustomerAddress] = useState('');
  const [manualDoNumber, setManualDoNumber] = useState('');
  const [manualSubtotal, setManualSubtotal] = useState(0);
  const [manualShippingCost, setManualShippingCost] = useState(0);
  const [manualDueDate, setManualDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [manualNotes, setManualNotes] = useState('');

  const refreshData = () => {
    setReceivables(StorageService.getReceivables());
    setBankAccounts(StorageService.getBankAccounts());
    setCustomers(StorageService.getCustomers());
    if (onRefresh) onRefresh();
  };

  // KPIs
  const totalPiutang = receivables.reduce((sum, r) => sum + (r.totalAmount || 0), 0);
  const totalReceived = receivables.reduce((sum, r) => sum + (r.receivedAmount || 0), 0);
  const totalBalanceDue = receivables.reduce((sum, r) => sum + (r.balanceDue || 0), 0);
  const overdueCount = receivables.filter(r => {
    if (r.status === 'PAID') return false;
    if (!r.dueDate) return false;
    return new Date(r.dueDate) < new Date();
  }).length;

  // Filtered List
  const filteredReceivables = receivables.filter(item => {
    const matchesSearch = 
      item.receivableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.doNumber && item.doNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
      item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.customerPhone && item.customerPhone.toLowerCase().includes(searchTerm.toLowerCase()));

    const isOverdue = item.status !== 'PAID' && item.dueDate && new Date(item.dueDate) < new Date();

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'OVERDUE') return matchesSearch && isOverdue;
    return matchesSearch && item.status === statusFilter;
  });

  const openReceivePaymentModal = (rec: ReceivableRecord) => {
    setSelectedReceivableForPayment(rec);
    setReceivedAmount(rec.balanceDue);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('BANK_TRANSFER');
    const firstActiveBank = bankAccounts.find(b => b.isActive) || bankAccounts[0];
    setSelectedBankAccountId(firstActiveBank ? firstActiveBank.id : '');
    setPaymentRefNumber(`RCV-${Date.now().toString().slice(-6)}`);
    setPaymentNotes(`Penerimaan pelunasan piutang DO ${rec.doNumber} dari ${rec.customerName}`);
  };

  const handleProcessReceivePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReceivableForPayment) return;
    if (receivedAmount <= 0) {
      alert("Jumlah penerimaan harus lebih besar dari 0");
      return;
    }
    if (receivedAmount > selectedReceivableForPayment.balanceDue) {
      alert(`Jumlah penerimaan (Rp ${receivedAmount.toLocaleString('id-ID')}) melebihi sisa piutang (Rp ${selectedReceivableForPayment.balanceDue.toLocaleString('id-ID')})`);
      return;
    }
    if (!selectedBankAccountId) {
      alert("Silakan pilih rekening Kas / Bank penampung dana");
      return;
    }

    StorageService.recordReceivablePayment(selectedReceivableForPayment.id, {
      amount: receivedAmount,
      paymentDate,
      paymentMethod,
      bankAccountId: selectedBankAccountId,
      referenceNumber: paymentRefNumber,
      notes: paymentNotes
    });

    setSelectedReceivableForPayment(null);
    refreshData();
  };

  const handleCreateManualReceivable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCustomerName) {
      alert("Nama pelanggan wajib diisi");
      return;
    }
    const grandTotal = manualSubtotal + manualShippingCost;
    if (grandTotal <= 0) {
      alert("Total piutang harus lebih dari Rp 0");
      return;
    }

    StorageService.addReceivable({
      doNumber: manualDoNumber || 'MANUAL-INVOICE',
      customerName: manualCustomerName,
      customerPhone: manualCustomerPhone || '-',
      customerAddress: manualCustomerAddress || '-',
      transactionDate: new Date().toISOString().split('T')[0],
      dueDate: manualDueDate,
      subtotal: manualSubtotal,
      shippingCost: manualShippingCost,
      taxAmount: 0,
      totalAmount: grandTotal,
      notes: manualNotes
    });

    setShowAddManualModal(false);
    setManualCustomerName('');
    setManualCustomerPhone('');
    setManualCustomerAddress('');
    setManualDoNumber('');
    setManualSubtotal(0);
    setManualShippingCost(0);
    setManualNotes('');
    refreshData();
  };

  const exportToCSV = () => {
    const headers = ['No Piutang', 'No DO', 'Pelanggan', 'No Telp', 'Alamat', 'Tgl Transaksi', 'Jatuh Tempo', 'Subtotal', 'Ongkir', 'Total Piutang', 'Diterima', 'Sisa Piutang', 'Status'];
    const rows = filteredReceivables.map(r => [
      r.receivableNumber,
      r.doNumber,
      r.customerName,
      r.customerPhone || '-',
      r.customerAddress || '-',
      r.transactionDate,
      r.dueDate,
      r.subtotal,
      r.shippingCost || 0,
      r.totalAmount,
      r.receivedAmount,
      r.balanceDue,
      r.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Piutang_PT_RTI_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="piutang-management-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <ArrowDownLeft className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-800">Daftar Piutang Usaha (Accounts Receivable / AR)</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pencatatan otomatis hak tagih dari Surat Jalan (DO) pengiriman barang ke Pelanggan maupun tagihan manual proyek.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-refresh-piutang"
            onClick={refreshData}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            id="btn-export-csv-piutang"
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
          {currentUser.role !== 'ADMIN_HO' && (
            <button
              id="btn-add-manual-piutang"
              onClick={() => setShowAddManualModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Piutang Manual</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sisa Piutang Aktif</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{formatRupiah(totalBalanceDue)}</p>
            <p className="text-xs text-slate-400 mt-0.5">{receivables.filter(r => r.status !== 'PAID').length} tagihan belum tertagih</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Piutang Jatuh Tempo</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{overdueCount} <span className="text-sm font-normal text-slate-500">Invoice</span></p>
            <p className="text-xs text-red-600 font-medium mt-0.5">Perlu follow-up penagihan</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sudah Diterima</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatRupiah(totalReceived)}</p>
            <p className="text-xs text-slate-400 mt-0.5">{receivables.filter(r => r.status === 'PAID').length} tagihan lunas masuk kas</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Nilai Tagihan DO</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{formatRupiah(totalPiutang)}</p>
            <p className="text-xs text-slate-400 mt-0.5">Akumulasi pengiriman pelanggan</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-piutang"
            type="text"
            placeholder="Cari Pelanggan, No DO, No Piutang..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500 font-medium shrink-0">Status:</span>
          {[
            { key: 'ALL', label: 'Semua' },
            { key: 'UNPAID', label: 'Belum Lunas' },
            { key: 'PARTIAL', label: 'Diterima Sebagian' },
            { key: 'PAID', label: 'Lunas' },
            { key: 'OVERDUE', label: 'Jatuh Tempo' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                statusFilter === tab.key
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Receivables Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">No. Piutang / DO</th>
                <th className="py-3.5 px-4">Pelanggan & Alamat</th>
                <th className="py-3.5 px-4">Jatuh Tempo</th>
                <th className="py-3.5 px-4 text-right">Nilai Barang</th>
                <th className="py-3.5 px-4 text-right">Ongkir</th>
                <th className="py-3.5 px-4 text-right">Total Tagihan</th>
                <th className="py-3.5 px-4 text-right">Sisa Piutang</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-normal">
              {filteredReceivables.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <ArrowDownLeft className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">Belum ada catatan Piutang Usaha</p>
                    <p className="text-xs text-slate-400 mt-1">Piutang akan otomatis tercatat saat membuat Surat Jalan (DO) pengiriman ke Pelanggan.</p>
                  </td>
                </tr>
              ) : (
                filteredReceivables.map((rec) => {
                  const isOverdue = rec.status !== 'PAID' && rec.dueDate && new Date(rec.dueDate) < new Date();
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{rec.receivableNumber}</div>
                        <div className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                          <FileText className="w-3 h-3" />
                          <span>{rec.doNumber}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{formatDate(rec.transactionDate)}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{rec.customerName}</span>
                        </div>
                        {rec.customerPhone && rec.customerPhone !== '-' && (
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{rec.customerPhone}</span>
                          </div>
                        )}
                        {rec.customerAddress && (
                          <div className="text-xs text-slate-400 truncate max-w-xs mt-0.5">
                            {rec.customerAddress}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-slate-700">{formatDate(rec.dueDate)}</div>
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full mt-1">
                            <Clock className="w-3 h-3" /> Terlambat
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                        {formatRupiah(rec.subtotal)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                        {rec.shippingCost ? formatRupiah(rec.shippingCost) : '-'}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                        {formatRupiah(rec.totalAmount)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-600">
                        {formatRupiah(rec.balanceDue)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {rec.status === 'PAID' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Lunas
                          </span>
                        )}
                        {rec.status === 'PARTIAL' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                            <Clock className="w-3 h-3" /> Sebagian
                          </span>
                        )}
                        {rec.status === 'UNPAID' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-amber-100 text-amber-800 rounded-full">
                            <AlertCircle className="w-3 h-3" /> Belum Lunas
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {rec.status !== 'PAID' && currentUser.role !== 'ADMIN_HO' && (
                            <button
                              id={`btn-receive-piutang-${rec.id}`}
                              onClick={() => openReceivePaymentModal(rec)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>Terima</span>
                            </button>
                          )}
                          <button
                            id={`btn-detail-piutang-${rec.id}`}
                            onClick={() => setSelectedReceivableDetail(rec)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Lihat Detail & Riwayat Pelunasan"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Process Receive Payment from Customer */}
      {selectedReceivableForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                  <Wallet className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-800">Penerimaan Pelunasan Piutang</h3>
                  <p className="text-xs text-slate-500">{selectedReceivableForPayment.receivableNumber} ({selectedReceivableForPayment.doNumber})</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReceivableForPayment(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessReceivePayment} className="mt-5 space-y-4">
              {/* Summary Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pelanggan:</span>
                  <span className="font-bold text-slate-800">{selectedReceivableForPayment.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Tagihan DO:</span>
                  <span className="font-semibold text-slate-700">{formatRupiah(selectedReceivableForPayment.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sudah Diterima:</span>
                  <span className="font-semibold text-emerald-700">{formatRupiah(selectedReceivableForPayment.receivedAmount)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 text-sm">
                  <span className="font-bold text-slate-800">Sisa Piutang:</span>
                  <span className="font-extrabold text-amber-600">{formatRupiah(selectedReceivableForPayment.balanceDue)}</span>
                </div>
              </div>

              {/* Destination Bank Account */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rekening Kas / Bank Penampung (Otomatis Menambah Saldo) <span className="text-red-500">*</span>
                </label>
                <select
                  id="select-receive-bank-account"
                  required
                  value={selectedBankAccountId}
                  onChange={(e) => setSelectedBankAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="">-- Pilih Rekening Kas / Bank Penerima --</option>
                  {bankAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.accountNumber}) — Saldo Saat Ini: {formatRupiah(acc.currentBalance)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nominal Pembayaran Diterima (Rp) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                  <input
                    id="input-receive-amount"
                    type="number"
                    required
                    min={1}
                    max={selectedReceivableForPayment.balanceDue}
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(Number(e.target.value))}
                    className="w-full pl-12 pr-4 py-2.5 text-base font-bold text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>Maksimal terima: {formatRupiah(selectedReceivableForPayment.balanceDue)}</span>
                  <button 
                    type="button" 
                    onClick={() => setReceivedAmount(selectedReceivableForPayment.balanceDue)}
                    className="text-emerald-600 font-semibold hover:underline"
                  >
                    Terima Penuh (100%)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Payment Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Terima</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Metode Bayar</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="BANK_TRANSFER">Transfer Bank</option>
                    <option value="CASH">Kas Tunai</option>
                    <option value="GIRO">Giro / Bilyet</option>
                    <option value="CHEQUE">Cek</option>
                  </select>
                </div>
              </div>

              {/* Reference Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">No. Bukti Transfer / Slip Setor</label>
                <input
                  type="text"
                  placeholder="Contoh: BUKTI-TRF-098273"
                  value={paymentRefNumber}
                  onChange={(e) => setPaymentRefNumber(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan / Catatan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan pelunasan termin ke-1 / pembayaran tunai..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedReceivableForPayment(null)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  id="btn-submit-receivable-payment"
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors"
                >
                  Simpan Penerimaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Receivable History & Details */}
      {selectedReceivableDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Detail Piutang & Riwayat Penerimaan</h3>
                <p className="text-xs text-slate-500">{selectedReceivableDetail.receivableNumber} • DO: {selectedReceivableDetail.doNumber}</p>
              </div>
              <button 
                onClick={() => setSelectedReceivableDetail(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Pelanggan:</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedReceivableDetail.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Kontak Pelanggan:</span>
                  <span className="font-semibold text-slate-700">{selectedReceivableDetail.customerPhone || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tanggal Transaksi / DO:</span>
                  <span className="font-semibold text-slate-700">{formatDate(selectedReceivableDetail.transactionDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Jatuh Tempo:</span>
                  <span className="font-semibold text-slate-700">{formatDate(selectedReceivableDetail.dueDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Tagihan (Barang + Ongkir):</span>
                  <span className="font-bold text-slate-900">{formatRupiah(selectedReceivableDetail.totalAmount)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Sisa Piutang:</span>
                  <span className="font-extrabold text-amber-600 text-sm">{formatRupiah(selectedReceivableDetail.balanceDue)}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Riwayat Penerimaan (Mutasi Kas Masuk)</h4>
                {selectedReceivableDetail.payments && selectedReceivableDetail.payments.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {selectedReceivableDetail.payments.map((pm, idx) => (
                      <div key={pm.id || idx} className="p-3 bg-white text-xs flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>{formatDate(pm.paymentDate)}</span>
                            <span className="text-[11px] text-slate-400">({pm.paymentMethod})</span>
                          </div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            Ref: {pm.referenceNumber || '-'} • Oleh: {pm.recordedBy || '-'}
                          </div>
                          {pm.notes && <div className="text-slate-400 italic text-[11px] mt-0.5">{pm.notes}</div>}
                        </div>
                        <div className="font-mono font-bold text-emerald-700 text-sm">
                          {formatRupiah(pm.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-400">
                    Belum ada pembayaran yang diterima untuk piutang ini.
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedReceivableDetail(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Manual Add Receivable */}
      {showAddManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg">Catat Piutang Pelanggan Manual</h3>
              <button 
                onClick={() => setShowAddManualModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualReceivable} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Pelanggan Terdaftar atau Ketik Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama PT / Klien Pelanggan"
                  value={manualCustomerName}
                  onChange={(e) => setManualCustomerName(e.target.value)}
                  list="customer-list-options"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <datalist id="customer-list-options">
                  {customers.map(c => (
                    <option key={c.id} value={c.name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. Telp / HP Pelanggan</label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={manualCustomerPhone}
                    onChange={(e) => setManualCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. DO / Proyek (Opsional)</label>
                  <input
                    type="text"
                    placeholder="DO-2026-08-001"
                    value={manualDoNumber}
                    onChange={(e) => setManualDoNumber(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Alamat Pengiriman / Penagihan</label>
                <textarea
                  rows={2}
                  placeholder="Alamat kantor / proyek pelanggan..."
                  value={manualCustomerAddress}
                  onChange={(e) => setManualCustomerAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nilai Barang / Jasa (Rp)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={manualSubtotal}
                    onChange={(e) => setManualSubtotal(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ongkir / Ekspedisi (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    value={manualShippingCost}
                    onChange={(e) => setManualShippingCost(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl flex justify-between text-xs font-bold text-emerald-900 border border-emerald-200">
                <span>Total Piutang:</span>
                <span>{formatRupiah(manualSubtotal + manualShippingCost)}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jatuh Tempo Pembayaran</label>
                <input
                  type="date"
                  required
                  value={manualDueDate}
                  onChange={(e) => setManualDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan termin / project..."
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddManualModal(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors"
                >
                  Simpan Piutang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
