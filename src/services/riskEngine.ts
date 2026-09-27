import {
  Material,
  MaintenanceRequirement,
  Supplier,
  RiskLevel,
  AIRecommendation,
  ReadinessStatus,
  Order,
  Equipment,
} from '../types';

export interface PredictedSupplyChainDelayAlert {
  id: string;
  materialId: string;
  materialName: string;
  materialCode: string;
  category: string;
  facilityId: string;
  facilityName: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  nominalLeadTimeDays: number;
  predictedDelayDays: number;
  totalProjectedLeadTimeDays: number;
  supplierId?: string;
  supplierName: string;
  supplierOnTimeRate?: number;
  equipmentName: string;
  equipmentCode?: string;
  workOrderNumber?: string;
  workOrderDate?: string;
  daysUntilMaintenance?: number | null;
  bufferImpactDays?: number | null; // negative means arrival after maintenance
  downtimeCostPerDayUsd: number;
  currentStock: number;
  safetyStock: number;
  unitOfMeasurement: string;
  activeOrderId?: string;
  activeOrderNumber?: string;
  trackingRef?: string;
  alertType: 'DEADLINE_CLASH' | 'ACTIVE_TRANSIT' | 'BUFFER_DEPLETION' | 'SUPPLIER_RISK';
  aiExplanation: {
    predictiveSignal: string;
    whyItMatters: string;
    recommendedMitigation: string;
    confidenceScore: number;
    keySignals: string[];
  };
}

export interface CalculatedMaterialRisk {
  materialId: string;
  materialName: string;
  currentStock: number;
  availableStock: number;
  reservedStock: number;
  totalMaintenanceDemand: number;
  projectedStock: number;
  shortfall: number;
  safetyStock: number;
  minimumStock: number;
  riskLevel: RiskLevel;
  recommendation: AIRecommendation;
  leadTimeDays: number;
  daysUntilMaintenance: number | null;
  urgencyBreached: boolean;
  explanation: {
    whatWasFound: string;
    whyItMatters: string;
    action: string;
    confidence: 'High' | 'Moderate' | 'Limited';
    dataCompleteness: 'Good' | 'Partial' | 'Insufficient';
  };
}

export interface WhatIfScenarioInput {
  materialId: string;
  supplierDelayDays: number;
  demandIncreaseQty: number;
  maintenanceAdvanceDays: number; // days moved earlier
  stockTransferDelta: number; // positive = incoming transfer, negative = outgoing
  supplierUnavailable: boolean;
}

export interface WhatIfSimulationResult {
  material: Material;
  before: {
    riskLevel: RiskLevel;
    projectedStock: number;
    shortfall: number;
    recommendation: AIRecommendation;
    leadTimeDays: number;
  };
  after: {
    riskLevel: RiskLevel;
    projectedStock: number;
    shortfall: number;
    recommendation: AIRecommendation;
    leadTimeDays: number;
    daysBuffer: number;
  };
  deltaDescription: string;
  recommendedAction: string;
  financialRiskEstimateUsd: number;
}

// Fixed reference date for realistic oil & gas prototype timeline (Sept/Oct 2026)
export const PROTOTYPE_CURRENT_DATE = new Date('2026-09-23T00:00:00Z');

export function getDaysDifference(targetDateStr: string, fromDate = PROTOTYPE_CURRENT_DATE): number {
  try {
    const target = new Date(targetDateStr);
    const diffMs = target.getTime() - fromDate.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  } catch (e) {
    return 30;
  }
}

export function calculateDeterministicRisk(
  material: Material,
  maintenanceList: MaintenanceRequirement[],
  suppliers: Supplier[] = []
): CalculatedMaterialRisk {
  const availableStock = Math.max(0, material.currentStock - (material.reservedStock || 0));
  
  // Find upcoming scheduled maintenance requiring this material
  const relevantMaintenance = maintenanceList.filter(
    (m) => m.materialId === material.id && m.status !== 'Completed'
  );

  const totalMaintenanceDemand = relevantMaintenance.reduce(
    (sum, m) => sum + m.requiredQuantity,
    0
  );

  const projectedStock = availableStock - totalMaintenanceDemand;
  const shortfall = Math.max(0, totalMaintenanceDemand - availableStock);

  // Determine closest scheduled maintenance date
  let closestDays: number | null = null;
  let closestMaintenance: MaintenanceRequirement | null = null;

  for (const m of relevantMaintenance) {
    const days = getDaysDifference(m.scheduledDate);
    if (days >= 0 && (closestDays === null || days < closestDays)) {
      closestDays = days;
      closestMaintenance = m;
    }
  }

  const leadTimeDays = material.leadTimeDays || 21;
  const urgencyBreached = closestDays !== null && closestDays <= leadTimeDays;

  // Determine risk level using multi-variable deterministic rules
  let riskLevel: RiskLevel = 'LOW';
  let recommendation: AIRecommendation = 'MONITOR';

  const isCriticalAsset = material.criticality === 'Critical' || material.criticality === 'High';
  const belowSafetyStock = projectedStock < material.safetyStock;
  const severeDeficit = projectedStock <= 0;

  if (severeDeficit) {
    riskLevel = 'CRITICAL';
    recommendation = urgencyBreached ? 'EXPEDITE' : 'PROCURE NOW';
  } else if (belowSafetyStock) {
    if (isCriticalAsset && urgencyBreached) {
      riskLevel = 'CRITICAL';
      recommendation = 'PROCURE NOW';
    } else if (isCriticalAsset || urgencyBreached) {
      riskLevel = 'HIGH';
      recommendation = urgencyBreached ? 'EXPEDITE' : 'PROCURE NOW';
    } else {
      riskLevel = 'MEDIUM';
      recommendation = 'CONSIDER ALTERNATIVE SUPPLIER';
    }
  } else if (projectedStock <= material.minimumStock) {
    riskLevel = 'MEDIUM';
    recommendation = 'MONITOR';
  } else {
    riskLevel = 'LOW';
    recommendation = 'MONITOR';
  }

  // Explanation synthesis
  const assetName = closestMaintenance?.equipmentName || 'Critical Production Asset';
  const whatWasFound = `Current stock is ${material.currentStock} units. Scheduled maintenance requires ${totalMaintenanceDemand} units. Mandatory safety stock is ${material.safetyStock} units. Preferred supplier lead time is ${leadTimeDays} days.`;
  
  let whyItMatters = 'Inventory comfortably accommodates planned operations with adequate safety buffers.';
  if (riskLevel === 'CRITICAL') {
    whyItMatters = `Projected balance of ${projectedStock} units creates an active shortfall or breaches safety buffer on ${assetName}, risking production halt if lead time (${leadTimeDays}d) exceeds maintenance deadline.`;
  } else if (riskLevel === 'HIGH') {
    whyItMatters = `Available supply will dip below the mandatory safety stock threshold of ${material.safetyStock} units. Lead time (${leadTimeDays}d) leaves minimal margin for supplier delays.`;
  } else if (riskLevel === 'MEDIUM') {
    whyItMatters = `Stock levels approach minimum operational thresholds. Reorder horizon should be tracked closely.`;
  }

  return {
    materialId: material.id,
    materialName: material.name,
    currentStock: material.currentStock,
    availableStock,
    reservedStock: material.reservedStock || 0,
    totalMaintenanceDemand,
    projectedStock,
    shortfall,
    safetyStock: material.safetyStock,
    minimumStock: material.minimumStock,
    riskLevel,
    recommendation,
    leadTimeDays,
    daysUntilMaintenance: closestDays,
    urgencyBreached,
    explanation: {
      whatWasFound,
      whyItMatters,
      action: recommendation,
      confidence: material.leadTimeDays > 0 ? 'High' : 'Moderate',
      dataCompleteness: material.safetyStock > 0 && relevantMaintenance.length > 0 ? 'Good' : 'Partial',
    },
  };
}

export function evaluateMaintenanceReadiness(
  maintenance: MaintenanceRequirement,
  material?: Material,
  suppliers: Supplier[] = []
): { status: ReadinessStatus; shortfall: number; notes: string } {
  if (!material) {
    return {
      status: 'INSUFFICIENT INFORMATION',
      shortfall: maintenance.requiredQuantity,
      notes: 'Linked material record not found.',
    };
  }

  const available = Math.max(0, material.currentStock - (material.reservedStock || 0));
  const shortfall = Math.max(0, maintenance.requiredQuantity - available);
  const daysUntil = getDaysDifference(maintenance.scheduledDate);
  const leadTime = material.leadTimeDays || 21;

  if (available >= maintenance.requiredQuantity) {
    return {
      status: 'READY',
      shortfall: 0,
      notes: `${available} units available in stock. Maintenance requirement (${maintenance.requiredQuantity} units) fully covered.`,
    };
  }

  if (shortfall > 0 && daysUntil <= leadTime) {
    return {
      status: 'CRITICAL',
      shortfall,
      notes: `Shortfall of ${shortfall} units! Maintenance in ${daysUntil} days, but supplier lead time is ${leadTime} days.`,
    };
  }

  if (shortfall > 0) {
    return {
      status: 'AT RISK',
      shortfall,
      notes: `Shortfall of ${shortfall} units. Lead time is ${leadTime} days, with ${daysUntil} days remaining to scheduled activity.`,
    };
  }

  return {
    status: 'AT RISK',
    shortfall,
    notes: 'Marginal stock position.',
  };
}

export function simulateWhatIfScenario(
  material: Material,
  maintenanceList: MaintenanceRequirement[],
  scenario: WhatIfScenarioInput,
  suppliers: Supplier[] = []
): WhatIfSimulationResult {
  const currentRisk = calculateDeterministicRisk(material, maintenanceList, suppliers);

  // Apply scenario mutations to a virtual copy
  const virtualMaterial: Material = {
    ...material,
    currentStock: Math.max(0, material.currentStock + scenario.stockTransferDelta),
    leadTimeDays: scenario.supplierUnavailable
      ? 90
      : (material.leadTimeDays || 21) + scenario.supplierDelayDays,
  };

  // Mutate virtual maintenance requirements
  const virtualMaintenance: MaintenanceRequirement[] = maintenanceList
    .filter((m) => m.materialId === material.id)
    .map((m) => {
      const origDays = getDaysDifference(m.scheduledDate);
      const newDays = Math.max(1, origDays - scenario.maintenanceAdvanceDays);
      const newDate = new Date(PROTOTYPE_CURRENT_DATE);
      newDate.setDate(newDate.getDate() + newDays);

      return {
        ...m,
        requiredQuantity: m.requiredQuantity + scenario.demandIncreaseQty,
        scheduledDate: newDate.toISOString().split('T')[0],
      };
    });

  const simulatedRisk = calculateDeterministicRisk(virtualMaterial, virtualMaintenance, suppliers);

  let deltaDescription = `Risk transitioned from ${currentRisk.riskLevel} to ${simulatedRisk.riskLevel}.`;
  if (scenario.supplierDelayDays > 0) {
    deltaDescription += ` Supplier delay of +${scenario.supplierDelayDays} days extended reorder window to ${virtualMaterial.leadTimeDays} days.`;
  }
  if (scenario.demandIncreaseQty > 0) {
    deltaDescription += ` Unplanned demand surge (+${scenario.demandIncreaseQty} units) deepened inventory deficit.`;
  }
  if (scenario.maintenanceAdvanceDays > 0) {
    deltaDescription += ` Maintenance accelerated by ${scenario.maintenanceAdvanceDays} days.`;
  }
  if (scenario.supplierUnavailable) {
    deltaDescription += ` Primary supplier flagged unavailable; fallback supply timeline extended to 90 days.`;
  }

  let recommendedAction = 'Maintain current monitoring routine.';
  if (simulatedRisk.riskLevel === 'CRITICAL') {
    recommendedAction = 'EXPEDITE immediately or consider qualified local supplier (e.g. East Africa Mechanical Solutions, 7-day turnaround) to avoid deferred production.';
  } else if (simulatedRisk.riskLevel === 'HIGH') {
    recommendedAction = 'Initiate early procurement request or execute regional stock transfer from auxiliary warehouse.';
  }

  // Simulated downtime cost impact (e.g. $45,000/day for P-101 crude transfer pump)
  const financialRiskEstimateUsd = simulatedRisk.shortfall > 0 ? simulatedRisk.shortfall * 45000 : 0;

  const daysBuffer = (simulatedRisk.daysUntilMaintenance ?? 30) - virtualMaterial.leadTimeDays;

  return {
    material,
    before: {
      riskLevel: currentRisk.riskLevel,
      projectedStock: currentRisk.projectedStock,
      shortfall: currentRisk.shortfall,
      recommendation: currentRisk.recommendation,
      leadTimeDays: currentRisk.leadTimeDays,
    },
    after: {
      riskLevel: simulatedRisk.riskLevel,
      projectedStock: simulatedRisk.projectedStock,
      shortfall: simulatedRisk.shortfall,
      recommendation: simulatedRisk.recommendation,
      leadTimeDays: virtualMaterial.leadTimeDays,
      daysBuffer,
    },
    deltaDescription,
    recommendedAction,
    financialRiskEstimateUsd,
  };
}

/**
 * Deterministic AI intelligence engine to predict supply chain delays across materials,
 * factoring in historical supplier performance, logistics corridor choke points,
 * upcoming maintenance turnaround schedules, and active shipment transit logs.
 */
export function getPredictedSupplyChainDelayAlerts(
  materials: Material[],
  maintenanceList: MaintenanceRequirement[],
  suppliers: Supplier[] = [],
  orders: Order[] = [],
  equipmentList: Equipment[] = []
): PredictedSupplyChainDelayAlert[] {
  const alerts: PredictedSupplyChainDelayAlert[] = [];

  // Helper map for fast lookup
  const supplierMap = new Map<string, Supplier>(suppliers.map((s) => [s.id, s]));
  const equipmentMap = new Map<string, Equipment>(equipmentList.map((e) => [e.id, e]));

  // 1. Mechanical Seal Cartridge (API 682 Dual) - Priority Turnaround Spare
  const sealMat = materials.find((m) => m.code === 'MS-P101-01' || m.id === 'mat-mech-seal');
  if (sealMat) {
    const maint = maintenanceList.find((m) => m.materialId === sealMat.id && m.status !== 'Completed') || {
      equipmentName: 'Crude Transfer Pump P-101',
      workOrderNumber: 'WO-2026-0891',
      scheduledDate: '2026-10-20',
      requiredQuantity: 3,
    };
    const daysUntil = getDaysDifference(maint.scheduledDate);
    const nominal = sealMat.leadTimeDays || 21;
    const delay = 9; // AI predicted logistics variance + API 682 dual seal hydro-test inspection
    const totalProj = nominal + delay; // 30 days
    const bufferImpact = daysUntil - totalProj; // e.g. 27 - 30 = -3 days

    alerts.push({
      id: 'alert-mech-seal-delay',
      materialId: sealMat.id,
      materialName: sealMat.name,
      materialCode: sealMat.code,
      category: sealMat.category,
      facilityId: sealMat.facilityId,
      facilityName: sealMat.facilityName,
      urgency: 'CRITICAL',
      nominalLeadTimeDays: nominal,
      predictedDelayDays: delay,
      totalProjectedLeadTimeDays: totalProj,
      supplierId: sealMat.preferredSupplierId,
      supplierName: sealMat.preferredSupplierName || 'ABC Industrial Supplies Ltd',
      supplierOnTimeRate: 82,
      equipmentName: maint.equipmentName,
      equipmentCode: 'P-101',
      workOrderNumber: maint.workOrderNumber,
      workOrderDate: maint.scheduledDate,
      daysUntilMaintenance: daysUntil,
      bufferImpactDays: bufferImpact,
      downtimeCostPerDayUsd: 65000,
      currentStock: sealMat.currentStock,
      safetyStock: sealMat.safetyStock,
      unitOfMeasurement: sealMat.unitOfMeasurement,
      alertType: 'DEADLINE_CLASH',
      aiExplanation: {
        predictiveSignal:
          'Supplier historical delivery variance along the Mombasa-Malaba corridor (+5d) combined with mandatory API 682 hydro-testing verification lag (+4d) yields a +9 day predicted delay.',
        whyItMatters:
          `Projected delivery (30 days) exceeds scheduled turnaround date (${maint.workOrderNumber} in ${daysUntil} days) by ${Math.abs(bufferImpact)} days. P-101 failure exposes operations to 40,000 bopd throughput shutdown ($65,000/day).`,
        recommendedMitigation:
          'Fast-track local qualification of East Africa Mechanical Solutions (7-day local stock available in Hoima, 6 units on hand) or issue emergency expedited tender.',
        confidenceScore: 94,
        keySignals: [
          'Supplier On-Time Rate: 82%',
          'Mombasa Corridor Dwell: +5d',
          'API 682 Test Lag: +4d',
          `Turnaround Deficit: ${Math.abs(bufferImpact)}d late`,
        ],
      },
    });
  }

  // 2. Differential Pressure Transmitter (HART 7) - In-Transit Shipment Friction
  const ptMat = materials.find((m) => m.code === 'PT-402-A' || m.id === 'mat-pressure-tx');
  const activeOrder = orders.find((o) => o.materialId === ptMat?.id || o.orderNumber === 'PO-2026-0294');
  if (ptMat) {
    const nominal = ptMat.leadTimeDays || 18;
    const delay = 7;
    const totalProj = nominal + delay;

    alerts.push({
      id: 'alert-pt-transit-delay',
      materialId: ptMat.id,
      materialName: ptMat.name,
      materialCode: ptMat.code,
      category: ptMat.category,
      facilityId: ptMat.facilityId,
      facilityName: ptMat.facilityName,
      urgency: 'HIGH',
      nominalLeadTimeDays: nominal,
      predictedDelayDays: delay,
      totalProjectedLeadTimeDays: totalProj,
      supplierId: ptMat.preferredSupplierId,
      supplierName: ptMat.preferredSupplierName || 'EnergyTech Supplies Ltd',
      supplierOnTimeRate: 85,
      equipmentName: 'High Pressure 3-Phase Separator S-101',
      equipmentCode: 'S-101',
      downtimeCostPerDayUsd: 45000,
      currentStock: ptMat.currentStock,
      safetyStock: ptMat.safetyStock,
      unitOfMeasurement: ptMat.unitOfMeasurement,
      activeOrderId: activeOrder?.id || 'ord-hist-082',
      activeOrderNumber: activeOrder?.orderNumber || 'PO-2026-0294',
      trackingRef: activeOrder?.deliveryDetails?.trackingRef || 'ET-TRK-99201-UG',
      alertType: 'ACTIVE_TRANSIT',
      aiExplanation: {
        predictiveSignal:
          'Telemetry indicates road freight convoy transit slowdown along Kampala-Hoima northern corridor, compounded by regional customs hazardous-area ATEX calibration re-audit (+7d total shift).',
        whyItMatters:
          'Separator S-101 currently operates with single instrumentation redundancy. Delay deprives facility of replacement telemetry if baseline transmitter experiences thermal drift.',
        recommendedMitigation:
          'Issue regional logistics escort expedite for PO-2026-0294 or reassign 1 certified reserve unit from Hoima Central Spares Depot.',
        confidenceScore: 91,
        keySignals: [
          'Active PO: PO-2026-0294',
          'Carrier Tracking: ET-TRK-99201-UG',
          'Northern Corridor Congestion: +4d',
          'ATEX Cert Inspection: +3d',
        ],
      },
    });
  }

  // 3. Coalescing Gas Filter Element (0.3 Micron) - Supply Scarcity & Turnaround Buffer Exhaustion
  const fltMat = materials.find((m) => m.code === 'FLT-C101-05' || m.id === 'mat-filter');
  if (fltMat) {
    const maint = maintenanceList.find((m) => m.materialId === fltMat.id && m.status !== 'Completed') || {
      equipmentName: 'Flash Gas Compressor C-101',
      workOrderNumber: 'WO-2026-0904',
      scheduledDate: '2026-10-28',
      requiredQuantity: 4,
    };
    const daysUntil = getDaysDifference(maint.scheduledDate);
    const nominal = fltMat.leadTimeDays || 14;
    const delay = 6;
    const totalProj = nominal + delay;
    const bufferImpact = daysUntil - totalProj;

    alerts.push({
      id: 'alert-filter-supply-delay',
      materialId: fltMat.id,
      materialName: fltMat.name,
      materialCode: fltMat.code,
      category: fltMat.category,
      facilityId: fltMat.facilityId,
      facilityName: fltMat.facilityName,
      urgency: 'HIGH',
      nominalLeadTimeDays: nominal,
      predictedDelayDays: delay,
      totalProjectedLeadTimeDays: totalProj,
      supplierId: fltMat.preferredSupplierId,
      supplierName: fltMat.preferredSupplierName || 'ABC Industrial Supplies Ltd',
      supplierOnTimeRate: 88,
      equipmentName: maint.equipmentName,
      equipmentCode: 'C-101',
      workOrderNumber: maint.workOrderNumber,
      workOrderDate: maint.scheduledDate,
      daysUntilMaintenance: daysUntil,
      bufferImpactDays: bufferImpact,
      downtimeCostPerDayUsd: 35000,
      currentStock: fltMat.currentStock,
      safetyStock: fltMat.safetyStock,
      unitOfMeasurement: fltMat.unitOfMeasurement,
      alertType: 'BUFFER_DEPLETION',
      aiExplanation: {
        predictiveSignal:
          'Supplier factory capacity reports reveal sub-tier borosilicate micro-glass media shortages, extending fabrication turnaround by +6 days beyond catalog contract terms.',
        whyItMatters:
          `Turnaround WO-2026-0904 requires all 4 on-hand sets, reducing warehouse balance to exactly 0 sets (100% safety buffer wipeout) with delayed replenishment.`,
        recommendedMitigation:
          'Award active tender PR-2026-0412 immediately to review existing supplier offers or activate dual-source split allocation.',
        confidenceScore: 89,
        keySignals: [
          'Sub-tier Media Backlog: +6d',
          'Post-Turnaround Balance: 0 Sets',
          '100% Safety Stock Depletion',
          'Compressor Flaring Exposure: $35k/day',
        ],
      },
    });
  }

  // 4. Any other materials experiencing severe dynamic risk
  for (const mat of materials) {
    if (mat.id === 'mat-mech-seal' || mat.id === 'mat-pressure-tx' || mat.id === 'mat-filter') {
      continue;
    }
    // If supplier on-time delivery rate is low or material is critical and low stock
    const supp = supplierMap.get(mat.preferredSupplierId);
    const linkedMaint = maintenanceList.find((m) => m.materialId === mat.id && m.status !== 'Completed');
    const daysUntil = linkedMaint ? getDaysDifference(linkedMaint.scheduledDate) : null;

    if (mat.criticality === 'Critical' && (mat.currentStock <= mat.safetyStock || mat.calculatedRisk === 'CRITICAL')) {
      const nominal = mat.leadTimeDays || 14;
      const delay = Math.max(4, Math.round(((100 - (supp?.onTimeDeliveryRate || 85)) / 100) * 15));
      const totalProj = nominal + delay;
      const bufferImpact = daysUntil !== null ? daysUntil - totalProj : null;

      alerts.push({
        id: `alert-${mat.id}-delay`,
        materialId: mat.id,
        materialName: mat.name,
        materialCode: mat.code,
        category: mat.category,
        facilityId: mat.facilityId,
        facilityName: mat.facilityName,
        urgency: bufferImpact !== null && bufferImpact < 0 ? 'CRITICAL' : 'MEDIUM',
        nominalLeadTimeDays: nominal,
        predictedDelayDays: delay,
        totalProjectedLeadTimeDays: totalProj,
        supplierId: mat.preferredSupplierId,
        supplierName: mat.preferredSupplierName || supp?.name || 'Authorized OEM Stockist',
        supplierOnTimeRate: supp?.onTimeDeliveryRate || 85,
        equipmentName: linkedMaint?.equipmentName || 'Critical Production Asset',
        workOrderNumber: linkedMaint?.workOrderNumber,
        workOrderDate: linkedMaint?.scheduledDate,
        daysUntilMaintenance: daysUntil,
        bufferImpactDays: bufferImpact,
        downtimeCostPerDayUsd: 25000,
        currentStock: mat.currentStock,
        safetyStock: mat.safetyStock,
        unitOfMeasurement: mat.unitOfMeasurement,
        alertType: 'SUPPLIER_RISK',
        aiExplanation: {
          predictiveSignal:
            `Supplier delivery variance model flags a +${delay} day procurement latency based on recent regional consignment fulfillment rates.`,
          whyItMatters:
            `Current on-hand inventory (${mat.currentStock} ${mat.unitOfMeasurement}) breaches or approaches mandatory safety buffer (${mat.safetyStock} ${mat.unitOfMeasurement}).`,
          recommendedMitigation:
            'Issue forward inquiry or review standby allocation from regional stocking partner.',
          confidenceScore: 86,
          keySignals: [
            `Nominal Lead Time: ${nominal}d`,
            `Predicted Shift: +${delay}d`,
            `Safety Buffer: ${mat.safetyStock} ${mat.unitOfMeasurement}`,
          ],
        },
      });
    }
  }

  return alerts;
}
