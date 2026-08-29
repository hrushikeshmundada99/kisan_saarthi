import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { AuthModal } from '../components/AuthModal';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { SelfHealingBanner } from '../components/SelfHealingBanner';
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
  Layers,
  Mail
} from 'lucide-react';

const CROP_OPTIONS = [
  'Onion',
  'Soybean',
  'Cotton',
  'Wheat',
  'Sugarcane',
  'Pomegranate',
  'Grapes',
  'Potato',
  'Tomato',
  'Maize'
];

const ALL_MANDIS = [
  'Kopargaon',
  'Rahata',
  'Yeola',
  'Lasalgaon',
  'Nashik',
  'Shrirampur',
  'Sangamner',
  'Ahilyanagar'
];

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

  // Edit fields for ALL profile information
  const [editName, setEditName] = useState<string>('');
  const [editPhone, setEditPhone] = useState<string>('');
  const [editEmail, setEditEmail] = useState<string>('');
  const [editPrimaryCrop, setEditPrimaryCrop] = useState<string>('Onion');
  const [editLandSize, setEditLandSize] = useState<string>('५ एकर (5 Acres)');
  const [editTaluka, setEditTaluka] = useState<string>('Kopargaon');
  const [editVillage, setEditVillage] = useState<string>('कोपरगाव शहर (Kopargaon City)');
  const [customVillage, setCustomVillage] = useState<string>('');
  const [editPreferredMandis, setEditPreferredMandis] = useState<string[]>([
    'Kopargaon',
    'Rahata',
    'Yeola'
  ]);

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || user.mobile || '');
      setEditEmail(user.email || '');
      setEditPrimaryCrop(user.primaryCrop || 'Onion');
      setEditLandSize(user.landSize || '५ एकर (5 Acres)');
      setEditPreferredMandis(
        Array.isArray(user.preferredMandis) && user.preferredMandis.length > 0
          ? user.preferredMandis
          : ['Kopargaon', 'Rahata', 'Yeola']
      );

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

  const handleMandiToggle = (mandiName: string) => {
    if (editPreferredMandis.includes(mandiName)) {
      if (editPreferredMandis.length === 1) {
        showToast('किमान एक बाजार समिती निवडणे आवश्यक आहे.', 'info');
        return;
      }
      setEditPreferredMandis(editPreferredMandis.filter((m) => m !== mandiName));
    } else {
      setEditPreferredMandis([...editPreferredMandis, mandiName]);
    }
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
      mobile: editPhone.replace(/\D/g, ''),
      email: editEmail.trim(),
      primaryCrop: editPrimaryCrop,
      location: finalLoc,
      landSize: editLandSize,
      preferredMandis: editPreferredMandis
    });

    setIsSaving(false);

    if (res.success) {
      setIsEditing(false);
      showToast('प्रोफाईलची संपूर्ण माहिती यशस्वीरित्या सेव्ह झाली! (All Profile Info Updated)', 'success');
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
      
      {/* Self-Healing Architecture Banner */}
      <SelfHealingBanner />

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

        {/* User Info & Stats */}
        <div className="flex-1 space-y-3 text-center sm:text-left w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E2ECE2] pb-3">
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F291E] flex items-center justify-center sm:justify-start gap-2">
                <span>{user?.name || 'बळीराजा शेतकरी'}</span>
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#526058] flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <MapPin className="w-4 h-4 text-[#FFB300] shrink-0" />
                <span>{user?.location || 'कोपरगाव, अहिल्यानगर'}</span>
              </p>
            </div>

            {/* Top Right Action Buttons */}
            {isLoggedIn && (
              <div className="flex items-center justify-center sm:justify-end gap-2 flex-wrap">
                <Button
                  variant={isEditing ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="cursor-pointer font-black"
                >
                  <Edit className="w-4 h-4" />
                  <span>{isEditing ? 'रद्द करा (Cancel)' : 'माहिती संपादीत करा (Edit Profile)'}</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPasswordModalOpen(true)}
                  className="cursor-pointer font-black bg-white"
                >
                  <KeyRound className="w-4 h-4 text-[#1B5E20]" />
                  <span>पासवर्ड बदला (Password)</span>
                </Button>

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleLogout}
                  className="cursor-pointer font-black text-rose-700 hover:bg-rose-50 border-rose-200"
                >
                  <LogOut className="w-4 h-4" />
                  <span>लॉगआउट (Logout)</span>
                </Button>
              </div>
            )}
          </div>

          {/* Quick Details Chips */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
            <span className="px-3 py-1 bg-[#FFFFFF] border border-[#D8E6D8] rounded-xl font-bold text-[#0F291E] flex items-center gap-1.5 shadow-xs">
              <Phone className="w-3.5 h-3.5 text-[#1B5E20]" />
              {user?.phone || user?.mobile || '९८२२१५४३२१'}
            </span>
            {user?.email && (
              <span className="px-3 py-1 bg-[#FFFFFF] border border-[#D8E6D8] rounded-xl font-bold text-[#0F291E] flex items-center gap-1.5 shadow-xs">
                <Mail className="w-3.5 h-3.5 text-[#1B5E20]" />
                {user.email}
              </span>
            )}
            <span className="px-3 py-1 bg-[#FFFFFF] border border-[#D8E6D8] rounded-xl font-bold text-[#0F291E] flex items-center gap-1.5 shadow-xs">
              <Layers className="w-3.5 h-3.5 text-[#1B5E20]" />
              {user?.landSize || '५ एकर'}
            </span>
            <span className="px-3 py-1 bg-[#1B5E20] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-xs">
              <Sprout className="w-3.5 h-3.5 text-[#FFB300]" />
              मुख्य पिक: {user?.primaryCrop || 'Onion'}
            </span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-xl font-black flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#1B5E20]" />
              {isLoggedIn ? 'Supabase डेटाबेस सुरक्षित नोंदणी' : 'लॉगिन आवश्यक'}
            </span>
          </div>
        </div>

      </Card>

      {/* Edit Profile Form Card */}
      {isEditing && isLoggedIn && (
        <Card hoverable={false} className="border-2 border-[#1B5E20] space-y-4 animate-in slide-in-from-top-2 duration-200 p-5 sm:p-6 rounded-3xl bg-[#FFFFFF] shadow-lg">
          <h3 className="text-base sm:text-lg font-black text-[#0F291E] flex items-center gap-2 pb-3 border-b border-[#E2ECE2]">
            <Edit className="w-5 h-5 text-[#FFB300]" />
            <span>संपूर्ण प्रोफाईल माहिती संपादीत करा (Edit All Profile Info)</span>
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              
              {/* 1. Farmer Full Name */}
              <div>
                <label className="block text-xs font-black text-[#0F291E] uppercase tracking-wider mb-1.5">
                  १. शेतकरी संपूर्ण नाव (Full Name):
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F9F4] border-2 border-[#D8E6D8] rounded-2xl text-xs sm:text-sm font-black text-[#0F291E] focus:ring-4 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  required
                />
              </div>

              {/* 2. Mobile Number */}
              <div>
                <label className="block text-xs font-black text-[#0F291E] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#1B5E20]" />
                  <span>२. मोबाईल नंबर (Mobile Number):</span>
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F9F4] border-2 border-[#D8E6D8] rounded-2xl text-xs sm:text-sm font-black text-[#0F291E] focus:ring-4 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                  required
                />
              </div>

              {/* 3. Email Address */}
              <div>
                <label className="block text-xs font-black text-[#0F291E] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#1B5E20]" />
                  <span>३. ई-मेल पत्ता (Email for Price Alerts):</span>
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  placeholder="farmer@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-[#F4F9F4] border-2 border-[#D8E6D8] rounded-2xl text-xs sm:text-sm font-black text-[#0F291E] focus:ring-4 focus:ring-[#1B5E20]/20 focus:border-[#1B5E20]"
                />
              </div>

              {/* 4. Primary Crop */}
              <div>
                <label className="block text-xs font-black text-[#0F291E] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Sprout className="w-3.5 h-3.5 text-[#1B5E20]" />
                  <span>४. मुख्य पीक (Primary Crop):</span>
                </label>
                <select
                  value={editPrimaryCrop}
                  onChange={(e) => setEditPrimaryCrop(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F9F4] border-2 border-[#D8E6D8] rounded-2xl text-xs sm:text-sm font-black text-[#0F291E] focus:ring-4 focus:ring-[#1B5E20]/20 cursor-pointer min-h-[46px]"
                >
                  {CROP_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      🌱 {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* 5. Land in Acres */}
              <div>
                <label className="block text-xs font-black text-[#0F291E] uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-[#1B5E20]" />
                  <span>५. जमीन क्षेत्र (एकरामध्ये):</span>
                </label>
                <select
                  value={editLandSize}
                  onChange={(e) => setEditLandSize(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#F4F9F4] border-2 border-[#D8E6D8] rounded-2xl text-xs sm:text-sm font-black text-[#0F291E] focus:ring-4 focus:ring-[#1B5E20]/20 cursor-pointer min-h-[46px]"
                >
                  {LAND_SIZE_OPTIONS.map((acre) => (
                    <option key={acre} value={acre}>
                      {acre}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* 6. Location Selector in Profile Edit */}
            <div className="p-3.5 bg-[#F4F9F4] border border-[#D8E6D8] rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-black text-[#0F291E] flex items-center gap-1.5 uppercase tracking-wider">
                  <MapPin className="w-3.5 h-3.5 text-[#1B5E20]" />
                  <span>६. तालुका व गाव (Location):</span>
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

            {/* 7. Preferred Mandis Checklist */}
            <div className="p-3.5 bg-[#F4F9F4] border border-[#D8E6D8] rounded-2xl space-y-2">
              <label className="block text-xs font-black text-[#0F291E] uppercase tracking-wider flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-[#1B5E20]" />
                <span>७. पसंतीच्या बाजार समित्या (Preferred Mandis):</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                {ALL_MANDIS.map((mandi) => {
                  const isChecked = editPreferredMandis.includes(mandi);
                  return (
                    <button
                      key={mandi}
                      type="button"
                      onClick={() => handleMandiToggle(mandi)}
                      className={`px-3 py-2 rounded-xl text-xs font-black border transition-all text-left flex items-center justify-between cursor-pointer ${
                        isChecked
                          ? 'bg-[#1B5E20] text-white border-[#1B5E20] shadow-xs'
                          : 'bg-white text-[#0F291E] border-[#D8E6D8] hover:bg-[#E8F5E9]'
                      }`}
                    >
                      <span>📍 {mandi}</span>
                      {isChecked && <span>✓</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setIsEditing(false)}
                className="cursor-pointer font-black"
              >
                <span>रद्द करा (Cancel)</span>
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={isSaving}
                className="cursor-pointer font-black shadow-md"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin text-[#FFFFFF]" />
                ) : (
                  <Save className="w-4 h-4 text-[#FFB300]" />
                )}
                <span>{isSaving ? 'सेव्ह करत आहे...' : 'माहिती सेव्ह करा (Save All Info)'}</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Overview Cards Grid */}
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
                मुख्य पिक:
              </span>
              <div className="flex flex-wrap gap-2">
                <span className="px-3.5 py-1.5 bg-[#1B5E20] text-[#FFFFFF] text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 min-h-[36px]">
                  <Sprout className="w-4 h-4 text-[#FFB300]" />
                  {user?.primaryCrop || 'Onion'}
                </span>
              </div>
            </div>

            <div>
              <span className="text-xs font-black text-[#526058] uppercase tracking-wider block mb-2">
                पसंतीच्या बाजार समित्या:
              </span>
              <div className="flex flex-wrap gap-2">
                {(user?.preferredMandis || ['Kopargaon', 'Rahata', 'Yeola']).map((mandi) => (
                  <span
                    key={mandi}
                    className="px-3.5 py-1.5 bg-[#F4F9F4] text-[#0F291E] border border-[#D8E6D8] text-xs font-black rounded-xl flex items-center gap-1.5 min-h-[36px]"
                  >
                    <Store className="w-4 h-4 text-[#1B5E20]" />
                    {mandi} APMC
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Security & Verification Card */}
        <Card hoverable={false} className="space-y-4 border border-[#D8E6D8] rounded-3xl shadow-xs bg-[#FFFFFF] p-5">
          <h3 className="text-base sm:text-lg font-black text-[#0F291E] flex items-center gap-2 pb-3 border-b border-[#E2ECE2]">
            <ShieldCheck className="w-5 h-5 text-[#1B5E20]" />
            <span>सुरक्षा व सर्व्हर डेटाबेस नोंदणी</span>
          </h3>

          <div className="space-y-3 text-xs font-semibold text-[#526058]">
            <div className="p-3.5 rounded-2xl bg-[#F4F9F4] border border-[#D8E6D8] flex items-center justify-between">
              <span className="font-bold text-[#0F291E]">खाते प्रकार (Account Status):</span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-950 font-black rounded-xl text-xs">
                ✓ Supabase सत्यापित
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-[#F4F9F4] border border-[#D8E6D8] flex items-center justify-between">
              <span className="font-bold text-[#0F291E]">ई-मेल अलर्ट स्टेट्युस:</span>
              <span className="px-3 py-1 bg-amber-100 text-amber-900 font-black rounded-xl text-xs">
                🔔 {user?.email ? 'सक्रिय (Active)' : 'ई-मेल जोडा'}
              </span>
            </div>

            {isLoggedIn && (
              <div className="pt-2 flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPasswordModalOpen(true)}
                  className="w-full cursor-pointer font-black"
                >
                  <KeyRound className="w-4 h-4 text-[#1B5E20]" />
                  <span>पासवर्ड बदला</span>
                </Button>
              </div>
            )}
          </div>
        </Card>

      </div>

      {/* Auth Modal */}
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
