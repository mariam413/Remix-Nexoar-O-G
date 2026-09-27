import React, { useState } from 'react';
import {
  FileText,
  Truck,
  CheckCircle,
  Clock,
  AlertTriangle,
  RotateCcw,
  Search,
  Filter,
  Package,
  Layers,
  ChevronRight,
  X,
  XCircle,
  Boxes,
} from 'lucide-react';
import { store } from '../../services/store';
import { Order } from '../../types';

interface OrdersViewProps {
  initialOrderId?: string;
  onOpenMaterialModal: (materialId: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  initialOrderId,
  onOpenMaterialModal,
}) => {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(
    initialOrderId || null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('Production schedule modified; operational requirements adjusted.');

  const orders = store.getOrders();
  const warehouses = store.getWarehouses();
  const currentUser = store.getCurrentUser();

  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.supplierName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || filteredOrders[0];

  const handleConfirmReceipt = (orderId: string) => {
    const wh = warehouses[0]?.id;
    const res = store.confirmOrderReceipt(orderId, wh);
    if (res.success) {
      alert('Consignment received! Physical stock has been incremented in the warehouse, and deterministic material risk has been recalculated.');
    } else {
      alert(res.error || 'Failed to confirm receipt');
    }
  };

  const handleRequestCancellation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    const res = store.requestOrderCancellation(selectedOrder.id, cancelReason);
    setShowCancelModal(false);
    alert(res.message);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            <span>Purchase Orders &amp; Delivery Tracking</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            End-to-end milestone timeline tracking, shipment monitoring, and warehouse check-in.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search PO or supplier..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs cursor-pointer focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PREPARING">Preparing</option>
            <option value="IN DELIVERY">In Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLATION REQUESTED">Cancellation Requested</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Orders List vs Detailed Milestone View */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left Column: Orders Table (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-300 tracking-wider">
              Purchase Orders ({filteredOrders.length})
            </span>
          </div>

          <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[600px]">
            {filteredOrders.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">No purchase orders found.</div>
            ) : (
              filteredOrders.map((ord) => {
                const isSelected = selectedOrder?.id === ord.id;
                const isDelivered = ord.status === 'DELIVERED';
                const isDelayed = ord.deliveryDetails?.isDelayed;

                return (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrderId(ord.id)}
                    className={`p-4 transition-colors cursor-pointer ${
                      isSelected ? 'bg-amber-500/10 border-l-4 border-amber-400' : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold text-amber-400">{ord.orderNumber}</span>
                        <h3 className="font-bold text-slate-100 text-sm mt-0.5">{ord.materialName}</h3>
                        <div className="text-[11px] text-slate-400 mt-1">
                          Supplier: <strong className="text-slate-200">{ord.supplierName}</strong>
                        </div>
                      </div>
                      <div className="text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            isDelivered
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isDelayed
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}
                        >
                          {ord.status}
                        </span>
                        <div className="font-mono font-bold text-xs text-white mt-1">
                          ${ord.totalPrice.toLocaleString()} {ord.currency}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Order Milestones & Delivery Tracker (7 cols) */}
        {selectedOrder && (
          <div className="lg:col-span-7 space-y-6">
            {/* Order Overview Header Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-base font-bold text-amber-400">{selectedOrder.orderNumber}</span>
                    <span
                      className={`text-xs px-2 py-0.5 rounded uppercase font-bold ${
                        selectedOrder.status === 'DELIVERED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : selectedOrder.deliveryDetails?.isDelayed
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {selectedOrder.status}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">{selectedOrder.materialName}</h2>
                  <p className="text-xs text-slate-400">
                    Vendor: <strong className="text-slate-200">{selectedOrder.supplierName}</strong> • Qty: <strong className="text-slate-200">{selectedOrder.quantity} units</strong>
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase text-slate-400">Total Purchase Value</div>
                  <div className="text-xl font-black text-white">${selectedOrder.totalPrice.toLocaleString()} {selectedOrder.currency}</div>
                </div>
              </div>

              {/* Delivery Details Callout */}
              <div className="grid sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-500 block">Tracking Reference</span>
                  <span className="font-mono font-bold text-slate-200 mt-0.5 block">{selectedOrder.deliveryDetails.trackingRef}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-500 block">Estimated Arrival</span>
                  <span className="font-mono font-bold text-amber-300 mt-0.5 block">{selectedOrder.deliveryDetails.estimatedArrival}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                  <span className="text-[10px] uppercase text-slate-500 block">Shipment Status</span>
                  <span className="font-semibold text-slate-200 mt-0.5 block truncate">{selectedOrder.deliveryDetails.currentStatus}</span>
                </div>
              </div>

              {/* Warning if delayed */}
              {selectedOrder.deliveryDetails.isDelayed && (
                <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-600/40 text-xs text-rose-200 flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-white">Reported Delay: </span>
                    {selectedOrder.deliveryDetails.delayedReason || 'Transit congestion'}
                  </div>
                </div>
              )}

              {/* Action Buttons: Confirm Receipt into Stock OR Request Cancellation */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  {selectedOrder.status !== 'DELIVERED' && selectedOrder.status !== 'CANCELLED' && (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 hover:text-rose-300 text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
                    >
                      Request Cancellation
                    </button>
                  )}
                </div>

                {selectedOrder.status !== 'DELIVERED' && selectedOrder.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleConfirmReceipt(selectedOrder.id)}
                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-md shadow-emerald-950 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>Confirm Receipt &amp; Replenish Stock</span>
                  </button>
                )}
              </div>
            </div>

            {/* Visual Order Timeline (7 Stages) */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Consignment Milestone Timeline</span>
              </h3>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
                {selectedOrder.timeline.map((step, idx) => {
                  const isCurrent = step.current;
                  const isCompleted = step.completed;

                  return (
                    <div key={idx} className="relative flex items-start gap-4">
                      {/* Milestone Dot */}
                      <div
                        className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                          isCompleted
                            ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                            : isCurrent
                            ? 'bg-amber-500 border-amber-400 text-slate-950 animate-pulse'
                            : 'bg-slate-900 border-slate-700 text-transparent'
                        }`}
                      >
                        {isCompleted && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                      </div>

                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span className={`font-bold ${isCompleted ? 'text-slate-100' : isCurrent ? 'text-amber-400' : 'text-slate-500'}`}>
                            {step.title}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">{step.date}</span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Cancellation Request Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>Request Order Cancellation</span>
              </h3>
              <button onClick={() => setShowCancelModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleRequestCancellation} className="space-y-4 pt-4 text-xs">
              <p className="text-slate-300">
                Are you sure you want to request cancellation for <strong>{selectedOrder?.orderNumber}</strong>?
              </p>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Reason for Cancellation *</label>
                <textarea
                  rows={3}
                  required
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div className="p-3 bg-slate-950 rounded-lg text-[10px] text-slate-400">
                Because this order has already been confirmed, the cancellation request will be forwarded to the vendor ({selectedOrder?.supplierName}) for formal acceptance.
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold cursor-pointer"
                >
                  Submit Cancellation Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
