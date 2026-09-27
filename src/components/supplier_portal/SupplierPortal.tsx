import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  ShoppingBag,
  Boxes,
  FileText,
  Truck,
  Award,
  Bot,
  Settings,
  X,
  FileCheck,
  Send,
  Calendar,
  MapPin,
  Building2,
  CheckCircle,
} from 'lucide-react';
import {
  INITIAL_RFQS,
  INITIAL_INVENTORY,
  INITIAL_OFFERS,
  INITIAL_ORDERS,
  INITIAL_STOCK_MOVEMENTS,
  SupplierRFQ,
  SupplierInventoryItem,
  SupplierOfferItem,
  SupplierOrderItem,
  StockMovement,
} from './supplierData';
import { SupplierDashboardTab } from './SupplierDashboardTab';
import { TenderOpportunitiesTab } from './TenderOpportunitiesTab';
import { MySparesInventoryTab } from './MySparesInventoryTab';
import { SubmittedOffersTab } from './SubmittedOffersTab';
import { ActiveOrdersTab } from './ActiveOrdersTab';
import { CompanyProfileTab } from './CompanyProfileTab';
import { SupplierAIAssistantTab } from './SupplierAIAssistantTab';
import { SupplierSettingsTab } from './SupplierSettingsTab';

export type SupplierTabType =
  | 'dashboard'
  | 'opportunities'
  | 'inventory'
  | 'offers'
  | 'orders'
  | 'profile'
  | 'assistant'
  | 'settings';

interface SupplierPortalProps {
  initialTab?: string;
  onNavigate: (view: string) => void;
}

export const SupplierPortal: React.FC<SupplierPortalProps> = ({
  initialTab = 'dashboard',
  onNavigate,
}) => {
  // Normalize initialTab from sidebar routes
  const normalizeTab = (tabStr: string): SupplierTabType => {
    if (tabStr.includes('inventory')) return 'inventory';
    if (tabStr.includes('offer')) return 'offers';
    if (tabStr.includes('order')) return 'orders';
    if (tabStr.includes('profile')) return 'profile';
    if (tabStr.includes('opportunity') || tabStr.includes('opportunities')) return 'opportunities';
    if (tabStr.includes('assistant')) return 'assistant';
    if (tabStr.includes('settings')) return 'settings';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState<SupplierTabType>(normalizeTab(initialTab));

  useEffect(() => {
    if (initialTab) {
      setActiveTab(normalizeTab(initialTab));
    }
  }, [initialTab]);

  // Centralized State for ABC Industrial Supplies Ltd Demo
  const [rfqs, setRfqs] = useState<SupplierRFQ[]>(INITIAL_RFQS);
  const [inventory, setInventory] = useState<SupplierInventoryItem[]>(INITIAL_INVENTORY);
  const [offers, setOffers] = useState<SupplierOfferItem[]>(INITIAL_OFFERS);
  const [orders, setOrders] = useState<SupplierOrderItem[]>(INITIAL_ORDERS);
  const [movements, setMovements] = useState<StockMovement[]>(INITIAL_STOCK_MOVEMENTS);

  // Modals across tabs
  const [viewingRfq, setViewingRfq] = useState<SupplierRFQ | null>(null);
  const [offerRfq, setOfferRfq] = useState<SupplierRFQ | null>(null);
  const [offerForm, setOfferForm] = useState({
    quantity: 6,
    unitPriceUGX: 2_850_000,
    leadTimeDays: 14,
    validityDate: '2026-11-20',
    certificationOffered: 'API 682 4th Ed, ISO 9001:2015, Mill Test Certificate 3.1',
    notes: 'Ex-stock Kampala warehouse. Seal faces inspected and nitrogen pressurized.',
  });

  // Cross-Module Demo Flow Actions
  const handleOpenOfferModal = (rfq: SupplierRFQ) => {
    setOfferRfq(rfq);
    setOfferForm({
      quantity: rfq.quantity,
      unitPriceUGX: rfq.estimatedBudgetUGX ? Math.round(rfq.estimatedBudgetUGX / rfq.quantity) : 2_500_000,
      leadTimeDays: 14,
      validityDate: '2026-11-20',
      certificationOffered: rfq.certificationRequirement || 'API 682, Mill Test 3.1',
      notes: `Ex-stock Kampala warehouse delivery to ${rfq.deliveryLocation}.`,
    });
  };

  const handleSubmitOffer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offerRfq) return;

    const newOfferId = `OFF-${Math.floor(2035 + Math.random() * 100)}`;
    const newOffer: SupplierOfferItem = {
      id: newOfferId,
      rfqNumber: offerRfq.rfqNumber,
      materialCode: offerRfq.materialCode,
      materialName: offerRfq.materialName,
      quantity: Number(offerForm.quantity),
      unitPriceUGX: Number(offerForm.unitPriceUGX),
      leadTimeDays: Number(offerForm.leadTimeDays),
      totalValueUGX: Number(offerForm.quantity) * Number(offerForm.unitPriceUGX),
      submittedDate: new Date().toISOString().split('T')[0],
      status: 'Under Review',
      validityDate: offerForm.validityDate,
      certificationOffered: offerForm.certificationOffered,
      notes: offerForm.notes,
    };

    setOffers([newOffer, ...offers]);

    // Reserve stock in inventory if available
    setInventory((prev) =>
      prev.map((item) => {
        if (item.materialCode === offerRfq.materialCode) {
          const qty = Number(offerForm.quantity);
          const newReserved = item.reservedQuantity + qty;
          const newAvailableToOffer = Math.max(0, item.availableQuantity - newReserved);
          return {
            ...item,
            reservedQuantity: newReserved,
            availableToOffer: newAvailableToOffer,
          };
        }
        return item;
      })
    );

    // Record movement
    setMovements((prev) => [
      {
        id: `sm-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        materialCode: offerRfq.materialCode,
        materialName: offerRfq.materialName,
        reference: `OFFER-${newOfferId}`,
        type: 'RESERVE',
        quantityDelta: -Number(offerForm.quantity),
        newBalance: Math.max(0, 8 - Number(offerForm.quantity)),
        reason: `Reserved for commercial offer ${newOfferId} on ${offerRfq.rfqNumber}`,
      },
      ...prev,
    ]);

    setOfferRfq(null);
    setActiveTab('offers');
    alert(`Quotation ${newOfferId} successfully submitted to ${offerRfq.buyer}!`);
  };

  const handleBuyerAcceptOffer = (offerId: string) => {
    const target = offers.find((o) => o.id === offerId);
    if (!target) return;

    // Update offer to accepted
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: 'Accepted' as const } : o))
    );

    // Create active purchase order
    const newOrdNum = `NX-ORD-${Math.floor(1025 + Math.random() * 50)}`;
    const newOrder: SupplierOrderItem = {
      id: newOrdNum,
      orderNumber: newOrdNum,
      buyer: 'Demo Oil & Gas Company',
      materialCode: target.materialCode,
      materialName: target.materialName,
      quantity: target.quantity,
      unitPriceUGX: target.unitPriceUGX,
      totalValueUGX: target.totalValueUGX,
      orderDate: new Date().toISOString().split('T')[0],
      requiredDate: '2026-10-24',
      status: 'Order Received',
      expectedDispatch: '2026-10-06',
      deliveryLocation: 'Central Processing Facility (CPF-1)',
      notes: `PO issued following commercial tender award for ${target.rfqNumber}.`,
    };

    setOrders([newOrder, ...orders]);
    setActiveTab('orders');
    alert(`Buyer accepted offer ${offerId}! Purchase Order ${newOrdNum} has been issued and queued in Active Orders.`);
  };

  const handleWithdrawOffer = (id: string) => {
    if (confirm('Withdraw this quotation from buyer tender evaluation?')) {
      setOffers((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: 'Withdrawn' as const } : o))
      );
    }
  };

  const handleUpdateOrderStatus = (
    orderId: string,
    nextStatus: SupplierOrderItem['status'],
    extra?: { trackingNumber?: string; carrier?: string; notes?: string }
  ) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: nextStatus,
            ...(extra?.trackingNumber ? { trackingNumber: extra.trackingNumber } : {}),
            ...(extra?.carrier ? { carrier: extra.carrier } : {}),
            ...(extra?.notes ? { notes: extra.notes } : {}),
          };
        }
        return o;
      })
    );

    // If marked Delivered, decrement physical stock in inventory!
    if (nextStatus === 'Delivered') {
      const ord = orders.find((o) => o.id === orderId);
      if (ord) {
        setInventory((prev) =>
          prev.map((item) => {
            if (item.materialCode === ord.materialCode) {
              const newAvailable = Math.max(0, item.availableQuantity - ord.quantity);
              const newReserved = Math.max(0, item.reservedQuantity - ord.quantity);
              return {
                ...item,
                availableQuantity: newAvailable,
                reservedQuantity: newReserved,
                availableToOffer: Math.max(0, newAvailable - newReserved),
                lastUpdated: new Date().toISOString().split('T')[0],
              };
            }
            return item;
          })
        );

        setMovements((prev) => [
          {
            id: `sm-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
            materialCode: ord.materialCode,
            materialName: ord.materialName,
            reference: ord.orderNumber,
            type: 'DISPATCH',
            quantityDelta: -ord.quantity,
            newBalance: Math.max(0, 12 - ord.quantity),
            reason: `Final delivery accepted on site for ${ord.orderNumber}`,
          },
          ...prev,
        ]);
      }
    }
  };

  const handleReportDelay = (orderId: string, delayReason: string, newDate: string) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            expectedDispatch: newDate,
            notes: `Delay Reported: ${delayReason}. Expected arrival: ${newDate}`,
          };
        }
        return o;
      })
    );
    alert(`Transit delay alert broadcasted to Demo Oil & Gas Company logistics coordinators.`);
  };

  const handleAddInventory = (newItem: Omit<SupplierInventoryItem, 'id' | 'lastUpdated'>) => {
    const item: SupplierInventoryItem = {
      ...newItem,
      id: `inv-${Date.now()}`,
      lastUpdated: new Date().toISOString().split('T')[0],
    };
    setInventory([item, ...inventory]);
    setMovements((prev) => [
      {
        id: `sm-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
        materialCode: item.materialCode,
        materialName: item.materialName,
        reference: 'INITIAL-STOCK',
        type: 'ADD',
        quantityDelta: item.availableQuantity,
        newBalance: item.availableQuantity,
        reason: 'New spare material line registered in supplier warehouse',
      },
      ...prev,
    ]);
  };

  const handleAdjustQuantity = (id: string, delta: number, reason: string) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = Math.max(0, item.availableQuantity + delta);
          const newOfferable = Math.max(0, newQty - item.reservedQuantity);
          return {
            ...item,
            availableQuantity: newQty,
            availableToOffer: newOfferable,
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        }
        return item;
      })
    );

    const target = inventory.find((i) => i.id === id);
    if (target) {
      setMovements((prev) => [
        {
          id: `sm-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          materialCode: target.materialCode,
          materialName: target.materialName,
          reference: 'STOCK-ADJUST',
          type: delta > 0 ? 'ADD' : 'DISPATCH',
          quantityDelta: delta,
          newBalance: Math.max(0, target.availableQuantity + delta),
          reason,
        },
        ...prev,
      ]);
    }
  };

  const handleReserveStock = (id: string, qty: number, reason: string) => {
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newReserved = item.reservedQuantity + qty;
          const newOfferable = Math.max(0, item.availableQuantity - newReserved);
          return {
            ...item,
            reservedQuantity: newReserved,
            availableToOffer: newOfferable,
            lastUpdated: new Date().toISOString().split('T')[0],
          };
        }
        return item;
      })
    );

    const target = inventory.find((i) => i.id === id);
    if (target) {
      setMovements((prev) => [
        {
          id: `sm-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
          materialCode: target.materialCode,
          materialName: target.materialName,
          reference: 'MANUAL-RESERVE',
          type: 'RESERVE',
          quantityDelta: -qty,
          newBalance: Math.max(0, target.availableToOffer - qty),
          reason,
        },
        ...prev,
      ]);
    }
  };

  // Tab definitions with exact enterprise design requirements
  const tabs = [
    { id: 'dashboard', label: 'Supplier Dashboard', icon: LayoutDashboard },
    { id: 'opportunities', label: 'Tender Opportunities', icon: ShoppingBag, count: rfqs.length },
    { id: 'inventory', label: 'My Spares Inventory', icon: Boxes, count: inventory.length },
    { id: 'offers', label: 'Submitted Offers', icon: FileText, count: offers.length },
    { id: 'orders', label: 'Active Orders & Dispatch', icon: Truck, count: orders.length },
    { id: 'profile', label: 'Company Profile & NSD', icon: Award },
    { id: 'assistant', label: 'AI Assistant', icon: Bot },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="space-y-6">
      {/* Enterprise Tabs Navigation Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2 shadow-sm">
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SupplierTabType)}
                className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0A78B5] text-white border border-[#0A78B5] shadow-sm'
                    : 'bg-transparent text-[#082746] dark:text-slate-200 hover:bg-[#F4F8FA] dark:hover:bg-slate-800 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#123B63] dark:text-slate-400'}`} />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 text-[#082746] dark:text-slate-300'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Tab Workspace */}
      {activeTab === 'dashboard' && (
        <SupplierDashboardTab
          rfqs={rfqs}
          orders={orders}
          onOpenRfqModal={setViewingRfq}
          onOpenOfferModal={handleOpenOfferModal}
          onNavigateTab={(t) => setActiveTab(t as SupplierTabType)}
        />
      )}

      {activeTab === 'opportunities' && (
        <TenderOpportunitiesTab
          rfqs={rfqs}
          onOpenRfqModal={setViewingRfq}
          onOpenOfferModal={handleOpenOfferModal}
        />
      )}

      {activeTab === 'inventory' && (
        <MySparesInventoryTab
          inventory={inventory}
          movements={movements}
          onAddInventory={handleAddInventory}
          onAdjustQuantity={handleAdjustQuantity}
          onReserveStock={handleReserveStock}
        />
      )}

      {activeTab === 'offers' && (
        <SubmittedOffersTab
          offers={offers}
          onWithdrawOffer={handleWithdrawOffer}
          onBuyerAcceptOffer={handleBuyerAcceptOffer}
        />
      )}

      {activeTab === 'orders' && (
        <ActiveOrdersTab
          orders={orders}
          onUpdateOrderStatus={handleUpdateOrderStatus}
          onReportDelay={handleReportDelay}
        />
      )}

      {activeTab === 'profile' && <CompanyProfileTab />}

      {activeTab === 'assistant' && (
        <SupplierAIAssistantTab
          rfqs={rfqs}
          inventory={inventory}
          orders={orders}
          onNavigateTab={(t) => setActiveTab(t as SupplierTabType)}
        />
      )}

      {activeTab === 'settings' && <SupplierSettingsTab />}

      {/* Modal: View Detailed RFQ */}
      {viewingRfq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#0B78B5]" />
                <h3 className="text-base font-bold text-[#123B63] dark:text-white">
                  Tender Specifications: {viewingRfq.rfqNumber}
                </h3>
              </div>
              <button
                onClick={() => setViewingRfq(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#0A78B5] dark:text-sky-400">
                    {viewingRfq.rfqNumber}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white">
                    {viewingRfq.criticality}
                  </span>
                </div>
                <h4 className="text-sm font-black text-[#082746] dark:text-white">
                  {viewingRfq.materialName}
                </h4>
                <div className="text-[11px] text-[#64748B] dark:text-slate-400">
                  Item Code: {viewingRfq.materialCode} • Category: {viewingRfq.category}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-1">
                <div>
                  <span className="text-[#64748B] block">Required Quantity</span>
                  <span className="font-bold text-[#082746] dark:text-white font-mono text-sm">
                    {viewingRfq.quantity} {viewingRfq.unit}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Required On-Site Date</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                    {viewingRfq.requiredDate}
                  </span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Buyer Organization</span>
                  <span className="font-bold text-[#082746] dark:text-white">{viewingRfq.buyer}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Delivery Location</span>
                  <span className="font-bold text-[#082746] dark:text-white">{viewingRfq.deliveryLocation}</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <span className="font-bold text-[#082746] dark:text-sky-300 block">Technical Requirements &amp; Specs:</span>
                <p className="text-[#334155] dark:text-slate-300 leading-relaxed">{viewingRfq.specifications}</p>
              </div>

              <div className="p-3 rounded-lg bg-[#F4F8FA] dark:bg-sky-950/40 border border-[#0A78B5]/30 space-y-1">
                <span className="font-bold text-[#082746] dark:text-sky-300 block">Required Certifications:</span>
                <p className="text-[#082746] dark:text-slate-200 font-medium">{viewingRfq.certificationRequirement}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1">
                <span>Closing Date: <strong className="text-[#082746] dark:text-white">{viewingRfq.closingDate}</strong></span>
                <span className="flex items-center gap-1.5">Tender Status: <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#32B86A] text-white uppercase">{viewingRfq.status}</span></span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setViewingRfq(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#082746] font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const r = viewingRfq;
                  setViewingRfq(null);
                  handleOpenOfferModal(r);
                }}
                className="px-5 py-2 rounded-lg bg-[#0A78B5] hover:bg-[#086396] text-white font-bold cursor-pointer shadow-sm"
              >
                Prepare &amp; Submit Offer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Submit Commercial Offer */}
      {offerRfq && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0A78B5]" />
                <h3 className="text-base font-bold text-[#082746] dark:text-white">
                  Submit Proposal: {offerRfq.rfqNumber}
                </h3>
              </div>
              <button
                onClick={() => setOfferRfq(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitOffer} className="space-y-3.5 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-0.5">
                <div className="font-bold text-[#082746] dark:text-white">{offerRfq.materialName}</div>
                <div className="text-[11px] text-[#64748B]">Buyer: {offerRfq.buyer} • Required by: {offerRfq.requiredDate}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#082746] dark:text-slate-200 font-bold mb-1">Quantity Offered *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={offerForm.quantity}
                    onChange={(e) => setOfferForm({ ...offerForm, quantity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#082746] dark:text-white font-mono font-bold focus:border-[#0A78B5] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[#082746] dark:text-slate-200 font-bold mb-1">Lead Time (Days) *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={offerForm.leadTimeDays}
                    onChange={(e) => setOfferForm({ ...offerForm, leadTimeDays: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#082746] dark:text-white font-mono font-bold focus:border-[#0A78B5] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#082746] dark:text-slate-200 font-bold mb-1">Unit Price (UGX) *</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  required
                  value={offerForm.unitPriceUGX}
                  onChange={(e) => setOfferForm({ ...offerForm, unitPriceUGX: Number(e.target.value) })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#082746] dark:text-white font-mono font-bold focus:border-[#0A78B5] focus:outline-none"
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Total Contract Value: <strong className="text-[#0A78B5] font-mono font-bold">UGX {(offerForm.quantity * offerForm.unitPriceUGX).toLocaleString()}</strong>
                </span>
              </div>

              <div>
                <label className="block text-[#082746] dark:text-slate-200 font-bold mb-1">Certification Dossier Offered *</label>
                <input
                  type="text"
                  required
                  value={offerForm.certificationOffered}
                  onChange={(e) => setOfferForm({ ...offerForm, certificationOffered: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#082746] dark:text-white focus:border-[#0A78B5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#082746] dark:text-slate-200 font-bold mb-1">Proposal Validity Date *</label>
                <input
                  type="date"
                  required
                  value={offerForm.validityDate}
                  onChange={(e) => setOfferForm({ ...offerForm, validityDate: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#082746] dark:text-white focus:border-[#0A78B5] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[#082746] dark:text-slate-200 font-bold mb-1">Commercial / Technical Notes</label>
                <textarea
                  rows={2}
                  value={offerForm.notes}
                  onChange={(e) => setOfferForm({ ...offerForm, notes: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-[#082746] dark:text-white focus:border-[#0A78B5] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setOfferRfq(null)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#082746] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#0A78B5] hover:bg-[#086396] text-white font-bold cursor-pointer shadow-sm flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-white" />
                  <span>Transmit Commercial Offer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
