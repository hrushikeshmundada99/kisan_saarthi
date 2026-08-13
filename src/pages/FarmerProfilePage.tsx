import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/Toast';
import { User, MapPin, Sprout, Store, Bell, ShieldCheck, Phone, Edit, Calendar, LogOut, Save, CheckCircle2 } from 'lucide-react';

export const FarmerProfilePage: React.FC = () => {
  const { t } = useTranslation();
  const { user, isLoggedIn, logout, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editName, setEditName] = useState<string>(user?.name || '');
  const [editLocation, setEditLocation] = useState<string>(user?.location || '');
  const [editPhone, setEditPhone] = useState<string>(user?.phone || '');
  const [editLandSize, setEditLandSize] = useState<string>(user?.landSize || '5 एकर');

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name: editName,
      location: editLocation,
      phone: editPhone,
      landSize: editLandSize
    });
    setIsEditing(false);
    showToast('प्रोफाईल माहिती यशस्वीरित्या अपडेट केली! (Profile Updated)', 'success');
  };

  const handleLogout = () => {
    logout();
    showToast('लॉगआउट यशस्वी झाले (Logged Out)', 'info');
  };

  return (
    <div className="space-y-4 sm:space-y-5 pb-6 max-w-7xl mx-auto animate-in fade-in duration-200 px-1 sm:px-2">
      
      {/* Profile Header Card */}
      <Card hoverable={false} className="flex flex-col sm:flex-row items-center sm:items-start gap-6 relative overflow-hidden border-2 border-[#81C784]/60 bg-gradient-to-br from-[#FFFFFF] via-[#F7FBF7] to-[#E8F5E9]">
        
        {/* Profile Avatar */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#2E7D32] text-[#FFC107] flex items-center justify-center font-bold shadow-md shrink-0 ring-4 ring-[#FFFFFF]">
          <User className="w-14 h-14 stroke-[2.5]" />
        </div>

        {/* Profile Details */}
        <div className="text-center sm:text-left space-y-2 flex-1 w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#1B4332]">
                {user ? user.name : t('profile.name')}
              </h1>
              <p className="text-sm font-extrabold text-[#6B7280] flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                <MapPin className="w-4 h-4 text-[#FFC107]" />
                {user ? user.location : t('profile.location')}
              </p>
            </div>
            
            <div className="flex items-center gap-2 self-center sm:self-auto">
              <Button
                variant={isEditing ? 'secondary' : 'secondary'}
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="w-4 h-4" />
                <span>{isEditing ? 'रद्द करा' : 'प्रोफाईल संपादीत करा'}</span>
              </Button>

              {isLoggedIn && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="border-2 border-[#E53935] text-[#E53935] hover:bg-rose-50 font-black"
                >
                  <LogOut className="w-4 h-4" />
                  <span>लॉगआउट</span>
                </Button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs">
            <span className="px-3.5 py-1.5 bg-[#FFFFFF] border border-[#E1EBE1] rounded-2xl font-black text-[#2E7D32] shadow-xs">
              🌱 {user ? user.landSize : t('profile.landDetails')}
            </span>
            <span className="px-3.5 py-1.5 bg-[#FFFFFF] border border-[#E1EBE1] rounded-2xl font-black text-[#1B4332] flex items-center gap-1.5 shadow-xs">
              <Phone className="w-3.5 h-3.5 text-[#43A047]" />
              +91 {user ? user.phone : '9822154321'}
            </span>
            <span className="px-3.5 py-1.5 bg-emerald-100 text-emerald-950 border border-emerald-300 rounded-2xl font-black flex items-center gap-1.5 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-[#43A047]" />
              किसान कार्ड नोंदणीकृत
            </span>
          </div>
        </div>

      </Card>

      {/* Edit Profile Form Drawer/Card */}
      {isEditing && (
        <Card hoverable={false} className="border-2 border-[#2E7D32] space-y-4 animate-in slide-in-from-top-2 duration-200">
          <h3 className="text-lg font-black text-[#1B4332] flex items-center gap-2 pb-3 border-b border-[#E1EBE1]">
            <Edit className="w-5 h-5 text-[#FFC107]" />
            <span>प्रोफाईल माहिती संपादीत करा (Edit Profile Info)</span>
          </h3>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2">
                  शेतकरी नाव:
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7FBF7] border-2 border-[#E1EBE1] rounded-2xl text-sm font-extrabold text-[#1B4332] focus:ring-4 focus:ring-[#2E7D32]/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2">
                  गाव / ठिकाण:
                </label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7FBF7] border-2 border-[#E1EBE1] rounded-2xl text-sm font-extrabold text-[#1B4332] focus:ring-4 focus:ring-[#2E7D32]/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2">
                  मोबाईल नंबर:
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7FBF7] border-2 border-[#E1EBE1] rounded-2xl text-sm font-extrabold text-[#1B4332] focus:ring-4 focus:ring-[#2E7D32]/20"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-[#1B4332] uppercase tracking-wider mb-2">
                  जमीन क्षेत्र:
                </label>
                <input
                  type="text"
                  value={editLandSize}
                  onChange={(e) => setEditLandSize(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[#F7FBF7] border-2 border-[#E1EBE1] rounded-2xl text-sm font-extrabold text-[#1B4332] focus:ring-4 focus:ring-[#2E7D32]/20"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" variant="primary" size="sm">
                <Save className="w-4 h-4 text-[#FFC107]" />
                <span>माहिती सेव्ह करा (Save Profile)</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Saved Preferences Card */}
        <Card hoverable={false} className="space-y-4 border border-[#E1EBE1] rounded-2xl shadow-sm bg-[#FFFFFF]">
          <h3 className="text-lg font-extrabold text-[#1B4332] flex items-center gap-2 pb-3 border-b border-[#E1EBE1]">
            <Sprout className="w-5 h-5 text-[#2E7D32]" />
            <span>{t('profile.savedCrops')} व {t('profile.preferredMandis')}</span>
          </h3>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-extrabold text-[#6B7280] uppercase tracking-wider block mb-2">
                जतन केलेली पिके:
              </span>
              <div className="flex flex-wrap gap-2">
                {['Onion', 'Soybean', 'Cotton', 'Sugarcane'].map((crop) => (
                  <span
                    key={crop}
                    className="px-3.5 py-2 bg-[#2E7D32] text-[#FFFFFF] text-xs font-black rounded-2xl shadow-xs flex items-center gap-1.5 min-h-[40px]"
                  >
                    <Sprout className="w-4 h-4 text-[#FFC107]" />
                    {t(`crops.${crop}`, crop)}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-[#E1EBE1]">
              <span className="text-xs font-extrabold text-[#6B7280] uppercase tracking-wider block mb-2">
                पसंतीच्या मंडी समित्या:
              </span>
              <div className="flex flex-wrap gap-2">
                {['Kopargaon', 'Rahata', 'Yeola', 'Sangamner'].map((mandi) => (
                  <span
                    key={mandi}
                    className="px-3.5 py-2 bg-[#F7FBF7] border border-[#E1EBE1] text-[#2E7D32] text-xs font-extrabold rounded-2xl flex items-center gap-1.5 min-h-[40px]"
                  >
                    <Store className="w-4 h-4 text-[#FFC107]" />
                    {t(`mandis.${mandi}`, mandi)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Alert History Log Card */}
        <Card hoverable={false} className="space-y-4 border border-[#E1EBE1] rounded-2xl shadow-sm bg-[#FFFFFF]">
          <h3 className="text-lg font-extrabold text-[#1B4332] flex items-center gap-2 pb-3 border-b border-[#E1EBE1]">
            <Bell className="w-5 h-5 text-[#FFC107]" />
            <span>{t('profile.alertLog')}</span>
          </h3>

          <div className="space-y-3">
            {[
              { crop: 'Onion', mandi: 'Yeola', target: 1950, date: '2026-07-22', status: 'WhatsApp वर पाठवले' },
              { crop: 'Soybean', mandi: 'Sangamner', target: 4700, date: '2026-07-18', status: 'SMS वर पाठवले' },
              { crop: 'Onion', mandi: 'Kopargaon', target: 1800, date: '2026-07-10', status: 'WhatsApp वर पाठवले' }
            ].map((log, idx) => (
              <div key={idx} className="p-3.5 bg-[#F7FBF7] border border-[#E1EBE1] rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <div className="font-extrabold text-[#1B4332]">
                    {t(`crops.${log.crop}`, log.crop)} - {t(`mandis.${log.mandi}`, log.mandi)}
                  </div>
                  <div className="text-[#6B7280] font-bold text-xs mt-0.5 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#43A047]" />
                    लक्ष्य भाव ₹{log.target} | {log.status}
                  </div>
                </div>
                <span className="text-xs text-[#6B7280] font-bold flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {log.date}
                </span>
              </div>
            ))}
          </div>
        </Card>

      </div>

    </div>
  );
};
