import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Warehouse,
  Cog,
  Boxes,
  PackageSearch,
  Wrench,
  BrainCircuit,
  Sliders,
  ShoppingBag,
  Truck,
  FileText,
  Bot,
  BookOpen,
  ClipboardList,
  Settings,
  Users,
  BarChart3,
  Cpu,
  Activity,
  Award,
  Layers,
  Sparkles,
  CreditCard,
  DollarSign,
  Shield,
  X,
} from 'lucide-react';
import { store } from '../../services/store';
import { NexoraLogo } from '../common/NexoraLogo';

interface SidebarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onOpenDemoGuide: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  onOpenDemoGuide,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const currentUser = store.getCurrentUser();
  const currentOrg = store.getCurrentOrganization();
  const isSuperAdmin = currentUser.role === 'NEXORA_SUPER_ADMIN';
  const isSupplier = currentUser.role === 'SUPPLIER_ADMIN' || currentUser.role === 'SUPPLIER_USER';

  // 1. Company Operator Navigation Items
  const orgNavItems = [
    { id: 'dashboard', label: 'Operations Briefing', icon: LayoutDashboard },
    { id: 'facilities', label: 'Facilities & Plants', icon: Building2 },
    { id: 'warehouses', label: 'Warehouse Depots', icon: Warehouse },
    { id: 'equipment', label: 'Equipment Registry', icon: Cog },
    { id: 'materials', label: 'Materials Registry', icon: Boxes },
    { id: 'inventory', label: 'Inventory Engine', icon: PackageSearch },
    { id: 'maintenance', label: 'Maintenance & Readiness', icon: Wrench },
    { id: 'intelligence', label: 'AI Intelligence', icon: BrainCircuit, badge: 'Insights' },
    { id: 'whatif', label: 'What-If Simulator', icon: Sliders, badge: 'Signature' },
    { id: 'procurement', label: 'Procurement & Matching', icon: ShoppingBag },
    { id: 'suppliers', label: 'Supplier Directory', icon: Truck },
    { id: 'orders', label: 'Orders & Deliveries', icon: FileText },
    { id: 'assistant', label: 'NEXORA AI Assistant', icon: Bot, badge: 'AI' },
    { id: 'knowledge', label: 'Company Knowledge', icon: BookOpen },
    { id: 'audit', label: 'Audit Trail', icon: ClipboardList },
    { id: 'company_billing', label: 'Subscription & Billing', icon: CreditCard, badge: currentOrg.subscriptionPlan || 'SaaS' },
    { id: 'company_settings', label: 'Settings & Risk Rules', icon: Settings },
  ];

  // 2. Supplier Portal Navigation Items
  const supplierNavItems = [
    { id: 'supplier_dashboard', label: 'Supplier Overview', icon: LayoutDashboard },
    { id: 'opportunities', label: 'Tender Opportunities', icon: ShoppingBag, badge: 'Live RFQs' },
    { id: 'supplier_inventory', label: 'My Spares Inventory', icon: Boxes },
    { id: 'supplier_offers', label: 'Submitted Offers', icon: FileText },
    { id: 'supplier_orders', label: 'Active Orders & Dispatch', icon: Truck },
    { id: 'supplier_profile', label: 'Company Profile & NSD', icon: Award, badge: 'Verified' },
    { id: 'supplier_assistant', label: 'Supplier AI Copilot', icon: Bot },
    { id: 'supplier_settings', label: 'Account Settings', icon: Settings },
  ];

  // 3. NEXORA Admin Console Navigation Items (Requirement 7)
  const adminNavItems = [
    { id: 'admin_overview', label: 'Platform Overview', icon: LayoutDashboard },
    { id: 'admin_tenants', label: 'Companies / Tenants', icon: Building2 },
    { id: 'admin_suppliers', label: 'Suppliers Network', icon: Truck },
    { id: 'admin_users', label: 'Platform Users', icon: Users },
    { id: 'admin_subscriptions', label: 'Plans & Entitlements', icon: Sliders },
    { id: 'admin_revenue', label: 'Revenue Dashboard', icon: DollarSign, badge: 'MRR' },
    { id: 'admin_services', label: 'Implementation Services', icon: Layers },
    { id: 'admin_ai_modules', label: 'AI Intelligence Flags', icon: Sparkles, badge: 'Gemini' },
    { id: 'admin_rfqs', label: 'Procurement Activity', icon: FileText },
    { id: 'admin_health', label: 'System Health & Engine', icon: Activity },
    { id: 'admin_ai_config', label: 'AI Diagnostics', icon: Cpu },
    { id: 'admin_audit', label: 'Master Platform Audit', icon: Shield },
  ];

  let items = orgNavItems;
  let sectionLabel = 'COMPANY WORKSPACE';
  let badgeLabel = currentOrg.name;

  if (isSuperAdmin) {
    items = adminNavItems;
    sectionLabel = 'NEXORA CONTROL CENTER';
    badgeLabel = 'Platform Root';
  } else if (isSupplier) {
    items = supplierNavItems;
    sectionLabel = 'SUPPLIER WORKSPACE';
    badgeLabel = currentUser.organizationName;
  }

  const handleItemClick = (id: string) => {
    onNavigate(id);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#061A2E] text-slate-800 dark:text-slate-100 select-none">
      {/* Scope Header */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-[#1D4968] flex items-center justify-between">
        <div className="overflow-hidden">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#0878C9] dark:text-[#35C759] block">
            {sectionLabel}
          </span>
          <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate block mt-0.5 max-w-[170px]">
            {badgeLabel}
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800">
          v2.0
        </span>
      </div>

      {/* Nav Items List */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          // Matching active view
          const isActive =
            currentView === item.id ||
            (item.id === 'admin_overview' && (currentView === 'admin' || currentView === 'admin_overview')) ||
            (item.id === 'supplier_dashboard' && (currentView === 'supplier' || currentView === 'supplier_dashboard'));

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0878C9] text-white font-bold shadow-md shadow-sky-500/20'
                  : 'text-slate-700 dark:text-slate-300 hover:text-[#0878C9] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#0B243D]'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-[#0878C9]'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badge === 'Signature'
                      ? 'bg-[#35C759] text-white'
                      : item.badge === 'AI' || item.badge === 'Gemini' || item.badge === 'MRR' || item.badge === 'Live RFQs'
                      ? 'bg-[#0878C9] text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Interactive Tour Banner */}
      <div className="p-3 border-t border-slate-200 dark:border-[#1D4968] bg-slate-50 dark:bg-[#0B243D]/50">
        <button
          onClick={onOpenDemoGuide}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#0878C9] to-[#35C759] hover:from-[#0661a3] hover:to-[#289e58] text-white text-xs font-bold transition-all shadow-md shadow-sky-500/10 cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-white shrink-0" />
          <div className="text-left">
            <div className="text-[11px] leading-tight font-black text-white">Master Demo Guide</div>
            <div className="text-[9px] text-white/90 font-medium">22-Step Scripted Tour</div>
          </div>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-slate-200 dark:border-[#1D4968] flex-col shrink-0 select-none">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Responsive Requirement 31) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative w-72 max-w-[85%] bg-white dark:bg-[#061A2E] z-10 flex flex-col h-full shadow-2xl">
            <div className="absolute top-3 right-3 z-20">
              <button
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
