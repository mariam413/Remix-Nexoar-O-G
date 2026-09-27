import {
  Organization,
  User,
  UserRole,
  Facility,
  FacilityMaintenanceTask,
  FacilityInspection,
  Warehouse,
  Equipment,
  EquipmentMaintenanceRecord,
  OilGasCompany,
  SupplierInvoice,
  Material,
  MaintenanceRequirement,
  Supplier,
  SupplierInventoryItem,
  ProcurementRequest,
  Offer,
  Order,
  InventoryTransaction,
  Notification,
  AuditLog,
  KnowledgeItem,
  RiskLevel,
  AIRecommendation,
  TransactionType,
  SubscriptionPlan,
  SubscriptionPlanDetails,
  TenantInvoice,
  ImplementationService,
  AIModuleConfig,
  PlatformRevenueMetrics,
} from '../types';
import {
  SEED_ORGANIZATIONS,
  SEED_USERS,
  SEED_FACILITIES,
  SEED_WAREHOUSES,
  SEED_EQUIPMENT,
  SEED_MATERIALS,
  SEED_MAINTENANCE,
  SEED_FACILITY_MAINTENANCE,
  SEED_FACILITY_INSPECTIONS,
  SEED_EQUIPMENT_MAINTENANCE_RECORDS,
  SEED_OIL_GAS_COMPANIES,
  SEED_SUPPLIER_INVOICES,
  SEED_SUPPLIERS,
  SEED_SUPPLIER_INVENTORY,
  SEED_PROCUREMENT_REQUESTS,
  SEED_OFFERS,
  SEED_ORDERS,
  SEED_TRANSACTIONS,
  SEED_NOTIFICATIONS,
  SEED_AUDIT_LOGS,
  SEED_KNOWLEDGE_ITEMS,
  SEED_SUBSCRIPTION_PLANS,
  SEED_TENANT_INVOICES,
  SEED_IMPLEMENTATION_SERVICES,
  SEED_AI_MODULES,
  SEED_REVENUE_METRICS,
} from '../data/seedData';
import { calculateDeterministicRisk, evaluateMaintenanceReadiness } from './riskEngine';

const STORAGE_KEY = 'nexora_og_applet_state_v1';

export interface AppState {
  currentOrganizationId: string;
  currentUserId: string;
  organizations: Organization[];
  users: User[];
  facilities: Facility[];
  warehouses: Warehouse[];
  equipment: Equipment[];
  materials: Material[];
  maintenance: MaintenanceRequirement[];
  facilityMaintenance: FacilityMaintenanceTask[];
  facilityInspections: FacilityInspection[];
  equipmentMaintenanceRecords: EquipmentMaintenanceRecord[];
  oilGasCompanies: OilGasCompany[];
  supplierInvoices: SupplierInvoice[];
  suppliers: Supplier[];
  supplierInventory: SupplierInventoryItem[];
  procurementRequests: ProcurementRequest[];
  offers: Offer[];
  orders: Order[];
  transactions: InventoryTransaction[];
  notifications: Notification[];
  auditLogs: AuditLog[];
  knowledge: KnowledgeItem[];
  theme?: 'light' | 'dark';
  subscriptionPlans: SubscriptionPlanDetails[];
  tenantInvoices: TenantInvoice[];
  implementationServices: ImplementationService[];
  aiModules: AIModuleConfig[];
  revenueMetrics: PlatformRevenueMetrics;
}

function getInitialState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        theme: parsed.theme || 'light',
        currentOrganizationId: parsed.currentOrganizationId || 'org-demo-oil-gas',
        currentUserId: parsed.currentUserId || 'user-org-admin',
        organizations: parsed.organizations || SEED_ORGANIZATIONS,
        users: parsed.users || SEED_USERS,
        facilities: parsed.facilities && parsed.facilities.length >= 7 ? parsed.facilities : SEED_FACILITIES,
        warehouses: parsed.warehouses && parsed.warehouses.length >= 5 ? parsed.warehouses : SEED_WAREHOUSES,
        equipment: parsed.equipment && parsed.equipment.length >= 10 ? parsed.equipment : SEED_EQUIPMENT,
        materials: parsed.materials || SEED_MATERIALS,
        maintenance: parsed.maintenance || SEED_MAINTENANCE,
        facilityMaintenance: parsed.facilityMaintenance || SEED_FACILITY_MAINTENANCE,
        facilityInspections: parsed.facilityInspections || SEED_FACILITY_INSPECTIONS,
        equipmentMaintenanceRecords: parsed.equipmentMaintenanceRecords || SEED_EQUIPMENT_MAINTENANCE_RECORDS,
        oilGasCompanies: parsed.oilGasCompanies || SEED_OIL_GAS_COMPANIES,
        supplierInvoices: parsed.supplierInvoices || SEED_SUPPLIER_INVOICES,
        suppliers: parsed.suppliers || SEED_SUPPLIERS,
        supplierInventory: parsed.supplierInventory || SEED_SUPPLIER_INVENTORY,
        procurementRequests: parsed.procurementRequests || SEED_PROCUREMENT_REQUESTS,
        offers: parsed.offers || SEED_OFFERS,
        orders: parsed.orders || SEED_ORDERS,
        transactions: parsed.transactions || SEED_TRANSACTIONS,
        notifications: parsed.notifications || SEED_NOTIFICATIONS,
        auditLogs: parsed.auditLogs || SEED_AUDIT_LOGS,
        knowledge: parsed.knowledge || SEED_KNOWLEDGE_ITEMS,
        subscriptionPlans: parsed.subscriptionPlans || SEED_SUBSCRIPTION_PLANS,
        tenantInvoices: parsed.tenantInvoices || SEED_TENANT_INVOICES,
        implementationServices: parsed.implementationServices || SEED_IMPLEMENTATION_SERVICES,
        aiModules: parsed.aiModules || SEED_AI_MODULES,
        revenueMetrics: parsed.revenueMetrics || SEED_REVENUE_METRICS,
      };
    }
  } catch (e) {
    console.warn('Failed to load state from localStorage, using seed data:', e);
  }

  return {
    currentOrganizationId: 'org-demo-oil-gas',
    currentUserId: 'user-org-admin',
    organizations: SEED_ORGANIZATIONS,
    users: SEED_USERS,
    facilities: SEED_FACILITIES,
    warehouses: SEED_WAREHOUSES,
    equipment: SEED_EQUIPMENT,
    materials: SEED_MATERIALS,
    maintenance: SEED_MAINTENANCE,
    facilityMaintenance: SEED_FACILITY_MAINTENANCE,
    facilityInspections: SEED_FACILITY_INSPECTIONS,
    equipmentMaintenanceRecords: SEED_EQUIPMENT_MAINTENANCE_RECORDS,
    oilGasCompanies: SEED_OIL_GAS_COMPANIES,
    supplierInvoices: SEED_SUPPLIER_INVOICES,
    suppliers: SEED_SUPPLIERS,
    supplierInventory: SEED_SUPPLIER_INVENTORY,
    procurementRequests: SEED_PROCUREMENT_REQUESTS,
    offers: SEED_OFFERS,
    orders: SEED_ORDERS,
    transactions: SEED_TRANSACTIONS,
    notifications: SEED_NOTIFICATIONS,
    auditLogs: SEED_AUDIT_LOGS,
    knowledge: SEED_KNOWLEDGE_ITEMS,
    theme: 'light',
    subscriptionPlans: SEED_SUBSCRIPTION_PLANS,
    tenantInvoices: SEED_TENANT_INVOICES,
    implementationServices: SEED_IMPLEMENTATION_SERVICES,
    aiModules: SEED_AI_MODULES,
    revenueMetrics: SEED_REVENUE_METRICS,
  };
}

class Store {
  private state: AppState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = getInitialState();
    this.recalculateAllRisks();
    this.applyThemeToDOM();
  }

  public getTheme(): 'light' | 'dark' {
    return this.state.theme || 'light';
  }

  public setTheme(theme: 'light' | 'dark') {
    this.state.theme = theme;
    this.applyThemeToDOM();
    this.persist();
  }

  public toggleTheme(): 'light' | 'dark' {
    const next = this.getTheme() === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  }

  public applyThemeToDOM() {
    if (typeof document !== 'undefined') {
      const theme = this.getTheme();
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
        document.documentElement.setAttribute('data-theme', 'light');
      }
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to persist state:', e);
    }
    this.notify();
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public subscribe(cb: () => void) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  public getState(): AppState {
    return this.state;
  }

  public resetToSeed() {
    localStorage.removeItem(STORAGE_KEY);
    this.state = {
      currentOrganizationId: 'org-demo-oil-gas',
      currentUserId: 'user-org-admin',
      organizations: SEED_ORGANIZATIONS,
      users: SEED_USERS,
      facilities: SEED_FACILITIES,
      warehouses: SEED_WAREHOUSES,
      equipment: SEED_EQUIPMENT,
      materials: SEED_MATERIALS,
      maintenance: SEED_MAINTENANCE,
      facilityMaintenance: SEED_FACILITY_MAINTENANCE,
      facilityInspections: SEED_FACILITY_INSPECTIONS,
      equipmentMaintenanceRecords: SEED_EQUIPMENT_MAINTENANCE_RECORDS,
      oilGasCompanies: SEED_OIL_GAS_COMPANIES,
      supplierInvoices: SEED_SUPPLIER_INVOICES,
      suppliers: SEED_SUPPLIERS,
      supplierInventory: SEED_SUPPLIER_INVENTORY,
      procurementRequests: SEED_PROCUREMENT_REQUESTS,
      offers: SEED_OFFERS,
      orders: SEED_ORDERS,
      transactions: SEED_TRANSACTIONS,
      notifications: SEED_NOTIFICATIONS,
      auditLogs: SEED_AUDIT_LOGS,
      knowledge: SEED_KNOWLEDGE_ITEMS,
      theme: 'light',
      subscriptionPlans: SEED_SUBSCRIPTION_PLANS,
      tenantInvoices: SEED_TENANT_INVOICES,
      implementationServices: SEED_IMPLEMENTATION_SERVICES,
      aiModules: SEED_AI_MODULES,
      revenueMetrics: SEED_REVENUE_METRICS,
    };
    this.recalculateAllRisks();
    this.applyThemeToDOM();
    this.persist();
  }

  // Active Context
  public getCurrentUser(): User {
    const user = this.state.users.find((u) => u.id === this.state.currentUserId);
    return (
      user ||
      this.state.users[0] || {
        id: 'user-org-admin',
        name: 'Sarah Nalwanga',
        email: 'sarah.admin@demooilgas.internal',
        role: 'ORGANIZATION_ADMIN',
        organizationId: 'org-demo-oil-gas',
        organizationName: 'Demo Oil & Gas Company',
        status: 'ACTIVE',
      }
    );
  }

  public getCurrentOrganization(): Organization {
    const org = this.state.organizations.find((o) => o.id === this.state.currentOrganizationId);
    return org || this.state.organizations[0];
  }

  public setCurrentUser(userId: string) {
    const user = this.state.users.find((u) => u.id === userId);
    if (user) {
      this.state.currentUserId = user.id;
      this.state.currentOrganizationId = user.organizationId;
      this.persist();
    }
  }

  public setCurrentOrganization(orgId: string) {
    this.state.currentOrganizationId = orgId;
    // Find an appropriate user in that organization
    const matchingUser = this.state.users.find((u) => u.organizationId === orgId);
    if (matchingUser) {
      this.state.currentUserId = matchingUser.id;
    }
    this.persist();
  }

  // ==========================================
  // MULTI-TENANT SAAS & SUBSCRIPTION MANAGEMENT
  // ==========================================
  public getSubscriptionPlans(): SubscriptionPlanDetails[] {
    return this.state.subscriptionPlans || SEED_SUBSCRIPTION_PLANS;
  }

  public getSubscriptionPlan(plan: SubscriptionPlan): SubscriptionPlanDetails | undefined {
    return (this.state.subscriptionPlans || SEED_SUBSCRIPTION_PLANS).find((p) => p.id === plan);
  }

  public getTenants(): Organization[] {
    return this.state.organizations;
  }

  public getTenant(id: string): Organization | undefined {
    return this.state.organizations.find((o) => o.id === id);
  }

  public updateTenant(id: string, updates: Partial<Organization>) {
    this.state.organizations = this.state.organizations.map((org) =>
      org.id === id ? { ...org, ...updates } : org
    );
    this.persist();
  }

  public updateTenantPlan(tenantId: string, plan: SubscriptionPlan, billingCycle?: 'Monthly' | 'Annual') {
    const planDetail = this.getSubscriptionPlan(plan);
    const mrr = planDetail ? (billingCycle === 'Annual' ? Math.round(planDetail.annualPriceUSD / 12) : planDetail.monthlyPriceUSD) : 0;
    
    this.updateTenant(tenantId, {
      subscriptionPlan: plan,
      billingCycle: billingCycle || 'Monthly',
      mrrUSD: mrr,
    });
    this.addAuditLog({
      action: 'UPGRADE_SUBSCRIPTION',
      entityType: 'Organization',
      entityId: tenantId,
      newValue: `Plan updated to ${plan}`,
    });
  }

  public updateTenantStatus(tenantId: string, status: 'Active' | 'Trial' | 'Suspended' | 'Pending' | 'Expired') {
    this.updateTenant(tenantId, { subscriptionStatus: status });
    this.addAuditLog({
      action: 'UPDATE_TENANT_STATUS',
      entityType: 'Organization',
      entityId: tenantId,
      newValue: `Tenant status changed to ${status}`,
    });
  }

  public getTenantInvoices(orgId?: string): TenantInvoice[] {
    const invoices = this.state.tenantInvoices || SEED_TENANT_INVOICES;
    if (orgId) {
      return invoices.filter((inv) => inv.organizationId === orgId);
    }
    return invoices;
  }

  public getImplementationServices(): ImplementationService[] {
    return this.state.implementationServices || SEED_IMPLEMENTATION_SERVICES;
  }

  public getAIModules(): AIModuleConfig[] {
    return this.state.aiModules || SEED_AI_MODULES;
  }

  public toggleAIModule(moduleId: string, enabled: boolean) {
    this.state.aiModules = (this.state.aiModules || SEED_AI_MODULES).map((m) =>
      m.id === moduleId ? { ...m, isEnabledGlobally: enabled } : m
    );
    this.persist();
  }

  public getPlatformRevenue(): PlatformRevenueMetrics {
    // Dynamically calculate MRR and ARR from active organizations
    const orgs = this.state.organizations.filter((o) => o.type === 'OPERATOR');
    const totalMRR = orgs.reduce((sum, o) => sum + (o.mrrUSD || 0), 0);
    const activeSubs = orgs.filter((o) => o.subscriptionStatus === 'Active').length;
    const trials = orgs.filter((o) => o.subscriptionStatus === 'Trial').length;

    return {
      ...(this.state.revenueMetrics || SEED_REVENUE_METRICS),
      mrrUSD: totalMRR > 0 ? totalMRR : 51600,
      arrUSD: totalMRR > 0 ? totalMRR * 12 : 619200,
      activeSubscriptions: activeSubs > 0 ? activeSubs : 4,
      trialAccounts: trials,
      averageRevenuePerTenantUSD: orgs.length > 0 ? Math.round(totalMRR / orgs.length) : 12900,
    };
  }

  // Multi-tenant isolated queries
  public getMaterials(): Material[] {
    const orgId = this.state.currentOrganizationId;
    return this.state.materials.filter((m) => m.organizationId === orgId);
  }

  public getEquipment(): Equipment[] {
    const orgId = this.state.currentOrganizationId;
    return this.state.equipment.filter((e) => e.organizationId === orgId);
  }

  public getFacilities(): Facility[] {
    const orgId = this.state.currentOrganizationId;
    return this.state.facilities.filter((f) => f.organizationId === orgId);
  }

  public getWarehouses(): Warehouse[] {
    const orgId = this.state.currentOrganizationId;
    return this.state.warehouses.filter((w) => w.organizationId === orgId);
  }

  public getMaintenance(): MaintenanceRequirement[] {
    const orgId = this.state.currentOrganizationId;
    return this.state.maintenance.filter((m) => m.organizationId === orgId);
  }

  public getFacilityMaintenance(facilityId?: string): FacilityMaintenanceTask[] {
    const orgId = this.state.currentOrganizationId;
    const tasks = (this.state.facilityMaintenance || []).filter((t) => t.organizationId === orgId);
    if (facilityId) {
      return tasks.filter((t) => t.facilityId === facilityId);
    }
    return tasks;
  }

  public getFacilityInspections(facilityId?: string): FacilityInspection[] {
    const orgId = this.state.currentOrganizationId;
    const inspections = (this.state.facilityInspections || []).filter((i) => i.organizationId === orgId);
    if (facilityId) {
      return inspections.filter((i) => i.facilityId === facilityId);
    }
    return inspections;
  }

  public getEquipmentMaintenanceRecords(equipmentId?: string): EquipmentMaintenanceRecord[] {
    const orgId = this.state.currentOrganizationId;
    const records = (this.state.equipmentMaintenanceRecords || []).filter((r) => r.organizationId === orgId);
    if (equipmentId) {
      return records.filter((r) => r.equipmentId === equipmentId);
    }
    return records;
  }

  public getOilGasCompanies(): OilGasCompany[] {
    return this.state.oilGasCompanies || [];
  }

  public getSupplierInvoices(): SupplierInvoice[] {
    const orgId = this.state.currentOrganizationId;
    return (this.state.supplierInvoices || []).filter((i) => i.organizationId === orgId);
  }

  public getProcurementRequests(): ProcurementRequest[] {
    const orgId = this.state.currentOrganizationId;
    return this.state.procurementRequests.filter((pr) => pr.organizationId === orgId);
  }

  public getOrders(): Order[] {
    const orgId = this.state.currentOrganizationId;
    return this.state.orders.filter((o) => o.organizationId === orgId);
  }

  public getTransactions(): InventoryTransaction[] {
    const orgId = this.state.currentOrganizationId;
    return this.state.transactions.filter((tx) => tx.organizationId === orgId);
  }

  public getNotifications(): Notification[] {
    const orgId = this.state.currentOrganizationId;
    return this.state.notifications.filter(
      (n) => n.organizationId === orgId || n.organizationId === 'all'
    );
  }

  public getAuditLogs(): AuditLog[] {
    const orgId = this.state.currentOrganizationId;
    return this.state.auditLogs.filter((a) => a.organizationId === orgId);
  }

  public getKnowledge(): KnowledgeItem[] {
    const orgId = this.state.currentOrganizationId;
    return this.state.knowledge.filter((k) => k.organizationId === orgId);
  }

  // Suppliers are directory-level but confidential offers are isolated
  public getSuppliers(): Supplier[] {
    return this.state.suppliers;
  }

  // Recalculate deterministic risk for materials & readiness for maintenance
  public recalculateAllRisks() {
    const user = this.getCurrentUser();
    const orgId = user.organizationId;
    const maintenance = this.state.maintenance.filter((m) => m.organizationId === orgId);
    const suppliers = this.state.suppliers;

    this.state.materials = this.state.materials.map((mat) => {
      if (mat.organizationId !== orgId) return mat;
      const calc = calculateDeterministicRisk(mat, maintenance, suppliers);
      return {
        ...mat,
        availableStock: calc.availableStock,
        calculatedRisk: calc.riskLevel,
        recommendation: calc.recommendation,
        updatedAt: new Date().toISOString(),
      };
    });

    this.state.maintenance = this.state.maintenance.map((maint) => {
      if (maint.organizationId !== orgId) return maint;
      const mat = this.state.materials.find((m) => m.id === maint.materialId);
      const evalRes = evaluateMaintenanceReadiness(maint, mat, suppliers);
      return {
        ...maint,
        calculatedReadiness: evalRes.status,
        shortfall: evalRes.shortfall,
      };
    });
  }

  // Inventory Actions
  public recordMaterialUsage(params: {
    materialId: string;
    quantityUsed: number;
    reason: string;
    equipmentId?: string;
    workOrder?: string;
    notes?: string;
  }): { success: boolean; error?: string } {
    const user = this.getCurrentUser();
    const matIndex = this.state.materials.findIndex((m) => m.id === params.materialId);
    if (matIndex === -1) {
      return { success: false, error: 'Material not found.' };
    }

    const material = this.state.materials[matIndex];
    if (params.quantityUsed <= 0) {
      return { success: false, error: 'Quantity used must be greater than zero.' };
    }

    if (material.currentStock < params.quantityUsed) {
      return {
        success: false,
        error: `Insufficient stock. Current stock is ${material.currentStock} ${material.unitOfMeasurement}.`,
      };
    }

    const previousQuantity = material.currentStock;
    const newQuantity = previousQuantity - params.quantityUsed;

    // Mutate material
    const updatedMaterial: Material = {
      ...material,
      currentStock: newQuantity,
      availableStock: Math.max(0, newQuantity - (material.reservedStock || 0)),
      updatedAt: new Date().toISOString(),
    };
    this.state.materials[matIndex] = updatedMaterial;

    // Log transaction
    const tx: InventoryTransaction = {
      id: `tx-usage-${Date.now()}`,
      organizationId: material.organizationId,
      materialId: material.id,
      materialName: material.name,
      materialCode: material.code,
      type: 'DEDUCT',
      quantity: params.quantityUsed,
      previousQuantity,
      newQuantity,
      reason: params.reason || 'Recorded usage during maintenance operations',
      equipmentId: params.equipmentId,
      equipmentName: this.state.equipment.find((e) => e.id === params.equipmentId)?.name,
      workOrder: params.workOrder,
      date: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
    };
    this.state.transactions.unshift(tx);

    // Recalculate risk
    this.recalculateAllRisks();
    const refreshedMat = this.state.materials[matIndex];

    // Notification if risk escalated to CRITICAL or HIGH
    if (refreshedMat.calculatedRisk === 'CRITICAL' || refreshedMat.calculatedRisk === 'HIGH') {
      const notif: Notification = {
        id: `notif-${Date.now()}`,
        organizationId: material.organizationId,
        title: `Risk Alert: ${material.name} is now ${refreshedMat.calculatedRisk}`,
        message: `Stock reduced from ${previousQuantity} to ${newQuantity}. Post-usage buffer breaches safety threshold. Recommended action: ${refreshedMat.recommendation}.`,
        type: 'ALERT',
        read: false,
        timestamp: new Date().toISOString(),
        linkView: 'materials',
        linkId: material.id,
      };
      this.state.notifications.unshift(notif);
    }

    // Audit log
    this.addAuditLog({
      action: 'Material Usage Recorded',
      entityType: 'Material',
      entityId: material.id,
      oldValue: `${previousQuantity} units`,
      newValue: `${newQuantity} units`,
      reason: params.reason,
    });

    this.persist();
    return { success: true };
  }

  public addStock(params: {
    materialId: string;
    quantity: number;
    source: string;
    supplier?: string;
    purchaseOrder?: string;
    deliveryReference?: string;
    notes?: string;
  }): { success: boolean; error?: string } {
    const user = this.getCurrentUser();
    const matIndex = this.state.materials.findIndex((m) => m.id === params.materialId);
    if (matIndex === -1) return { success: false, error: 'Material not found.' };

    if (params.quantity <= 0) return { success: false, error: 'Quantity must be positive.' };

    const material = this.state.materials[matIndex];
    const previousQuantity = material.currentStock;
    const newQuantity = previousQuantity + params.quantity;

    this.state.materials[matIndex] = {
      ...material,
      currentStock: newQuantity,
      availableStock: newQuantity - (material.reservedStock || 0),
      updatedAt: new Date().toISOString(),
    };

    const tx: InventoryTransaction = {
      id: `tx-add-${Date.now()}`,
      organizationId: material.organizationId,
      materialId: material.id,
      materialName: material.name,
      materialCode: material.code,
      type: 'ADD',
      quantity: params.quantity,
      previousQuantity,
      newQuantity,
      reason: params.source || 'Restock / Delivery receipt',
      reference: params.purchaseOrder || params.deliveryReference,
      date: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
    };
    this.state.transactions.unshift(tx);

    this.recalculateAllRisks();

    this.addAuditLog({
      action: 'Stock Added',
      entityType: 'Material',
      entityId: material.id,
      oldValue: `${previousQuantity} units`,
      newValue: `${newQuantity} units`,
      reason: params.notes || 'Inward stock receipt',
    });

    this.persist();
    return { success: true };
  }

  public transferStock(params: {
    materialId: string;
    fromWarehouseId: string;
    toWarehouseId: string;
    quantity: number;
    reason: string;
    reference?: string;
  }): { success: boolean; error?: string } {
    const user = this.getCurrentUser();
    const material = this.state.materials.find((m) => m.id === params.materialId);
    if (!material) return { success: false, error: 'Material not found' };

    if (params.quantity <= 0 || params.quantity > material.currentStock) {
      return { success: false, error: 'Invalid transfer quantity.' };
    }

    const tx: InventoryTransaction = {
      id: `tx-transfer-${Date.now()}`,
      organizationId: material.organizationId,
      materialId: material.id,
      materialName: material.name,
      materialCode: material.code,
      type: 'TRANSFER',
      quantity: params.quantity,
      previousQuantity: material.currentStock,
      newQuantity: material.currentStock,
      reason: params.reason,
      fromWarehouseId: params.fromWarehouseId,
      toWarehouseId: params.toWarehouseId,
      reference: params.reference,
      date: new Date().toISOString(),
      userId: user.id,
      userName: user.name,
    };
    this.state.transactions.unshift(tx);

    this.addAuditLog({
      action: 'Stock Transferred',
      entityType: 'Material',
      entityId: material.id,
      newValue: `${params.quantity} transferred between warehouses`,
      reason: params.reason,
    });

    this.persist();
    return { success: true };
  }

  // Create new material
  public addMaterial(data: Omit<Material, 'id' | 'calculatedRisk' | 'recommendation' | 'updatedAt' | 'availableStock' | 'reservedStock'>): Material {
    const newMaterial: Material = {
      ...data,
      id: `mat-${Date.now()}`,
      availableStock: data.currentStock,
      reservedStock: 0,
      calculatedRisk: 'LOW',
      recommendation: 'MONITOR',
      updatedAt: new Date().toISOString(),
    };

    this.state.materials.unshift(newMaterial);

    // Initial stock transaction
    if (newMaterial.currentStock > 0) {
      const user = this.getCurrentUser();
      const tx: InventoryTransaction = {
        id: `tx-init-${Date.now()}`,
        organizationId: newMaterial.organizationId,
        materialId: newMaterial.id,
        materialName: newMaterial.name,
        materialCode: newMaterial.code,
        type: 'ADD',
        quantity: newMaterial.currentStock,
        previousQuantity: 0,
        newQuantity: newMaterial.currentStock,
        reason: 'Initial stock baseline on material creation',
        date: new Date().toISOString(),
        userId: user.id,
        userName: user.name,
      };
      this.state.transactions.unshift(tx);
    }

    this.recalculateAllRisks();
    this.addAuditLog({
      action: 'Material Created',
      entityType: 'Material',
      entityId: newMaterial.id,
      newValue: `${newMaterial.name} (${newMaterial.code})`,
    });

    this.persist();
    return newMaterial;
  }

  public addMaintenanceRequirement(maintData: Omit<MaintenanceRequirement, 'id'>): MaintenanceRequirement {
    const newMaint: MaintenanceRequirement = {
      ...maintData,
      id: `maint-${Date.now()}`,
    };
    this.state.maintenance.push(newMaint);
    this.recalculateAllRisks();
    this.addAuditLog({
      action: 'Maintenance Scheduled',
      entityType: 'MaintenanceRequirement',
      entityId: newMaint.id,
      newValue: `${newMaint.workOrderNumber} - ${newMaint.equipmentName} (${newMaint.scheduledDate})`,
    });
    this.persist();
    return newMaint;
  }

  // Procurement & Orders Workflow
  public createProcurementRequest(data: {
    materialId: string;
    quantity: number;
    specification: string;
    requiredDate: string;
    deliveryLocation: string;
    facilityId: string;
    certificationRequirement: string;
    priority: 'Normal' | 'Urgent' | 'Critical';
    notes?: string;
  }): ProcurementRequest {
    const user = this.getCurrentUser();
    const material = this.state.materials.find((m) => m.id === data.materialId);
    const facility = this.state.facilities.find((f) => f.id === data.facilityId);

    const prNumber = `PR-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const pr: ProcurementRequest = {
      id: `pr-${Date.now()}`,
      requestNumber: prNumber,
      organizationId: this.state.currentOrganizationId,
      materialId: data.materialId,
      materialName: material?.name || 'Critical Spare',
      materialCode: material?.code || 'GEN-MAT',
      quantity: data.quantity,
      specification: data.specification,
      requiredDate: data.requiredDate,
      deliveryLocation: data.deliveryLocation,
      facilityId: data.facilityId,
      facilityName: facility?.name || 'Main Facility',
      certificationRequirement: data.certificationRequirement,
      priority: data.priority,
      notes: data.notes,
      status: 'OPEN',
      createdBy: user.name,
      createdAt: new Date().toISOString(),
    };

    this.state.procurementRequests.unshift(pr);

    // Notify suppliers
    const notif: Notification = {
      id: `notif-pr-${Date.now()}`,
      organizationId: 'all',
      title: `New Tender Opportunity: ${pr.materialName}`,
      message: `Tender ${pr.requestNumber} issued for ${pr.quantity} units needed by ${pr.requiredDate}.`,
      type: 'INFO',
      read: false,
      timestamp: new Date().toISOString(),
      linkView: 'opportunities',
      linkId: pr.id,
    };
    this.state.notifications.unshift(notif);

    this.addAuditLog({
      action: 'Procurement Request Issued',
      entityType: 'ProcurementRequest',
      entityId: pr.id,
      newValue: `${pr.requestNumber} for ${pr.quantity}x ${pr.materialName}`,
    });

    this.persist();
    return pr;
  }

  public submitOffer(data: {
    procurementRequestId: string;
    supplierId: string;
    supplierName: string;
    quantity: number;
    unitPrice: number;
    deliveryTimeDays: number;
    availableDate: string;
    certificationOffered: string;
    validityDate: string;
    notes?: string;
  }): Offer {
    const totalPrice = data.quantity * data.unitPrice;
    const offer: Offer = {
      id: `off-${Date.now()}`,
      procurementRequestId: data.procurementRequestId,
      supplierId: data.supplierId,
      supplierName: data.supplierName,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      totalPrice,
      currency: 'USD',
      deliveryTimeDays: data.deliveryTimeDays,
      availableDate: data.availableDate,
      certificationOffered: data.certificationOffered,
      validityDate: data.validityDate,
      notes: data.notes,
      status: 'PENDING',
      submittedAt: new Date().toISOString(),
    };

    this.state.offers.unshift(offer);

    // Update PR status
    const prIndex = this.state.procurementRequests.findIndex((pr) => pr.id === data.procurementRequestId);
    if (prIndex !== -1) {
      this.state.procurementRequests[prIndex].status = 'OFFERS_RECEIVED';
    }

    // Notify buyer
    const pr = this.state.procurementRequests[prIndex];
    if (pr) {
      const notif: Notification = {
        id: `notif-off-${Date.now()}`,
        organizationId: pr.organizationId,
        title: `Offer Received: ${data.supplierName}`,
        message: `${data.supplierName} submitted offer of $${totalPrice.toLocaleString()} for ${pr.requestNumber}.`,
        type: 'SUCCESS',
        read: false,
        timestamp: new Date().toISOString(),
        linkView: 'procurement',
        linkId: pr.id,
      };
      this.state.notifications.unshift(notif);
    }

    this.addAuditLog({
      action: 'Offer Submitted',
      entityType: 'Offer',
      entityId: offer.id,
      newValue: `${data.supplierName} - $${totalPrice.toLocaleString()}`,
    });

    this.persist();
    return offer;
  }

  public acceptOffer(offerId: string): { success: boolean; order?: Order; error?: string } {
    const offerIndex = this.state.offers.findIndex((o) => o.id === offerId);
    if (offerIndex === -1) return { success: false, error: 'Offer not found' };

    const offer = this.state.offers[offerIndex];
    const prIndex = this.state.procurementRequests.findIndex((pr) => pr.id === offer.procurementRequestId);
    if (prIndex === -1) return { success: false, error: 'Procurement request not found' };

    const pr = this.state.procurementRequests[prIndex];
    const user = this.getCurrentUser();

    // Mark offer accepted
    this.state.offers[offerIndex].status = 'ACCEPTED';
    // Mark other offers declined
    this.state.offers.forEach((o) => {
      if (o.procurementRequestId === offer.procurementRequestId && o.id !== offer.id) {
        o.status = 'DECLINED';
      }
    });

    // Mark PR awarded
    this.state.procurementRequests[prIndex].status = 'AWARDED';

    const orderNumber = `PO-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const estArrival = new Date();
    estArrival.setDate(estArrival.getDate() + offer.deliveryTimeDays);

    const order: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      organizationId: pr.organizationId,
      organizationName: this.getCurrentOrganization().name,
      supplierId: offer.supplierId,
      supplierName: offer.supplierName,
      procurementRequestId: pr.id,
      materialId: pr.materialId,
      materialName: pr.materialName,
      materialCode: pr.materialCode,
      quantity: offer.quantity,
      unitPrice: offer.unitPrice,
      totalPrice: offer.totalPrice,
      currency: offer.currency,
      status: 'CONFIRMED',
      timeline: [
        {
          title: 'Procurement Request Created',
          date: new Date(pr.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          description: `Request ${pr.requestNumber} issued`,
          completed: true,
        },
        {
          title: 'Offer Submitted',
          date: new Date(offer.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          description: `${offer.supplierName} proposed $${offer.totalPrice.toLocaleString()}`,
          completed: true,
        },
        {
          title: 'Offer Accepted & PO Issued',
          date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
          description: `PO ${orderNumber} confirmed by ${user.name}`,
          completed: true,
          current: true,
        },
        {
          title: 'Manufacturing / Staging',
          date: 'Pending',
          description: 'Supplier preparing material for dispatch',
          completed: false,
        },
        {
          title: 'In Transit',
          date: 'Pending',
          description: 'Shipped to designated operational facility',
          completed: false,
        },
        {
          title: 'Delivered',
          date: estArrival.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) + ' (Est)',
          description: 'Consignment arrival at gate',
          completed: false,
        },
        {
          title: 'Receipt Confirmed into Stock',
          date: 'Pending',
          description: 'QA inspection and physical check-in',
          completed: false,
        },
      ],
      deliveryDetails: {
        currentStatus: 'Order Confirmed - Awaiting Supplier Dispatch',
        trackingRef: `TRK-${Math.floor(100000 + Math.random() * 900000)}`,
        estimatedArrival: estArrival.toISOString().split('T')[0],
        isDelayed: false,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.state.orders.unshift(order);

    // Notify supplier
    const notif: Notification = {
      id: `notif-po-${Date.now()}`,
      organizationId: offer.supplierId,
      title: `Contract Awarded: Order ${order.orderNumber}`,
      message: `Your offer for ${order.materialName} was accepted. Please initiate preparation.`,
      type: 'SUCCESS',
      read: false,
      timestamp: new Date().toISOString(),
      linkView: 'supplier_orders',
      linkId: order.id,
    };
    this.state.notifications.unshift(notif);

    this.addAuditLog({
      action: 'Offer Accepted & Order Confirmed',
      entityType: 'Order',
      entityId: order.id,
      newValue: `${order.orderNumber} awarded to ${order.supplierName}`,
    });

    this.persist();
    return { success: true, order };
  }

  public updateOrderStatus(orderId: string, status: Order['status'], details?: { delayedReason?: string; newArrivalDate?: string }) {
    const orderIndex = this.state.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return;

    const order = this.state.orders[orderIndex];
    order.status = status;
    order.updatedAt = new Date().toISOString();

    if (details?.delayedReason) {
      order.deliveryDetails.isDelayed = true;
      order.deliveryDetails.delayedReason = details.delayedReason;
      if (details.newArrivalDate) {
        order.deliveryDetails.estimatedArrival = details.newArrivalDate;
      }
      order.deliveryDetails.currentStatus = `Delayed: ${details.delayedReason}`;

      // Notify buyer of delay
      const notif: Notification = {
        id: `notif-delay-${Date.now()}`,
        organizationId: order.organizationId,
        title: `CRITICAL: Shipment Delay on ${order.orderNumber}`,
        message: `${order.supplierName} reported delay on ${order.materialName}: "${details.delayedReason}". Recalculating readiness.`,
        type: 'ALERT',
        read: false,
        timestamp: new Date().toISOString(),
        linkView: 'orders',
        linkId: order.id,
      };
      this.state.notifications.unshift(notif);
    } else {
      order.deliveryDetails.currentStatus = `Status updated to ${status}`;
    }

    // Update timeline
    if (status === 'PREPARING') {
      const step = order.timeline.find((t) => t.title.includes('Manufacturing'));
      if (step) { step.completed = true; step.date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); }
    } else if (status === 'IN DELIVERY') {
      const step = order.timeline.find((t) => t.title.includes('In Transit'));
      if (step) { step.completed = true; step.date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); }
    } else if (status === 'DELIVERED') {
      const step = order.timeline.find((t) => t.title.includes('Delivered'));
      if (step) { step.completed = true; step.date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }); }
    }

    this.addAuditLog({
      action: 'Order Status Changed',
      entityType: 'Order',
      entityId: order.id,
      newValue: status,
      reason: details?.delayedReason,
    });

    this.persist();
  }

  // Confirm receipt of order: adds stock, creates transaction, recalculates risk!
  public confirmOrderReceipt(orderId: string, warehouseId?: string): { success: boolean; error?: string } {
    const user = this.getCurrentUser();
    const orderIndex = this.state.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return { success: false, error: 'Order not found' };

    const order = this.state.orders[orderIndex];
    order.status = 'DELIVERED';
    order.deliveryDetails.currentStatus = 'Receipt Confirmed at Facility';
    order.deliveryDetails.actualArrival = new Date().toISOString().split('T')[0];

    const step = order.timeline.find((t) => t.title.includes('Receipt Confirmed'));
    if (step) {
      step.completed = true;
      step.date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
    }

    // Add stock to material
    const matIndex = this.state.materials.findIndex((m) => m.id === order.materialId);
    if (matIndex !== -1) {
      const mat = this.state.materials[matIndex];
      const prevQty = mat.currentStock;
      const newQty = prevQty + order.quantity;

      this.state.materials[matIndex] = {
        ...mat,
        currentStock: newQty,
        availableStock: newQty - (mat.reservedStock || 0),
        warehouseId: warehouseId || mat.warehouseId,
        updatedAt: new Date().toISOString(),
      };

      // Create RECEIPT transaction
      const tx: InventoryTransaction = {
        id: `tx-receipt-${Date.now()}`,
        organizationId: order.organizationId,
        materialId: mat.id,
        materialName: mat.name,
        materialCode: mat.code,
        type: 'RECEIPT',
        quantity: order.quantity,
        previousQuantity: prevQty,
        newQuantity: newQty,
        reason: `Goods receipt from Order ${order.orderNumber} (${order.supplierName})`,
        reference: order.orderNumber,
        date: new Date().toISOString(),
        userId: user.id,
        userName: user.name,
      };
      this.state.transactions.unshift(tx);
    }

    this.recalculateAllRisks();

    this.addAuditLog({
      action: 'Order Receipt Confirmed & Stock Incremented',
      entityType: 'Order',
      entityId: order.id,
      newValue: `+${order.quantity} units received for ${order.materialName}`,
    });

    this.persist();
    return { success: true };
  }

  // Order Cancellation Workflow (section 42, 80)
  public requestOrderCancellation(orderId: string, reason: string): { success: boolean; message: string } {
    const user = this.getCurrentUser();
    const orderIndex = this.state.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return { success: false, message: 'Order not found' };

    const order = this.state.orders[orderIndex];

    if (order.status === 'SUBMITTED' || order.status === 'DRAFT') {
      order.status = 'CANCELLED';
      order.cancellationDetails = {
        requestedBy: user.name,
        date: new Date().toISOString(),
        reason,
        decision: 'ACCEPTED',
        decisionDate: new Date().toISOString(),
      };
      this.persist();
      return { success: true, message: 'Order cancelled immediately prior to confirmation.' };
    }

    order.status = 'CANCELLATION REQUESTED';
    order.cancellationDetails = {
      requestedBy: user.name,
      date: new Date().toISOString(),
      reason,
    };

    // Notify supplier
    const notif: Notification = {
      id: `notif-cancel-req-${Date.now()}`,
      organizationId: order.supplierId,
      title: `Cancellation Request: ${order.orderNumber}`,
      message: `Buyer requested cancellation for ${order.orderNumber}. Reason: "${reason}". Action required.`,
      type: 'WARNING',
      read: false,
      timestamp: new Date().toISOString(),
      linkView: 'supplier_orders',
      linkId: order.id,
    };
    this.state.notifications.unshift(notif);

    this.addAuditLog({
      action: 'Order Cancellation Requested',
      entityType: 'Order',
      entityId: order.id,
      reason,
    });

    this.persist();
    return { success: true, message: 'Cancellation request submitted to supplier for approval.' };
  }

  public respondToCancellation(orderId: string, decision: 'ACCEPTED' | 'DECLINED', responseReason?: string) {
    const orderIndex = this.state.orders.findIndex((o) => o.id === orderId);
    if (orderIndex === -1) return;

    const order = this.state.orders[orderIndex];
    if (order.cancellationDetails) {
      order.cancellationDetails.decision = decision;
      order.cancellationDetails.decisionDate = new Date().toISOString();
      order.cancellationDetails.responseReason = responseReason;
    }

    order.status = decision === 'ACCEPTED' ? 'CANCELLED' : 'CONFIRMED';

    // Notify buyer
    const notif: Notification = {
      id: `notif-cancel-resp-${Date.now()}`,
      organizationId: order.organizationId,
      title: `Cancellation ${decision}: ${order.orderNumber}`,
      message: `Supplier ${order.supplierName} ${decision.toLowerCase()} cancellation request. Note: ${responseReason || 'None'}`,
      type: decision === 'ACCEPTED' ? 'INFO' : 'WARNING',
      read: false,
      timestamp: new Date().toISOString(),
      linkView: 'orders',
      linkId: order.id,
    };
    this.state.notifications.unshift(notif);

    this.addAuditLog({
      action: `Order Cancellation ${decision}`,
      entityType: 'Order',
      entityId: order.id,
      reason: responseReason,
    });

    this.persist();
  }

  // Supplier management & onboarding
  public addSupplier(supplierData: Omit<Supplier, 'id'>): Supplier {
    const newSupp: Supplier = {
      ...supplierData,
      id: `supp-${Date.now()}`,
    };
    this.state.suppliers.push(newSupp);
    this.addAuditLog({
      action: 'Supplier Onboarded',
      entityType: 'Supplier',
      entityId: newSupp.id,
      newValue: newSupp.name,
    });
    this.persist();
    return newSupp;
  }

  public addSupplierInventoryItem(itemData: Omit<SupplierInventoryItem, 'id'>): SupplierInventoryItem {
    const newItem: SupplierInventoryItem = {
      ...itemData,
      id: `supp-inv-${Date.now()}`,
    };
    this.state.supplierInventory.push(newItem);
    this.persist();
    return newItem;
  }

  // Company Knowledge
  public addKnowledgeItem(itemData: Omit<KnowledgeItem, 'id' | 'createdAt' | 'updatedAt'>): KnowledgeItem {
    const newItem: KnowledgeItem = {
      ...itemData,
      id: `know-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.state.knowledge.unshift(newItem);
    this.addAuditLog({
      action: 'Knowledge Base Article Added',
      entityType: 'KnowledgeItem',
      entityId: newItem.id,
      newValue: newItem.title,
    });
    this.persist();
    return newItem;
  }

  // Audit Log helper
  public addAuditLog(entry: { action: string; entityType: string; entityId: string; oldValue?: string; newValue?: string; reason?: string }) {
    const user = this.getCurrentUser();
    const log: AuditLog = {
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      organizationId: this.state.currentOrganizationId,
      userId: user.id,
      userName: user.name,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      oldValue: entry.oldValue,
      newValue: entry.newValue,
      reason: entry.reason,
      timestamp: new Date().toISOString(),
    };
    this.state.auditLogs.unshift(log);
  }

  // Facility Management
  public addFacility(facilityData: Omit<Facility, 'id' | 'createdAt'>): Facility {
    const newFacility: Facility = {
      ...facilityData,
      id: `fac-${Date.now()}`,
      organizationId: this.state.currentOrganizationId,
      createdAt: new Date().toISOString(),
      status: facilityData.status || 'Active',
      operationalStatus: facilityData.operationalStatus || 'ACTIVE',
    };
    this.state.facilities.push(newFacility);
    this.addAuditLog({
      action: 'Facility Registered',
      entityType: 'Facility',
      entityId: newFacility.id,
      newValue: `${newFacility.name} (${newFacility.type})`,
    });
    this.persist();
    return newFacility;
  }

  public updateFacility(facilityId: string, updates: Partial<Facility>): Facility | undefined {
    const index = this.state.facilities.findIndex((f) => f.id === facilityId);
    if (index === -1) return undefined;
    const old = this.state.facilities[index];
    this.state.facilities[index] = { ...old, ...updates };
    this.addAuditLog({
      action: 'Facility Updated',
      entityType: 'Facility',
      entityId: facilityId,
      oldValue: old.name,
      newValue: updates.name || old.name,
    });
    this.persist();
    return this.state.facilities[index];
  }

  public archiveFacility(facilityId: string) {
    const fac = this.state.facilities.find((f) => f.id === facilityId);
    if (fac) {
      fac.status = 'Archived';
      fac.operationalStatus = 'DECOMMISSIONED';
      this.addAuditLog({
        action: 'Facility Archived',
        entityType: 'Facility',
        entityId: facilityId,
        newValue: 'Archived',
      });
      this.persist();
    }
  }

  // Facility Maintenance
  public addFacilityMaintenanceTask(taskData: Omit<FacilityMaintenanceTask, 'id' | 'createdAt'>): FacilityMaintenanceTask {
    const newTask: FacilityMaintenanceTask = {
      ...taskData,
      id: `fac-mnt-${Date.now()}`,
      organizationId: this.state.currentOrganizationId,
      createdAt: new Date().toISOString(),
    };
    if (!this.state.facilityMaintenance) {
      this.state.facilityMaintenance = [];
    }
    this.state.facilityMaintenance.unshift(newTask);
    this.addAuditLog({
      action: 'Facility Maintenance Work Order Logged',
      entityType: 'FacilityMaintenanceTask',
      entityId: newTask.id,
      newValue: `${newTask.title} (Priority: ${newTask.priority})`,
    });
    this.persist();
    return newTask;
  }

  public updateFacilityMaintenanceTask(taskId: string, updates: Partial<FacilityMaintenanceTask>): FacilityMaintenanceTask | undefined {
    if (!this.state.facilityMaintenance) this.state.facilityMaintenance = [];
    const index = this.state.facilityMaintenance.findIndex((t) => t.id === taskId);
    if (index === -1) return undefined;
    this.state.facilityMaintenance[index] = { ...this.state.facilityMaintenance[index], ...updates };
    this.addAuditLog({
      action: 'Facility Maintenance Task Updated',
      entityType: 'FacilityMaintenanceTask',
      entityId: taskId,
      newValue: `Status: ${updates.status || this.state.facilityMaintenance[index].status}`,
    });
    this.persist();
    return this.state.facilityMaintenance[index];
  }

  // Facility Inspections
  public addFacilityInspection(inspectionData: Omit<FacilityInspection, 'id'>): FacilityInspection {
    const newInspection: FacilityInspection = {
      ...inspectionData,
      id: `fac-insp-${Date.now()}`,
      organizationId: this.state.currentOrganizationId,
    };
    if (!this.state.facilityInspections) {
      this.state.facilityInspections = [];
    }
    this.state.facilityInspections.unshift(newInspection);
    this.addAuditLog({
      action: 'Facility Inspection Scheduled',
      entityType: 'FacilityInspection',
      entityId: newInspection.id,
      newValue: `${newInspection.inspectionType} inspection by ${newInspection.inspectorOrganization}`,
    });
    this.persist();
    return newInspection;
  }

  public updateFacilityInspection(inspectionId: string, updates: Partial<FacilityInspection>): FacilityInspection | undefined {
    if (!this.state.facilityInspections) this.state.facilityInspections = [];
    const index = this.state.facilityInspections.findIndex((i) => i.id === inspectionId);
    if (index === -1) return undefined;
    this.state.facilityInspections[index] = { ...this.state.facilityInspections[index], ...updates };
    this.persist();
    return this.state.facilityInspections[index];
  }

  // Warehouse Management
  public addWarehouse(warehouseData: Omit<Warehouse, 'id'>): Warehouse {
    const newWarehouse: Warehouse = {
      ...warehouseData,
      id: `wh-${Date.now()}`,
      organizationId: this.state.currentOrganizationId,
      status: warehouseData.status || 'OPERATIONAL',
    };
    this.state.warehouses.push(newWarehouse);
    this.addAuditLog({
      action: 'Warehouse Registered',
      entityType: 'Warehouse',
      entityId: newWarehouse.id,
      newValue: newWarehouse.name,
    });
    this.persist();
    return newWarehouse;
  }

  public updateWarehouse(warehouseId: string, updates: Partial<Warehouse>): Warehouse | undefined {
    const index = this.state.warehouses.findIndex((w) => w.id === warehouseId);
    if (index === -1) return undefined;
    this.state.warehouses[index] = { ...this.state.warehouses[index], ...updates };
    this.addAuditLog({
      action: 'Warehouse Details Updated',
      entityType: 'Warehouse',
      entityId: warehouseId,
      newValue: updates.name || this.state.warehouses[index].name,
    });
    this.persist();
    return this.state.warehouses[index];
  }

  public archiveWarehouse(warehouseId: string) {
    const wh = this.state.warehouses.find((w) => w.id === warehouseId);
    if (wh) {
      wh.status = 'ARCHIVED';
      this.addAuditLog({
        action: 'Warehouse Archived',
        entityType: 'Warehouse',
        entityId: warehouseId,
        newValue: 'ARCHIVED',
      });
      this.persist();
    }
  }

  // Equipment Management
  public addEquipment(equipmentData: Omit<Equipment, 'id'>): Equipment {
    const newEquipment: Equipment = {
      ...equipmentData,
      id: `eq-${Date.now()}`,
      organizationId: this.state.currentOrganizationId,
      operationalStatus: equipmentData.operationalStatus || 'Operational',
      status: equipmentData.status || 'Active',
    };
    this.state.equipment.push(newEquipment);
    this.addAuditLog({
      action: 'Asset & Equipment Registered',
      entityType: 'Equipment',
      entityId: newEquipment.id,
      newValue: `${newEquipment.name} (${newEquipment.category || newEquipment.type})`,
    });
    this.persist();
    return newEquipment;
  }

  public updateEquipment(equipmentId: string, updates: Partial<Equipment>): Equipment | undefined {
    const index = this.state.equipment.findIndex((e) => e.id === equipmentId);
    if (index === -1) return undefined;
    this.state.equipment[index] = { ...this.state.equipment[index], ...updates };
    this.addAuditLog({
      action: 'Equipment Record Updated',
      entityType: 'Equipment',
      entityId: equipmentId,
      newValue: updates.name || this.state.equipment[index].name,
    });
    this.persist();
    return this.state.equipment[index];
  }

  public archiveEquipment(equipmentId: string) {
    const eq = this.state.equipment.find((e) => e.id === equipmentId);
    if (eq) {
      eq.status = 'Retired';
      eq.operationalStatus = 'Offline';
      this.addAuditLog({
        action: 'Equipment Retired',
        entityType: 'Equipment',
        entityId: equipmentId,
        newValue: 'Retired',
      });
      this.persist();
    }
  }

  // Equipment Maintenance Records
  public addEquipmentMaintenanceRecord(recordData: Omit<EquipmentMaintenanceRecord, 'id'>): EquipmentMaintenanceRecord {
    const newRecord: EquipmentMaintenanceRecord = {
      ...recordData,
      id: `eq-mr-${Date.now()}`,
      organizationId: this.state.currentOrganizationId,
    };
    if (!this.state.equipmentMaintenanceRecords) {
      this.state.equipmentMaintenanceRecords = [];
    }
    this.state.equipmentMaintenanceRecords.unshift(newRecord);

    // Update equipment lastMaintenanceDate and nextMaintenanceDate
    const eq = this.state.equipment.find((e) => e.id === recordData.equipmentId);
    if (eq) {
      eq.lastMaintenanceDate = recordData.maintenanceDate;
      eq.nextMaintenanceDate = recordData.nextServiceDate;
      eq.totalMaintenanceCostUGX = (eq.totalMaintenanceCostUGX || 0) + recordData.totalCostUGX;
      eq.totalMaintenanceCostUSD = (eq.totalMaintenanceCostUSD || 0) + recordData.totalCostUSD;
    }

    this.addAuditLog({
      action: 'Equipment Maintenance Servicing Logged',
      entityType: 'EquipmentMaintenanceRecord',
      entityId: newRecord.id,
      newValue: `${newRecord.maintenanceType} for ${newRecord.equipmentName}`,
    });
    this.persist();
    return newRecord;
  }

  // Oil & Gas Companies Directory
  public addOilGasCompany(companyData: Omit<OilGasCompany, 'id'>): OilGasCompany {
    const newCompany: OilGasCompany = {
      ...companyData,
      id: `ogc-${Date.now()}`,
    };
    if (!this.state.oilGasCompanies) {
      this.state.oilGasCompanies = [];
    }
    this.state.oilGasCompanies.push(newCompany);
    this.addAuditLog({
      action: 'Oil & Gas Company Added to Directory',
      entityType: 'OilGasCompany',
      entityId: newCompany.id,
      newValue: `${newCompany.name} (${newCompany.companyType})`,
    });
    this.persist();
    return newCompany;
  }

  public updateOilGasCompany(companyId: string, updates: Partial<OilGasCompany>): OilGasCompany | undefined {
    if (!this.state.oilGasCompanies) return undefined;
    const index = this.state.oilGasCompanies.findIndex((c) => c.id === companyId);
    if (index === -1) return undefined;
    this.state.oilGasCompanies[index] = { ...this.state.oilGasCompanies[index], ...updates };
    this.persist();
    return this.state.oilGasCompanies[index];
  }

  // Supplier Invoices
  public addSupplierInvoice(invoiceData: Omit<SupplierInvoice, 'id'>): SupplierInvoice {
    const newInvoice: SupplierInvoice = {
      ...invoiceData,
      id: `inv-${Date.now()}`,
      organizationId: this.state.currentOrganizationId,
    };
    if (!this.state.supplierInvoices) {
      this.state.supplierInvoices = [];
    }
    this.state.supplierInvoices.unshift(newInvoice);
    this.addAuditLog({
      action: 'Supplier Invoice Registered',
      entityType: 'SupplierInvoice',
      entityId: newInvoice.id,
      newValue: `Invoice #${newInvoice.invoiceNumber} from ${newInvoice.supplierName}`,
    });
    this.persist();
    return newInvoice;
  }

  public updateSupplierInvoiceStatus(invoiceId: string, status: 'Pending' | 'Approved' | 'Paid' | 'Overdue') {
    if (!this.state.supplierInvoices) return;
    const inv = this.state.supplierInvoices.find((i) => i.id === invoiceId);
    if (inv) {
      inv.status = status;
      this.addAuditLog({
        action: 'Supplier Invoice Status Changed',
        entityType: 'SupplierInvoice',
        entityId: invoiceId,
        newValue: status,
      });
      this.persist();
    }
  }

  // Inventory Transactions (Goods Received, Issued, Transfer, Adjustment, Damaged, Expired, Count)
  public recordInventoryTransaction(params: {
    materialId: string;
    type: TransactionType;
    quantity: number;
    reason: string;
    warehouseId?: string;
    toWarehouseId?: string;
    reference?: string;
    workOrder?: string;
    unitCostUGX?: number;
  }): InventoryTransaction | undefined {
    const user = this.getCurrentUser();
    const mat = this.state.materials.find((m) => m.id === params.materialId);
    if (!mat) return undefined;

    const previousStock = mat.currentStock;
    let newStock = mat.currentStock;

    if (params.type === 'RECEIPT' || params.type === 'Goods Received' || params.type === 'Stock Return') {
      newStock = previousStock + params.quantity;
    } else if (
      params.type === 'ISSUE' ||
      params.type === 'Goods Issued' ||
      params.type === 'Damaged Stock' ||
      params.type === 'Expired Stock'
    ) {
      newStock = Math.max(0, previousStock - params.quantity);
    } else if (params.type === 'ADJUSTMENT' || params.type === 'Stock Adjustment' || params.type === 'Stock Count') {
      newStock = Math.max(0, params.quantity);
    } else if (params.type === 'TRANSFER' || params.type === 'Stock Transfer') {
      // Transfer modifies warehouse assignment or keeps stock equal
      if (params.toWarehouseId) {
        const toWh = this.state.warehouses.find((w) => w.id === params.toWarehouseId);
        if (toWh) {
          mat.warehouseId = toWh.id;
          mat.warehouseName = toWh.name;
        }
      }
    }

    mat.currentStock = newStock;
    mat.availableStock = Math.max(0, newStock - mat.reservedStock);
    mat.updatedAt = new Date().toISOString();

    const newTx: InventoryTransaction = {
      id: `tx-${Date.now()}`,
      organizationId: this.state.currentOrganizationId,
      materialId: mat.id,
      materialName: mat.name,
      materialCode: mat.code,
      type: params.type,
      quantity: params.quantity,
      previousStock,
      newStock,
      unitCost: mat.unitCost,
      currency: mat.currency,
      date: new Date().toISOString().slice(0, 10),
      reference: params.reference || `TX-${Date.now().toString().slice(-6)}`,
      reason: params.reason,
      workOrder: params.workOrder,
      userId: user.id,
      userName: user.name,
      timestamp: new Date().toISOString(),
    };

    this.state.transactions.unshift(newTx);
    this.addAuditLog({
      action: `Inventory Transaction: ${params.type}`,
      entityType: 'Material',
      entityId: mat.id,
      oldValue: `Stock: ${previousStock}`,
      newValue: `Stock: ${newStock} (${params.reason})`,
    });

    this.recalculateAllRisks();
    this.persist();
    return newTx;
  }

  // Notifications
  public markNotificationAsRead(id: string) {
    const notif = this.state.notifications.find((n) => n.id === id);
    if (notif) {
      notif.read = true;
      this.persist();
    }
  }

  public markAllNotificationsAsRead() {
    this.state.notifications.forEach((n) => {
      n.read = true;
    });
    this.persist();
  }
}

export const store = new Store();
