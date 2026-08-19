import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { Button } from './Button';
import {
  KeyRound,
  Lock,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck
} from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose
}) => {
  const { changePassword } = useAuth();
  const { showToast } = useToast();

  const [currentPassword, setCurrentPassword] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');

  const [showCurrent, setShowCurrent] = useState<boolean>(false);
  const [showNew, setShowNew] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!currentPassword) {
      const err = 'कृपया सध्याचा चालू पासवर्ड टाका';
      setErrorMessage(err);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      const err = 'नवीन पासवर्ड किमान ६ अक्षरांचा असावा (New password must be at least 6 characters)';
      setErrorMessage(err);
      return;
    }

    if (newPassword !== confirmPassword) {
      const err = 'नवीन पासवर्ड आणि खात्री केलेला पासवर्ड जुळत नाहीत (Passwords do not match)';
      setErrorMessage(err);
      return;
    }

    if (currentPassword === newPassword) {
      const err = 'नवीन पासवर्ड जुन्या पासवर्डपेक्षा वेगळा असावा (New password must be different from current password)';
      setErrorMessage(err);
      return;
    }

    setIsSubmitting(true);
    const result = await changePassword(currentPassword, newPassword);
    setIsSubmitting(false);

    if (result.success) {
      showToast(result.message || 'पासवर्ड यशस्वीरित्या बदलला आहे! (Password Changed)', 'success');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      onClose();
    } else {
      const err = result.error || 'पासवर्ड बदलताना त्रुटी आली.';
      setErrorMessage(err);
      showToast(err, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] border-2 border-[#1B5E20] rounded-3xl p-5 sm:p-7 max-w-md w-full shadow-2xl space-y-4 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#526058] hover:bg-[#F4F9F4] cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center transition-colors"
          title="बंद करा"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-[#E2ECE2] pb-3 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center font-black shrink-0 shadow-xs border border-[#C8E6C9]">
            <KeyRound className="w-6 h-6 text-[#FFB300] stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-[#0F291E] leading-tight">
              पासवर्ड बदला (Change Password)
            </h3>
            <p className="text-[11px] sm:text-xs text-[#526058] font-semibold mt-0.5">
              आपल्या खात्याच्या सुरक्षेसाठी नवीन पासवर्ड सेट करा
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 font-bold animate-in shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-snug">{errorMessage}</div>
          </div>
        )}

        {/* Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Current Password */}
          <div>
            <label className="block text-xs font-black text-[#0F291E] uppercase tracking-wider mb-1">
              सध्याचा जुना पासवर्ड (Current Password):
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-[#526058] shrink-0 pointer-events-none" />
              <input
                type={showCurrent ? 'text' : 'password'}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="चालू पासवर्ड टाका"
                className="w-full pl-10 pr-11 min-h-[44px] bg-[#F4F9F4] border-2 border-[#D8E6D8] rounded-2xl text-sm font-black text-[#0F291E] focus:outline-none focus:ring-4 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 p-1.5 text-[#526058] hover:text-[#0F291E] cursor-pointer"
                title={showCurrent ? 'लपवा' : 'दाखवा'}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs font-black text-[#0F291E] uppercase tracking-wider mb-1">
              नवीन पासवर्ड (New Password - किमान ६ अक्षरे):
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3.5 w-4 h-4 text-[#FFB300] shrink-0 pointer-events-none" />
              <input
                type={showNew ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="नवीन सुरक्षित पासवर्ड"
                minLength={6}
                className="w-full pl-10 pr-11 min-h-[44px] bg-[#F4F9F4] border-2 border-[#D8E6D8] rounded-2xl text-sm font-black text-[#0F291E] focus:outline-none focus:ring-4 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 p-1.5 text-[#526058] hover:text-[#0F291E] cursor-pointer"
                title={showNew ? 'लपवा' : 'दाखवा'}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs font-black text-[#0F291E] uppercase tracking-wider mb-1">
              नवीन पासवर्डची खात्री करा (Confirm Password):
            </label>
            <div className="relative flex items-center">
              <ShieldCheck className="absolute left-3.5 w-4 h-4 text-[#1B5E20] shrink-0 pointer-events-none" />
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="नवीन पासवर्ड पुन्हा टाका"
                minLength={6}
                className="w-full pl-10 pr-11 min-h-[44px] bg-[#F4F9F4] border-2 border-[#D8E6D8] rounded-2xl text-sm font-black text-[#0F291E] focus:outline-none focus:ring-4 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 p-1.5 text-[#526058] hover:text-[#0F291E] cursor-pointer"
                title={showConfirm ? 'लपवा' : 'दाखवा'}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center shadow-md shadow-emerald-950/20 min-h-[46px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin text-[#FFFFFF]" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-[#FFB300]" />
              )}
              <span>{isSubmitting ? 'बदलत आहे...' : 'पासवर्ड अपडेट करा (Save Password)'}</span>
            </Button>
          </div>
        </form>

      </div>
    </div>
  );
};
