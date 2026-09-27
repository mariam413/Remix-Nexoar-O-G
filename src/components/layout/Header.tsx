import React, { useState } from 'react';
import {
  Bell,
  Search,
  Building2,
  ChevronDown,
  Shield,
  Layers,
  HelpCircle,
  RotateCcw,
  Sparkles,
  ExternalLink,
  CheckCircle,
  AlertTriangle,
  Sun,
  Moon,
  ArrowLeft,
  ArrowRight,
  ChevronRight,
  Menu,
} from 'lucide-react';
import { store } from '../../services/store';
import { UserRole } from '../../types';
import { NexoraLogo } from '../common/NexoraLogo';
import { BreadcrumbItem } from '../../services/router';
import { ASSET_IMAGES } from '../../assets/images';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenDemoGuide: () => void;
  onNavigate: (view: string, id?: string) => void;
  onBack?: () => void;
  onForward?: () => void;
  canGoBack?: boolean;
  canGoForward?: boolean;
  breadcrumbs?: BreadcrumbItem[];
  pageTitle?: string;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenDemoGuide,
  onNavigate,
  onBack,
  onForward,
  canGoBack = false,
  canGoForward = false,
  breadcrumbs = [],
  pageTitle,
  onToggleMobileSidebar,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showOrgMenu, setShowOrgMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const currentUser = store.getCurrentUser();
  const currentOrg = store.getCurrentOrganization();
  const state = store.getState();
  const unreadNotifs = state.notifications.filter((n) => !n.read);
  const currentTheme = store.getTheme();

  const handleToggleTheme = () => {
    store.toggleTheme();
  };

  const roleLabels: Record<UserRole, { label: string; badge: string; color: string }> = {
    ORGANIZATION_ADMIN: { label: 'Sarah Nalwanga', badge: 'Org Admin', color: 'bg-indigo-950/60 text-indigo-400 border-indigo-700/50' },
    PROCUREMENT_OFFICER: { label: 'David Okello', badge: 'Procurement Officer', color: 'bg-emerald-950/60 text-emerald-400 border-emerald-700/50' },
    INVENTORY_OFFICER: { label: 'Robert Mugabe', badge: 'Inventory Officer', color: 'bg-blue-950/60 text-blue-400 border-blue-700/50' },
    MAINTENANCE_OFFICER: { label: 'Eng. Patrick Kato', badge: 'Maintenance Officer', color: 'bg-amber-950/60 text-amber-400 border-amber-700/50' },
    MANAGEMENT_VIEWER: { label: 'Diana Tumwine', badge: 'Executive Viewer', color: 'bg-purple-950/60 text-purple-400 border-purple-700/50' },
    SUPPLIER_ADMIN: { label: 'James Mukasa', badge: 'Supplier Admin', color: 'bg-teal-950/60 text-teal-400 border-teal-700/50' },
    SUPPLIER_USER: { label: 'Grace Kyomugisha', badge: 'Supplier Rep', color: 'bg-teal-950/60 text-teal-400 border-teal-700/50' },
    NEXORA_SUPER_ADMIN: { label: 'Marcus Vance', badge: 'Super Admin', color: 'bg-rose-950/60 text-rose-400 border-rose-700/50' },
  };

  const handleRoleSelect = (userId: string) => {
    store.setCurrentUser(userId);
    setShowRoleMenu(false);
  };

  const handleOrgSelect = (orgId: string) => {
    store.setCurrentOrganization(orgId);
    setShowOrgMenu(false);
  };

  const handleResetData = () => {
    if (confirm('Reset prototype data back to initial demonstration state?')) {
      store.resetToSeed();
      window.location.reload();
    }
  };

  return (
    <header className="sticky top-0 z-30 flex flex-col bg-white dark:bg-[#0B243D] border-b border-slate-200 dark:border-[#1D4968] text-slate-800 dark:text-slate-100 shadow-xs transition-colors">
      {/* Top Prototype Banner - High Contrast Enterprise Theme */}
      <div className="bg-[#E0F4FA] dark:bg-[#061A2E] border-b border-[#65C7E5]/40 dark:border-[#1D4968] px-4 py-1.5 flex items-center justify-between text-xs text-[#082746] dark:text-slate-200">
        <div className="flex items-center gap-2.5">
          <span className="px-2 py-0.5 rounded bg-amber-600 text-white text-[10px] font-black uppercase tracking-wider">
            DEMO ENVIRONMENT
          </span>
          <span className="inline-block w-2 h-2 rounded-full bg-[#32B86A] animate-pulse" />
          <span className="font-black tracking-wide text-[#082746] dark:text-[#35C759]">
            NEXORA O&amp;G INTELLIGENCE
          </span>
          <span className="text-slate-400 hidden sm:inline">|</span>
          <span className="text-[#334155] dark:text-slate-300 font-medium hidden md:inline">
            Predict the spare. Secure the supply. Protect production.
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onOpenDemoGuide}
            className="flex items-center gap-1 font-bold text-[#0A78B5] dark:text-[#00AFC7] hover:text-[#00A6A6] transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#32B86A]" />
            <span className="hidden sm:inline">Master Demo Script</span>
            <span className="sm:hidden">Demo</span>
          </button>
          <button
            onClick={handleResetData}
            title="Reset demonstration data"
            className="flex items-center gap-1 text-[#082746] hover:text-[#0A78B5] dark:text-slate-400 dark:hover:text-slate-200 transition-colors cursor-pointer font-semibold"
          >
            <RotateCcw className="w-3 h-3 text-[#082746] dark:text-slate-400" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
        </div>
      </div>

      {/* Main App Navigation Header */}
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left Section: Mobile Menu, Logo, Back/Forward & Breadcrumbs */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-hidden">
          {/* Mobile hamburger menu */}
          {onToggleMobileSidebar && (
            <button
              onClick={onToggleMobileSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Open Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Official NEXORA Logo (Clickable Home) */}
          <div
            className="cursor-pointer shrink-0"
            onClick={() => onNavigate('dashboard')}
            title="NEXORA Home"
          >
            <NexoraLogo size="md" variant="horizontal" />
          </div>

          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700 shrink-0 hidden sm:block" />

          {/* Real Browser History Navigation: ← BACK & → FORWARD (Requirements 18 & 19) */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={onBack}
              disabled={!canGoBack}
              className={`p-1.5 rounded-lg border text-xs flex items-center justify-center transition-all ${
                canGoBack
                  ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#061A2E] text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-xs active:scale-95'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
              }`}
              title={canGoBack ? 'Back to previous route' : 'No previous history'}
              aria-label="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={onForward}
              disabled={!canGoForward}
              className={`p-1.5 rounded-lg border text-xs flex items-center justify-center transition-all ${
                canGoForward
                  ? 'border-slate-300 dark:border-slate-700 bg-white dark:bg-[#061A2E] text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-xs active:scale-95'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-50'
              }`}
              title={canGoForward ? 'Forward in route history' : 'No forward history'}
              aria-label="Forward"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Breadcrumbs & Page Context (Requirement 20) */}
          {breadcrumbs.length > 0 && (
            <nav className="hidden xl:flex items-center gap-1.5 text-xs text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap pl-2 border-l border-slate-200 dark:border-slate-800">
              {breadcrumbs.map((crumb, idx) => {
                const isLast = idx === breadcrumbs.length - 1;
                return (
                  <React.Fragment key={idx}>
                    {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    {crumb.path && !isLast ? (
                      <button
                        onClick={() => onNavigate(crumb.path!.replace('/', '') || 'dashboard')}
                        className="hover:text-[#0878C9] hover:underline cursor-pointer truncate max-w-[150px]"
                      >
                        {crumb.label}
                      </button>
                    ) : (
                      <span className={`font-semibold truncate max-w-[200px] ${
                        isLast ? 'text-[#061A2E] dark:text-white font-bold' : ''
                      }`}>
                        {crumb.label}
                      </span>
                    )}
                  </React.Fragment>
                );
              })}
            </nav>
          )}

          {/* Organization Switcher Dropdown (Data Isolation) */}
          <div className="relative hidden lg:block">
            <button
              onClick={() => setShowOrgMenu(!showOrgMenu)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#061A2E] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-[#1D4968] text-xs font-medium text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5 text-[#0878C9] shrink-0" />
              <div className="text-left">
                <span className="block text-[9px] uppercase text-slate-400 font-bold tracking-wider leading-none">
                  Tenant
                </span>
                <span className="font-semibold text-slate-900 dark:text-slate-100 max-w-[140px] truncate block leading-tight mt-0.5">
                  {currentOrg.name}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>

            {showOrgMenu && (
              <div className="absolute top-full left-0 mt-2 w-72 bg-white dark:bg-[#0B243D] border border-slate-200 dark:border-[#1D4968] rounded-xl shadow-2xl p-2 z-50">
                <div className="px-3 py-2 text-[11px] font-bold uppercase text-slate-400 border-b border-slate-100 dark:border-slate-800">
                  Switch Active Tenant (Isolated Context)
                </div>
                <div className="py-1 space-y-1">
                  {state.organizations.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => handleOrgSelect(org.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                        org.id === currentOrg.id
                          ? 'bg-[#E0F4FA] dark:bg-[#0878C9]/20 text-[#0878C9] dark:text-white font-bold border border-[#0878C9]/30'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div>
                        <div className="font-bold">{org.name}</div>
                        <div className="text-[10px] text-slate-400">
                          {org.type} · {org.subscriptionPlan || 'ENTERPRISE'} · {org.region}
                        </div>
                      </div>
                      {org.id === currentOrg.id && <CheckCircle className="w-3.5 h-3.5 text-[#35C759]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Section: Search, AI, Theme, Notifications & User */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Global Search Button */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#061A2E] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-[#1D4968] text-slate-600 dark:text-slate-300 text-xs transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="hidden md:inline">Search materials, equipment...</span>
            <kbd className="hidden md:inline px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] text-slate-400 font-mono">
              ⌘K
            </kbd>
          </button>

          {/* Direct Nexora AI Button */}
          <button
            onClick={() => onNavigate('assistant')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#0878C9] to-[#35C759] hover:from-[#0661a3] hover:to-[#289e58] text-white font-bold text-xs transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span className="hidden sm:inline">Nexora AI</span>
          </button>

          {/* Theme Mode Toggle */}
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-lg bg-slate-50 dark:bg-[#061A2E] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-[#1D4968] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title={`Switch to ${currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode'}`}
          >
            {currentTheme === 'dark' ? (
              <Sun className="w-4 h-4 text-[#35C759]" />
            ) : (
              <Moon className="w-4 h-4 text-[#0878C9]" />
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifMenu(!showNotifMenu)}
              className="relative p-2 rounded-lg bg-slate-50 dark:bg-[#061A2E] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-[#1D4968] text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {showNotifMenu && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-[#0B243D] border border-slate-200 dark:border-[#1D4968] rounded-xl shadow-2xl p-2 z-50">
                <div className="px-3 py-2 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-[#061A2E] dark:text-white">System Notifications</span>
                  {unreadNotifs.length > 0 && (
                    <button
                      onClick={() => store.markAllNotificationsAsRead()}
                      className="text-[11px] text-[#0878C9] hover:underline cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                  {state.notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400">No notifications</div>
                  ) : (
                    state.notifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => {
                          store.markNotificationAsRead(notif.id);
                          if (notif.linkView) onNavigate(notif.linkView, notif.linkId);
                          setShowNotifMenu(false);
                        }}
                        className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer ${
                          !notif.read ? 'bg-[#E0F4FA]/40 dark:bg-[#0878C9]/10' : ''
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          {notif.type === 'ALERT' && <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />}
                          {notif.type === 'WARNING' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                          {notif.type === 'SUCCESS' && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />}
                          {notif.type === 'INFO' && <Bell className="w-4 h-4 text-[#0878C9] shrink-0 mt-0.5" />}
                          <div className="text-left flex-1">
                            <div className="text-xs font-semibold text-slate-900 dark:text-white">{notif.title}</div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{notif.message}</div>
                            <div className="text-[9px] text-slate-400 mt-1 font-mono">
                              {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="h-6 w-[1px] bg-slate-200 dark:bg-slate-700" />

          {/* User & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(!showRoleMenu)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-[#061A2E] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-[#1D4968] transition-colors cursor-pointer"
            >
              <div className="w-7 h-7 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 flex items-center justify-center font-bold text-xs text-[#0878C9]">
                {currentUser.role === 'ORGANIZATION_ADMIN' ? (
                  <img
                    src={ASSET_IMAGES.avatarDirector}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  currentUser.name.charAt(0)
                )}
              </div>
              <div className="text-left hidden lg:block">
                <div className="text-xs font-semibold text-[#061A2E] dark:text-white leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-400">
                  {roleLabels[currentUser.role]?.badge || currentUser.role}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-white dark:bg-[#0B243D] border border-slate-200 dark:border-[#1D4968] rounded-xl shadow-2xl p-2 z-50">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                  <div className="text-xs font-bold text-[#061A2E] dark:text-white">Switch Role (Demonstration Mode)</div>
                  <div className="text-[10px] text-slate-400">Experience Company, Supplier, or NEXORA Admin workflows.</div>
                </div>
                <div className="py-1 space-y-1">
                  {state.users.map((u) => {
                    const isSelected = u.id === currentUser.id;
                    const rInfo = roleLabels[u.role];
                    return (
                      <button
                        key={u.id}
                        onClick={() => handleRoleSelect(u.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-[#E0F4FA] dark:bg-[#0878C9]/20 text-[#0878C9] dark:text-white font-bold border border-[#0878C9]/30'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                      >
                        <div>
                          <div className="font-semibold">{u.name}</div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold text-[#0878C9] dark:text-[#35C759]">
                              {rInfo?.badge || u.role}
                            </span>
                            <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                              {u.organizationName}
                            </span>
                          </div>
                        </div>
                        {isSelected && <CheckCircle className="w-4 h-4 text-[#35C759]" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
