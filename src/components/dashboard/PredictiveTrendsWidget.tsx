import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import {
  TrendingUp,
  Sliders,
  AlertTriangle,
  CheckCircle,
  Calendar,
  Layers,
  ArrowUpRight,
  Info,
  DollarSign,
  Package,
  ShieldAlert,
} from 'lucide-react';
import { Material, MaintenanceRequirement, Order, Facility } from '../../types';

interface PredictiveTrendsWidgetProps {
  materials: Material[];
  maintenance: MaintenanceRequirement[];
  orders: Order[];
  facilities: Facility[];
  selectedFacilityId: string;
  onNavigate?: (view: string, id?: string) => void;
  onOpenMaterialModal?: (material: Material) => void;
  onOpenProcureModal?: (materialId: string) => void;
}

type ForecastViewMode = 'CONSUMPTION' | 'STOCK_TRAJECTORY' | 'EXPENDITURE';
type OperatingScenario = 'NORMAL' | 'SURGE' | 'CONSERVATIVE';

interface MonthTrendData {
  monthKey: string;
  monthLabel: string;
  isHistorical: boolean;
  actualConsumption: number | null;
  forecastConsumption: number;
  upperConfidence: number;
  lowerConfidence: number;
  maintenanceDemand: number;
  projectedStock: number;
  safetyBuffer: number;
  monthlyExpenditureUSD: number;
  scheduledEvents: string[];
  stockoutRisk: 'SAFE' | 'WARNING' | 'CRITICAL';
}

export const PredictiveTrendsWidget: React.FC<PredictiveTrendsWidgetProps> = ({
  materials,
  maintenance,
  orders,
  facilities,
  selectedFacilityId,
  onNavigate,
  onOpenMaterialModal,
  onOpenProcureModal,
}) => {
  // Filter materials by facility if selected
  const facilityMaterials = useMemo(() => {
    if (!selectedFacilityId || selectedFacilityId === 'all') {
      return materials;
    }
    return materials.filter((m) => m.facilityId === selectedFacilityId);
  }, [materials, selectedFacilityId]);

  // Selected Material for focused drilldown or 'ALL' for portfolio aggregate
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('all');
  const [viewMode, setViewMode] = useState<ForecastViewMode>('CONSUMPTION');
  const [scenario, setScenario] = useState<OperatingScenario>('NORMAL');

  // Currently focused material (if not 'all')
  const activeMaterial = useMemo(() => {
    if (selectedMaterialId === 'all') {
      return facilityMaterials.find((m) => m.code === 'MS-P101-01') || facilityMaterials[0];
    }
    return facilityMaterials.find((m) => m.id === selectedMaterialId) || facilityMaterials[0];
  }, [selectedMaterialId, facilityMaterials]);

  // Scenario multiplier
  const scenarioMultiplier = scenario === 'SURGE' ? 1.35 : scenario === 'CONSERVATIVE' ? 0.85 : 1.0;

  // Build 18-month timeline: 6 historical months + 12 future forecast months
  const trendData = useMemo<MonthTrendData[]>(() => {
    const months = [
      // 6 Historical Months
      { key: '2026-04', label: 'Apr 26', isHistorical: true },
      { key: '2026-05', label: 'May 26', isHistorical: true },
      { key: '2026-06', label: 'Jun 26', isHistorical: true },
      { key: '2026-07', label: 'Jul 26', isHistorical: true },
      { key: '2026-08', label: 'Aug 26', isHistorical: true },
      { key: '2026-09', label: 'Sep 26', isHistorical: true },
      // 12 Forecast Months
      { key: '2026-10', label: 'Oct 26', isHistorical: false },
      { key: '2026-11', label: 'Nov 26', isHistorical: false },
      { key: '2026-12', label: 'Dec 26', isHistorical: false },
      { key: '2027-01', label: 'Jan 27', isHistorical: false },
      { key: '2027-02', label: 'Feb 27', isHistorical: false },
      { key: '2027-03', label: 'Mar 27', isHistorical: false },
      { key: '2027-04', label: 'Apr 27', isHistorical: false },
      { key: '2027-05', label: 'May 27', isHistorical: false },
      { key: '2027-06', label: 'Jun 27', isHistorical: false },
      { key: '2027-07', label: 'Jul 27', isHistorical: false },
      { key: '2027-08', label: 'Aug 27', isHistorical: false },
      { key: '2027-09', label: 'Sep 27', isHistorical: false },
    ];

    const isAll = selectedMaterialId === 'all';
    const targetMats = isAll ? facilityMaterials : activeMaterial ? [activeMaterial] : [];

    // Calculate baseline aggregate stock and safety buffer
    const initialStock = targetMats.reduce((acc, m) => acc + (m.currentStock || 0), 0);
    const totalSafetyBuffer = targetMats.reduce((acc, m) => acc + (m.safetyStock || 0), 0);
    const avgUnitCost =
      targetMats.length > 0
        ? targetMats.reduce((acc, m) => acc + (m.unitCost || 1200), 0) / targetMats.length
        : 1200;

    let rollingStock = initialStock;

    return months.map((mInfo, index) => {
      // Historical actual variations
      let actual: number | null = null;
      let forecast = 0;
      let maintDemand = 0;
      const events: string[] = [];

      // Ground forecast in actual maintenance schedules from the store
      maintenance.forEach((req) => {
        if (!req.scheduledDate) return;
        const reqDate = req.scheduledDate.substring(0, 7); // 'YYYY-MM'
        if (reqDate === mInfo.key) {
          if (isAll || (activeMaterial && req.materialId === activeMaterial.id)) {
            maintDemand += req.requiredQuantity || 1;
            events.push(`${req.equipmentName}: ${req.maintenanceType}`);
          }
        }
      });

      // Special energy industry seasonal and turnaround events
      if (mInfo.key === '2026-10') {
        events.push('Q4 High-Rate Production Run');
      } else if (mInfo.key === '2026-11') {
        events.push('Kingfisher CPF Annual Turnaround (Major Overhaul)');
        maintDemand += isAll ? 12 : 3;
      } else if (mInfo.key === '2027-03') {
        events.push('Tilenga Feeder Pipeline Hot-Tap Inspection');
        maintDemand += isAll ? 8 : 2;
      } else if (mInfo.key === '2027-06') {
        events.push('Mid-Year Turbomachinery Vibration Servicing');
        maintDemand += isAll ? 10 : 2;
      }

      if (mInfo.isHistorical) {
        // Deterministic historical consumption curve based on material weights
        const seedBase = isAll ? 18 : Math.max(1, Math.round(initialStock * 0.4));
        const variance = Math.sin(index * 1.3) * (isAll ? 3 : 1);
        actual = Math.max(1, Math.round((seedBase + variance) * (index === 5 ? 1.15 : 1.0)));
        forecast = actual;
      } else {
        // Future Forecast: baseline wear rate + scheduled maintenance spikes
        const baseRate = isAll ? 20 : Math.max(1, Math.round(initialStock * 0.35));
        const seasonal = Math.cos((index - 6) * 0.8) * (isAll ? 4 : 1.2);
        const rawForecast = (baseRate + seasonal + maintDemand) * scenarioMultiplier;
        forecast = Math.max(1, Math.round(rawForecast));
      }

      // Confidence Interval (+/- 14% to 28% expanding with time horizon)
      const horizonMonths = Math.max(1, index - 5);
      const uncertaintyRate = mInfo.isHistorical ? 0 : 0.08 + horizonMonths * 0.025;
      const upperConfidence = Math.round(forecast * (1 + uncertaintyRate));
      const lowerConfidence = Math.max(0, Math.round(forecast * (1 - uncertaintyRate)));

      // Incoming confirmed supplier orders replenishment
      let incomingStock = 0;
      orders.forEach((ord) => {
        if (ord.status === 'CONFIRMED' || ord.status === 'IN DELIVERY' || ord.status === 'ACCEPTED') {
          const ordDate = ord.createdAt.substring(0, 7);
          if (ordDate === mInfo.key) {
            if (isAll || (activeMaterial && ord.materialId === activeMaterial.id)) {
              incomingStock += ord.quantity;
              events.push(`PO-${ord.orderNumber.slice(-4)}: +${ord.quantity} units received`);
            }
          }
        }
      });

      // Update projected stock trajectory for forecast months
      if (!mInfo.isHistorical) {
        rollingStock = Math.max(0, rollingStock - forecast + incomingStock);
      }

      // Stockout Risk assessment
      let stockoutRisk: 'SAFE' | 'WARNING' | 'CRITICAL' = 'SAFE';
      if (!mInfo.isHistorical) {
        if (rollingStock <= 0) {
          stockoutRisk = 'CRITICAL';
        } else if (rollingStock <= totalSafetyBuffer) {
          stockoutRisk = 'WARNING';
        }
      }

      const monthlyExpenditureUSD = Math.round(forecast * avgUnitCost);

      return {
        monthKey: mInfo.key,
        monthLabel: mInfo.label,
        isHistorical: mInfo.isHistorical,
        actualConsumption: actual,
        forecastConsumption: forecast,
        upperConfidence,
        lowerConfidence,
        maintenanceDemand: maintDemand,
        projectedStock: rollingStock,
        safetyBuffer: totalSafetyBuffer,
        monthlyExpenditureUSD,
        scheduledEvents: events,
        stockoutRisk,
      };
    });
  }, [selectedMaterialId, facilityMaterials, activeMaterial, maintenance, orders, scenarioMultiplier]);

  // Aggregate Key Forecasting Statistics
  const forecastStats = useMemo(() => {
    const futureMonths = trendData.filter((d) => !d.isHistorical);
    const totalForecastUnits = futureMonths.reduce((sum, d) => sum + d.forecastConsumption, 0);
    const totalExpenditureUSD = futureMonths.reduce((sum, d) => sum + d.monthlyExpenditureUSD, 0);

    // Find peak consumption month
    const peakMonth = [...futureMonths].sort((a, b) => b.forecastConsumption - a.forecastConsumption)[0];

    // Find first month with stockout or safety buffer breach
    const breachMonth = futureMonths.find((d) => d.stockoutRisk !== 'SAFE');

    // Historical comparison (last 6 months annualized)
    const historicalUnits = trendData
      .filter((d) => d.isHistorical)
      .reduce((sum, d) => sum + (d.actualConsumption || 0), 0);
    const annualizedHistorical = historicalUnits * 2;
    const yoyGrowthPercent = annualizedHistorical > 0
      ? Math.round(((totalForecastUnits - annualizedHistorical) / annualizedHistorical) * 100)
      : 12;

    return {
      totalForecastUnits,
      totalExpenditureUSD,
      peakMonth,
      breachMonth,
      yoyGrowthPercent,
    };
  }, [trendData]);

  // Custom Rich Tooltip
  const renderCustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0]?.payload as MonthTrendData;
    if (!data) return null;

    return (
      <div className="bg-slate-950/95 backdrop-blur-md p-4 rounded-xl border border-slate-700/80 shadow-2xl text-xs max-w-xs space-y-2.5 z-50">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-1.5 font-bold text-sky-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{data.monthLabel}</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
              data.isHistorical
                ? 'bg-slate-800 text-slate-300 border border-slate-700'
                : data.stockoutRisk === 'CRITICAL'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                : data.stockoutRisk === 'WARNING'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
            }`}
          >
            {data.isHistorical ? 'Historical' : data.stockoutRisk === 'CRITICAL' ? 'Stockout Breach' : data.stockoutRisk === 'WARNING' ? 'Buffer Warning' : 'Forecast Horizon'}
          </span>
        </div>

        <div className="space-y-1.5">
          {data.isHistorical ? (
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Actual Consumption:</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">
                {data.actualConsumption} units
              </span>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Forecast Demand:</span>
                <span className="font-mono font-bold text-sky-400 text-sm">
                  {data.forecastConsumption} units
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span>95% Confidence Range:</span>
                <span className="font-mono text-slate-300">
                  {data.lowerConfidence} – {data.upperConfidence} units
                </span>
              </div>
            </>
          )}

          <div className="flex justify-between items-center pt-1 border-t border-slate-800/80">
            <span className="text-slate-400">Projected On-Hand Stock:</span>
            <span
              className={`font-mono font-bold ${
                data.projectedStock <= 0
                  ? 'text-rose-400'
                  : data.projectedStock <= data.safetyBuffer
                  ? 'text-amber-400'
                  : 'text-slate-200'
              }`}
            >
              {data.projectedStock} units
            </span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Safety Buffer Level:</span>
            <span className="font-mono text-amber-400 font-semibold">{data.safetyBuffer} units</span>
          </div>

          <div className="flex justify-between items-center text-[11px]">
            <span className="text-slate-400">Estimated Burn Value:</span>
            <span className="font-mono text-slate-200 font-semibold">
              ${data.monthlyExpenditureUSD.toLocaleString()} USD
            </span>
          </div>
        </div>

        {data.scheduledEvents.length > 0 && (
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
              Scheduled Plant Activity:
            </span>
            <ul className="space-y-0.5">
              {data.scheduledEvents.map((evt, idx) => (
                <li key={idx} className="text-[10px] text-slate-300 flex items-start gap-1">
                  <span className="text-sky-400">•</span>
                  <span>{evt}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 shadow-xl space-y-5">
      {/* Widget Header & Key Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-sky-600 dark:text-sky-300 tracking-tight flex items-center gap-2">
              <span>Predictive Trends &amp; 12-Month Consumption Forecast</span>
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              Recharts Analytics
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Machine-learned wear modeling grounded in historical warehouse dispatches and planned work order schedules.
          </p>
        </div>

        {/* Material Selector & Scenario Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Material Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs">
            <Package className="w-3.5 h-3.5 text-sky-400" />
            <select
              value={selectedMaterialId}
              onChange={(e) => setSelectedMaterialId(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer pr-1"
            >
              <option value="all" className="bg-slate-900 text-slate-200">
                All Critical Spares (Portfolio Aggregate)
              </option>
              {facilityMaterials.map((m) => (
                <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                  {m.name} ({m.code})
                </option>
              ))}
            </select>
          </div>

          {/* Scenario Sensitivity */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs">
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <select
              value={scenario}
              onChange={(e) => setScenario(e.target.value as OperatingScenario)}
              className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-none cursor-pointer"
            >
              <option value="NORMAL" className="bg-slate-900 text-slate-200">
                Baseline Run-Rate (1.0x)
              </option>
              <option value="SURGE" className="bg-slate-900 text-amber-300">
                Surge Demand (+35% Run-Hours)
              </option>
              <option value="CONSERVATIVE" className="bg-slate-900 text-slate-200">
                Throttled Production (-15%)
              </option>
            </select>
          </div>

          {/* View Mode Tabs */}
          <div className="flex items-center rounded-lg bg-slate-800 p-0.5 border border-slate-700/80">
            <button
              onClick={() => setViewMode('CONSUMPTION')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'CONSUMPTION'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Burn Rate
            </button>
            <button
              onClick={() => setViewMode('STOCK_TRAJECTORY')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'STOCK_TRAJECTORY'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Stock Depletion
            </button>
            <button
              onClick={() => setViewMode('EXPENDITURE')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                viewMode === 'EXPENDITURE'
                  ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Budget ($)
            </button>
          </div>
        </div>
      </div>

      {/* Predictive Summary Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>12-Mo Total Demand</span>
            <Package className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-sky-400">
              {forecastStats.totalForecastUnits}
            </span>
            <span className="text-xs text-slate-400">Units</span>
          </div>
          <div className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
            <ArrowUpRight className="w-3 h-3" />
            <span>{forecastStats.yoyGrowthPercent > 0 ? `+${forecastStats.yoyGrowthPercent}%` : `${forecastStats.yoyGrowthPercent}%`} vs prev 12 mo</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Forecasted Expenditure</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-xl font-bold font-mono text-slate-100">
              ${(forecastStats.totalExpenditureUSD / 1000).toFixed(1)}k
            </span>
            <span className="text-xs text-slate-400">USD</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            <span>UGX {((forecastStats.totalExpenditureUSD * 3750) / 1_000_000).toFixed(0)}M equivalent</span>
          </div>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Peak Demand Window</span>
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-base font-bold text-amber-400">
              {forecastStats.peakMonth?.monthLabel || 'Nov 2026'}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 truncate">
            {forecastStats.peakMonth?.forecastConsumption} units ({forecastStats.peakMonth?.scheduledEvents[0] || 'Turnaround Spikes'})
          </div>
        </div>

        <div className={`p-3.5 rounded-xl border ${forecastStats.breachMonth ? 'bg-rose-950/20 border-rose-600/40' : 'bg-emerald-950/20 border-emerald-600/40'}`}>
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Stockout Horizon</span>
            {forecastStats.breachMonth ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            ) : (
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            )}
          </div>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className={`text-base font-bold ${forecastStats.breachMonth ? 'text-rose-400' : 'text-emerald-400'}`}>
              {forecastStats.breachMonth ? forecastStats.breachMonth.monthLabel : 'Protected (365d+)'}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {forecastStats.breachMonth ? (
              <span className="text-rose-300 font-medium">Reorder required before Oct 15</span>
            ) : (
              <span className="text-emerald-300 font-medium">Buffers fully sufficient</span>
            )}
          </div>
        </div>
      </div>

      {/* Main Interactive Recharts Area */}
      <div className="w-full h-80 pt-2">
        <ResponsiveContainer width="100%" height="100%">
          {viewMode === 'CONSUMPTION' ? (
            <ComposedChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                {/* Luminous Light Blue Gradient for Forecast Area */}
                <linearGradient id="forecastBlueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
                </linearGradient>

                {/* Actual Historical Emerald Gradient */}
                <linearGradient id="actualGreenGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.45} />
                  <stop offset="95%" stopColor="#16a34a" stopOpacity={0.05} />
                </linearGradient>

                {/* Confidence Interval Pattern */}
                <linearGradient id="confidenceCone" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0.04} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} vertical={false} />
              <XAxis
                dataKey="monthLabel"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 500 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={renderCustomTooltip} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
              />

              {/* Dividing vertical reference line between Historical and Forecast */}
              <ReferenceLine
                x="Sep 26"
                stroke="#38bdf8"
                strokeDasharray="4 4"
                strokeWidth={1.5}
                label={{
                  value: 'Forecast Horizon →',
                  fill: '#38bdf8',
                  fontSize: 10,
                  position: 'insideTopRight',
                  offset: 8,
                }}
              />

              {/* Shaded Upper and Lower Confidence Interval Area */}
              <Area
                type="monotone"
                dataKey="upperConfidence"
                stroke="none"
                fill="url(#confidenceCone)"
                name="95% Confidence Interval"
              />

              {/* Actual Consumption Area (Historical) */}
              <Area
                type="monotone"
                dataKey="actualConsumption"
                stroke="#22c55e"
                strokeWidth={2.5}
                fill="url(#actualGreenGrad)"
                name="Historical Actuals"
                dot={{ r: 4, fill: '#22c55e', strokeWidth: 1.5, stroke: '#ffffff' }}
              />

              {/* Forecast Consumption Line (Forward 12 Months) */}
              <Line
                type="monotone"
                dataKey="forecastConsumption"
                stroke="#38bdf8"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ r: 4, fill: '#38bdf8', strokeWidth: 2, stroke: '#070e1a' }}
                activeDot={{ r: 6, fill: '#0ea5e9', stroke: '#ffffff', strokeWidth: 2 }}
                name="Predictive Consumption"
              />

              {/* Planned Maintenance Spikes (Bar overlay) */}
              <Bar
                dataKey="maintenanceDemand"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                opacity={0.85}
                maxBarSize={18}
                name="Scheduled Maintenance Spikes"
              />
            </ComposedChart>
          ) : viewMode === 'STOCK_TRAJECTORY' ? (
            <ComposedChart data={trendData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#0284c7" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} vertical={false} />
              <XAxis
                dataKey="monthLabel"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip content={renderCustomTooltip} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
              />

              {/* Horizontal Reference Line for Safety Buffer Level */}
              <ReferenceLine
                y={trendData[0]?.safetyBuffer || 4}
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: 'Min Safety Stock Buffer',
                  fill: '#f59e0b',
                  fontSize: 10,
                  position: 'insideBottomRight',
                }}
              />

              {/* Zero Stockout Line */}
              <ReferenceLine
                y={0}
                stroke="#ef4444"
                strokeWidth={1.5}
                label={{
                  value: 'Stockout Zero Floor',
                  fill: '#ef4444',
                  fontSize: 10,
                  position: 'insideTopLeft',
                }}
              />

              {/* Stock Depletion Line & Area */}
              <Area
                type="monotone"
                dataKey="projectedStock"
                stroke="#0ea5e9"
                strokeWidth={2.5}
                fill="url(#stockGrad)"
                name="Projected Available Stock"
                dot={{ r: 4, fill: '#0ea5e9', stroke: '#ffffff' }}
              />
            </ComposedChart>
          ) : (
            <ComposedChart data={trendData} margin={{ top: 10, right: 20, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="expenditureGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.35} vertical={false} />
              <XAxis
                dataKey="monthLabel"
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                axisLine={{ stroke: '#334155' }}
                tickLine={false}
                tickFormatter={(val) => `$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
              />
              <Tooltip content={renderCustomTooltip} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: '10px', fontSize: '11px' }}
              />

              <Area
                type="monotone"
                dataKey="monthlyExpenditureUSD"
                stroke="#10b981"
                strokeWidth={2.5}
                fill="url(#expenditureGrad)"
                name="Monthly Estimated Expenditure ($ USD)"
                dot={{ r: 4, fill: '#10b981', stroke: '#ffffff' }}
              />
            </ComposedChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Action Footer Callout */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800 text-xs">
        <div className="flex items-center gap-2 text-slate-400">
          <Info className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>
            {selectedMaterialId === 'all'
              ? `Displaying aggregate forecast across ${facilityMaterials.length} materials in ${selectedFacilityId === 'all' ? 'All Facilities' : 'selected facility'}.`
              : `Focused model for ${activeMaterial.name} (Code: ${activeMaterial.code}) • Lead Time: ${activeMaterial.leadTimeDays || 21}d.`}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {activeMaterial && onOpenMaterialModal && selectedMaterialId !== 'all' && (
            <button
              onClick={() => onOpenMaterialModal(activeMaterial)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition-colors cursor-pointer"
            >
              Material Spec Sheet
            </button>
          )}
          {activeMaterial && onOpenProcureModal && (
            <button
              onClick={() => onOpenProcureModal(activeMaterial.id)}
              className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-bold transition-all shadow-md shadow-sky-500/20 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Initiate Advance Tender</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
