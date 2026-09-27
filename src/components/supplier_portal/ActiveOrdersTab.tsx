import React, { useState } from 'react';
import {
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Calendar,
  X,
  MapPin,
  Package,
  ArrowRight,
  ShieldCheck,
  Send,
  Navigation,
} from 'lucide-react';
import { SupplierOrderItem } from './supplierData';

interface ActiveOrdersTabProps {
  orders: SupplierOrderItem[];
  onUpdateOrderStatus: (orderId: string, nextStatus: SupplierOrderItem['status'], extra?: { trackingNumber?: string; carrier?: string; notes?: string }) => void;
  onReportDelay: (orderId: string, delayReason: string, newDate: string) => void;
}

export const ActiveOrdersTab: React.FC<ActiveOrdersTabProps> = ({
  orders,
  onUpdateOrderStatus,
  onReportDelay,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<SupplierOrderItem | null>(null);
  const [showDispatchModal, setShowDispatchModal] = useState<SupplierOrderItem | null>(null);
  const [dispatchCarrier, setDispatchCarrier] = useState('Albertine Logistics Fleet Carrier 04');
  const [dispatchTracking, setDispatchTracking] = useState('TRK-UG-9402');
  const [dispatchNotes, setDispatchNotes] = useState('Nitrogen-sealed transport case loaded with calibrated shock sensor tag.');

  const [showDelayModal, setShowDelayModal] = useState<SupplierOrderItem | null>(null);
  const [delayReason, setDelayReason] = useState('Customs border post physical inspection delay at Malaba corridor');
  const [delayNewDate, setDelayNewDate] = useState('2026-10-25');

  const timelineStages: SupplierOrderItem['status'][] = [
    'Order Received',
    'Confirmed',
    'Preparing',
    'Dispatched',
    'In Delivery',
    'Delivered',
  ];

  const getStageIndex = (status: SupplierOrderItem['status']) => {
    return timelineStages.indexOf(status);
  };

  const handleExecuteDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDispatchModal) return;
    onUpdateOrderStatus(showDispatchModal.id, 'In Delivery', {
      trackingNumber: dispatchTracking,
      carrier: dispatchCarrier,
      notes: dispatchNotes,
    });
    setShowDispatchModal(null);
  };

  const handleExecuteDelay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showDelayModal) return;
    onReportDelay(showDelayModal.id, delayReason, delayNewDate);
    setShowDelayModal(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#123B63] dark:text-white tracking-tight">
              Active Purchase Orders &amp; Dispatch Logistics
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E0F4FA] text-[#087EA4] border border-[#65C7E5] text-xs font-bold">
              {orders.length} Orders
            </span>
          </div>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
            End-to-end procurement fulfillment lifecycle from PO confirmation to on-site delivery acceptance.
          </p>
        </div>
      </div>

      {/* Orders Grid */}
      <div className="space-y-4">
        {orders.map((ord) => {
          const currentStage = getStageIndex(ord.status);

          return (
            <div
              key={ord.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4 hover:border-[#65C7E5] transition-all"
            >
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-base font-black text-[#0B78B5] dark:text-sky-300">
                    {ord.orderNumber}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      ord.status === 'Delivered'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : ord.status === 'In Delivery'
                        ? 'bg-sky-100 text-[#087EA4] border border-[#65C7E5] animate-pulse'
                        : ord.status === 'Preparing'
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'bg-slate-200 text-slate-800'
                    }`}
                  >
                    {ord.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs">
                  <span className="text-[#64748B] dark:text-slate-400">
                    Buyer: <strong className="text-[#123B63] dark:text-white font-semibold">{ord.buyer}</strong>
                  </span>
                  <span>•</span>
                  <span className="font-mono font-bold text-sm text-[#123B63] dark:text-white">
                    UGX {ord.totalValueUGX.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Order Content */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-[#64748B] block">Material Description</span>
                  <span className="font-bold text-sm text-[#123B63] dark:text-white block mt-0.5">
                    {ord.materialName}
                  </span>
                  <span className="font-mono text-[11px] text-[#64748B] dark:text-slate-400">
                    Code: {ord.materialCode}
                  </span>
                </div>

                <div>
                  <span className="text-[#64748B] block">Quantity &amp; Unit Value</span>
                  <span className="font-bold text-[#123B63] dark:text-white block mt-0.5">
                    {ord.quantity} units @ UGX {ord.unitPriceUGX.toLocaleString()}
                  </span>
                  <span className="text-[11px] text-slate-500">Ordered: {ord.orderDate}</span>
                </div>

                <div>
                  <span className="text-[#64748B] block">Required Date &amp; Destination</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 block mt-0.5">
                    {ord.requiredDate}
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#32B86A]" />
                    {ord.deliveryLocation}
                  </span>
                </div>

                <div>
                  <span className="text-[#64748B] block">Dispatch &amp; Tracking</span>
                  <span className="font-bold text-[#123B63] dark:text-white block mt-0.5">
                    {ord.trackingNumber || 'Pending Dispatch'}
                  </span>
                  <span className="text-[11px] text-slate-500">{ord.carrier || 'Carrier TBA'}</span>
                </div>
              </div>

              {/* Lifecycle Progress Bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-2">
                  <span>Lifecycle Milestone</span>
                  <span className="text-[#0B78B5] dark:text-sky-300 font-bold">
                    Stage {currentStage + 1} of 6: {ord.status}
                  </span>
                </div>

                <div className="grid grid-cols-6 gap-1.5">
                  {timelineStages.map((stage, idx) => {
                    const isDone = idx <= currentStage;
                    const isCurrent = idx === currentStage;

                    return (
                      <div key={stage} className="space-y-1">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isDone ? 'bg-[#32B86A]' : 'bg-slate-200 dark:bg-slate-800'
                          } ${isCurrent ? 'ring-2 ring-[#0B78B5]/50' : ''}`}
                        />
                        <span
                          className={`text-[9px] truncate block text-center ${
                            isCurrent
                              ? 'text-[#123B63] dark:text-white font-bold'
                              : isDone
                              ? 'text-[#32B86A] font-semibold'
                              : 'text-slate-400'
                          }`}
                        >
                          {stage}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedOrder(ord)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[#123B63] dark:text-slate-200 text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details &amp; History</span>
                </button>

                <div className="flex items-center gap-2">
                  {/* Transition: Received -> Confirmed */}
                  {ord.status === 'Order Received' && (
                    <button
                      onClick={() => onUpdateOrderStatus(ord.id, 'Confirmed')}
                      className="px-3.5 py-1.5 rounded-lg bg-[#0B78B5] hover:bg-[#09669B] text-white font-bold text-xs shadow-sm cursor-pointer"
                    >
                      Confirm Order
                    </button>
                  )}

                  {/* Transition: Confirmed -> Preparing */}
                  {ord.status === 'Confirmed' && (
                    <button
                      onClick={() => onUpdateOrderStatus(ord.id, 'Preparing')}
                      className="px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm cursor-pointer"
                    >
                      Mark as Preparing
                    </button>
                  )}

                  {/* Transition: Preparing -> Dispatched (In Delivery) */}
                  {ord.status === 'Preparing' && (
                    <button
                      onClick={() => {
                        setShowDispatchModal(ord);
                        setDispatchCarrier('Albertine Logistics Carrier 04');
                        setDispatchTracking(`TRK-UG-${Math.floor(1000 + Math.random() * 9000)}`);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-[#00A6A6] hover:bg-[#008F8F] text-white font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" />
                      <span>Mark as Dispatched</span>
                    </button>
                  )}

                  {/* Transition: In Delivery -> Delivered (Reduces Inventory) */}
                  {ord.status === 'In Delivery' && (
                    <>
                      <button
                        onClick={() => setShowDelayModal(ord)}
                        className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-800 text-xs font-semibold cursor-pointer"
                      >
                        Report Delay
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Confirm on-site delivery of order ${ord.orderNumber}? This will record customer acceptance and adjust available stock balance.`)) {
                            onUpdateOrderStatus(ord.id, 'Delivered');
                          }
                        }}
                        className="px-4 py-1.5 rounded-lg bg-[#32B86A] hover:bg-[#289e58] text-white font-bold text-xs shadow-sm cursor-pointer flex items-center gap-1.5"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Confirm Delivered</span>
                      </button>
                    </>
                  )}

                  {ord.status === 'Delivered' && (
                    <span className="text-xs text-[#32B86A] font-bold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      <span>Delivery Completed &amp; Accepted</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dispatch Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-[#123B63] dark:text-white flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#00A6A6]" />
                <span>Dispatch Shipment: {showDispatchModal.orderNumber}</span>
              </h3>
              <button onClick={() => setShowDispatchModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteDispatch} className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <div className="font-bold text-[#123B63] dark:text-white">
                  {showDispatchModal.materialName} ({showDispatchModal.quantity} units)
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">Destination: {showDispatchModal.deliveryLocation}</div>
              </div>

              <div>
                <label className="block text-[#123B63] dark:text-slate-200 font-bold mb-1">Carrier Name *</label>
                <input
                  type="text"
                  required
                  value={dispatchCarrier}
                  onChange={(e) => setDispatchCarrier(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#123B63] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[#123B63] dark:text-slate-200 font-bold mb-1">Waybill / Tracking Number *</label>
                <input
                  type="text"
                  required
                  value={dispatchTracking}
                  onChange={(e) => setDispatchTracking(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#123B63] dark:text-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-[#123B63] dark:text-slate-200 font-bold mb-1">Dispatch Packaging Notes</label>
                <textarea
                  rows={2}
                  value={dispatchNotes}
                  onChange={(e) => setDispatchNotes(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#123B63] dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#123B63] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#00A6A6] hover:bg-[#008F8F] text-white font-bold cursor-pointer shadow-sm"
                >
                  Confirm Dispatch &amp; Notify Buyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delay Modal */}
      {showDelayModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-bold text-[#123B63] dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Report Delay: {showDelayModal.orderNumber}</span>
              </h3>
              <button onClick={() => setShowDelayModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteDelay} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#123B63] dark:text-slate-200 font-bold mb-1">Reason for Transit Delay *</label>
                <input
                  type="text"
                  required
                  value={delayReason}
                  onChange={(e) => setDelayReason(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#123B63] dark:text-white"
                />
              </div>

              <div>
                <label className="block text-[#123B63] dark:text-slate-200 font-bold mb-1">Revised Estimated Arrival Date *</label>
                <input
                  type="date"
                  required
                  value={delayNewDate}
                  onChange={(e) => setDelayNewDate(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[#123B63] dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDelayModal(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#123B63] font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold cursor-pointer"
                >
                  Broadcast Delay Notification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
