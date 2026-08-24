import {
  MaterialRequest,
  PurchaseOrder,
  DeliveryOrder,
  Invoice,
  Retur,
  InventoryItem,
  Vendor,
  CustomerClient,
  AuditLog,
  User,
  UserRole,
  CompanyProfile,
  PaymentRecord,
  PayableRecord,
  ReceivableRecord,
  BankAccount,
  CashTransaction
} from '../types';
import {
  COMPANY_PROFILE,
  INITIAL_USERS,
  INITIAL_VENDORS,
  INITIAL_CUSTOMERS,
  INITIAL_INVENTORY,
  INITIAL_MRS,
  INITIAL_POS,
  INITIAL_DOS,
  INITIAL_INVOICES,
  INITIAL_PAYABLES,
  INITIAL_RECEIVABLES,
  INITIAL_BANK_ACCOUNTS,
  INITIAL_CASH_TRANSACTIONS,
  INITIAL_RETURS,
  INITIAL_AUDIT_LOGS
} from './initialData';
import { getCurrentTimestamp } from './utils';
import { 
  FIRESTORE_COLLECTIONS, 
  saveDocToFirestore, 
  deleteDocFromFirestore, 
  batchSaveToFirestore, 
  clearFirestoreCollection,
  subscribeCollection
} from './firebase';

const KEYS = {
  COMPANY: 'rajawali_company_profile',
  USERS: 'rajawali_users',
  CURRENT_USER: 'rajawali_current_user',
  VENDORS: 'rajawali_vendors',
  CUSTOMERS: 'rajawali_customers',
  INVENTORY: 'rajawali_inventory',
  MRS: 'rajawali_mrs',
  POS: 'rajawali_pos',
  DOS: 'rajawali_dos',
  INVOICES: 'rajawali_invoices',
  PAYABLES: 'rajawali_payables',
  RECEIVABLES: 'rajawali_receivables',
  BANK_ACCOUNTS: 'rajawali_bank_accounts',
  CASH_TRANSACTIONS: 'rajawali_cash_transactions',
  RETURS: 'rajawali_returs',
  AUDIT_LOGS: 'rajawali_audit_logs',
};

// Automatic cleanup of legacy mock/sample data
const CLEAN_VERSION_KEY = 'rajawali_zero_data_v1';
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const isCleaned = localStorage.getItem(CLEAN_VERSION_KEY);
    if (!isCleaned) {
      localStorage.removeItem(KEYS.VENDORS);
      localStorage.removeItem(KEYS.CUSTOMERS);
      localStorage.removeItem(KEYS.INVENTORY);
      localStorage.removeItem(KEYS.MRS);
      localStorage.removeItem(KEYS.POS);
      localStorage.removeItem(KEYS.DOS);
      localStorage.removeItem(KEYS.INVOICES);
      localStorage.removeItem(KEYS.RETURS);
      localStorage.removeItem(KEYS.AUDIT_LOGS);
      localStorage.setItem(CLEAN_VERSION_KEY, 'true');
    }
  } catch {
    // Ignore in SSR
  }
}

function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (err) {
    console.error(`Error loading key ${key}:`, err);
    return fallback;
  }
}

function setLocal<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Error saving key ${key}:`, err);
  }
}

export const StorageService = {
  getCompany: (): CompanyProfile => getLocal(KEYS.COMPANY, COMPANY_PROFILE),
  getCompanyProfile: (): CompanyProfile => getLocal(KEYS.COMPANY, COMPANY_PROFILE),
  saveCompany: (data: CompanyProfile) => {
    setLocal(KEYS.COMPANY, data);
    saveDocToFirestore('company', { id: 'main_profile', ...data }).catch(() => {});
  },
  saveCompanyProfile: (data: CompanyProfile) => {
    setLocal(KEYS.COMPANY, data);
    saveDocToFirestore('company', { id: 'main_profile', ...data }).catch(() => {});
    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'SYSTEM',
      action: 'UPDATE_COMPANY_PROFILE',
      details: `Super Admin memperbarui konfigurasi & profil legalitas perusahaan: ${data.name}`
    });
  },

  getUsers: (): User[] => {
    const raw = getLocal<User[]>(KEYS.USERS, INITIAL_USERS);
    const validRoles: UserRole[] = ['SUPER_ADMIN', 'ADMIN_HO', 'MANAGER_HO', 'KBB_PURCHASING'];
    return raw.map((u, idx) => {
      let role = u.role;
      if (!validRoles.includes(role)) {
        if ((role as any) === 'ADMIN') role = 'SUPER_ADMIN';
        else if ((role as any) === 'PROCUREMENT') role = 'KBB_PURCHASING';
        else if ((role as any) === 'DIRECTOR') role = 'MANAGER_HO';
        else role = 'ADMIN_HO';
      }
      
      const defaultPassword = role === 'SUPER_ADMIN' ? 'superadmin123' : 'admin123';
      const defaultUsername = u.email ? u.email.split('@')[0] : `user${idx + 1}`;

      return {
        ...u,
        name: u.name || `User ${idx + 1}`,
        role,
        password: u.password || defaultPassword,
        username: u.username || defaultUsername
      };
    });
  },
  saveUsers: (users: User[]) => {
    setLocal(KEYS.USERS, users);
    batchSaveToFirestore(FIRESTORE_COLLECTIONS.USERS, users).catch(() => {});
  },
  getCurrentUser: (): User => {
    const stored = getLocal<User | null>(KEYS.CURRENT_USER, null);
    const users = StorageService.getUsers();
    if (stored) {
      const matched = users.find(u => u.id === stored.id);
      if (matched) return matched;
    }
    return users[0] || INITIAL_USERS[0];
  },
  setCurrentUser: (userIdOrUser: string | User) => {
    if (typeof userIdOrUser === 'string') {
      const users = StorageService.getUsers();
      const match = users.find(u => u.id === userIdOrUser) || users[0] || INITIAL_USERS[0];
      setLocal(KEYS.CURRENT_USER, match);
    } else {
      const users = StorageService.getUsers();
      const match = users.find(u => u.id === userIdOrUser.id) || userIdOrUser;
      setLocal(KEYS.CURRENT_USER, match);
    }
  },
  addUser: (userData: Omit<User, 'id'>): User => {
    const users = StorageService.getUsers();
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`
    };
    const updated = [...users, newUser];
    StorageService.saveUsers(updated);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.USERS, newUser).catch(() => {});
    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'USERS',
      action: 'ADD_USER',
      docNumber: newUser.name,
      details: `Menambahkan pengguna baru: ${newUser.name} (${newUser.role})`
    });
    return newUser;
  },
  updateUser: (user: User): User => {
    const users = StorageService.getUsers();
    const updated = users.map(u => u.id === user.id ? { ...u, ...user } : u);
    StorageService.saveUsers(updated);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.USERS, user).catch(() => {});
    const current = StorageService.getCurrentUser();
    if (current.id === user.id) {
      setLocal(KEYS.CURRENT_USER, { ...current, ...user });
    }
    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: user.name,
      role: user.role,
      module: 'USERS',
      action: 'UPDATE_USER',
      docNumber: user.name,
      details: `Memperbarui data & nama pengguna: ${user.name} (${user.role})`
    });
    return user;
  },
  deleteUser: (userId: string): boolean => {
    const users = StorageService.getUsers();
    const target = users.find(u => u.id === userId);
    const updated = users.filter(u => u.id !== userId);
    StorageService.saveUsers(updated);
    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.USERS, userId).catch(() => {});
    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'USERS',
      action: 'DELETE_USER',
      docNumber: target?.name || userId,
      details: `Menghapus pengguna: ${target?.name || userId}`
    });
    return true;
  },

  // VENDORS
  getVendors: (): Vendor[] => getLocal(KEYS.VENDORS, INITIAL_VENDORS),
  saveVendors: (data: Vendor[]) => {
    setLocal(KEYS.VENDORS, data);
    batchSaveToFirestore(FIRESTORE_COLLECTIONS.VENDORS, data).catch(() => {});
  },
  saveVendor: (vendor: Omit<Vendor, 'id'>): Vendor => {
    const vendors = StorageService.getVendors();
    const newVendor: Vendor = {
      ...vendor,
      id: `vnd-${Date.now()}`
    };
    StorageService.saveVendors([newVendor, ...vendors]);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.VENDORS, newVendor).catch(() => {});
    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'MASTER_DATA',
      action: 'ADD_VENDOR',
      docNumber: newVendor.code,
      details: `Menambahkan vendor baru: ${newVendor.name}`
    });
    return newVendor;
  },
  deleteVendor: (vendorId: string) => {
    const vendors = StorageService.getVendors().filter(v => v.id !== vendorId);
    setLocal(KEYS.VENDORS, vendors);
    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.VENDORS, vendorId).catch(() => {});
  },

  // CUSTOMERS / CLIENTS
  getCustomers: (): CustomerClient[] => getLocal(KEYS.CUSTOMERS, INITIAL_CUSTOMERS),
  saveCustomers: (data: CustomerClient[]) => {
    setLocal(KEYS.CUSTOMERS, data);
    batchSaveToFirestore(FIRESTORE_COLLECTIONS.CUSTOMERS, data).catch(() => {});
  },
  saveCustomer: (customer: Omit<CustomerClient, 'id'>): CustomerClient => {
    const customers = StorageService.getCustomers();
    const newCustomer: CustomerClient = {
      ...customer,
      id: `cli-${Date.now()}`
    };
    StorageService.saveCustomers([newCustomer, ...customers]);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.CUSTOMERS, newCustomer).catch(() => {});
    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'MASTER_DATA',
      action: 'ADD_CUSTOMER',
      docNumber: newCustomer.code,
      details: `Menambahkan klien proyek: ${newCustomer.name}`
    });
    return newCustomer;
  },
  deleteCustomer: (customerId: string) => {
    const customers = StorageService.getCustomers().filter(c => c.id !== customerId);
    setLocal(KEYS.CUSTOMERS, customers);
    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.CUSTOMERS, customerId).catch(() => {});
  },

  // INVENTORY
  getInventory: (): InventoryItem[] => getLocal(KEYS.INVENTORY, INITIAL_INVENTORY),
  saveInventory: (data: InventoryItem[]) => {
    setLocal(KEYS.INVENTORY, data);
    batchSaveToFirestore(FIRESTORE_COLLECTIONS.INVENTORY, data).catch(() => {});
  },
  saveInventoryItem: (item: Omit<InventoryItem, 'id' | 'movements'>): InventoryItem => {
    const inventory = StorageService.getInventory();
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      movements: [
        {
          id: `mov-${Date.now()}`,
          date: getCurrentTimestamp(),
          type: 'IN',
          qty: item.currentStock,
          balanceAfter: item.currentStock,
          referenceDoc: 'INITIAL_STOCK',
          operator: StorageService.getCurrentUser().name,
          notes: 'Pencatatan saldo awal katalog SKU'
        }
      ]
    };
    StorageService.saveInventory([newItem, ...inventory]);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.INVENTORY, newItem).catch(() => {});
    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'INVENTORY',
      action: 'ADD_SKU',
      docNumber: newItem.itemCode,
      details: `Menambahkan katalog SKU: ${newItem.name}`
    });
    return newItem;
  },
  saveInventoryItems: (items: Omit<InventoryItem, 'id' | 'movements'>[]): InventoryItem[] => {
    const inventory = StorageService.getInventory();
    const now = Date.now();
    const newItems: InventoryItem[] = items.map((item, idx) => ({
      ...item,
      id: `inv-${now}-${idx}`,
      movements: [
        {
          id: `mov-${now}-${idx}`,
          date: getCurrentTimestamp(),
          type: 'IN',
          qty: item.currentStock,
          balanceAfter: item.currentStock,
          referenceDoc: 'CSV_IMPORT',
          operator: StorageService.getCurrentUser().name,
          notes: 'Impor massal dari CSV'
        }
      ]
    }));
    StorageService.saveInventory([...newItems, ...inventory]);
    batchSaveToFirestore(FIRESTORE_COLLECTIONS.INVENTORY, newItems).catch(() => {});
    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'INVENTORY',
      action: 'BULK_IMPORT_SKU',
      docNumber: `CSV-${newItems.length}-ITEMS`,
      details: `Mengimpor massal ${newItems.length} item material ke inventaris gudang via CSV`
    });
    return newItems;
  },
  adjustInventoryStock: (
    itemId: string,
    adjustmentOrType: any,
    qty?: number,
    referenceDoc?: string,
    operator?: string,
    notes?: string
  ): InventoryItem | null => {
    const inventory = StorageService.getInventory();
    const itemIndex = inventory.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return null;

    const item = inventory[itemIndex];
    let newStock = item.currentStock;

    let adjType: 'IN' | 'OUT' | 'ADJUSTMENT' = 'ADJUSTMENT';
    let adjQty = 0;
    let adjRef = referenceDoc || 'STOCK_ADJUST';
    let adjNotes = notes || 'Penyesuaian stok manual';

    if (typeof adjustmentOrType === 'object') {
      adjType = adjustmentOrType.type;
      adjQty = adjustmentOrType.qty;
      adjRef = adjustmentOrType.referenceDoc || adjRef;
      adjNotes = adjustmentOrType.notes || adjNotes;
    } else {
      adjType = adjustmentOrType;
      adjQty = qty || 0;
    }

    if (adjType === 'IN') {
      newStock += adjQty;
    } else if (adjType === 'OUT') {
      newStock = Math.max(0, newStock - adjQty);
    } else if (adjType === 'ADJUSTMENT') {
      newStock = adjQty;
    }

    const newMovement = {
      id: `mov-${Date.now()}`,
      date: getCurrentTimestamp(),
      type: adjType,
      qty: adjQty,
      balanceAfter: newStock,
      referenceDoc: adjRef,
      operator: operator || StorageService.getCurrentUser().name,
      notes: adjNotes
    };

    const updatedItem: InventoryItem = {
      ...item,
      currentStock: newStock,
      availableStock: Math.max(0, newStock - item.reservedStock),
      movements: [newMovement, ...(item.movements || [])]
    };

    inventory[itemIndex] = updatedItem;
    StorageService.saveInventory(inventory);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.INVENTORY, updatedItem).catch(() => {});

    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: operator || StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'INVENTORY',
      action: `STOCK_${adjType}`,
      docNumber: item.itemCode,
      details: `Penyesuaian stok ${item.name} (${adjType} ${adjQty} ${item.unit}), Saldo akhir: ${newStock}`
    });

    return updatedItem;
  },

  // MATERIAL REQUEST (MR)
  getMRs: (): MaterialRequest[] => getLocal(KEYS.MRS, INITIAL_MRS),
  saveMRs: (data: MaterialRequest[]) => {
    setLocal(KEYS.MRS, data);
    batchSaveToFirestore(FIRESTORE_COLLECTIONS.MRS, data).catch(() => {});
  },
  saveMR: (mrData: Omit<MaterialRequest, 'id'> | MaterialRequest): MaterialRequest => {
    if ('id' in mrData && mrData.id) {
      const mrs = StorageService.getMRs();
      const updated = mrs.map(m => m.id === mrData.id ? { ...m, ...mrData } : m);
      StorageService.saveMRs(updated);
      saveDocToFirestore(FIRESTORE_COLLECTIONS.MRS, mrData as MaterialRequest).catch(() => {});
      return mrData as MaterialRequest;
    }
    return StorageService.createMR(mrData as Omit<MaterialRequest, 'id' | 'mrNumber' | 'status'>);
  },
  updateMRStatus: (mrId: string, status: any, approvedBy?: string): MaterialRequest | null => {
    const mrs = StorageService.getMRs();
    const mr = mrs.find(m => m.id === mrId);
    if (!mr) return null;

    mr.status = status;
    if (status === 'APPROVED') {
      mr.approvedBy = approvedBy || StorageService.getCurrentUser().name;
      mr.approvedAt = getCurrentTimestamp();
    }
    StorageService.saveMRs(mrs);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.MRS, mr).catch(() => {});
    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: approvedBy || StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'MR',
      action: `UPDATE_STATUS_${status}`,
      docNumber: mr.mrNumber,
      details: `Mengubah status MR ${mr.mrNumber} menjadi ${status}`
    });
    return mr;
  },
  createMR: (mrData: Omit<MaterialRequest, 'id' | 'mrNumber' | 'status'>): MaterialRequest => {
    const mrs = StorageService.getMRs();
    const count = mrs.length + 1;
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const mrNumber = `MR-${year}-${month}-${String(count).padStart(3, '0')}`;

    const newMR: MaterialRequest = {
      ...mrData,
      id: `mr-${Date.now()}`,
      mrNumber,
      status: 'PENDING_APPROVAL'
    };

    StorageService.saveMRs([newMR, ...mrs]);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.MRS, newMR).catch(() => {});
    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'MR',
      action: 'CREATE_MR',
      docNumber: newMR.mrNumber,
      details: `Membuat Material Request baru untuk proyek ${newMR.project} (${newMR.items.length} item)`
    });

    return newMR;
  },
  approveMR: (mrId: string): MaterialRequest | null => {
    const mrs = StorageService.getMRs();
    const mr = mrs.find(m => m.id === mrId);
    if (!mr) return null;

    const user = StorageService.getCurrentUser();
    mr.status = 'APPROVED';
    mr.approvedBy = user.name;
    mr.approvedAt = getCurrentTimestamp();

    StorageService.saveMRs(mrs);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.MRS, mr).catch(() => {});
    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: user.name,
      role: user.role,
      module: 'MR',
      action: 'APPROVE_MR',
      docNumber: mr.mrNumber,
      details: `Menyetujui Material Request ${mr.mrNumber} (${mr.items.length} item)`
    });

    return mr;
  },
  rejectMR: (mrId: string, reason: string): MaterialRequest | null => {
    const mrs = StorageService.getMRs();
    const mr = mrs.find(m => m.id === mrId);
    if (!mr) return null;

    const user = StorageService.getCurrentUser();
    mr.status = 'REJECTED';
    mr.rejectionReason = reason;

    StorageService.saveMRs(mrs);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.MRS, mr).catch(() => {});
    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: user.name,
      role: user.role,
      module: 'MR',
      action: 'REJECT_MR',
      docNumber: mr.mrNumber,
      details: `Menolak Material Request ${mr.mrNumber}: ${reason}`
    });

    return mr;
  },

  // PURCHASE ORDER (PO)
  getPOs: (): PurchaseOrder[] => getLocal(KEYS.POS, INITIAL_POS),
  savePOs: (data: PurchaseOrder[]) => {
    setLocal(KEYS.POS, data);
    batchSaveToFirestore(FIRESTORE_COLLECTIONS.POS, data).catch(() => {});
  },
  savePO: (poData: Omit<PurchaseOrder, 'id'> | PurchaseOrder): PurchaseOrder => {
    if ('id' in poData && poData.id) {
      const pos = StorageService.getPOs();
      const updated = pos.map(p => p.id === poData.id ? { ...p, ...poData } : p);
      StorageService.savePOs(updated);
      saveDocToFirestore(FIRESTORE_COLLECTIONS.POS, poData as PurchaseOrder).catch(() => {});
      return poData as PurchaseOrder;
    }
    return StorageService.createPO(poData as Omit<PurchaseOrder, 'id' | 'poNumber' | 'status'>);
  },
  updatePOStatus: (poId: string, status: any, approvedBy?: string): PurchaseOrder | null => {
    const pos = StorageService.getPOs();
    const po = pos.find(p => p.id === poId);
    if (!po) return null;

    po.status = status;
    if (status === 'APPROVED') {
      po.approvedBy = approvedBy || StorageService.getCurrentUser().name;
      po.approvedAt = getCurrentTimestamp();
    }
    StorageService.savePOs(pos);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.POS, po).catch(() => {});
    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: approvedBy || StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'PO',
      action: `UPDATE_STATUS_${status}`,
      docNumber: po.poNumber,
      details: `Mengubah status PO ${po.poNumber} menjadi ${status}`
    });
    return po;
  },
  createPO: (poData: Omit<PurchaseOrder, 'id' | 'poNumber' | 'status'>): PurchaseOrder => {
    const pos = StorageService.getPOs();
    const count = pos.length + 1;
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const poNumber = `PO-${year}-${month}-${String(count).padStart(3, '0')}`;

    const newPO: PurchaseOrder = {
      ...poData,
      id: `po-${Date.now()}`,
      poNumber,
      status: 'APPROVED'
    };

    StorageService.savePOs([newPO, ...pos]);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.POS, newPO).catch(() => {});

    // Auto-create Accounts Payable (Hutang Usaha) for the PO
    const vendors = StorageService.getVendors();
    const vendorObj = vendors.find(v => v.id === newPO.vendorId || v.name === newPO.vendorName);
    const payables = StorageService.getPayables();
    const apCount = payables.length + 1;
    const apNumber = `AP-${year}-${month}-${String(apCount).padStart(3, '0')}`;
    
    const newPayable: PayableRecord = {
      id: `ap-${Date.now()}`,
      payableNumber: apNumber,
      poId: newPO.id,
      poNumber: newPO.poNumber,
      vendorId: newPO.vendorId,
      vendorName: newPO.vendorName,
      vendorPic: newPO.vendorPic || vendorObj?.picName || '-',
      vendorPhone: newPO.vendorPhone || vendorObj?.picPhone || vendorObj?.phone || '-',
      vendorBank: vendorObj?.bankName || '-',
      vendorBankAccount: vendorObj?.bankAccount || '-',
      vendorBankHolder: vendorObj?.bankHolder || '-',
      orderDate: newPO.orderDate,
      dueDate: newPO.paymentTerms ? new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0] : newPO.orderDate,
      subtotal: newPO.subtotal,
      shippingCost: newPO.shippingCost || 0,
      taxAmount: newPO.taxAmount || 0,
      discountAmount: newPO.discountAmount || 0,
      totalAmount: newPO.grandTotal, // total harga beli + ongkir + pajak
      paidAmount: 0,
      balanceDue: newPO.grandTotal,
      status: 'UNPAID',
      payments: [],
      notes: `Hutang Purchase Order ${newPO.poNumber} kepada ${newPO.vendorName}`,
      createdAt: getCurrentTimestamp()
    };
    StorageService.savePayables([newPayable, ...payables]);

    // Update source MR status if referenced
    if (newPO.mrReference) {
      const mrs = StorageService.getMRs();
      const sourceMR = mrs.find(m => m.mrNumber === newPO.mrReference);
      if (sourceMR) {
        sourceMR.status = 'PO_CREATED';
        sourceMR.poNumberGenerated = newPO.poNumber;
        StorageService.saveMRs(mrs);
        saveDocToFirestore(FIRESTORE_COLLECTIONS.MRS, sourceMR).catch(() => {});
      }
    }

    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'PO',
      action: 'CREATE_PO',
      docNumber: newPO.poNumber,
      details: `Menerbitkan Purchase Order ${newPO.poNumber} ke ${newPO.vendorName} total Rp ${newPO.grandTotal.toLocaleString('id-ID')} (Tercatat Hutang Usaha ${apNumber})`
    });

    return newPO;
  },
  approvePO: (poId: string): PurchaseOrder | null => {
    const pos = StorageService.getPOs();
    const po = pos.find(p => p.id === poId);
    if (!po) return null;

    const user = StorageService.getCurrentUser();
    po.status = 'APPROVED';
    po.approvedBy = user.name;
    po.approvedAt = getCurrentTimestamp();

    StorageService.savePOs(pos);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.POS, po).catch(() => {});
    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: user.name,
      role: user.role,
      module: 'PO',
      action: 'APPROVE_PO',
      docNumber: po.poNumber,
      details: `Otorisasi & persetujuan final PO ${po.poNumber} senilai Rp ${po.grandTotal.toLocaleString('id-ID')}`
    });

    return po;
  },

  // DELIVERY ORDER / SURAT JALAN (DO)
  getDOs: (): DeliveryOrder[] => getLocal(KEYS.DOS, INITIAL_DOS),
  saveDOs: (data: DeliveryOrder[]) => {
    setLocal(KEYS.DOS, data);
    batchSaveToFirestore(FIRESTORE_COLLECTIONS.DOS, data).catch(() => {});
  },
  saveDO: (doData: Omit<DeliveryOrder, 'id'> | DeliveryOrder): DeliveryOrder => {
    if ('id' in doData && doData.id) {
      const dos = StorageService.getDOs();
      const updated = dos.map(d => d.id === doData.id ? { ...d, ...doData } : d);
      StorageService.saveDOs(updated);
      saveDocToFirestore(FIRESTORE_COLLECTIONS.DOS, doData as DeliveryOrder).catch(() => {});
      return doData as DeliveryOrder;
    }
    return StorageService.createDO(doData as Omit<DeliveryOrder, 'id'>);
  },
  updateDOStatus: (doId: string, status: any, receivedBy?: string): DeliveryOrder | null => {
    const dos = StorageService.getDOs();
    const doDoc = dos.find(d => d.id === doId);
    if (!doDoc) return null;

    doDoc.status = status;
    if (status === 'RECEIVED_FULL' || status === 'RECEIVED_PARTIAL') {
      doDoc.receivedBy = receivedBy || StorageService.getCurrentUser().name;
      doDoc.receivedDate = getCurrentTimestamp();
    }
    StorageService.saveDOs(dos);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.DOS, doDoc).catch(() => {});
    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: receivedBy || StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'DO',
      action: `UPDATE_STATUS_${status}`,
      docNumber: doDoc.doNumber,
      details: `Mengonfirmasi status Surat Jalan ${doDoc.doNumber} menjadi ${status}`
    });
    return doDoc;
  },
  createDO: (doData: Omit<DeliveryOrder, 'id'>): DeliveryOrder => {
    const dos = StorageService.getDOs();
    const newDO: DeliveryOrder = {
      ...doData,
      id: `do-${Date.now()}`
    };

    StorageService.saveDOs([newDO, ...dos]);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.DOS, newDO).catch(() => {});

    // Update PO received status
    const pos = StorageService.getPOs();
    const targetPO = pos.find(p => p.poNumber === newDO.poNumber);
    if (targetPO) {
      newDO.items.forEach(doi => {
        const poi = targetPO.items.find(p => p.itemCode === doi.itemCode);
        if (poi) {
          poi.receivedQty = (poi.receivedQty || 0) + (doi.qtyReceived || 0);
        }
      });
      const allFullyReceived = targetPO.items.every(item => item.receivedQty >= item.qty);
      targetPO.status = allFullyReceived ? 'DELIVERED' : 'PARTIALLY_DELIVERED';
      StorageService.savePOs(pos);
      saveDocToFirestore(FIRESTORE_COLLECTIONS.POS, targetPO).catch(() => {});
    }

    // Auto-update inventory stock
    const inventory = StorageService.getInventory();
    newDO.items.forEach(doi => {
      const invItem = inventory.find(i => i.itemCode === doi.itemCode);
      if (invItem && doi.qtyReceived > 0) {
        invItem.currentStock += doi.qtyReceived;
        invItem.availableStock += doi.qtyReceived;
        invItem.movements = [
          {
            id: `mov-${Date.now()}-${doi.itemCode}`,
            date: getCurrentTimestamp(),
            type: 'IN',
            qty: doi.qtyReceived,
            balanceAfter: invItem.currentStock,
            referenceDoc: newDO.doNumber,
            operator: StorageService.getCurrentUser().name,
            notes: `Penerimaan barang dari Surat Jalan ${newDO.doNumber} (PO ${newDO.poNumber})`
          },
          ...(invItem.movements || [])
        ];
      }
    });
    StorageService.saveInventory(inventory);

    // Auto-create Accounts Receivable (Piutang Usaha) if customer delivery or customer info is present
    if (newDO.isCustomerDelivery || newDO.customerName || (newDO.totalDeliveryValue && newDO.totalDeliveryValue > 0)) {
      const year = new Date().getFullYear();
      const month = String(new Date().getMonth() + 1).padStart(2, '0');
      const receivables = StorageService.getReceivables();
      const arCount = receivables.length + 1;
      const arNumber = `AR-${year}-${month}-${String(arCount).padStart(3, '0')}`;
      const subtotalVal = newDO.totalDeliveryValue || 0;
      const shippingVal = newDO.shippingCost || 0;
      const totalVal = subtotalVal + shippingVal;

      const newReceivable: ReceivableRecord = {
        id: `ar-${Date.now()}`,
        receivableNumber: arNumber,
        doId: newDO.id,
        doNumber: newDO.doNumber,
        poReference: newDO.poNumber,
        customerId: newDO.customerId,
        customerName: newDO.customerName || newDO.recipientName || 'Pelanggan Proyek',
        customerAddress: newDO.customerAddress || newDO.warehouseDestination || '',
        customerPhone: newDO.customerPhone || '',
        transactionDate: newDO.deliveryDate,
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        subtotal: subtotalVal,
        shippingCost: shippingVal,
        taxAmount: 0,
        totalAmount: totalVal > 0 ? totalVal : (subtotalVal || 0),
        receivedAmount: 0,
        balanceDue: totalVal > 0 ? totalVal : (subtotalVal || 0),
        status: 'UNPAID',
        payments: [],
        notes: `Piutang Pengiriman Surat Jalan ${newDO.doNumber} (${newDO.items.length} item material)`,
        createdAt: getCurrentTimestamp()
      };
      StorageService.saveReceivables([newReceivable, ...receivables]);
    }

    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'DO',
      action: 'RECEIVE_GOODS',
      docNumber: newDO.doNumber,
      details: `Memproses Surat Jalan ${newDO.doNumber} (${newDO.isCustomerDelivery ? 'Pengiriman ke Pelanggan' : 'Penerimaan PO ' + newDO.poNumber})`
    });

    return newDO;
  },

  // INVOICES & PAYMENTS
  getInvoices: (): Invoice[] => getLocal(KEYS.INVOICES, INITIAL_INVOICES),
  saveInvoices: (data: Invoice[]) => {
    setLocal(KEYS.INVOICES, data);
    batchSaveToFirestore(FIRESTORE_COLLECTIONS.INVOICES, data).catch(() => {});
  },
  saveInvoice: (invData: Omit<Invoice, 'id'> | Invoice): Invoice => {
    if ('id' in invData && invData.id) {
      const invoices = StorageService.getInvoices();
      const updated = invoices.map(i => i.id === invData.id ? { ...i, ...invData } : i);
      StorageService.saveInvoices(updated);
      saveDocToFirestore(FIRESTORE_COLLECTIONS.INVOICES, invData as Invoice).catch(() => {});
      return invData as Invoice;
    }
    return StorageService.createInvoice(invData as any);
  },
  createInvoice: (invData: Omit<Invoice, 'id' | 'paidAmount' | 'balanceDue' | 'status' | 'payments'>): Invoice => {
    const invoices = StorageService.getInvoices();
    const newInvoice: Invoice = {
      ...invData,
      id: `inv-${Date.now()}`,
      paidAmount: 0,
      balanceDue: invData.totalAmount,
      status: 'UNPAID',
      payments: []
    };

    StorageService.saveInvoices([newInvoice, ...invoices]);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.INVOICES, newInvoice).catch(() => {});

    // Update PO status to INVOICED
    const pos = StorageService.getPOs();
    const targetPO = pos.find(p => p.poNumber === newInvoice.poNumber);
    if (targetPO) {
      targetPO.status = 'INVOICED';
      StorageService.savePOs(pos);
      saveDocToFirestore(FIRESTORE_COLLECTIONS.POS, targetPO).catch(() => {});
    }

    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'INVOICE',
      action: 'CREATE_INVOICE',
      docNumber: newInvoice.invoiceNumber,
      details: `Mencatat Invoice masuk ${newInvoice.invoiceNumber} dari ${newInvoice.vendorName} total Rp ${newInvoice.totalAmount.toLocaleString('id-ID')}`
    });

    return newInvoice;
  },
  recordPayment: (invoiceId: string, paymentData: Omit<PaymentRecord, 'id'>): Invoice | null => {
    const invoices = StorageService.getInvoices();
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return null;

    const newPayment: PaymentRecord = {
      ...paymentData,
      id: `pay-${Date.now()}`
    };

    inv.payments = [...inv.payments, newPayment];
    inv.paidAmount += paymentData.amount;
    inv.balanceDue = Math.max(0, inv.totalAmount - inv.paidAmount);

    if (inv.balanceDue === 0) {
      inv.status = 'PAID';
    } else if (inv.paidAmount > 0) {
      inv.status = 'PARTIAL';
    }

    StorageService.saveInvoices(invoices);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.INVOICES, inv).catch(() => {});

    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'INVOICE',
      action: 'PAYMENT_RECORD',
      docNumber: inv.invoiceNumber,
      details: `Mencatat pembayaran Rp ${paymentData.amount.toLocaleString('id-ID')} untuk ${inv.invoiceNumber} (Sisa: Rp ${inv.balanceDue.toLocaleString('id-ID')})`
    });

    return inv;
  },

  // ==========================================
  // HUTANG USAHA (ACCOUNTS PAYABLE / AP)
  // ==========================================
  getPayables: (): PayableRecord[] => getLocal(KEYS.PAYABLES, INITIAL_PAYABLES),
  savePayables: (data: PayableRecord[]) => {
    setLocal(KEYS.PAYABLES, data);
    batchSaveToFirestore(FIRESTORE_COLLECTIONS.PAYABLES, data).catch(() => {});
  },
  savePayable: (data: Omit<PayableRecord, 'id'> | PayableRecord): PayableRecord => {
    if ('id' in data && data.id) {
      const payables = StorageService.getPayables();
      const updated = payables.map(p => p.id === data.id ? { ...p, ...data } : p);
      StorageService.savePayables(updated);
      saveDocToFirestore(FIRESTORE_COLLECTIONS.PAYABLES, data as PayableRecord).catch(() => {});
      return data as PayableRecord;
    }
    return StorageService.addPayable(data as any);
  },
  addPayable: (
    data: Omit<PayableRecord, 'id' | 'payableNumber' | 'createdAt' | 'paidAmount' | 'balanceDue' | 'status' | 'payments'>
  ): PayableRecord => {
    const payables = StorageService.getPayables();
    const count = payables.length + 1;
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const payableNumber = `AP-${year}-${month}-${String(count).padStart(3, '0')}`;

    const totalVal = data.totalAmount || (data.subtotal + (data.shippingCost || 0) + (data.taxAmount || 0) - (data.discountAmount || 0));

    const newPayable: PayableRecord = {
      ...data,
      id: `ap-${Date.now()}`,
      payableNumber,
      totalAmount: totalVal,
      paidAmount: 0,
      balanceDue: totalVal,
      status: 'UNPAID',
      payments: [],
      createdAt: getCurrentTimestamp()
    };

    StorageService.savePayables([newPayable, ...payables]);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.PAYABLES, newPayable).catch(() => {});

    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'HUTANG',
      action: 'CREATE_PAYABLE',
      docNumber: newPayable.payableNumber,
      details: `Mencatat Hutang Usaha ${newPayable.payableNumber} ke supplier ${newPayable.vendorName} senilai Rp ${newPayable.totalAmount.toLocaleString('id-ID')}`
    });

    return newPayable;
  },
  recordPayablePayment: (
    payableId: string,
    payment: {
      amount: number;
      paymentDate: string;
      paymentMethod: any;
      bankAccountId: string;
      referenceNumber: string;
      notes?: string;
    }
  ): PayableRecord | null => {
    const payables = StorageService.getPayables();
    const payable = payables.find(p => p.id === payableId);
    if (!payable) return null;

    const user = StorageService.getCurrentUser();
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      invoiceId: payable.id,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      referenceNumber: payment.referenceNumber,
      bankName: '',
      accountNumber: '',
      notes: payment.notes,
      recordedBy: user.name
    };

    payable.payments = [...payable.payments, newPayment];
    payable.paidAmount += payment.amount;
    payable.balanceDue = Math.max(0, payable.totalAmount - payable.paidAmount);

    if (payable.balanceDue === 0) {
      payable.status = 'PAID';
    } else if (payable.paidAmount > 0) {
      payable.status = 'PARTIAL';
    }

    StorageService.savePayables(payables);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.PAYABLES, payable).catch(() => {});

    // Automatically record cash expense & reduce bank account balance
    if (payment.bankAccountId) {
      const bankAccounts = StorageService.getBankAccounts();
      const account = bankAccounts.find(a => a.id === payment.bankAccountId);
      if (account) {
        account.currentBalance -= payment.amount;
        StorageService.saveBankAccounts(bankAccounts);

        // Add Cash Transaction record
        const cashTrxs = StorageService.getCashTransactions();
        const trxCount = cashTrxs.length + 1;
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const trxNumber = `TRX-${year}-${month}-${String(trxCount).padStart(3, '0')}`;

        const newTrx: CashTransaction = {
          id: `trx-${Date.now()}`,
          transactionNumber: trxNumber,
          date: payment.paymentDate,
          type: 'EXPENSE',
          category: 'Pembayaran Hutang Supplier',
          bankAccountId: account.id,
          bankAccountName: `${account.name} (${account.accountNumber})`,
          amount: payment.amount,
          balanceAfter: account.currentBalance,
          referenceDoc: payable.payableNumber,
          recipientOrPayer: payable.vendorName,
          operator: user.name,
          notes: payment.notes || `Bayar Hutang PO ${payable.poNumber} (${payable.vendorName})`,
          createdAt: getCurrentTimestamp()
        };
        StorageService.saveCashTransactions([newTrx, ...cashTrxs]);
      }
    }

    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: user.name,
      role: user.role,
      module: 'HUTANG',
      action: 'PAY_PAYABLE',
      docNumber: payable.payableNumber,
      details: `Membayar hutang ${payable.payableNumber} ke ${payable.vendorName} sebesar Rp ${payment.amount.toLocaleString('id-ID')} (Sisa: Rp ${payable.balanceDue.toLocaleString('id-ID')})`
    });

    return payable;
  },
  deletePayable: (id: string) => {
    const payables = StorageService.getPayables().filter(p => p.id !== id);
    StorageService.savePayables(payables);
    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.PAYABLES, id).catch(() => {});
  },

  // ==========================================
  // PIUTANG USAHA (ACCOUNTS RECEIVABLE / AR)
  // ==========================================
  getReceivables: (): ReceivableRecord[] => getLocal(KEYS.RECEIVABLES, INITIAL_RECEIVABLES),
  saveReceivables: (data: ReceivableRecord[]) => {
    setLocal(KEYS.RECEIVABLES, data);
    batchSaveToFirestore(FIRESTORE_COLLECTIONS.RECEIVABLES, data).catch(() => {});
  },
  saveReceivable: (data: Omit<ReceivableRecord, 'id'> | ReceivableRecord): ReceivableRecord => {
    if ('id' in data && data.id) {
      const receivables = StorageService.getReceivables();
      const updated = receivables.map(r => r.id === data.id ? { ...r, ...data } : r);
      StorageService.saveReceivables(updated);
      saveDocToFirestore(FIRESTORE_COLLECTIONS.RECEIVABLES, data as ReceivableRecord).catch(() => {});
      return data as ReceivableRecord;
    }
    return StorageService.addReceivable(data as any);
  },
  addReceivable: (
    data: Omit<ReceivableRecord, 'id' | 'receivableNumber' | 'createdAt' | 'receivedAmount' | 'balanceDue' | 'status' | 'payments'>
  ): ReceivableRecord => {
    const receivables = StorageService.getReceivables();
    const count = receivables.length + 1;
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const receivableNumber = `AR-${year}-${month}-${String(count).padStart(3, '0')}`;

    const totalVal = data.totalAmount || (data.subtotal + (data.shippingCost || 0) + (data.taxAmount || 0));

    const newReceivable: ReceivableRecord = {
      ...data,
      id: `ar-${Date.now()}`,
      receivableNumber,
      totalAmount: totalVal,
      receivedAmount: 0,
      balanceDue: totalVal,
      status: 'UNPAID',
      payments: [],
      createdAt: getCurrentTimestamp()
    };

    StorageService.saveReceivables([newReceivable, ...receivables]);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.RECEIVABLES, newReceivable).catch(() => {});

    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'PIUTANG',
      action: 'CREATE_RECEIVABLE',
      docNumber: newReceivable.receivableNumber,
      details: `Mencatat Piutang Usaha ${newReceivable.receivableNumber} dari pelanggan ${newReceivable.customerName} senilai Rp ${newReceivable.totalAmount.toLocaleString('id-ID')}`
    });

    return newReceivable;
  },
  recordReceivablePayment: (
    receivableId: string,
    payment: {
      amount: number;
      paymentDate: string;
      paymentMethod: any;
      bankAccountId: string;
      referenceNumber: string;
      notes?: string;
    }
  ): ReceivableRecord | null => {
    const receivables = StorageService.getReceivables();
    const receivable = receivables.find(r => r.id === receivableId);
    if (!receivable) return null;

    const user = StorageService.getCurrentUser();
    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      invoiceId: receivable.id,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      referenceNumber: payment.referenceNumber,
      bankName: '',
      accountNumber: '',
      notes: payment.notes,
      recordedBy: user.name
    };

    receivable.payments = [...receivable.payments, newPayment];
    receivable.receivedAmount += payment.amount;
    receivable.balanceDue = Math.max(0, receivable.totalAmount - receivable.receivedAmount);

    if (receivable.balanceDue === 0) {
      receivable.status = 'PAID';
    } else if (receivable.receivedAmount > 0) {
      receivable.status = 'PARTIAL';
    }

    StorageService.saveReceivables(receivables);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.RECEIVABLES, receivable).catch(() => {});

    // Automatically record cash income & increase bank account balance
    if (payment.bankAccountId) {
      const bankAccounts = StorageService.getBankAccounts();
      const account = bankAccounts.find(a => a.id === payment.bankAccountId);
      if (account) {
        account.currentBalance += payment.amount;
        StorageService.saveBankAccounts(bankAccounts);

        // Add Cash Transaction record
        const cashTrxs = StorageService.getCashTransactions();
        const trxCount = cashTrxs.length + 1;
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const trxNumber = `TRX-${year}-${month}-${String(trxCount).padStart(3, '0')}`;

        const newTrx: CashTransaction = {
          id: `trx-${Date.now()}`,
          transactionNumber: trxNumber,
          date: payment.paymentDate,
          type: 'INCOME',
          category: 'Pelunasan Piutang Pelanggan',
          bankAccountId: account.id,
          bankAccountName: `${account.name} (${account.accountNumber})`,
          amount: payment.amount,
          balanceAfter: account.currentBalance,
          referenceDoc: receivable.receivableNumber,
          recipientOrPayer: receivable.customerName,
          operator: user.name,
          notes: payment.notes || `Terima pembayaran piutang ${receivable.receivableNumber} dari ${receivable.customerName}`,
          createdAt: getCurrentTimestamp()
        };
        StorageService.saveCashTransactions([newTrx, ...cashTrxs]);
      }
    }

    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: user.name,
      role: user.role,
      module: 'PIUTANG',
      action: 'RECEIVE_PAYMENT',
      docNumber: receivable.receivableNumber,
      details: `Menerima pelunasan piutang ${receivable.receivableNumber} dari ${receivable.customerName} sebesar Rp ${payment.amount.toLocaleString('id-ID')} (Sisa: Rp ${receivable.balanceDue.toLocaleString('id-ID')})`
    });

    return receivable;
  },
  deleteReceivable: (id: string) => {
    const receivables = StorageService.getReceivables().filter(r => r.id !== id);
    StorageService.saveReceivables(receivables);
    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.RECEIVABLES, id).catch(() => {});
  },

  // ==========================================
  // BANK ACCOUNTS & UPDATE SALDO (KAS & BANK)
  // ==========================================
  getBankAccounts: (): BankAccount[] => getLocal(KEYS.BANK_ACCOUNTS, INITIAL_BANK_ACCOUNTS),
  saveBankAccounts: (data: BankAccount[]) => {
    setLocal(KEYS.BANK_ACCOUNTS, data);
    batchSaveToFirestore(FIRESTORE_COLLECTIONS.BANK_ACCOUNTS, data).catch(() => {});
  },
  addBankAccount: (accData: Omit<BankAccount, 'id'>): BankAccount => {
    const accounts = StorageService.getBankAccounts();
    const newAcc: BankAccount = {
      ...accData,
      id: `acc-${Date.now()}`
    };
    StorageService.saveBankAccounts([...accounts, newAcc]);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.BANK_ACCOUNTS, newAcc).catch(() => {});

    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'KAS_BANK',
      action: 'ADD_BANK_ACCOUNT',
      docNumber: newAcc.accountCode,
      details: `Menambahkan rekening kas/bank baru: ${newAcc.name} (${newAcc.accountNumber})`
    });

    return newAcc;
  },
  updateBankAccount: (accData: BankAccount): BankAccount => {
    const accounts = StorageService.getBankAccounts();
    const updated = accounts.map(a => a.id === accData.id ? accData : a);
    StorageService.saveBankAccounts(updated);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.BANK_ACCOUNTS, accData).catch(() => {});
    return accData;
  },
  deleteBankAccount: (id: string) => {
    const accounts = StorageService.getBankAccounts().filter(a => a.id !== id);
    StorageService.saveBankAccounts(accounts);
    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.BANK_ACCOUNTS, id).catch(() => {});
  },
  adjustAccountBalance: (accountId: string, newBalance: number, reason: string): BankAccount | null => {
    const accounts = StorageService.getBankAccounts();
    const acc = accounts.find(a => a.id === accountId);
    if (!acc) return null;

    const oldBalance = acc.currentBalance;
    const diff = newBalance - oldBalance;
    acc.currentBalance = newBalance;
    StorageService.saveBankAccounts(accounts);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.BANK_ACCOUNTS, acc).catch(() => {});

    const user = StorageService.getCurrentUser();
    const cashTrxs = StorageService.getCashTransactions();
    const trxCount = cashTrxs.length + 1;
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const trxNumber = `TRX-${year}-${month}-${String(trxCount).padStart(3, '0')}`;

    const newTrx: CashTransaction = {
      id: `trx-${Date.now()}`,
      transactionNumber: trxNumber,
      date: new Date().toISOString().split('T')[0],
      type: 'ADJUSTMENT',
      category: 'Update / Rekonsiliasi Saldo',
      bankAccountId: acc.id,
      bankAccountName: `${acc.name} (${acc.accountNumber})`,
      amount: Math.abs(diff),
      balanceAfter: newBalance,
      referenceDoc: 'KOREKSI_SALDO',
      recipientOrPayer: 'Super Admin',
      operator: user.name,
      notes: reason || `Koreksi saldo dari Rp ${oldBalance.toLocaleString('id-ID')} menjadi Rp ${newBalance.toLocaleString('id-ID')}`,
      createdAt: getCurrentTimestamp()
    };
    StorageService.saveCashTransactions([newTrx, ...cashTrxs]);

    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: user.name,
      role: user.role,
      module: 'KAS_BANK',
      action: 'UPDATE_SALDO',
      docNumber: acc.accountCode,
      details: `Mengupdate saldo rekening ${acc.name} (${acc.accountNumber}) dari Rp ${oldBalance.toLocaleString('id-ID')} menjadi Rp ${newBalance.toLocaleString('id-ID')}. Alasan: ${reason}`
    });

    return acc;
  },

  // ==========================================
  // CASH TRANSACTIONS (MUTASI KAS & BANK)
  // ==========================================
  getCashTransactions: (): CashTransaction[] => getLocal(KEYS.CASH_TRANSACTIONS, INITIAL_CASH_TRANSACTIONS),
  saveCashTransactions: (data: CashTransaction[]) => {
    setLocal(KEYS.CASH_TRANSACTIONS, data);
    batchSaveToFirestore(FIRESTORE_COLLECTIONS.CASH_TRANSACTIONS, data).catch(() => {});
  },
  addCashTransaction: (
    trxData: Omit<CashTransaction, 'id' | 'transactionNumber' | 'createdAt' | 'balanceAfter'>
  ): CashTransaction => {
    const bankAccounts = StorageService.getBankAccounts();
    const sourceAcc = bankAccounts.find(a => a.id === trxData.bankAccountId);
    if (!sourceAcc) throw new Error("Akun Kas / Bank tidak ditemukan");

    let finalBalanceAfter = sourceAcc.currentBalance;

    if (trxData.type === 'INCOME') {
      sourceAcc.currentBalance += trxData.amount;
      finalBalanceAfter = sourceAcc.currentBalance;
    } else if (trxData.type === 'EXPENSE') {
      sourceAcc.currentBalance -= trxData.amount;
      finalBalanceAfter = sourceAcc.currentBalance;
    } else if (trxData.type === 'TRANSFER') {
      sourceAcc.currentBalance -= trxData.amount;
      finalBalanceAfter = sourceAcc.currentBalance;

      if (trxData.destinationBankAccountId) {
        const destAcc = bankAccounts.find(a => a.id === trxData.destinationBankAccountId);
        if (destAcc) {
          destAcc.currentBalance += trxData.amount;
        }
      }
    }

    StorageService.saveBankAccounts(bankAccounts);

    const cashTrxs = StorageService.getCashTransactions();
    const trxCount = cashTrxs.length + 1;
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const trxNumber = `TRX-${year}-${month}-${String(trxCount).padStart(3, '0')}`;

    const newTrx: CashTransaction = {
      ...trxData,
      id: `trx-${Date.now()}`,
      transactionNumber: trxNumber,
      balanceAfter: finalBalanceAfter,
      createdAt: getCurrentTimestamp()
    };

    StorageService.saveCashTransactions([newTrx, ...cashTrxs]);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.CASH_TRANSACTIONS, newTrx).catch(() => {});

    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: trxData.operator || StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'KAS_BANK',
      action: `TRANSACTION_${trxData.type}`,
      docNumber: newTrx.transactionNumber,
      details: `${trxData.type === 'INCOME' ? 'Pemasukan' : trxData.type === 'EXPENSE' ? 'Pengeluaran' : 'Transfer'} sebesar Rp ${trxData.amount.toLocaleString('id-ID')} pada akun ${sourceAcc.name} (${trxData.category})`
    });

    return newTrx;
  },

  // RETUR / RETURN OF GOODS
  getReturs: (): Retur[] => getLocal(KEYS.RETURS, INITIAL_RETURS),
  saveReturs: (data: Retur[]) => {
    setLocal(KEYS.RETURS, data);
    batchSaveToFirestore(FIRESTORE_COLLECTIONS.RETURS, data).catch(() => {});
  },
  saveRetur: (returData: Omit<Retur, 'id'> | Retur): Retur => {
    if ('id' in returData && returData.id) {
      const returs = StorageService.getReturs();
      const updated = returs.map(r => r.id === returData.id ? { ...r, ...returData } : r);
      StorageService.saveReturs(updated);
      saveDocToFirestore(FIRESTORE_COLLECTIONS.RETURS, returData as Retur).catch(() => {});
      return returData as Retur;
    }
    return StorageService.createRetur(returData as Omit<Retur, 'id' | 'returNumber' | 'status'>);
  },
  updateReturStatus: (returId: string, status: any): Retur | null => {
    const returs = StorageService.getReturs();
    const retur = returs.find(r => r.id === returId);
    if (!retur) return null;

    retur.status = status;
    StorageService.saveReturs(returs);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.RETURS, retur).catch(() => {});
    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'RETUR',
      action: `UPDATE_STATUS_${status}`,
      docNumber: retur.returNumber,
      details: `Mengubah status Berita Acara Retur ${retur.returNumber} menjadi ${status}`
    });
    return retur;
  },
  createRetur: (returData: Omit<Retur, 'id' | 'returNumber' | 'status'>): Retur => {
    const returs = StorageService.getReturs();
    const count = returs.length + 1;
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');
    const returNumber = `RT-${year}-${month}-${String(count).padStart(3, '0')}`;

    const newRetur: Retur = {
      ...returData,
      id: `rt-${Date.now()}`,
      returNumber,
      status: 'PENDING'
    };

    StorageService.saveReturs([newRetur, ...returs]);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.RETURS, newRetur).catch(() => {});

    // Decrease inventory if defective items are taken out
    const inventory = StorageService.getInventory();
    newRetur.items.forEach(item => {
      const invItem = inventory.find(i => i.itemCode === item.itemCode);
      if (invItem && invItem.currentStock >= item.qty) {
        invItem.currentStock -= item.qty;
        invItem.availableStock = Math.max(0, invItem.availableStock - item.qty);
        invItem.movements = [
          {
            id: `mov-${Date.now()}-${item.itemCode}`,
            date: getCurrentTimestamp(),
            type: 'RETURN',
            qty: item.qty,
            balanceAfter: invItem.currentStock,
            referenceDoc: newRetur.returNumber,
            operator: StorageService.getCurrentUser().name,
            notes: `Retur pengembalian barang ke vendor ${newRetur.vendorName}: ${item.reason}`
          },
          ...(invItem.movements || [])
        ];
      }
    });
    StorageService.saveInventory(inventory);

    StorageService.addAuditLog({
      timestamp: getCurrentTimestamp(),
      user: StorageService.getCurrentUser().name,
      role: StorageService.getCurrentUser().role,
      module: 'RETUR',
      action: 'CREATE_RETUR',
      docNumber: newRetur.returNumber,
      details: `Membuat formulir retur barang ${newRetur.returNumber} ke ${newRetur.vendorName}`
    });

    return newRetur;
  },

  // AUDIT LOGS
  getAuditLogs: (): AuditLog[] => getLocal(KEYS.AUDIT_LOGS, INITIAL_AUDIT_LOGS),
  saveAuditLogs: (logs: AuditLog[]) => {
    setLocal(KEYS.AUDIT_LOGS, logs);
    batchSaveToFirestore(FIRESTORE_COLLECTIONS.AUDIT_LOGS, logs).catch(() => {});
  },
  addAuditLog: (log: Omit<AuditLog, 'id'>) => {
    const logs = StorageService.getAuditLogs();
    const newLog: AuditLog = {
      ...log,
      id: `log-${Date.now()}`
    };
    StorageService.saveAuditLogs([newLog, ...logs]);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.AUDIT_LOGS, newLog).catch(() => {});
  },

  // AUTHENTICATION SESSION
  getAuthSession: (): { isAuthenticated: boolean; user: User } => {
    const session = getLocal<{ isAuthenticated: boolean; userId: string } | null>('rajawali_auth_session', null);
    const users = StorageService.getUsers();
    if (session && session.isAuthenticated) {
      const user = users.find(u => u.id === session.userId) || users[0] || INITIAL_USERS[0];
      return { isAuthenticated: true, user };
    }
    return { isAuthenticated: false, user: users[0] || INITIAL_USERS[0] };
  },
  setAuthSession: (userOrId: User | string) => {
    const userId = typeof userOrId === 'string' ? userOrId : userOrId.id;
    setLocal('rajawali_auth_session', { isAuthenticated: true, userId });
    StorageService.setCurrentUser(userId);
  },
  clearAuthSession: () => {
    localStorage.removeItem('rajawali_auth_session');
  },

  // RESET TOTAL DATA TO BLANK (SUPER ADMIN ONLY)
  resetToBlankDatabase: async () => {
    const users = StorageService.getUsers();
    const superAdmin = users.find(u => u.role === 'SUPER_ADMIN') || INITIAL_USERS[0];
    localStorage.clear();
    setLocal(KEYS.COMPANY, COMPANY_PROFILE);
    setLocal(KEYS.USERS, INITIAL_USERS);
    setLocal(KEYS.CURRENT_USER, superAdmin);
    
    // Clear Firestore collections
    await Promise.allSettled([
      clearFirestoreCollection(FIRESTORE_COLLECTIONS.VENDORS),
      clearFirestoreCollection(FIRESTORE_COLLECTIONS.CUSTOMERS),
      clearFirestoreCollection(FIRESTORE_COLLECTIONS.INVENTORY),
      clearFirestoreCollection(FIRESTORE_COLLECTIONS.MRS),
      clearFirestoreCollection(FIRESTORE_COLLECTIONS.POS),
      clearFirestoreCollection(FIRESTORE_COLLECTIONS.DOS),
      clearFirestoreCollection(FIRESTORE_COLLECTIONS.INVOICES),
      clearFirestoreCollection(FIRESTORE_COLLECTIONS.PAYABLES),
      clearFirestoreCollection(FIRESTORE_COLLECTIONS.RECEIVABLES),
      clearFirestoreCollection(FIRESTORE_COLLECTIONS.BANK_ACCOUNTS),
      clearFirestoreCollection(FIRESTORE_COLLECTIONS.CASH_TRANSACTIONS),
      clearFirestoreCollection(FIRESTORE_COLLECTIONS.RETURS),
      clearFirestoreCollection(FIRESTORE_COLLECTIONS.AUDIT_LOGS),
    ]);

    setLocal(KEYS.VENDORS, []);
    setLocal(KEYS.CUSTOMERS, []);
    setLocal(KEYS.INVENTORY, []);
    setLocal(KEYS.MRS, []);
    setLocal(KEYS.POS, []);
    setLocal(KEYS.DOS, []);
    setLocal(KEYS.INVOICES, []);
    setLocal(KEYS.PAYABLES, []);
    setLocal(KEYS.RECEIVABLES, []);
    setLocal(KEYS.BANK_ACCOUNTS, INITIAL_BANK_ACCOUNTS);
    setLocal(KEYS.CASH_TRANSACTIONS, []);
    setLocal(KEYS.RETURS, []);

    const initialBlankLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: getCurrentTimestamp(),
      user: superAdmin.name,
      role: 'SUPER_ADMIN',
      module: 'SYSTEM',
      action: 'RESET_TOTAL_BLANK',
      docNumber: 'DATABASE-PURGE',
      details: 'Super Admin melakukan Reset Total Database: Seluruh transaksi & inventaris dikosongkan (Zero Data).'
    };
    setLocal(KEYS.AUDIT_LOGS, [initialBlankLog]);
    saveDocToFirestore(FIRESTORE_COLLECTIONS.AUDIT_LOGS, initialBlankLog).catch(() => {});
    setLocal('rajawali_auth_session', { isAuthenticated: true, userId: superAdmin.id });
  },

  /**
   * Setup Real-time Firestore Synchronizer
   * Automatically keeps local state synchronized across multiple users and tabs in real-time!
   */
  subscribeToAllCollections: (onSync: () => void) => {
    const unsubscribes: (() => void)[] = [];

    // Sync Company Profile
    unsubscribes.push(
      subscribeCollection<any>('company', (items) => {
        const found = items.find(i => i.id === 'main_profile') || items[0];
        if (found) {
          const { id, ...compData } = found;
          setLocal(KEYS.COMPANY, compData);
          onSync();
        }
      })
    );

    // Sync Users
    unsubscribes.push(
      subscribeCollection<User>(FIRESTORE_COLLECTIONS.USERS, (items) => {
        if (items.length > 0) {
          setLocal(KEYS.USERS, items);
          onSync();
        }
      })
    );

    // Sync Vendors
    unsubscribes.push(
      subscribeCollection<Vendor>(FIRESTORE_COLLECTIONS.VENDORS, (items) => {
        setLocal(KEYS.VENDORS, items);
        onSync();
      })
    );

    // Sync Customers
    unsubscribes.push(
      subscribeCollection<CustomerClient>(FIRESTORE_COLLECTIONS.CUSTOMERS, (items) => {
        setLocal(KEYS.CUSTOMERS, items);
        onSync();
      })
    );

    // Sync Inventory
    unsubscribes.push(
      subscribeCollection<InventoryItem>(FIRESTORE_COLLECTIONS.INVENTORY, (items) => {
        setLocal(KEYS.INVENTORY, items);
        onSync();
      })
    );

    // Sync Material Requests
    unsubscribes.push(
      subscribeCollection<MaterialRequest>(FIRESTORE_COLLECTIONS.MRS, (items) => {
        setLocal(KEYS.MRS, items);
        onSync();
      })
    );

    // Sync Purchase Orders
    unsubscribes.push(
      subscribeCollection<PurchaseOrder>(FIRESTORE_COLLECTIONS.POS, (items) => {
        setLocal(KEYS.POS, items);
        onSync();
      })
    );

    // Sync Delivery Orders
    unsubscribes.push(
      subscribeCollection<DeliveryOrder>(FIRESTORE_COLLECTIONS.DOS, (items) => {
        setLocal(KEYS.DOS, items);
        onSync();
      })
    );

    // Sync Invoices
    unsubscribes.push(
      subscribeCollection<Invoice>(FIRESTORE_COLLECTIONS.INVOICES, (items) => {
        setLocal(KEYS.INVOICES, items);
        onSync();
      })
    );

    // Sync Payables (Hutang)
    unsubscribes.push(
      subscribeCollection<PayableRecord>(FIRESTORE_COLLECTIONS.PAYABLES, (items) => {
        setLocal(KEYS.PAYABLES, items);
        onSync();
      })
    );

    // Sync Receivables (Piutang)
    unsubscribes.push(
      subscribeCollection<ReceivableRecord>(FIRESTORE_COLLECTIONS.RECEIVABLES, (items) => {
        setLocal(KEYS.RECEIVABLES, items);
        onSync();
      })
    );

    // Sync Bank Accounts
    unsubscribes.push(
      subscribeCollection<BankAccount>(FIRESTORE_COLLECTIONS.BANK_ACCOUNTS, (items) => {
        if (items.length > 0) {
          setLocal(KEYS.BANK_ACCOUNTS, items);
          onSync();
        }
      })
    );

    // Sync Cash Transactions
    unsubscribes.push(
      subscribeCollection<CashTransaction>(FIRESTORE_COLLECTIONS.CASH_TRANSACTIONS, (items) => {
        setLocal(KEYS.CASH_TRANSACTIONS, items);
        onSync();
      })
    );

    // Sync Returs
    unsubscribes.push(
      subscribeCollection<Retur>(FIRESTORE_COLLECTIONS.RETURS, (items) => {
        setLocal(KEYS.RETURS, items);
        onSync();
      })
    );

    // Sync Audit Logs
    unsubscribes.push(
      subscribeCollection<AuditLog>(FIRESTORE_COLLECTIONS.AUDIT_LOGS, (items) => {
        if (items.length > 0) {
          setLocal(KEYS.AUDIT_LOGS, items);
          onSync();
        }
      })
    );

    return () => {
      unsubscribes.forEach(unsub => unsub());
    };
  },

  exportDatabaseJSON: (): string => {
    const fullBackup = {
      exportedAt: new Date().toISOString(),
      company: StorageService.getCompany(),
      vendors: StorageService.getVendors(),
      customers: StorageService.getCustomers(),
      inventory: StorageService.getInventory(),
      mrs: StorageService.getMRs(),
      pos: StorageService.getPOs(),
      dos: StorageService.getDOs(),
      invoices: StorageService.getInvoices(),
      payables: StorageService.getPayables(),
      receivables: StorageService.getReceivables(),
      bankAccounts: StorageService.getBankAccounts(),
      cashTransactions: StorageService.getCashTransactions(),
      returs: StorageService.getReturs(),
      auditLogs: StorageService.getAuditLogs(),
    };
    return JSON.stringify(fullBackup, null, 2);
  },

  importDatabaseJSON: (jsonString: string): boolean => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.company) StorageService.saveCompany(parsed.company);
      if (parsed.vendors) StorageService.saveVendors(parsed.vendors);
      if (parsed.customers) StorageService.saveCustomers(parsed.customers);
      if (parsed.inventory) StorageService.saveInventory(parsed.inventory);
      if (parsed.mrs) StorageService.saveMRs(parsed.mrs);
      if (parsed.pos) StorageService.savePOs(parsed.pos);
      if (parsed.dos) StorageService.saveDOs(parsed.dos);
      if (parsed.invoices) StorageService.saveInvoices(parsed.invoices);
      if (parsed.payables) StorageService.savePayables(parsed.payables);
      if (parsed.receivables) StorageService.saveReceivables(parsed.receivables);
      if (parsed.bankAccounts) StorageService.saveBankAccounts(parsed.bankAccounts);
      if (parsed.cashTransactions) StorageService.saveCashTransactions(parsed.cashTransactions);
      if (parsed.returs) StorageService.saveReturs(parsed.returs);
      if (parsed.auditLogs) StorageService.saveAuditLogs(parsed.auditLogs);
      return true;
    } catch (e) {
      console.error("Failed to import database JSON:", e);
      return false;
    }
  }
};
