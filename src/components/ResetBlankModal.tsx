import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  ShieldAlert, 
  X, 
  Lock
} from 'lucide-react';
import { User } from '../types';

interface ResetBlankModalProps {
  isOpen: boolean;
  currentUser: User;
  onClose: () => void;
  onConfirmResetBlank: () => void;
}

export const ResetBlankModal: React.FC<ResetBlankModalProps> = ({
  isOpen,
  currentUser,
  onClose,
  onConfirmResetBlank
}) => {
  const [confirmationInput, setConfirmationInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const isSuperAdmin = currentUser.role === 'SUPER_ADMIN';
  const isInputValid = confirmationInput.trim().toUpperCase() === 'RESET KOSONG';

  const handleExecuteBlankReset = () => {
    if (!isSuperAdmin || !isInputValid) return;
    setIsProcessing(true);
    setTimeout(() => {
      onConfirmResetBlank();
      setIsProcessing(false);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden text-left">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <span>Zona Kontrol Sistem & Database</span>
              </div>
              <h3 className="text-lg font-black text-white mt-0.5 font-serif">
                Reset / Pengosongan Database
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {!isSuperAdmin ? (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-start gap-3">
              <Lock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold">Akses Dibatasi Khusus Super Admin</div>
                <div className="text-slate-600 mt-1">
                  Anda saat ini login sebagai <strong>{currentUser.name} ({currentUser.role})</strong>. Fitur pengosongan total database hanya dapat dieksekusi oleh <strong>Super Admin</strong>.
                </div>
              </div>
            </div>
          ) : (
            <>
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-2">
                <div className="font-bold flex items-center gap-2 text-rose-800 text-xs">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>PERINGATAN: PENGOSONGAN DATABASE</span>
                </div>
                <p className="text-xs text-rose-700 leading-relaxed">
                  Tindakan ini akan <strong>MENGHAPUS SELURUH DATA TRANSAKSI</strong> (Material Request, Purchase Order, Surat Jalan DO, Tagihan/Invoice, Retur), <strong>STOK GUDANG</strong>, serta <strong>DATA VENDOR & KLIEN</strong> menjadi kosong total (Zero Data).
                </p>
                <p className="text-[11px] text-rose-600 font-medium">
                  * Seluruh akun role pengguna tetap dipertahankan agar sistem dapat langsung digunakan.
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-800">
                  Ketik <code className="bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-mono text-xs font-extrabold select-all">RESET KOSONG</code> untuk konfirmasi:
                </label>
                <input
                  type="text"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  placeholder="Ketik RESET KOSONG"
                  className="w-full text-xs font-mono uppercase tracking-wider px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 bg-slate-50 focus:bg-white"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-100 p-4 px-6 flex items-center justify-end gap-3 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-all cursor-pointer"
          >
            Batal
          </button>

          <button
            type="button"
            disabled={!isSuperAdmin || !isInputValid || isProcessing}
            onClick={handleExecuteBlankReset}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isSuperAdmin && isInputValid
                ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30'
                : 'bg-slate-300 text-slate-500 cursor-not-allowed'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>{isProcessing ? 'Mengosongkan Database...' : 'Kosongkan Seluruh Data Transaksi'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

