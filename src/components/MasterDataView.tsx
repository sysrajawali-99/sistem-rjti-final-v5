import React, { useState } from 'react';
import { 
  Database, 
  Plus, 
  Search, 
  Building2, 
  Users, 
  Package, 
  Star, 
  Phone, 
  Mail, 
  MapPin, 
  CreditCard,
  Edit2,
  Trash2
} from 'lucide-react';
import { Vendor, CustomerClient, CompanyProfile } from '../types';

interface MasterDataViewProps {
  company: CompanyProfile;
  vendors: Vendor[];
  customers: CustomerClient[];
  onAddVendor: (vendor: Omit<Vendor, 'id'>) => void;
  onAddCustomer: (customer: Omit<CustomerClient, 'id'>) => void;
  onUpdateCompany: (company: CompanyProfile) => void;
}

export const MasterDataView: React.FC<MasterDataViewProps> = ({
  company,
  vendors,
  customers,
  onAddVendor,
  onAddCustomer,
  onUpdateCompany
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'VENDORS' | 'CUSTOMERS' | 'COMPANY'>('VENDORS');
  const [searchTerm, setSearchTerm] = useState('');
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // New Vendor Form state
  const [newVendor, setNewVendor] = useState({
    code: `VND-${String(vendors.length + 1).padStart(3, '0')}`,
    name: '',
    category: 'Konstruksi & Material Besi',
    email: '',
    phone: '',
    address: '',
    npwp: '',
    picName: '',
    picPhone: '',
    bankName: 'BCA / Mandiri',
    bankAccount: '',
    bankHolder: '',
    paymentTermDefault: 'Net 30 Days',
    rating: 5.0
  });

  // New Customer Form state
  const [newCustomer, setNewCustomer] = useState({
    code: `CLI-${String(customers.length + 1).padStart(3, '0')}`,
    name: '',
    companyType: 'Manufaktur Industri',
    email: '',
    phone: '',
    address: '',
    projectAssigned: ''
  });

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVendor.name || !newVendor.picName) {
      alert("Nama vendor dan PIC wajib diisi.");
      return;
    }
    onAddVendor(newVendor);
    setShowVendorModal(false);
    setNewVendor({
      code: `VND-${String(vendors.length + 2).padStart(3, '0')}`,
      name: '',
      category: 'Konstruksi & Material Besi',
      email: '',
      phone: '',
      address: '',
      npwp: '',
      picName: '',
      picPhone: '',
      bankName: 'BCA / Mandiri',
      bankAccount: '',
      bankHolder: '',
      paymentTermDefault: 'Net 30 Days',
      rating: 5.0
    });
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomer.name) {
      alert("Nama klien / pelanggan wajib diisi.");
      return;
    }
    onAddCustomer(newCustomer);
    setShowCustomerModal(false);
    setNewCustomer({
      code: `CLI-${String(customers.length + 2).padStart(3, '0')}`,
      name: '',
      companyType: 'Manufaktur Industri',
      email: '',
      phone: '',
      address: '',
      projectAssigned: ''
    });
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase tracking-wider">
            <Database className="w-4 h-4" />
            <span>Master Data & Profil Institusi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1 font-serif">
            Master Data Perusahaan
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Database Vendor rekanan, Klien proyek, dan Legalitas PT. Rajawali Talenta Indonesia.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl">
          <button
            onClick={() => setActiveSubTab('VENDORS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'VENDORS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Vendor Rekanan ({vendors.length})
          </button>
          <button
            onClick={() => setActiveSubTab('CUSTOMERS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'CUSTOMERS' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Klien Proyek ({customers.length})
          </button>
          <button
            onClick={() => setActiveSubTab('COMPANY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'COMPANY' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kop Surat & Profil PT
          </button>
        </div>
      </div>

      {/* VENDOR TAB */}
      {activeSubTab === 'VENDORS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari Vendor, Kategori, PIC..."
                className="w-full text-xs pl-9 pr-4 py-2 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => setShowVendorModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Vendor Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors
              .filter(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()) || v.category.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((v) => (
                <div key={v.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-blue-300 transition-colors">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                        {v.code}
                      </span>
                      <div className="flex items-center gap-1 text-amber-500 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{v.rating}</span>
                      </div>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm mt-2">{v.name}</h3>
                    <p className="text-xs text-blue-700 font-semibold">{v.category}</p>
                    
                    <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{v.phone}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{v.email}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{v.address}</span>
                      </p>
                    </div>

                    <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-[11px]">
                      <div className="font-bold text-slate-700">Rekening Bank Vendor:</div>
                      <div className="text-slate-600">{v.bankName} - <span className="font-mono font-bold text-slate-900">{v.bankAccount}</span> ({v.bankHolder})</div>
                      <div className="text-slate-500 mt-1">PIC: <strong>{v.picName}</strong> ({v.picPhone})</div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex justify-between items-center">
                    <span>Terms: <strong>{v.paymentTermDefault}</strong></span>
                    <span className="text-emerald-700 font-bold">Verified Partner</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* CUSTOMERS TAB */}
      {activeSubTab === 'CUSTOMERS' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="w-80 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari Klien, Proyek..."
                className="w-full text-xs pl-9 pr-4 py-2 bg-white rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button
              onClick={() => setShowCustomerModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Klien Proyek Baru</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customers
              .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.projectAssigned.toLowerCase().includes(searchTerm.toLowerCase()))
              .map((c) => (
                <div key={c.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-emerald-300 transition-colors">
                  <div>
                    <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {c.code}
                    </span>

                    <h3 className="font-bold text-slate-900 text-sm mt-2">{c.name}</h3>
                    <p className="text-xs text-emerald-700 font-semibold">{c.companyType}</p>
                    
                    <div className="mt-4 space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                      <p className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{c.phone}</span>
                      </p>
                      <p className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{c.email}</span>
                      </p>
                      <p className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{c.address}</span>
                      </p>
                    </div>

                    <div className="mt-3 p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 text-[11px]">
                      <div className="font-bold text-emerald-900">Alokasi Proyek Konstruksi / Supply:</div>
                      <div className="text-slate-800 font-medium mt-0.5">{c.projectAssigned}</div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* COMPANY PROFILE TAB */}
      {activeSubTab === 'COMPANY' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto space-y-6">
          <div>
            <h3 className="font-bold text-base text-slate-900">Profil & Kop Surat Resmi Perusahaan</h3>
            <p className="text-xs text-slate-500">Informasi ini otomatis tercantum pada setiap kop surat dokumen PO, MR, Surat Jalan, dan Faktur.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Nama Resmi Perusahaan (PT):</label>
              <input
                type="text"
                value={company.name}
                onChange={(e) => onUpdateCompany({ ...company, name: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-slate-900"
              />
            </div>

            <div className="col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Tagline Bisnis / Klasifikasi Usaha:</label>
              <input
                type="text"
                value={company.tagline}
                onChange={(e) => onUpdateCompany({ ...company, tagline: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div className="col-span-2">
              <label className="font-bold text-slate-700 block mb-1">Alamat Kantor & Gudang Utama:</label>
              <textarea
                rows={2}
                value={company.address}
                onChange={(e) => onUpdateCompany({ ...company, address: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Kota / Provinsi:</label>
              <input
                type="text"
                value={company.city}
                onChange={(e) => onUpdateCompany({ ...company, city: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Kode Pos:</label>
              <input
                type="text"
                value={company.postalCode}
                onChange={(e) => onUpdateCompany({ ...company, postalCode: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nomor Telepon Kantor:</label>
              <input
                type="text"
                value={company.phone}
                onChange={(e) => onUpdateCompany({ ...company, phone: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Email Resmi Pengadaan:</label>
              <input
                type="text"
                value={company.email}
                onChange={(e) => onUpdateCompany({ ...company, email: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">NPWP Perusahaan:</label>
              <input
                type="text"
                value={company.npwp}
                onChange={(e) => onUpdateCompany({ ...company, npwp: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Direktur Utama (Penandatangan PO):</label>
              <input
                type="text"
                value={company.directorName}
                onChange={(e) => onUpdateCompany({ ...company, directorName: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 font-bold text-blue-950"
              />
            </div>
          </div>
        </div>
      )}

      {/* CREATE VENDOR MODAL */}
      {showVendorModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Registrasi Vendor Rekanan Baru</h3>
              <button onClick={() => setShowVendorModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveVendor} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="font-bold block mb-1 text-slate-700">Nama Perusahaan Vendor *</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: PT. Cipta Sarana Mandiri"
                    value={newVendor.name}
                    onChange={(e) => setNewVendor({ ...newVendor, name: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Kategori Produk</label>
                  <input
                    type="text"
                    placeholder="misal: Elektrik & Kabel"
                    value={newVendor.category}
                    onChange={(e) => setNewVendor({ ...newVendor, category: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Syarat Pembayaran Default</label>
                  <input
                    type="text"
                    placeholder="misal: Net 30 Days"
                    value={newVendor.paymentTermDefault}
                    onChange={(e) => setNewVendor({ ...newVendor, paymentTermDefault: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Nama PIC Vendor *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nama PIC"
                    value={newVendor.picName}
                    onChange={(e) => setNewVendor({ ...newVendor, picName: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-700">No. HP / WA PIC</label>
                  <input
                    type="text"
                    placeholder="0812-xxxx-xxxx"
                    value={newVendor.picPhone}
                    onChange={(e) => setNewVendor({ ...newVendor, picPhone: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Telepon Kantor</label>
                  <input
                    type="text"
                    value={newVendor.phone}
                    onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Email Vendor</label>
                  <input
                    type="email"
                    value={newVendor.email}
                    onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div className="col-span-2">
                  <label className="font-bold block mb-1 text-slate-700">Alamat Lengkap Pabrik / Kantor</label>
                  <textarea
                    rows={2}
                    value={newVendor.address}
                    onChange={(e) => setNewVendor({ ...newVendor, address: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Bank & No Rekening</label>
                  <input
                    type="text"
                    placeholder="BCA: 123-456-7890"
                    value={newVendor.bankAccount}
                    onChange={(e) => setNewVendor({ ...newVendor, bankAccount: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Nama Pemegang Rekening (A/N)</label>
                  <input
                    type="text"
                    placeholder="A/N PT..."
                    value={newVendor.bankHolder}
                    onChange={(e) => setNewVendor({ ...newVendor, bankHolder: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowVendorModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white font-bold rounded-xl cursor-pointer"
                >
                  Simpan Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CUSTOMER MODAL */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Registrasi Klien Proyek Baru</h3>
              <button onClick={() => setShowCustomerModal(false)} className="text-slate-400 hover:text-white cursor-pointer">✕</button>
            </div>
            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold block mb-1 text-slate-700">Nama Perusahaan Klien *</label>
                <input
                  type="text"
                  required
                  placeholder="misal: PT. Astra Honda Motor"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-700">Bidang Usaha</label>
                <input
                  type="text"
                  placeholder="misal: Manufaktur Otomotif"
                  value={newCustomer.companyType}
                  onChange={(e) => setNewCustomer({ ...newCustomer, companyType: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-700">Nama Proyek Yang Dikerjakan</label>
                <input
                  type="text"
                  placeholder="misal: Piping & Exhaust System Plant 3"
                  value={newCustomer.projectAssigned}
                  onChange={(e) => setNewCustomer({ ...newCustomer, projectAssigned: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>
              <div>
                <label className="font-bold block mb-1 text-slate-700">Alamat Lokasi Proyek</label>
                <textarea
                  rows={2}
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Telepon</label>
                  <input
                    type="text"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Email</label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomerModal(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl cursor-pointer"
                >
                  Simpan Klien
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
