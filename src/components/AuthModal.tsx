import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { Button } from './Button';
import { User, Phone, Lock, Sprout, X, LogIn, UserPlus, Sparkles, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const CROPS_OPTIONS = ['Onion', 'Soybean', 'Cotton', 'Sugarcane', 'Pomegranate', 'Wheat', 'Tomato'];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login'
}) => {
  const { t } = useTranslation();
  const { login, signup } = useAuth();
  const { showToast } = useToast();

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Login Form Fields
  const [loginPhone, setLoginPhone] = useState<string>('9822154321');
  const [loginPin, setLoginPin] = useState<string>('1234');

  // Signup Form Fields
  const [signupName, setSignupName] = useState<string>('');
  const [signupPhone, setSignupPhone] = useState<string>('');
  const [signupLocation, setSignupLocation] = useState<string>('कोपरगाव (Kopargaon)');
  const [signupCrop, setSignupCrop] = useState<string>('Onion');
  const [signupPin, setSignupPin] = useState<string>('');

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone || loginPhone.length < 10) {
      showToast('कृपया १० अंकी वैध मोबाईल नंबर टाका (Invalid Phone)', 'error');
      return;
    }
    const ok = login(loginPhone, loginPin);
    if (ok) {
      showToast('जी आणा! लॉगिन यशस्वी झाले! (Login Successful)', 'success');
      onClose();
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signupName.trim()) {
      showToast('कृपया आपले नाव टाका (Name Required)', 'error');
      return;
    }
    if (!signupPhone || signupPhone.length < 10) {
      showToast('कृपया १० अंकी मोबाईल नंबर टाका', 'error');
      return;
    }

    const ok = signup(signupName, signupPhone, signupLocation, signupCrop, signupPin);
    if (ok) {
      showToast('नवीन खाते यशस्वीरित्या तयार झाले! (Account Created)', 'success');
      onClose();
    }
  };

  const handleQuickDemoLogin = () => {
    login('9822154321', '1234');
    showToast('डेमो शेतकरी लॉगिन यशस्वी! (Demo Farmer Logged In)', 'success');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] border-2 border-[#2E7D32] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#6B7280] hover:bg-[#F7FBF7] cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Header */}
        <div className="flex items-center gap-3 border-b border-[#E1EBE1] pb-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center font-black shrink-0 shadow-xs">
            <Sprout className="w-6 h-6 text-[#FFC107] stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-xl font-black text-[#1B4332]">
              {mode === 'login' ? 'किसान लॉगिन (Farmer Login)' : 'नवीन शेतकरी नोंदणी (Sign Up)'}
            </h3>
            <p className="text-xs text-[#6B7280] font-medium">
              कोपरगाव कृषी बाजार भाव आणि AI दर अंदाजासाठी लॉग इन करा
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#F7FBF7] p-1.5 rounded-2xl border border-[#E1EBE1] text-xs font-black shadow-xs">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2.5 rounded-xl transition-all duration-300 min-h-[40px] flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login'
                ? 'bg-[#2E7D32] text-[#FFFFFF] shadow-md scale-102'
                : 'text-[#6B7280] hover:text-[#2E7D32]'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>लॉगिन करा (Login)</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('signup')}
            className={`flex-1 py-2.5 rounded-xl transition-all duration-300 min-h-[40px] flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#2E7D32] text-[#FFFFFF] shadow-md scale-102'
                : 'text-[#6B7280] hover:text-[#2E7D32]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>नवीन नोंदणी (Sign Up)</span>
          </button>
        </div>

        {/* Mode 1: LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2">
                मोबाईल नंबर (Mobile Number):
              </label>
              <div className="relative flex items-center">
                <Phone className="absolute left-4 w-5 h-5 text-[#2E7D32] shrink-0 pointer-events-none" />
                <input
                  type="tel"
                  maxLength={10}
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value)}
                  placeholder="9822XXXXXX"
                  className="w-full pl-11 pr-4 min-h-[50px] bg-[#F7FBF7] border-2 border-[#E1EBE1] rounded-2xl text-sm font-extrabold text-[#1B4332] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-4 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2">
                पासवर्ड / पिन (Password / PIN):
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-5 h-5 text-[#FFC107] shrink-0 pointer-events-none" />
                <input
                  type="password"
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  placeholder="••••"
                  className="w-full pl-11 pr-4 min-h-[50px] bg-[#F7FBF7] border-2 border-[#E1EBE1] rounded-2xl text-sm font-extrabold text-[#1B4332] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-4 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32] transition-all"
                  required
                />
              </div>
            </div>

            {/* Login Submit & Demo Login Button */}
            <div className="space-y-2.5 pt-2">
              <Button type="submit" variant="primary" size="md" className="w-full">
                <LogIn className="w-4 h-4 text-[#FFC107]" />
                <span>लॉगिन करा (Submit Login)</span>
              </Button>

              <button
                type="button"
                onClick={handleQuickDemoLogin}
                className="w-full py-2.5 px-4 rounded-2xl bg-amber-50 border-2 border-[#FFC107] text-[#1B4332] text-xs font-black hover:bg-amber-100 transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
              >
                <Sparkles className="w-4 h-4 text-[#FFC107]" />
                <span>१-क्लिक प्रात्यक्षिक लॉगिन (One-Click Demo Login)</span>
              </button>
            </div>
          </form>
        ) : (
          /* Mode 2: SIGNUP FORM */
          <form onSubmit={handleSignupSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-1.5">
                शेतकरी संपूर्ण नाव (Full Name):
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-4 w-5 h-5 text-[#2E7D32] shrink-0 pointer-events-none" />
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="उदा. ज्ञानेश्वर तांबडे"
                  className="w-full pl-11 pr-4 min-h-[48px] bg-[#F7FBF7] border-2 border-[#E1EBE1] rounded-2xl text-sm font-extrabold text-[#1B4332] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-4 focus:ring-[#2E7D32]/20 focus:border-[#2E7D32]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-1.5">
                  मोबाईल नंबर:
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value)}
                  placeholder="9822XXXXXX"
                  className="w-full px-4 py-2.5 bg-[#F7FBF7] border-2 border-[#E1EBE1] rounded-2xl text-sm font-extrabold text-[#1B4332] focus:outline-none focus:ring-4 focus:ring-[#2E7D32]/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-1.5">
                  गाव / तालुका:
                </label>
                <input
                  type="text"
                  value={signupLocation}
                  onChange={(e) => setSignupLocation(e.target.value)}
                  placeholder="कोपरगाव"
                  className="w-full px-4 py-2.5 bg-[#F7FBF7] border-2 border-[#E1EBE1] rounded-2xl text-sm font-extrabold text-[#1B4332] focus:outline-none focus:ring-4 focus:ring-[#2E7D32]/20"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-1.5">
                मुख्य पिक (Primary Crop):
              </label>
              <select
                value={signupCrop}
                onChange={(e) => setSignupCrop(e.target.value)}
                className="w-full px-4 min-h-[48px] bg-[#F7FBF7] border-2 border-[#E1EBE1] rounded-2xl text-sm font-extrabold text-[#1B4332] focus:outline-none focus:ring-4 focus:ring-[#2E7D32]/20 cursor-pointer"
              >
                {CROPS_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {t(`crops.${c}`, c)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-1.5">
                नवीन पासवर्ड / पिन:
              </label>
              <input
                type="password"
                value={signupPin}
                onChange={(e) => setSignupPin(e.target.value)}
                placeholder="••••"
                className="w-full px-4 py-2.5 bg-[#F7FBF7] border-2 border-[#E1EBE1] rounded-2xl text-sm font-extrabold text-[#1B4332] focus:outline-none focus:ring-4 focus:ring-[#2E7D32]/20"
                required
              />
            </div>

            <div className="pt-2">
              <Button type="submit" variant="primary" size="md" className="w-full">
                <CheckCircle2 className="w-4 h-4 text-[#FFC107]" />
                <span>खाते तयार करा (Complete Registration)</span>
              </Button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
