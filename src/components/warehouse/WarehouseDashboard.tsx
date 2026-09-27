import React, { useState } from 'react';
import {
  Warehouse as WarehouseIcon,
  Package,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Clock,
  Shield,
  MapPin,
  DollarSign,
  Boxes,
  Truck,
  FileSpreadsheet,
  Calendar,
  Layers,
  CheckCircle2,
  XCircle,
  X,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Warehouse,
  Material,
  InventoryTransaction,
  TransactionType,
  OilGasCategory,
} from '../../types';
import { store } from '../../services/store';
import { formatUGX, formatUSD, convertUsdToUgx } from '../../utils/currency';

const OG_CATEGORIES: { id: string; label: string }[] = [
  { id: 'ALL', label: 'All Inventory' },
  { id: 'Drilling Equipment', label: 'Drilling Equipment' },
  { id: 'Production Equipment', label: 'Production Equipment' },
  { id: 'Pipeline Equipment', label: 'Pipeline Equipment' },
  { id: 'Safety Equipment', label: 'Safety Equipment' },
  { id: 'Electrical & Switchgear', label: 'Electrical & Instrumentation' },
  { id: 'Vehicles & Heavy Equipment', label: 'Vehicles & Heavy Equipment' },
  { id: 'Consumables & Lubricants', label: 'Consumables & Lubricants' },
  { id: 'Rotating Equipment', label: 'Rotating Equipment' },
  { id: 'Instrumentation & Valves', label: 'Valves & Instrumentation' },
];

export const WarehouseDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'warehouses' | 'transactions'>('inventory');
  const [currency, setCurrency] = useState<'UGX' | 'USD'>('UGX');
  const [valuationMethod, setValuationMethod] = useState<'FIFO' | 'WEIGHTED_AVERAGE'>('WEIGHTED_AVERAGE');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('ALL');
  const [selectedAlertFilter, setSelectedAlertFilter] = useState<string>('ALL');

  // Modals
  const [isNewItemModalOpen, setIsNewItemModalOpen] = useState(false);
  const [isNewWarehouseModalOpen, setIsNewWarehouseModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [transactionMaterial, setTransactionMaterial] = useState<Material | null>(null);
  const [viewingItem, setViewingItem] = useState<Material | null>(null);
  const [viewingWarehouse, setViewingWarehouse] = useState<Warehouse | null>(null);

  const warehouses = store.getWarehouses();
  const materials = store.getMaterials();
  const transactions = store.getTransactions();
  const orders = store.getOrders();

  // Stock calculations
  const totalStockItems = materials.length;
  const lowStockItems = materials.filter((m) => m.currentStock > 0 && m.currentStock <= m.minimumStock).length;
  const outOfStockItems = materials.filter((m) => m.currentStock === 0).length;
  const expiringStockItems = materials.filter((m) => m.expiryDate && new Date(m.expiryDate) < new Date('2026-12-31')).length;
  const overstockItems = materials.filter((m) => m.maximumStock && m.currentStock > m.maximumStock).length;

  // Valuation calculation
  // FIFO vs Weighted Average simulation modifier
  const valuationFactor = valuationMethod === 'FIFO' ? 1.025 : 1.0;

  const totalInventoryValueUSD = materials.reduce((sum, m) => sum + m.currentStock * m.unitCost * valuationFactor, 0);
  const totalInventoryValueUGX = materials.reduce(
    (sum, m) => sum + (m.unitCostUGX ? m.currentStock * m.unitCostUGX * valuationFactor : convertUsdToUgx(m.currentStock * m.unitCost * valuationFactor)),
    0
  );

  // Month transaction volumes
  const stockReceivedThisMonth = transactions
    .filter((t) => t.type === 'RECEIPT' || t.type === 'Goods Received')
    .reduce((sum, t) => sum + t.quantity, 0);

  const stockIssuedThisMonth = transactions
    .filter((t) => t.type === 'ISSUE' || t.type === 'Goods Issued')
    .reduce((sum, t) => sum + t.quantity, 0);

  const stockAdjustmentsCount = transactions.filter(
    (t) => t.type === 'ADJUSTMENT' || t.type === 'Stock Adjustment' || t.type === 'Stock Count'
  ).length;

  const pendingPOsCount = orders.filter(
    (o) => o.status === 'SUBMITTED' || o.status === 'ACCEPTED' || o.status === 'CONFIRMED' || o.status === 'PREPARING' || o.status === 'IN DELIVERY'
  ).length;

  // Filtered Materials
  const filteredMaterials = materials.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.serialNumber && m.serialNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.binLocation && m.binLocation.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.brand && m.brand.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCat = selectedCategory === 'ALL' || m.category === selectedCategory;
    const matchesWh = selectedWarehouseId === 'ALL' || m.warehouseId === selectedWarehouseId;

    let matchesAlert = true;
    if (selectedAlertFilter === 'LOW') matchesAlert = m.currentStock > 0 && m.currentStock <= m.minimumStock;
    if (selectedAlertFilter === 'OUT') matchesAlert = m.currentStock === 0;
    if (selectedAlertFilter === 'OVER') matchesAlert = !!(m.maximumStock && m.currentStock > m.maximumStock);
    if (selectedAlertFilter === 'EXPIRING') matchesAlert = !!(m.expiryDate && new Date(m.expiryDate) < new Date('2026-12-31'));

    return matchesSearch && matchesCat && matchesWh && matchesAlert;
  });

  // Handle record new transaction
  const handleExecuteTransaction = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const materialId = String(formData.get('materialId'));
    const type = formData.get('type') as TransactionType;
    const qty = Number(formData.get('quantity'));
    const reason = String(formData.get('reason'));
    const reference = String(formData.get('reference'));
    const toWarehouseId = String(formData.get('toWarehouseId') || '');

    store.recordInventoryTransaction({
      materialId,
      type,
      quantity: qty,
      reason,
      reference,
      toWarehouseId: toWarehouseId || undefined,
    });

    setIsTransactionModalOpen(false);
    setTransactionMaterial(null);
  };

  // Handle register warehouse
  const handleSaveWarehouse = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    store.addWarehouse({
      name: String(formData.get('name')),
      code: String(formData.get('code') || `WH-${Date.now().toString().slice(-4)}`),
      type: formData.get('type') as any,
      facilityId: 'fac-cpf',
      location: String(formData.get('location')),
      physicalAddress: String(formData.get('physicalAddress') || ''),
      gpsCoordinates: {
        lat: 1.48,
        lng: 31.35,
        formatted: String(formData.get('gpsCoordinates') || '1.4821° N, 31.3542° E (Albertine Base)'),
      },
      managerName: String(formData.get('managerName') || ''),
      contactPhone: String(formData.get('contactPhone') || ''),
      contactEmail: String(formData.get('contactEmail') || ''),
      capacityDescription: String(formData.get('capacityDescription') || '5,000 m² heavy storage'),
      currentUtilizationPercent: Number(formData.get('currentUtilizationPercent') || 50),
      securityLevel: formData.get('securityLevel') as any,
      operatingHours: String(formData.get('operatingHours') || '24/7 Security Controlled'),
      status: 'OPERATIONAL',
      organizationId: 'org-demo-oil-gas',
    });
    setIsNewWarehouseModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Spares & Supply Base
            </span>
            <span className="text-xs text-slate-400">Upstream & Midstream Storage</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <WarehouseIcon className="w-6 h-6 text-amber-400" />
            Warehouse & Inventory Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise inventory tracking for drilling tools, valves, pipelines, safety gears, and consumables across all depots.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Valuation Method */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1 text-xs">
            <span className="text-slate-400 px-2 text-[11px] font-medium flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3 text-amber-400" />
              Valuation:
            </span>
            <button
              onClick={() => setValuationMethod('WEIGHTED_AVERAGE')}
              className={`px-2.5 py-1 rounded cursor-pointer font-semibold transition-colors ${
                valuationMethod === 'WEIGHTED_AVERAGE'
                  ? 'bg-amber-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Weighted Avg
            </button>
            <button
              onClick={() => setValuationMethod('FIFO')}
              className={`px-2.5 py-1 rounded cursor-pointer font-semibold transition-colors ${
                valuationMethod === 'FIFO' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              FIFO
            </button>
          </div>

          {/* Currency Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1 text-xs font-semibold">
            <button
              onClick={() => setCurrency('UGX')}
              className={`px-3 py-1 rounded cursor-pointer transition-colors ${
                currency === 'UGX' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              UGX
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded cursor-pointer transition-colors ${
                currency === 'USD' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              USD
            </button>
          </div>

          <button
            onClick={() => {
              setTransactionMaterial(materials[0]);
              setIsTransactionModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 font-semibold text-xs transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            Stock Movement
          </button>

          <button
            onClick={() => setIsNewWarehouseModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Warehouse
          </button>
        </div>
      </div>

      {/* Stock Alerts Notice */}
      {(lowStockItems > 0 || outOfStockItems > 0 || expiringStockItems > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {outOfStockItems > 0 && (
            <div className="bg-rose-950/40 border border-rose-800/60 rounded-xl p-3 flex items-center justify-between text-rose-200">
              <div className="flex items-center gap-2.5">
                <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
                <div>
                  <span className="font-bold text-xs text-rose-300">{outOfStockItems} Items Out of Stock</span>
                  <p className="text-[10px] text-rose-300/80">Immediate replenishment required</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlertFilter('OUT')}
                className="px-2 py-1 rounded bg-rose-600/30 hover:bg-rose-600/50 text-rose-200 text-[11px] font-semibold cursor-pointer"
              >
                Filter
              </button>
            </div>
          )}

          {lowStockItems > 0 && (
            <div className="bg-amber-950/40 border border-amber-800/60 rounded-xl p-3 flex items-center justify-between text-amber-200">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold text-xs text-amber-300">{lowStockItems} Items Below Safety Level</span>
                  <p className="text-[10px] text-amber-300/80">Reorder trigger activated</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlertFilter('LOW')}
                className="px-2 py-1 rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-200 text-[11px] font-semibold cursor-pointer"
              >
                Filter
              </button>
            </div>
          )}

          {expiringStockItems > 0 && (
            <div className="bg-blue-950/40 border border-blue-800/60 rounded-xl p-3 flex items-center justify-between text-blue-200">
              <div className="flex items-center gap-2.5">
                <Clock className="w-5 h-5 text-blue-400 shrink-0" />
                <div>
                  <span className="font-bold text-xs text-blue-300">{expiringStockItems} Expiring Lots / Shelf Items</span>
                  <p className="text-[10px] text-blue-300/80">Chemicals, seals & lubricants</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAlertFilter('EXPIRING')}
                className="px-2 py-1 rounded bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 text-[11px] font-semibold cursor-pointer"
              >
                Filter
              </button>
            </div>
          )}
        </div>
      )}

      {/* Warehouse Logistics Network Visual Spotlight */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900 overflow-hidden flex flex-col lg:flex-row shadow-lg">
        <div className="relative lg:w-72 h-44 lg:h-auto overflow-hidden bg-slate-800 shrink-0">
          <img
            src="/images/warehouse_spares_depot_1790284590984.jpg"
            alt="Central Oil and Gas Logistics Depot"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-900/90 border border-sky-400/40 text-[10px] font-bold text-sky-400 uppercase tracking-wider">
            Automated Spares Hub
          </div>
        </div>
        <div className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">Regional Supply Logistics</span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400">Lake Albert Basin Logistics Base (Buseruka, Hoima)</span>
            </div>
            <h3 className="text-lg font-bold text-slate-100 mt-1">
              Multi-Tier Warehouse Stock &amp; Real-Time Inventory Ledger
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Consolidated visibility across 4 strategic depots. Barcode-controlled bin storage, strict FIFO valuation, and automated reorder trigger algorithms prevent stockouts of mission-critical drilling and production spares.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-slate-400 text-[11px]">
              <span>Lead Warehouse Officer: <strong className="text-slate-200">Robert Mugabe</strong></span>
              <span>•</span>
              <span>Active Valuation: <strong className="text-emerald-400">{valuationMethod}</strong></span>
            </div>
            <button
              onClick={() => setActiveTab('warehouses')}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Manage Warehouses →
            </button>
          </div>
        </div>
      </div>

      {/* Warehouse Dashboard KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-3">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Total Inventory Value</span>
            <span className="text-[10px] font-bold text-amber-400">{valuationMethod}</span>
          </div>
          <div className="text-xl font-bold text-white mt-1.5 truncate">
            {currency === 'UGX' ? formatUGX(totalInventoryValueUGX) : formatUSD(totalInventoryValueUSD)}
          </div>
          <span className="text-[10px] text-slate-500 mt-1">Across all warehouses</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Warehouses</span>
          <div className="text-xl font-bold text-slate-100 mt-1">{warehouses.length}</div>
          <span className="text-[10px] text-slate-500 mt-1">Depots & bases</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Stock Items</span>
          <div className="text-xl font-bold text-slate-100 mt-1">{totalStockItems}</div>
          <span className="text-[10px] text-slate-500 mt-1">Catalog SKUs</span>
        </div>

        <div className="bg-slate-900/90 border border-amber-900/40 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-400">Low Stock</span>
          <div className="text-xl font-bold text-amber-300 mt-1">{lowStockItems}</div>
          <span className="text-[10px] text-amber-500/80 mt-1">Under safety</span>
        </div>

        <div className="bg-slate-900/90 border border-rose-900/40 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-rose-400">Out of Stock</span>
          <div className="text-xl font-bold text-rose-300 mt-1">{outOfStockItems}</div>
          <span className="text-[10px] text-rose-500/80 mt-1">0 Balance</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400">Received (Mo)</span>
          <div className="text-xl font-bold text-emerald-300 mt-1">+{stockReceivedThisMonth}</div>
          <span className="text-[10px] text-emerald-500/80 mt-1">Units accepted</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-400">Issued (Mo)</span>
          <div className="text-xl font-bold text-blue-300 mt-1">-{stockIssuedThisMonth}</div>
          <span className="text-[10px] text-blue-500/80 mt-1">Work order issues</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Adjustments</span>
          <div className="text-xl font-bold text-slate-100 mt-1">{stockAdjustmentsCount}</div>
          <span className="text-[10px] text-slate-500 mt-1">Counts & audit</span>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3 flex flex-col justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-purple-400">Pending POs</span>
          <div className="text-xl font-bold text-purple-300 mt-1">{pendingPOsCount}</div>
          <span className="text-[10px] text-purple-400/80 mt-1">In procurement</span>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === 'inventory'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Oil & Gas Inventory Items ({materials.length})
        </button>
        <button
          onClick={() => setActiveTab('warehouses')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === 'warehouses'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <WarehouseIcon className="w-4 h-4" />
          Warehouse Registry ({warehouses.length})
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === 'transactions'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <RefreshCw className="w-4 h-4" />
          Transaction Audit Trail ({transactions.length})
        </button>
      </div>

      {/* TAB 1: INVENTORY ITEMS */}
      {activeTab === 'inventory' && (
        <div className="space-y-4">
          {/* Specialized Oil & Gas Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
            {OG_CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search and Warehouse Filters */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search by SKU code, item name, model, serial #, bin location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <span>Warehouse:</span>
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Warehouses</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span>Alerts:</span>
                <select
                  value={selectedAlertFilter}
                  onChange={(e) => setSelectedAlertFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Stock Levels</option>
                  <option value="LOW">Low Stock</option>
                  <option value="OUT">Out of Stock</option>
                  <option value="OVER">Overstock</option>
                  <option value="EXPIRING">Expiring / Critical</option>
                </select>
              </div>
            </div>
          </div>

          {/* Materials Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Item Code & Name</th>
                    <th className="px-4 py-3">O&G Category</th>
                    <th className="px-4 py-3">Warehouse & Bin</th>
                    <th className="px-4 py-3 text-center">On Hand</th>
                    <th className="px-4 py-3 text-center">Min / Max</th>
                    <th className="px-4 py-3">Unit Cost ({currency})</th>
                    <th className="px-4 py-3">Total Value ({currency})</th>
                    <th className="px-4 py-3">Status / Risk</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {filteredMaterials.map((mat) => {
                    const isLow = mat.currentStock > 0 && mat.currentStock <= mat.minimumStock;
                    const isOut = mat.currentStock === 0;
                    const totalValUGX = (mat.unitCostUGX || convertUsdToUgx(mat.unitCost)) * mat.currentStock;
                    const totalValUSD = mat.unitCost * mat.currentStock;

                    return (
                      <tr key={mat.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-100 flex items-center gap-2">
                            {mat.name}
                            {mat.criticality === 'Critical' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                                CRITICAL
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono mt-0.5">
                            <span>{mat.code}</span>
                            {mat.brand && <span>• {mat.brand}</span>}
                            {mat.serialNumber && <span>• SN: {mat.serialNumber}</span>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                            {mat.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-slate-200 font-medium truncate max-w-[140px]">{mat.warehouseName || 'Central Hub'}</div>
                          <span className="text-[10px] text-amber-400 font-mono">
                            Bin: {mat.binLocation || mat.storageLocation || 'Unassigned'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold text-sm">
                          <span
                            className={
                              isOut
                                ? 'text-rose-400'
                                : isLow
                                ? 'text-amber-400'
                                : 'text-slate-100'
                            }
                          >
                            {mat.currentStock}
                          </span>
                          <span className="text-[10px] text-slate-500 font-normal block">
                            {mat.unitOfMeasurement || 'Units'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-[11px] font-mono text-slate-400">
                          {mat.minimumStock} / {mat.maximumStock || '—'}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-300">
                          {currency === 'UGX'
                            ? formatUGX(mat.unitCostUGX || convertUsdToUgx(mat.unitCost))
                            : formatUSD(mat.unitCost)}
                        </td>
                        <td className="px-4 py-3 font-semibold text-slate-100">
                          {currency === 'UGX' ? formatUGX(totalValUGX) : formatUSD(totalValUSD)}
                        </td>
                        <td className="px-4 py-3">
                          {isOut ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              OUT OF STOCK
                            </span>
                          ) : isLow ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              LOW STOCK
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300">
                              OPTIMAL
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setTransactionMaterial(mat);
                                setIsTransactionModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Transact
                            </button>
                            <button
                              onClick={() => setViewingItem(mat)}
                              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-semibold transition-colors cursor-pointer"
                            >
                              Details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WAREHOUSES REGISTER */}
      {activeTab === 'warehouses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Storage Depots & Logistics Supply Bases</h2>
              <p className="text-xs text-slate-400">
                Manage pipe yards, bonded chemical warehouses, heavy spares hubs, and fuel distribution points.
              </p>
            </div>
            <button
              onClick={() => setIsNewWarehouseModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add Warehouse
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {warehouses.map((wh) => {
              const whMaterials = materials.filter((m) => m.warehouseId === wh.id);
              const whTotalValueUSD = whMaterials.reduce((sum, m) => sum + m.currentStock * m.unitCost, 0);
              const whTotalValueUGX = whMaterials.reduce(
                (sum, m) => sum + (m.unitCostUGX ? m.currentStock * m.unitCostUGX : convertUsdToUgx(m.currentStock * m.unitCost)),
                0
              );

              return (
                <div
                  key={wh.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm"
                >
                  <div>
                    <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {wh.code}
                          </span>
                          <h3 className="font-bold text-slate-100 text-sm mt-1.5">{wh.name}</h3>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          {wh.status}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span className="truncate">{wh.location}</span>
                      </div>
                    </div>

                    <div className="p-4 space-y-3 text-xs">
                      {/* Capacity Utilization Bar */}
                      <div>
                        <div className="flex items-center justify-between text-[11px] mb-1">
                          <span className="text-slate-400">Capacity Utilization</span>
                          <span className="font-bold text-slate-200">{wh.currentUtilizationPercent || 70}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              (wh.currentUtilizationPercent || 70) > 85
                                ? 'bg-rose-500'
                                : (wh.currentUtilizationPercent || 70) > 65
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${wh.currentUtilizationPercent || 70}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px] pb-2 border-b border-slate-800/60">
                        <div>
                          <span className="text-slate-500 block">Stocked Inventory</span>
                          <span className="font-semibold text-slate-200">{whMaterials.length} SKU items</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Warehouse Value</span>
                          <span className="font-semibold text-amber-400 truncate block">
                            {currency === 'UGX' ? formatUGX(whTotalValueUGX) : formatUSD(whTotalValueUSD)}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-slate-300 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Manager:</span>
                          <span className="font-medium text-slate-200">{wh.managerName || 'N/A'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Security:</span>
                          <span className="font-medium text-slate-200 flex items-center gap-1">
                            <Shield className="w-3 h-3 text-amber-400" />
                            {wh.securityLevel || 'Level 3'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-500">Operating Hours:</span>
                          <span className="text-slate-300">{wh.operatingHours || '24/7 Monitored'}</span>
                        </div>
                        {wh.gpsCoordinates && (
                          <div className="flex items-center justify-between text-[10px]">
                            <span className="text-slate-500">GPS:</span>
                            <span className="font-mono text-slate-400">
                              {typeof wh.gpsCoordinates === 'object'
                                ? wh.gpsCoordinates.formatted || `${wh.gpsCoordinates.lat}, ${wh.gpsCoordinates.lng}`
                                : String(wh.gpsCoordinates)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between">
                    <button
                      onClick={() => setViewingWarehouse(wh)}
                      className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setSelectedWarehouseId(wh.id);
                        setActiveTab('inventory');
                      }}
                      className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 cursor-pointer"
                    >
                      Browse Stock
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: INVENTORY TRANSACTIONS AUDIT TRAIL */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-200">Complete Inventory Movement Ledger</h2>
              <p className="text-xs text-slate-400">
                Cryptographically audited transactions: Receipts, Issues, Internal Transfers, Returns, and Damage Write-Offs.
              </p>
            </div>
            <button
              onClick={() => {
                setTransactionMaterial(materials[0]);
                setIsTransactionModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Record Transaction
            </button>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Timestamp / Ref</th>
                    <th className="px-4 py-3">Transaction Type</th>
                    <th className="px-4 py-3">Material & SKU</th>
                    <th className="px-4 py-3 text-center">Qty</th>
                    <th className="px-4 py-3 text-center">Stock Delta</th>
                    <th className="px-4 py-3">Reason / Work Order</th>
                    <th className="px-4 py-3">Operator</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {transactions.map((tx) => {
                    const isPositive =
                      tx.type === 'RECEIPT' || tx.type === 'Goods Received' || tx.type === 'Stock Return';

                    return (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3">
                          <div className="font-mono font-semibold text-slate-200">{tx.reference || tx.id}</div>
                          <span className="text-[10px] text-slate-500">
                            {tx.timestamp ? new Date(tx.timestamp).toLocaleString() : tx.date || 'Recent'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isPositive
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : tx.type === 'TRANSFER' || tx.type === 'Stock Transfer'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-100">{tx.materialName}</div>
                          <span className="text-[10px] font-mono text-slate-500">{tx.materialCode}</span>
                        </td>
                        <td className="px-4 py-3 text-center font-bold font-mono">
                          <span className={isPositive ? 'text-emerald-400' : 'text-amber-400'}>
                            {isPositive ? `+${tx.quantity}` : `-${tx.quantity}`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center font-mono text-[11px] text-slate-400">
                          {tx.previousStock} → {tx.newStock}
                        </td>
                        <td className="px-4 py-3 text-slate-300">
                          <div>{tx.reason}</div>
                          {tx.workOrder && (
                            <span className="text-[10px] font-mono text-amber-400/90 block">
                              WO: {tx.workOrder}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-400 font-medium">{tx.userName || 'System Engine'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* RECORD INVENTORY TRANSACTION MODAL */}
      {isTransactionModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Record Stock Transaction</h3>
              </div>
              <button
                onClick={() => {
                  setIsTransactionModalOpen(false);
                  setTransactionMaterial(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteTransaction} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Select Material / Part *</label>
                <select
                  name="materialId"
                  defaultValue={transactionMaterial?.id}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.code}) — Current Stock: {m.currentStock} {m.unitOfMeasurement || 'units'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Transaction Type *</label>
                  <select
                    name="type"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Goods Received">Goods Received (+)</option>
                    <option value="Goods Issued">Goods Issued (-)</option>
                    <option value="Stock Transfer">Stock Transfer</option>
                    <option value="Stock Adjustment">Stock Adjustment (=)</option>
                    <option value="Stock Return">Stock Return (+)</option>
                    <option value="Damaged Stock">Damaged Stock (-)</option>
                    <option value="Expired Stock">Expired Stock (-)</option>
                    <option value="Stock Count">Stock Count Verification (=)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Quantity *</label>
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    defaultValue="1"
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Destination Warehouse (If Transfer)</label>
                <select
                  name="toWarehouseId"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="">None (Local Depot Modification)</option>
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Reference / PO #</label>
                  <input
                    name="reference"
                    placeholder="PO-2026-0041 or GRN-998"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Work Order #</label>
                  <input
                    name="workOrder"
                    placeholder="WO-2026-0512"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Reason / Justification *</label>
                <textarea
                  name="reason"
                  rows={2}
                  required
                  placeholder="e.g. Scheduled pump preventive servicing; Delivery received from ABC Industrial..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsTransactionModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Commit Movement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE WAREHOUSE MODAL */}
      {isNewWarehouseModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <WarehouseIcon className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Register New Storage Warehouse</h3>
              </div>
              <button
                onClick={() => setIsNewWarehouseModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWarehouse} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Warehouse Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Tilenga North Drill Spares Bay"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Warehouse Code</label>
                  <input
                    name="code"
                    placeholder="WH-NORTH-01"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Warehouse Type *</label>
                  <select
                    name="type"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Central Depot">Central Depot</option>
                    <option value="Chemical Spares">Chemical Spares</option>
                    <option value="Pipe Yard">Pipe Yard</option>
                    <option value="Bonded Terminal">Bonded Terminal</option>
                    <option value="Site Locker">Site Locker</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Location / District *</label>
                  <input
                    name="location"
                    required
                    placeholder="e.g. Buliisa District"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">GPS Coordinates</label>
                  <input
                    name="gpsCoordinates"
                    placeholder="1.8150° N, 31.3280° E"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Manager Name</label>
                  <input
                    name="managerName"
                    placeholder="Sarah Nalwanga"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Security Clearance</label>
                  <select
                    name="securityLevel"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Level 1">Level 1 - Standard</option>
                    <option value="Level 2">Level 2 - Controlled Access</option>
                    <option value="Level 3 (Restricted)">Level 3 - High Security / Bonded</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Capacity Description</label>
                  <input
                    name="capacityDescription"
                    placeholder="4,500 m² heavy yard"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Initial Utilization %</label>
                  <input
                    type="number"
                    name="currentUtilizationPercent"
                    defaultValue={45}
                    min="0"
                    max="100"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewWarehouseModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Save Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ITEM DETAILS MODAL */}
      {viewingItem && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {viewingItem.code}
                </span>
                <h3 className="font-bold text-lg text-white mt-1">{viewingItem.name}</h3>
                <p className="text-xs text-slate-400">{viewingItem.category}</p>
              </div>
              <button
                onClick={() => setViewingItem(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Current Stock</span>
                <span className="text-base font-bold text-slate-100">
                  {viewingItem.currentStock} {viewingItem.unitOfMeasurement || 'units'}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Unit Cost (UGX)</span>
                <span className="text-sm font-bold text-slate-200">
                  {formatUGX(viewingItem.unitCostUGX || convertUsdToUgx(viewingItem.unitCost))}
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Unit Cost (USD)</span>
                <span className="text-sm font-bold text-slate-200">{formatUSD(viewingItem.unitCost)}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-500 block">Total Value (UGX)</span>
                <span className="text-sm font-bold text-amber-400">
                  {formatUGX((viewingItem.unitCostUGX || convertUsdToUgx(viewingItem.unitCost)) * viewingItem.currentStock)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-slate-300 border-b border-slate-800 pb-1">Warehouse Location</h4>
                <p>
                  <span className="text-slate-500">Facility:</span>{' '}
                  <span className="text-slate-200">{viewingItem.facilityName || 'Central Processing Facility'}</span>
                </p>
                <p>
                  <span className="text-slate-500">Warehouse:</span>{' '}
                  <span className="text-slate-200">{viewingItem.warehouseName || 'Main Hub'}</span>
                </p>
                <p>
                  <span className="text-slate-500">Bin / Rack:</span>{' '}
                  <span className="font-mono text-amber-400">{viewingItem.binLocation || viewingItem.storageLocation || 'A-01'}</span>
                </p>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 space-y-1.5">
                <h4 className="font-bold text-slate-300 border-b border-slate-800 pb-1">Supplier & Compliance</h4>
                <p>
                  <span className="text-slate-500">Preferred Supplier:</span>{' '}
                  <span className="text-slate-200">{viewingItem.preferredSupplierName || 'ABC Industrial'}</span>
                </p>
                <p>
                  <span className="text-slate-500">Lead Time:</span>{' '}
                  <span className="text-slate-200">{viewingItem.leadTimeDays || 14} days</span>
                </p>
                <p>
                  <span className="text-slate-500">Cert Standard:</span>{' '}
                  <span className="font-mono text-emerald-400">{viewingItem.certificationRequirement || 'API / ISO'}</span>
                </p>
              </div>
            </div>

            {viewingItem.description && (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-xs">
                <span className="text-slate-500 block mb-1 font-semibold">Technical Specifications</span>
                <p className="text-slate-300 leading-relaxed">{viewingItem.description}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
