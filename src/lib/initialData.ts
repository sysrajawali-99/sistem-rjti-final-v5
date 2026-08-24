import { 
  CompanyProfile, 
  InventoryItem, 
  Vendor, 
  CustomerClient, 
  MaterialRequest, 
  PurchaseOrder, 
  DeliveryOrder, 
  Invoice, 
  Retur, 
  AuditLog,
  User,
  UserRole,
  NavTab,
  PayableRecord,
  ReceivableRecord,
  BankAccount,
  CashTransaction
} from '../types';

export const ROLE_DEFAULT_MENUS: Record<UserRole, NavTab[]> = {
  SUPER_ADMIN: [
    'DASHBOARD', 
    'MR', 
    'PO', 
    'DO', 
    'INVOICE', 
    'HUTANG', 
    'PIUTANG', 
    'KAS_BANK', 
    'RETUR', 
    'INVENTORY', 
    'MASTER_DATA', 
    'AUDIT_LOG', 
    'USERS', 
    'COMPANY_SETTINGS'
  ],
  ADMIN_HO: ['MR', 'DO', 'RETUR'],
  MANAGER_HO: ['MR', 'PO', 'DO', 'HUTANG', 'PIUTANG', 'RETUR'],
  KBB_PURCHASING: [
    'DASHBOARD', 
    'MR', 
    'PO', 
    'DO', 
    'INVOICE', 
    'HUTANG', 
    'PIUTANG', 
    'KAS_BANK', 
    'RETUR', 
    'INVENTORY', 
    'MASTER_DATA', 
    'AUDIT_LOG'
  ]
};

export const ROLE_INFO: Record<UserRole, { label: string; badgeColor: string; description: string }> = {
  SUPER_ADMIN: {
    label: 'Super Admin',
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Dapat membuka semua menu, menambahkan user, dan memberikan hak akses menu'
  },
  ADMIN_HO: {
    label: 'Admin HO',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Hanya dapat membuka Menu MR, DO (Hanya Status dan Cetak), dan Retur'
  },
  MANAGER_HO: {
    label: 'Manager HO',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Dapat membuka Menu MR, PO, DO, Hutang, Piutang, dan Retur dengan hak persetujuan (Approval)'
  },
  KBB_PURCHASING: {
    label: 'KBB Purchasing',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Dapat membuka semua modul operasional, keuangan & logistik'
  }
};

export function getUserEffectiveMenus(user: User): NavTab[] {
  if (user.allowedMenus && user.allowedMenus.length > 0) {
    return user.allowedMenus;
  }
  return ROLE_DEFAULT_MENUS[user.role] || ROLE_DEFAULT_MENUS.ADMIN_HO;
}

export const COMPANY_PROFILE: CompanyProfile = {
  name: "PT. RAJAWALI TALENTA INDONESIA",
  tagline: "General Contractor, Industrial Supplier & Procurement Services",
  address: "Kawasan Industri MM2100, Jl. Irian Blok E-12 No. 8, Cikarang Barat",
  city: "Bekasi - Jawa Barat",
  postalCode: "17530",
  phone: "+62 21 8983 4567 / +62 21 8983 4568",
  phoneSecondary: "+62 811 8899 7722 (WhatsApp Pengadaan)",
  fax: "+62 21 8983 4569",
  email: "procurement@rajawali-talenta.co.id",
  website: "www.rajawali-talenta.co.id",
  npwp: "01.892.456.7-413.000",
  nib: "9120003481293",
  bankName: "Bank Mandiri (Persero) Tbk",
  bankAccount: "156-00-1289456-1",
  bankHolder: "PT. RAJAWALI TALENTA INDONESIA",
  bankSecondaryName: "Bank Central Asia (BCA)",
  bankSecondaryAccount: "869-052-1199",
  bankSecondaryHolder: "PT. RAJAWALI TALENTA INDONESIA",
  directorName: "Ir. Hendra Gunawan, M.M.",
  directorTitle: "Direktur Utama",
  procurementManager: "Rina Wijaya, S.E.",
  logoText: "RTI",
  defaultTaxRate: 11,
  documentFooterNotes: "Dokumen ini sah dan diterbitkan secara elektronik melalui Sistem ERP PT. Rajawali Talenta Indonesia.",
};

export const INITIAL_USERS: User[] = [
  { 
    id: 'usr-1', 
    name: 'Budi Santoso', 
    email: 'budi.santoso@rajawali.co.id', 
    username: 'superadmin',
    password: 'superadmin123',
    role: 'SUPER_ADMIN', 
    department: 'IT & Sistem Operasional',
    allowedMenus: [
      'DASHBOARD', 
      'MR', 
      'PO', 
      'DO', 
      'INVOICE', 
      'HUTANG', 
      'PIUTANG', 
      'KAS_BANK', 
      'RETUR', 
      'INVENTORY', 
      'MASTER_DATA', 
      'AUDIT_LOG', 
      'USERS', 
      'COMPANY_SETTINGS'
    ]
  },
  { 
    id: 'usr-2', 
    name: 'Siti Aminah', 
    email: 'siti.aminah@rajawali.co.id', 
    username: 'admin.ho',
    password: 'admin123',
    role: 'ADMIN_HO', 
    department: 'Administrasi Head Office',
    allowedMenus: ['MR', 'DO', 'RETUR']
  },
  { 
    id: 'usr-3', 
    name: 'Ir. Hendra Gunawan, M.M.', 
    email: 'hendra.gunawan@rajawali.co.id', 
    username: 'manager.ho',
    password: 'manager123',
    role: 'MANAGER_HO', 
    department: 'General Manager / HO',
    allowedMenus: ['MR', 'PO', 'DO', 'HUTANG', 'PIUTANG', 'RETUR']
  },
  { 
    id: 'usr-4', 
    name: 'Rina Wijaya, S.E.', 
    email: 'rina.w@rajawali.co.id', 
    username: 'kbb.purchasing',
    password: 'purchasing123',
    role: 'KBB_PURCHASING', 
    department: 'Kepala Bagian Purchasing',
    allowedMenus: [
      'DASHBOARD', 
      'MR', 
      'PO', 
      'DO', 
      'INVOICE', 
      'HUTANG', 
      'PIUTANG', 
      'KAS_BANK', 
      'RETUR', 
      'INVENTORY', 
      'MASTER_DATA', 
      'AUDIT_LOG'
    ]
  }
];

export const INITIAL_BANK_ACCOUNTS: BankAccount[] = [
  {
    id: 'acc-1',
    accountCode: 'BANK-01',
    name: 'Bank Mandiri (Persero) Tbk',
    type: 'BANK',
    accountNumber: '156-00-1289456-1',
    holderName: 'PT. RAJAWALI TALENTA INDONESIA',
    bankName: 'Bank Mandiri',
    initialBalance: 0,
    currentBalance: 0,
    isActive: true,
    description: 'Rekening Operasional & Pengadaan Utama'
  },
  {
    id: 'acc-2',
    accountCode: 'BANK-02',
    name: 'Bank Central Asia (BCA)',
    type: 'BANK',
    accountNumber: '869-052-1199',
    holderName: 'PT. RAJAWALI TALENTA INDONESIA',
    bankName: 'BCA',
    initialBalance: 0,
    currentBalance: 0,
    isActive: true,
    description: 'Rekening Penerimaan Pembayaran Klien & Proyek'
  },
  {
    id: 'acc-3',
    accountCode: 'KAS-01',
    name: 'Kas Tunai / Peti Kas Kecil (Petty Cash)',
    type: 'CASH',
    accountNumber: '-',
    holderName: 'Bendahara Kantor PT. RTI',
    bankName: 'Kas Tunai Kantor',
    initialBalance: 0,
    currentBalance: 0,
    isActive: true,
    description: 'Kas Kecil Pengeluaran Operasional Harian Lapangan'
  }
];

export const INITIAL_VENDORS: Vendor[] = [];

export const INITIAL_CUSTOMERS: CustomerClient[] = [];

export const INITIAL_INVENTORY: InventoryItem[] = [];

export const INITIAL_MRS: MaterialRequest[] = [];

export const INITIAL_POS: PurchaseOrder[] = [];

export const INITIAL_DOS: DeliveryOrder[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_PAYABLES: PayableRecord[] = [];

export const INITIAL_RECEIVABLES: ReceivableRecord[] = [];

export const INITIAL_CASH_TRANSACTIONS: CashTransaction[] = [];

export const INITIAL_RETURS: Retur[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];


