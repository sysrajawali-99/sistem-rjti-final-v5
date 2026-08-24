import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Printer, 
  Download, 
  Upload, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

import { StorageService } from './lib/storage';
import { getUserEffectiveMenus } from './lib/initialData';
import { 
  User, 
  MaterialRequest, 
  PurchaseOrder, 
  DeliveryOrder, 
  Invoice, 
  Retur, 
  InventoryItem, 
  Vendor, 
  CustomerClient, 
  CompanyProfile, 
  AuditLog, 
  PrintableDocType,
  NavTab
} from './types';

// Components
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { MRView } from './components/MRView';
import { POView } from './components/POView';
import { DOView } from './components/DOView';
import { InvoiceView } from './components/InvoiceView';
import { ReturView } from './components/ReturView';
import { InventoryView } from './components/InventoryView';
import { MasterDataView } from './components/MasterDataView';
import { AuditLogView } from './components/AuditLogView';
import { UserManagementView } from './components/UserManagementView';
import { CompanySettingsView } from './components/CompanySettingsView';
import { HutangView } from './components/HutangView';
import { PiutangView } from './components/PiutangView';
import { KasBankView } from './components/KasBankView';
import { PrintDocument } from './components/PrintDocument';
import { LoginPage } from './components/LoginPage';
import { ResetBlankModal } from './components/ResetBlankModal';

// Modals
import { 
  CreateMRModal, 
  CreatePOModal, 
  CreateDOModal, 
  CreateInvoiceModal, 
  PaymentModal, 
  CreateReturModal, 
  AddInventoryItemModal, 
  AdjustStockModal 
} from './components/CreateModals';

export default function App() {
  // Theme state ('light' | 'dark')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('rajawali_theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return 'dark';
  });

  // Apply dark mode class to root HTML element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('rajawali_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Authentication & Session
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const session = StorageService.getAuthSession();
    return Boolean(session && session.isAuthenticated);
  });

  // Current user & active tab
  const [currentUser, setCurrentUser] = useState<User>(() => StorageService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<string>('DASHBOARD');

  // Core Data State
  const [company, setCompany] = useState<CompanyProfile>(() => StorageService.getCompanyProfile());
  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [mrs, setMrs] = useState<MaterialRequest[]>(() => StorageService.getMRs());
  const [pos, setPos] = useState<PurchaseOrder[]>(() => StorageService.getPOs());
  const [dos, setDos] = useState<DeliveryOrder[]>(() => StorageService.getDOs());
  const [invoices, setInvoices] = useState<Invoice[]>(() => StorageService.getInvoices());
  const [returs, setReturs] = useState<Retur[]>(() => StorageService.getReturs());
  const [inventory, setInventory] = useState<InventoryItem[]>(() => StorageService.getInventory());
  const [vendors, setVendors] = useState<Vendor[]>(() => StorageService.getVendors());
  const [customers, setCustomers] = useState<CustomerClient[]>(() => StorageService.getCustomers());
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => StorageService.getAuditLogs());

  // Print modal state
  const [printState, setPrintState] = useState<{
    isOpen: boolean;
    docType: PrintableDocType;
    data: any;
  }>({
    isOpen: false,
    docType: 'PO',
    data: null
  });

  // Modal dialog states
  const [isMRModalOpen, setIsMRModalOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isDOModalOpen, setIsDOModalOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReturModalOpen, setIsReturModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isAdjustStockModalOpen, setIsAdjustStockModalOpen] = useState(false);
  const [isResetBlankModalOpen, setIsResetBlankModalOpen] = useState(false);

  // Selected item contexts for modals
  const [selectedMRForPO, setSelectedMRForPO] = useState<MaterialRequest | null>(null);
  const [selectedPOForDO, setSelectedPOForDO] = useState<PurchaseOrder | null>(null);
  const [selectedPOForInvoice, setSelectedPOForInvoice] = useState<PurchaseOrder | null>(null);
  const [selectedDOForRetur, setSelectedDOForRetur] = useState<DeliveryOrder | null>(null);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<Invoice | null>(null);
  const [selectedItemForAdjust, setSelectedItemForAdjust] = useState<InventoryItem | null>(null);

  // Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const refreshAllState = () => {
    setCompany(StorageService.getCompanyProfile());
    setUsers(StorageService.getUsers());
    setMrs(StorageService.getMRs());
    setPos(StorageService.getPOs());
    setDos(StorageService.getDOs());
    setInvoices(StorageService.getInvoices());
    setReturs(StorageService.getReturs());
    setInventory(StorageService.getInventory());
    setVendors(StorageService.getVendors());
    setCustomers(StorageService.getCustomers());
    setAuditLogs(StorageService.getAuditLogs());
  };

  // Real-time Firestore synchronization listener
  useEffect(() => {
    const unsubscribe = StorageService.subscribeToAllCollections(() => {
      refreshAllState();
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleLogin = (user: User) => {
    StorageService.setCurrentUser(user.id);
    StorageService.setAuthSession(user.id);
    setCurrentUser(user);
    setIsAuthenticated(true);
    const allowed = getUserEffectiveMenus(user);
    if (!allowed.includes(activeTab as any)) {
      setActiveTab(allowed[0] || 'DASHBOARD');
    }
    showToast(`Selamat datang di ERP PT. Rajawali Talenta Indonesia, ${user.name}`);
  };

  const handleLogout = () => {
    StorageService.clearAuthSession();
    setIsAuthenticated(false);
    showToast('Anda telah keluar dari sesi.');
  };

  const handleSwitchUser = (userOrId: User | string) => {
    const userId = typeof userOrId === 'string' ? userOrId : userOrId.id;
    StorageService.setCurrentUser(userId);
    StorageService.setAuthSession(userId);
    const u = StorageService.getCurrentUser();
    setCurrentUser(u);
    const allowed = getUserEffectiveMenus(u);
    if (!allowed.includes(activeTab as any)) {
      setActiveTab(allowed[0] || 'MR');
    }
    showToast(`Beralih peran ke ${u.name} (${u.role})`);
  };

  const handleConfirmResetBlank = () => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      showToast('Akses ditolak: Hanya Super Admin yang dapat mengosongkan total database.');
      return;
    }
    StorageService.resetToBlankDatabase();
    refreshAllState();
    const updatedUser = StorageService.getCurrentUser();
    setCurrentUser(updatedUser);
    setActiveTab('DASHBOARD');
    showToast('Database berhasil dikosongkan total (Zero Data). Siap untuk input data baru.');
  };

  // -------------------------------------------------------------
  // USER MANAGEMENT HANDLERS (RBAC)
  // -------------------------------------------------------------
  const handleAddUser = (userData: Omit<User, 'id'>) => {
    const created = StorageService.addUser(userData);
    refreshAllState();
    showToast(`Pengguna baru ${created.name} (${created.role}) berhasil ditambahkan`);
  };

  const handleUpdateUser = (updatedUser: User) => {
    const updated = StorageService.updateUser(updatedUser);
    if (updated) {
      refreshAllState();
      if (currentUser.id === updated.id) {
        setCurrentUser(updated);
      }
      showToast(`Data dan hak akses ${updated.name} berhasil diperbarui`);
    }
  };

  const handleDeleteUser = (userId: string) => {
    const success = StorageService.deleteUser(userId);
    if (success) {
      refreshAllState();
      showToast(`Pengguna berhasil dihapus`);
    }
  };

  // -------------------------------------------------------------
  // MATERIAL REQUEST HANDLERS
  // -------------------------------------------------------------
  const handleCreateMR = (mrData: Omit<MaterialRequest, 'id'>) => {
    const created = StorageService.saveMR(mrData);
    refreshAllState();
    showToast(`Material Request ${created.mrNumber} berhasil diajukan`);
  };

  const handleApproveMR = (mr: MaterialRequest) => {
    StorageService.updateMRStatus(mr.id, 'APPROVED', currentUser.name);
    refreshAllState();
    showToast(`MR ${mr.mrNumber} berhasil disetujui`);
  };

  const handleRejectMR = (mr: MaterialRequest) => {
    StorageService.updateMRStatus(mr.id, 'REJECTED', currentUser.name);
    refreshAllState();
    showToast(`MR ${mr.mrNumber} ditolak`);
  };

  const handleCreatePOFromMR = (mr: MaterialRequest) => {
    setSelectedMRForPO(mr);
    setIsPOModalOpen(true);
  };

  // -------------------------------------------------------------
  // PURCHASE ORDER HANDLERS
  // -------------------------------------------------------------
  const handleCreatePO = (poData: Omit<PurchaseOrder, 'id'> | Omit<PurchaseOrder, 'id'>[]) => {
    if (Array.isArray(poData)) {
      poData.forEach(p => StorageService.savePO(p));
      refreshAllState();
      showToast(`${poData.length} Purchase Order berhasil diterbitkan untuk masing-masing supplier!`);
    } else {
      const created = StorageService.savePO(poData);
      refreshAllState();
      showToast(`Purchase Order ${created.poNumber} berhasil diterbitkan`);
    }
  };

  const handleApprovePO = (po: PurchaseOrder) => {
    StorageService.updatePOStatus(po.id, 'APPROVED', currentUser.name);
    refreshAllState();
    showToast(`PO ${po.poNumber} telah disetujui & disahkan oleh Direksi`);
  };

  const handleCancelPO = (po: PurchaseOrder) => {
    StorageService.updatePOStatus(po.id, 'CANCELLED', currentUser.name);
    refreshAllState();
    showToast(`PO ${po.poNumber} telah dibatalkan`);
  };

  const handleGenerateDOFromPO = (po: PurchaseOrder) => {
    setSelectedPOForDO(po);
    setIsDOModalOpen(true);
  };

  const handleGenerateInvoiceFromPO = (po: PurchaseOrder) => {
    setSelectedPOForInvoice(po);
    setIsInvoiceModalOpen(true);
  };

  // -------------------------------------------------------------
  // DELIVERY ORDER / SURAT JALAN HANDLERS
  // -------------------------------------------------------------
  const handleCreateDO = (doData: Omit<DeliveryOrder, 'id'>) => {
    const created = StorageService.saveDO(doData);
    refreshAllState();
    showToast(`Surat Jalan ${created.doNumber} berhasil dicatat & stok bertambah`);
  };

  const handleConfirmDOReceipt = (doDoc: DeliveryOrder) => {
    StorageService.updateDOStatus(doDoc.id, 'RECEIVED_FULL', currentUser.name);
    refreshAllState();
    showToast(`Penerimaan barang Surat Jalan ${doDoc.doNumber} telah dikonfirmasi`);
  };

  const handleCreateReturFromDO = (doDoc: DeliveryOrder) => {
    setSelectedDOForRetur(doDoc);
    setIsReturModalOpen(true);
  };

  // -------------------------------------------------------------
  // INVOICING & PAYMENT HANDLERS
  // -------------------------------------------------------------
  const handleCreateInvoice = (invData: Omit<Invoice, 'id'>) => {
    const created = StorageService.saveInvoice(invData);
    refreshAllState();
    showToast(`Faktur Tagihan ${created.invoiceNumber} berhasil dicatat`);
  };

  const handleRecordPayment = (invoiceId: string, paymentData: any) => {
    StorageService.recordPayment(invoiceId, paymentData);
    refreshAllState();
    showToast(`Pembayaran tagihan invoice berhasil dicatat`);
  };

  // -------------------------------------------------------------
  // RETUR HANDLERS
  // -------------------------------------------------------------
  const handleCreateRetur = (returData: Omit<Retur, 'id'>) => {
    const created = StorageService.saveRetur(returData);
    refreshAllState();
    showToast(`Berita Acara Retur ${created.returNumber} berhasil diajukan`);
  };

  const handleResolveRetur = (retur: Retur) => {
    StorageService.updateReturStatus(retur.id, 'REFUNDED_REPLACED');
    refreshAllState();
    showToast(`Klaim Retur ${retur.returNumber} telah diselesaikan`);
  };

  // -------------------------------------------------------------
  // INVENTORY & MASTER DATA HANDLERS
  // -------------------------------------------------------------
  const handleAddInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'movements'>) => {
    const created = StorageService.saveInventoryItem(itemData);
    refreshAllState();
    showToast(`Item SKU ${created.itemCode} berhasil ditambahkan ke inventaris`);
  };

  const handleBulkAddInventoryItems = (itemsData: Omit<InventoryItem, 'id' | 'movements'>[]) => {
    const createdList = StorageService.saveInventoryItems(itemsData);
    refreshAllState();
    showToast(`Berhasil mengimpor ${createdList.length} item material baru ke inventaris via CSV`);
  };

  const handleAdjustStock = (itemId: string, adjustData: any) => {
    StorageService.adjustInventoryStock(
      itemId,
      adjustData.type,
      adjustData.qty,
      adjustData.referenceDoc,
      adjustData.operator,
      adjustData.notes
    );
    refreshAllState();
    showToast(`Penyesuaian stok berhasil diperbarui`);
  };

  const handleAddVendor = (vendorData: Omit<Vendor, 'id'>) => {
    const created = StorageService.saveVendor(vendorData);
    refreshAllState();
    showToast(`Vendor rekanan ${created.name} berhasil didaftarkan`);
  };

  const handleAddCustomer = (customerData: Omit<CustomerClient, 'id'>) => {
    const created = StorageService.saveCustomer(customerData);
    refreshAllState();
    showToast(`Klien proyek ${created.name} berhasil didaftarkan`);
  };

  const handleUpdateCompany = (updated: CompanyProfile) => {
    StorageService.saveCompanyProfile(updated);
    refreshAllState();
    showToast(`Profil & kop surat PT. Rajawali Talenta Indonesia diperbarui`);
  };

  const [searchQuery, setSearchQuery] = useState('');

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = StorageService.importDatabaseJSON(content);
        if (success) {
          refreshAllState();
          showToast("Database berhasil dipulihkan dari file backup");
        } else {
          showToast("Gagal memulihkan database. Format file tidak valid.");
        }
      }
    };
    reader.readAsText(file);
    // Reset file input value so user can upload same file again if desired
    e.target.value = '';
  };

  const handleExportJSON = () => {
    const dataStr = StorageService.exportDatabaseJSON();
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Rajawali_ERP_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("Backup database JSON berhasil diunduh");
  };

  // Print Document Trigger
  const triggerPrintDoc = (docType: PrintableDocType, data: any) => {
    setPrintState({
      isOpen: true,
      docType,
      data
    });
  };

  // Badge counts for sidebar
  const pendingMRCount = mrs.filter(m => m.status === 'PENDING_APPROVAL').length;
  const pendingPOCount = pos.filter(p => p.status === 'PENDING_APPROVAL').length;
  const inTransitDOCount = dos.filter(d => d.status === 'IN_TRANSIT').length;
  const unpaidInvoiceCount = invoices.filter(i => i.status === 'UNPAID' || i.status === 'OVERDUE').length;
  const pendingReturCount = returs.filter(r => r.status === 'PENDING').length;
  const lowStockCount = inventory.filter(i => i.currentStock <= i.minStock).length;

  // If user is not authenticated, show corporate Login Page
  if (!isAuthenticated) {
    return (
      <LoginPage
        company={company}
        users={users}
        onLogin={handleLogin}
        theme={theme}
        onToggleTheme={toggleTheme}
      />
    );
  }

  const handleSaveCompanySettings = (updated: CompanyProfile) => {
    StorageService.saveCompanyProfile(updated);
    setCompany(updated);
    refreshAllState();
    showToast('Pengaturan profil legalitas perusahaan berhasil disimpan dan disinkronkan ke seluruh sistem.');
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col font-sans text-slate-900 dark:text-slate-100 antialiased selection:bg-amber-500 selection:text-white transition-colors duration-200">
      
      {/* Printable Area (If printing modal is open) */}
      {printState.isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex flex-col items-center justify-start p-4 sm:p-8">
          
          {/* Print Toolbar (Hidden during browser print) */}
          <div className="no-print w-full max-w-4xl bg-slate-900 text-white px-6 py-3 rounded-2xl mb-4 flex items-center justify-between shadow-2xl border border-slate-700">
            <div className="flex items-center gap-3">
              <span className="font-serif font-black text-amber-400 text-sm tracking-wide">
                PT. RAJAWALI TALENTA INDONESIA
              </span>
              <span className="text-slate-400 text-xs">
                | Format Cetak Dokumen Resmi A4 (Siap Print)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-trigger-browser-print"
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan PDF</span>
              </button>

              <button
                onClick={() => setPrintState({ ...printState, isOpen: false })}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Actual Letterhead Official Document */}
          <div className="w-full flex justify-center pb-12">
            <PrintDocument
              docType={printState.docType}
              data={printState.data}
              company={company}
              onClose={() => setPrintState({ ...printState, isOpen: false })}
            />
          </div>

        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-800 text-white px-5 py-3 rounded-2xl shadow-2xl border border-amber-500/30 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <div className="no-print">
        <Navbar
          company={company}
          currentUser={currentUser}
          users={users}
          onSwitchUser={handleSwitchUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          pendingApprovalsCount={pendingMRCount + pendingPOCount}
          lowStockCount={lowStockCount}
          onOpenResetBlankModal={() => setIsResetBlankModalOpen(true)}
          onLogout={handleLogout}
          onExportData={handleExportJSON}
          onImportData={handleImportJSON}
          onOpenMR={() => { setSelectedMRForPO(null); setIsMRModalOpen(true); }}
          onOpenPO={() => { setSelectedMRForPO(null); setIsPOModalOpen(true); }}
          theme={theme}
          onToggleTheme={toggleTheme}
          onNavigate={(tab) => setActiveTab(tab)}
        />
      </div>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 sm:p-6 gap-6 no-print">
        
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab as any}
          onSelectTab={(tab) => setActiveTab(tab)}
          currentUser={currentUser}
          counts={{
            mrPending: pendingMRCount,
            poPending: pendingPOCount,
            doActive: inTransitDOCount,
            invoiceUnpaid: unpaidInvoiceCount,
            lowStock: lowStockCount
          }}
          pendingMRCount={pendingMRCount}
          pendingPOCount={pendingPOCount}
          inTransitDOCount={inTransitDOCount}
          unpaidInvoiceCount={unpaidInvoiceCount}
          pendingReturCount={pendingReturCount}
          lowStockCount={lowStockCount}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Dynamic Content View Container */}
        <main className="flex-1 min-w-0">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'DASHBOARD' && (
            <DashboardView
              currentUser={currentUser}
              company={company}
              mrs={mrs}
              pos={pos}
              dos={dos}
              invoices={invoices}
              returs={returs}
              inventory={inventory}
              auditLogs={auditLogs}
              onNavigate={(tab) => setActiveTab(tab)}
              onOpenCreateMR={() => setIsMRModalOpen(true)}
              onOpenCreatePO={() => { setSelectedMRForPO(null); setIsPOModalOpen(true); }}
              onOpenCreateDO={() => { setSelectedPOForDO(null); setIsDOModalOpen(true); }}
              onOpenCreateInvoice={() => { setSelectedPOForInvoice(null); setIsInvoiceModalOpen(true); }}
              onOpenMRModal={() => setIsMRModalOpen(true)}
              onOpenPOModal={() => { setSelectedMRForPO(null); setIsPOModalOpen(true); }}
              onOpenDOModal={() => { setSelectedPOForDO(null); setIsDOModalOpen(true); }}
              onOpenInvoiceModal={() => { setSelectedPOForInvoice(null); setIsInvoiceModalOpen(true); }}
              onPrintDoc={triggerPrintDoc}
              onApprovePO={handleApprovePO}
              onApproveMR={handleApproveMR}
            />
          )}

          {/* TAB 2: MATERIAL REQUEST */}
          {activeTab === 'MR' && (
            <MRView
              currentUser={currentUser}
              mrs={mrs}
              onOpenCreateMR={() => setIsMRModalOpen(true)}
              onPrintMR={(mr) => triggerPrintDoc('MR', mr)}
              onApproveMR={handleApproveMR}
              onRejectMR={handleRejectMR}
              onCreatePOFromMR={handleCreatePOFromMR}
            />
          )}

          {/* TAB 3: PURCHASE ORDER */}
          {activeTab === 'PO' && (
            <POView
              currentUser={currentUser}
              pos={pos}
              onOpenCreatePO={() => { setSelectedMRForPO(null); setIsPOModalOpen(true); }}
              onPrintPO={(po) => triggerPrintDoc('PO', po)}
              onApprovePO={handleApprovePO}
              onCancelPO={handleCancelPO}
              onGenerateDOFromPO={handleGenerateDOFromPO}
              onGenerateInvoiceFromPO={handleGenerateInvoiceFromPO}
            />
          )}

          {/* TAB 4: DELIVERY ORDER / SURAT JALAN */}
          {activeTab === 'DO' && (
            <DOView
              currentUser={currentUser}
              dos={dos}
              onOpenCreateDO={() => { setSelectedPOForDO(null); setIsDOModalOpen(true); }}
              onPrintDO={(doDoc) => triggerPrintDoc('DO', doDoc)}
              onConfirmReceipt={handleConfirmDOReceipt}
              onCreateReturFromDO={handleCreateReturFromDO}
            />
          )}

          {/* TAB 5: INVOICE / FAKTUR */}
          {activeTab === 'INVOICE' && (
            <InvoiceView
              currentUser={currentUser}
              invoices={invoices}
              onOpenCreateInvoice={() => { setSelectedPOForInvoice(null); setIsInvoiceModalOpen(true); }}
              onPrintInvoice={(inv) => triggerPrintDoc('INVOICE', inv)}
              onOpenPaymentModal={(inv) => {
                setSelectedInvoiceForPayment(inv);
                setIsPaymentModalOpen(true);
              }}
            />
          )}

          {/* TAB: HUTANG USAHA (ACCOUNTS PAYABLE - PO) */}
          {activeTab === 'HUTANG' && (
            <HutangView
              currentUser={currentUser}
              onRefresh={refreshAllState}
            />
          )}

          {/* TAB: PIUTANG USAHA (ACCOUNTS RECEIVABLE - DO) */}
          {activeTab === 'PIUTANG' && (
            <PiutangView
              currentUser={currentUser}
              onRefresh={refreshAllState}
            />
          )}

          {/* TAB: KAS & BANK (UPDATE SALDO & MUTASI) */}
          {activeTab === 'KAS_BANK' && (
            <KasBankView
              currentUser={currentUser}
              onRefresh={refreshAllState}
            />
          )}

          {/* TAB 6: RETUR BARANG */}
          {activeTab === 'RETUR' && (
            <ReturView
              currentUser={currentUser}
              returs={returs}
              onOpenCreateRetur={() => { setSelectedDOForRetur(null); setIsReturModalOpen(true); }}
              onPrintRetur={(retur) => triggerPrintDoc('RETUR', retur)}
              onResolveRetur={handleResolveRetur}
            />
          )}

          {/* TAB 7: INVENTARIS & GUDANG */}
          {activeTab === 'INVENTORY' && (
            <InventoryView
              currentUser={currentUser}
              inventory={inventory}
              onOpenAddItem={() => setIsAddItemModalOpen(true)}
              onBulkImport={handleBulkAddInventoryItems}
              onOpenAdjustStock={(item) => {
                setSelectedItemForAdjust(item);
                setIsAdjustStockModalOpen(true);
              }}
            />
          )}

          {/* TAB 8: MASTER DATA */}
          {activeTab === 'MASTER_DATA' && (
            <MasterDataView
              company={company}
              vendors={vendors}
              customers={customers}
              onAddVendor={handleAddVendor}
              onAddCustomer={handleAddCustomer}
              onUpdateCompany={handleUpdateCompany}
            />
          )}

          {/* TAB 9: AUDIT LOG */}
          {activeTab === 'AUDIT_LOG' && (
            <AuditLogView logs={auditLogs} />
          )}

          {/* TAB 10: USER MANAGEMENT (RBAC) */}
          {activeTab === 'USERS' && (
            <UserManagementView
              currentUser={currentUser}
              users={users}
              onAddUser={handleAddUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
            />
          )}

          {/* TAB 11: COMPANY SETTINGS (SUPER ADMIN) */}
          {activeTab === 'COMPANY_SETTINGS' && (
            <CompanySettingsView
              currentUser={currentUser}
              company={company}
              onSaveCompany={handleSaveCompanySettings}
              onPreviewPrint={(comp) => {
                setCompany(comp);
                triggerPrintDoc('PO', pos[0] || null);
              }}
            />
          )}

        </main>
      </div>

      {/* ALL MODAL FORMS */}
      <CreateMRModal
        isOpen={isMRModalOpen}
        onClose={() => setIsMRModalOpen(false)}
        onSubmit={handleCreateMR}
        currentUser={currentUser}
        inventory={inventory}
        existingMRCount={mrs.length}
      />

      <CreatePOModal
        isOpen={isPOModalOpen}
        onClose={() => { setIsPOModalOpen(false); setSelectedMRForPO(null); }}
        onSubmit={handleCreatePO}
        currentUser={currentUser}
        vendors={vendors}
        inventory={inventory}
        mrs={mrs}
        existingPOCount={pos.length}
        initialMR={selectedMRForPO}
      />

      <CreateDOModal
        isOpen={isDOModalOpen}
        onClose={() => { setIsDOModalOpen(false); setSelectedPOForDO(null); }}
        onSubmit={handleCreateDO}
        currentUser={currentUser}
        pos={pos}
        existingDOCount={dos.length}
        initialPO={selectedPOForDO}
      />

      <CreateInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => { setIsInvoiceModalOpen(false); setSelectedPOForInvoice(null); }}
        onSubmit={handleCreateInvoice}
        pos={pos}
        existingInvoiceCount={invoices.length}
        initialPO={selectedPOForInvoice}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => { setIsPaymentModalOpen(false); setSelectedInvoiceForPayment(null); }}
        invoice={selectedInvoiceForPayment}
        onRecordPayment={handleRecordPayment}
        currentUser={currentUser}
      />

      <CreateReturModal
        isOpen={isReturModalOpen}
        onClose={() => { setIsReturModalOpen(false); setSelectedDOForRetur(null); }}
        onSubmit={handleCreateRetur}
        currentUser={currentUser}
        pos={pos}
        existingReturCount={returs.length}
        initialDO={selectedDOForRetur}
      />

      <AddInventoryItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onSubmit={handleAddInventoryItem}
        onBulkImport={handleBulkAddInventoryItems}
      />

      <AdjustStockModal
        isOpen={isAdjustStockModalOpen}
        onClose={() => { setIsAdjustStockModalOpen(false); setSelectedItemForAdjust(null); }}
        item={selectedItemForAdjust}
        onAdjustStock={handleAdjustStock}
        currentUser={currentUser}
      />

      <ResetBlankModal
        isOpen={isResetBlankModalOpen}
        currentUser={currentUser}
        onClose={() => setIsResetBlankModalOpen(false)}
        onConfirmResetBlank={handleConfirmResetBlank}
      />

    </div>
  );
}
