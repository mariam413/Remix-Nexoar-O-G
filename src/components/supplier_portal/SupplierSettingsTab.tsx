import React, { useState } from 'react';
import {
  Settings,
  Building2,
  User,
  Bell,
  Shield,
  Bot,
  Globe,
  Save,
  CheckCircle,
} from 'lucide-react';

export const SupplierSettingsTab: React.FC = () => {
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [settings, setSettings] = useState({
    companyName: 'ABC Industrial Supplies Ltd',
    companyEmail: 'procurement@abcindustrial.example',
    phone: '+256 700 000 000',
    tinNumber: '1009827361-DEMO',
    defaultCurrency: 'UGX',
    contactPerson: 'Grace Kyomugisha',
    contactRole: 'Lead Supplier Representative',
    notifyNewRfqs: true,
    notifyPoIssued: true,
    notifyDelayAlerts: true,
    autoReserveMatchingStock: false,
    aiAutoMatchThreshold: 85,
    language: 'English (UK / East Africa)',
    timezone: 'Africa/Kampala (EAT UTC+3)',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-6 max-w-4xl">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-black text-[#123B63] dark:text-white tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#0B78B5]" />
            <span>Supplier Portal Configuration &amp; Settings</span>
          </h1>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
            Manage organization details, automated tender notifications, and AI matching rules for ABC Industrial Supplies Ltd.
          </p>
        </div>

        {savedSuccess && (
          <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-emerald-600" />
            <span>Preferences Saved</span>
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Company Settings */}
        <div className="space-y-3">
          <h2 className="text-xs font-black uppercase text-[#123B63] dark:text-sky-300 tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-[#0B78B5]" />
            <span>1. Organization &amp; Account Settings</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#123B63] dark:text-slate-300 font-bold mb-1">Company Registered Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#123B63] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[#123B63] dark:text-slate-300 font-bold mb-1">URA TIN Number</label>
              <input
                type="text"
                value={settings.tinNumber}
                onChange={(e) => setSettings({ ...settings, tinNumber: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#123B63] dark:text-white font-mono"
              />
            </div>
          </div>
        </div>

        {/* User Profile */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-xs font-black uppercase text-[#123B63] dark:text-sky-300 tracking-wider flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-[#00A6A6]" />
            <span>2. Lead Representative Profile</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#123B63] dark:text-slate-300 font-bold mb-1">Representative Name</label>
              <input
                type="text"
                value={settings.contactPerson}
                onChange={(e) => setSettings({ ...settings, contactPerson: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#123B63] dark:text-white"
              />
            </div>
            <div>
              <label className="block text-[#123B63] dark:text-slate-300 font-bold mb-1">Official Email</label>
              <input
                type="email"
                value={settings.companyEmail}
                onChange={(e) => setSettings({ ...settings, companyEmail: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#123B63] dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-xs font-black uppercase text-[#123B63] dark:text-sky-300 tracking-wider flex items-center gap-1.5">
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span>3. Automated Tender Alerts</span>
          </h2>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-[#334155] dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifyNewRfqs}
                onChange={(e) => setSettings({ ...settings, notifyNewRfqs: e.target.checked })}
                className="w-4 h-4 text-[#0B78B5] rounded"
              />
              <span>Immediate email broadcast when new RFQ matches catalog inventory</span>
            </label>

            <label className="flex items-center gap-2 text-[#334155] dark:text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={settings.notifyPoIssued}
                onChange={(e) => setSettings({ ...settings, notifyPoIssued: e.target.checked })}
                className="w-4 h-4 text-[#0B78B5] rounded"
              />
              <span>Instant notification when buyer evaluation committee accepts quotation</span>
            </label>
          </div>
        </div>

        {/* AI & Intelligence Preferences */}
        <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <h2 className="text-xs font-black uppercase text-[#123B63] dark:text-sky-300 tracking-wider flex items-center gap-1.5">
            <Bot className="w-3.5 h-3.5 text-purple-500" />
            <span>4. NEXORA AI Matching Rules</span>
          </h2>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[#123B63] dark:text-slate-300 font-bold mb-1">
                Tender Opportunity Match Sensitivity ({settings.aiAutoMatchThreshold}%)
              </label>
              <input
                type="range"
                min="60"
                max="95"
                value={settings.aiAutoMatchThreshold}
                onChange={(e) => setSettings({ ...settings, aiAutoMatchThreshold: Number(e.target.value) })}
                className="w-full accent-[#0B78B5] cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-[#123B63] dark:text-slate-300 font-bold mb-1">Timezone</label>
              <input
                type="text"
                readOnly
                value={settings.timezone}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#0B78B5] hover:bg-[#09669B] text-white font-bold text-xs shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Configuration Changes</span>
          </button>
        </div>
      </form>
    </div>
  );
};
