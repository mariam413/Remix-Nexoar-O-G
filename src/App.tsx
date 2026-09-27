import React, { useState, useEffect } from 'react';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './components/landing/LandingPage';
import { OrganizationDashboard } from './components/dashboard/OrganizationDashboard';
import { MaterialsView } from './components/materials/MaterialsView';
import { MaterialDetailModal } from './components/materials/MaterialDetailModal';
import { InventoryView } from './components/inventory/InventoryView';
import { MaintenanceView } from './components/maintenance/MaintenanceView';
import { AIIntelligenceView } from './components/intelligence/AIIntelligenceView';
import { WhatIfSimulator } from './components/whatif/WhatIfSimulator';
import { ProcurementView } from './components/procurement/ProcurementView';
import { OrdersView } from './components/orders/OrdersView';
import { SupplierDirectory } from './components/suppliers/SupplierDirectory';
import { SupplierPortal } from './components/supplier_portal/SupplierPortal';
import { AIAssistantView } from './components/ai/AIAssistantView';
import { AuditLogView } from './components/audit/AuditLogView';
import { CompanyKnowledgeView } from './components/knowledge/CompanyKnowledgeView';
import { SuperAdminView } from './components/admin/SuperAdminView';
import { GuidedDemoModal } from './components/demo/GuidedDemoModal';
import { FacilitiesDashboard } from './components/facilities/FacilitiesDashboard';
import { WarehouseDashboard } from './components/warehouse/WarehouseDashboard';
import { EquipmentDashboard } from './components/equipment/EquipmentDashboard';
import { CompanyBillingView } from './components/company/CompanyBillingView';
import { NotFoundView } from './components/common/NotFoundView';
import { Bot, Sparkles } from 'lucide-react';
import { store } from './services/store';
import { router, RouteState } from './services/router';

export const App: React.FC = () => {
  const [, setTick] = useState(0);
  const [routeState, setRouteState] = useState<RouteState>(() => router.getCurrentRoute());
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(null);
  const [selectedPRId, setSelectedPRId] = useState<string | undefined>(undefined);
  const [selectedOrderId, setSelectedOrderId] = useState<string | undefined>(undefined);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Subscribe to central store changes
  useEffect(() => {
    const unsubscribeStore = store.subscribe(() => {
      setTick((t) => t + 1);
    });
    return () => {
      unsubscribeStore();
    };
  }, []);

  // Subscribe to router state & synchronize URL
  useEffect(() => {
    const unsubscribeRouter = router.subscribe((state) => {
      setRouteState(state);
      if (state.params.materialId) {
        setSelectedMaterialId(state.params.materialId);
      }
      if (state.params.requestId) {
        setSelectedPRId(state.params.requestId);
      }
      if (state.params.orderId) {
        setSelectedOrderId(state.params.orderId);
      }
    });

    // Check initial params
    const initial = router.getCurrentRoute();
    if (initial.params.materialId) {
      setSelectedMaterialId(initial.params.materialId);
    }
    if (initial.params.requestId) {
      setSelectedPRId(initial.params.requestId);
    }
    if (initial.params.orderId) {
      setSelectedOrderId(initial.params.orderId);
    }

    return () => {
      unsubscribeRouter();
    };
  }, []);

  const currentUser = store.getCurrentUser();
  const materials = store.getMaterials();
  const activeView = routeState.view;

  // Role-based route guard & auto-routing
  useEffect(() => {
    const isSupplierRole = currentUser.role === 'SUPPLIER_USER' || currentUser.role === 'SUPPLIER_ADMIN';
    const isSuperAdmin = currentUser.role === 'NEXORA_SUPER_ADMIN';
    const isLanding = activeView === 'landing';

    if (isLanding) return;

    if (isSupplierRole && !routeState.path.startsWith('/supplier')) {
      router.navigate('/supplier/dashboard');
    } else if (isSuperAdmin && !routeState.path.startsWith('/admin') && activeView !== 'dashboard') {
      // Super admin can inspect operator dashboards or stay in admin console
    }
  }, [currentUser.role, activeView]);

  const handleOpenMaterialModal = (materialId: string) => {
    setSelectedMaterialId(materialId);
  };

  const handleOpenWhatIf = (materialId?: string) => {
    if (materialId) {
      setSelectedMaterialId(materialId);
      handleNavigate('whatif', materialId);
    } else {
      handleNavigate('whatif');
    }
  };

  const handleOpenProcure = (materialId: string) => {
    setSelectedMaterialId(materialId);
    handleNavigate('procurement');
  };

  const handleOpenOrder = (orderId: string) => {
    setSelectedOrderId(orderId);
    handleNavigate('orders', orderId);
  };

  // Central Navigation Handler: Maps logical views to real browser URL routes (Requirements 18, 19, 21)
  const handleNavigate = (view: string, id?: string) => {
    let path = `/${view}`;

    switch (view) {
      case 'landing':
        path = '/';
        break;
      case 'dashboard':
        path = '/dashboard';
        break;
      case 'materials':
        path = id ? `/materials/${id}` : '/materials';
        if (id) setSelectedMaterialId(id);
        break;
      case 'inventory':
        path = id ? `/inventory/${id}` : '/inventory';
        break;
      case 'facilities':
        path = id ? `/facilities/${id}` : '/facilities';
        break;
      case 'warehouses':
        path = id ? `/warehouses/${id}` : '/warehouses';
        break;
      case 'equipment':
        path = id ? `/equipment/${id}` : '/equipment';
        break;
      case 'maintenance':
        path = '/maintenance';
        break;
      case 'intelligence':
        path = '/intelligence';
        break;
      case 'whatif':
        path = id ? `/whatif/${id}` : '/whatif';
        break;
      case 'procurement':
        path = id ? `/procurement/${id}` : '/procurement';
        if (id) setSelectedPRId(id);
        break;
      case 'suppliers':
        path = id ? `/suppliers/${id}` : '/suppliers';
        break;
      case 'orders':
        path = id ? `/orders/${id}` : '/orders';
        if (id) setSelectedOrderId(id);
        break;
      case 'assistant':
      case 'ai_assistant':
        path = '/assistant';
        break;
      case 'knowledge':
        path = '/knowledge';
        break;
      case 'audit':
        path = '/audit';
        break;
      case 'company_billing':
      case 'billing':
        path = '/billing';
        break;
      case 'company_settings':
      case 'settings':
        path = '/settings';
        break;

      // Supplier portal routes
      case 'supplier_dashboard':
      case 'supplier_portal':
        path = '/supplier/dashboard';
        break;
      case 'opportunities':
        path = '/supplier/opportunities';
        break;
      case 'supplier_inventory':
        path = '/supplier/inventory';
        break;
      case 'supplier_offers':
        path = '/supplier/offers';
        break;
      case 'supplier_orders':
        path = '/supplier/orders';
        break;
      case 'supplier_profile':
        path = '/supplier/profile';
        break;
      case 'supplier_assistant':
        path = '/supplier/assistant';
        break;
      case 'supplier_settings':
        path = '/supplier/settings';
        break;

      // Admin console routes
      case 'admin':
      case 'admin_overview':
        path = '/admin/overview';
        break;
      case 'admin_tenants':
        path = '/admin/tenants';
        break;
      case 'admin_suppliers':
        path = '/admin/suppliers';
        break;
      case 'admin_users':
        path = '/admin/users';
        break;
      case 'admin_subscriptions':
        path = '/admin/subscriptions';
        break;
      case 'admin_revenue':
        path = '/admin/revenue';
        break;
      case 'admin_services':
        path = '/admin/services';
        break;
      case 'admin_ai_modules':
        path = '/admin/ai-modules';
        break;
      case 'admin_rfqs':
        path = '/admin/rfqs';
        break;
      case 'admin_health':
        path = '/admin/health';
        break;
      case 'admin_ai_config':
        path = '/admin/ai-config';
        break;
      case 'admin_audit':
        path = '/admin/audit';
        break;
      default:
        if (view.startsWith('admin_')) {
          path = `/admin/${view.replace('admin_', '').replace('_', '-')}`;
        }
        break;
    }

    router.navigate(path);
  };

  const selectedMaterial = materials.find((m) => m.id === selectedMaterialId);

  // 1. Landing Page View
  if (activeView === 'landing') {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 antialiased font-sans">
        <LandingPage
          onEnterDemo={(roleUserId) => {
            if (roleUserId) {
              store.setCurrentUser(roleUserId);
            }
            const user = store.getCurrentUser();
            if (user.role === 'NEXORA_SUPER_ADMIN') {
              handleNavigate('admin_overview');
            } else if (user.role === 'SUPPLIER_ADMIN' || user.role === 'SUPPLIER_USER') {
              handleNavigate('supplier_dashboard');
            } else {
              handleNavigate('dashboard');
            }
          }}
          onOpenDemoGuide={() => {
            handleNavigate('dashboard');
            setIsDemoModalOpen(true);
          }}
        />
        <GuidedDemoModal
          isOpen={isDemoModalOpen}
          onClose={() => setIsDemoModalOpen(false)}
          onNavigate={(view, id) => {
            handleNavigate(view, id);
            setIsDemoModalOpen(false);
          }}
        />
      </div>
    );
  }

  // 2. Active Application Workspace (Company, Supplier, or NEXORA Admin Console)
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070e1a] text-slate-900 dark:text-slate-100 flex flex-col antialiased font-sans selection:bg-[#0878C9] selection:text-white transition-colors">
      {/* Top Application Header with Real History Back/Forward & Clickable Breadcrumbs */}
      <Header
        onOpenSearch={() => handleNavigate('materials')}
        onOpenDemoGuide={() => setIsDemoModalOpen(true)}
        onNavigate={handleNavigate}
        onBack={() => router.back()}
        onForward={() => router.forward()}
        canGoBack={routeState.canGoBack}
        canGoForward={routeState.canGoForward}
        breadcrumbs={routeState.breadcrumbs}
        pageTitle={routeState.title}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main Workspace with Sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Role-Specific Sidebar */}
        <Sidebar
          currentView={activeView}
          onNavigate={(v) => handleNavigate(v)}
          onOpenDemoGuide={() => setIsDemoModalOpen(true)}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Dynamic Center Workspace */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-100/60 dark:bg-[#070e1a]">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* 404 Route Handler */}
            {routeState.isNotFound && (
              <NotFoundView
                attemptedPath={routeState.path}
                onNavigateHome={() => handleNavigate('dashboard')}
              />
            )}

            {/* A. COMPANY WORKSPACE VIEWS */}
            {activeView === 'dashboard' && (
              <OrganizationDashboard
                onNavigate={handleNavigate}
                onOpenMaterialModal={(mat) => handleOpenMaterialModal(mat.id)}
                onOpenRecordUsageModal={(matId) => {
                  if (matId) setSelectedMaterialId(matId);
                  handleNavigate('inventory');
                }}
                onOpenProcureModal={(matId) => {
                  if (matId) setSelectedMaterialId(matId);
                  handleNavigate('procurement');
                }}
                onOpenWhatIf={handleOpenWhatIf}
              />
            )}

            {activeView === 'materials' && (
              <MaterialsView
                onSelectMaterial={(mat) => handleOpenMaterialModal(mat.id)}
                onOpenRecordUsage={(matId) => {
                  if (matId) setSelectedMaterialId(matId);
                  handleNavigate('inventory');
                }}
                onOpenWhatIf={handleOpenWhatIf}
                onOpenProcure={(matId) => handleOpenProcure(matId || materials[0]?.id)}
              />
            )}

            {activeView === 'inventory' && (
              <InventoryView
                initialMaterialId={selectedMaterialId || undefined}
                onOpenWhatIf={handleOpenWhatIf}
              />
            )}

            {activeView === 'facilities' && (
              <FacilitiesDashboard />
            )}

            {activeView === 'warehouses' && (
              <WarehouseDashboard />
            )}

            {activeView === 'equipment' && (
              <EquipmentDashboard />
            )}

            {activeView === 'maintenance' && (
              <MaintenanceView
                onOpenMaterialModal={handleOpenMaterialModal}
                onOpenWhatIf={handleOpenWhatIf}
              />
            )}

            {activeView === 'intelligence' && (
              <AIIntelligenceView
                onOpenWhatIf={handleOpenWhatIf}
                onOpenMaterialModal={handleOpenMaterialModal}
                onOpenProcure={handleOpenProcure}
              />
            )}

            {activeView === 'whatif' && (
              <WhatIfSimulator
                initialMaterialId={selectedMaterialId || undefined}
                onOpenProcure={handleOpenProcure}
              />
            )}

            {activeView === 'procurement' && (
              <ProcurementView
                initialRequestId={selectedPRId}
                onOpenOrder={handleOpenOrder}
              />
            )}

            {activeView === 'suppliers' && (
              <SupplierDirectory />
            )}

            {activeView === 'orders' && (
              <OrdersView
                initialOrderId={selectedOrderId}
                onOpenMaterialModal={handleOpenMaterialModal}
              />
            )}

            {(activeView === 'assistant' || activeView === 'ai_assistant') && (
              <AIAssistantView
                onNavigate={handleNavigate}
              />
            )}

            {activeView === 'knowledge' && (
              <CompanyKnowledgeView />
            )}

            {activeView === 'audit' && (
              <AuditLogView />
            )}

            {activeView === 'company_billing' && (
              <CompanyBillingView />
            )}

            {activeView === 'company_settings' && (
              <div className="bg-white dark:bg-[#0B243D] p-6 rounded-2xl border border-slate-200 dark:border-[#1D4968] shadow-sm space-y-4">
                <h2 className="text-base font-bold text-[#061A2E] dark:text-white">
                  Tenant Workspace Settings &amp; Risk Parameters
                </h2>
                <p className="text-xs text-slate-500">
                  Configure autonomous safety stock thresholds, lead-time variance allowances, and notification webhooks.
                </p>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#061A2E] border border-slate-200 dark:border-slate-800 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Safety Stock Buffer Threshold:</span>
                  <span className="ml-2 font-mono text-[#0878C9] font-bold">14 Days Standard</span>
                </div>
              </div>
            )}

            {/* B. SUPPLIER WORKSPACE VIEWS */}
            {(activeView === 'supplier_portal' ||
              activeView === 'supplier_dashboard' ||
              activeView === 'opportunities' ||
              activeView === 'supplier_inventory' ||
              activeView === 'supplier_offers' ||
              activeView === 'supplier_orders' ||
              activeView === 'supplier_profile' ||
              activeView === 'supplier_assistant' ||
              activeView === 'supplier_settings') && (
              <SupplierPortal
                initialTab={activeView}
                onNavigate={handleNavigate}
              />
            )}

            {/* C. NEXORA ADMIN CONSOLE (NEXORA CONTROL CENTER) */}
            {(activeView === 'admin' ||
              activeView.startsWith('admin_')) && (
              <SuperAdminView
                initialTab={activeView}
                onNavigate={handleNavigate}
              />
            )}
          </div>
        </main>
      </div>

      {/* Floating Omnipresent Nexora AI Button */}
      {activeView !== 'assistant' && activeView !== 'ai_assistant' && (
        <button
          onClick={() => handleNavigate('assistant')}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-[#0878C9] to-[#35C759] hover:from-[#0661a3] hover:to-[#289e58] text-white font-bold text-xs shadow-2xl shadow-sky-500/30 hover:scale-105 active:scale-95 transition-all duration-200 border border-white/20 cursor-pointer group"
          title="Open Nexora Autonomous AI"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#35C759] rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#35C759] rounded-full" />
          </div>
          <span className="font-black tracking-wide text-white">Nexora AI</span>
        </button>
      )}

      {/* Global Material Detail Inspection Modal */}
      {selectedMaterial && (
        <MaterialDetailModal
          material={selectedMaterial}
          onClose={() => setSelectedMaterialId(null)}
          onOpenRecordUsage={(id) => {
            setSelectedMaterialId(id);
            handleNavigate('inventory');
          }}
          onOpenAddStock={(id) => {
            setSelectedMaterialId(id);
            handleNavigate('inventory');
          }}
          onOpenTransferStock={(id) => {
            setSelectedMaterialId(id);
            handleNavigate('inventory');
          }}
          onOpenWhatIf={(id) => {
            handleOpenWhatIf(id);
          }}
          onOpenProcure={(id) => {
            handleOpenProcure(id);
          }}
        />
      )}

      {/* 22-Step Interactive Walkthrough Modal */}
      <GuidedDemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onNavigate={(view, id) => {
          handleNavigate(view, id);
        }}
      />
    </div>
  );
};

export default App;
