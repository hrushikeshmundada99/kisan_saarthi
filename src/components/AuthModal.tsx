import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { useToast } from './Toast';
import { Button } from './Button';
import {
  REGIONAL_TALUKAS,
  LAND_SIZE_OPTIONS,
  getReverseGeocodedLocation
} from '../data/kopargaonLocations';
import {
  User,
  Phone,
  Lock,
  Sprout,
  X,
  LogIn,
  UserPlus,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  MapPin,
  Compass,
  Layers
} from 'lucide-react';

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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);
  const [gpsDetectedText, setGpsDetectedText] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Password visibility toggles
  const [showLoginPassword, setShowLoginPassword] = useState<boolean>(false);
  const [showSignupPassword, setShowSignupPassword] = useState<boolean>(false);

  // Login Form Fields
  const [loginPhone, setLoginPhone] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  // Signup Form Fields
  const [signupName, setSignupName] = useState<string>('');
  const [signupPhone, setSignupPhone] = useState<string>('');
  const [selectedTaluka, setSelectedTaluka] = useState<string>('Kopargaon');
  const [selectedVillage, setSelectedVillage] = useState<string>('कोपरगाव शहर (Kopargaon City)');
  const [customVillage, setCustomVillage] = useState<string>('');
  const [signupLandSize, setSignupLandSize] = useState<string>('५ एकर (5 Acres)');
  const [signupCrop, setSignupCrop] = useState<string>('Onion');
  const [signupPassword, setSignupPassword] = useState<string>('');

  if (!isOpen) return null;

  // Selected taluka object
  const currentTalukaObj = REGIONAL_TALUKAS.find((t) => t.taluka === selectedTaluka) || REGIONAL_TALUKAS[0];

  // GPS Live Location Detection Handler
  const handleDetectLiveLocation = () => {
    if (!navigator.geolocation) {
      showToast('तुमच्या ब्राऊझरमध्ये GPS सुविधा उपलब्ध नाही.', 'error');
      return;
    }

    setIsDetectingGps(true);
    setGpsDetectedText(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const detectedLoc = await getReverseGeocodedLocation(lat, lon);

          setGpsDetectedText(detectedLoc);
          setCustomVillage(detectedLoc);
          setSelectedVillage('इतर गाव / GPS Location');

          // Auto-detect matching taluka if string contains name
          const lower = detectedLoc.toLowerCase();
          const matched = REGIONAL_TALUKAS.find(
            (t) => lower.includes(t.taluka.toLowerCase()) || detectedLoc.includes(t.talukaMr.split(' ')[0])
          );
          if (matched) {
            setSelectedTaluka(matched.taluka);
          }

          showToast('📍 थेट GPS लोकेशन यशस्वीरित्या प्राप्त झाले!', 'success');
        } catch (err) {
          showToast('GPS पत्ता शोधताना त्रुटी आली.', 'error');
        } finally {
          setIsDetectingGps(false);
        }
      },
      (error) => {
        console.warn('Geolocation error:', error);
        setIsDetectingGps(false);
        showToast('GPS लोकेशन परवानगी नाकारली गेली. कृपया मॅन्युअली गाव निवडा.', 'info');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanPhone = loginPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      const err = 'कृपया १० अंकी वैध भारतीय मोबाईल नंबर टाका (Starts with 6,7,8,9)';
      setErrorMessage(err);
      showToast(err, 'error');
      return;
    }

    if (!loginPassword) {
      const err = 'कृपया पासवर्ड प्रविष्ट करा (Please enter password)';
      setErrorMessage(err);
      showToast(err, 'error');
      return;
    }

    setIsSubmitting(true);
    const result = await login(cleanPhone, loginPassword);
    setIsSubmitting(false);

    if (result.success) {
      showToast('लॉगिन यशस्वी झाले! (Login Successful)', 'success');
      onClose();
    } else {
      const err = result.error || 'लॉगिन अयशस्वी झाले. कृपया माहिती तपासा.';
      setErrorMessage(err);
      showToast(err, 'error');
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!signupName.trim()) {
      const err = 'कृपया आपले नाव प्रविष्ट करा (Name is required)';
      setErrorMessage(err);
      showToast(err, 'error');
      return;
    }

    const cleanPhone = signupPhone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length !== 10 || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      const err = 'कृपया १० अंकी वैध मोबाईल नंबर टाका (१० अंक, ६-९ ने सुरू होणारा)';
      setErrorMessage(err);
      showToast(err, 'error');
      return;
    }

    if (!signupPassword || signupPassword.length < 6) {
      const err = 'पासवर्ड किमान ६ अक्षरांचा असावा (Password must be at least 6 characters)';
      setErrorMessage(err);
      showToast(err, 'error');
      return;
    }

    // Determine final location string
    let finalLocation = '';
    if (selectedVillage === 'इतर गाव / GPS Location' || selectedVillage === 'इतर') {
      finalLocation = customVillage.trim()
        ? `${customVillage.trim()}, तालुका: ${currentTalukaObj.talukaMr.split(' ')[0]}`
        : `${currentTalukaObj.talukaMr}`;
    } else {
      finalLocation = `${selectedVillage}, ${currentTalukaObj.talukaMr}`;
    }

    setIsSubmitting(true);
    const result = await signup(
      signupName.trim(),
      cleanPhone,
      finalLocation,
      signupCrop,
      signupPassword,
      signupLandSize
    );
    setIsSubmitting(false);

    if (result.success) {
      showToast('नवीन खाते यशस्वीरित्या तयार झाले! (Account Created)', 'success');
      onClose();
    } else {
      const err = result.error || 'नोंदणी अयशस्वी झाली.';
      setErrorMessage(err);
      showToast(err, 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] border-2 border-[#1B5E20] rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl space-y-3.5 relative max-h-[95vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-[#526058] hover:bg-[#F4F9F4] cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center transition-colors"
          title="बंद करा"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Brand Header */}
        <div className="flex items-center gap-3 border-b border-[#E2ECE2] pb-3 pr-8">
          <div className="w-11 h-11 rounded-2xl bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center font-black shrink-0 shadow-xs border border-[#C8E6C9]">
            <Sprout className="w-6 h-6 text-[#FFB300] stroke-[2.5]" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-black text-[#0F291E] leading-tight">
              {mode === 'login' ? 'किसान लॉगिन (Farmer Login)' : 'नवीन शेतकरी नोंदणी (Sign Up)'}
            </h3>
            <p className="text-[11px] sm:text-xs text-[#526058] font-semibold mt-0.5">
              कोपरगाव व परिसर कृषी बाजार भाव आणि AI विश्लेषणासाठी सुरक्षित खाते
            </p>
          </div>
        </div>

        {/* Error Alert Box */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2 text-xs text-rose-800 font-bold animate-in shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-snug">{errorMessage}</div>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex bg-[#F4F9F4] p-1 rounded-2xl border border-[#D8E6D8] text-xs font-black shadow-xs">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all duration-300 min-h-[38px] flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'login'
                ? 'bg-[#1B5E20] text-[#FFFFFF] shadow-sm'
                : 'text-[#526058] hover:text-[#1B5E20]'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>लॉगिन (Login)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 rounded-xl transition-all duration-300 min-h-[38px] flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'signup'
                ? 'bg-[#1B5E20] text-[#FFFFFF] shadow-sm'
                : 'text-[#526058] hover:text-[#1B5E20]'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>नवीन नोंदणी (Sign Up)</span>
          </button>
        </div>

        {/* Mode 1: LOGIN FORM */}
        {mode === 'login' ? (
          <form onSubmit={handleLoginSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-black text-[#0F291E] uppercase tracking-wider mb-1">
                मोबाईल नंबर (१० अंक):
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3.5 flex items-center gap-1 text-xs font-black text-[#1B5E20]">
                  <Phone className="w-4 h-4 text-[#1B5E20] shrink-0" />
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={loginPhone}
                  onChange={(e) => setLoginPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9822XXXXXX"
                  className="w-full pl-16 pr-4 min-h-[46px] bg-[#F4F9F4] border-2 border-[#D8E6D8] rounded-2xl text-sm font-black text-[#0F291E] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-4 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20] transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#0F291E] uppercase tracking-wider mb-1">
                पासवर्ड (Password):
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-[#FFB300] shrink-0 pointer-events-none" />
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="आपला पासवर्ड टाका"
                  className="w-full pl-10 pr-11 min-h-[46px] bg-[#F4F9F4] border-2 border-[#D8E6D8] rounded-2xl text-sm font-black text-[#0F291E] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-4 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20] transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-3 p-1.5 text-[#526058] hover:text-[#0F291E] cursor-pointer"
                  title={showLoginPassword ? 'पासवर्ड लपवा' : 'पासवर्ड दाखवा'}
                >
                  {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Submit Button */}
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
                  <LogIn className="w-4 h-4 text-[#FFB300]" />
                )}
                <span>{isSubmitting ? 'तपासत आहे...' : 'लॉगिन करा (Log In)'}</span>
              </Button>
            </div>
          </form>
        ) : (
          /* Mode 2: SIGNUP FORM */
          <form onSubmit={handleSignupSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-black text-[#0F291E] uppercase tracking-wider mb-1">
                शेतकरी संपूर्ण नाव (Farmer Name):
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-[#1B5E20] shrink-0 pointer-events-none" />
                <input
                  type="text"
                  value={signupName}
                  onChange={(e) => setSignupName(e.target.value)}
                  placeholder="उदा. ज्ञानेश्वर तांबडे"
                  className="w-full pl-10 pr-4 min-h-[44px] bg-[#F4F9F4] border-2 border-[#D8E6D8] rounded-2xl text-sm font-black text-[#0F291E] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-4 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-[#0F291E] uppercase tracking-wider mb-1">
                मोबाईल नंबर (१० अंक - अचूक नोंदणी):
              </label>
              <div className="relative flex items-center">
                <div className="absolute left-3 flex items-center gap-1 text-xs font-black text-[#1B5E20]">
                  <Phone className="w-4 h-4 text-[#1B5E20]" />
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  maxLength={10}
                  value={signupPhone}
                  onChange={(e) => setSignupPhone(e.target.value.replace(/\D/g, ''))}
                  placeholder="9822XXXXXX"
                  className="w-full pl-15 pr-3 py-2 min-h-[44px] bg-[#F4F9F4] border-2 border-[#D8E6D8] rounded-2xl text-sm font-black text-[#0F291E] focus:outline-none focus:ring-4 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  required
                />
              </div>
            </div>

            {/* LOCATION SELECTOR WITH LIVE GPS BUTTON */}
            <div className="space-y-2 p-3 bg-[#F4F9F4] border border-[#D8E6D8] rounded-2xl">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#0F291E] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1B5E20]" />
                  <span>तालुका व गाव निवडा:</span>
                </label>

                {/* 📍 Live GPS Location Detector Button */}
                <button
                  type="button"
                  onClick={handleDetectLiveLocation}
                  disabled={isDetectingGps}
                  className="px-2.5 py-1 rounded-xl bg-[#FFFFFF] border border-[#1B5E20] text-[#1B5E20] text-[11px] font-black hover:bg-[#E8F5E9] transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                  title="GPS द्वारे आपोआप लोकेशन शोधा"
                >
                  {isDetectingGps ? (
                    <Loader2 className="w-3 h-3 animate-spin text-[#1B5E20]" />
                  ) : (
                    <Compass className="w-3.5 h-3.5 text-[#FFB300]" />
                  )}
                  <span>{isDetectingGps ? 'शोधत आहे...' : '📍 थेट GPS लोकेशन'}</span>
                </button>
              </div>

              {gpsDetectedText && (
                <div className="px-2.5 py-1 bg-emerald-100 border border-emerald-300 rounded-xl text-[11px] font-black text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                  <span className="truncate">GPS पत्ता: {gpsDetectedText}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Taluka Dropdown */}
                <div>
                  <span className="text-[10px] font-black text-[#526058] uppercase block mb-0.5">
                    १. तालुका / जिल्हा:
                  </span>
                  <select
                    value={selectedTaluka}
                    onChange={(e) => {
                      setSelectedTaluka(e.target.value);
                      const tObj = REGIONAL_TALUKAS.find((item) => item.taluka === e.target.value);
                      if (tObj && tObj.villages.length > 0) {
                        setSelectedVillage(tObj.villages[0]);
                      }
                    }}
                    className="w-full px-2.5 py-2 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-xl text-xs font-black text-[#0F291E] focus:outline-none focus:ring-2 focus:ring-[#1B5E20] cursor-pointer"
                  >
                    {REGIONAL_TALUKAS.map((t) => (
                      <option key={t.taluka} value={t.taluka}>
                        {t.talukaMr}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Village Dropdown */}
                <div>
                  <span className="text-[10px] font-black text-[#526058] uppercase block mb-0.5">
                    २. गाव / परिसर:
                  </span>
                  <select
                    value={selectedVillage}
                    onChange={(e) => setSelectedVillage(e.target.value)}
                    className="w-full px-2.5 py-2 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-xl text-xs font-black text-[#0F291E] focus:outline-none focus:ring-2 focus:ring-[#1B5E20] cursor-pointer"
                  >
                    {currentTalukaObj.villages.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                    <option value="इतर गाव / GPS Location">✏️ इतर गाव / GPS पत्ता</option>
                  </select>
                </div>
              </div>

              {/* Custom Village Input if 'Other' selected */}
              {(selectedVillage === 'इतर गाव / GPS Location' || selectedVillage === 'इतर') && (
                <div className="pt-1">
                  <input
                    type="text"
                    value={customVillage}
                    onChange={(e) => setCustomVillage(e.target.value)}
                    placeholder="गावाचे नाव किंवा वाडी/वस्ती टाका"
                    className="w-full px-3 py-1.5 bg-[#FFFFFF] border-2 border-[#FFB300] rounded-xl text-xs font-black text-[#0F291E] focus:outline-none focus:ring-2 focus:ring-[#1B5E20]"
                    required
                  />
                </div>
              )}
            </div>

            {/* Land Size in Acres & Primary Crop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Land Size in Acres */}
              <div>
                <label className="block text-xs font-black text-[#0F291E] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#1B5E20]" />
                  <span>जमीन (एकरामध्ये):</span>
                </label>
                <select
                  value={signupLandSize}
                  onChange={(e) => setSignupLandSize(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F9F4] border-2 border-[#D8E6D8] rounded-2xl text-xs font-black text-[#0F291E] focus:outline-none focus:ring-4 focus:ring-[#1B5E20]/20 cursor-pointer"
                >
                  {LAND_SIZE_OPTIONS.map((acre) => (
                    <option key={acre} value={acre}>
                      {acre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Primary Crop */}
              <div>
                <label className="block text-xs font-black text-[#0F291E] uppercase tracking-wider mb-1 flex items-center gap-1">
                  <Sprout className="w-3.5 h-3.5 text-[#FFB300]" />
                  <span>मुख्य पिक:</span>
                </label>
                <select
                  value={signupCrop}
                  onChange={(e) => setSignupCrop(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F4F9F4] border-2 border-[#D8E6D8] rounded-2xl text-xs font-black text-[#0F291E] focus:outline-none focus:ring-4 focus:ring-[#1B5E20]/20 cursor-pointer"
                >
                  {CROPS_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {t(`crops.${c}`, c)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-black text-[#0F291E] uppercase tracking-wider mb-1">
                पासवर्ड तयार करा (किमान ६ अक्षरे):
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 w-4 h-4 text-[#FFB300] shrink-0 pointer-events-none" />
                <input
                  type={showSignupPassword ? 'text' : 'password'}
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  placeholder="किमान ६ अक्षरांचा पासवर्ड"
                  className="w-full pl-10 pr-11 py-2 bg-[#F4F9F4] border-2 border-[#D8E6D8] rounded-2xl text-sm font-black text-[#0F291E] focus:outline-none focus:ring-4 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowSignupPassword(!showSignupPassword)}
                  className="absolute right-3 p-1 text-[#526058] hover:text-[#0F291E] cursor-pointer"
                  title={showSignupPassword ? 'पासवर्ड लपवा' : 'पासवर्ड दाखवा'}
                >
                  {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
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
                <span>{isSubmitting ? 'नोंदणी करत आहे...' : 'खाते तयार करा (Complete Sign Up)'}</span>
              </Button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
