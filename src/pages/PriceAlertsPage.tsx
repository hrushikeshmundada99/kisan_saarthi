import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import {
  type PriceAlertItem,
  getStoredAlerts,
  saveStoredAlerts,
  evaluateAlertStatus
} from '../utils/alertManager';
import { useToast } from '../components/Toast';
import { AlertCard } from '../components/AlertCard';
import { EmptyState } from '../components/EmptyState';
import { CropSelector } from '../components/CropSelector';
import { Card } from '../components/Card';
import { Button } from '../components/Button';
import {
  Bell,
  Plus,
  Sparkles,
  ArrowUpDown,
  CheckSquare,
  Square,
  Store
} from 'lucide-react';

const MANDIS_WITH_ANY = ['ANY', 'Kopargaon', 'Rahata', 'Shrirampur', 'Yeola', 'Sangamner', 'Nashik', 'Ahmednagar'];

export const PriceAlertsPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { showToast } = useToast();
  const formRef = useRef<HTMLDivElement>(null);

  // Read initial alerts from localStorage
  const [alerts, setAlerts] = useState<PriceAlertItem[]>(getStoredAlerts);

  // Form State
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [crop, setCrop] = useState<string>('Onion');
  const [mandi, setMandi] = useState<string>('Kopargaon');
  const [condition, setCondition] = useState<'ABOVE' | 'BELOW'>('ABOVE');
  const [targetPrice, setTargetPrice] = useState<number>(2000);
  const [notificationMethods, setNotificationMethods] = useState<Array<'In-App' | 'SMS' | 'WhatsApp' | 'Email'>>([
    'In-App',
    'WhatsApp'
  ]);

  // Filter & Sort State
  const [filterTab, setFilterTab] = useState<'ALL' | 'ACTIVE' | 'TRIGGERED'>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'closest'>('closest');

  // Persist alerts to localStorage on change
  useEffect(() => {
    saveStoredAlerts(alerts);
  }, [alerts]);

  // Target price validation
  const isTargetPriceValid = targetPrice > 0;

  // Toggle notification method checkbox
  const toggleMethod = (method: 'In-App' | 'SMS' | 'WhatsApp' | 'Email') => {
    setNotificationMethods((prev) => {
      if (prev.includes(method)) {
        if (prev.length <= 1) return prev; // keep at least 1
        return prev.filter((m) => m !== method);
      } else {
        return [...prev, method];
      }
    });
  };

  // Add New Alert
  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isTargetPriceValid) return;

    const newAlert: PriceAlertItem = {
      id: `alt-${Date.now()}`,
      crop,
      mandi,
      condition,
      targetPrice,
      notificationMethods,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().split('T')[0]
    };

    setAlerts([newAlert, ...alerts]);
    setShowAddForm(false);
    showToast('नवीन भाव अलर्ट यशस्वीरित्या तयार केला! (Alert Created)', 'success');
  };

  // Toggle Alert Status (Enable / Pause)
  const handleToggleStatus = (id: string) => {
    setAlerts((prev) =>
      prev.map((alt) => {
        if (alt.id === id) {
          const nextStatus = alt.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED';
          showToast(nextStatus === 'DISABLED' ? 'अलर्ट थांबवण्यात आला (Alert Paused)' : 'अलर्ट पुन्हा सुरू केला (Alert Activated)', 'info');
          return { ...alt, status: nextStatus };
        }
        return alt;
      })
    );
  };

  // Delete Alert
  const handleDeleteAlert = (id: string) => {
    setAlerts((prev) => prev.filter((alt) => alt.id !== id));
    showToast('अलर्ट यशस्वीरित्या हटवला गेला (Alert Deleted)', 'error');
  };

  // Filter & Sort Alerts List (Triggered placed at top)
  const processedAlertsList = useMemo(() => {
    let result = alerts;

    // Filter Tab
    if (filterTab === 'ACTIVE') {
      result = result.filter((alt) => {
        const ev = evaluateAlertStatus(alt);
        return ev.status === 'ACTIVE';
      });
    } else if (filterTab === 'TRIGGERED') {
      result = result.filter((alt) => {
        const ev = evaluateAlertStatus(alt);
        return ev.status === 'TRIGGERED';
      });
    }

    // Sort: Triggered always prioritized at top, then by sort parameter
    return [...result].sort((a, b) => {
      const evA = evaluateAlertStatus(a);
      const evB = evaluateAlertStatus(b);

      if (evA.isTriggered && !evB.isTriggered) return -1;
      if (!evA.isTriggered && evB.isTriggered) return 1;

      if (sortBy === 'closest') {
        return evA.distanceToTarget - evB.distanceToTarget;
      } else {
        return b.createdAt.localeCompare(a.createdAt);
      }
    });
  }, [alerts, filterTab, sortBy]);

  // Scroll to Form Focus
  const handleFocusForm = () => {
    setShowAddForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto animate-in fade-in duration-300">
      
      {/* Header Card */}
      <Card hoverable={false} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D97706]/10 text-[#B45309] text-xs font-bold mb-2">
            <Bell className="w-3.5 h-3.5" />
            <span>थेट व्हॉट्सॲप / SMS अलर्ट प्रणाली (Price Notification Engine)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#2D5016]">
            {t('alerts.title')}
          </h1>
          <p className="text-sm text-[#4B5563] mt-1">
            {t('alerts.subtitle')}
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setShowAddForm(!showAddForm)}
          className="self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#D97706]" />
          <span>{t('alerts.setAlertTitle')}</span>
        </Button>
      </Card>

      {/* 1. Set New Alert Form / Card */}
      {showAddForm && (
        <div ref={formRef}>
          <form onSubmit={handleAddAlert}>
            <Card hoverable={false} className="border-2 border-[#2D5016] space-y-5 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between border-b border-[#E5DFD5] pb-3">
                <h3 className="text-lg font-bold text-[#2D5016] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#D97706]" />
                  <span>नवीन भाव अलर्ट सेट करा (Create New Price Alert)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-xs font-bold text-[#4B5563] hover:text-[#1F2937] min-h-[44px] px-3 cursor-pointer"
                >
                  रद्द करा (Cancel)
                </button>
              </div>

              {/* Crop & Mandi Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2">
                    1. पिक निवडा:
                  </label>
                  <CropSelector selectedCrop={crop} onSelectCrop={(c) => setCrop(c)} variant="chips" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2">
                    2. बाजार समिती (Mandi):
                  </label>
                  <div className="relative flex items-center">
                    <Store className="absolute left-3.5 w-4.5 h-4.5 text-[#D97706]" />
                    <select
                      value={mandi}
                      onChange={(e) => setMandi(e.target.value)}
                      className="w-full pl-10 pr-4 min-h-[44px] bg-[#FFFFFF] border border-[#E5DFD5] rounded-xl text-[#1F2937] font-bold text-sm focus:outline-none focus:ring-2 focus:ring-[#D97706]/40 cursor-pointer shadow-xs"
                    >
                      {MANDIS_WITH_ANY.map((mItem) => (
                        <option key={mItem} value={mItem}>
                          {mItem === 'ANY'
                            ? (i18n.language === 'mr' ? '📍 कोणतीही जवळची मंडी (Any Nearby Mandi)' : '📍 Any nearby mandi')
                            : `📍 ${t(`mandis.${mItem}`, mItem)}`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* 1. Condition & Target Price Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-[#E5DFD5]">
                
                {/* Condition Radio Toggle */}
                <div>
                  <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2">
                    3. अट निवडा (Alert Condition):
                  </label>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCondition('ABOVE')}
                      className={`p-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer ${
                        condition === 'ABOVE'
                          ? 'bg-[#2D5016] text-[#FFFFFF] border-[#2D5016] shadow-xs'
                          : 'bg-[#FAF7F2] text-[#2D5016] border-[#E5DFD5]'
                      }`}
                    >
                      <span>भाव वाढल्यास (Above ₹)</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCondition('BELOW')}
                      className={`p-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer ${
                        condition === 'BELOW'
                          ? 'bg-[#2D5016] text-[#FFFFFF] border-[#2D5016] shadow-xs'
                          : 'bg-[#FAF7F2] text-[#2D5016] border-[#E5DFD5]'
                      }`}
                    >
                      <span>भाव घटल्यास (Below ₹)</span>
                    </button>
                  </div>
                </div>

                {/* Target Price Input */}
                <div>
                  <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider mb-2">
                    4. लक्ष्य भाव रु. प्रति क्विंटल (Target Price ₹):
                  </label>
                  <input
                    type="number"
                    step="50"
                    min="100"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-[#FFFFFF] border border-[#E5DFD5] rounded-xl text-base font-extrabold text-[#1F2937] focus:ring-2 focus:ring-[#2D5016]/40 min-h-[44px] shadow-xs"
                    required
                  />
                  {!isTargetPriceValid && (
                    <p className="text-xs text-rose-600 font-bold mt-1">कृपया वैध लक्ष्य भाव प्रविष्ट करा</p>
                  )}
                </div>

              </div>

              {/* 1. Notification Method Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-[#E5DFD5]">
                <label className="block text-xs font-bold text-[#4B5563] uppercase tracking-wider">
                  5. मेसेज पाठवण्याचे मार्ग (Notification Methods):
                </label>

                <div className="flex flex-wrap gap-2">
                  {(['In-App', 'WhatsApp', 'SMS', 'Email'] as const).map((method) => {
                    const isChecked = notificationMethods.includes(method);
                    return (
                      <button
                        key={method}
                        type="button"
                        onClick={() => toggleMethod(method)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all min-h-[44px] cursor-pointer ${
                          isChecked
                            ? 'bg-[#2D5016] text-[#FFFFFF] shadow-xs'
                            : 'bg-[#FAF7F2] text-[#2D5016] border border-[#E5DFD5]'
                        }`}
                      >
                        {isChecked ? <CheckSquare className="w-4 h-4 text-[#D97706]" /> : <Square className="w-4 h-4 text-[#6B7280]" />}
                        <span>{method}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  disabled={!isTargetPriceValid}
                >
                  <Bell className="w-4 h-4 text-[#D97706]" />
                  <span>{t('alerts.addAlertBtn')}</span>
                </Button>
              </div>
            </Card>
          </form>
        </div>
      )}

      {/* 5. Filtering & Sorting Toolbar */}
      <Card hoverable={false} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Filter Tabs */}
        <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#E5DFD5] text-xs font-bold">
          {(
            [
              { id: 'ALL', labelMr: `सर्व (${alerts.length})`, labelEn: `All (${alerts.length})` },
              { id: 'ACTIVE', labelMr: 'सक्रिय (Active)', labelEn: 'Active' },
              { id: 'TRIGGERED', labelMr: 'ट्रिगर झालेले (Triggered)', labelEn: 'Triggered' }
            ] as const
          ).map((tab) => {
            const isActive = filterTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setFilterTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg transition-all min-h-[36px] cursor-pointer ${
                  isActive
                    ? 'bg-[#2D5016] text-[#FFFFFF] shadow-xs'
                    : 'text-[#4B5563] hover:text-[#2D5016] hover:bg-[#FFFFFF]'
                }`}
              >
                {i18n.language === 'mr' ? tab.labelMr : tab.labelEn}
              </button>
            );
          })}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[#E5DFD5] p-2 rounded-xl shadow-xs self-start sm:self-auto">
          <ArrowUpDown className="w-4 h-4 text-[#D97706]" />
          <span className="text-xs font-semibold text-[#4B5563]">क्रमवारी:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent text-xs font-bold text-[#2D5016] focus:outline-none cursor-pointer pr-2"
          >
            <option value="closest">लक्ष्याच्या सर्वात जवळ (Closest to Target)</option>
            <option value="newest">नवीनतम प्रथम (Newest First)</option>
          </select>
        </div>
      </Card>

      {/* Active & Triggered Alerts List */}
      {processedAlertsList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {processedAlertsList.map((alt) => (
            <AlertCard
              key={alt.id}
              alert={alt}
              onToggleStatus={handleToggleStatus}
              onDelete={handleDeleteAlert}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <EmptyState
          title={t('alerts.emptyStateTitle')}
          description={t('alerts.emptyStateDesc')}
          actionLabel={t('alerts.setAlertTitle')}
          onAction={handleFocusForm}
        />
      )}

    </div>
  );
};
