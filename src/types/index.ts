export type UserRole =
  | 'NEXORA_SUPER_ADMIN'
  | 'ORGANIZATION_ADMIN'
  | 'MANAGEMENT_VIEWER'
  | 'PROCUREMENT_OFFICER'
  | 'INVENTORY_OFFICER'
  | 'MAINTENANCE_OFFICER'
  | 'SUPPLIER_ADMIN'
  | 'SUPPLIER_USER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  organizationName: string;
  avatar?: string;
  status: 'ACTIVE' | 'INACTIVE';
}

export type SubscriptionPlan = 'ESSENTIAL' | 'PROFESSIONAL' | 'ENTERPRISE' | 'CUSTOM';
export type SubscriptionStatus = 'Active' | 'Trial' | 'Suspended' | 'Pending' | 'Expired';
export type BillingCycle = 'Monthly' | 'Annual';

export interface SubscriptionPlanDetails {
  id: SubscriptionPlan;
  name: string;
  tagline: string;
  monthlyPriceUSD: number;
  annualPriceUSD: number;
  trialDays: number;
  maxUsers: number | 'Unlimited';
  maxFacilities: number | 'Unlimited';
  maxMaterials: number | 'Unlimited';
  maxWarehouses: number | 'Unlimited';
  features: {
    predictiveMaterialRisk: boolean;
    whatIfSimulator: boolean;
    autonomousProcurementRouting: boolean;
    supplierRiskIntelligence: boolean;
    customRiskWeights: boolean;
    apiAccess: boolean;
    erpConnector: boolean;
    dedicatedOpsLead: boolean;
    supportSLA: string;
  };
}

export interface Organization {
  id: string;
  name: string;
  type: 'OPERATOR' | 'SUPPLIER' | 'CONTRACTOR';
  status: 'ACTIVE' | 'SUSPENDED';
  country: string;
  region: string;
  facilitiesCount: number;
  usersCount: number;
  contactEmail: string;
  createdAt: string;
  // SaaS Multi-Tenant additions
  code?: string;
  industry?: string;
  segment?: 'Upstream' | 'Midstream' | 'Downstream' | 'Integrated';
  subscriptionPlan?: SubscriptionPlan;
  subscriptionStatus?: SubscriptionStatus;
  billingCycle?: BillingCycle;
  renewalDate?: string;
  trialEndsAt?: string;
  mrrUSD?: number;
  storageUsageMB?: number;
  activeOrdersCount?: number;
  enabledAIModules?: string[];
  implementationLead?: string;
}

export interface TenantInvoice {
  id: string;
  invoiceNumber: string;
  organizationId: string;
  organizationName: string;
  plan: SubscriptionPlan;
  billingCycle: BillingCycle;
  amountUSD: number;
  issueDate: string;
  dueDate: string;
  paidDate?: string;
  status: 'PAID' | 'DUE' | 'OVERDUE' | 'PROCESSING';
  paymentMethod: string;
  pdfUrl?: string;
}

export interface ImplementationService {
  id: string;
  code: string;
  name: string;
  category: 'SETUP' | 'MIGRATION' | 'INTEGRATION' | 'TRAINING' | 'CONSULTING';
  description: string;
  typicalDurationWeeks: number;
  standardPriceUSD: number;
  isOptional: boolean;
  status: 'AVAILABLE' | 'ACTIVE_ENGAGEMENT';
}

export interface AIModuleConfig {
  id: string;
  code: string;
  name: string;
  description: string;
  includedInPlans: SubscriptionPlan[];
  standaloneAddonMonthlyPriceUSD: number;
  isEnabledGlobally: boolean;
  activeTenantsCount: number;
}

export interface PlatformRevenueMetrics {
  mrrUSD: number;
  arrUSD: number;
  activeSubscriptions: number;
  trialAccounts: number;
  churnRatePercent: number;
  netRevenueRetentionPercent: number;
  averageRevenuePerTenantUSD: number;
  monthlyGrowthRatePercent: number;
  pipelineValueUSD: number;
  revenueByPlan: { plan: SubscriptionPlan; amountUSD: number; tenantCount: number }[];
  isDemoData: boolean;
}

export type FacilityType =
  | 'Office'
  | 'Warehouse'
  | 'Factory'
  | 'Workshop'
  | 'Depot'
  | 'Fuel Station'
  | 'Oil Storage Facility'
  | 'Gas Facility'
  | 'Processing Plant'
  | 'Pipeline Facility'
  | 'Oilfield Base'
  | 'Camp'
  | 'Laboratory'
  | 'Retail Facility'
  | 'Distribution Centre'
  | 'Other'
  | 'Central Processing Facility'
  | 'Refinery'
  | 'Pipeline Station'
  | 'Terminal'
  | 'Well Pad';

export interface FacilityDocument {
  id: string;
  name: string;
  type: string;
  date: string;
  size?: string;
  url?: string;
}

export interface Facility {
  id: string;
  organizationId: string;
  name: string;
  type: FacilityType | string;
  code?: string;
  facilityCode?: string;
  company?: string;
  country?: string;
  region?: string;
  district?: string;
  location: string;
  physicalAddress?: string;
  description?: string;
  operationalStatus: 'ACTIVE' | 'MAINTENANCE' | 'PLANNED' | 'DECOMMISSIONED' | 'RESTRICTED' | 'Active' | 'Under Maintenance' | 'Planned' | 'Decommissioned' | 'Archived' | 'Requiring Attention' | 'Requires Attention';
  createdAt: string;
  // Extended fields for enterprise management
  gpsCoordinates?: { lat: number; lng: number; formatted?: string } | string;
  facilityManager?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  contactPhone?: string;
  contactEmail?: string;
  status?: 'Active' | 'Under Maintenance' | 'Planned' | 'Decommissioned' | 'Archived' | 'Requiring Attention' | 'Requires Attention';
  dateAcquired?: string;
  commissioningDate?: string;
  facilityValueUGX?: number;
  facilityValueUSD?: number;
  monthlyCostsUGX?: number;
  monthlyCostsUSD?: number;
  monthlyCostUGX?: number;
  monthlyCostUSD?: number;
  insurancePolicy?: string;
  insurancePolicyNumber?: string;
  insuranceProvider?: string;
  insuranceExpiry?: string;
  insuranceExpiryDate?: string;
  leaseInfo?: {
    isLeased: boolean;
    lessor?: string;
    monthlyRentUGX?: number;
    leaseStart?: string;
    leaseEnd?: string;
  };
  capacity?: string;
  operatingStatus?: string;
  notes?: string;
  documents?: FacilityDocument[];
  photos?: string[];
  outstandingMaintenanceCount?: number;
  upcomingInspectionsCount?: number;
}

export interface FacilityMaintenanceTask {
  id: string;
  facilityId: string;
  facilityName: string;
  organizationId: string;
  title: string;
  category: 'Safety' | 'Electrical' | 'Structural' | 'Plumbing' | 'HVAC' | 'Mechanical' | 'General';
  assignedTechnician: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  deadline: string;
  status: 'Open' | 'Assigned' | 'In Progress' | 'Pending Parts' | 'Completed' | 'Cancelled';
  costUGX: number;
  costUSD: number;
  invoices: string[];
  photos: string[];
  partsUsed: { materialId?: string; materialName: string; quantity: number; costUGX: number }[];
  downtimeHours: number;
  completionDate?: string;
  createdAt: string;
}

export interface FacilityInspection {
  id: string;
  facilityId: string;
  facilityName: string;
  organizationId: string;
  inspectionType:
    | 'Safety'
    | 'Facility'
    | 'Environmental'
    | 'Fire'
    | 'Electrical'
    | 'Structural'
    | 'Regulatory';
  inspectionDate: string;
  inspectorName: string;
  inspectorOrganization: string;
  findings: string;
  complianceStatus: 'Compliant' | 'Non-Compliant' | 'Conditional' | 'Pending';
  correctiveActions: string;
  deadline: string;
  supportingDocuments: string[];
  isOverdue?: boolean;
}

export type WarehouseType =
  | 'Central Spares Depot'
  | 'Ready-Spares Locker'
  | 'Chemical Storage'
  | 'Bulk Fuel & Lube Depot'
  | 'Pipe Yard'
  | 'General Consumables'
  | 'Hazardous Materials'
  | 'Worksite Staging'
  | 'Distribution Centre'
  | 'Other';

export interface Warehouse {
  id: string;
  organizationId: string;
  facilityId: string;
  facilityName?: string;
  name: string;
  location: string;
  description?: string;
  responsibleOfficer?: string;
  status: 'OPERATIONAL' | 'REORGANIZING' | 'FULL' | 'MAINTENANCE' | 'ARCHIVED';
  // Extended fields
  code?: string;
  type?: WarehouseType | string;
  warehouseType?: WarehouseType | string;
  address?: string;
  physicalAddress?: string;
  warehouseManager?: string;
  managerName?: string;
  contactPhone?: string;
  contactEmail?: string;
  capacityDesc?: string;
  capacityDescription?: string;
  currentUtilization?: number; // percentage, e.g. 78
  currentUtilizationPercent?: number;
  securityLevel?: 'High Security (Biometric)' | 'Controlled Access' | 'Standard Access' | '24/7 Monitored';
  operatingHours?: string;
  gpsCoordinates?: { lat: number; lng: number; formatted?: string };
  totalInventoryValueUGX?: number;
  totalInventoryValueUSD?: number;
  totalValueUGX?: number;
  totalValueUSD?: number;
  stockItemsCount?: number;
  totalStockItems?: number;
  lowStockCount?: number;
  outOfStockCount?: number;
  expiringCount?: number;
}

export type CriticalityLevel = 'Low' | 'Medium' | 'High' | 'Critical';
export type EquipmentCriticality = 'Critical' | 'High' | 'Medium' | 'Low';
export type EquipmentStatus = 'Active' | 'Available' | 'Assigned' | 'Under Maintenance' | 'Under Inspection' | 'Out of Service' | 'Retired' | 'Disposed';
export type DepreciationMethod = 'Straight-line' | 'Straight-Line' | 'Declining Balance' | 'Declining balance';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AIRecommendation =
  | 'MONITOR'
  | 'WAIT'
  | 'PROCURE NOW'
  | 'EXPEDITE'
  | 'TRANSFER STOCK'
  | 'CONSIDER ALTERNATIVE SUPPLIER';

export interface Equipment {
  id: string;
  organizationId: string;
  facilityId: string;
  facilityName: string;
  name: string;
  code: string;
  type: string;
  manufacturer: string;
  model: string;
  criticality: CriticalityLevel;
  criticalityRank?: string;
  utilizationRatePercent?: number;
  certificationNumber?: string;
  operationalStatus: 'Operational' | 'Standby' | 'Under Maintenance' | 'Offline' | 'Active' | 'Available' | 'Assigned' | 'Under Inspection' | 'Out of Service' | 'Retired' | 'Disposed';
  description?: string;
  // Extended fields
  assetNumber?: string;
  category?: string;
  supplierId?: string;
  supplierName?: string;
  serialNumber?: string;
  yearOfManufacture?: number;
  purchaseDate?: string;
  purchaseCostUGX?: number;
  purchaseCostUSD?: number;
  currentValueUGX?: number;
  currentValueUSD?: number;
  depreciationMethod?: 'Straight-Line' | 'Declining Balance' | 'Declining balance' | string;
  usefulLifeYears?: number;
  salvageValueUGX?: number;
  salvageValueUSD?: number;
  accumulatedDepreciationUGX?: number;
  accumulatedDepreciationUSD?: number;
  annualDepreciationUGX?: number;
  annualDepreciationUSD?: number;
  warehouseId?: string;
  warehouseName?: string;
  department?: 'Operations' | 'Drilling' | 'Maintenance' | 'Pipeline' | 'HSE' | 'Logistics' | string;
  assignedEmployee?: string;
  status?: 'Active' | 'Available' | 'Assigned' | 'Under Maintenance' | 'Under Inspection' | 'Out of Service' | 'Retired' | 'Disposed';
  condition?: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical';
  warrantyProvider?: string;
  warrantyExpiry?: string;
  maintenanceScheduleFreq?: string;
  lastMaintenanceDate?: string;
  nextMaintenanceDate?: string;
  certification?: string;
  certificationExpiry?: string;
  certificationExpiryDate?: string;
  isCertificationExpired?: boolean;
  inspectionDate?: string;
  insurancePolicy?: string;
  insuranceExpiry?: string;
  gpsCoordinates?: { lat: number; lng: number; formatted?: string };
  documents?: { id: string; name: string; type: string; date: string }[];
  photos?: string[];
  notes?: string;
  oilGasSegment?: 'Upstream' | 'Midstream' | 'Downstream' | 'Integrated';
  oilGasSubSegment?: 'Exploration' | 'Drilling' | 'Production' | 'Processing' | 'Pipeline' | 'Storage' | 'Transportation' | 'Refining' | 'Distribution';
  totalMaintenanceCostUGX?: number;
  totalMaintenanceCostUSD?: number;
}

export interface EquipmentMaintenanceRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  organizationId: string;
  maintenanceType:
    | 'Preventive maintenance'
    | 'Corrective maintenance'
    | 'Emergency maintenance'
    | 'Scheduled servicing'
    | 'Inspection'
    | 'Calibration';
  maintenanceDate: string;
  technician: string;
  workPerformed: string;
  partsUsed: { materialId?: string; materialName: string; quantity: number; costUGX: number; costUSD: number }[];
  labourCostUGX: number;
  labourCostUSD: number;
  partsCostUGX: number;
  partsCostUSD: number;
  totalCostUGX: number;
  totalCostUSD: number;
  downtimeHours: number;
  nextServiceDate: string;
  documents: string[];
}

export type OilGasCompanyType =
  | 'IOC'
  | 'NOC'
  | 'Exploration Company'
  | 'Production Company'
  | 'Oilfield Services'
  | 'EPC Contractor'
  | 'Engineering Company'
  | 'Equipment Supplier'
  | 'Logistics Company'
  | 'Pipeline Company'
  | 'Refinery'
  | 'Fuel Distributor'
  | 'Petroleum Retailer'
  | 'Local Supplier'
  | 'International Supplier';

export type OilGasSegment = 'Upstream' | 'Midstream' | 'Downstream' | 'Integrated';

export type OilGasCategory =
  | 'Drilling Equipment'
  | 'Production Equipment'
  | 'Pipeline Equipment'
  | 'Safety Equipment'
  | 'Electrical & Instrumentation'
  | 'Vehicles & Heavy Equipment'
  | 'Consumables'
  | 'Chemicals'
  | 'Piping & Flanges'
  | 'Rotating Equipment';

export interface OilGasCompany {
  id: string;
  name: string;
  country: string;
  companyType: OilGasCompanyType | string;
  type?: OilGasCompanyType | string;
  headquarters: string;
  website: string;
  contactEmail: string;
  contactPhone: string;
  contactPerson: string;
  oilGasSegment: OilGasSegment;
  segment?: OilGasSegment;
  assets: string[];
  projects: string[];
  facilitiesCount: number;
  equipmentCount: number;
  suppliersCount: number;
  activeContracts: string[];
  procurementOpportunities: {
    id?: string;
    title: string;
    category?: string;
    deadline: string;
    valueUSD: number;
    valueUGX: number;
    estimatedValueUSD?: number;
    estimatedValueUGX?: number;
    status: 'Open' | 'Under Review' | 'OPEN';
  }[];
  notes?: string;
  logo?: string;
}

export interface SupplierInvoice {
  id: string;
  invoiceNumber: string;
  organizationId: string;
  supplierId: string;
  supplierName: string;
  orderNumber?: string;
  poNumber?: string;
  amountUGX: number;
  amountUSD: number;
  issueDate: string;
  dueDate: string;
  status: 'Pending' | 'Approved' | 'Paid' | 'Overdue';
  description?: string;
  currency?: string;
  amount?: number;
  vatAmountUGX?: number;
  withholdingTaxUGX?: number;
  items?: { description: string; quantity: number; unitPriceUGX: number; unitPriceUSD: number }[];
}

export interface Material {
  id: string;
  organizationId: string;
  facilityId: string;
  facilityName: string;
  warehouseId: string;
  warehouseName: string;
  name: string;
  code: string;
  category: string;
  description: string;
  unitOfMeasurement: string;
  currentStock: number;
  availableStock: number;
  reservedStock: number;
  minimumStock: number;
  safetyStock: number;
  maximumStock: number;
  criticality: CriticalityLevel;
  preferredSupplierId: string;
  preferredSupplierName: string;
  alternativeSupplierIds: string[];
  leadTimeDays: number;
  unitCost: number;
  currency: string;
  certificationRequirement: string;
  expiryDate?: string;
  storageLocation: string;
  notes?: string;
  calculatedRisk: RiskLevel;
  recommendation: AIRecommendation;
  updatedAt: string;
  // Extended fields for inventory & valuation
  brand?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  batchNumber?: string;
  dateReceived?: string;
  condition?: 'New' | 'Refurbished' | 'Serviceable' | 'Damaged' | 'Quarantined';
  valuationMethod?: 'FIFO' | 'Weighted Average';
  unitCostUGX?: number;
  totalValueUGX?: number;
  totalValueUSD?: number;
  reorderLevel?: number;
  reorderPoint?: number;
  binLocation?: string;
  binRackLocation?: string;
}

export type TransactionType =
  | 'ADD'
  | 'DEDUCT'
  | 'TRANSFER'
  | 'ADJUST'
  | 'RECEIPT'
  | 'RESERVE'
  | 'RELEASE'
  | 'Goods Received'
  | 'Goods Issued'
  | 'Stock Transfer'
  | 'Stock Adjustment'
  | 'Stock Return'
  | 'Damaged Stock'
  | 'Expired Stock'
  | 'Stock Count'
  | 'ISSUE'
  | 'ADJUSTMENT';

export interface InventoryTransaction {
  id: string;
  organizationId: string;
  materialId: string;
  materialName: string;
  materialCode: string;
  type: TransactionType;
  quantity: number;
  previousQuantity?: number;
  newQuantity?: number;
  previousStock?: number;
  newStock?: number;
  unitCost?: number;
  currency?: string;
  timestamp?: string;
  reason: string;
  equipmentId?: string;
  equipmentName?: string;
  workOrder?: string;
  reference?: string;
  fromWarehouseId?: string;
  toWarehouseId?: string;
  date: string;
  userId: string;
  userName: string;
}

export type ReadinessStatus = 'READY' | 'AT RISK' | 'CRITICAL' | 'INSUFFICIENT INFORMATION';

export interface MaintenanceRequirement {
  id: string;
  organizationId: string;
  equipmentId: string;
  equipmentName: string;
  facilityId: string;
  facilityName: string;
  maintenanceType:
    | 'Preventive Maintenance'
    | 'Corrective Maintenance'
    | 'Inspection'
    | 'Replacement'
    | 'Shutdown Maintenance';
  scheduledDate: string;
  materialId: string;
  materialName: string;
  requiredQuantity: number;
  criticality: CriticalityLevel;
  workOrderNumber: string;
  description: string;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Deferred';
  calculatedReadiness?: ReadinessStatus;
  shortfall?: number;
}

export interface SupplierCertification {
  name: string;
  issuer: string;
  validUntil: string;
  verified: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  logo?: string;
  registrationNumber: string;
  country: string;
  region: string;
  district: string;
  city: string;
  physicalAddress: string;
  email: string;
  phone: string;
  website: string;
  about: string;
  businessType: string;
  yearEstablished: number;
  experienceYears: number;
  capabilities: string[];
  operatingAreas: string[];
  certifications: SupplierCertification[];
  materialsProvided: string[];
  leadTimeDays: number;
  onTimeDeliveryRate: number; // percentage, e.g. 94
  readinessScore: number; // index, e.g. 92
  totalOrdersCompleted: number;
  activeOrders: number;
  simulated: boolean;
  categories?: string[];
  tier?: string;
  averageLeadTimeDays?: number;
}

export interface SupplierInventoryItem {
  id: string;
  supplierId: string;
  materialName: string;
  category: string;
  quantityAvailable: number;
  unit: string;
  location: string;
  price: number;
  currency: string;
  leadTimeDays: number;
  certification: string;
  minimumOrderQuantity: number;
  availableStatus: boolean;
  notes?: string;
}

export interface ProcurementRequest {
  id: string;
  requestNumber: string;
  organizationId: string;
  materialId: string;
  materialName: string;
  materialCode: string;
  quantity: number;
  specification: string;
  requiredDate: string;
  deliveryLocation: string;
  facilityId: string;
  facilityName: string;
  certificationRequirement: string;
  priority: 'Normal' | 'Urgent' | 'Critical';
  urgency?: 'Normal' | 'Urgent' | 'Critical';
  estimatedCostUSD?: number;
  notes?: string;
  status: 'DRAFT' | 'OPEN' | 'OFFERS_RECEIVED' | 'AWARDED' | 'CANCELLED';
  createdBy: string;
  createdAt: string;
}

export interface Offer {
  id: string;
  procurementRequestId: string;
  supplierId: string;
  supplierName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  deliveryTimeDays: number;
  availableDate: string;
  certificationOffered: string;
  validityDate: string;
  notes?: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'WITHDRAWN';
  submittedAt: string;
}

export type OrderStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'ACCEPTED'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'IN DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'CANCELLATION REQUESTED'
  | 'DECLINED'
  | 'ISSUE REPORTED';

export interface OrderTimelineEvent {
  title: string;
  date: string;
  description: string;
  completed: boolean;
  current?: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  organizationId: string;
  organizationName: string;
  supplierId: string;
  supplierName: string;
  procurementRequestId: string;
  materialId: string;
  materialName: string;
  materialCode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  currency: string;
  status: OrderStatus;
  timeline: OrderTimelineEvent[];
  deliveryDetails: {
    currentStatus: string;
    trackingRef: string;
    estimatedArrival: string;
    actualArrival?: string;
    delayedReason?: string;
    isDelayed?: boolean;
  };
  cancellationDetails?: {
    requestedBy: string;
    date: string;
    reason: string;
    decision?: 'ACCEPTED' | 'DECLINED';
    decisionDate?: string;
    responseReason?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  id: string;
  organizationId: string;
  recipientRole?: UserRole;
  recipientUserId?: string;
  title: string;
  message: string;
  type: 'ALERT' | 'INFO' | 'WARNING' | 'SUCCESS';
  read: boolean;
  timestamp: string;
  linkView?: string;
  linkId?: string;
}

export interface AuditLog {
  id: string;
  organizationId: string;
  userId: string;
  userName: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: string;
  newValue?: string;
  reason?: string;
  timestamp: string;
}

export interface KnowledgeItem {
  id: string;
  organizationId: string;
  title: string;
  category:
    | 'Procurement Policy'
    | 'Material Specification'
    | 'Supplier Requirement'
    | 'Technical Note'
    | 'Maintenance Procedure'
    | 'Company Rule';
  content: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface RiskConfiguration {
  organizationId: string;
  safetyStockBufferDays: number;
  leadTimeUrgencyBufferDays: number;
  criticalEquipmentWeight: number;
  autoAlertOnHighRisk: boolean;
}

export interface AIInsight {
  id: string;
  materialId?: string;
  materialName?: string;
  riskLevel: RiskLevel;
  recommendation: AIRecommendation;
  whatWasFound: string;
  whyItMatters: string;
  dataUsed: string[];
  confidence: 'High' | 'Moderate' | 'Limited';
  dataCompleteness: 'Good' | 'Partial' | 'Insufficient';
  createdAt: string;
}
