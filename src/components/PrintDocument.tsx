import React from 'react';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  Building2, 
  Phone, 
  Mail, 
  FileText, 
  ShieldCheck,
  QrCode
} from 'lucide-react';
import { 
  PurchaseOrder, 
  MaterialRequest, 
  DeliveryOrder, 
  Invoice, 
  Retur, 
  CompanyProfile 
} from '../types';
import { formatRupiah, formatDate, numberToTerbilang } from '../lib/utils';
import { RtiLogo } from './RtiLogo';

interface PrintDocumentProps {
  type?: 'PO' | 'MR' | 'DO' | 'INV' | 'INVOICE' | 'RETUR';
  docType?: 'PO' | 'MR' | 'DO' | 'INV' | 'INVOICE' | 'RETUR';
  data: PurchaseOrder | MaterialRequest | DeliveryOrder | Invoice | Retur;
  company: CompanyProfile;
  onClose: () => void;
}

export const PrintDocument: React.FC<PrintDocumentProps> = ({
  type: propType,
  docType,
  data,
  company,
  onClose
}) => {
  const rawType = docType || propType || 'PO';
  const type = rawType === 'INVOICE' ? 'INV' : rawType;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="print-modal-container" className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex justify-center p-4 sm:p-6 print:p-0 print:bg-white print:static print:inset-auto">
      {/* Container with shadow & A4 style preview */}
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden print:shadow-none print:w-full print:max-w-none print:rounded-none my-auto border border-slate-200 print:border-none flex flex-col">
        
        {/* Top Action Bar (hidden on print) */}
        <div id="print-action-toolbar" className="no-print bg-slate-800 text-white px-6 py-4 flex items-center justify-between border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/30 rounded-lg text-blue-400 border border-blue-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                Pratinjau Cetak Dokumen Resmi
              </h3>
              <p className="text-xs text-slate-400">
                Format Surat Resmi PT. Rajawali Talenta Indonesia (A4 Portrait)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-trigger-print"
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Cetak / Simpan PDF
            </button>
            <button
              id="btn-close-print-modal"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Sheet Area */}
        <div className="p-8 sm:p-12 print:p-0 text-slate-900 bg-white min-h-[900px]">
          
          {/* Official Letterhead / Kop Surat */}
          <div className="border-b-2 border-slate-900 pb-4 mb-6">
            <div className="flex items-start justify-between gap-6">
              <div className="flex items-center gap-4">
                {/* Official RTI Emblem Logo */}
                <div className="shrink-0">
                  <RtiLogo variant="symbol" size={68} theme="light" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-blue-950 uppercase font-sans">
                    {company.name}
                  </h1>
                  <p className="text-xs text-amber-700 font-semibold tracking-wide uppercase">
                    {company.tagline}
                  </p>
                  <p className="text-xs text-slate-600 mt-1 max-w-xl">
                    {company.address}, {company.city} {company.postalCode}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {company.phone}</span>
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {company.email}</span>
                    <span><strong>NPWP:</strong> {company.npwp}</span>
                  </div>
                </div>
              </div>

              {/* QR Verification Badge */}
              <div className="text-right hidden sm:block print:block shrink-0 border border-slate-200 rounded-lg p-2 text-center bg-slate-50">
                <div className="w-12 h-12 bg-white border border-slate-300 mx-auto rounded flex items-center justify-center p-1">
                  <QrCode className="w-10 h-10 text-slate-800" />
                </div>
                <span className="text-[9px] text-slate-500 block mt-1 font-mono uppercase">E-Verified</span>
              </div>
            </div>
            {/* Double decorative border line */}
            <div className="w-full h-0.5 bg-amber-500 mt-3"></div>
          </div>

          {/* DOCUMENT HEADER TITLE */}
          <div className="text-center my-6">
            <h2 className="text-xl sm:text-2xl font-black tracking-wider text-slate-900 uppercase underline decoration-blue-900 underline-offset-4">
              {type === 'PO' && 'SURAT PESANAN PEMBELIAN (PURCHASE ORDER)'}
              {type === 'MR' && 'FORMULIR PERMINTAAN MATERIAL (MATERIAL REQUEST)'}
              {type === 'DO' && 'SURAT JALAN / BUKTI PENERIMAAN BARANG (DELIVERY ORDER)'}
              {type === 'INV' && 'FAKTUR PEMBAYARAN / INVOICE'}
              {type === 'RETUR' && 'BERITA ACARA RETUR & PENGEMBALIAN BARANG'}
            </h2>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              Nomor: <span className="font-mono text-blue-950 font-bold tracking-wider">
                {type === 'PO' && (data as PurchaseOrder).poNumber}
                {type === 'MR' && (data as MaterialRequest).mrNumber}
                {type === 'DO' && (data as DeliveryOrder).doNumber}
                {type === 'INV' && (data as Invoice).invoiceNumber}
                {type === 'RETUR' && (data as Retur).returNumber}
              </span>
            </p>
          </div>

          {/* METADATA GRID ACCORDING TO DOCUMENT TYPE */}
          {type === 'PO' && (() => {
            const po = data as PurchaseOrder;
            return (
              <div className="grid grid-cols-2 gap-6 text-xs mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 print:bg-transparent print:border-slate-300">
                <div className="space-y-1.5">
                  <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider text-blue-900 border-b pb-1">Vendor / Pemasok:</div>
                  <p className="font-bold text-sm text-slate-900">{po.vendorName}</p>
                  <p className="text-slate-600">{po.vendorAddress}</p>
                  <p className="text-slate-600"><strong>PIC:</strong> {po.vendorPic}</p>
                  <p className="text-slate-600"><strong>Telp / Email:</strong> {po.vendorPhone} | {po.vendorEmail}</p>
                  {po.vendorNpwp && <p className="text-slate-600"><strong>NPWP:</strong> {po.vendorNpwp}</p>}
                </div>
                <div className="space-y-1.5 border-l border-slate-200 pl-4 print:border-slate-300">
                  <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider text-blue-900 border-b pb-1">Detail Pemesanan:</div>
                  <p className="text-slate-700"><strong>Tanggal PO:</strong> {formatDate(po.orderDate)}</p>
                  <p className="text-slate-700"><strong>Target Pengiriman:</strong> {formatDate(po.expectedDeliveryDate)}</p>
                  <p className="text-slate-700"><strong>Syarat Pembayaran:</strong> {po.paymentTerms}</p>
                  <p className="text-slate-700"><strong>Proyek / Biaya:</strong> {po.projectOrCostCenter}</p>
                  <p className="text-slate-700"><strong>Alamat Kirim:</strong> {po.shippingAddress}</p>
                  {po.mrReference && <p className="text-slate-700"><strong>Referensi MR:</strong> <span className="font-mono text-blue-800 font-semibold">{po.mrReference}</span></p>}
                </div>
              </div>
            );
          })()}

          {type === 'MR' && (() => {
            const mr = data as MaterialRequest;
            return (
              <div className="grid grid-cols-2 gap-6 text-xs mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 print:bg-transparent print:border-slate-300">
                <div className="space-y-1.5">
                  <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider text-blue-900 border-b pb-1">Pemohon Material:</div>
                  <p className="font-bold text-sm text-slate-900">{mr.requesterName}</p>
                  <p className="text-slate-700"><strong>Departemen:</strong> {mr.department}</p>
                  <p className="text-slate-700"><strong>Proyek:</strong> {mr.project}</p>
                  <p className="text-slate-700"><strong>Tingkat Prioritas:</strong> 
                    <span className={`ml-1 font-bold ${mr.priority === 'URGENT' ? 'text-red-600' : 'text-slate-900'}`}>{mr.priority}</span>
                  </p>
                </div>
                <div className="space-y-1.5 border-l border-slate-200 pl-4">
                  <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider text-blue-900 border-b pb-1">Informasi Waktu & Status:</div>
                  <p className="text-slate-700"><strong>Tanggal Permintaan:</strong> {formatDate(mr.requestDate)}</p>
                  <p className="text-slate-700"><strong>Dibutuhkan Pada:</strong> {formatDate(mr.requiredDate)}</p>
                  <p className="text-slate-700"><strong>Status Pengajuan:</strong> <span className="font-bold text-blue-900">{mr.status}</span></p>
                  <p className="text-slate-700"><strong>Tujuan / Penggunaan:</strong> {mr.purpose}</p>
                </div>
              </div>
            );
          })()}

          {type === 'DO' && (() => {
            const doDoc = data as DeliveryOrder;
            return (
              <div className="grid grid-cols-2 gap-6 text-xs mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 print:bg-transparent print:border-slate-300">
                <div className="space-y-1.5">
                  <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider text-blue-900 border-b pb-1">Pihak Pengirim & Ekspedisi:</div>
                  <p className="font-bold text-sm text-slate-900">{doDoc.senderName}</p>
                  <p className="text-slate-700"><strong>Nama Pengemudi / Supir:</strong> {doDoc.driverName}</p>
                  <p className="text-slate-700"><strong>Nomor Polisi Kendaraan:</strong> <span className="font-mono font-bold">{doDoc.vehiclePlate}</span></p>
                  <p className="text-slate-700"><strong>Tanggal Kirim:</strong> {formatDate(doDoc.deliveryDate)}</p>
                </div>
                <div className="space-y-1.5 border-l border-slate-200 pl-4">
                  <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider text-blue-900 border-b pb-1">Tujuan Penerimaan Gudang:</div>
                  <p className="font-bold text-sm text-slate-900">{doDoc.recipientName}</p>
                  <p className="text-slate-700"><strong>Departemen:</strong> {doDoc.recipientDepartment}</p>
                  <p className="text-slate-700"><strong>Gudang Tujuan:</strong> {doDoc.warehouseDestination}</p>
                  <p className="text-slate-700"><strong>Referensi PO:</strong> <span className="font-mono text-blue-900 font-bold">{doDoc.poNumber}</span></p>
                  {doDoc.receivedDate && <p className="text-slate-700"><strong>Diterima Pada:</strong> {doDoc.receivedDate}</p>}
                </div>
              </div>
            );
          })()}

          {type === 'INV' && (() => {
            const inv = data as Invoice;
            return (
              <div className="grid grid-cols-2 gap-6 text-xs mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 print:bg-transparent print:border-slate-300">
                <div className="space-y-1.5">
                  <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider text-blue-900 border-b pb-1">Tertagih Kepada (Bill To):</div>
                  <p className="font-bold text-sm text-slate-900">{company.name}</p>
                  <p className="text-slate-600">{company.address}, {company.city}</p>
                  <p className="text-slate-600"><strong>NPWP:</strong> {company.npwp}</p>
                </div>
                <div className="space-y-1.5 border-l border-slate-200 pl-4">
                  <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider text-blue-900 border-b pb-1">Informasi Tagihan & Bank:</div>
                  <p className="text-slate-700"><strong>Dari Vendor:</strong> <span className="font-bold">{inv.vendorName}</span></p>
                  <p className="text-slate-700"><strong>Bank Vendor:</strong> {inv.vendorBankName} - A/C: <span className="font-mono font-bold">{inv.vendorBankAccount}</span> ({inv.vendorBankHolder})</p>
                  <p className="text-slate-700"><strong>Tanggal Invoice:</strong> {formatDate(inv.invoiceDate)}</p>
                  <p className="text-slate-700"><strong>Jatuh Tempo:</strong> {formatDate(inv.dueDate)}</p>
                  <p className="text-slate-700"><strong>Ref PO:</strong> {inv.poNumber} {inv.doNumber ? `| Ref SJ: ${inv.doNumber}` : ''}</p>
                  {inv.taxInvoiceNumber && <p className="text-slate-700"><strong>No. Faktur Pajak:</strong> {inv.taxInvoiceNumber}</p>}
                </div>
              </div>
            );
          })()}

          {type === 'RETUR' && (() => {
            const rt = data as Retur;
            return (
              <div className="grid grid-cols-2 gap-6 text-xs mb-6 bg-slate-50 p-4 rounded-lg border border-slate-200 print:bg-transparent print:border-slate-300">
                <div className="space-y-1.5">
                  <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider text-blue-900 border-b pb-1">Vendor Penerima Retur:</div>
                  <p className="font-bold text-sm text-slate-900">{rt.vendorName}</p>
                  <p className="text-slate-700"><strong>Referensi PO:</strong> <span className="font-mono font-bold text-blue-900">{rt.poNumber}</span></p>
                  {rt.doNumber && <p className="text-slate-700"><strong>Referensi Surat Jalan:</strong> {rt.doNumber}</p>}
                </div>
                <div className="space-y-1.5 border-l border-slate-200 pl-4">
                  <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider text-blue-900 border-b pb-1">Keterangan Retur:</div>
                  <p className="text-slate-700"><strong>Tanggal Retur:</strong> {formatDate(rt.returDate)}</p>
                  <p className="text-slate-700"><strong>Kategori Alasan:</strong> <span className="font-bold text-red-600">{rt.reasonCategory}</span></p>
                  <p className="text-slate-700"><strong>Diajukan Oleh:</strong> {rt.requestedBy}</p>
                  <p className="text-slate-700"><strong>Status Retur:</strong> {rt.status}</p>
                </div>
              </div>
            );
          })()}

          {/* ITEM TABLES */}
          <div className="mb-6">
            <table className="w-full text-xs text-left border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300 print:bg-slate-100">
                  <th className="p-2.5 border border-slate-300 w-10 text-center">No</th>
                  <th className="p-2.5 border border-slate-300 w-28">Kode Item</th>
                  <th className="p-2.5 border border-slate-300">Deskripsi Barang / Material</th>
                  {type === 'MR' && (
                    <>
                      <th className="p-2.5 border border-slate-300 w-20 text-center">Qty</th>
                      <th className="p-2.5 border border-slate-300 w-20 text-center">Satuan</th>
                      <th className="p-2.5 border border-slate-300 text-right">Est. Harga Satuan</th>
                      <th className="p-2.5 border border-slate-300 text-right">Est. Total</th>
                    </>
                  )}
                  {type === 'PO' && (
                    <>
                      <th className="p-2.5 border border-slate-300 w-20 text-center">Qty</th>
                      <th className="p-2.5 border border-slate-300 w-20 text-center">Satuan</th>
                      <th className="p-2.5 border border-slate-300 text-right">Harga Satuan</th>
                      <th className="p-2.5 border border-slate-300 text-right">Jumlah (Rp)</th>
                    </>
                  )}
                  {type === 'DO' && (
                    <>
                      <th className="p-2.5 border border-slate-300 w-24 text-center">Qty Dikirim</th>
                      <th className="p-2.5 border border-slate-300 w-24 text-center">Qty Diterima</th>
                      <th className="p-2.5 border border-slate-300 w-20 text-center">Satuan</th>
                      <th className="p-2.5 border border-slate-300 w-28 text-center">Kondisi</th>
                      <th className="p-2.5 border border-slate-300">Catatan Gudang</th>
                    </>
                  )}
                  {type === 'INV' && (
                    <>
                      <th className="p-2.5 border border-slate-300 w-36 text-center">Referensi PO</th>
                      <th className="p-2.5 border border-slate-300 w-36 text-center">Referensi Surat Jalan</th>
                      <th className="p-2.5 border border-slate-300 text-right">Nilai Tagihan (Rp)</th>
                    </>
                  )}
                  {type === 'RETUR' && (
                    <>
                      <th className="p-2.5 border border-slate-300 w-20 text-center">Qty Retur</th>
                      <th className="p-2.5 border border-slate-300 w-20 text-center">Satuan</th>
                      <th className="p-2.5 border border-slate-300">Alasan Pengembalian</th>
                      <th className="p-2.5 border border-slate-300 w-28 text-center">Tindakan</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {type === 'INV' && (() => {
                  const inv = data as Invoice;
                  return (
                    <tr className="border-b border-slate-300">
                      <td className="p-2.5 border border-slate-300 text-center">1</td>
                      <td className="p-2.5 border border-slate-300 font-mono text-[11px] text-slate-700">{inv.invoiceNumber}</td>
                      <td className="p-2.5 border border-slate-300">
                        <div className="font-semibold text-slate-900">Tagihan Pengadaan Material / Jasa</div>
                        <div className="text-[11px] text-slate-500 italic mt-0.5">{inv.notes || `Penagihan atas pesanan PO ${inv.poNumber}`}</div>
                      </td>
                      <td className="p-2.5 border border-slate-300 font-mono text-center font-bold text-blue-950">{inv.poNumber}</td>
                      <td className="p-2.5 border border-slate-300 font-mono text-center text-slate-700">{inv.doNumber || '-'}</td>
                      <td className="p-2.5 border border-slate-300 text-right font-bold text-slate-900">{formatRupiah(inv.totalAmount)}</td>
                    </tr>
                  );
                })()}
                {type === 'PO' && (data as PurchaseOrder).items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-300">
                    <td className="p-2.5 border border-slate-300 text-center">{idx + 1}</td>
                    <td className="p-2.5 border border-slate-300 font-mono text-[11px] text-slate-700">{item.itemCode}</td>
                    <td className="p-2.5 border border-slate-300">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      {item.notes && <div className="text-[11px] text-slate-500 italic mt-0.5">{item.notes}</div>}
                    </td>
                    <td className="p-2.5 border border-slate-300 text-center font-bold">{item.qty}</td>
                    <td className="p-2.5 border border-slate-300 text-center">{item.unit}</td>
                    <td className="p-2.5 border border-slate-300 text-right">{formatRupiah(item.unitPrice)}</td>
                    <td className="p-2.5 border border-slate-300 text-right font-semibold">{formatRupiah(item.totalPrice)}</td>
                  </tr>
                ))}

                {type === 'MR' && (data as MaterialRequest).items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-300">
                    <td className="p-2.5 border border-slate-300 text-center">{idx + 1}</td>
                    <td className="p-2.5 border border-slate-300 font-mono text-[11px] text-slate-700">{item.itemCode}</td>
                    <td className="p-2.5 border border-slate-300">
                      <div className="font-semibold text-slate-900">{item.name}</div>
                      {item.notes && <div className="text-[11px] text-slate-500 italic mt-0.5">{item.notes}</div>}
                    </td>
                    <td className="p-2.5 border border-slate-300 text-center font-bold">{item.qty}</td>
                    <td className="p-2.5 border border-slate-300 text-center">{item.unit}</td>
                    <td className="p-2.5 border border-slate-300 text-right">{formatRupiah(item.estimatedPrice)}</td>
                    <td className="p-2.5 border border-slate-300 text-right font-semibold">{formatRupiah(item.qty * item.estimatedPrice)}</td>
                  </tr>
                ))}

                {type === 'DO' && (data as DeliveryOrder).items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-300">
                    <td className="p-2.5 border border-slate-300 text-center">{idx + 1}</td>
                    <td className="p-2.5 border border-slate-300 font-mono text-[11px] text-slate-700">{item.itemCode}</td>
                    <td className="p-2.5 border border-slate-300 font-semibold text-slate-900">{item.name}</td>
                    <td className="p-2.5 border border-slate-300 text-center font-bold">{item.qtyDispatched}</td>
                    <td className="p-2.5 border border-slate-300 text-center font-bold text-blue-900">{item.qtyReceived}</td>
                    <td className="p-2.5 border border-slate-300 text-center">{item.unit}</td>
                    <td className="p-2.5 border border-slate-300 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                        item.condition === 'GOOD' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.condition}
                      </span>
                    </td>
                    <td className="p-2.5 border border-slate-300 text-[11px] text-slate-600">{item.remarks || '-'}</td>
                  </tr>
                ))}

                {type === 'RETUR' && (data as Retur).items.map((item, idx) => (
                  <tr key={item.id} className="border-b border-slate-300">
                    <td className="p-2.5 border border-slate-300 text-center">{idx + 1}</td>
                    <td className="p-2.5 border border-slate-300 font-mono text-[11px] text-slate-700">{item.itemCode}</td>
                    <td className="p-2.5 border border-slate-300 font-semibold text-slate-900">{item.name}</td>
                    <td className="p-2.5 border border-slate-300 text-center font-bold text-red-600">{item.qty}</td>
                    <td className="p-2.5 border border-slate-300 text-center">{item.unit}</td>
                    <td className="p-2.5 border border-slate-300 text-slate-700">{item.reason}</td>
                    <td className="p-2.5 border border-slate-300 text-center font-bold text-blue-900">{item.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FINANCIAL SUMMARY / TERBILANG (PO & INVOICE) */}
          {type === 'PO' && (() => {
            const po = data as PurchaseOrder;
            return (
              <div className="grid grid-cols-12 gap-6 text-xs mb-8">
                <div className="col-span-7 bg-slate-50 p-4 rounded-lg border border-slate-200 print:bg-transparent print:border-slate-300">
                  <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                    Terbilang:
                  </div>
                  <p className="italic text-slate-700 font-serif leading-relaxed text-sm bg-white p-2.5 rounded border border-slate-200 print:border-none print:p-0">
                    "{numberToTerbilang(po.grandTotal)}"
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-600">
                    <p className="font-bold text-slate-800">Catatan Khusus Pengiriman & Penagihan:</p>
                    <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-600">
                      <li>Surat Jalan Asli & Faktur Pajak wajib dilampirkan saat penagihan invoice.</li>
                      <li>Pembayaran ditransfer ke rekening resmi vendor atas nama {po.vendorName}.</li>
                      <li>Barang yang cacat / tidak sesuai spesifikasi akan dikembalikan (retur).</li>
                    </ul>
                  </div>
                </div>

                <div className="col-span-5 space-y-1.5 text-right">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Subtotal Material:</span>
                    <span className="font-semibold text-slate-900">{formatRupiah(po.subtotal)}</span>
                  </div>
                  {po.discountAmount > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-200 text-amber-700">
                      <span>Diskon / Potongan:</span>
                      <span className="font-semibold">- {formatRupiah(po.discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">PPN (11%):</span>
                    <span className="font-semibold text-slate-900">{formatRupiah(po.taxAmount)}</span>
                  </div>
                  {po.shippingCost > 0 && (
                    <div className="flex justify-between py-1 border-b border-slate-200">
                      <span className="text-slate-600">Ongkos Kirim (Delivery):</span>
                      <span className="font-semibold text-slate-900">{formatRupiah(po.shippingCost)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-bold bg-blue-50 px-2 rounded print:bg-transparent">
                    <span className="text-blue-950">TOTAL KESEPAKATAN (IDR):</span>
                    <span className="text-blue-950 font-mono text-base">{formatRupiah(po.grandTotal)}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {type === 'INV' && (() => {
            const inv = data as Invoice;
            return (
              <div className="grid grid-cols-12 gap-6 text-xs mb-8">
                <div className="col-span-7 bg-slate-50 p-4 rounded-lg border border-slate-200 print:bg-transparent print:border-slate-300">
                  <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
                    Terbilang:
                  </div>
                  <p className="italic text-slate-700 font-serif leading-relaxed text-sm bg-white p-2.5 rounded border border-slate-200 print:border-none print:p-0">
                    "{numberToTerbilang(inv.totalAmount)}"
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <p className="font-bold text-slate-800">Riwayat Pembayaran:</p>
                    {inv.payments && inv.payments.length > 0 ? (
                      <div className="mt-1 space-y-1">
                        {inv.payments.map((p, idx) => (
                          <div key={p.id} className="text-[11px] text-slate-600 flex justify-between">
                            <span>{idx + 1}. {p.paymentDate} ({p.paymentMethod}):</span>
                            <span className="font-mono font-semibold text-emerald-700">{formatRupiah(p.amount)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500 italic text-[11px]">Belum ada pembayaran tercatat.</p>
                    )}
                  </div>
                </div>

                <div className="col-span-5 space-y-2 text-right">
                  <div className="flex justify-between py-1 border-b border-slate-200">
                    <span className="text-slate-600">Total Nilai Tagihan:</span>
                    <span className="font-bold text-slate-900">{formatRupiah(inv.totalAmount)}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200 text-emerald-700">
                    <span>Sudah Dibayar (Paid):</span>
                    <span className="font-bold">{formatRupiah(inv.paidAmount)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-t-2 border-slate-900 text-sm font-bold bg-amber-50 px-2 rounded print:bg-transparent">
                    <span className="text-amber-900">SISA TAGIHAN (DUE):</span>
                    <span className="text-amber-900 font-mono text-base">{formatRupiah(inv.balanceDue)}</span>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* OFFICIAL SIGNATURE AND APPROVAL BOXES */}
          <div className="mt-8 pt-4 border-t border-slate-300">
            <div className="grid grid-cols-4 gap-4 text-center text-xs">
              
              {/* Box 1 */}
              <div className="flex flex-col justify-between h-36 border border-slate-200 rounded p-2 bg-slate-50/50 print:border-slate-300 print:bg-transparent">
                <div className="font-bold text-slate-700 uppercase text-[10px]">
                  {type === 'PO' ? 'Dibuat Oleh (Procurement):' : 'Diajukan Oleh:'}
                </div>
                <div className="my-auto text-slate-400 italic text-[10px]">
                  <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600 mb-1 opacity-70" />
                  <span className="text-emerald-700 font-mono font-bold text-[9px]">DIGITALLY SIGNED</span>
                </div>
                <div className="border-t border-slate-300 pt-1 font-bold text-slate-900">
                  {type === 'PO' ? (data as PurchaseOrder).preparedBy : (data as any).requesterName || (data as any).requestedBy || 'Rina Wijaya, S.E.'}
                </div>
              </div>

              {/* Box 2 */}
              <div className="flex flex-col justify-between h-36 border border-slate-200 rounded p-2 bg-slate-50/50 print:border-slate-300 print:bg-transparent">
                <div className="font-bold text-slate-700 uppercase text-[10px]">
                  Diperiksa (Finance / HSE):
                </div>
                <div className="my-auto text-slate-400 italic text-[10px]">
                  <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-600 mb-1 opacity-70" />
                  <span className="text-emerald-700 font-mono font-bold text-[9px]">VERIFIED OK</span>
                </div>
                <div className="border-t border-slate-300 pt-1 font-bold text-slate-900">
                  Dewi Lestari, S.Ak.
                </div>
              </div>

              {/* Box 3 */}
              <div className="flex flex-col justify-between h-36 border border-slate-200 rounded p-2 bg-slate-50/50 print:border-slate-300 print:bg-transparent relative overflow-hidden">
                <div className="font-bold text-slate-700 uppercase text-[10px]">
                  Disetujui (Direktur Utama):
                </div>
                {/* Official Red Stamp watermark */}
                <div className="my-auto relative">
                  <div className="w-20 h-20 mx-auto rounded-full border-2 border-red-600/60 flex items-center justify-center p-1 transform -rotate-12 select-none pointer-events-none">
                    <div className="text-[8px] font-black text-red-600/80 uppercase tracking-tighter text-center">
                      PT. RAJAWALI TALENTA<br/>★ APPROVED ★<br/>DIR. UTAMA
                    </div>
                  </div>
                </div>
                <div className="border-t border-slate-300 pt-1 font-bold text-slate-900">
                  {company.directorName}
                </div>
              </div>

              {/* Box 4 */}
              <div className="flex flex-col justify-between h-36 border border-slate-200 rounded p-2 bg-slate-50/50 print:border-slate-300 print:bg-transparent">
                <div className="font-bold text-slate-700 uppercase text-[10px]">
                  {type === 'DO' ? 'Penerima / Gudang:' : 'Diterima / Rekanan:'}
                </div>
                <div className="my-auto text-slate-300 text-[10px] italic">
                  ( Tanda Tangan & Cap )
                </div>
                <div className="border-t border-slate-300 pt-1 font-bold text-slate-900">
                  {type === 'DO' ? (data as DeliveryOrder).receivedBy || 'Agus Setiawan' : (data as any).vendorPic || '( ................................. )'}
                </div>
              </div>

            </div>

            {/* Document Footer Verification */}
            <div className="mt-8 text-[9px] text-slate-400 flex justify-between items-center border-t border-dashed border-slate-200 pt-2 font-mono">
              <span>Sistem ERP Terintegrasi PT. Rajawali Talenta Indonesia v2.4</span>
              <span>Dicetak: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
              <span>Halaman 1 dari 1</span>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
