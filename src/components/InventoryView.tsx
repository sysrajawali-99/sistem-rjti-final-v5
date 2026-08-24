import React, { useState } from 'react';
import { 
  Boxes, 
  Plus, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  AlertTriangle, 
  History, 
  Package, 
  DollarSign, 
  Building,
  CheckCircle2,
  X,
  Download,
  Upload,
  FileSpreadsheet,
  TrendingUp,
  Percent
} from 'lucide-react';
import { InventoryItem, StockMovement, User } from '../types';
import { 
  formatRupiah, 
  formatDate, 
  downloadMaterialCSVTemplate, 
  parseMaterialCSV 
} from '../lib/utils';

interface InventoryViewProps {
  currentUser: User;
  inventory: InventoryItem[];
  onOpenAddItem: () => void;
  onOpenAdjustStock: (item: InventoryItem) => void;
  onBulkImport?: (items: Omit<InventoryItem, 'id' | 'movements'>[]) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  currentUser,
  inventory,
  onOpenAddItem,
  onOpenAdjustStock,
  onBulkImport
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedItemHistory, setSelectedItemHistory] = useState<InventoryItem | null>(null);

  const handleQuickCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseMaterialCSV(text);
        if (parsed.length === 0) {
          alert('Tidak ada data material yang valid ditemukan dalam file CSV.');
          return;
        }
        if (onBulkImport) {
          const itemsToSave: Omit<InventoryItem, 'id' | 'movements'>[] = parsed.map(p => ({
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
        }
      } catch (err: any) {
        alert(`Gagal membaca file CSV: ${err.message || 'Format tidak valid'}`);
      }
    };
    reader.readAsText(file);
  };

  const categories = ['ALL', ...Array.from(new Set(inventory.map(i => i.category)))];

  const filteredItems = inventory.filter((item) => {
    const matchesSearch = 
      item.itemCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.warehouseLocation.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'ALL' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalAssetValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.unitPrice), 0);
  const lowStockCount = inventory.filter(i => i.currentStock <= i.minStock).length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
            <Boxes className="w-4 h-4" />
            <span>Manajemen Pergudangan & Logistik</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-serif">
            Inventaris & Stok Material
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitoring saldo stok fisik, penetapan margin keuntungan, estimasi harga jual, dan kartu mutasi barang.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Download Template Excel / CSV */}
          <div className="flex items-center bg-white rounded-xl border border-slate-300 shadow-xs overflow-hidden">
            <button
              id="btn-inventory-download-template"
              onClick={() => downloadMaterialCSVTemplate(';')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs transition-all cursor-pointer"
              title="Download Template Excel (Setiap data terpisah kolom di Microsoft Excel)"
            >
              <Download className="w-4 h-4 text-emerald-700" />
              <span>Download Template Excel</span>
            </button>
            <button
              onClick={() => downloadMaterialCSVTemplate(',')}
              className="border-l border-slate-200 px-2.5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-[11px] font-semibold transition-colors cursor-pointer"
              title="Download Format Standar Koma (,)"
            >
              Koma (,)
            </button>
          </div>

          {/* Quick Upload CSV / Excel */}
          <label
            htmlFor="quick-csv-upload-input"
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-300 shadow-xs transition-all cursor-pointer"
            title="Upload File CSV / Excel untuk Impor Massal Material"
          >
            <Upload className="w-4 h-4 text-emerald-700" />
            <span>Upload CSV / Excel</span>
            <input
              id="quick-csv-upload-input"
              type="file"
              accept=".csv,text/csv"
              onChange={handleQuickCsvUpload}
              className="hidden"
            />
          </label>

          {/* Add Item Modal */}
          <button
            id="btn-add-inventory-item"
            onClick={onOpenAddItem}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Registrasi Item Material</span>
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-500">Total Nilai Persediaan Fisik (HPP)</span>
          <div className="text-xl font-mono font-extrabold text-slate-900 mt-1">
            {formatRupiah(totalAssetValue)}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-blue-700">Total Jenis SKU Terdaftar</span>
          <div className="text-xl font-mono font-extrabold text-blue-800 mt-1">
            {inventory.length} SKU Material
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-amber-700">Peringatan Batas Minimum</span>
          <div className="text-xl font-mono font-extrabold text-amber-600 mt-1 flex items-center gap-2">
            <span>{lowStockCount} Item</span>
            {lowStockCount > 0 && <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-800 font-sans font-bold">Perlu Restock</span>}
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
            placeholder="Cari Kode Item, Nama Barang, Lokasi Rak..."
            className="w-full text-xs pl-9 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-emerald-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'Semua Kategori' : cat}
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
                <th className="p-4">Kode SKU</th>
                <th className="p-4">Nama Barang & Spesifikasi</th>
                <th className="p-4">Kategori & Lokasi Rak</th>
                <th className="p-4 text-center">Batas Min</th>
                <th className="p-4 text-center">Stok Fisik</th>
                <th className="p-4 text-right">Harga Beli (HPP)</th>
                <th className="p-4 text-center">Margin (%)</th>
                <th className="p-4 text-right">Harga Jual</th>
                <th className="p-4 text-right">Nilai Total (HPP)</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => {
                const isLow = item.currentStock <= item.minStock;
                const margin = item.marginPercent !== undefined ? item.marginPercent : 20;
                const sellPrice = item.sellingPrice || Math.round(item.unitPrice * (1 + margin / 100));

                return (
                  <tr key={item.id} className={`hover:bg-slate-50/80 transition-colors ${isLow ? 'bg-amber-50/30' : ''}`}>
                    
                    <td className="p-4 font-mono font-bold text-slate-900">
                      {item.itemCode}
                    </td>

                    <td className="p-4">
                      <div className="font-bold text-slate-900 flex items-center gap-1.5">
                        <span>{item.name}</span>
                        {isLow && (
                          <span className="p-1 rounded bg-red-100 text-red-700" title="Stok di bawah batas aman">
                            <AlertTriangle className="w-3 h-3" />
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-sm">{item.specification}</div>
                    </td>

                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{item.category}</div>
                      <div className="text-[11px] text-slate-500">{item.warehouseLocation}</div>
                    </td>

                    <td className="p-4 text-center font-semibold text-slate-600">
                      {item.minStock} {item.unit}
                    </td>

                    <td className="p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full font-bold text-xs ${
                        isLow ? 'bg-red-100 text-red-800 font-extrabold' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.currentStock} {item.unit}
                      </span>
                    </td>

                    {/* Harga Beli Satuan (HPP) */}
                    <td className="p-4 text-right font-mono font-semibold text-slate-700">
                      {formatRupiah(item.unitPrice)}
                    </td>

                    {/* Margin Keuntungan (%) */}
                    <td className="p-4 text-center">
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-mono font-bold rounded-md border border-emerald-200 text-[11px]">
                        +{margin}%
                      </span>
                    </td>

                    {/* Harga Jual Satuan (Otomatis) */}
                    <td className="p-4 text-right font-mono font-bold text-blue-900">
                      {formatRupiah(sellPrice)}
                    </td>

                    {/* Total Nilai HPP */}
                    <td className="p-4 text-right font-mono font-extrabold text-slate-900">
                      {formatRupiah(item.currentStock * item.unitPrice)}
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        <button
                          onClick={() => setSelectedItemHistory(item)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
                          title="Lihat Kartu Stok & Mutasi"
                        >
                          <History className="w-3.5 h-3.5 text-blue-600" />
                          <span>Mutasi</span>
                        </button>

                        <button
                          onClick={() => onOpenAdjustStock(item)}
                          className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg transition-colors cursor-pointer border border-emerald-200"
                          title="Penyesuaian Stok Masuk / Keluar"
                        >
                          <span>Adjust</span>
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}

              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={10} className="p-12 text-center text-slate-400">
                    <Boxes className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-bold text-slate-600 text-sm">Tidak Ada Item Inventaris Ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">Gunakan tombol 'Registrasi Item Material' atau 'Upload CSV' untuk menambahkan barang.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* STOCK MOVEMENT HISTORY MODAL */}
      {selectedItemHistory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  <History className="w-5 h-5 text-blue-400" />
                  <span>Kartu Stok & Riwayat Mutasi: {selectedItemHistory.name}</span>
                </h3>
                <p className="text-xs text-slate-400 font-mono">Kode: {selectedItemHistory.itemCode} | Lokasi: {selectedItemHistory.warehouseLocation}</p>
              </div>
              <button 
                onClick={() => setSelectedItemHistory(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl text-xs">
                <div>
                  <span className="text-slate-500 block">Stok Saat Ini:</span>
                  <span className="text-base font-bold text-slate-900 font-mono">{selectedItemHistory.currentStock} {selectedItemHistory.unit}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Minimum Stok:</span>
                  <span className="text-base font-bold text-slate-900 font-mono">{selectedItemHistory.minStock} {selectedItemHistory.unit}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">Nilai Satuan:</span>
                  <span className="text-base font-bold text-emerald-700 font-mono">{formatRupiah(selectedItemHistory.unitPrice)}</span>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">Riwayat Log Mutasi</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                      <tr>
                        <th className="p-3">Tanggal</th>
                        <th className="p-3">Tipe</th>
                        <th className="p-3 text-right">Jumlah</th>
                        <th className="p-3 text-right">Saldo Akhir</th>
                        <th className="p-3">Ref Dokumen</th>
                        <th className="p-3">Operator & Catatan</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedItemHistory.movements.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50">
                          <td className="p-3 font-mono text-[11px] text-slate-600">{m.date}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              m.type === 'IN' ? 'bg-emerald-100 text-emerald-800' :
                              m.type === 'OUT' ? 'bg-rose-100 text-rose-800' :
                              m.type === 'RETURN' ? 'bg-purple-100 text-purple-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {m.type}
                            </span>
                          </td>
                          <td className="p-3 text-right font-mono font-bold">
                            {m.type === 'IN' ? `+${m.qty}` : `-${m.qty}`}
                          </td>
                          <td className="p-3 text-right font-mono font-extrabold text-slate-900">
                            {m.balanceAfter}
                          </td>
                          <td className="p-3 font-mono text-blue-800 font-semibold">{m.referenceDoc}</td>
                          <td className="p-3 text-slate-600">
                            <div>{m.operator}</div>
                            {m.notes && <div className="text-[10px] text-slate-400">{m.notes}</div>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedItemHistory(null)}
                className="px-4 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
