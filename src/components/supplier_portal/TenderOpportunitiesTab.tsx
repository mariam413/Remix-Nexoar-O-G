import React, { useState } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Calendar,
  MapPin,
  CheckCircle,
  AlertTriangle,
  Building2,
  FileText,
  Clock,
  Send,
  X,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { SupplierRFQ } from './supplierData';

interface TenderOpportunitiesTabProps {
  rfqs: SupplierRFQ[];
  onOpenRfqModal: (rfq: SupplierRFQ) => void;
  onOpenOfferModal: (rfq: SupplierRFQ) => void;
}

export const TenderOpportunitiesTab: React.FC<TenderOpportunitiesTabProps> = ({
  rfqs,
  onOpenRfqModal,
  onOpenOfferModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedCriticality, setSelectedCriticality] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const categories = Array.from(new Set(rfqs.map((r) => r.category)));

  const filteredRfqs = rfqs.filter((r) => {
    const matchesSearch =
      r.rfqNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.materialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.materialCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.buyer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.deliveryLocation.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === 'ALL' || r.category === selectedCategory;
    const matchesCriticality = selectedCriticality === 'ALL' || r.criticality === selectedCriticality;
    const matchesStatus = selectedStatus === 'ALL' || r.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesCriticality && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#082746] dark:text-white tracking-tight">
              Tender Opportunities &amp; Active RFQs
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#0A78B5] text-white text-xs font-bold shadow-sm">
              {rfqs.length} Active Tenders
            </span>
          </div>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
            Official Requests for Quotation (RFQs) published by licensed East African exploration and production operators.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search RFQ number, material, code, location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-[#082746] dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-[#0A78B5]"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-[#082746] dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#0A78B5] cursor-pointer"
            >
              <option value="ALL">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Criticality Filter */}
          <div>
            <select
              value={selectedCriticality}
              onChange={(e) => setSelectedCriticality(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-[#082746] dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#0A78B5] cursor-pointer"
            >
              <option value="ALL">All Criticality Levels</option>
              <option value="Critical">Critical Tier-1</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs text-[#082746] dark:text-slate-200 font-medium focus:outline-none focus:ring-1 focus:ring-[#0A78B5] cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="Open">Open</option>
              <option value="Under Review">Under Review</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-[#64748B] dark:text-slate-400 pt-1">
          <span>
            Showing <strong className="text-[#082746] dark:text-white font-bold">{filteredRfqs.length}</strong> of {rfqs.length} tender opportunities
          </span>
          {(searchTerm || selectedCategory !== 'ALL' || selectedCriticality !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('ALL');
                setSelectedCriticality('ALL');
                setSelectedStatus('ALL');
              }}
              className="text-[#0A78B5] hover:underline font-bold cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Main RFQ Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#F4F8FA] dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[#082746] dark:text-slate-200 text-[11px] font-black uppercase tracking-wider">
                <th className="py-3 px-4">RFQ Number</th>
                <th className="py-3 px-4">Material / Equipment</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4">Required Date</th>
                <th className="py-3 px-4">Criticality</th>
                <th className="py-3 px-4">Buyer &amp; Delivery Location</th>
                <th className="py-3 px-4">Closing Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredRfqs.map((rfq) => (
                <tr
                  key={rfq.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0A78B5] dark:text-sky-400">
                    {rfq.rfqNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#082746] dark:text-white text-xs">
                      {rfq.materialName}
                    </div>
                    <div className="text-[10px] font-mono text-[#64748B] dark:text-slate-400">
                      Code: {rfq.materialCode}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#334155] dark:text-slate-300 font-medium">
                    {rfq.category}
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#082746] dark:text-white">
                    {rfq.quantity} {rfq.unit}
                  </td>
                  <td className="py-3.5 px-4 font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                    {rfq.requiredDate}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-block text-white ${
                        rfq.criticality === 'Critical'
                          ? 'bg-rose-600'
                          : rfq.criticality === 'High'
                          ? 'bg-amber-500'
                          : 'bg-[#0A78B5]'
                      }`}
                    >
                      {rfq.criticality}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-[#082746] dark:text-slate-200">
                      {rfq.buyer}
                    </div>
                    <div className="text-[10px] text-[#64748B] dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#32B86A]" />
                      <span>{rfq.deliveryLocation}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B] dark:text-slate-400 whitespace-nowrap">
                    {rfq.closingDate}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#32B86A] text-white">
                      {rfq.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onOpenOfferModal(rfq)}
                        className="px-3 py-1.5 rounded-lg bg-[#0A78B5] hover:bg-[#086396] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer whitespace-nowrap"
                      >
                        Submit Offer
                      </button>
                      <button
                        onClick={() => onOpenRfqModal(rfq)}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-[#082746] dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        View RFQ
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
