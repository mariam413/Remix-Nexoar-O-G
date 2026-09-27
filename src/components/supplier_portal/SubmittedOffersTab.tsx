import React, { useState } from 'react';
import {
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Trash2,
  Calendar,
  X,
  ExternalLink,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { SupplierOfferItem } from './supplierData';

interface SubmittedOffersTabProps {
  offers: SupplierOfferItem[];
  onWithdrawOffer: (id: string) => void;
  onBuyerAcceptOffer: (offerId: string) => void;
}

export const SubmittedOffersTab: React.FC<SubmittedOffersTabProps> = ({
  offers,
  onWithdrawOffer,
  onBuyerAcceptOffer,
}) => {
  const [selectedOffer, setSelectedOffer] = useState<SupplierOfferItem | null>(null);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-[#123B63] dark:text-white tracking-tight">
              Submitted Quotations &amp; Commercial Offers
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#E0F4FA] text-[#087EA4] border border-[#65C7E5] text-xs font-bold">
              {offers.length} Tracked Offers
            </span>
          </div>
          <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
            Proposals submitted by ABC Industrial Supplies Ltd to Demo Oil &amp; Gas Company procurement committee.
          </p>
        </div>

        {/* Demo Helper Callout */}
        <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-slate-800/80 border border-amber-200 dark:border-amber-800/50 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-300">
          <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Interactive Demo:</strong> Click &ldquo;Accept as Buyer&rdquo; on any offer to trigger PO issuance!
          </span>
        </div>
      </div>

      {/* Main Offers Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#E0F4FA]/50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-[#123B63] dark:text-slate-200 text-[11px] font-black uppercase tracking-wider">
                <th className="py-3 px-4">Offer ID</th>
                <th className="py-3 px-4">RFQ Ref</th>
                <th className="py-3 px-4">Material / Code</th>
                <th className="py-3 px-4 text-center">Quantity</th>
                <th className="py-3 px-4">Unit Price (UGX)</th>
                <th className="py-3 px-4">Lead Time</th>
                <th className="py-3 px-4">Total Value</th>
                <th className="py-3 px-4">Submitted Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {offers.map((off) => (
                <tr
                  key={off.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <td className="py-3.5 px-4 font-mono font-bold text-[#0B78B5] dark:text-sky-400">
                    {off.id}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#334155] dark:text-slate-300 font-semibold">
                    {off.rfqNumber}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-[#123B63] dark:text-white text-xs">
                      {off.materialName}
                    </div>
                    <div className="text-[10px] font-mono text-[#64748B] dark:text-slate-400">
                      {off.materialCode}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center font-mono font-bold text-[#123B63] dark:text-white">
                    {off.quantity} units
                  </td>
                  <td className="py-3.5 px-4 font-mono text-[#334155] dark:text-slate-200">
                    {off.unitPriceUGX.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#123B63] dark:text-slate-200">
                    {off.leadTimeDays} days
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-[#123B63] dark:text-white">
                    UGX {off.totalValueUGX.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 text-[#64748B] dark:text-slate-400 whitespace-nowrap">
                    {off.submittedDate}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 ${
                        off.status === 'Accepted'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : off.status === 'Under Review'
                          ? 'bg-sky-100 text-[#087EA4] border border-[#65C7E5]'
                          : off.status === 'Declined'
                          ? 'bg-rose-100 text-rose-800 border border-rose-300'
                          : 'bg-slate-200 text-slate-700'
                      }`}
                    >
                      {off.status === 'Accepted' && <CheckCircle className="w-3 h-3" />}
                      {off.status === 'Under Review' && <Clock className="w-3 h-3" />}
                      <span>{off.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {off.status === 'Under Review' && (
                        <button
                          onClick={() => onBuyerAcceptOffer(off.id)}
                          className="px-2.5 py-1 rounded bg-[#32B86A] hover:bg-[#289e58] text-white font-bold text-xs shadow-sm cursor-pointer whitespace-nowrap"
                          title="Simulate Buyer Evaluation Committee accepting this offer"
                        >
                          Accept as Buyer
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedOffer(off)}
                        className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-[#123B63] dark:text-slate-200 text-xs font-semibold cursor-pointer"
                        title="View Detailed Offer"
                      >
                        View
                      </button>
                      {off.status === 'Under Review' && (
                        <button
                          onClick={() => onWithdrawOffer(off.id)}
                          className="px-2 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold cursor-pointer border border-rose-200"
                          title="Withdraw Offer"
                        >
                          Withdraw
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Offer Detail Modal */}
      {selectedOffer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#0B78B5]" />
                <h3 className="text-base font-bold text-[#123B63] dark:text-white">
                  Quotation Details: {selectedOffer.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOffer(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-sm"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                <div className="font-bold text-[#123B63] dark:text-white text-sm">
                  {selectedOffer.materialName} ({selectedOffer.materialCode})
                </div>
                <div className="text-[11px] text-[#64748B] dark:text-slate-400">
                  Target Tender: <strong className="text-[#0B78B5]">{selectedOffer.rfqNumber}</strong>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 py-1">
                <div>
                  <span className="text-[#64748B] block">Offered Quantity</span>
                  <span className="font-bold text-[#123B63] dark:text-white font-mono">{selectedOffer.quantity} units</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Delivery Lead Time</span>
                  <span className="font-bold text-[#123B63] dark:text-white">{selectedOffer.leadTimeDays} days</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Unit Price</span>
                  <span className="font-bold text-[#123B63] dark:text-white font-mono">UGX {selectedOffer.unitPriceUGX.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[#64748B] block">Total Contract Value</span>
                  <span className="font-bold text-base text-[#0B78B5] font-mono">UGX {selectedOffer.totalValueUGX.toLocaleString()}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#E0F4FA] dark:bg-slate-800/80 border border-[#65C7E5] text-[11px] space-y-1">
                <span className="font-bold text-[#123B63] dark:text-sky-300 block">Certifications Attached:</span>
                <p className="text-[#334155] dark:text-slate-300">{selectedOffer.certificationOffered}</p>
              </div>

              <div>
                <span className="font-bold text-[#123B63] dark:text-slate-200 block mb-0.5">Commercial &amp; Technical Notes:</span>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  {selectedOffer.notes}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setSelectedOffer(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-[#123B63] font-bold cursor-pointer"
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
