import React, { useState } from 'react';
import { 
  Building2, 
  Save, 
  RotateCcw, 
  Printer, 
  Shield, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Globe, 
  MapPin, 
  CreditCard, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  FileCheck2,
  Lock,
  Building,
  QrCode,
  Sparkles,
  Info
} from 'lucide-react';
import { CompanyProfile, User } from '../types';
import { RtiLogo } from './RtiLogo';
import { COMPANY_PROFILE } from '../lib/initialData';

interface CompanySettingsViewProps {
  currentUser: User;
  company: CompanyProfile;
  onSaveCompany: (updated: CompanyProfile) => void;
  onPreviewPrint?: (company: CompanyProfile) => void;
}

export const CompanySettingsView: React.FC<CompanySettingsViewProps> = ({
  currentUser,
  company,
  onSaveCompany,
  onPreviewPrint
}) => {
  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';

  // Form state
  const [formData, setFormData] = useState<CompanyProfile>({
    name: company.name || COMPANY_PROFILE.name,
    tagline: company.tagline || COMPANY_PROFILE.tagline,
    address: company.address || COMPANY_PROFILE.address,
    city: company.city || COMPANY_PROFILE.city,
    postalCode: company.postalCode || COMPANY_PROFILE.postalCode,
    phone: company.phone || COMPANY_PROFILE.phone,
    phoneSecondary: company.phoneSecondary || COMPANY_PROFILE.phoneSecondary || '',
    fax: company.fax || COMPANY_PROFILE.fax || '',
    email: company.email || COMPANY_PROFILE.email,
    website: company.website || COMPANY_PROFILE.website,
    npwp: company.npwp || COMPANY_PROFILE.npwp,
    nib: company.nib || COMPANY_PROFILE.nib || '9120003481293',
    bankName: company.bankName || COMPANY_PROFILE.bankName,
    bankAccount: company.bankAccount || COMPANY_PROFILE.bankAccount,
    bankHolder: company.bankHolder || COMPANY_PROFILE.bankHolder,
    bankSecondaryName: company.bankSecondaryName || COMPANY_PROFILE.bankSecondaryName || '',
    bankSecondaryAccount: company.bankSecondaryAccount || COMPANY_PROFILE.bankSecondaryAccount || '',
    bankSecondaryHolder: company.bankSecondaryHolder || COMPANY_PROFILE.bankSecondaryHolder || '',
    directorName: company.directorName || COMPANY_PROFILE.directorName,
    directorTitle: company.directorTitle || COMPANY_PROFILE.directorTitle,
    procurementManager: company.procurementManager || COMPANY_PROFILE.procurementManager || 'Rina Wijaya, S.E.',
    logoText: company.logoText || COMPANY_PROFILE.logoText,
    defaultTaxRate: company.defaultTaxRate !== undefined ? company.defaultTaxRate : 11,
    documentFooterNotes: company.documentFooterNotes || COMPANY_PROFILE.documentFooterNotes || ''
  });

  const [activeTab, setActiveTab] = useState<'IDENTITY' | 'CONTACT' | 'BANKING' | 'SIGNERS' | 'PREVIEW'>('IDENTITY');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleChange = (field: keyof CompanyProfile, value: any) => {
    if (!isSuperAdmin) return;
    setFormData(prev => ({ ...prev, [field]: value }));
    setSaveSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert("Akses Ditolak: Hanya Super Admin yang memiliki wewenang untuk mengubah pengaturan perusahaan.");
      return;
    }

    if (!formData.name.trim()) {
      alert("Nama perusahaan wajib diisi.");
      return;
    }

    if (!formData.npwp.trim()) {
      alert("Nomor NPWP perusahaan wajib diisi.");
      return;
    }

    setIsSaving(true);
    setTimeout(() => {
      onSaveCompany(formData);
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }, 400);
  };

  const handleResetToDefault = () => {
    if (!isSuperAdmin) return;
    if (window.confirm("Apakah Anda yakin ingin mengembalikan data profil ke pengaturan standar PT. Rajawali Talenta Indonesia?")) {
      setFormData(COMPANY_PROFILE);
      onSaveCompany(COMPANY_PROFILE);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wider">
            <Building2 className="w-4 h-4" />
            <span>Konfigurasi Sistem & Administrasi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1 font-serif flex items-center gap-2.5">
            <span>Pengaturan Perusahaan</span>
            <span className="text-xs font-sans font-bold px-2.5 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700">
              Super Admin Only
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
            Kelola identitas korporat, legalitas NPWP & NIB, rekening bank operasional, alamat kantor/gudang, dan pejabat penandatangan dokumen legal PO, MR, DO, dan Faktur.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {isSuperAdmin && (
            <button
              type="button"
              onClick={handleResetToDefault}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 transition-colors cursor-pointer"
              title="Kembalikan ke data standar PT. Rajawali Talenta Indonesia"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>
          )}

          {isSuperAdmin ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-900/20 hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isSaving ? 'Menyimpan...' : 'Simpan Pengaturan'}</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700">
              <Lock className="w-3.5 h-3.5" />
              <span>Mode Lihat Saja</span>
            </div>
          )}
        </div>
      </div>

      {/* Access alert if not super admin */}
      {!isSuperAdmin && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Akses Terbatas: Hanya Akun Super Admin yang Dapat Mengubah Pengaturan Perusahaan</p>
            <p className="mt-0.5 text-amber-700 dark:text-amber-300">
              Anda saat ini masuk sebagai <strong>{currentUser.name}</strong> ({currentUser.role}). Pengaturan ini hanya dapat diubah oleh akun Super Admin. Anda dapat melihat informasi profil perusahaan di bawah ini.
            </p>
          </div>
        </div>
      )}

      {/* Save Success Alert */}
      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <div className="font-semibold">
            Pengaturan Perusahaan berhasil disimpan dan disinkronkan ke seluruh sistem serta dokumen cetak resmi.
          </div>
        </div>
      )}

      {/* Main Settings Navigation & Form Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        
        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('IDENTITY')}
            className={`px-5 py-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'IDENTITY'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>1. Identitas & Legalitas PT</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('CONTACT')}
            className={`px-5 py-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'CONTACT'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MapPin className="w-4 h-4" />
            <span>2. Lokasi & Kontak Kantor</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BANKING')}
            className={`px-5 py-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'BANKING'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>3. Rekening Bank & Pajak</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('SIGNERS')}
            className={`px-5 py-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'SIGNERS'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>4. Pejabat & Catatan Kaki</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('PREVIEW')}
            className={`px-5 py-3.5 text-xs font-bold transition-all border-b-2 flex items-center gap-2 whitespace-nowrap cursor-pointer ${
              activeTab === 'PREVIEW'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Pratinjau Kop Surat Resmi</span>
          </button>
        </div>

        {/* Tab Contents */}
        <form onSubmit={handleSubmit} className="p-6">
          
          {/* TAB 1: IDENTITAS & LEGALITAS */}
          {activeTab === 'IDENTITY' && (
            <div className="space-y-5 max-w-3xl">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Identitas Korporat & Legalitas Perusahaan</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Informasi resmi PT yang digunakan pada kop surat, laporan audit, dan kontrak pembelian.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="md:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Nama Resmi Perusahaan (PT) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isSuperAdmin}
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="misal: PT. RAJAWALI TALENTA INDONESIA"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Nama PT yang tercantum di Akta Notaris & SK Kemenkumham.</span>
                </div>

                <div className="md:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Tagline Bisnis & Klasifikasi Usaha
                  </label>
                  <input
                    type="text"
                    disabled={!isSuperAdmin}
                    value={formData.tagline}
                    onChange={(e) => handleChange('tagline', e.target.value)}
                    placeholder="misal: General Contractor, Industrial Supplier & Procurement Services"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none font-medium"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Slogan atau bidang usaha di bawah judul kop surat.</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Nomor Pokok Wajib Pajak (NPWP) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isSuperAdmin}
                    value={formData.npwp}
                    onChange={(e) => handleChange('npwp', e.target.value)}
                    placeholder="misal: 01.892.456.7-413.000"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Nomor Induk Berusaha (NIB) / Izin Usaha
                  </label>
                  <input
                    type="text"
                    disabled={!isSuperAdmin}
                    value={formData.nib || ''}
                    onChange={(e) => handleChange('nib', e.target.value)}
                    placeholder="misal: 9120003481293"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Inisial Singkatan Logo
                  </label>
                  <input
                    type="text"
                    disabled={!isSuperAdmin}
                    value={formData.logoText}
                    onChange={(e) => handleChange('logoText', e.target.value)}
                    placeholder="RTI"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold uppercase focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center p-1 shrink-0">
                    <RtiLogo variant="symbol" size={32} />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white text-xs">Logo Resmi Terdaftar</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Vektor Elang Rajawali Merah-Biru-Kuning-Hijau</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LOKASI & KONTAK */}
          {activeTab === 'CONTACT' && (
            <div className="space-y-5 max-w-3xl">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Alamat Kantor, Gudang & Jalur Komunikasi</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Alamat resmi pengiriman barang, kantor operasional, email purchasing, dan nomor telepon.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="md:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Alamat Lengkap Kantor & Gudang Utama <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    disabled={!isSuperAdmin}
                    value={formData.address}
                    onChange={(e) => handleChange('address', e.target.value)}
                    placeholder="misal: Kawasan Industri MM2100, Jl. Irian Blok E-12 No. 8, Cikarang Barat"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Kota & Provinsi <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isSuperAdmin}
                    value={formData.city}
                    onChange={(e) => handleChange('city', e.target.value)}
                    placeholder="Bekasi - Jawa Barat"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Kode Pos
                  </label>
                  <input
                    type="text"
                    disabled={!isSuperAdmin}
                    value={formData.postalCode}
                    onChange={(e) => handleChange('postalCode', e.target.value)}
                    placeholder="17530"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Nomor Telepon Kantor Utama <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isSuperAdmin}
                    value={formData.phone}
                    onChange={(e) => handleChange('phone', e.target.value)}
                    placeholder="+62 21 8983 4567 / +62 21 8983 4568"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    WhatsApp Pengadaan / No. Sekunder
                  </label>
                  <input
                    type="text"
                    disabled={!isSuperAdmin}
                    value={formData.phoneSecondary || ''}
                    onChange={(e) => handleChange('phoneSecondary', e.target.value)}
                    placeholder="+62 811 8899 7722 (WhatsApp Pengadaan)"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Nomor Fax
                  </label>
                  <input
                    type="text"
                    disabled={!isSuperAdmin}
                    value={formData.fax || ''}
                    onChange={(e) => handleChange('fax', e.target.value)}
                    placeholder="+62 21 8983 4569"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Email Resmi Pengadaan & Billing <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    disabled={!isSuperAdmin}
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="procurement@rajawali-talenta.co.id"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Website Resmi Perusahaan
                  </label>
                  <input
                    type="text"
                    disabled={!isSuperAdmin}
                    value={formData.website}
                    onChange={(e) => handleChange('website', e.target.value)}
                    placeholder="www.rajawali-talenta.co.id"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REKENING BANK & PAJAK */}
          {activeTab === 'BANKING' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Rekening Bank Operasional & Parameter Pajak</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Rekening resmi yang tercantum pada faktur penagihan, surat pesanan (PO), dan instruksi pembayaran.
                </p>
              </div>

              {/* Primary Bank Card */}
              <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-4">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-bold text-xs">
                  <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Rekening Bank Utama (Mandiri / Default)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Bank *</label>
                    <input
                      type="text"
                      required
                      disabled={!isSuperAdmin}
                      value={formData.bankName}
                      onChange={(e) => handleChange('bankName', e.target.value)}
                      placeholder="Bank Mandiri (Persero) Tbk"
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nomor Rekening *</label>
                    <input
                      type="text"
                      required
                      disabled={!isSuperAdmin}
                      value={formData.bankAccount}
                      onChange={(e) => handleChange('bankAccount', e.target.value)}
                      placeholder="156-00-1289456-1"
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Atas Nama (Holder) *</label>
                    <input
                      type="text"
                      required
                      disabled={!isSuperAdmin}
                      value={formData.bankHolder}
                      onChange={(e) => handleChange('bankHolder', e.target.value)}
                      placeholder="PT. RAJAWALI TALENTA INDONESIA"
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-semibold"
                    />
                  </div>
                </div>
              </div>

              {/* Secondary Bank Card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-xs">
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  <span>Rekening Bank Alternatif / Sekunder (BCA / Lainnya)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nama Bank Sekunder</label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={formData.bankSecondaryName || ''}
                      onChange={(e) => handleChange('bankSecondaryName', e.target.value)}
                      placeholder="Bank Central Asia (BCA)"
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Nomor Rekening Sekunder</label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={formData.bankSecondaryAccount || ''}
                      onChange={(e) => handleChange('bankSecondaryAccount', e.target.value)}
                      placeholder="869-052-1199"
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Atas Nama</label>
                    <input
                      type="text"
                      disabled={!isSuperAdmin}
                      value={formData.bankSecondaryHolder || ''}
                      onChange={(e) => handleChange('bankSecondaryHolder', e.target.value)}
                      placeholder="PT. RAJAWALI TALENTA INDONESIA"
                      className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Tax Settings */}
              <div className="p-4 rounded-xl bg-amber-50/50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="font-bold text-amber-950 dark:text-amber-300">Nilai Tarif PPN / Pajak Default Sistem (%)</div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">Diterapkan secara otomatis saat membuat Purchase Order & Faktur Tagihan.</div>
                </div>
                <div className="w-28 shrink-0">
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="100"
                      disabled={!isSuperAdmin}
                      value={formData.defaultTaxRate ?? 11}
                      onChange={(e) => handleChange('defaultTaxRate', parseFloat(e.target.value) || 0)}
                      className="w-full p-2 pr-7 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-mono font-bold text-center"
                    />
                    <span className="absolute right-2.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">%</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: PEJABAT & CATATAN KAKI */}
          {activeTab === 'SIGNERS' && (
            <div className="space-y-5 max-w-3xl">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Pejabat Otorisasi & Format Catatan Dokumen</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Pejabat yang berwenang menandatangani surat pesanan dan ketentuan umum pada dokumen cetak.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Nama Direktur Utama (Penandatangan PO) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isSuperAdmin}
                    value={formData.directorName}
                    onChange={(e) => handleChange('directorName', e.target.value)}
                    placeholder="Ir. Hendra Gunawan, M.M."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Nama pejabat tertinggi yang menandatangani PO resmi ke vendor.</span>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Jabatan Resmi Direktur
                  </label>
                  <input
                    type="text"
                    disabled={!isSuperAdmin}
                    value={formData.directorTitle}
                    onChange={(e) => handleChange('directorTitle', e.target.value)}
                    placeholder="Direktur Utama"
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Kepala Bagian Purchasing / Pengadaan
                  </label>
                  <input
                    type="text"
                    disabled={!isSuperAdmin}
                    value={formData.procurementManager || ''}
                    onChange={(e) => handleChange('procurementManager', e.target.value)}
                    placeholder="Rina Wijaya, S.E."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Pejabat verifikator penerbitan Surat Pesanan dan Material Request.</span>
                </div>

                <div className="md:col-span-2">
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    Catatan Kaki & Syarat Ketentuan Dokumen Cetak (Footer Notes)
                  </label>
                  <textarea
                    rows={3}
                    disabled={!isSuperAdmin}
                    value={formData.documentFooterNotes || ''}
                    onChange={(e) => handleChange('documentFooterNotes', e.target.value)}
                    placeholder="Dokumen ini sah dan diterbitkan secara elektronik melalui Sistem ERP PT. Rajawali Talenta Indonesia."
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none text-xs"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Pernyataan legalitas yang otomatis dicetak pada footer seluruh lembar PO, MR, DO, dan Faktur.</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PRATINJAU KOP SURAT RESMI */}
          {activeTab === 'PREVIEW' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Pratinjau Kop Surat Resmi (Official Letterhead)</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Berikut adalah tampilan kop surat yang akan otomatis tercetak di bagian atas setiap dokumen PO, MR, DO, dan Invoice:
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Real-Time Sync</span>
                  </span>
                </div>
              </div>

              {/* Letterhead Preview Box */}
              <div className="p-8 rounded-2xl bg-white text-slate-900 border-2 border-slate-300 dark:border-slate-700 shadow-xl max-w-4xl mx-auto">
                <div className="border-b-2 border-slate-900 pb-4">
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex items-center gap-4">
                      {/* Logo Emblem */}
                      <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center p-1 shrink-0 shadow-md">
                        <RtiLogo variant="symbol" size={54} theme="dark" />
                      </div>
                      <div>
                        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-blue-950 uppercase font-sans">
                          {formData.name || "PT. RAJAWALI TALENTA INDONESIA"}
                        </h1>
                        <p className="text-xs text-amber-700 font-bold tracking-wide uppercase">
                          {formData.tagline || "General Contractor, Industrial Supplier & Procurement Services"}
                        </p>
                        <p className="text-xs text-slate-600 mt-1 max-w-xl">
                          {formData.address}, {formData.city} {formData.postalCode}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 mt-1">
                          <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-400" /> {formData.phone}</span>
                          <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-400" /> {formData.email}</span>
                          <span><strong>NPWP:</strong> {formData.npwp}</span>
                          {formData.nib && <span><strong>NIB:</strong> {formData.nib}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="text-right hidden sm:block shrink-0 border border-slate-200 rounded-lg p-2 text-center bg-slate-50">
                      <div className="w-12 h-12 bg-white border border-slate-300 mx-auto rounded flex items-center justify-center p-1">
                        <QrCode className="w-10 h-10 text-slate-800" />
                      </div>
                      <span className="text-[9px] text-slate-500 block mt-1 font-mono uppercase">E-Verified</span>
                    </div>
                  </div>
                  {/* Decorative line */}
                  <div className="w-full h-1 bg-gradient-to-r from-blue-900 via-amber-500 to-red-600 mt-3 rounded-full"></div>
                </div>

                {/* Sample Document Body Placeholder */}
                <div className="py-8 text-center text-slate-400 text-xs border-b border-dashed border-slate-200">
                  <p className="font-bold text-slate-600 uppercase tracking-widest text-sm">[ CONTOH DOKUMEN CETAK: SURAT PESANAN PEMBELIAN / MATERIAL REQUEST / SURAT JALAN ]</p>
                  <p className="mt-1 text-slate-400">Isi rincian barang, daftar item, harga, vendor, dan syarat pembayaran akan dicetak di bagian ini.</p>
                </div>

                {/* Footer preview */}
                <div className="pt-4 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="max-w-md">
                    <strong>Catatan Legalitas:</strong> {formData.documentFooterNotes || "Dokumen ini sah dan diterbitkan secara elektronik."}
                  </div>
                  <div className="text-right">
                    <div>Penandatangan: <strong>{formData.directorName}</strong></div>
                    <div className="text-slate-400">{formData.directorTitle}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Save Button in Footer */}
          {activeTab !== 'PREVIEW' && isSuperAdmin && (
            <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Perubahan akan dicatat otomatis ke dalam Audit Log sistem.</span>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{isSaving ? 'Menyimpan...' : 'Simpan Semua Perubahan'}</span>
              </button>
            </div>
          )}

        </form>
      </div>

    </div>
  );
};
