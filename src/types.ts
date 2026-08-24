export type UserRole = 'SUPER_ADMIN' | 'ADMIN_HO' | 'MANAGER_HO' | 'KBB_PURCHASING';

export type NavTab = 
  | 'DASHBOARD' 
  | 'MR' 
  | 'PO' 
  | 'DO' 
  | 'INVOICE' 
  | 'HUTANG'
  | 'PIUTANG'
  | 'KAS_BANK'
  | 'RETUR' 
  | 'INVENTORY' 
  | 'MASTER_DATA' 
  | 'AUDIT_LOG' 
  | 'USERS'
  | 'COMPANY_SETTINGS';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  username?: string;
  password?: string;
  avatar?: string;
  allowedMenus?: NavTab[];
}

export type MRStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'PO_CREATED' | 'COMPLETED';

export interface MRItem {
  id: string;
  itemCode: string;
  name: string;
  category: string;
  qty: number;
  unit: string;
  estimatedPrice: number;
  notes?: string;
}

export interface MaterialRequest {
  id: string;
  mrNumber: string;
  requestDate: string;
  requiredDate: string;
  requesterName: string;
  department: string;
  project: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: MRStatus;
  items: MRItem[];
  purpose: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
  poNumberGenerated?: string;
}

export type POStatus = 
  | 'DRAFT' 
  | 'PENDING_APPROVAL' 
  | 'APPROVED' 
  | 'SENT_TO_VENDOR' 
  | 'PARTIALLY_DELIVERED' 
  | 'DELIVERED' 
  | 'INVOICED' 
  | 'CANCELLED';

export interface POItem {
  id: string;
  itemCode: string;
  name: string;
  qty: number;
  receivedQty: number;
  unit: string;
  unitPrice: number;
  discountPercent?: number;
  totalPrice: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  mrReference?: string;
  orderDate: string;
  expectedDeliveryDate: string;
  vendorId: string;
  vendorName: string;
  vendorAddress: string;
  vendorPhone: string;
  vendorEmail: string;
  vendorPic: string;
  vendorNpwp?: string;
  paymentTerms: string; // e.g. 'Net 30', 'Cash on Delivery', '50% DP, 50% On Arrival'
  shippingAddress: string;
  projectOrCostCenter: string;
  items: POItem[];
  subtotal: number;
  discountAmount: number;
  taxRate: number; // e.g. 11%
  taxAmount: number;
  shippingCost: number;
  grandTotal: number;
  currency: string;
  status: POStatus;
  preparedBy: string;
  approvedBy?: string;
  approvedAt?: string;
  notes?: string;
}

export type DOStatus = 'DRAFT' | 'IN_TRANSIT' | 'RECEIVED_FULL' | 'RECEIVED_PARTIAL' | 'REJECTED';

export interface DOItem {
  id: string;
  itemCode: string;
  name: string;
  qtyDispatched: number;
  qtyReceived: number;
  unit: string;
  condition: 'GOOD' | 'DAMAGED' | 'DEFECTIVE' | 'SHORTAGE';
  remarks?: string;
}

export interface DeliveryOrder {
  id: string;
  doNumber: string; // Surat Jalan Number e.g. SJ-2026-08-001
  poNumber: string;
  deliveryDate: string;
  receivedDate?: string;
  senderName: string;
  recipientName: string;
  recipientDepartment: string;
  driverName: string;
  vehiclePlate: string;
  warehouseDestination: string;
  items: DOItem[];
  status: DOStatus;
  receivedBy?: string;
  signatureStamp?: string;
  notes?: string;
  // Fields for Customer / Client deliveries
  isCustomerDelivery?: boolean;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  totalDeliveryValue?: number;
  shippingCost?: number;
}

export type InvoiceStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE' | 'CANCELLED';

export interface PaymentRecord {
  id: string;
  invoiceId?: string;
  paymentDate: string;
  amount: number;
  paymentMethod: 'BANK_TRANSFER' | 'GIRO' | 'CASH' | 'CHEQUE';
  referenceNumber: string;
  bankName: string;
  accountNumber?: string;
  notes?: string;
  recordedBy: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  poNumber: string;
  doNumber?: string;
  vendorName: string;
  vendorBankName: string;
  vendorBankAccount: string;
  vendorBankHolder: string;
  invoiceDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  payments: PaymentRecord[];
  taxInvoiceNumber?: string; // Faktur Pajak
  notes?: string;
}

export type ReturStatus = 'PENDING' | 'APPROVED' | 'ITEM_RETURNED' | 'REFUNDED_REPLACED' | 'REJECTED';

export interface ReturItem {
  id: string;
  itemCode: string;
  name: string;
  qty: number;
  unit: string;
  reason: string;
  action: 'REPLACE' | 'REFUND' | 'CREDIT_NOTE';
}

export interface Retur {
  id: string;
  returNumber: string;
  poNumber: string;
  doNumber?: string;
  vendorName: string;
  returDate: string;
  items: ReturItem[];
  reasonCategory: 'DAMAGED' | 'WRONG_SPEC' | 'EXPIRED' | 'OVER_DELIVERY';
  status: ReturStatus;
  requestedBy: string;
  approvedBy?: string;
  resolutionNotes?: string;
}

export interface StockMovement {
  id: string;
  date: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN';
  qty: number;
  balanceAfter: number;
  referenceDoc: string; // e.g. 'PO-2026-08-001', 'MR-2026-08-002', 'RT-2026-08-001'
  operator: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  category: string;
  specification: string;
  unit: string;
  minStock: number;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  unitPrice: number; // Harga Beli / HPP
  marginPercent?: number; // Margin % (manual input)
  sellingPrice?: number; // Harga Jual (otomatis dihitung dari harga beli + margin)
  warehouseLocation: string; // e.g. 'Gudang Utama - Rak B2'
  lastRestocked: string;
  movements: StockMovement[];
}

export interface Vendor {
  id: string;
  code: string;
  name: string;
  category: string;
  email: string;
  phone: string;
  address: string;
  npwp: string;
  picName: string;
  picPhone: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  paymentTermDefault: string;
  rating: number;
}

export interface CustomerClient {
  id: string;
  code: string;
  name: string;
  companyType: string;
  email: string;
  phone: string;
  address: string;
  projectAssigned: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  module: 'MR' | 'PO' | 'DO' | 'INVOICE' | 'HUTANG' | 'PIUTANG' | 'KAS_BANK' | 'RETUR' | 'INVENTORY' | 'MASTER_DATA' | 'SYSTEM' | 'USERS';
  action: string;
  docNumber?: string;
  details: string;
}

export type DebtStatus = 'UNPAID' | 'PARTIAL' | 'PAID' | 'OVERDUE';

export interface PayableRecord {
  id: string;
  payableNumber: string; // e.g. AP-2026-08-001
  poId?: string;
  poNumber: string;
  vendorId?: string;
  vendorName: string;
  vendorPic?: string;
  vendorPhone?: string;
  vendorBank?: string;
  vendorBankAccount?: string;
  vendorBankHolder?: string;
  orderDate: string;
  dueDate: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number; // subtotal + shippingCost + taxAmount - discountAmount
  paidAmount: number;
  balanceDue: number;
  status: DebtStatus;
  payments: PaymentRecord[];
  notes?: string;
  createdAt: string;
}

export interface ReceivableRecord {
  id: string;
  receivableNumber: string; // e.g. AR-2026-08-001
  doId?: string;
  doNumber?: string;
  invoiceNumber?: string;
  poReference?: string;
  customerId?: string;
  customerName: string;
  customerPic?: string;
  customerPhone?: string;
  customerAddress?: string;
  projectAssigned?: string;
  transactionDate: string;
  dueDate: string;
  subtotal: number;
  shippingCost: number;
  taxAmount: number;
  totalAmount: number;
  receivedAmount: number;
  balanceDue: number;
  status: DebtStatus;
  payments: PaymentRecord[];
  notes?: string;
  createdAt: string;
}

export interface BankAccount {
  id: string;
  accountCode: string; // e.g. KAS-01, BANK-01
  name: string; // e.g. Kas Kecil Operasional, Bank Mandiri PT RTI
  type?: 'CASH' | 'BANK' | 'GIRO' | 'OTHER';
  accountType?: 'BANK' | 'CASH' | 'PETTY_CASH';
  accountNumber: string; // e.g. 156-00-1289456-1
  holderName?: string;
  accountHolder?: string;
  bankName: string;
  branch?: string;
  initialBalance?: number;
  currentBalance: number;
  isActive?: boolean;
  isDefault?: boolean;
  description?: string;
}

export interface CashTransaction {
  id: string;
  transactionNumber: string; // e.g. TRX-2026-08-001
  date: string;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER' | 'ADJUSTMENT';
  category: string; // e.g. Pelunasan Piutang, Pembayaran Hutang PO, Operasional, Gaji, dll
  bankAccountId: string;
  bankAccountName: string;
  destinationBankAccountId?: string;
  destinationBankAccountName?: string;
  amount: number;
  balanceAfter: number;
  referenceDoc?: string;
  recipientOrPayer?: string;
  operator: string;
  notes?: string;
  createdAt: string;
}

export interface CompanyProfile {
  name: string;
  tagline: string;
  address: string;
  city: string;
  postalCode: string;
  phone: string;
  phoneSecondary?: string;
  fax?: string;
  email: string;
  website: string;
  npwp: string;
  nib?: string;
  bankName: string;
  bankAccount: string;
  bankHolder: string;
  bankSecondaryName?: string;
  bankSecondaryAccount?: string;
  bankSecondaryHolder?: string;
  directorName: string;
  directorTitle: string;
  procurementManager?: string;
  logoText: string;
  defaultTaxRate?: number;
  documentFooterNotes?: string;
}

export type PrintableDocType = 'MR' | 'PO' | 'DO' | 'INVOICE' | 'RETUR';

