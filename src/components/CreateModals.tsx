import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  DollarSign, 
  ShoppingCart, 
  FileText, 
  Truck, 
  Receipt, 
  RotateCcw, 
  Boxes, 
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Download,
  Upload,
  FileSpreadsheet,
  Percent,
  TrendingUp,
  Check
} from 'lucide-react';
import { 
  Vendor, 
  CustomerClient, 
  InventoryItem, 
  MaterialRequest, 
  PurchaseOrder, 
  DeliveryOrder, 
  Invoice, 
  MRItem, 
  POItem, 
  DOItem, 
  Retur,
  ReturItem, 
  User 
} from '../types';
import { 
  formatRupiah, 
  generateDocNumber, 
  getCurrentTimestamp,
  downloadMaterialCSVTemplate,
  parseMaterialCSV,
  ParsedMaterialRow
} from '../lib/utils';

// 1. CREATE MR MODAL
export const CreateMRModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (mr: Omit<MaterialRequest, 'id'>) => void;
  currentUser: User;
  inventory: InventoryItem[];
  existingMRCount: number;
}> = ({ isOpen, onClose, onSubmit, currentUser, inventory, existingMRCount }) => {
  if (!isOpen) return null;

  const [project, setProject] = useState('Proyek Konstruksi Gedung Rajawali Tower');
  const [department, setDepartment] = useState(currentUser.department);
  const [requiredDate, setRequiredDate] = useState(new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10));
  const [priority, setPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('HIGH');
  const [purpose, setPurpose] = useState('Kebutuhan material pengecoran dan struktur');
  const [items, setItems] = useState<Omit<MRItem, 'id'>[]>([
    {
      itemCode: inventory[0]?.itemCode || 'MAT-001',
      name: inventory[0]?.name || 'Besi Beton',
      category: inventory[0]?.category || 'Konstruksi',
      qty: 100,
      unit: inventory[0]?.unit || 'Batang',
      estimatedPrice: inventory[0]?.unitPrice || 150000,
      notes: ''
    }
  ]);

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        itemCode: 'MAT-GEN',
        name: '',
        category: 'Umum',
        qty: 1,
        unit: 'Pcs',
        estimatedPrice: 0,
        notes: ''
      }
    ]);
  };

  const handleSelectItemFromCatalog = (idx: number, itemCode: string) => {
    const found = inventory.find(i => i.itemCode === itemCode);
    if (!found) return;
    const updated = [...items];
    updated[idx] = {
      ...updated[idx],
      itemCode: found.itemCode,
      name: found.name,
      category: found.category,
      unit: found.unit,
      estimatedPrice: found.unitPrice
    };
    setItems(updated);
  };

  const handleRemoveItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || items.some(i => !i.name || i.qty <= 0)) {
      alert("Pastikan seluruh item memiliki nama dan jumlah yang valid.");
      return;
    }

    const mrNumber = generateDocNumber('MR', existingMRCount);
    onSubmit({
      mrNumber,
      requestDate: new Date().toISOString().slice(0, 10),
      requiredDate,
      requesterName: currentUser.name,
      department,
      project,
      priority,
      status: 'PENDING_APPROVAL',
      purpose,
      items: items.map((it, idx) => ({ ...it, id: `mri-${Date.now()}-${idx}` }))
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-base">Formulir Pengajuan Material Request (MR)</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1 text-slate-700">Nama Pemohon (Requester):</label>
              <input type="text" readOnly value={currentUser.name} className="w-full p-2.5 bg-slate-100 rounded-lg border border-slate-300 font-semibold" />
            </div>
            <div>
              <label className="font-bold block mb-1 text-slate-700">Departemen:</label>
              <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300" />
            </div>
            <div>
              <label className="font-bold block mb-1 text-slate-700">Alokasi Proyek / Site:</label>
              <input type="text" required value={project} onChange={(e) => setProject(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300 font-bold" />
            </div>
            <div>
              <label className="font-bold block mb-1 text-slate-700">Tenggat Waktu Dibutuhkan (Target):</label>
              <input type="date" required value={requiredDate} onChange={(e) => setRequiredDate(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300" />
            </div>
            <div>
              <label className="font-bold block mb-1 text-slate-700">Prioritas Kebutuhan:</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as any)} className="w-full p-2.5 rounded-lg border border-slate-300 font-bold">
                <option value="LOW">LOW (Rendah)</option>
                <option value="MEDIUM">MEDIUM (Normal)</option>
                <option value="HIGH">HIGH (Penting)</option>
                <option value="URGENT">URGENT (Mendesak)</option>
              </select>
            </div>
            <div>
              <label className="font-bold block mb-1 text-slate-700">Tujuan & Penggunaan Material:</label>
              <input type="text" required value={purpose} onChange={(e) => setPurpose(e.target.value)} className="w-full p-2.5 rounded-lg border border-slate-300" />
            </div>
          </div>

          {/* Item List */}
          <div className="pt-3 border-t border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-slate-900 uppercase text-[11px]">Daftar Material Yang Diminta:</h4>
              <button type="button" onClick={handleAddItem} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-800 rounded-lg font-bold hover:bg-blue-100 cursor-pointer border border-blue-200">
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Baris</span>
              </button>
            </div>

            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-3">
                    <label className="text-[10px] text-slate-500 block">Pilih dari Katalog:</label>
                    <select 
                      value={it.itemCode} 
                      onChange={(e) => handleSelectItemFromCatalog(idx, e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs"
                    >
                      <option value="CUSTOM">-- Custom Item --</option>
                      {inventory.map(inv => (
                        <option key={inv.id} value={inv.itemCode}>{inv.name} ({inv.itemCode})</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-4">
                    <label className="text-[10px] text-slate-500 block">Nama Material / Spesifikasi:</label>
                    <input 
                      type="text" 
                      required 
                      value={it.name} 
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].name = e.target.value;
                        setItems(copy);
                      }}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-semibold"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-500 block">Jumlah:</label>
                    <input 
                      type="number" 
                      min={1} 
                      required 
                      value={it.qty} 
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].qty = Number(e.target.value);
                        setItems(copy);
                      }}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs font-bold text-center"
                    />
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-500 block">Satuan:</label>
                    <input 
                      type="text" 
                      value={it.unit} 
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].unit = e.target.value;
                        setItems(copy);
                      }}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded text-xs text-center"
                    />
                  </div>

                  <div className="col-span-1 text-right pt-4">
                    <button 
                      type="button" 
                      onClick={() => handleRemoveItem(idx)}
                      disabled={items.length <= 1}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded cursor-pointer disabled:opacity-30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Batal</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl cursor-pointer shadow-md">Kirim Pengajuan MR</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// 2. CREATE PO MODAL
export interface CreatePOItemRow {
  itemCode: string;
  name: string;
  qty: number;
  receivedQty: number;
  unit: string;
  unitPrice: number;
  totalPrice: number;
  notes?: string;
  vendorId: string;
}

export const CreatePOModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (po: Omit<PurchaseOrder, 'id'> | Omit<PurchaseOrder, 'id'>[]) => void;
  currentUser: User;
  vendors: Vendor[];
  inventory: InventoryItem[];
  mrs?: MaterialRequest[];
  existingPOCount: number;
  initialMR?: MaterialRequest | null;
}> = ({ isOpen, onClose, onSubmit, currentUser, vendors, inventory, mrs = [], existingPOCount, initialMR }) => {
  if (!isOpen) return null;

  const [selectedVendorId, setSelectedVendorId] = useState(vendors[0]?.id || '');
  const [mrReference, setMrReference] = useState(initialMR?.mrNumber || '');
  const [projectOrCostCenter, setProjectOrCostCenter] = useState(initialMR?.project || 'Proyek Lapangan MM2100');
  const [paymentTerms, setPaymentTerms] = useState(vendors[0]?.paymentTermDefault || 'Net 30 Days');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(new Date(Date.now() + 5 * 86400000).toISOString().slice(0, 10));
  const [shippingAddress, setShippingAddress] = useState('Gudang Logistik PT. Rajawali Talenta Indonesia, Kawasan Industri MM2100 Cikarang');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [notes, setNotes] = useState('Harus menyertakan surat jalan asli dan sertifikat uji pabrik.');
  const [loadedMRNotice, setLoadedMRNotice] = useState<string | null>(initialMR ? `Data ${initialMR.items.length} item dari ${initialMR.mrNumber} berhasil dimuat otomatis` : null);

  const [items, setItems] = useState<CreatePOItemRow[]>(() => {
    if (initialMR && initialMR.items.length > 0) {
      return initialMR.items.map(it => ({
        itemCode: it.itemCode,
        name: it.name,
        qty: it.qty,
        receivedQty: 0,
        unit: it.unit,
        unitPrice: it.estimatedPrice,
        totalPrice: it.qty * it.estimatedPrice,
        notes: it.notes || '',
        vendorId: vendors[0]?.id || ''
      }));
    }
    return [
      {
        itemCode: inventory[0]?.itemCode || 'MAT-001',
        name: inventory[0]?.name || 'Besi Beton D16 SNI',
        qty: 100,
        receivedQty: 0,
        unit: inventory[0]?.unit || 'Batang',
        unitPrice: inventory[0]?.unitPrice || 185000,
        totalPrice: 100 * (inventory[0]?.unitPrice || 185000),
        notes: '',
        vendorId: vendors[0]?.id || ''
      }
    ];
  });

  const selectedVendor = vendors.find(v => v.id === selectedVendorId) || vendors[0];

  useEffect(() => {
    if (selectedVendor) {
      setPaymentTerms(selectedVendor.paymentTermDefault);
    }
  }, [selectedVendorId]);

  // Handler for MR selection from dropdown or typed input
  const handleSelectMR = (mrNum: string) => {
    setMrReference(mrNum);
    if (!mrNum || mrNum === 'MANUAL') {
      setLoadedMRNotice(null);
      return;
    }

    const matchedMR = mrs.find(m => m.mrNumber.toLowerCase() === mrNum.trim().toLowerCase());
    if (matchedMR) {
      setProjectOrCostCenter(matchedMR.project);
      setNotes(`Ref: ${matchedMR.mrNumber} (${matchedMR.project}) - ${matchedMR.purpose}`);
      if (matchedMR.items && matchedMR.items.length > 0) {
        setItems(matchedMR.items.map(it => ({
          itemCode: it.itemCode,
          name: it.name,
          qty: it.qty,
          receivedQty: 0,
          unit: it.unit,
          unitPrice: it.estimatedPrice,
          totalPrice: it.qty * it.estimatedPrice,
          notes: it.notes || '',
          vendorId: selectedVendorId
        })));
        setLoadedMRNotice(`✓ Berhasil memuat ${matchedMR.items.length} item material secara otomatis dari ${matchedMR.mrNumber}`);
      }
    }
  };

  const handleApplyVendorToAll = (vendorId: string) => {
    setItems(items.map(it => ({ ...it, vendorId })));
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        itemCode: 'MAT-NEW',
        name: '',
        qty: 1,
        receivedQty: 0,
        unit: 'Pcs',
        unitPrice: 0,
        totalPrice: 0,
        notes: '',
        vendorId: selectedVendorId
      }
    ]);
  };

  const handleUpdateItem = (idx: number, field: keyof CreatePOItemRow, value: any) => {
    const updated = [...items];
    updated[idx] = { ...updated[idx], [field]: value };
    if (field === 'qty' || field === 'unitPrice') {
      updated[idx].totalPrice = Number(updated[idx].qty || 0) * Number(updated[idx].unitPrice || 0);
    }
    setItems(updated);
  };

  // Group items by vendorId
  const vendorGroups = items.reduce((acc, it) => {
    const vId = it.vendorId || selectedVendorId;
    if (!acc[vId]) acc[vId] = [];
    acc[vId].push(it);
    return acc;
  }, {} as Record<string, CreatePOItemRow[]>);

  const distinctVendorIds = Object.keys(vendorGroups);
  const isMultiVendor = distinctVendorIds.length > 1;

  const subtotal = items.reduce((acc, it) => acc + it.totalPrice, 0);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = taxableAmount * 0.11;
  const grandTotal = taxableAmount + taxAmount + shippingCost;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || items.some(i => !i.name || i.qty <= 0 || i.unitPrice <= 0)) {
      alert("Pastikan seluruh item memiliki nama, jumlah, dan harga satuan valid.");
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const createdPOs: Omit<PurchaseOrder, 'id'>[] = [];

    distinctVendorIds.forEach((vId, vIndex) => {
      const vVendor = vendors.find(v => v.id === vId) || selectedVendor;
      const vItems = vendorGroups[vId];
      const vSubtotal = vItems.reduce((acc, it) => acc + it.totalPrice, 0);
      const vTaxable = Math.max(0, vSubtotal);
      const vTaxAmount = vTaxable * 0.11;
      const vGrandTotal = vTaxable + vTaxAmount;
      const poNum = generateDocNumber('PO', existingPOCount + vIndex);

      createdPOs.push({
        poNumber: poNum,
        mrReference: mrReference || undefined,
        orderDate: todayStr,
        expectedDeliveryDate,
        vendorId: vVendor.id,
        vendorName: vVendor.name,
        vendorAddress: vVendor.address,
        vendorPhone: vVendor.phone,
        vendorEmail: vVendor.email,
        vendorPic: `${vVendor.picName} (${vVendor.picPhone})`,
        vendorNpwp: vVendor.npwp,
        paymentTerms: vVendor.paymentTermDefault || paymentTerms,
        shippingAddress,
        projectOrCostCenter,
        items: vItems.map((it, idx) => ({
          id: `poi-${Date.now()}-${vIndex}-${idx}`,
          itemCode: it.itemCode,
          name: it.name,
          qty: it.qty,
          receivedQty: 0,
          unit: it.unit,
          unitPrice: it.unitPrice,
          totalPrice: it.totalPrice,
          notes: it.notes
        })),
        subtotal: vSubtotal,
        discountAmount: 0,
        taxRate: 0.11,
        taxAmount: vTaxAmount,
        shippingCost: vIndex === 0 ? shippingCost : 0,
        grandTotal: vGrandTotal + (vIndex === 0 ? shippingCost : 0),
        currency: 'IDR',
        status: 'PENDING_APPROVAL',
        preparedBy: currentUser.name,
        notes: notes
      });
    });

    if (createdPOs.length === 1) {
      onSubmit(createdPOs[0]);
    } else {
      onSubmit(createdPOs);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base">Pembuatan Surat Pesanan Pembelian (Purchase Order)</h3>
              <p className="text-[11px] text-slate-400">Pilih referensi MR & tetapkan supplier rekanan per masing-masing item</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          {/* MR Auto-populate & Project Info Header */}
          <div className="bg-blue-50/80 p-4 rounded-xl border border-blue-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 flex items-center gap-1.5 text-xs">
                <FileText className="w-4 h-4 text-blue-700" />
                1. Hubungkan Referensi Material Request (MR Otomatis)
              </span>
              {loadedMRNotice && (
                <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {loadedMRNotice}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Dropdown MR Selector */}
              <div>
                <label className="font-bold block mb-1 text-slate-700">Pilih dari Daftar MR Terdaftar:</label>
                <select
                  value={mrReference}
                  onChange={(e) => handleSelectMR(e.target.value)}
                  className="w-full p-2 bg-white rounded-lg border border-blue-300 font-bold text-blue-900 shadow-2xs"
                >
                  <option value="">-- Pilih Material Request / Manual --</option>
                  {mrs.map(m => (
                    <option key={m.id} value={m.mrNumber}>
                      {m.mrNumber} - {m.project} ({m.items.length} item) [{m.status}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Or type MR number directly */}
              <div>
                <label className="font-bold block mb-1 text-slate-700">Atau Ketik Nomor MR:</label>
                <input
                  type="text"
                  placeholder="misal: MR-2026-08-001"
                  value={mrReference}
                  onChange={(e) => handleSelectMR(e.target.value)}
                  className="w-full p-2 bg-white rounded-lg border border-slate-300 font-mono text-blue-950 font-bold"
                />
              </div>

              {/* Project name */}
              <div>
                <label className="font-bold block mb-1 text-slate-700">Alokasi Proyek / Cost Center *:</label>
                <input
                  type="text"
                  required
                  value={projectOrCostCenter}
                  onChange={(e) => setProjectOrCostCenter(e.target.value)}
                  className="w-full p-2 bg-white rounded-lg border border-slate-300 font-bold"
                />
              </div>
            </div>
          </div>

          {/* Vendor Default & PO Logistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="font-bold block mb-1 text-slate-700">Vendor Utama (Default):</label>
              <div className="flex gap-1.5">
                <select
                  value={selectedVendorId}
                  onChange={(e) => {
                    setSelectedVendorId(e.target.value);
                  }}
                  className="w-full p-2 bg-white rounded-lg border border-slate-300 font-bold"
                >
                  {vendors.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.category})</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => handleApplyVendorToAll(selectedVendorId)}
                  title="Terapkan vendor ini ke seluruh baris item di bawah"
                  className="px-2 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 rounded-lg font-bold text-[10px] whitespace-nowrap cursor-pointer"
                >
                  Set Semua
                </button>
              </div>
            </div>

            <div>
              <label className="font-bold block mb-1 text-slate-700">Syarat Pembayaran:</label>
              <input
                type="text"
                required
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(e.target.value)}
                className="w-full p-2 bg-white rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold block mb-1 text-slate-700">Target Tanggal Pengiriman:</label>
              <input
                type="date"
                required
                value={expectedDeliveryDate}
                onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                className="w-full p-2 bg-white rounded-lg border border-slate-300 font-bold"
              />
            </div>

            <div>
              <label className="font-bold block mb-1 text-slate-700">PIC & Kontak Vendor Utama:</label>
              <input
                type="text"
                readOnly
                value={selectedVendor ? `${selectedVendor.picName} (${selectedVendor.picPhone})` : ''}
                className="w-full p-2 bg-slate-100 rounded-lg border border-slate-300 text-slate-600 truncate"
              />
            </div>
          </div>

          {/* Items table with Supplier Selection Per Item */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-slate-900 uppercase text-[11px]">
                  Rincian Material & Pemilihan Supplier Per Item:
                </h4>
                <span className="text-[10px] text-slate-500 font-medium">
                  ({items.length} Item Material)
                </span>
              </div>
              <button 
                type="button" 
                onClick={handleAddItem} 
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-900 rounded-lg font-bold hover:bg-amber-100 cursor-pointer border border-amber-300 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Tambah Baris Manual</span>
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {items.map((it, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center hover:border-slate-300 transition-colors">
                  
                  {/* Item Name */}
                  <div className="col-span-3">
                    <label className="text-[10px] text-slate-500 font-semibold block">Nama Barang / Material:</label>
                    <input
                      type="text"
                      required
                      value={it.name}
                      onChange={(e) => handleUpdateItem(idx, 'name', e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-xs text-slate-900"
                    />
                  </div>

                  {/* Supplier Per Item Selector */}
                  <div className="col-span-3">
                    <label className="text-[10px] text-purple-700 font-bold block">Supplier / Rekanan Item Ini:</label>
                    <select
                      value={it.vendorId || selectedVendorId}
                      onChange={(e) => handleUpdateItem(idx, 'vendorId', e.target.value)}
                      className="w-full p-1.5 bg-white border border-purple-300 rounded-lg font-bold text-purple-950 text-xs shadow-2xs"
                    >
                      {vendors.map(v => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Qty & Unit */}
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-500 font-semibold block">Qty & Satuan:</label>
                    <div className="flex gap-1">
                      <input
                        type="number"
                        min={1}
                        required
                        value={it.qty}
                        onChange={(e) => handleUpdateItem(idx, 'qty', Number(e.target.value))}
                        className="w-16 p-1.5 bg-white border border-slate-300 rounded-lg font-bold text-center text-xs"
                      />
                      <input
                        type="text"
                        value={it.unit}
                        onChange={(e) => handleUpdateItem(idx, 'unit', e.target.value)}
                        className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-center text-xs"
                      />
                    </div>
                  </div>

                  {/* Unit Price */}
                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-500 font-semibold block">Harga Satuan (Rp):</label>
                    <input
                      type="number"
                      min={0}
                      required
                      value={it.unitPrice}
                      onChange={(e) => handleUpdateItem(idx, 'unitPrice', Number(e.target.value))}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded-lg text-right font-mono font-bold text-xs"
                    />
                  </div>

                  {/* Line Total */}
                  <div className="col-span-1 text-right">
                    <label className="text-[10px] text-slate-500 font-semibold block">Total:</label>
                    <span className="font-mono font-bold text-slate-900 text-xs block pt-1.5">{formatRupiah(it.totalPrice)}</span>
                  </div>

                  {/* Delete Row Button */}
                  <div className="col-span-1 text-right pt-3">
                    <button
                      type="button"
                      onClick={() => items.length > 1 && setItems(items.filter((_, i) => i !== idx))}
                      disabled={items.length <= 1}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer disabled:opacity-30"
                      title="Hapus baris item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              ))}
            </div>
          </div>

          {/* Multi-Supplier Distribution Detection Card */}
          {isMultiVendor ? (
            <div className="p-4 bg-gradient-to-r from-purple-50 via-amber-50 to-blue-50 rounded-xl border-2 border-purple-300 shadow-sm space-y-2">
              <div className="flex items-center gap-2 text-purple-900 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Multi-Supplier Terdeteksi: Sistem akan menerbitkan {distinctVendorIds.length} Surat PO Terpisah Secara Otomatis!</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                {distinctVendorIds.map((vId, idx) => {
                  const vObj = vendors.find(v => v.id === vId);
                  const vItems = vendorGroups[vId];
                  const vSum = vItems.reduce((acc, it) => acc + it.totalPrice, 0);
                  return (
                    <div key={vId} className="bg-white p-2.5 rounded-lg border border-purple-200 shadow-2xs">
                      <div className="font-bold text-purple-950 truncate">
                        PO #{idx + 1}: {vObj?.name}
                      </div>
                      <div className="text-[11px] text-slate-600 flex justify-between mt-1">
                        <span>{vItems.length} Jenis Material</span>
                        <span className="font-mono font-bold text-slate-900">{formatRupiah(vSum * 1.11)} (PPN)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-900 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Seluruh item ditujukan ke 1 Supplier: <strong>{vendors.find(v => v.id === distinctVendorIds[0])?.name || selectedVendor?.name}</strong></span>
              </div>
              <span className="text-[11px] text-emerald-700 font-mono">1 PO Resmi Akan Diterbitkan</span>
            </div>
          )}

          {/* Pricing summary */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="font-bold block mb-1 text-slate-700">Catatan PO / Instruksi Pengiriman:</label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2 bg-white border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="space-y-1.5 text-right font-semibold">
              <div className="flex justify-between">
                <span className="text-slate-600">Total Akumulasi Material:</span>
                <span className="font-mono text-slate-900">{formatRupiah(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Diskon Pembelian (Rp):</span>
                <input
                  type="number"
                  min={0}
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                  className="w-32 p-1 bg-white border border-slate-300 rounded text-right font-mono text-xs"
                />
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">PPN (11%):</span>
                <span className="font-mono text-slate-900">{formatRupiah(taxAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600">Ongkos Kirim Armada (Rp):</span>
                <input
                  type="number"
                  min={0}
                  value={shippingCost}
                  onChange={(e) => setShippingCost(Number(e.target.value))}
                  className="w-32 p-1 bg-white border border-slate-300 rounded text-right font-mono text-xs"
                />
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-slate-900 text-sm font-extrabold text-blue-950">
                <span>TOTAL AKUMULASI PENGADAAN:</span>
                <span className="font-mono text-base">{formatRupiah(grandTotal)}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t flex items-center justify-between">
            <span className="text-slate-500 text-xs">
              {isMultiVendor ? `⚡ Akan menerbitkan ${distinctVendorIds.length} PO terpisah` : 'Akan menerbitkan 1 PO'}
            </span>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">
                Batal
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl cursor-pointer shadow-md shadow-amber-600/30 flex items-center gap-1.5"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>
                  {isMultiVendor ? `Terbitkan ${distinctVendorIds.length} Purchase Order Terpisah` : 'Terbitkan Purchase Order Resmi'}
                </span>
              </button>
            </div>
          </div>

        </form>
      </div>
    </div>
  );
};


// 3. CREATE DO MODAL
export const CreateDOModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (doDoc: Omit<DeliveryOrder, 'id'>) => void;
  currentUser: User;
  pos: PurchaseOrder[];
  existingDOCount: number;
  initialPO?: PurchaseOrder | null;
}> = ({ isOpen, onClose, onSubmit, currentUser, pos, existingDOCount, initialPO }) => {
  if (!isOpen) return null;

  const validPOs = pos.filter(p => p.status === 'APPROVED' || p.status === 'SENT_TO_VENDOR' || p.status === 'PARTIALLY_DELIVERED');
  const [selectedPONumber, setSelectedPONumber] = useState(initialPO?.poNumber || validPOs[0]?.poNumber || pos[0]?.poNumber || '');

  const selectedPO = pos.find(p => p.poNumber === selectedPONumber);

  const [driverName, setDriverName] = useState('Budi Setiawan');
  const [vehiclePlate, setVehiclePlate] = useState('B 9481 KDA');
  const [warehouseDestination, setWarehouseDestination] = useState('Gudang Logistik Cikarang MM2100');
  const [notes, setNotes] = useState('Barang tiba dalam keadaan tersegel baik.');

  const [items, setItems] = useState<Omit<DOItem, 'id'>[]>(() => {
    if (selectedPO) {
      return selectedPO.items.map(it => ({
        itemCode: it.itemCode,
        name: it.name,
        qtyDispatched: it.qty,
        qtyReceived: it.qty,
        unit: it.unit,
        condition: 'GOOD',
        remarks: 'Kondisi fisik mulus sesuai spek'
      }));
    }
    return [];
  });

  useEffect(() => {
    if (selectedPO) {
      setItems(selectedPO.items.map(it => ({
        itemCode: it.itemCode,
        name: it.name,
        qtyDispatched: it.qty,
        qtyReceived: it.qty,
        unit: it.unit,
        condition: 'GOOD',
        remarks: 'Kondisi fisik mulus'
      })));
    }
  }, [selectedPONumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) {
      alert("Pilih nomor PO yang valid.");
      return;
    }

    const doNumber = generateDocNumber('SJ', existingDOCount);

    onSubmit({
      doNumber,
      poNumber: selectedPO.poNumber,
      deliveryDate: new Date().toISOString().slice(0, 10),
      receivedDate: getCurrentTimestamp(),
      senderName: selectedPO.vendorName,
      recipientName: currentUser.name,
      recipientDepartment: currentUser.department,
      driverName,
      vehiclePlate,
      warehouseDestination,
      status: 'RECEIVED_FULL',
      receivedBy: currentUser.name,
      notes,
      items: items.map((it, idx) => ({ ...it, id: `doi-${Date.now()}-${idx}` }))
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Pencatatan Surat Jalan (DO) & Tanda Terima Barang</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="font-bold block mb-1 text-slate-700">Pilih Referensi Purchase Order (PO) *:</label>
              <select
                value={selectedPONumber}
                onChange={(e) => setSelectedPONumber(e.target.value)}
                className="w-full p-2 bg-white rounded-lg border border-slate-300 font-mono font-bold text-blue-900"
              >
                {pos.map(p => (
                  <option key={p.id} value={p.poNumber}>{p.poNumber} - {p.vendorName} ({formatRupiah(p.grandTotal)})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold block mb-1 text-slate-700">Gudang Tujuan Penerimaan:</label>
              <input
                type="text"
                required
                value={warehouseDestination}
                onChange={(e) => setWarehouseDestination(e.target.value)}
                className="w-full p-2 bg-white rounded-lg border border-slate-300 font-bold"
              />
            </div>

            <div>
              <label className="font-bold block mb-1 text-slate-700">Nama Pengemudi / Ekspedisi:</label>
              <input
                type="text"
                required
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                className="w-full p-2 bg-white rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold block mb-1 text-slate-700">Nomor Polisi Kendaraan (Plat):</label>
              <input
                type="text"
                required
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                className="w-full p-2 bg-white rounded-lg border border-slate-300 font-mono font-bold"
              />
            </div>
          </div>

          {/* Items Check */}
          <div>
            <h4 className="font-bold text-slate-900 uppercase text-[11px] mb-2">Verifikasi Fisik Jumlah & Kondisi Barang:</h4>
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <span className="font-bold text-slate-900 block">{it.name}</span>
                    <span className="font-mono text-[10px] text-slate-500">{it.itemCode}</span>
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-500 block">Qty Diterima:</label>
                    <input
                      type="number"
                      min={0}
                      value={it.qtyReceived}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].qtyReceived = Number(e.target.value);
                        setItems(copy);
                      }}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded font-bold text-center text-xs"
                    />
                  </div>

                  <div className="col-span-3">
                    <label className="text-[10px] text-slate-500 block">Kondisi Fisik:</label>
                    <select
                      value={it.condition}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].condition = e.target.value as any;
                        setItems(copy);
                      }}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded font-bold text-xs"
                    >
                      <option value="GOOD">BAIK / LENGKAP</option>
                      <option value="DAMAGED">RUSAK / CACAT</option>
                      <option value="SHORTAGE">KURANG KIRIM</option>
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="text-[10px] text-slate-500 block">Catatan:</label>
                    <input
                      type="text"
                      value={it.remarks}
                      onChange={(e) => {
                        const copy = [...items];
                        copy[idx].remarks = e.target.value;
                        setItems(copy);
                      }}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded text-[11px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Batal</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer shadow-md">Simpan Surat Jalan & Update Stok</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// 4. CREATE INVOICE MODAL
export const CreateInvoiceModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (inv: Omit<Invoice, 'id'>) => void;
  pos: PurchaseOrder[];
  existingInvoiceCount: number;
  initialPO?: PurchaseOrder | null;
}> = ({ isOpen, onClose, onSubmit, pos, existingInvoiceCount, initialPO }) => {
  if (!isOpen) return null;

  const [selectedPONumber, setSelectedPONumber] = useState(initialPO?.poNumber || pos[0]?.poNumber || '');
  const selectedPO = pos.find(p => p.poNumber === selectedPONumber) || pos[0];

  const [dueDate, setDueDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10));
  const [taxInvoiceNumber, setTaxInvoiceNumber] = useState(`010.002-26.${Math.floor(10000000 + Math.random() * 90000000)}`);
  const [totalAmount, setTotalAmount] = useState(selectedPO ? selectedPO.grandTotal : 0);
  const [notes, setNotes] = useState('Tagihan sesuai PO dan Surat Jalan.');

  useEffect(() => {
    if (selectedPO) {
      setTotalAmount(selectedPO.grandTotal);
    }
  }, [selectedPONumber]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;

    const invoiceNumber = generateDocNumber('INV', existingInvoiceCount);

    onSubmit({
      invoiceNumber,
      poNumber: selectedPO.poNumber,
      vendorName: selectedPO.vendorName,
      vendorBankName: 'Bank Mandiri / BCA',
      vendorBankAccount: '156-00-887766-1',
      vendorBankHolder: selectedPO.vendorName,
      invoiceDate: new Date().toISOString().slice(0, 10),
      dueDate,
      totalAmount,
      paidAmount: 0,
      balanceDue: totalAmount,
      status: 'UNPAID',
      payments: [],
      taxInvoiceNumber,
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-base">Pencatatan Faktur Tagihan Vendor (Invoice)</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold block mb-1 text-slate-700">Pilih Referensi Purchase Order (PO):</label>
            <select
              value={selectedPONumber}
              onChange={(e) => setSelectedPONumber(e.target.value)}
              className="w-full p-2.5 bg-white rounded-lg border border-slate-300 font-mono font-bold"
            >
              {pos.map(p => (
                <option key={p.id} value={p.poNumber}>{p.poNumber} - {p.vendorName} ({formatRupiah(p.grandTotal)})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1 text-slate-700">Tanggal Jatuh Tempo:</label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>
            <div>
              <label className="font-bold block mb-1 text-slate-700">No. Faktur Pajak Resmi:</label>
              <input
                type="text"
                value={taxInvoiceNumber}
                onChange={(e) => setTaxInvoiceNumber(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1 text-slate-700">Total Nominal Tagihan (Termasuk PPN):</label>
            <input
              type="number"
              required
              min={1}
              value={totalAmount}
              onChange={(e) => setTotalAmount(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold text-rose-700 text-sm"
            />
          </div>

          <div className="pt-4 border-t flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Batal</button>
            <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer shadow-md">Simpan Invoice</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// 5. PAYMENT MODAL
export const PaymentModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice | null;
  onRecordPayment: (invoiceId: string, paymentData: any) => void;
  currentUser: User;
}> = ({ isOpen, onClose, invoice, onRecordPayment, currentUser }) => {
  if (!isOpen || !invoice) return null;

  const [amount, setAmount] = useState(invoice.balanceDue);
  const [paymentMethod, setPaymentMethod] = useState<'BANK_TRANSFER' | 'GIRO' | 'CASH'>('BANK_TRANSFER');
  const [bankName, setBankName] = useState('Bank Mandiri (Persero) Tbk');
  const [referenceNumber, setReferenceNumber] = useState(`TRF-${Date.now().toString().slice(-6)}`);
  const [notes, setNotes] = useState('Pelunasan tagihan pengadaan');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || amount > invoice.balanceDue) {
      alert(`Nominal pembayaran harus di antara 1 dan ${formatRupiah(invoice.balanceDue)}`);
      return;
    }

    onRecordPayment(invoice.id, {
      paymentDate: getCurrentTimestamp(),
      amount,
      paymentMethod,
      referenceNumber,
      bankName,
      notes,
      recordedBy: currentUser.name
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-sm">Pencatatan Pembayaran Invoice: {invoice.invoiceNumber}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-600">Vendor Penerima:</span>
              <span className="font-bold text-slate-900">{invoice.vendorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Sisa Hutang:</span>
              <span className="font-mono font-bold text-rose-700">{formatRupiah(invoice.balanceDue)}</span>
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1 text-slate-700">Nominal Pembayaran (Rp) *:</label>
            <input
              type="number"
              required
              min={1000}
              max={invoice.balanceDue}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold text-emerald-700 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1 text-slate-700">Metode Pembayaran:</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-bold"
              >
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="GIRO">Bilyet Giro</option>
                <option value="CASH">Kas Tunai (Petty Cash)</option>
              </select>
            </div>
            <div>
              <label className="font-bold block mb-1 text-slate-700">Nomor Referensi Transfer / Giro:</label>
              <input
                type="text"
                required
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1 text-slate-700">Rekening Bank Asal (PT. RTI):</label>
            <input
              type="text"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div className="pt-4 border-t flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Batal</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer shadow-md">Konfirmasi Bayar</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// 6. CREATE RETUR MODAL
export const CreateReturModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (retur: Omit<Retur, 'id'>) => void;
  currentUser: User;
  pos: PurchaseOrder[];
  existingReturCount: number;
  initialDO?: DeliveryOrder | null;
}> = ({ isOpen, onClose, onSubmit, currentUser, pos, existingReturCount, initialDO }) => {
  if (!isOpen) return null;

  const [selectedPONumber, setSelectedPONumber] = useState(initialDO?.poNumber || pos[0]?.poNumber || '');
  const selectedPO = pos.find(p => p.poNumber === selectedPONumber) || pos[0];

  const [reasonCategory, setReasonCategory] = useState<'DAMAGED' | 'WRONG_SPEC' | 'EXPIRED' | 'OVER_DELIVERY'>('DAMAGED');
  const [returItemName, setReturItemName] = useState(selectedPO?.items[0]?.name || 'Material Rusak');
  const [qty, setQty] = useState(1);
  const [unit, setUnit] = useState(selectedPO?.items[0]?.unit || 'Pcs');
  const [reasonText, setReasonText] = useState('Kondisi fisik cacat dan berkarat saat diturunkan dari truk.');
  const [action, setAction] = useState<'REPLACE' | 'REFUND' | 'CREDIT_NOTE'>('REPLACE');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPO) return;

    const returNumber = generateDocNumber('RT', existingReturCount);

    onSubmit({
      returNumber,
      poNumber: selectedPO.poNumber,
      doNumber: initialDO?.doNumber || undefined,
      vendorName: selectedPO.vendorName,
      returDate: new Date().toISOString().slice(0, 10),
      reasonCategory,
      status: 'PENDING',
      requestedBy: currentUser.name,
      items: [
        {
          id: `rti-${Date.now()}`,
          itemCode: selectedPO.items[0]?.itemCode || 'MAT-RT',
          name: returItemName,
          qty,
          unit,
          reason: reasonText,
          action
        }
      ]
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-base">Pengajuan Berita Acara Retur Barang</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="font-bold block mb-1 text-slate-700">Referensi PO / Surat Jalan:</label>
            <select
              value={selectedPONumber}
              onChange={(e) => setSelectedPONumber(e.target.value)}
              className="w-full p-2.5 bg-white rounded-lg border border-slate-300 font-mono font-bold"
            >
              {pos.map(p => (
                <option key={p.id} value={p.poNumber}>{p.poNumber} - {p.vendorName}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1 text-slate-700">Kategori Alasan Retur:</label>
              <select
                value={reasonCategory}
                onChange={(e) => setReasonCategory(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-bold"
              >
                <option value="DAMAGED">Barang Rusak / Cacat</option>
                <option value="WRONG_SPEC">Salah Spesifikasi / Tipe</option>
                <option value="OVER_DELIVERY">Kelebihan Kirim</option>
                <option value="EXPIRED">Kadaluarsa / Mutu Jelek</option>
              </select>
            </div>
            <div>
              <label className="font-bold block mb-1 text-slate-700">Tuntutan Tindakan:</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-bold"
              >
                <option value="REPLACE">Ganti Barang Baru (Replace)</option>
                <option value="REFUND">Pengembalian Dana (Refund)</option>
                <option value="CREDIT_NOTE">Potong Tagihan (Credit Note)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1 text-slate-700">Nama Barang Yang Dikembalikan:</label>
            <input
              type="text"
              required
              value={returItemName}
              onChange={(e) => setReturItemName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-semibold"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1 text-slate-700">Jumlah Retur:</label>
              <input
                type="number"
                min={1}
                required
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-bold"
              />
            </div>
            <div>
              <label className="font-bold block mb-1 text-slate-700">Satuan:</label>
              <input
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1 text-slate-700">Alasan Rinci Pengembalian:</label>
            <textarea
              rows={2}
              required
              value={reasonText}
              onChange={(e) => setReasonText(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div className="pt-4 border-t flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Batal</button>
            <button type="submit" className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl cursor-pointer shadow-md">Kirim Berita Acara Retur</button>
          </div>
        </form>
      </div>
    </div>
  );
};


// 7. ADD ITEM MODAL
export const AddInventoryItemModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (item: Omit<InventoryItem, 'id' | 'movements'>) => void;
  onBulkImport?: (items: Omit<InventoryItem, 'id' | 'movements'>[]) => void;
}> = ({ isOpen, onClose, onSubmit, onBulkImport }) => {
  if (!isOpen) return null;

  const [itemCode, setItemCode] = useState(`MAT-${Math.floor(100 + Math.random() * 900)}`);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Konstruksi & Besi');
  const [specification, setSpecification] = useState('');
  const [unit, setUnit] = useState('Batang');
  const [minStock, setMinStock] = useState(50);
  const [currentStock, setCurrentStock] = useState(100);
  const [unitPrice, setUnitPrice] = useState(100000); // Harga Beli / HPP
  const [marginPercent, setMarginPercent] = useState(20); // Margin % (manual)
  const [sellingPrice, setSellingPrice] = useState(120000); // Harga Jual (otomatis)
  const [warehouseLocation, setWarehouseLocation] = useState('Gudang Utama - Rak A1');

  // CSV Import state
  const [parsedCsvItems, setParsedCsvItems] = useState<ParsedMaterialRow[]>([]);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);

  // Auto calculate selling price when unitPrice or marginPercent changes
  const handleUnitPriceChange = (val: number) => {
    const buyPrice = isNaN(val) ? 0 : Math.max(0, val);
    setUnitPrice(buyPrice);
    const autoSell = Math.round(buyPrice * (1 + (marginPercent || 0) / 100));
    setSellingPrice(autoSell);
  };

  const handleMarginChange = (val: number) => {
    const margin = isNaN(val) ? 0 : val;
    setMarginPercent(margin);
    const autoSell = Math.round(unitPrice * (1 + (margin || 0) / 100));
    setSellingPrice(autoSell);
  };

  const handleSellingPriceChange = (val: number) => {
    const sell = isNaN(val) ? 0 : Math.max(0, val);
    setSellingPrice(sell);
    if (unitPrice > 0) {
      const calcMargin = Math.round(((sell - unitPrice) / unitPrice) * 100 * 10) / 10;
      setMarginPercent(calcMargin);
    }
  };

  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCsvError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseMaterialCSV(text);
        if (parsed.length === 0) {
          setCsvError('Tidak ada data material yang valid ditemukan dalam file CSV.');
          setParsedCsvItems([]);
          return;
        }
        setParsedCsvItems(parsed);
        // Auto populate first item into form
        const first = parsed[0];
        setItemCode(first.itemCode);
        setName(first.name);
        setCategory(first.category);
        setSpecification(first.specification);
        setUnit(first.unit);
        setMinStock(first.minStock);
        setCurrentStock(first.currentStock);
        setUnitPrice(first.unitPrice);
        setMarginPercent(first.marginPercent);
        setSellingPrice(first.sellingPrice);
        setWarehouseLocation(first.warehouseLocation);
      } catch (err: any) {
        setCsvError(`Gagal membaca file CSV: ${err.message || 'Format tidak valid'}`);
      }
    };
    reader.readAsText(file);
  };

  const handleApplyAllCsv = () => {
    if (parsedCsvItems.length === 0) return;
    if (onBulkImport) {
      const itemsToSave: Omit<InventoryItem, 'id' | 'movements'>[] = parsedCsvItems.map(p => ({
        itemCode: p.itemCode,
        name: p.name,
        category: p.category,
        specification: p.specification,
        unit: p.unit,
        minStock: p.minStock,
        currentStock: p.currentStock,
        reservedStock: 0,
        availableStock: p.currentStock,
        unitPrice: p.unitPrice,
        marginPercent: p.marginPercent,
        sellingPrice: p.sellingPrice,
        warehouseLocation: p.warehouseLocation,
        lastRestocked: new Date().toISOString().slice(0, 10)
      }));
      onBulkImport(itemsToSave);
      onClose();
    } else {
      // Fallback: submit first item
      handleSubmitManual();
    }
  };

  const handleSubmitManual = () => {
    if (!name.trim()) return;

    onSubmit({
      itemCode,
      name: name.trim(),
      category,
      specification,
      unit,
      minStock: Number(minStock) || 0,
      currentStock: Number(currentStock) || 0,
      reservedStock: 0,
      availableStock: Number(currentStock) || 0,
      unitPrice: Number(unitPrice) || 0,
      marginPercent: Number(marginPercent) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      warehouseLocation,
      lastRestocked: new Date().toISOString().slice(0, 10)
    });
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmitManual();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-base flex items-center gap-2">
              <Boxes className="w-5 h-5 text-emerald-400" />
              <span>Registrasi Item Material / Produk Baru</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Input data katalog material atau impor massal via file template Excel / CSV
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>

        {/* CSV Import Toolbar Banner */}
        <div className="bg-emerald-50 border-b border-emerald-200/80 px-6 py-3 shrink-0 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-emerald-600 text-white rounded-lg">
              <FileSpreadsheet className="w-4 h-4" />
            </span>
            <div>
              <div className="font-bold text-emerald-950 text-xs">Opsi Impor Cepat via File Excel / CSV</div>
              <div className="text-[11px] text-emerald-800">Unduh format template kolom terpisah atau unggah file yang sudah diisi</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white rounded-lg border border-emerald-300 shadow-xs overflow-hidden">
              <button
                type="button"
                onClick={() => downloadMaterialCSVTemplate(';')}
                id="btn-download-excel-template-modal"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-50 text-emerald-900 font-bold text-xs transition-colors cursor-pointer"
                title="Download Template Excel (Kolom terpisah otomatis di Microsoft Excel)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-700" />
                <span>Download Template Excel</span>
              </button>
              <button
                type="button"
                onClick={() => downloadMaterialCSVTemplate(',')}
                id="btn-download-csv-comma-modal"
                className="border-l border-emerald-200 px-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-semibold transition-colors cursor-pointer"
                title="Download Format Standar Koma (,)"
              >
                Koma (,)
              </button>
            </div>

            <label
              htmlFor="csv-upload-input-modal"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs shadow-xs transition-colors cursor-pointer"
              title="Upload File Excel / CSV Material"
            >
              <Upload className="w-3.5 h-3.5 text-white" />
              <span>Upload CSV / Excel</span>
              <input
                id="csv-upload-input-modal"
                type="file"
                accept=".csv,text/csv"
                onChange={handleCsvFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* CSV Parsed Notice / Error */}
        {csvError && (
          <div className="mx-6 mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
              <span>{csvError}</span>
            </div>
            <button onClick={() => setCsvError(null)} className="text-red-500 font-bold ml-2">✕</button>
          </div>
        )}

        {parsedCsvItems.length > 0 && (
          <div className="mx-6 mt-3 p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <span className="font-bold">File: {csvFileName}</span> — Terbaca <span className="font-bold text-blue-700">{parsedCsvItems.length} item material</span>. Form diisi otomatis dengan baris ke-1.
              </div>
            </div>
            {parsedCsvItems.length > 1 && onBulkImport && (
              <button
                type="button"
                onClick={handleApplyAllCsv}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors cursor-pointer shrink-0 shadow-xs"
              >
                Impor Semua ({parsedCsvItems.length} Item) Sekaligus
              </button>
            )}
          </div>
        )}

        {/* Modal Form */}
        <form noValidate onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold block mb-1 text-slate-700">Kode SKU Material *:</label>
              <input
                type="text"
                required
                value={itemCode}
                onChange={(e) => setItemCode(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold"
              />
            </div>
            <div>
              <label className="font-bold block mb-1 text-slate-700">Kategori Material *:</label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="misal: Konstruksi & Besi"
                className="w-full p-2.5 rounded-lg border border-slate-300 font-medium"
              />
            </div>
          </div>

          <div>
            <label className="font-bold block mb-1 text-slate-700">Nama Barang / Material *:</label>
            <input
              type="text"
              required
              placeholder="misal: Besi Hollow Galvanis 40x40"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-slate-900"
            />
          </div>

          <div>
            <label className="font-bold block mb-1 text-slate-700">Spesifikasi Lengkap / Standar Mutu:</label>
            <textarea
              rows={2}
              placeholder="Ketebalan 1.8mm, Panjang 6 Meter SNI"
              value={specification}
              onChange={(e) => setSpecification(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold block mb-1 text-slate-700">Satuan Barang:</label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-center font-bold"
              />
            </div>
            <div>
              <label className="font-bold block mb-1 text-slate-700">Batas Min Stok:</label>
              <input
                type="number"
                min={0}
                step="any"
                value={minStock === 0 ? '' : minStock}
                onChange={(e) => setMinStock(e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-slate-300 text-center font-bold"
              />
            </div>
            <div>
              <label className="font-bold block mb-1 text-slate-700">Stok Awal Fisik:</label>
              <input
                type="number"
                min={0}
                step="any"
                value={currentStock === 0 ? '' : currentStock}
                onChange={(e) => setCurrentStock(e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/20 text-center font-bold text-emerald-800"
              />
            </div>
          </div>

          {/* Pricing & Margin Section */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Struktur Harga & Margin Keuntungan</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              
              {/* Harga Beli Satuan (HPP) */}
              <div>
                <label className="font-bold block mb-1 text-slate-700">
                  Harga Beli / HPP (Rp) *:
                </label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  required
                  value={unitPrice === 0 ? '' : unitPrice}
                  onChange={(e) => handleUnitPriceChange(e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2.5 rounded-lg border border-slate-300 font-mono font-bold text-slate-900 bg-white"
                />
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  {formatRupiah(unitPrice)}
                </div>
              </div>

              {/* Kolom Isian Margin (Diisi Manual) */}
              <div>
                <label className="font-bold block mb-1 text-slate-700 flex items-center justify-between">
                  <span>Margin Keuntungan (%):</span>
                  <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.2 rounded">
                    Manual
                  </span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="any"
                    value={marginPercent === 0 ? '' : marginPercent}
                    onChange={(e) => handleMarginChange(e.target.value === '' ? 0 : Number(e.target.value))}
                    placeholder="misal: 20"
                    className="w-full p-2.5 pr-8 rounded-lg border border-emerald-400 bg-emerald-50/40 font-mono font-bold text-emerald-950 focus:ring-1 focus:ring-emerald-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-xs">
                    %
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 mt-1 font-mono">
                  Keuntungan: +{formatRupiah(Math.max(0, sellingPrice - unitPrice))}
                </div>
              </div>

              {/* Harga Jual Satuan (Otomatis Terisi & Bisa Diedit) */}
              <div>
                <label className="font-bold block mb-1 text-slate-700 flex items-center justify-between">
                  <span>Harga Jual Satuan (Rp) *:</span>
                  <span className="text-[10px] text-blue-700 font-bold bg-blue-100 px-1.5 py-0.2 rounded">
                    Otomatis
                  </span>
                </label>
                <input
                  type="number"
                  min={0}
                  step="any"
                  required
                  value={sellingPrice === 0 ? '' : sellingPrice}
                  onChange={(e) => handleSellingPriceChange(e.target.value === '' ? 0 : Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-2.5 rounded-lg border border-blue-400 bg-blue-50/40 font-mono font-extrabold text-blue-950 focus:ring-1 focus:ring-blue-500"
                />
                <div className="text-[10px] text-blue-700 font-mono font-bold mt-1">
                  {formatRupiah(sellingPrice)}
                </div>
              </div>

            </div>
          </div>

          <div>
            <label className="font-bold block mb-1 text-slate-700">Lokasi Rak / Gudang Penyimpanan:</label>
            <input
              type="text"
              required
              placeholder="misal: Gudang Utama - Rak A1"
              value={warehouseLocation}
              onChange={(e) => setWarehouseLocation(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div className="pt-4 border-t flex items-center justify-between">
            <div className="text-[11px] text-slate-500">
              * Pastikan data SKU dan satuan sudah sesuai dengan standar operasional.
            </div>
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={onClose} 
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button 
                type="submit" 
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer shadow-md transition-all flex items-center gap-1.5"
              >
                <Check className="w-4 h-4" />
                <span>Simpan Item Material</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};


// 8. ADJUST STOCK MODAL
export const AdjustStockModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  item: InventoryItem | null;
  onAdjustStock: (itemId: string, adjustData: any) => void;
  currentUser: User;
}> = ({ isOpen, onClose, item, onAdjustStock, currentUser }) => {
  if (!isOpen || !item) return null;

  const [type, setType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN');
  const [qty, setQty] = useState(10);
  const [referenceDoc, setReferenceDoc] = useState('OPNAME-2026-08');
  const [notes, setNotes] = useState('Penyesuaian stok fisik hasil stock opname');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (qty <= 0) return;

    onAdjustStock(item.id, {
      type,
      qty,
      referenceDoc,
      operator: currentUser.name,
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <h3 className="font-bold text-sm">Penyesuaian Stok: {item.name}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white cursor-pointer">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-slate-700 flex justify-between items-center">
            <span>Stok Fisik Saat Ini:</span>
            <span className="font-bold text-sm text-slate-900 font-mono">{item.currentStock} {item.unit}</span>
          </div>

          <div>
            <label className="font-bold block mb-1 text-slate-700">Tipe Mutasi:</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-bold"
            >
              <option value="IN">Stok Masuk (Barang Diterima / Restock)</option>
              <option value="OUT">Stok Keluar (Pemakaian Proyek)</option>
              <option value="ADJUSTMENT">Koreksi Selisih Opname</option>
            </select>
          </div>

          <div>
            <label className="font-bold block mb-1 text-slate-700">Jumlah Mutasi ({item.unit}):</label>
            <input
              type="number"
              min={1}
              required
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-center text-sm"
            />
          </div>

          <div>
            <label className="font-bold block mb-1 text-slate-700">No. Dokumen Referensi / Berita Acara:</label>
            <input
              type="text"
              required
              value={referenceDoc}
              onChange={(e) => setReferenceDoc(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
            />
          </div>

          <div>
            <label className="font-bold block mb-1 text-slate-700">Catatan / Alasan Penyesuaian:</label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300"
            />
          </div>

          <div className="pt-4 border-t flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer">Batal</button>
            <button type="submit" className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer shadow-md">Simpan Mutasi</button>
          </div>
        </form>
      </div>
    </div>
  );
};
