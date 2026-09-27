// Centralized simulated demo data for ABC Industrial Supplies Ltd
export interface SupplierRFQ {
  id: string;
  rfqNumber: string;
  materialCode: string;
  materialName: string;
  category: string;
  quantity: number;
  unit: string;
  requiredDate: string;
  criticality: 'Critical' | 'High' | 'Medium' | 'Low';
  buyer: string;
  deliveryLocation: string;
  closingDate: string;
  status: 'Open' | 'Closed' | 'Under Review';
  specifications: string;
  certificationRequirement: string;
  estimatedBudgetUGX?: number;
}

export interface SupplierInventoryItem {
  id: string;
  materialCode: string;
  materialName: string;
  category: string;
  availableQuantity: number;
  reservedQuantity: number;
  availableToOffer: number;
  unit: string;
  warehouse: string;
  leadTimeDays: number;
  status: 'Available' | 'Limited' | 'Out of Stock';
  lastUpdated: string;
  unitPriceUGX: number;
}

export interface SupplierOfferItem {
  id: string;
  rfqNumber: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  unitPriceUGX: number;
  leadTimeDays: number;
  totalValueUGX: number;
  submittedDate: string;
  status: 'Under Review' | 'Accepted' | 'Declined' | 'Withdrawn';
  validityDate: string;
  certificationOffered: string;
  notes: string;
}

export interface SupplierOrderItem {
  id: string;
  orderNumber: string;
  buyer: string;
  materialCode: string;
  materialName: string;
  quantity: number;
  unitPriceUGX: number;
  totalValueUGX: number;
  orderDate: string;
  requiredDate: string;
  status: 'Order Received' | 'Confirmed' | 'Preparing' | 'Dispatched' | 'In Delivery' | 'Delivered';
  expectedDispatch: string;
  trackingNumber?: string;
  carrier?: string;
  deliveryLocation: string;
  notes?: string;
}

export interface StockMovement {
  id: string;
  timestamp: string;
  materialCode: string;
  materialName: string;
  reference: string;
  type: 'ADD' | 'RESERVE' | 'RELEASE' | 'DISPATCH';
  quantityDelta: number;
  newBalance: number;
  reason: string;
}

export const INITIAL_RFQS: SupplierRFQ[] = [
  {
    id: 'rfq-0142',
    rfqNumber: 'RFQ-2026-0142',
    materialCode: 'MS-240',
    materialName: 'Mechanical Seal MS-240 (API 682 Dual)',
    category: 'Rotating Equipment',
    quantity: 6,
    unit: 'EA',
    requiredDate: '2026-10-20',
    criticality: 'Critical',
    buyer: 'Demo Oil & Gas Company',
    deliveryLocation: 'Hoima Base / Kingfisher CPF',
    closingDate: '2026-10-10',
    status: 'Open',
    specifications: 'API 682 4th Ed Plan 53A dual pressurized cartridge seal for crude transfer pump P-101. Silicon carbide vs carbon faces.',
    certificationRequirement: 'API 682, ISO 9001:2015, Mill Test Certificate 3.1',
    estimatedBudgetUGX: 17_100_000,
  },
  {
    id: 'rfq-0138',
    rfqNumber: 'RFQ-2026-0138',
    materialCode: 'PB-118',
    materialName: 'Pump Bearing PB-118 (Duplex Angular)',
    category: 'Bearings',
    quantity: 8,
    unit: 'EA',
    requiredDate: '2026-10-28',
    criticality: 'High',
    buyer: 'Demo Oil & Gas Company',
    deliveryLocation: 'Central Processing Facility (CPF-1)',
    closingDate: '2026-10-15',
    status: 'Open',
    specifications: 'SKF/FAG 7312 BECBM matched duplex angular contact ball bearings with machined brass cage.',
    certificationRequirement: 'Certificate of Conformity, Anti-Counterfeit Verification',
    estimatedBudgetUGX: 11_600_000,
  },
  {
    id: 'rfq-0131',
    rfqNumber: 'RFQ-2026-0131',
    materialCode: 'VA-302',
    materialName: 'Valve Actuator VA-302 (Pneumatic Quarter-Turn)',
    category: 'Valves',
    quantity: 4,
    unit: 'EA',
    requiredDate: '2026-11-05',
    criticality: 'Medium',
    buyer: 'Demo Oil & Gas Company',
    deliveryLocation: 'Tilenga Wellpad 3 Hub',
    closingDate: '2026-10-22',
    status: 'Open',
    specifications: 'Double-acting scotch-yoke pneumatic actuator, 1500 Nm torque output at 5.5 bar instrument air. ATEX Zone 1.',
    certificationRequirement: 'ATEX II 2G Ex d, SIL 3 Functional Safety',
    estimatedBudgetUGX: 16_800_000,
  },
  {
    id: 'rfq-0149',
    rfqNumber: 'RFQ-2026-0149',
    materialCode: 'IF-420',
    materialName: 'Industrial Filter IF-420 (Coalescing Element)',
    category: 'Filtration',
    quantity: 12,
    unit: 'EA',
    requiredDate: '2026-11-12',
    criticality: 'High',
    buyer: 'Demo Oil & Gas Company',
    deliveryLocation: 'Hoima Central Spares Depot',
    closingDate: '2026-10-30',
    status: 'Open',
    specifications: '0.3 Micron micro-glass gas coalescing element with fluorocarbon fluoroelastomer seals.',
    certificationRequirement: 'ISO 2942, Bubble Point Verification Sheet',
    estimatedBudgetUGX: 7_800_000,
  },
  {
    id: 'rfq-0155',
    rfqNumber: 'RFQ-2026-0155',
    materialCode: 'PT-510',
    materialName: 'Pressure Transmitter PT-510 (HART / 4-20mA)',
    category: 'Instrumentation',
    quantity: 6,
    unit: 'EA',
    requiredDate: '2026-11-18',
    criticality: 'Critical',
    buyer: 'Demo Oil & Gas Company',
    deliveryLocation: 'CPF-1 Gas Processing Module',
    closingDate: '2026-11-05',
    status: 'Open',
    specifications: 'Rosemount / Yokogawa gauge pressure transmitter, Hastelloy C-276 diaphragm, 0-100 bar range.',
    certificationRequirement: 'IECEx Ex ia IIC T4 Ga, Factory Calibration 5-point report',
    estimatedBudgetUGX: 19_500_000,
  },
  {
    id: 'rfq-0160',
    rfqNumber: 'RFQ-2026-0160',
    materialCode: 'FG-210',
    materialName: 'Spiral Wound Flange Gasket FG-210 (6" 600#)',
    category: 'Mechanical',
    quantity: 40,
    unit: 'EA',
    requiredDate: '2026-11-25',
    criticality: 'Medium',
    buyer: 'Demo Oil & Gas Company',
    deliveryLocation: 'Feeder Pipeline Station 1',
    closingDate: '2026-11-12',
    status: 'Open',
    specifications: 'ASME B16.20 316L SS winding with flexible graphite filler, carbon steel outer centering ring.',
    certificationRequirement: 'EN 10204 Type 3.1, Fire Safe API 6FB',
    estimatedBudgetUGX: 6_000_000,
  },
  {
    id: 'rfq-0164',
    rfqNumber: 'RFQ-2026-0164',
    materialCode: 'CV-330',
    materialName: 'Control Valve CV-330 (Severe Service Trim)',
    category: 'Valves',
    quantity: 2,
    unit: 'EA',
    requiredDate: '2026-12-02',
    criticality: 'High',
    buyer: 'Demo Oil & Gas Company',
    deliveryLocation: 'Kingfisher Separation Unit',
    closingDate: '2026-11-18',
    status: 'Open',
    specifications: 'Fisher / Flowserve 3-inch ANSI 900 globe control valve with ceramic erosion-resistant trim.',
    certificationRequirement: 'API 6D, NACE MR0175 Sour Service Certificate',
    estimatedBudgetUGX: 28_000_000,
  },
];

export const INITIAL_INVENTORY: SupplierInventoryItem[] = [
  {
    id: 'inv-ms240',
    materialCode: 'MS-240',
    materialName: 'Mechanical Seal MS-240',
    category: 'Rotating Equipment',
    availableQuantity: 12,
    reservedQuantity: 4,
    availableToOffer: 8,
    unit: 'EA',
    warehouse: 'Kampala Warehouse',
    leadTimeDays: 14,
    status: 'Available',
    lastUpdated: '2026-09-24',
    unitPriceUGX: 2_850_000,
  },
  {
    id: 'inv-pb118',
    materialCode: 'PB-118',
    materialName: 'Pump Bearing PB-118',
    category: 'Bearings',
    availableQuantity: 25,
    reservedQuantity: 8,
    availableToOffer: 17,
    unit: 'EA',
    warehouse: 'Kampala Warehouse',
    leadTimeDays: 7,
    status: 'Available',
    lastUpdated: '2026-09-23',
    unitPriceUGX: 1_450_000,
  },
  {
    id: 'inv-va302',
    materialCode: 'VA-302',
    materialName: 'Valve Actuator VA-302',
    category: 'Valves',
    availableQuantity: 6,
    reservedQuantity: 2,
    availableToOffer: 4,
    unit: 'EA',
    warehouse: 'Kampala Warehouse',
    leadTimeDays: 21,
    status: 'Limited',
    lastUpdated: '2026-09-22',
    unitPriceUGX: 4_200_000,
  },
  {
    id: 'inv-if420',
    materialCode: 'IF-420',
    materialName: 'Industrial Filter IF-420',
    category: 'Filtration',
    availableQuantity: 35,
    reservedQuantity: 5,
    availableToOffer: 30,
    unit: 'EA',
    warehouse: 'Main Warehouse',
    leadTimeDays: 5,
    status: 'Available',
    lastUpdated: '2026-09-24',
    unitPriceUGX: 650_000,
  },
  {
    id: 'inv-pt510',
    materialCode: 'PT-510',
    materialName: 'Pressure Transmitter PT-510',
    category: 'Instrumentation',
    availableQuantity: 9,
    reservedQuantity: 3,
    availableToOffer: 6,
    unit: 'EA',
    warehouse: 'Kampala Warehouse',
    leadTimeDays: 14,
    status: 'Available',
    lastUpdated: '2026-09-21',
    unitPriceUGX: 3_250_000,
  },
  {
    id: 'inv-fg210',
    materialCode: 'FG-210',
    materialName: 'Flange Gasket FG-210',
    category: 'Mechanical',
    availableQuantity: 80,
    reservedQuantity: 20,
    availableToOffer: 60,
    unit: 'EA',
    warehouse: 'Main Warehouse',
    leadTimeDays: 3,
    status: 'Available',
    lastUpdated: '2026-09-20',
    unitPriceUGX: 150_000,
  },
  {
    id: 'inv-cv330',
    materialCode: 'CV-330',
    materialName: 'Control Valve CV-330',
    category: 'Valves',
    availableQuantity: 4,
    reservedQuantity: 1,
    availableToOffer: 3,
    unit: 'EA',
    warehouse: 'Kampala Warehouse',
    leadTimeDays: 28,
    status: 'Limited',
    lastUpdated: '2026-09-19',
    unitPriceUGX: 14_000_000,
  },
];

export const INITIAL_OFFERS: SupplierOfferItem[] = [
  {
    id: 'OFF-2031',
    rfqNumber: 'RFQ-2026-0142',
    materialCode: 'MS-240',
    materialName: 'Mechanical Seal MS-240',
    quantity: 6,
    unitPriceUGX: 2_850_000,
    leadTimeDays: 14,
    totalValueUGX: 17_100_000,
    submittedDate: '2026-09-18',
    status: 'Under Review',
    validityDate: '2026-10-18',
    certificationOffered: 'API 682 4th Ed, Mill Test 3.1, Pressure Test Cert',
    notes: 'Nitrogen-purged packaging, immediate dispatch capability from 6th Street depot.',
  },
  {
    id: 'OFF-2028',
    rfqNumber: 'RFQ-2026-0138',
    materialCode: 'PB-118',
    materialName: 'Pump Bearing PB-118',
    quantity: 8,
    unitPriceUGX: 1_450_000,
    leadTimeDays: 7,
    totalValueUGX: 11_600_000,
    submittedDate: '2026-09-17',
    status: 'Accepted',
    validityDate: '2026-10-17',
    certificationOffered: 'SKF Original Factory Origin Cert, Anti-Falsification QR Verification',
    notes: 'In-stock Kampala central locker, rapid courier delivery to CPF-1.',
  },
  {
    id: 'OFF-2024',
    rfqNumber: 'RFQ-2026-0131',
    materialCode: 'VA-302',
    materialName: 'Valve Actuator VA-302',
    quantity: 4,
    unitPriceUGX: 4_200_000,
    leadTimeDays: 21,
    totalValueUGX: 16_800_000,
    submittedDate: '2026-09-15',
    status: 'Under Review',
    validityDate: '2026-10-15',
    certificationOffered: 'ATEX II 2G Ex d, SIL 3 Functional Safety Cert',
    notes: 'Includes mounting bracket kit and calibrated limit switches.',
  },
  {
    id: 'OFF-2019',
    rfqNumber: 'RFQ-2026-0149',
    materialCode: 'IF-420',
    materialName: 'Industrial Filter IF-420',
    quantity: 12,
    unitPriceUGX: 650_000,
    leadTimeDays: 5,
    totalValueUGX: 7_800_000,
    submittedDate: '2026-09-12',
    status: 'Accepted',
    validityDate: '2026-10-12',
    certificationOffered: 'ISO 2942 Bubble Point Inspection Sheet',
    notes: 'Complete set of replacement microglass elements with Viton O-rings.',
  },
];

export const INITIAL_ORDERS: SupplierOrderItem[] = [
  {
    id: 'NX-ORD-1024',
    orderNumber: 'NX-ORD-1024',
    buyer: 'Demo Oil & Gas Company',
    materialCode: 'MS-240',
    materialName: 'Mechanical Seal MS-240',
    quantity: 6,
    unitPriceUGX: 2_850_000,
    totalValueUGX: 17_100_000,
    orderDate: '2026-09-21',
    requiredDate: '2026-10-20',
    status: 'Preparing',
    expectedDispatch: '2026-10-04',
    trackingNumber: 'TRK-UG-9042',
    carrier: 'Albertine Logistics Fleet Carrier 04',
    deliveryLocation: 'Hoima Base / Kingfisher CPF',
    notes: 'Critical spare for Crude Transfer Pump P-101 scheduled maintenance.',
  },
  {
    id: 'NX-ORD-1021',
    orderNumber: 'NX-ORD-1021',
    buyer: 'Demo Oil & Gas Company',
    materialCode: 'PB-118',
    materialName: 'Pump Bearing PB-118',
    quantity: 8,
    unitPriceUGX: 1_450_000,
    totalValueUGX: 11_600_000,
    orderDate: '2026-09-18',
    requiredDate: '2026-10-28',
    status: 'In Delivery',
    expectedDispatch: '2026-09-23',
    trackingNumber: 'TRK-UG-8831',
    carrier: 'Speedline Express Hoima Service',
    deliveryLocation: 'Central Processing Facility (CPF-1)',
    notes: 'In-transit from Kampala depot. Current GPS milestone: Luwero corridor.',
  },
  {
    id: 'NX-ORD-1017',
    orderNumber: 'NX-ORD-1017',
    buyer: 'Demo Oil & Gas Company',
    materialCode: 'VA-302',
    materialName: 'Valve Actuator VA-302',
    quantity: 4,
    unitPriceUGX: 4_200_000,
    totalValueUGX: 16_800_000,
    orderDate: '2026-09-10',
    requiredDate: '2026-11-05',
    status: 'Delivered',
    expectedDispatch: '2026-09-16',
    trackingNumber: 'TRK-UG-7619',
    carrier: 'Albertine Logistics Fleet Carrier 02',
    deliveryLocation: 'Tilenga Wellpad 3 Hub',
    notes: 'Goods delivered and accepted by Buyer Receiving Engineer Patrick Kato.',
  },
  {
    id: 'NX-ORD-1012',
    orderNumber: 'NX-ORD-1012',
    buyer: 'Demo Oil & Gas Company',
    materialCode: 'IF-420',
    materialName: 'Industrial Filter IF-420',
    quantity: 12,
    unitPriceUGX: 650_000,
    totalValueUGX: 7_800_000,
    orderDate: '2026-09-14',
    requiredDate: '2026-11-12',
    status: 'Confirmed',
    expectedDispatch: '2026-10-02',
    trackingNumber: 'TRK-UG-8204',
    carrier: 'Trans-Uganda Freight Ltd',
    deliveryLocation: 'Hoima Central Spares Depot',
    notes: 'PO confirmed, packaging inspection scheduled at Kampala warehouse.',
  },
];

export const INITIAL_STOCK_MOVEMENTS: StockMovement[] = [
  {
    id: 'sm-01',
    timestamp: '2026-09-24 14:30',
    materialCode: 'MS-240',
    materialName: 'Mechanical Seal MS-240',
    reference: 'PO-RES-1024',
    type: 'RESERVE',
    quantityDelta: -4,
    newBalance: 8,
    reason: 'Stock reserved for confirmed order NX-ORD-1024',
  },
  {
    id: 'sm-02',
    timestamp: '2026-09-23 10:15',
    materialCode: 'PB-118',
    materialName: 'Pump Bearing PB-118',
    reference: 'DSP-8831',
    type: 'DISPATCH',
    quantityDelta: -8,
    newBalance: 17,
    reason: 'Dispatched to Speedline Express for delivery to CPF-1',
  },
  {
    id: 'sm-03',
    timestamp: '2026-09-20 16:45',
    materialCode: 'FG-210',
    materialName: 'Flange Gasket FG-210',
    reference: 'REC-KLA-441',
    type: 'ADD',
    quantityDelta: +25,
    newBalance: 60,
    reason: 'Regional replenishment stock received from manufacturer',
  },
  {
    id: 'sm-04',
    timestamp: '2026-09-18 11:20',
    materialCode: 'VA-302',
    materialName: 'Valve Actuator VA-302',
    reference: 'DEL-7619',
    type: 'DISPATCH',
    quantityDelta: -4,
    newBalance: 4,
    reason: 'Final delivery completion to Tilenga Wellpad 3',
  },
];
