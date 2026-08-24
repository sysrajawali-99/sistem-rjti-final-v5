import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Shield, 
  Check, 
  X, 
  Edit, 
  Trash2, 
  KeyRound, 
  ShieldCheck, 
  Info, 
  CheckCircle2, 
  Lock,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import { User, UserRole, NavTab } from '../types';
import { ROLE_INFO, ROLE_DEFAULT_MENUS, getUserEffectiveMenus } from '../lib/initialData';

interface UserManagementViewProps {
  users: User[];
  currentUser: User;
  onAddUser: (userData: Omit<User, 'id'>) => void;
  onUpdateUser: (user: User) => void;
  onDeleteUser: (userId: string) => void;
}

const ALL_NAV_MENUS: { id: NavTab; label: string; description: string }[] = [
  { id: 'DASHBOARD', label: 'Dashboard Eksekutif', description: 'Ringkasan KPI, Grafik Realisasi & Metrik Finansial' },
  { id: 'MR', label: 'Material Request (MR)', description: 'Pengajuan & Approval Kebutuhan Material Lapangan' },
  { id: 'PO', label: 'Purchase Order (PO)', description: 'Pemesanan Pembelian ke Supplier & Approval Direksi' },
  { id: 'DO', label: 'Surat Jalan (DO)', description: 'Penerimaan Logistik & Konfirmasi Penerimaan Gudang' },
  { id: 'INVOICE', label: 'Invoicing & Pembayaran', description: 'Pencatatan Faktur Tagihan & Pelunasan Bank' },
  { id: 'HUTANG', label: 'Hutang Usaha (AP)', description: 'Kewajiban Pembayaran PO ke Supplier (Harga Beli + Ongkir)' },
  { id: 'PIUTANG', label: 'Piutang Usaha (AR)', description: 'Hak Tagih Pengiriman DO Pelanggan & Penagihan Proyek' },
  { id: 'KAS_BANK', label: 'Kas & Bank (Update Saldo)', description: 'Pengelompokan Rekening, Update Saldo & Mutasi Keuangan' },
  { id: 'RETUR', label: 'Retur & Klaim Barang', description: 'Pengembalian Material Rusak atau Tidak Sesuai Spek' },
  { id: 'INVENTORY', label: 'Gudang & Stok Material', description: 'Monitoring Saldo Inventaris, SKU & Kartu Stok' },
  { id: 'USERS', label: 'Manajemen Pengguna', description: 'Tambah User Baru & Pengaturan Hak Akses Menu' },
  { id: 'COMPANY_SETTINGS', label: 'Pengaturan Perusahaan', description: 'Profil Legalitas PT, NPWP, Bank & Dokumen Resmi' },
  { id: 'AUDIT_LOG', label: 'Audit Log & Riwayat', description: 'Jejak Aktivitas Sistem Seluruh Pengguna' },
];

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  currentUser,
  onAddUser,
  onUpdateUser,
  onDeleteUser
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Form states for Add/Edit
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    username: string;
    password?: string;
    role: UserRole;
    department: string;
    allowedMenus: NavTab[];
  }>({
    name: '',
    email: '',
    username: '',
    password: '',
    role: 'ADMIN_HO',
    department: 'Administrasi Head Office',
    allowedMenus: ROLE_DEFAULT_MENUS.ADMIN_HO
  });

  // Password Reset Modal state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [targetPasswordUser, setTargetPasswordUser] = useState<User | null>(null);
  const [newPasswordValue, setNewPasswordValue] = useState('');
  const [confirmPasswordValue, setConfirmPasswordValue] = useState('');
  const [showPasswordInModal, setShowPasswordInModal] = useState(false);

  const openAddModal = () => {
    setFormData({
      name: '',
      email: '',
      username: '',
      password: '',
      role: 'ADMIN_HO',
      department: 'Administrasi Head Office',
      allowedMenus: [...ROLE_DEFAULT_MENUS.ADMIN_HO]
    });
    setEditingUser(null);
    setIsAddModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      username: user.username || user.email.split('@')[0],
      password: user.password || '',
      role: user.role,
      department: user.department,
      allowedMenus: [...getUserEffectiveMenus(user)]
    });
    setIsAddModalOpen(true);
  };

  const openPasswordModal = (user: User) => {
    setTargetPasswordUser(user);
    setNewPasswordValue(user.password || '');
    setConfirmPasswordValue(user.password || '');
    setShowPasswordInModal(false);
    setIsPasswordModalOpen(true);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPasswordUser) return;
    if (!newPasswordValue.trim()) {
      alert('Kata sandi tidak boleh kosong.');
      return;
    }
    if (newPasswordValue !== confirmPasswordValue) {
      alert('Konfirmasi kata sandi baru tidak cocok. Mohon ketik ulang dengan benar.');
      return;
    }

    onUpdateUser({
      ...targetPasswordUser,
      password: newPasswordValue.trim()
    });

    setIsPasswordModalOpen(false);
    alert(`Kata sandi untuk pengguna "${targetPasswordUser.name}" berhasil diperbarui.`);
  };

  const handleRoleChange = (newRole: UserRole) => {
    // When role changes, preset the menus to the role default
    setFormData({
      ...formData,
      role: newRole,
      allowedMenus: [...ROLE_DEFAULT_MENUS[newRole]]
    });
  };

  const handleToggleMenu = (menuId: NavTab) => {
    const currentMenus = formData.allowedMenus;
    if (currentMenus.includes(menuId)) {
      setFormData({
        ...formData,
        allowedMenus: currentMenus.filter(m => m !== menuId)
      });
    } else {
      setFormData({
        ...formData,
        allowedMenus: [...currentMenus, menuId]
      });
    }
  };

  const handleApplyRoleDefaults = () => {
    setFormData({
      ...formData,
      allowedMenus: [...ROLE_DEFAULT_MENUS[formData.role]]
    });
  };

  const handleSelectAllMenus = () => {
    setFormData({
      ...formData,
      allowedMenus: ALL_NAV_MENUS.map(m => m.id)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Nama dan Email pengguna wajib diisi.');
      return;
    }

    if (formData.allowedMenus.length === 0) {
      alert('Pengguna wajib memiliki minimal 1 hak akses menu.');
      return;
    }

    if (editingUser) {
      onUpdateUser({
        ...editingUser,
        name: formData.name.trim(),
        email: formData.email.trim(),
        username: formData.username.trim() || formData.email.split('@')[0],
        password: formData.password?.trim() || editingUser.password || 'admin123',
        role: formData.role,
        department: formData.department.trim(),
        allowedMenus: formData.allowedMenus
      });
    } else {
      onAddUser({
        name: formData.name.trim(),
        email: formData.email.trim(),
        username: formData.username.trim() || formData.email.split('@')[0],
        password: formData.password?.trim() || (formData.role === 'SUPER_ADMIN' ? 'superadmin123' : 'admin123'),
        role: formData.role,
        department: formData.department.trim(),
        allowedMenus: formData.allowedMenus
      });
    }

    setIsAddModalOpen(false);
  };

  const handleDelete = (user: User) => {
    if (user.id === currentUser.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif.');
      return;
    }
    const superAdmins = users.filter(u => u.role === 'SUPER_ADMIN');
    if (user.role === 'SUPER_ADMIN' && superAdmins.length <= 1) {
      alert('Sistem membutuhkan minimal 1 Super Admin. Pengguna ini tidak dapat dihapus.');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus pengguna "${user.name}" (${user.role})?`)) {
      onDeleteUser(user.id);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="bg-white p-6 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-2 bg-purple-100 text-purple-800 rounded-xl">
              <Shield className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-bold text-slate-900">Manajemen Pengguna & Hak Akses Menu</h2>
          </div>
          <p className="text-xs text-slate-500">
            Kelola akun operator, tetapkan peran (Super Admin, Admin HO, Manager HO, KBB Purchasing), dan atur hak akses menu operasional.
          </p>
        </div>

        {currentUser.role === 'SUPER_ADMIN' && (
          <button
            onClick={openAddModal}
            id="btn-add-user-top"
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-900/20 transition-all cursor-pointer shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Tambah Pengguna Baru</span>
          </button>
        )}
      </div>

      {/* Role Definitions Guideline Card */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(Object.keys(ROLE_INFO) as UserRole[]).map((roleKey) => {
          const info = ROLE_INFO[roleKey];
          const defaultMenus = ROLE_DEFAULT_MENUS[roleKey];
          const userCount = users.filter(u => u.role === roleKey).length;

          return (
            <div key={roleKey} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${info.badgeColor}`}>
                    {info.label}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400 font-bold">
                    {userCount} User
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3 leading-relaxed">
                  {info.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Menu Default ({defaultMenus.length}):
                </div>
                <div className="flex flex-wrap gap-1">
                  {defaultMenus.map(m => (
                    <span key={m} className="px-1.5 py-0.5 bg-slate-100 text-slate-700 text-[10px] rounded font-medium">
                      {m}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-sm text-slate-900">Daftar Pengguna Sistem ({users.length} Akun)</h3>
          </div>
          <span className="text-xs text-slate-500">
            Hanya <strong>Super Admin</strong> yang dapat menambah & memodifikasi hak akses
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Nama & Profil</th>
                <th className="px-4 py-3.5">Email & Kontak</th>
                <th className="px-4 py-3.5">Departemen</th>
                <th className="px-4 py-3.5">Role Sistem</th>
                <th className="px-6 py-3.5">Hak Akses Menu</th>
                <th className="px-6 py-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => {
                const roleInfo = ROLE_INFO[user.role] || ROLE_INFO.ADMIN_HO;
                const effectiveMenus = getUserEffectiveMenus(user);
                const isCurrent = user.id === currentUser.id;

                return (
                  <tr key={user.id} className={`hover:bg-slate-50/80 transition-colors ${isCurrent ? 'bg-purple-50/30' : ''}`}>
                    
                    {/* Name & Avatar */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-800 font-bold text-sm flex items-center justify-center border border-purple-200 shrink-0 uppercase shadow-xs">
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {isCurrent && (
                              <span className="px-1.5 py-0.5 bg-purple-600 text-white text-[9px] rounded-full font-bold">
                                Anda
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-4 py-4 text-slate-600 font-mono text-[11px]">
                      {user.email}
                    </td>

                    {/* Department */}
                    <td className="px-4 py-4 text-slate-700 font-medium">
                      {user.department}
                    </td>

                    {/* Role */}
                    <td className="px-4 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold border text-xs ${roleInfo.badgeColor}`}>
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{roleInfo.label}</span>
                      </span>
                    </td>

                    {/* Menus */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="flex flex-wrap gap-1">
                        {effectiveMenus.map((menuId) => (
                          <span 
                            key={menuId}
                            className="px-2 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded text-[10px] font-medium"
                          >
                            {menuId}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      {currentUser.role === 'SUPER_ADMIN' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openPasswordModal(user)}
                            className="p-1.5 text-amber-700 hover:bg-amber-50 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors border border-amber-300"
                            title="Atur / Ganti Kata Sandi (Password)"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Sandi</span>
                          </button>

                          <button
                            onClick={() => openEditModal(user)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg font-bold flex items-center gap-1 cursor-pointer transition-colors border border-blue-200"
                            title="Edit User & Hak Akses"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span className="text-[11px]">Kelola Hak</span>
                          </button>

                          <button
                            onClick={() => handleDelete(user)}
                            disabled={isCurrent}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer transition-colors border border-rose-200 disabled:opacity-30 disabled:cursor-not-allowed"
                            title={isCurrent ? "Tidak dapat menghapus diri sendiri" : "Hapus Pengguna"}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Hanya Lihat</span>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit User */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-base">
                  {editingUser ? `Kelola Pengguna: ${editingUser.name}` : 'Tambah Pengguna Baru'}
                </h3>
              </div>
              <button 
                onClick={() => setIsAddModalOpen(false)} 
                className="p-1 text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-bold block mb-1 text-slate-700">Nama Lengkap & Gelar *:</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: Siti Aminah, S.E."
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-lg border border-slate-300 font-semibold"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700">Email Perusahaan (@rajawali.co.id) *:</label>
                  <input
                    type="email"
                    required
                    placeholder="siti.aminah@rajawali.co.id"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700">Role / Peran Pengguna *:</label>
                  <select
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value as UserRole)}
                    className="w-full p-2.5 bg-white rounded-lg border border-slate-300 font-bold text-slate-900"
                  >
                    <option value="SUPER_ADMIN">1. Super Admin (Akses Penuh & Kelola User)</option>
                    <option value="ADMIN_HO">2. Admin HO (MR, DO Status/Cetak, Retur)</option>
                    <option value="MANAGER_HO">3. Manager HO (MR, PO, DO, Retur, Approval)</option>
                    <option value="KBB_PURCHASING">4. KBB Purchasing (Semua menu kecuali Kelola User)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700">Departemen / Divisi:</label>
                  <input
                    type="text"
                    required
                    placeholder="misal: Purchasing & Procurement"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-lg border border-slate-300"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700">Username Login:</label>
                  <input
                    type="text"
                    placeholder="misal: siti.aminah"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-lg border border-slate-300 font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1 text-slate-700">
                    Kata Sandi (Password) Login *:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Set kata sandi pengguna..."
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full p-2.5 bg-white rounded-lg border border-amber-300 bg-amber-50/20 font-mono font-bold text-amber-900"
                  />
                </div>
              </div>

              {/* Menu Permissions Section */}
              <div className="mt-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Hak Akses Menu Operasional</h4>
                    <p className="text-slate-500 text-[11px]">
                      Centang menu yang diizinkan untuk dibuka oleh pengguna ini:
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleApplyRoleDefaults}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-[11px] border border-slate-300 cursor-pointer"
                    >
                      Reset ke Default Role
                    </button>
                    <button
                      type="button"
                      onClick={handleSelectAllMenus}
                      className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-lg font-bold text-[11px] border border-purple-200 cursor-pointer"
                    >
                      Pilih Semua
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {ALL_NAV_MENUS.map((menu) => {
                    const isChecked = formData.allowedMenus.includes(menu.id);
                    return (
                      <label 
                        key={menu.id}
                        className={`flex items-start gap-2.5 p-2 rounded-lg border cursor-pointer transition-all select-none ${
                          isChecked 
                            ? 'bg-purple-50/70 border-purple-300 text-purple-900 shadow-2xs' 
                            : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleMenu(menu.id)}
                          className="mt-0.5 w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-xs">{menu.label}</div>
                          <div className="text-[10px] text-slate-500 leading-tight">{menu.description}</div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold shadow-md shadow-purple-900/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingUser ? 'Simpan Perubahan' : 'Tambah Pengguna'}</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL RESET / ATUR KATA SANDI (PASSWORD) KHUSUS SUPER ADMIN */}
      {isPasswordModalOpen && targetPasswordUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            
            {/* Header */}
            <div className="bg-amber-600 text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5" />
                <h3 className="font-bold text-base">Atur Kata Sandi Pengguna</h3>
              </div>
              <button 
                onClick={() => setIsPasswordModalOpen(false)} 
                className="p-1 text-amber-100 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSavePassword} className="p-6 space-y-4 text-xs">
              
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-800 font-bold text-base flex items-center justify-center border border-purple-200 uppercase shrink-0">
                  {targetPasswordUser.name.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">{targetPasswordUser.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono">{targetPasswordUser.email}</div>
                  <div className="text-[10px] text-slate-400 font-semibold">{targetPasswordUser.role} • {targetPasswordUser.department}</div>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">
                  Kata Sandi Baru (Password) *:
                </label>
                <div className="relative">
                  <input
                    type={showPasswordInModal ? 'text' : 'password'}
                    required
                    placeholder="Masukkan kata sandi baru..."
                    value={newPasswordValue}
                    onChange={(e) => setNewPasswordValue(e.target.value)}
                    className="w-full p-2.5 pr-10 bg-white rounded-lg border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswordInModal(!showPasswordInModal)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 text-xs"
                  >
                    {showPasswordInModal ? 'Sembunyikan' : 'Lihat'}
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1 text-slate-700">
                  Konfirmasi Kata Sandi Baru *:
                </label>
                <input
                  type={showPasswordInModal ? 'text' : 'password'}
                  required
                  placeholder="Ketik ulang kata sandi baru..."
                  value={confirmPasswordValue}
                  onChange={(e) => setConfirmPasswordValue(e.target.value)}
                  className="w-full p-2.5 bg-white rounded-lg border border-slate-300 font-mono text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-800 space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5" />
                  <span>Petunjuk Keamanan Super Admin:</span>
                </div>
                <p className="leading-relaxed text-amber-700">
                  Saat pengguna memilih akunnya di halaman login, sistem akan memvalidasi kata sandi ini.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold shadow-md shadow-amber-900/20 cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Simpan Kata Sandi</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
