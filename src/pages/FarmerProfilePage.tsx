import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { AuthModal } from '../components/AuthModal';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import {
  REGIONAL_TALUKAS,
  LAND_SIZE_OPTIONS,
  getReverseGeocodedLocation
} from '../data/kopargaonLocations';
import {
  User,
  MapPin,
  Sprout,
  Store,
  ShieldCheck,
  Phone,
  Edit,
  LogOut,
  Save,
  LogIn,
  UserPlus,
  Loader2,
  KeyRound,
  Compass,
  Layers
} from 'lucide-react';

export const FarmerProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isLoggedIn, isLoading, logout, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [passwordModalOpen, setPasswordModalOpen] = useState<boolean>(false);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDetectingGps, setIsDetectingGps] = useState<boolean>(false);

  // Edit fields
  const [editName, setEditName] = useState<string>('');
  const [editTaluka, setEditTaluka] = useState<string>('Kopargaon');
  const [editVillage, setEditVillage] = useState<string>('कोपरगाव शहर (Kopargaon City)');
  const [customVillage, setCustomVillage] = useState<string>('');
  const [editLandSize, setEditLandSize] = useState<string>('५ एकर (5 Acres)');

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditLandSize(user.landSize || '५ एकर (5 Acres)');

      // Attempt to parse location into village & taluka
      if (user.location) {
        const foundTaluka = REGIONAL_TALUKAS.find((item) =>
          user.location.toLowerCase().includes(item.taluka.toLowerCase()) ||
          user.location.includes(item.talukaMr.split(' ')[0])
        );
        if (foundTaluka) {
          setEditTaluka(foundTaluka.taluka);
          const foundVillage = foundTaluka.villages.find((v) => user.location.includes(v.split(' ')[0]));
          if (foundVillage) {
            setEditVillage(foundVillage);
          } else {
            setEditVillage('इतर गाव / GPS पत्ता');
            setCustomVillage(user.location);
          }
        } else {
          setEditVillage('इतर गाव / GPS पत्ता');
          setCustomVillage(user.location);
        }
      }
    }
  }, [user]);

  const currentTalukaObj = REGIONAL_TALUKAS.find((t) => t.taluka === editTaluka) || REGIONAL_TALUKAS[0];

  const handleDetectLiveGps = () => {
    if (!navigator.geolocation) {
      showToast('GPS सुविधा उपलब्ध नाही.', 'error');
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await getReverseGeocodedLocation(pos.coords.latitude, pos.coords.longitude);
          setCustomVillage(loc);
          setEditVillage('इतर गाव / GPS पत्ता');
          showToast('📍 GPS लोकेशन यशस्वीरित्या प्राप्त झाले!', 'success');
        } catch {
          showToast('GPS लोकेशन मिळवताना त्रुटी आली.', 'error');
        } finally {
          setIsDetectingGps(false);
        }
      },
      () => {
        setIsDetectingGps(false);
        showToast('GPS परवानगी नाकारली गेली.', 'info');
      }
    );
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    let finalLoc = '';
    if (editVillage === 'इतर गाव / GPS पत्ता' || editVillage === 'इतर') {
      finalLoc = customVillage.trim()
        ? `${customVillage.trim()}, ${currentTalukaObj.talukaMr}`
        : currentTalukaObj.talukaMr;
    } else {
      finalLoc = `${editVillage}, ${currentTalukaObj.talukaMr}`;
    }

    const res = await updateProfile({
      name: editName.trim(),
      location: finalLoc,
      landSize: editLandSize
    });

    setIsSaving(false);

    if (res.success) {
      setIsEditing(false);
      showToast('प्रोफाईल माहिती यशस्वीरित्या अपडेट केली! (Profile Updated)', 'success');
    } else {
      showToast(res.error || 'प्रोफाईल सेव्ह करताना त्रुटी आली.', 'error');
    }
  };

  const handleLogout = async () => {
    await logout();
    showToast('लॉगआउट यशस्वी झाले (Logged Out)', 'info');
  };

  const openAuth = (mode: 'login' | 'signup') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-6 max-w-7xl mx-auto animate-in fade-in duration-200 px-1 sm:px-2">
      
      {/* If Not Logged In: Show Banner to Sign In */}
      {!isLoggedIn && !isLoading && (
        <Card hoverable={false} className="border-2 border-[#FFB300] bg-gradient-to-r from-amber-50 via-white to-emerald-50 p-5 sm:p-6 rounded-3xl shadow-md">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F5E9] text-[#1B5E20] flex items-center justify-center font-black shrink-0 border border-[#C8E6C9]">
                <Sprout className="w-6 h-6 text-[#FFB300]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#0F291E]">
                  आपले शेतकरी खाते लॉगिन करा (Login to Farmer Profile)
                </h2>
                <p className="text-xs text-[#526058] font-semibold mt-0.5">
                  आपल्या पिकांची जतन केलेली माहिती, बाजार अलर्ट्स आणि AI दर अंदाज सेव्ह करण्यासाठी लॉगिन करा
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openAuth('login')}
                className="cursor-pointer font-black"
              >
                <LogIn className="w-4 h-4 text-[#1B5E20]" />
                <span>लॉगिन (Login)</span>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => openAuth('signup')}
                className="cursor-pointer font-black shadow-md"
              >
                <UserPlus className="w-4 h-4 text-[#FFB300]" />
                <span>नवीन नोंदणी (Sign Up)</span>
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Profile Header Card */}
      <Card hoverable={false} className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative overflow-hidden border-2 border-[#D8E6D8] bg-gradient-to-br from-[#FFFFFF] via-[#F4F9F4] to-[#E8F5E9] p-5 sm:p-7 rounded-3xl shadow-md">
        
        {/* Profile Avatar */}
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#1B5E20] text-[#FFB300] flex items-center justify-center font-bold shadow-md shrink-0 ring-4 ring-[#FFFFFF]">
          <User className="w-12 h-12 stroke-[2.5]" />
        </div>

        {/* Profile Details */}
        <div className="text-center sm:text-left space-y-2 flex-1 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-[#0F291E]">
                {user ? user.name : (isLoggedIn ? 'शेतकरी मित्र' : 'अतिथी शेतकरी (Guest Farmer)')}
              </h1>
              <p className="text-xs sm:text-sm font-black text-[#526058] flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <MapPin className="w-4 h-4 text-[#FFB300]" />
                {user ? user.location : 'कोपरगाव, अहिल्यानगर'}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center sm:justify-end gap-2 self-center sm:self-auto">
              {isLoggedIn ? (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsEditing(!isEditing)}
                    className="cursor-pointer font-bold"
                  >
                    <Edit className="w-4 h-4 text-[#1B5E20]" />
                    <span>{isEditing ? 'रद्द करा' : 'प्रोफाईल संपादीत करा'}</span>
                  </Button>

                  {/* 🔒 Change Password Button */}
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPasswordModalOpen(true)}
                    className="cursor-pointer font-bold border-amber-300 text-amber-900 bg-amber-50 hover:bg-amber-100"
                    title="पासवर्ड बदला"
                  >
                    <KeyRound className="w-4 h-4 text-[#FFB300]" />
                    <span>पासवर्ड बदला</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLogout}
                    className="border-2 border-rose-500 text-rose-600 hover:bg-rose-50 font-black cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>लॉगआउट</span>
                  </Button>
                </>
              ) : (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openAuth('login')}
                  className="cursor-pointer font-black"
                >
                  <LogIn className="w-4 h-4 text-[#FFB300]" />
                  <span>लॉगिन करा</span>
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-2 text-xs">
            <span className="px-3 py-1 bg-[#FFFFFF] border border-[#D8E6D8] rounded-xl font-black text-[#1B5E20] shadow-xs">
              🌱 {user ? user.landSize : '५ एकर जमीन'}
            </span>
            <span className="px-3 py-1 bg-[#FFFFFF] border border-[#D8E6D8] rounded-xl font-black text-[#0F291E] flex items-center gap-1.5 shadow-xs">
              <Phone className="w-3.5 h-3.5 text-[#1B5E20]" />
              +91 {user ? (user.phone || user.mobile) : '98XXXXXXXX'}
            </span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-xl font-black flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#1B5E20]" />
              {isLoggedIn ? 'डेटाबेस सुरक्षित नोंदणी' : 'लॉगिन आवश्यक'}
            </span>
          </div>
        </div>

      </Card>

      {/* Edit Profile Form Drawer/Card */}
      {isEditing && isLoggedIn && (
        <Card hoverable={false} className="border-2 border-[#1B5E20] space-y-4 animate-in slide-in-from-top-2 duration-200 p-5 rounded-3xl bg-[#FFFFFF] shadow-lg">
          <h3 className="text-base sm:text-lg font-black text-[#0F291E] flex items-center gap-2 pb-3 border-b border-[#E2ECE2]">
            <Edit className="w-5 h-5 text-[#FFB300]" />
            <span>प्रोफाईल माहिती संपादीत करा (Edit Profile Info)</span>
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Farmer Name */}
              <div>
                <label className="block text-xs font-black text-[#0F291E] uppercase tracking-wider mb-1.5">
                  शेतकरी नाव (Full Name):
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F9F4] border-2 border-[#D8E6D8] rounded-2xl text-sm font-black text-[#0F291E] focus:ring-4 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  required
                />
              </div>

              {/* Land in Acres */}
              <div>
                <label className="block text-xs font-black text-[#0F291E] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#1B5E20]" />
                  <span>जमीन क्षेत्र (एकरामध्ये):</span>
                </label>
                <select
                  value={editLandSize}
                  onChange={(e) => setEditLandSize(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F9F4] border-2 border-[#D8E6D8] rounded-2xl text-sm font-black text-[#0F291E] focus:ring-4 focus:ring-[#1B5E20]/20 cursor-pointer"
                >
                  {LAND_SIZE_OPTIONS.map((acre) => (
                    <option key={acre} value={acre}>
                      {acre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location Selector in Profile Edit */}
            <div className="p-3.5 bg-[#F4F9F4] border border-[#D8E6D8] rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#0F291E] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#1B5E20]" />
                  <span>तालुका व गाव निवडा:</span>
                </label>

                <button
                  type="button"
                  onClick={handleDetectLiveGps}
                  disabled={isDetectingGps}
                  className="px-2.5 py-1 rounded-xl bg-[#FFFFFF] border border-[#1B5E20] text-[#1B5E20] text-xs font-black hover:bg-[#E8F5E9] transition-all flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  {isDetectingGps ? (
                    <Loader2 className="w-3 h-3 animate-spin text-[#1B5E20]" />
                  ) : (
                    <Compass className="w-3.5 h-3.5 text-[#FFB300]" />
                  )}
                  <span>{isDetectingGps ? 'शोधत आहे...' : '📍 थेट GPS लोकेशन'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="text-[10px] font-black text-[#526058] uppercase block mb-0.5">
                    तालुका:
                  </span>
                  <select
                    value={editTaluka}
                    onChange={(e) => {
                      setEditTaluka(e.target.value);
                      const tObj = REGIONAL_TALUKAS.find((item) => item.taluka === e.target.value);
                      if (tObj && tObj.villages.length > 0) {
                        setEditVillage(tObj.villages[0]);
                      }
                    }}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-xl text-xs font-black text-[#0F291E] focus:ring-2 focus:ring-[#1B5E20] cursor-pointer"
                  >
                    {REGIONAL_TALUKAS.map((t) => (
                      <option key={t.taluka} value={t.taluka}>
                        {t.talukaMr}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <span className="text-[10px] font-black text-[#526058] uppercase block mb-0.5">
                    गाव:
                  </span>
                  <select
                    value={editVillage}
                    onChange={(e) => setEditVillage(e.target.value)}
                    className="w-full px-3 py-2 bg-[#FFFFFF] border-2 border-[#D8E6D8] rounded-xl text-xs font-black text-[#0F291E] focus:ring-2 focus:ring-[#1B5E20] cursor-pointer"
                  >
                    {currentTalukaObj.villages.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                    <option value="इतर गाव / GPS पत्ता">✏️ इतर गाव / GPS पत्ता</option>
                  </select>
                </div>
              </div>

              {(editVillage === 'इतर गाव / GPS पत्ता' || editVillage === 'इतर') && (
                <div>
                  <input
                    type="text"
                    value={customVillage}
                    onChange={(e) => setCustomVillage(e.target.value)}
                    placeholder="गावाचे नाव किंवा पत्ता टाका"
                    className="w-full px-3 py-2 bg-[#FFFFFF] border-2 border-[#FFB300] rounded-xl text-xs font-black text-[#0F291E]"
                    required
                  />
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSaving}
                className="cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#FFFFFF]" />
                ) : (
                  <Save className="w-4 h-4 text-[#FFB300]" />
                )}
                <span>{isSaving ? 'सेव्ह करत आहे...' : 'माहिती सेव्ह करा (Save Profile)'}</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        
        {/* Saved Preferences Card */}
        <Card hoverable={false} className="space-y-4 border border-[#D8E6D8] rounded-3xl shadow-xs bg-[#FFFFFF] p-5">
          <h3 className="text-base sm:text-lg font-black text-[#0F291E] flex items-center gap-2 pb-3 border-b border-[#E2ECE2]">
            <Sprout className="w-5 h-5 text-[#1B5E20]" />
            <span>{t('profile.savedCrops')} व {t('profile.preferredMandis')}</span>
          </h3>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-black text-[#526058] uppercase tracking-wider block mb-2">
                जतन केलेली पिके:
              </span>
              <div className="flex flex-wrap gap-2">
                {['Onion', 'Soybean', 'Cotton', 'Sugarcane'].map((crop) => (
                  <span
                    key={crop}
                    className="px-3.5 py-1.5 bg-[#1B5E20] text-[#FFFFFF] text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 min-h-[36px]"
                  >
                    <Sprout className="w-4 h-4 text-[#FFB300]" />
                    {t(`crops.${crop}`, crop)}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2ECE2]">
              <span className="text-xs font-black text-[#526058] uppercase tracking-wider block mb-2">
                पसंतीच्या मंडी समित्या:
              </span>
              <div className="flex flex-wrap gap-2">
                {['Kopargaon', 'Rahata', 'Yeola', 'Sangamner'].map((mandi) => (
                  <span
                    key={mandi}
                    className="px-3.5 py-1.5 bg-[#F4F9F4] border border-[#D8E6D8] text-[#1B5E20] text-xs font-black rounded-xl flex items-center gap-1.5 min-h-[36px]"
                  >
                    <Store className="w-4 h-4 text-[#FFB300]" />
                    {t(`mandis.${mandi}`, mandi)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Security & Password Card */}
        <Card hoverable={false} className="space-y-4 border border-[#D8E6D8] rounded-3xl shadow-xs bg-[#FFFFFF] p-5">
          <h3 className="text-base sm:text-lg font-black text-[#0F291E] flex items-center gap-2 pb-3 border-b border-[#E2ECE2]">
            <KeyRound className="w-5 h-5 text-[#FFB300]" />
            <span>सुरक्षा व पासवर्ड (Security & Password)</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-[#F4F9F4] rounded-2xl border border-[#D8E6D8] flex items-center justify-between">
              <div>
                <span className="font-black text-[#0F291E] block">खाते पासवर्ड:</span>
                <span className="text-[#526058] font-bold">•••••••••• (सुरक्षित पासवर्ड)</span>
              </div>
              {isLoggedIn && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPasswordModalOpen(true)}
                  className="cursor-pointer font-black text-xs"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#FFB300]" />
                  <span>पासवर्ड बदला</span>
                </Button>
              )}
            </div>

            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1B5E20] shrink-0" />
              <span>तुमचा पासवर्ड Bcrypt एनक्रिप्शनने सुरक्षित साठवला जातो.</span>
            </div>
          </div>
        </Card>

      </div>

      {/* Auth Modal for Login / Signup */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalMode}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={passwordModalOpen}
        onClose={() => setPasswordModalOpen(false)}
      />

    </div>
  );
};
