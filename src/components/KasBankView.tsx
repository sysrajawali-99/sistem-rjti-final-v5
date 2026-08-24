import React, { useState } from 'react';
import { 
  BankAccount, 
  CashTransaction, 
  User 
} from '../types';
import { StorageService } from '../lib/storage';
import { formatRupiah, formatDate } from '../lib/utils';
import { 
  Building2, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowRightLeft, 
  Search, 
  Filter, 
  Plus, 
  Edit3, 
  RefreshCw, 
  Download, 
  CheckCircle, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  FileText, 
  User as UserIcon, 
  ShieldCheck,
  X,
  AlertCircle
} from 'lucide-react';

interface KasBankViewProps {
  currentUser: User;
  onRefresh?: () => void;
}

export const KasBankView: React.FC<KasBankViewProps> = ({ currentUser, onRefresh }) => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(StorageService.getBankAccounts());
  const [transactions, setTransactions] = useState<CashTransaction[]>(StorageService.getCashTransactions());
  
  // Filter States
  const [selectedAccountFilter, setSelectedAccountFilter] = useState<string>('ALL');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Modal States
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  
  // Adjust / Update Saldo Modal
  const [adjustingAccount, setAdjustingAccount] = useState<BankAccount | null>(null);
  const [newBalanceInput, setNewBalanceInput] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');

  // Add Transaction Modal (Pemasukan / Pengeluaran / Transfer)
  const [showAddTrxModal, setShowAddTrxModal] = useState(false);
  const [trxType, setTrxType] = useState<'INCOME' | 'EXPENSE' | 'TRANSFER'>('INCOME');
  const [trxBankAccountId, setTrxBankAccountId] = useState<string>('');
  const [trxDestBankAccountId, setTrxDestBankAccountId] = useState<string>('');
  const [trxAmount, setTrxAmount] = useState<number>(0);
  const [trxCategory, setTrxCategory] = useState<string>('Pendapatan Lain-lain');
  const [trxDate, setTrxDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [trxParty, setTrxParty] = useState<string>('');
  const [trxRefDoc, setTrxRefDoc] = useState<string>('');
  const [trxNotes, setTrxNotes] = useState<string>('');

  // Account Form State
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<'BANK' | 'CASH' | 'PETTY_CASH'>('BANK');
  const [accBankName, setAccBankName] = useState('');
  const [accNumber, setAccNumber] = useState('');
  const [accHolder, setAccHolder] = useState('PT. Rajawali Talenta Indonesia');
  const [accBranch, setAccBranch] = useState('');
  const [accInitialBalance, setAccInitialBalance] = useState(0);

  const refreshData = () => {
    setBankAccounts(StorageService.getBankAccounts());
    setTransactions(StorageService.getCashTransactions());
    if (onRefresh) onRefresh();
  };

  // KPIs
  const totalBalance = bankAccounts.reduce((sum, a) => sum + (a.currentBalance || 0), 0);
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amount, 0);
  const netCashFlow = totalIncome - totalExpense;

  // Filtered Transactions
  const filteredTransactions = transactions.filter(t => {
    const matchesAccount = selectedAccountFilter === 'ALL' || t.bankAccountId === selectedAccountFilter;
    const matchesType = selectedTypeFilter === 'ALL' || t.type === selectedTypeFilter;
    const matchesSearch = 
      t.transactionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.recipientOrPayer && t.recipientOrPayer.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.notes && t.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.referenceDoc && t.referenceDoc.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesAccount && matchesType && matchesSearch;
  });

  // Open Adjust Balance Modal
  const openAdjustBalance = (account: BankAccount) => {
    setAdjustingAccount(account);
    setNewBalanceInput(account.currentBalance);
    setAdjustReason(`Penyesuaian saldo riil per tanggal ${formatDate(new Date().toISOString().split('T')[0])}`);
  };

  const handleSaveAdjustBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingAccount) return;
    if (!adjustReason) {
      alert("Alasan update / rekonsiliasi saldo wajib diisi");
      return;
    }

    StorageService.adjustAccountBalance(adjustingAccount.id, newBalanceInput, adjustReason);
    setAdjustingAccount(null);
    refreshData();
  };

  // Open Add Transaction Modal
  const openAddTransaction = (type: 'INCOME' | 'EXPENSE' | 'TRANSFER', defaultAccountId?: string) => {
    setTrxType(type);
    setTrxBankAccountId(defaultAccountId || bankAccounts[0]?.id || '');
    setTrxDestBankAccountId(bankAccounts.find(a => a.id !== (defaultAccountId || bankAccounts[0]?.id))?.id || '');
    setTrxAmount(0);
    setTrxDate(new Date().toISOString().split('T')[0]);
    setTrxCategory(
      type === 'INCOME' ? 'Pendapatan Proyek / Jasa' : 
      type === 'EXPENSE' ? 'Biaya Operasional & Kantor' : 'Transfer Kas Internal'
    );
    setTrxParty('');
    setTrxRefDoc('');
    setTrxNotes('');
    setShowAddTrxModal(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (trxAmount <= 0) {
      alert("Nominal transaksi harus lebih dari Rp 0");
      return;
    }
    if (!trxBankAccountId) {
      alert("Pilih akun kas / bank terlebih dahulu");
      return;
    }
    if (trxType === 'TRANSFER' && trxBankAccountId === trxDestBankAccountId) {
      alert("Rekening asal dan rekening tujuan transfer tidak boleh sama");
      return;
    }

    const sourceAcc = bankAccounts.find(a => a.id === trxBankAccountId);
    if (!sourceAcc) return;

    if (trxType === 'EXPENSE' || trxType === 'TRANSFER') {
      if (sourceAcc.currentBalance < trxAmount) {
        const confirmMinus = window.confirm(
          `Saldo akun ${sourceAcc.name} (Rp ${sourceAcc.currentBalance.toLocaleString('id-ID')}) kurang dari nominal ${trxType === 'EXPENSE' ? 'pengeluaran' : 'transfer'} (Rp ${trxAmount.toLocaleString('id-ID')}). Tetap lanjutkan? (Saldo akan bernilai minus)`
        );
        if (!confirmMinus) return;
      }
    }

    const destAcc = bankAccounts.find(a => a.id === trxDestBankAccountId);

    StorageService.addCashTransaction({
      date: trxDate,
      type: trxType,
      category: trxCategory,
      bankAccountId: trxBankAccountId,
      bankAccountName: `${sourceAcc.name} (${sourceAcc.accountNumber})`,
      destinationBankAccountId: trxType === 'TRANSFER' ? trxDestBankAccountId : undefined,
      destinationBankAccountName: trxType === 'TRANSFER' && destAcc ? `${destAcc.name} (${destAcc.accountNumber})` : undefined,
      amount: trxAmount,
      referenceDoc: trxRefDoc || '-',
      recipientOrPayer: trxParty || (trxType === 'INCOME' ? 'Pemberi Dana' : 'Penerima Biaya'),
      operator: currentUser.name,
      notes: trxNotes
    });

    setShowAddTrxModal(false);
    refreshData();
  };

  // Add / Edit Account
  const handleSaveAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accName || !accNumber) {
      alert("Nama akun dan nomor rekening/kode kas wajib diisi");
      return;
    }

    if (editingAccount) {
      StorageService.updateBankAccount({
        ...editingAccount,
        name: accName,
        accountType: accType,
        bankName: accBankName || (accType === 'BANK' ? accName : 'Kas Internal'),
        accountNumber: accNumber,
        accountHolder: accHolder,
        branch: accBranch
      });
      setEditingAccount(null);
    } else {
      const code = `ACC-${String(bankAccounts.length + 1).padStart(3, '0')}`;
      StorageService.addBankAccount({
        accountCode: code,
        name: accName,
        accountType: accType,
        bankName: accBankName || (accType === 'BANK' ? accName : 'Kas Internal'),
        accountNumber: accNumber,
        accountHolder: accHolder,
        branch: accBranch,
        currentBalance: accInitialBalance,
        isActive: true,
        isDefault: bankAccounts.length === 0
      });
      setShowAddAccountModal(false);
    }

    setAccName('');
    setAccBankName('');
    setAccNumber('');
    setAccBranch('');
    setAccInitialBalance(0);
    refreshData();
  };

  const openEditAccount = (acc: BankAccount) => {
    setEditingAccount(acc);
    setAccName(acc.name);
    setAccType(acc.accountType || (acc.type === 'CASH' ? 'CASH' : 'BANK'));
    setAccBankName(acc.bankName);
    setAccNumber(acc.accountNumber);
    setAccHolder(acc.accountHolder || acc.holderName || 'PT. Rajawali Talenta Indonesia');
    setAccBranch(acc.branch || '');
  };

  const exportToCSV = () => {
    const headers = ['No Transaksi', 'Tanggal', 'Tipe', 'Kategori', 'Akun Kas/Bank', 'Pihak Terkait', 'No Ref', 'Nominal (Rp)', 'Saldo Akhir (Rp)', 'Operator', 'Keterangan'];
    const rows = filteredTransactions.map(t => [
      t.transactionNumber,
      t.date,
      t.type,
      t.category,
      t.bankAccountName,
      t.recipientOrPayer || '-',
      t.referenceDoc || '-',
      t.amount,
      t.balanceAfter,
      t.operator,
      t.notes || '-'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Buku_Mutasi_Kas_Bank_PT_RTI_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="kas-bank-management-view" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Building2 className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-800">Manajemen Kas & Bank (Update Saldo & Mutasi)</h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Pengelompokan saldo berdasarkan nomor rekening & kas. Otomatis bertambah saat piutang terbayar dan berkurang saat pembayaran hutang atau pengeluaran.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-refresh-kasbank"
            onClick={refreshData}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            id="btn-export-csv-kasbank"
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>

          {currentUser.role !== 'ADMIN_HO' && (
            <>
              <button
                id="btn-add-income"
                onClick={() => openAddTransaction('INCOME')}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
              >
                <ArrowDownLeft className="w-4 h-4" />
                <span>+ Pemasukan</span>
              </button>
              <button
                id="btn-add-expense"
                onClick={() => openAddTransaction('EXPENSE')}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-colors"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>- Pengeluaran</span>
              </button>
              <button
                id="btn-add-transfer"
                onClick={() => openAddTransaction('TRANSFER')}
                className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>Transfer Antar Kas</span>
              </button>
              {currentUser.role === 'SUPER_ADMIN' && (
                <button
                  id="btn-add-account"
                  onClick={() => setShowAddAccountModal(true)}
                  className="flex items-center gap-1 px-3 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ Rekening Baru</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Global Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Likuiditas Saldo</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{formatRupiah(totalBalance)}</p>
            <p className="text-xs text-slate-400 mt-0.5">{bankAccounts.length} rekening bank & pos kas aktif</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Wallet className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pemasukan</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{formatRupiah(totalIncome)}</p>
            <p className="text-xs text-emerald-700 font-medium mt-0.5">Termasuk pelunasan piutang DO</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Pengeluaran</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{formatRupiah(totalExpense)}</p>
            <p className="text-xs text-red-600 font-medium mt-0.5">Termasuk pembayaran hutang PO</p>
          </div>
          <div className="p-3 bg-red-50 text-red-600 rounded-xl">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Net Cash Flow</p>
            <p className={`text-2xl font-bold mt-1 ${netCashFlow >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
              {formatRupiah(netCashFlow)}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Surplus / Arus kas bersih</p>
          </div>
          <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Section: Rekening Kas & Bank Cards (Dikelompokkan by Nomor Rekening / Kas) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-800">Pos Rekening & Kas (Update Saldo)</h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full">
              {bankAccounts.length} Akun
            </span>
          </div>
          <p className="text-xs text-slate-400">Pilih "Update Saldo" untuk rekonsiliasi manual atau lihat mutasi per akun.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {bankAccounts.map((acc) => {
            const isCash = acc.accountType === 'CASH' || acc.accountType === 'PETTY_CASH';
            return (
              <div 
                key={acc.id} 
                className={`bg-white rounded-2xl p-5 border shadow-sm transition-all hover:shadow-md ${
                  selectedAccountFilter === acc.id ? 'ring-2 ring-blue-500 border-blue-500' : 'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-2.5 rounded-xl ${isCash ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                      {isCash ? <Wallet className="w-5 h-5" /> : <Building2 className="w-5 h-5" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-800 text-sm">{acc.name}</h3>
                      <p className="text-xs text-slate-500 font-mono">{acc.accountNumber}</p>
                    </div>
                  </div>
                  {currentUser.role === 'SUPER_ADMIN' && (
                    <button
                      onClick={() => openEditAccount(acc)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit Rekening"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Saldo Saat Ini</span>
                  <div className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                    {formatRupiah(acc.currentBalance)}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1 truncate">
                    a.n. <span className="font-medium text-slate-700">{acc.accountHolder}</span>
                  </div>
                  {acc.branch && (
                    <div className="text-[11px] text-slate-400 truncate">
                      Cabang: {acc.branch}
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => {
                      if (selectedAccountFilter === acc.id) {
                        setSelectedAccountFilter('ALL');
                      } else {
                        setSelectedAccountFilter(acc.id);
                      }
                    }}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex-1 text-center ${
                      selectedAccountFilter === acc.id 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {selectedAccountFilter === acc.id ? 'Semua Akun' : 'Lihat Mutasi'}
                  </button>

                  {currentUser.role === 'SUPER_ADMIN' && (
                    <button
                      id={`btn-update-saldo-${acc.id}`}
                      onClick={() => openAdjustBalance(acc)}
                      className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Update atau Koreksi Saldo Rekening"
                    >
                      Update Saldo
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Section: Filter & Search Mutasi */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-search-mutasi"
              type="text"
              placeholder="Cari No TRX, Kategori, Pihak Terkait..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedAccountFilter}
              onChange={(e) => setSelectedAccountFilter(e.target.value)}
              className="px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="ALL">Semua Rekening Kas / Bank</option>
              {bankAccounts.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({a.accountNumber})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-500 font-medium shrink-0">Tipe:</span>
          {[
            { key: 'ALL', label: 'Semua Mutasi' },
            { key: 'INCOME', label: 'Pemasukan (+)' },
            { key: 'EXPENSE', label: 'Pengeluaran (-)' },
            { key: 'TRANSFER', label: 'Transfer' },
            { key: 'ADJUSTMENT', label: 'Koreksi Saldo' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTypeFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap ${
                selectedTypeFilter === tab.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions / Mutasi Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-800">
            Buku Mutasi & Rekap Transaksi Kas/Bank
            {selectedAccountFilter !== 'ALL' && (
              <span className="ml-2 font-normal text-blue-600">
                (Filter: {bankAccounts.find(a => a.id === selectedAccountFilter)?.name})
              </span>
            )}
          </h3>
          <span className="text-xs text-slate-500">
            Menampilkan {filteredTransactions.length} riwayat mutasi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">No. Transaksi & Tgl</th>
                <th className="py-3.5 px-4">Akun Kas / Bank</th>
                <th className="py-3.5 px-4">Tipe & Kategori</th>
                <th className="py-3.5 px-4">Pihak Terkait & Keterangan</th>
                <th className="py-3.5 px-4 text-right">Nominal (Rp)</th>
                <th className="py-3.5 px-4 text-right">Saldo Sesudah</th>
                <th className="py-3.5 px-4 text-center">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-normal">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Wallet className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-medium text-slate-600">Belum ada mutasi transaksi</p>
                    <p className="text-xs text-slate-400 mt-1">Mutasi akan tercatat otomatis dari pelunasan piutang, bayar hutang, atau input kas masuk/keluar.</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((trx) => (
                  <tr key={trx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 font-mono text-xs">{trx.transactionNumber}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{formatDate(trx.date)}</div>
                      {trx.referenceDoc && trx.referenceDoc !== '-' && (
                        <div className="text-[11px] text-blue-600 font-mono mt-0.5">Ref: {trx.referenceDoc}</div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 text-xs">{trx.bankAccountName}</div>
                      {trx.type === 'TRANSFER' && trx.destinationBankAccountName && (
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          ➔ Ke: {trx.destinationBankAccountName}
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        {trx.type === 'INCOME' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 rounded-md">
                            <ArrowDownLeft className="w-3 h-3" /> Pemasukan
                          </span>
                        )}
                        {trx.type === 'EXPENSE' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-red-100 text-red-800 rounded-md">
                            <ArrowUpRight className="w-3 h-3" /> Pengeluaran
                          </span>
                        )}
                        {trx.type === 'TRANSFER' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 rounded-md">
                            <ArrowRightLeft className="w-3 h-3" /> Transfer
                          </span>
                        )}
                        {trx.type === 'ADJUSTMENT' && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold bg-purple-100 text-purple-800 rounded-md">
                            <ShieldCheck className="w-3 h-3" /> Update Saldo
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-700 font-semibold mt-1">{trx.category}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 text-xs">{trx.recipientOrPayer || '-'}</div>
                      {trx.notes && (
                        <div className="text-xs text-slate-400 italic mt-0.5 max-w-xs truncate">
                          {trx.notes}
                        </div>
                      )}
                    </td>

                    <td className={`py-3.5 px-4 text-right font-mono font-bold ${
                      trx.type === 'INCOME' ? 'text-emerald-600' :
                      trx.type === 'EXPENSE' ? 'text-red-600' :
                      trx.type === 'TRANSFER' ? 'text-blue-600' : 'text-purple-700'
                    }`}>
                      {trx.type === 'INCOME' ? `+ ${formatRupiah(trx.amount)}` :
                       trx.type === 'EXPENSE' ? `- ${formatRupiah(trx.amount)}` :
                       formatRupiah(trx.amount)}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono text-slate-800 font-semibold">
                      {formatRupiah(trx.balanceAfter)}
                    </td>

                    <td className="py-3.5 px-4 text-center text-xs text-slate-500">
                      {trx.operator || 'System'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Update / Koreksi Saldo Rekening (SUPER ADMIN) */}
      {adjustingAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-800">Update / Rekonsiliasi Saldo</h3>
                  <p className="text-xs text-slate-500">{adjustingAccount.name} ({adjustingAccount.accountNumber})</p>
                </div>
              </div>
              <button 
                onClick={() => setAdjustingAccount(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustBalance} className="mt-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1.5 border border-slate-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Saldo Tercatat Saat Ini:</span>
                  <span className="font-mono font-bold text-slate-900">{formatRupiah(adjustingAccount.currentBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pemilik Rekening:</span>
                  <span className="font-semibold text-slate-700">{adjustingAccount.accountHolder}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Saldo Riil / Saldo Baru (Rp) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                  <input
                    id="input-new-balance"
                    type="number"
                    required
                    value={newBalanceInput}
                    onChange={(e) => setNewBalanceInput(Number(e.target.value))}
                    className="w-full pl-12 pr-4 py-2.5 text-base font-bold text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Selisih: <span className={newBalanceInput >= adjustingAccount.currentBalance ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                    {newBalanceInput >= adjustingAccount.currentBalance ? '+' : ''}
                    {formatRupiah(newBalanceInput - adjustingAccount.currentBalance)}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alasan Perubahan / Catatan Rekonsiliasi <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Contoh: Rekonsiliasi saldo buku tabungan cetak per akhir bulan..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setAdjustingAccount(null)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  id="btn-confirm-adjust-balance"
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                >
                  Simpan Perubahan Saldo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Catat Transaksi Kas Masuk / Keluar / Transfer */}
      {showAddTrxModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className={`p-2 rounded-xl ${
                  trxType === 'INCOME' ? 'bg-emerald-100 text-emerald-700' :
                  trxType === 'EXPENSE' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                }`}>
                  {trxType === 'INCOME' ? <ArrowDownLeft className="w-5 h-5" /> :
                   trxType === 'EXPENSE' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowRightLeft className="w-5 h-5" />}
                </span>
                <div>
                  <h3 className="font-bold text-slate-800">
                    {trxType === 'INCOME' ? 'Catat Kas Masuk (Pemasukan)' :
                     trxType === 'EXPENSE' ? 'Catat Kas Keluar (Pengeluaran)' : 'Transfer Antar Pos Kas/Bank'}
                  </h3>
                  <p className="text-xs text-slate-500">Otomatis memperbarui saldo akun yang dipilih.</p>
                </div>
              </div>
              <button 
                onClick={() => setShowAddTrxModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTransaction} className="mt-4 space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTrxType('INCOME')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    trxType === 'INCOME' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white/60'
                  }`}
                >
                  + Pemasukan
                </button>
                <button
                  type="button"
                  onClick={() => setTrxType('EXPENSE')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    trxType === 'EXPENSE' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white/60'
                  }`}
                >
                  - Pengeluaran
                </button>
                <button
                  type="button"
                  onClick={() => setTrxType('TRANSFER')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    trxType === 'TRANSFER' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white/60'
                  }`}
                >
                  ⇄ Transfer
                </button>
              </div>

              {/* Source Account */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {trxType === 'TRANSFER' ? 'Rekening Kas Asal (Dipotong)' : 'Pilih Akun Kas / Bank'} <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={trxBankAccountId}
                  onChange={(e) => setTrxBankAccountId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {bankAccounts.map(a => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.accountNumber}) — Saldo: {formatRupiah(a.currentBalance)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Account (if transfer) */}
              {trxType === 'TRANSFER' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Rekening Kas Tujuan (Ditambah) <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={trxDestBankAccountId}
                    onChange={(e) => setTrxDestBankAccountId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {bankAccounts.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.accountNumber}) — Saldo: {formatRupiah(a.currentBalance)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nominal Transaksi (Rp) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    required
                    min={1}
                    value={trxAmount}
                    onChange={(e) => setTrxAmount(Number(e.target.value))}
                    className="w-full pl-12 pr-4 py-2.5 text-base font-bold text-slate-900 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Transaksi</label>
                  <input
                    type="date"
                    required
                    value={trxDate}
                    onChange={(e) => setTrxDate(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Kategori</label>
                  <input
                    type="text"
                    required
                    list="category-options"
                    value={trxCategory}
                    onChange={(e) => setTrxCategory(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <datalist id="category-options">
                    {trxType === 'INCOME' ? (
                      <>
                        <option value="Pelunasan Piutang Pelanggan" />
                        <option value="Pendapatan Proyek / Jasa" />
                        <option value="Setoran Modal / Investasi" />
                        <option value="Bunga Bank / Jasa Giro" />
                        <option value="Pengembalian Kasbon / Retur" />
                        <option value="Pendapatan Lain-lain" />
                      </>
                    ) : trxType === 'EXPENSE' ? (
                      <>
                        <option value="Pembayaran Hutang Supplier" />
                        <option value="Biaya Operasional & Kantor" />
                        <option value="Gaji & Tunjangan Karyawan" />
                        <option value="Bensin & Transportasi Lapangan" />
                        <option value="Biaya Listrik, Air & Internet" />
                        <option value="Pengadaan Alat / Perlengkapan" />
                        <option value="Pajak & Retribusi" />
                        <option value="Biaya Admin Bank" />
                      </>
                    ) : (
                      <>
                        <option value="Tarik Tunai Bank ke Kas Kecil" />
                        <option value="Setor Tunai Kas ke Bank" />
                        <option value="Pindah Buku Antar Rekening" />
                      </>
                    )}
                  </datalist>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Party */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {trxType === 'INCOME' ? 'Diterima Dari' : 'Dibayarkan Kepada'}
                  </label>
                  <input
                    type="text"
                    placeholder="Nama Klien / Vendor / Karyawan"
                    value={trxParty}
                    onChange={(e) => setTrxParty(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Reference Doc */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">No. Bukti / Kuitansi</label>
                  <input
                    type="text"
                    placeholder="KWT-001 / Slip TRF"
                    value={trxRefDoc}
                    onChange={(e) => setTrxRefDoc(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Catatan / Uraian</label>
                <textarea
                  rows={2}
                  placeholder="Uraian detail transaksi..."
                  value={trxNotes}
                  onChange={(e) => setTrxNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddTrxModal(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 text-sm font-bold text-white rounded-xl shadow-md transition-colors ${
                    trxType === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-700' :
                    trxType === 'EXPENSE' ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  Simpan Transaksi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add or Edit Bank Account */}
      {(showAddAccountModal || editingAccount) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingAccount ? 'Edit Akun Kas / Bank' : 'Tambah Rekening Kas / Bank Baru'}
              </h3>
              <button 
                onClick={() => {
                  setShowAddAccountModal(false);
                  setEditingAccount(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAccount} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipe Akun</label>
                <select
                  value={accType}
                  onChange={(e) => setAccType(e.target.value as any)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="BANK">Rekening Bank</option>
                  <option value="CASH">Kas Tunai Lapangan / Kantor</option>
                  <option value="PETTY_CASH">Kas Kecil (Petty Cash)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Akun / Pos Kas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Bank Mandiri Giro / Kas Operasional HO"
                  value={accName}
                  onChange={(e) => setAccName(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Nama Bank</label>
                  <input
                    type="text"
                    placeholder="Mandiri / BCA / BRI / Kas"
                    value={accBankName}
                    onChange={(e) => setAccBankName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    No. Rekening / No. Pos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="123-00-xxxx-xxx"
                    value={accNumber}
                    onChange={(e) => setAccNumber(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Atas Nama (Holder)</label>
                <input
                  type="text"
                  value={accHolder}
                  onChange={(e) => setAccHolder(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Cabang (Branch)</label>
                <input
                  type="text"
                  placeholder="KCP Sudirman / HO Jakarta"
                  value={accBranch}
                  onChange={(e) => setAccBranch(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {!editingAccount && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Saldo Awal (Rp)</label>
                  <input
                    type="number"
                    min={0}
                    value={accInitialBalance}
                    onChange={(e) => setAccInitialBalance(Number(e.target.value))}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddAccountModal(false);
                    setEditingAccount(null);
                  }}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
                >
                  {editingAccount ? 'Simpan Perubahan' : 'Buat Rekening'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
