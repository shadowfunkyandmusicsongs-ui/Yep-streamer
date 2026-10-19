import React, { useState } from 'react';
import { ShieldCheck, Lock, X, AlertCircle, KeyRound, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AdminPasscodeModal: React.FC<AdminPasscodeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { verifyAdminPasscode, isLoading } = useAuth();
  const [passcode, setPasscode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!passcode.trim()) {
      setErrorMessage('Please enter an admin security passcode.');
      return;
    }

    const res = await verifyAdminPasscode(passcode.trim());
    if (res.success) {
      setSuccessMessage('Passcode verified! Unlocking administrative workspace...');
      setTimeout(() => {
        setPasscode('');
        setSuccessMessage(null);
        onClose();
        onSuccess();
      }, 700);
    } else {
      setErrorMessage(res.error || 'Incorrect passcode. Access denied.');
    }
  };

  const handleKeypadPress = (val: string) => {
    if (val === 'clear') {
      setPasscode('');
      setErrorMessage(null);
    } else if (val === 'back') {
      setPasscode((prev) => prev.slice(0, -1));
      setErrorMessage(null);
    } else {
      if (passcode.length < 12) {
        setPasscode((prev) => prev + val);
        setErrorMessage(null);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in text-white select-none">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-amber-500 mx-auto flex items-center justify-center mb-3 shadow-lg shadow-rose-950/50">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-lg font-black tracking-tight text-white">
            Admin Security Gate
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enter your authorized administrative passcode to access the management interface
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              inputMode="numeric"
              placeholder="••••••••••"
              value={passcode}
              onChange={(e) => {
                setPasscode(e.target.value);
                setErrorMessage(null);
              }}
              autoFocus
              className="w-full bg-slate-950 border-2 border-slate-700 focus:border-rose-500 rounded-2xl py-3 px-4 text-center font-mono text-xl tracking-widest text-white focus:outline-hidden transition-all shadow-inner"
            />
          </div>

          {/* Feedback messages */}
          {errorMessage && (
            <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Touch-Friendly Numeric Keypad */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((k) => (
              <button
                type="button"
                key={k}
                onClick={() => {
                  if (k === 'C') handleKeypadPress('clear');
                  else if (k === '⌫') handleKeypadPress('back');
                  else handleKeypadPress(k);
                }}
                className={`py-3 rounded-xl font-mono text-base font-bold transition-all active:scale-95 ${
                  k === 'C'
                    ? 'bg-slate-800 text-rose-400 hover:bg-slate-700'
                    : k === '⌫'
                    ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    : 'bg-slate-950 hover:bg-slate-800 text-white border border-slate-800'
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          {/* Unlock Submit Button */}
          <button
            type="submit"
            disabled={!passcode.trim() || isLoading}
            className="w-full py-3 bg-gradient-to-r from-rose-600 to-amber-500 hover:from-rose-500 hover:to-amber-400 disabled:opacity-40 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-rose-950/50 flex items-center justify-center gap-2 cursor-pointer"
          >
            <KeyRound className="w-4 h-4" />
            <span>{isLoading ? 'Verifying...' : 'Unlock Management Workspace'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
