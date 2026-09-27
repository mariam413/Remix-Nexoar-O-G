import React from 'react';
import {
  ShoppingBag,
  FileText,
  Clock,
  Truck,
  Boxes,
  Award,
  Sparkles,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  Building2,
  MapPin,
  Calendar,
} from 'lucide-react';
import { SupplierRFQ, SupplierOrderItem } from './supplierData';

interface SupplierDashboardTabProps {
  rfqs: SupplierRFQ[];
  orders: SupplierOrderItem[];
  onOpenRfqModal: (rfq: SupplierRFQ) => void;
  onOpenOfferModal: (rfq: SupplierRFQ) => void;
  onNavigateTab: (tab: string) => void;
}

export const SupplierDashboardTab: React.FC<SupplierDashboardTabProps> = ({
  rfqs,
  orders,
  onOpenRfqModal,
  onOpenOfferModal,
  onNavigateTab,
}) => {
  const openRfqs = rfqs.filter((r) => r.status === 'Open');
  const preparingOrders = orders.filter((o) => o.status === 'Preparing' || o.status === 'Confirmed');
  const inDeliveryOrders = orders.filter((o) => o.status === 'In Delivery');

  return (
    <div className="space-y-6">
      {/* Supplier Profile Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#0A78B5] text-white border border-[#0A78B5] flex items-center justify-center font-black text-lg shadow-sm">
              ABC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-[#082746] dark:text-white tracking-tight">
                  ABC Industrial Supplies Ltd
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-[#0A78B5] text-white text-[10px] font-bold uppercase tracking-wider">
                  Verified Tier-1 Supplier
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-600 text-white text-[10px] font-bold uppercase">
                  Simulated Demo
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-[#64748B] dark:text-slate-400 mt-1">
                <span className="flex items-center gap-1 font-medium text-[#334155] dark:text-slate-300">
                  <Building2 className="w-3.5 h-3.5 text-[#0A78B5]" />
                  Industrial / Oil &amp; Gas Equipment &amp; Spare Parts
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#32B86A]" />
                  Kampala, Uganda (Hoima Staging Logistics Base)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('opportunities')}
              className="px-4 py-2 rounded-lg bg-[#0A78B5] hover:bg-[#086396] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-white" />
              <span>Browse Open RFQs</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Row (7 Key Metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div
          onClick={() => onNavigateTab('opportunities')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#0A78B5] transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
            <span className="font-semibold uppercase text-[10px] text-[#082746] dark:text-slate-300">Open RFQs</span>
            <ShoppingBag className="w-3.5 h-3.5 text-[#0A78B5]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#082746] dark:text-white">
            {openRfqs.length}
          </div>
          <span className="text-[10px] text-[#0A78B5] font-bold mt-1 block">Active opportunities</span>
        </div>

        <div
          onClick={() => onNavigateTab('offers')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#0A78B5] transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
            <span className="font-semibold uppercase text-[10px] text-[#082746] dark:text-slate-300">Submitted Offers</span>
            <FileText className="w-3.5 h-3.5 text-[#00A6A6]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#082746] dark:text-white">4</div>
          <span className="text-[10px] text-[#334155] dark:text-slate-300 font-medium mt-1 block">2 accepted, 2 review</span>
        </div>

        <div
          onClick={() => onNavigateTab('orders')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#0A78B5] transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
            <span className="font-semibold uppercase text-[10px] text-[#082746] dark:text-slate-300">Awaiting Prep</span>
            <Clock className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600 dark:text-amber-400">
            {preparingOrders.length}
          </div>
          <span className="text-[10px] text-[#64748B] dark:text-slate-400 mt-1 block">Fulfillment ready</span>
        </div>

        <div
          onClick={() => onNavigateTab('orders')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#0A78B5] transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
            <span className="font-semibold uppercase text-[10px] text-[#082746] dark:text-slate-300">In Delivery</span>
            <Truck className="w-3.5 h-3.5 text-[#0A78B5]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#0A78B5] dark:text-sky-300">
            {inDeliveryOrders.length}
          </div>
          <span className="text-[10px] text-[#32B86A] font-bold mt-1 block">Active transit</span>
        </div>

        <div
          onClick={() => onNavigateTab('inventory')}
          className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#0A78B5] transition-all cursor-pointer shadow-sm"
        >
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
            <span className="font-semibold uppercase text-[10px] text-[#082746] dark:text-slate-300">Available Spares</span>
            <Boxes className="w-3.5 h-3.5 text-[#32B86A]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#082746] dark:text-white">48</div>
          <span className="text-[10px] text-[#334155] dark:text-slate-300 font-medium mt-1 block">Ex-stock Kampala</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
            <span className="font-semibold uppercase text-[10px] text-[#082746] dark:text-slate-300">On-Time Delivery</span>
            <Award className="w-3.5 h-3.5 text-[#32B86A]" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#32B86A]">94%</div>
          <span className="text-[10px] text-[#32B86A] font-semibold mt-1 block">Exceeds 90% SLA</span>
        </div>

        <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400">
            <span className="font-semibold uppercase text-[10px] text-[#082746] dark:text-slate-300">Customer Reqs</span>
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-[#082746] dark:text-white">7</div>
          <span className="text-[10px] text-[#64748B] dark:text-slate-400 mt-1 block">Demo oil &amp; gas</span>
        </div>
      </div>

      {/* AI Supplier Insight Box (Section C) - Rich Brand Surface with Pure White Typography */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#082746] to-[#0A78B5] border border-[#0A78B5] shadow-sm text-white">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/15 text-white flex items-center justify-center shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                NEXORA AI Supplier Insight
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#32B86A] text-white">
                Confidence: High
              </span>
            </div>
            <p className="text-xs text-white font-medium leading-relaxed">
              &ldquo;3 open opportunities currently match materials available in your supplier inventory. Mechanical Seal MS-240 has the highest urgency based on required date and material criticality.&rdquo;
            </p>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/90 pt-1">
              <span>
                <strong className="text-white font-bold">Data Used:</strong> Supplier inventory, RFQ requirements, required dates and material criticality.
              </span>
              <button
                onClick={() => onNavigateTab('assistant')}
                className="font-bold text-white hover:text-sky-200 cursor-pointer ml-auto flex items-center gap-1"
              >
                <span>Ask Supplier AI</span>
                <ChevronRight className="w-3 h-3 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Section A (Tender Opportunities) & Section B (Recent Orders) */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Section A: Tender Opportunities Highlights */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-[#082746] dark:text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-[#0A78B5]" />
                <span>Priority Tender Opportunities</span>
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Active customer RFQs matching stock in your warehouse.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('opportunities')}
              className="text-xs font-bold text-[#0A78B5] hover:text-[#086396] flex items-center gap-1 cursor-pointer"
            >
              <span>View All ({openRfqs.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {openRfqs.slice(0, 3).map((rfq) => (
              <div
                key={rfq.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-[#0A78B5] dark:hover:border-sky-700 transition-all bg-slate-50/50 dark:bg-slate-800/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0A78B5] dark:text-sky-400">
                        {rfq.rfqNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${
                          rfq.criticality === 'Critical'
                            ? 'bg-rose-600'
                            : rfq.criticality === 'High'
                            ? 'bg-amber-500'
                            : 'bg-[#0A78B5]'
                        }`}
                      >
                        {rfq.criticality}
                      </span>
                      <span className="text-[10px] text-[#64748B] dark:text-slate-400">
                        Buyer: {rfq.buyer}
                      </span>
                    </div>
                    <div className="font-bold text-sm text-[#082746] dark:text-white mt-1">
                      {rfq.materialName}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[#334155] dark:text-slate-300 mt-1">
                      <span>Quantity: <strong className="font-mono text-[#082746] dark:text-white">{rfq.quantity} {rfq.unit}</strong></span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#64748B]" />
                        Required: <strong className="text-rose-600 dark:text-rose-400 font-semibold">{rfq.requiredDate}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => onOpenOfferModal(rfq)}
                      className="px-3 py-1.5 rounded-lg bg-[#0A78B5] hover:bg-[#086396] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer text-center"
                    >
                      Submit Offer
                    </button>
                    <button
                      onClick={() => onOpenRfqModal(rfq)}
                      className="px-3 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#082746] dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section B: Recent Orders */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-[#082746] dark:text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#00A6A6]" />
                <span>Recent Customer Orders</span>
              </h2>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                Fulfillment workflow and active dispatch tracking.
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-[#0A78B5] hover:text-[#086396] flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Orders ({orders.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {orders.slice(0, 3).map((ord) => (
              <div
                key={ord.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 hover:border-[#0A78B5] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#082746] dark:text-sky-300">
                      {ord.orderNumber}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-white ${
                        ord.status === 'Delivered'
                          ? 'bg-[#32B86A]'
                          : ord.status === 'In Delivery'
                          ? 'bg-[#0A78B5] animate-pulse'
                          : ord.status === 'Preparing'
                          ? 'bg-amber-600'
                          : 'bg-[#082746]'
                      }`}
                    >
                      {ord.status}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-[#082746] dark:text-slate-200">
                    UGX {ord.totalValueUGX.toLocaleString()}
                  </span>
                </div>

                <div className="font-bold text-sm text-[#082746] dark:text-white mt-1.5">
                  {ord.materialName} ({ord.materialCode})
                </div>

                <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400 mt-1">
                  <span>Quantity: <strong className="text-[#334155] dark:text-slate-200">{ord.quantity} units</strong></span>
                  <span>
                    Expected Dispatch: <strong className="text-[#082746] dark:text-slate-200">{ord.expectedDispatch}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateTab('orders')}
              className="w-full py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[#082746] dark:text-slate-200 text-xs font-bold hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Go to Active Orders &amp; Dispatch Workflow</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
