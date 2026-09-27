export interface BreadcrumbItem {
  label: string;
  path?: string;
  active?: boolean;
}

export interface RouteState {
  path: string;
  view: string;
  params: Record<string, string>;
  title: string;
  breadcrumbs: BreadcrumbItem[];
  canGoBack: boolean;
  canGoForward: boolean;
  isNotFound?: boolean;
}

type RouteListener = (state: RouteState) => void;

class Router {
  private listeners: Set<RouteListener> = new Set();
  private historyIndex = 0;
  private maxHistoryIndex = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      // Initialize state in window.history if not present
      if (!window.history.state || typeof window.history.state.historyIndex !== 'number') {
        window.history.replaceState({ historyIndex: 0 }, '', window.location.pathname);
      } else {
        this.historyIndex = window.history.state.historyIndex;
        this.maxHistoryIndex = Math.max(this.historyIndex, Number(sessionStorage.getItem('nexora_max_history') || 0));
      }

      window.addEventListener('popstate', (e) => {
        if (e.state && typeof e.state.historyIndex === 'number') {
          this.historyIndex = e.state.historyIndex;
        } else {
          // Fallback if browser popped to state without index
          this.historyIndex = Math.max(0, this.historyIndex - 1);
        }
        this.notify();
      });
    }
  }

  public subscribe(cb: RouteListener): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    const state = this.getCurrentRoute();
    this.listeners.forEach((cb) => cb(state));
  }

  public navigate(path: string, options?: { replace?: boolean }) {
    if (typeof window === 'undefined') return;

    if (window.location.pathname === path) return;

    if (options?.replace) {
      window.history.replaceState({ historyIndex: this.historyIndex }, '', path);
    } else {
      this.historyIndex += 1;
      this.maxHistoryIndex = this.historyIndex;
      sessionStorage.setItem('nexora_max_history', String(this.maxHistoryIndex));
      window.history.pushState({ historyIndex: this.historyIndex }, '', path);
    }

    this.notify();
  }

  public back() {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }

  public forward() {
    if (typeof window !== 'undefined') {
      window.history.forward();
    }
  }

  public getCurrentRoute(): RouteState {
    if (typeof window === 'undefined') {
      return {
        path: '/',
        view: 'landing',
        params: {},
        title: 'NEXORA O&G',
        breadcrumbs: [{ label: 'Home', active: true }],
        canGoBack: false,
        canGoForward: false,
      };
    }

    const path = window.location.pathname;
    const canGoBack = this.historyIndex > 0;
    const canGoForward = this.historyIndex < this.maxHistoryIndex;

    // Parse route patterns
    const segments = path.split('/').filter(Boolean);

    // Root or landing
    if (segments.length === 0 || segments[0] === 'landing') {
      return {
        path: path || '/',
        view: 'landing',
        params: {},
        title: 'NEXORA O&G — Critical Materials & Procurement Intelligence',
        breadcrumbs: [{ label: 'Platform Home', active: true }],
        canGoBack,
        canGoForward,
      };
    }

    const first = segments[0].toLowerCase();
    const second = segments[1];

    // ==========================================
    // 1. COMPANY WORKSPACE ROUTES
    // ==========================================
    if (first === 'dashboard') {
      return {
        path,
        view: 'dashboard',
        params: {},
        title: 'Executive Operations Briefing & Dashboard',
        breadcrumbs: [
          { label: 'Company Workspace', path: '/dashboard' },
          { label: 'Executive Operations Briefing', active: true },
        ],
        canGoBack,
        canGoForward,
      };
    }

    if (first === 'materials') {
      if (second) {
        return {
          path,
          view: 'materials',
          params: { materialId: second },
          title: `Material Registry — ${second}`,
          breadcrumbs: [
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'Materials Registry', path: '/materials' },
            { label: `Material ${second}`, active: true },
          ],
          canGoBack,
          canGoForward,
        };
      }
      return {
        path,
        view: 'materials',
        params: {},
        title: 'Critical Materials Registry & Surveillance',
        breadcrumbs: [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Materials Registry', active: true },
        ],
        canGoBack,
        canGoForward,
      };
    }

    if (first === 'inventory') {
      return {
        path,
        view: 'inventory',
        params: second ? { materialId: second } : {},
        title: 'Inventory Engine & Valuations',
        breadcrumbs: [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Inventory Engine', active: true },
        ],
        canGoBack,
        canGoForward,
      };
    }

    if (first === 'facilities') {
      return {
        path,
        view: 'facilities',
        params: second ? { facilityId: second } : {},
        title: 'Operational Facilities & Plants',
        breadcrumbs: [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Facilities', active: true },
        ],
        canGoBack,
        canGoForward,
      };
    }

    if (first === 'warehouses') {
      return {
        path,
        view: 'warehouses',
        params: second ? { warehouseId: second } : {},
        title: 'Warehouse & Spares Depots',
        breadcrumbs: [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Warehouses', active: true },
        ],
        canGoBack,
        canGoForward,
      };
    }

    if (first === 'equipment') {
      return {
        path,
        view: 'equipment',
        params: second ? { equipmentId: second } : {},
        title: 'Critical Rotating & Static Equipment',
        breadcrumbs: [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Equipment Registry', active: true },
        ],
        canGoBack,
        canGoForward,
      };
    }

    if (first === 'maintenance') {
      return {
        path,
        view: 'maintenance',
        params: {},
        title: 'Maintenance Readiness & Spares Schedule',
        breadcrumbs: [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Maintenance & Readiness', active: true },
        ],
        canGoBack,
        canGoForward,
      };
    }

    if (first === 'intelligence') {
      return {
        path,
        view: 'intelligence',
        params: {},
        title: 'Predictive Material Risk & AI Intelligence',
        breadcrumbs: [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'AI Intelligence', active: true },
        ],
        canGoBack,
        canGoForward,
      };
    }

    if (first === 'whatif') {
      return {
        path,
        view: 'whatif',
        params: second ? { materialId: second } : {},
        title: 'What-If Supply Chain Shock Simulator',
        breadcrumbs: [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'What-If Simulator', active: true },
        ],
        canGoBack,
        canGoForward,
      };
    }

    if (first === 'procurement') {
      return {
        path,
        view: 'procurement',
        params: second ? { requestId: second } : {},
        title: 'Procurement & Fast-Track Matching',
        breadcrumbs: [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Procurement & Matching', active: true },
        ],
        canGoBack,
        canGoForward,
      };
    }

    if (first === 'suppliers') {
      return {
        path,
        view: 'suppliers',
        params: second ? { supplierId: second } : {},
        title: 'Qualified Oil & Gas Supplier Network',
        breadcrumbs: [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Supplier Directory', active: true },
        ],
        canGoBack,
        canGoForward,
      };
    }

    if (first === 'orders') {
      return {
        path,
        view: 'orders',
        params: second ? { orderId: second } : {},
        title: 'Active Purchase Orders & Logistics',
        breadcrumbs: [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Orders & Deliveries', active: true },
        ],
        canGoBack,
        canGoForward,
      };
    }

    if (first === 'assistant' || first === 'ai') {
      return {
        path,
        view: 'assistant',
        params: {},
        title: 'NEXORA Autonomous AI Operations Assistant',
        breadcrumbs: [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'AI Assistant', active: true },
        ],
        canGoBack,
        canGoForward,
      };
    }

    if (first === 'knowledge') {
      return {
        path,
        view: 'knowledge',
        params: {},
        title: 'Company Operational Knowledge & Policy Base',
        breadcrumbs: [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Company Knowledge', active: true },
        ],
        canGoBack,
        canGoForward,
      };
    }

    if (first === 'audit') {
      return {
        path,
        view: 'audit',
        params: {},
        title: 'Enterprise Audit Trail & Immutable Log',
        breadcrumbs: [
          { label: 'Dashboard', path: '/dashboard' },
          { label: 'Audit Trail', active: true },
        ],
        canGoBack,
        canGoForward,
      };
    }

    if (first === 'billing' || (first === 'company' && second === 'billing')) {
      return {
        path,
        view: 'company_billing',
        params: {},
        title: 'Company Subscription & Plan Entitlements',
        breadcrumbs: [
          { label: 'Company Workspace', path: '/dashboard' },
          { label: 'Subscription & Billing', active: true },
        ],
        canGoBack,
        canGoForward,
      };
    }

    if (first === 'settings' || (first === 'company' && second === 'settings')) {
      return {
        path,
        view: 'company_settings',
        params: {},
        title: 'Workspace Settings & Risk Rules',
        breadcrumbs: [
          { label: 'Company Workspace', path: '/dashboard' },
          { label: 'Settings & Risk Rules', active: true },
        ],
        canGoBack,
        canGoForward,
      };
    }

    // ==========================================
    // 2. SUPPLIER WORKSPACE ROUTES
    // ==========================================
    if (first === 'supplier') {
      const sub = second || 'dashboard';
      const titles: Record<string, string> = {
        dashboard: 'Supplier Command Center',
        opportunities: 'Tender Opportunities & Live RFQs',
        inventory: 'Supplier Spares Catalogue & Stock',
        offers: 'Submitted Quotations & Bids',
        orders: 'Active Buyer POs & Logistics Dispatch',
        profile: 'Company Profile & NSD Qualification',
        assistant: 'Supplier AI Operations Copilot',
        settings: 'Supplier Account & Notification Settings',
      };

      const views: Record<string, string> = {
        dashboard: 'supplier_dashboard',
        opportunities: 'opportunities',
        inventory: 'supplier_inventory',
        offers: 'supplier_offers',
        orders: 'supplier_orders',
        profile: 'supplier_profile',
        assistant: 'supplier_assistant',
        settings: 'supplier_settings',
      };

      return {
        path,
        view: views[sub] || 'supplier_dashboard',
        params: { tab: sub },
        title: titles[sub] || 'Supplier Workspace',
        breadcrumbs: [
          { label: 'Supplier Workspace', path: '/supplier/dashboard' },
          { label: titles[sub] || sub, active: true },
        ],
        canGoBack,
        canGoForward,
      };
    }

    // ==========================================
    // 3. NEXORA ADMIN CONSOLE ROUTES
    // ==========================================
    if (first === 'admin') {
      const sub = second || 'overview';
      const titles: Record<string, string> = {
        overview: 'Platform Ecosystem Overview',
        tenants: 'Company Tenants & Customer Accounts',
        suppliers: 'Supplier Network & NSD Qualifications',
        users: 'Platform Identity Directory',
        subscriptions: 'Subscription Plans & Entitlement Matrix',
        billing: 'Platform Billing & Invoices',
        revenue: 'SaaS Revenue & MRR Growth Dashboard',
        services: 'Implementation & Professional Onboarding Services',
        'ai-modules': 'Premium AI Intelligence Capabilities',
        rfqs: 'Global Tender & Procurement Activity',
        analytics: 'Cross-Tenant Supply Chain Analytics',
        health: 'Platform System Health & Engine Telemetry',
        'ai-config': 'Gemini 3.8 AI Engine Configuration & Diagnostics',
        audit: 'Global Platform Audit Logs',
        settings: 'Platform Configuration & Master Controls',
      };

      return {
        path,
        view: `admin_${sub.replace('-', '_')}`,
        params: { section: sub },
        title: `NEXORA Control Center — ${titles[sub] || 'Admin'}`,
        breadcrumbs: [
          { label: 'NEXORA Control Center', path: '/admin/overview' },
          { label: titles[sub] || sub, active: true },
        ],
        canGoBack,
        canGoForward,
      };
    }

    // ==========================================
    // 4. NOT FOUND ROUTE (404)
    // ==========================================
    return {
      path,
      view: '404',
      params: {},
      title: 'Page Not Found — 404',
      breadcrumbs: [
        { label: 'NEXORA O&G', path: '/dashboard' },
        { label: '404 Not Found', active: true },
      ],
      canGoBack,
      canGoForward,
      isNotFound: true,
    };
  }
}

export const router = new Router();
