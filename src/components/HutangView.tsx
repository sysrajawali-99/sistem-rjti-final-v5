import React, { useState } from 'react';
import { 
  PayableRecord, 
  BankAccount, 
  User, 
  Vendor 
} from '../types';
import { StorageService } from '../lib/storage';
import { formatRupiah, formatDate } from '../lib/utils';
import { 
  CreditCard, 
  Search, 
  Filter, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  ArrowUpRight, 
  Building2, 
  User as UserIcon, 
  Phone, 
  FileText, 
  DollarSign, 
  Calendar, 
  ChevronRight, 
  Download, 
  RefreshCw,
  Wallet,
  X,
  History
} from 'lucide-react';

interface HutangViewProps {
  currentUser: User;
  onRefresh?: () => void;
}

export const HutangView: React.FC<HutangViewProps> = ({ currentUser, onRefresh }) => {
  const [payables, setPayables] = useState<PayableRecord[]>(StorageService.getPayables());
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(StorageService.getBankAccounts());
  const [vendors, setVendors] = useState<Vendor[]>(StorageService.getVendors());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Payment Modal State
  const [selectedPayableForPayment, setSelectedPayableForPayment] = useState<PayableRecord | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'CASH' | 'GIRO' | 'CHEQUE'>('BANK_TRANSFER');
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>('');
  const [paymentRefNumber, setPaymentRefNumber] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  // History & Detail Modal
  const [selectedPayableDetail, setSelectedPayableDetail] = useState<PayableRecord | null>(null);

  // Manual Payable Modal
  const [showAddManualModal, setShowAddManualModal] = useState(false);
  const [manualVendorName, setManualVendorName] = useState('');
  const [manualVendorPic, setManualVendorPic] = useState('');
  const [manualVendorPhone, setManualVendorPhone] = useState('');
  const [manualPoNumber, setManualPoNumber] = useState('');
  const [manualSubtotal, setManualSubtotal] = useState(0);
  const [manualShippingCost, setManualShippingCost] = useState(0);
  const [manualTaxAmount, setManualTaxAmount] = useState(0);
  const [manualDueDate, setManualDueDate] = useState(
    new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]
  );
  const [manualNotes, setManualNotes] = useState('');

  const refreshData = () => {
    setPayables(StorageService.getPayables());
    setBankAccounts(StorageService.getBankAccounts());
    setVendors(StorageService.getVendors());
    if (onRefresh) onRefresh();
  };

  // KPIs
  const totalHutang = payables.reduce((sum, p) => sum + (p.totalAmount || 0), 0);
  const totalPaid = payables.reduce((sum, p) => sum + (p.paidAmount || 0), 0);
  const totalBalanceDue = payables.reduce((sum, p) => sum + (p.balanceDue || 0), 0);
  const overdueCount = payables.filter(p => {
    if (p.status === 'PAID') return false;
    if (!p.dueDate) return false;
    return new Date(p.dueDate) < new Date();
  }).length;

  // Filtered List
  const filteredPayables = payables.filter(item => {
    const matchesSearch = 
      item.payableNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.vendorPic && item.vendorPic.toLowerCase().includes(searchTerm.toLowerCase()));

    const isOverdue = item.status !== 'PAID' && item.dueDate && new Date(item.dueDate) < new Date();

    if (statusFilter === 'ALL') return matchesSearch;
    if (statusFilter === 'OVERDUE') return matchesSearch && isOverdue;
    return matchesSearch && item.status === statusFilter;
  });

  const openPaymentModal = (payable: PayableRecord) => {
    setSelectedPayableForPayment(payable);
    setPaymentAmount(payable.balanceDue);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentMethod('BANK_TRANSFER');
    const firstActiveBank = bankAccounts.find(b => b.isActive) || bankAccounts[0];
    setSelectedBankAccountId(firstActiveBank ? firstActiveBank.id : '');
    setPaymentRefNumber(`TRF-${Date.now().toString().slice(-6)}`);
    setPaymentNotes(`Pembayaran Hutang PO ${payable.poNumber} kepada ${payable.vendorName}`);
  };

  const handleProcessPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayableForPayment) return;
    if (paymentAmount <= 0) {
      alert("Jumlah pembayaran harus lebih besar dari 0");
      return;
    }
    if (paymentAmount > selectedPayableForPayment.balanceDue) {
      alert(`Jumlah pembayaran (Rp ${paymentAmount.toLocaleString('id-ID')}) melebihi sisa hutang (Rp ${selectedPayableForPayment.balanceDue.toLocaleString('id-ID')})`);
      return;
    }
    if (!selectedBankAccountId) {
      alert("Silakan pilih rekening Kas / Bank sumber pembayaran");
      return;
    }

    const selectedAccount = bankAccounts.find(a => a.id === selectedBankAccountId);
    if (selectedAccount && selectedAccount.currentBalance < paymentAmount) {
      const confirmContinue = window.confirm(
        `Peringatan: Saldo rekening ${selectedAccount.name} saat ini (Rp ${selectedAccount.currentBalance.toLocaleString('id-ID')}) lebih kecil dari nominal bayar (Rp ${paymentAmount.toLocaleString('id-ID')}). Apakah ingin tetap melanjutkan pembayaran? (Saldo akan menjadi minus)`
      );
      if (!confirmContinue) return;
    }

    StorageService.recordPayablePayment(selectedPayableForPayment.id, {
      amount: paymentAmount,
      paymentDate,
      paymentMethod,
      bankAccountId: selectedBankAccountId,
      referenceNumber: paymentRefNumber,
      notes: paymentNotes
    });

    setSelectedPayableForPayment(null);
    refreshData();
  };

  const handleCreateManualPayable = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualVendorName) {
      alert("Nama supplier wajib diisi");
      return;
    }
    const grandTotal = manualSubtotal + manualShippingCost + manualTaxAmount;
    if (grandTotal <= 0) {
      alert("Total hutang harus lebih dari Rp 0");
      return;
    }

    StorageService.addPayable({
      poNumber: manualPoNumber || 'NON-PO / MANUAL',
      vendorName: manualVendorName,
      vendorPic: manualVendorPic || '-',
      vendorPhone: manualVendorPhone || '-',
      orderDate: new Date().toISOString().split('T')[0],
      dueDate: manualDueDate,
      subtotal: manualSubtotal,
      shippingCost: manualShippingCost,
      taxAmount: manualTaxAmount,
      discountAmount: 0,
      totalAmount: grandTotal,
      notes: manualNotes
    });

    setShowAddManualModal(false);
    setManualVendorName('');
    setManualVendorPic('');
    setManualVendorPhone('');
    setManualPoNumber('');
    setManualSubtotal(0);
    setManualShippingCost(0);
    setManualTaxAmount(0);
    setManualNotes('');
    refreshData();
  };

  const exportToCSV = () => {
    const headers = ['No Hutang', 'No PO', 'Supplier', 'PIC', 'Tgl Order', 'Jatuh Tempo', 'Subtotal Beli', 'Ongkir', 'PPN', 'Total Hutang', 'Sudah Dibayar', 'Sisa Hutang', 'Status'];
    const rows = filteredPayables.map(p => [
      p.payableNumber,
      p.poNumber,
      p.vendorName,
      p.vendorPic || '-',
      p.orderDate,
      p.dueDate,
      p.subtotal,
      p.shippingCost || 0,
      p.taxAmount || 0,
      p.totalAmount,
      p.paidAmount,
      p.balanceDue,
      p.status
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Hutang_PT_RTI_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="hutang-management-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-red-100 text-red-700 rounded-lg">
              <CreditCard className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-800">Daftar Hutang Usaha (Accounts Payable / AP)</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pencatatan otomatis seluruh kewajiban pembayaran dari Purchase Order ke Supplier (Harga Beli + Ongkir + Pajak).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-refresh-hutang"
            onClick={refreshData}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            id="btn-export-csv-hutang"
            onClick={exportToCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
          {currentUser.role !== 'ADMIN_HO' && (
            <button
              id="btn-add-manual-hutang"
              onClick={() => setShowAddManualModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>+ Catat Hutang Manual</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sisa Hutang Aktif</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{formatRupiah(totalBalanceDue)}</p>
            <p className="text-xs text-slate-400 mt-0.5">{payables.filter(p => p.status !== 'PAID').length} tagihan belum lunas</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hutang Jatuh Tempo</p>
            <p className="text-2xl font-bold text-amber-600 mt-1">{overdueCount} <span className="text-sm font-normal text-slate-500">Invoice</span></p>
            <p className="text-xs text-amber-700 font-medium mt-0.5">Perlu prioritas pembayaran</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sudah Dibayar</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatRupiah(totalPaid)}</p>
            <p className="text-xs text-slate-400 mt-0.5">{payables.filter(p => p.status === 'PAID').length} tagihan lunas</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Nilai Tagihan PO</p>
            <p className="text-2xl font-bold text-slate-800 mt-1">{formatRupiah(totalHutang)}</p>
            <p className="text-xs text-slate-400 mt-0.5">Akumulasi pengadaan supplier</p>
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
            id="input-search-hutang"
            type="text"
            placeholder="Cari Supplier, No PO, No Hutang, PIC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-xs text-slate-500 font-medium shrink-0">Status:</span>
          {[
            { key: 'ALL', label: 'Semua' },
            { key: 'UNPAID', label: 'Belum Lunas' },
            { key: 'PARTIAL', label: 'Dibayar Sebagian' },
            { key: 'PAID', label: 'Lunas' },
            { key: 'OVERDUE', label: 'Jatuh Tempo' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                statusFilter === tab.key
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Payables Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">No. Hutang / PO</th>
                <th className="py-3.5 px-4">Supplier & PIC</th>
                <th className="py-3.5 px-4">Jatuh Tempo</th>
                <th className="py-3.5 px-4 text-right">Harga Beli</th>
                <th className="py-3.5 px-4 text-right">Ongkir</th>
                <th className="py-3.5 px-4 text-right">Total Hutang</th>
                <th className="py-3.5 px-4 text-right">Sisa Hutang</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-normal">
              {filteredPayables.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <CreditCard className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">Belum ada catatan Hutang Usaha</p>
                    <p className="text-xs text-slate-400 mt-1">Hutang akan otomatis tercatat saat membuat Purchase Order ke Supplier.</p>
                  </td>
                </tr>
              ) : (
                filteredPayables.map((payable) => {
                  const isOverdue = payable.status !== 'PAID' && payable.dueDate && new Date(payable.dueDate) < new Date();
                  return (
                    <tr key={payable.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800">{payable.payableNumber}</div>
                        <div className="text-xs text-blue-600 flex items-center gap-1 mt-0.5">
                          <FileText className="w-3 h-3" />
                          <span>{payable.poNumber}</span>
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">{formatDate(payable.orderDate)}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-800 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{payable.vendorName}</span>
                        </div>
                        {payable.vendorPic && payable.vendorPic !== '-' && (
                          <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <UserIcon className="w-3 h-3 text-slate-400" />
                            <span>PIC: {payable.vendorPic}</span>
                            {payable.vendorPhone && (
                              <span className="text-slate-400">({payable.vendorPhone})</span>
                            )}
                          </div>
                        )}
                        {payable.vendorBank && payable.vendorBank !== '-' && (
                          <div className="text-xs text-slate-400 mt-0.5">
                            Rek: {payable.vendorBank} {payable.vendorBankAccount}
                          </div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-xs font-medium text-slate-700">{formatDate(payable.dueDate)}</div>
                        {isOverdue && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full mt-1">
                            <Clock className="w-3 h-3" /> Terlambat
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-700">
                        {formatRupiah(payable.subtotal)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono text-slate-600">
                        {payable.shippingCost ? formatRupiah(payable.shippingCost) : '-'}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-semibold text-slate-900">
                        {formatRupiah(payable.totalAmount)}
                      </td>

                      <td className="py-3.5 px-4 text-right font-mono font-bold text-red-600">
                        {formatRupiah(payable.balanceDue)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        {payable.status === 'PAID' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                            <CheckCircle className="w-3 h-3" /> Lunas
                          </span>
                        )}
                        {payable.status === 'PARTIAL' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
                            <Clock className="w-3 h-3" /> Sebagian
                          </span>
                        )}
                        {payable.status === 'UNPAID' && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                            <AlertTriangle className="w-3 h-3" /> Belum Lunas
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {payable.status !== 'PAID' && currentUser.role !== 'ADMIN_HO' && (
                            <button
                              id={`btn-pay-hutang-${payable.id}`}
                              onClick={() => openPaymentModal(payable)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                              <span>Bayar</span>
                            </button>
                          )}
                          <button
                            id={`btn-detail-hutang-${payable.id}`}
                            onClick={() => setSelectedPayableDetail(payable)}
                            className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                            title="Lihat Detail & Riwayat Pembayaran"
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

      {/* Modal: Process Payment to Supplier */}
      {selectedPayableForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <span className="p-2 bg-red-100 text-red-700 rounded-xl">
                  <Wallet className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-800">Pembayaran Hutang Supplier</h3>
                  <p className="text-xs text-slate-500">{selectedPayableForPayment.payableNumber} ({selectedPayableForPayment.poNumber})</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedPayableForPayment(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessPayment} className="mt-5 space-y-4">
              {/* Summary Box */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Supplier:</span>
                  <span className="font-bold text-slate-800">{selectedPayableForPayment.vendorName}</span>
                </div>
                {selectedPayableForPayment.vendorBank && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Rekening Tujuan:</span>
                    <span className="font-semibold text-slate-700">{selectedPayableForPayment.vendorBank} - {selectedPayableForPayment.vendorBankAccount} (a.n. {selectedPayableForPayment.vendorBankHolder || selectedPayableForPayment.vendorName})</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Total Tagihan (Beli + Ongkir + PPN):</span>
                  <span className="font-semibold text-slate-700">{formatRupiah(selectedPayableForPayment.totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Sudah Dibayar:</span>
                  <span className="font-semibold text-emerald-700">{formatRupiah(selectedPayableForPayment.paidAmount)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200 text-sm">
                  <span className="font-bold text-slate-800">Sisa Hutang:</span>
                  <span className="font-extrabold text-red-600">{formatRupiah(selectedPayableForPayment.balanceDue)}</span>
                </div>
              </div>

              {/* Source Bank Account */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Rekening Kas / Bank Pembayar (Otomatis Memotong Saldo) <span className="text-red-500">*</span>
                </label>
                <select
                  id="select-pay-bank-account"
                  required
                  value={selectedBankAccountId}
                  onChange={(e) => setSelectedBankAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">-- Pilih Rekening Kas / Bank --</option>
                  {bankAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.accountNumber}) — Saldo: {formatRupiah(acc.currentBalance)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Payment Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nominal Pembayaran (Rp) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                  <input
                    id="input-payment-amount"
                    type="number"
                    required
                    min={1}
                    max={selectedPayableForPayment.balanceDue}
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Number(e.target.value))}
                    className="w-full pl-12 pr-4 py-2.5 text-base font-bold text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                  <span>Maksimal bayar: {formatRupiah(selectedPayableForPayment.balanceDue)}</span>
                  <button 
                    type="button" 
                    onClick={() => setPaymentAmount(selectedPayableForPayment.balanceDue)}
                    className="text-red-600 font-semibold hover:underline"
                  >
                    Bayar Penuh (100%)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Payment Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Bayar</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Metode Bayar</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="BANK_TRANSFER">Transfer Bank</option>
                    <option value="CASH">Kas Tunai</option>
                    <option value="GIRO">Giro Perusahaan</option>
                    <option value="CHEQUE">Cek</option>
                  </select>
                </div>
              </div>

              {/* Reference / Proof Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">No. Referensi / Bukti Transfer</label>
                <input
                  type="text"
                  placeholder="Contoh: TRF-202608-00123 / Slip Mandiri"
                  value={paymentRefNumber}
                  onChange={(e) => setPaymentRefNumber(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Keterangan / Catatan</label>
                <textarea
                  rows={2}
                  placeholder="Catatan pelunasan, diskon khusus, dll..."
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedPayableForPayment(null)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  id="btn-submit-payable-payment"
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-colors"
                >
                  Konfirmasi Pembayaran
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Payable History & Details */}
      {selectedPayableDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Detail Hutang & Riwayat Pembayaran</h3>
                <p className="text-xs text-slate-500">{selectedPayableDetail.payableNumber} • PO: {selectedPayableDetail.poNumber}</p>
              </div>
              <button 
                onClick={() => setSelectedPayableDetail(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block">Supplier:</span>
                  <span className="font-bold text-slate-800 text-sm">{selectedPayableDetail.vendorName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">PIC & Kontak:</span>
                  <span className="font-semibold text-slate-700">{selectedPayableDetail.vendorPic || '-'} ({selectedPayableDetail.vendorPhone || '-'})</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Tanggal Order PO:</span>
                  <span className="font-semibold text-slate-700">{formatDate(selectedPayableDetail.orderDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Jatuh Tempo:</span>
                  <span className="font-semibold text-slate-700">{formatDate(selectedPayableDetail.dueDate)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Total Tagihan (Beli + Ongkir + PPN):</span>
                  <span className="font-bold text-slate-900">{formatRupiah(selectedPayableDetail.totalAmount)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Sisa Hutang:</span>
                  <span className="font-extrabold text-red-600 text-sm">{formatRupiah(selectedPayableDetail.balanceDue)}</span>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Riwayat Pembayaran (Mutasi Kas Keluar)</h4>
                {selectedPayableDetail.payments && selectedPayableDetail.payments.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {selectedPayableDetail.payments.map((pm, idx) => (
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
                    Belum ada riwayat pembayaran untuk hutang ini.
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-3 border-t border-slate-100">
                <button
                  onClick={() => setSelectedPayableDetail(null)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Manual Add Payable */}
      {showAddManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg">Catat Hutang Supplier Manual</h3>
              <button 
                onClick={() => setShowAddManualModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateManualPayable} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Pilih Supplier Terdaftar atau Ketik Baru <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nama PT / CV / Toko Supplier"
                  value={manualVendorName}
                  onChange={(e) => setManualVendorName(e.target.value)}
                  list="vendor-list-options"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <datalist id="vendor-list-options">
                  {vendors.map(v => (
                    <option key={v.id} value={v.name} />
                  ))}
                </datalist>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama PIC Supplier</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pak Herman"
                    value={manualVendorPic}
                    onChange={(e) => setManualVendorPic(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. Telp / HP PIC</label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={manualVendorPhone}
                    onChange={(e) => setManualVendorPhone(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">No. PO Referensi (Opsional)</label>
                <input
                  type="text"
                  placeholder="Contoh: PO-2026-08-001 atau NON-PO"
                  value={manualPoNumber}
                  onChange={(e) => setManualPoNumber(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Harga Beli Material (Rp)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={manualSubtotal}
                    onChange={(e) => setManualSubtotal(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ongkir (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    value={manualShippingCost}
                    onChange={(e) => setManualShippingCost(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">PPN (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    value={manualTaxAmount}
                    onChange={(e) => setManualTaxAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-red-50 rounded-xl flex justify-between text-xs font-bold text-red-900 border border-red-200">
                <span>Total Hutang (Harga Beli + Ongkir + PPN):</span>
                <span>{formatRupiah(manualSubtotal + manualShippingCost + manualTaxAmount)}</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Jatuh Tempo Pembayaran</label>
                <input
                  type="date"
                  required
                  value={manualDueDate}
                  onChange={(e) => setManualDueDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan</label>
                <textarea
                  rows={2}
                  placeholder="Keterangan pengadaan / kontrak..."
                  value={manualNotes}
                  onChange={(e) => setManualNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
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
                  className="px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-colors"
                >
                  Simpan Hutang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
