import React, { useState } from 'react';
import {
  ShoppingBag,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Truck,
  Clock,
  Sparkles,
  ChevronRight,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import { store } from '../../services/store';
import { ProcurementRequest, Offer, Material } from '../../types';

interface ProcurementViewProps {
  initialRequestId?: string;
  onOpenOrder: (orderId: string) => void;
}

export const ProcurementView: React.FC<ProcurementViewProps> = ({
  initialRequestId,
  onOpenOrder,
}) => {
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(
    initialRequestId || null
  );
  const [showCreateModal, setShowCreateModal] = useState(false);

  const materials = store.getMaterials();
  const facilities = store.getFacilities();
  const procurementRequests = store.getProcurementRequests();
  const allOffers = store.getState().offers;
  const suppliers = store.getSuppliers();

  // Create PR Form State
  const [prForm, setPrForm] = useState({
    materialId: materials[0]?.id || '',
    quantity: 2,
    facilityId: facilities[0]?.id || '',
    specification: 'API 682 Plan 53A dual pressurized seal cartridge, Silicon Carbide vs Silicon Carbide faces.',
    requiredDate: '2026-10-20',
    deliveryLocation: 'Albertine CPF-1 Central Receiving Gate',
    certificationRequirement: 'API 682, ISO 9001:2015, Mill Test Certificate 3.1',
    priority: 'Critical' as 'Normal' | 'Urgent' | 'Critical',
    notes: 'Urgent turnaround for scheduled Crude Transfer Pump P-101 overhaul.',
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created = store.createProcurementRequest({
      materialId: prForm.materialId,
      quantity: Number(prForm.quantity),
      facilityId: prForm.facilityId,
      specification: prForm.specification,
      requiredDate: prForm.requiredDate,
      deliveryLocation: prForm.deliveryLocation,
      certificationRequirement: prForm.certificationRequirement,
      priority: prForm.priority,
      notes: prForm.notes,
    });

    setShowCreateModal(false);
    setSelectedRequestId(created.id);
  };

  const handleAcceptOffer = (offerId: string) => {
    const res = store.acceptOffer(offerId);
    if (res.success && res.order) {
      alert(`Offer accepted! Purchase Order ${res.order.orderNumber} confirmed.`);
      onOpenOrder(res.order.id);
    } else {
      alert(res.error || 'Failed to accept offer');
    }
  };

  const selectedRequest = procurementRequests.find((pr) => pr.id === selectedRequestId) || procurementRequests[0];
  const activeOffers = selectedRequest ? allOffers.filter((o) => o.procurementRequestId === selectedRequest.id) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span>Procurement &amp; Supplier Matching</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Issue tender requests, compare verified supplier quotes, and award purchase orders.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-md shadow-amber-950 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Issue Procurement Request</span>
        </button>
      </div>

      {/* Main Grid: Tenders Table vs Detail / Offers Panel */}
      <div className="grid lg:grid-cols-12 gap-6">
        {/* Left: Tenders List (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-300 tracking-wider">
              Procurement Tenders ({procurementRequests.length})
            </span>
          </div>

          <div className="divide-y divide-slate-800/60 overflow-y-auto max-h-[600px]">
            {procurementRequests.map((pr) => {
              const isSelected = selectedRequest?.id === pr.id;
              const offersForPR = allOffers.filter((o) => o.procurementRequestId === pr.id);

              return (
                <div
                  key={pr.id}
                  onClick={() => setSelectedRequestId(pr.id)}
                  className={`p-4 transition-colors cursor-pointer ${
                    isSelected ? 'bg-amber-500/10 border-l-4 border-amber-400' : 'hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold text-amber-400">{pr.requestNumber}</span>
                      <h3 className="font-bold text-slate-100 text-sm mt-0.5">{pr.materialName}</h3>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Qty: <strong>{pr.quantity} units</strong> • Need by: <strong>{new Date(pr.requiredDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</strong>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                          pr.status === 'AWARDED'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : pr.status === 'OFFERS_RECEIVED'
                            ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {pr.status === 'OFFERS_RECEIVED' ? `${offersForPR.length} Offers` : pr.status}
                      </span>
                      <div className="text-[10px] text-slate-500 mt-1">{pr.facilityName}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Selected Tender Details & Competitive Offers (7 cols) */}
        {selectedRequest && (
          <div className="lg:col-span-7 space-y-6">
            {/* Tender Summary Card */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-amber-400">{selectedRequest.requestNumber}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase font-semibold">
                      {selectedRequest.priority} Priority
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">{selectedRequest.materialName}</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Delivery Destination: {selectedRequest.deliveryLocation}</p>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase text-slate-400">Required Quantity</div>
                  <div className="text-xl font-black text-white">{selectedRequest.quantity} Units</div>
                </div>
              </div>

              <div className="text-xs text-slate-300 space-y-2">
                <div>
                  <span className="font-semibold text-slate-400 block text-[10px] uppercase">Technical Specifications:</span>
                  <p className="mt-0.5 text-slate-200">{selectedRequest.specification}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block text-[10px] uppercase">Mandatory Certifications:</span>
                  <p className="mt-0.5 text-slate-200">{selectedRequest.certificationRequirement}</p>
                </div>
              </div>
            </div>

            {/* Competitive Supplier Offers & AI Matching Section */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    Received Supplier Quotes &amp; Matching Engine
                  </h3>
                </div>
                <span className="text-xs text-slate-400">
                  {activeOffers.length} {activeOffers.length === 1 ? 'Proposal' : 'Proposals'} Submitted
                </span>
              </div>

              {activeOffers.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No supplier quotes submitted yet. Switch to Supplier role in top bar to submit an offer for this tender.
                </div>
              ) : (
                <div className="space-y-4">
                  {activeOffers.map((offer) => {
                    const isFastTrack = offer.deliveryTimeDays <= 10;
                    const isAccepted = offer.status === 'ACCEPTED';

                    return (
                      <div
                        key={offer.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isAccepted
                            ? 'bg-emerald-950/30 border-emerald-600/50'
                            : isFastTrack
                            ? 'bg-slate-950/70 border-amber-500/40 shadow-md'
                            : 'bg-slate-950/40 border-slate-800'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-white text-sm">{offer.supplierName}</h4>
                              {isFastTrack && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  FASTEST LEAD TIME ({offer.deliveryTimeDays}d)
                                </span>
                              )}
                              {isAccepted && (
                                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  CONTRACT AWARDED
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              Offered Cert: <span className="text-slate-300 font-medium">{offer.certificationOffered}</span>
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-base font-black text-white">
                              ${offer.totalPrice.toLocaleString()} {offer.currency}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              (${offer.unitPrice.toLocaleString()} / unit)
                            </div>
                          </div>
                        </div>

                        <div className="py-3 grid grid-cols-3 gap-2 text-xs font-mono">
                          <div>
                            <span className="text-slate-500 text-[10px] block uppercase">Lead Time</span>
                            <span className={`font-bold ${isFastTrack ? 'text-emerald-400' : 'text-slate-200'}`}>
                              {offer.deliveryTimeDays} Calendar Days
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block uppercase">Available Date</span>
                            <span className="text-slate-300 font-medium">
                              {offer.availableDate || 'Ex-stock Kampala'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 text-[10px] block uppercase">Quote Validity</span>
                            <span className="text-slate-300 font-medium">
                              {offer.validityDate || '30 Days'}
                            </span>
                          </div>
                        </div>

                        {offer.notes && (
                          <div className="p-2.5 rounded bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300 italic mb-3">
                            "{offer.notes}"
                          </div>
                        )}

                        {selectedRequest.status !== 'AWARDED' && (
                          <div className="pt-2 flex justify-end">
                            <button
                              onClick={() => handleAcceptOffer(offer.id)}
                              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-950 flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Accept Offer &amp; Confirm PO</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Create PR Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-amber-400" />
                <span>Issue Procurement Tender Request</span>
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Target Material *</label>
                <select
                  value={prForm.materialId}
                  onChange={(e) => setPrForm({ ...prForm, materialId: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                >
                  {materials.map((m) => (
                    <option key={m.id} value={m.id}>{m.name} ({m.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Quantity Needed *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={prForm.quantity}
                    onChange={(e) => setPrForm({ ...prForm, quantity: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Required By Date *</label>
                  <input
                    type="date"
                    required
                    value={prForm.requiredDate}
                    onChange={(e) => setPrForm({ ...prForm, requiredDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Priority</label>
                  <select
                    value={prForm.priority}
                    onChange={(e) => setPrForm({ ...prForm, priority: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                  >
                    <option value="Critical">Critical</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Normal">Normal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Delivery Location</label>
                <input
                  type="text"
                  value={prForm.deliveryLocation}
                  onChange={(e) => setPrForm({ ...prForm, deliveryLocation: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Technical Specification</label>
                <textarea
                  rows={2}
                  value={prForm.specification}
                  onChange={(e) => setPrForm({ ...prForm, specification: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-slate-100"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Publish Tender to Qualified Suppliers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
