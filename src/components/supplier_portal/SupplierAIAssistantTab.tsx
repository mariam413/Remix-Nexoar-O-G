import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Send,
  HelpCircle,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  Database,
  ShieldCheck,
} from 'lucide-react';
import { SupplierRFQ, SupplierInventoryItem, SupplierOrderItem } from './supplierData';

interface SupplierAIAssistantTabProps {
  rfqs: SupplierRFQ[];
  inventory: SupplierInventoryItem[];
  orders: SupplierOrderItem[];
  onNavigateTab: (tab: string) => void;
}

interface QAItem {
  question: string;
  found: string;
  why: string;
  recommendation: string;
  dataUsed: string;
  confidence: 'High' | 'Medium';
}

export const SupplierAIAssistantTab: React.FC<SupplierAIAssistantTabProps> = ({
  rfqs,
  inventory,
  orders,
  onNavigateTab,
}) => {
  const PRELOADED_QUESTIONS: QAItem[] = [
    {
      question: 'Which open tenders match my current inventory?',
      found: '3 open RFQs match materials currently available in your warehouse: RFQ-2026-0142 (Mechanical Seal MS-240, Qty 6 vs 8 available to offer), RFQ-2026-0138 (Pump Bearing PB-118, Qty 8 vs 17 available to offer), and RFQ-2026-0131 (Valve Actuator VA-302, Qty 4 vs 4 available to offer).',
      why: 'All 3 tenders require delivery dates within the next 45 days, and your warehouse stock allows zero-lead-time or 7-day courier fulfillment, giving ABC Industrial Supplies a 92% competitive advantage.',
      recommendation: 'Review RFQ-2026-0142 first and confirm available stock before submitting an offer. Submit offers for MS-240 and PB-118 immediately while competitor tenders remain unsubmitted.',
      dataUsed: 'Supplier inventory balance (MS-240, PB-118, VA-302), open RFQ specifications, and operator required dates.',
      confidence: 'High',
    },
    {
      question: 'Which RFQs should I review first?',
      found: 'RFQ-2026-0142 (Mechanical Seal MS-240) has highest priority, followed by RFQ-2026-0138 (Pump Bearing PB-118).',
      why: 'Mechanical Seal MS-240 is designated as Critical Tier-1 by Demo Oil & Gas Company for Crude Transfer Pump P-101. The tender closes in 15 days with required on-site date of 20 Oct 2026.',
      recommendation: 'Prioritize RFQ-2026-0142. Lock 6 units from your uncommitted inventory (8 units available) to secure the proposal without stockout exposure.',
      dataUsed: 'Material criticality hierarchy, tender closing schedule, and warehouse stock reservation levels.',
      confidence: 'High',
    },
    {
      question: 'Which materials do I have enough stock to offer?',
      found: 'You have sufficient uncommitted stock to fulfill 5 out of 7 catalog lines: Industrial Filter IF-420 (30 to offer vs 12 needed), Flange Gasket FG-210 (60 to offer vs 40 needed), Pump Bearing PB-118 (17 to offer vs 8 needed), Mechanical Seal MS-240 (8 to offer vs 6 needed), and Valve Actuator VA-302 (4 to offer vs 4 needed).',
      why: 'Control Valve CV-330 (3 to offer vs 2 needed) and Pressure Transmitter PT-510 (6 to offer vs 6 needed) are currently at boundary buffers.',
      recommendation: 'Offer full quantity on IF-420, FG-210, and PB-118. For VA-302, reserving all 4 units will deplete your ready buffer to zero, so initiate a replenishment batch from manufacturer.',
      dataUsed: 'Available-to-offer quantities vs active tender volume requirements.',
      confidence: 'High',
    },
    {
      question: 'Which orders require action today?',
      found: 'Order NX-ORD-1024 (Mechanical Seal MS-240, 6 units) is in "Preparing" status and requires packaging dispatch confirmation by 04 Oct 2026. Order NX-ORD-1021 is "In Delivery" and requires GPS waypoint tracking check.',
      why: 'Crude Transfer Pump P-101 scheduled maintenance cannot proceed without physical receipt verification by buyer engineering.',
      recommendation: 'Complete nitrogen seal case inspection for NX-ORD-1024, generate waybill TRK-UG-9042, and click "Mark as Dispatched" in Active Orders & Dispatch.',
      dataUsed: 'Active orders schedule, delivery SLA milestones, and buyer maintenance scheduled dates.',
      confidence: 'High',
    },
    {
      question: 'Show me materials with low available-to-offer quantities.',
      found: 'Valve Actuator VA-302 (4 units available to offer), Control Valve CV-330 (3 units available to offer), and Pressure Transmitter PT-510 (6 units available to offer).',
      why: 'Both VA-302 and CV-330 have lead times exceeding 21 days from European manufacturer factories. If RFQ-2026-0131 is won, uncommitted stock for VA-302 drops to 0.',
      recommendation: 'Issue purchase replenishment for 6 units of VA-302 and 4 units of CV-330 to maintain minimum warehouse buffer.',
      dataUsed: 'Supplier warehouse inventory counts and supplier replenishment lead times.',
      confidence: 'High',
    },
    {
      question: 'What happens if my Mechanical Seal MS-240 delivery is delayed by 7 days?',
      found: 'Simulated 7-day delay moves expected on-site delivery from 04 Oct 2026 to 11 Oct 2026.',
      why: 'Scheduled maintenance for Crude Transfer Pump P-101 is scheduled for 20 Oct 2026. The 7-day delay reduces buyer safety lead time buffer from 16 days to 9 days, but does NOT trigger unscheduled production downtime.',
      recommendation: 'If a transit delay occurs, use the "Report Delay" tool in Active Orders to proactively notify buyer logistics. As long as delivery arrives prior to 15 Oct 2026, installation readiness remains intact.',
      dataUsed: 'NEXORA deterministic risk model, maintenance schedule dates, and transit corridor speed assumptions.',
      confidence: 'High',
    },
  ];

  const [activeQA, setActiveQA] = useState<QAItem>(PRELOADED_QUESTIONS[0]);
  const [customQuery, setCustomQuery] = useState('');
  const [chatHistory, setChatHistory] = useState<QAItem[]>([PRELOADED_QUESTIONS[0]]);

  const handleSelectQuestion = (q: QAItem) => {
    setActiveQA(q);
    if (!chatHistory.some((item) => item.question === q.question)) {
      setChatHistory([q, ...chatHistory]);
    }
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customQuery.trim()) return;

    // Search closest matching preloaded question or generate grounded response
    const matched = PRELOADED_QUESTIONS.find((q) =>
      customQuery.toLowerCase().includes('tender') || customQuery.toLowerCase().includes('rfq')
        ? q.question.includes('tenders')
        : customQuery.toLowerCase().includes('delay')
        ? q.question.includes('delayed')
        : customQuery.toLowerCase().includes('order')
        ? q.question.includes('orders')
        : q.question.includes('inventory')
    ) || {
      question: customQuery,
      found: `Verified 7 inventory records and ${rfqs.length} open customer tenders for ABC Industrial Supplies Ltd.`,
      why: 'Current inventory stock covers 80% of open RFQ line items across Hoima and CPF-1 extraction corridors.',
      recommendation: 'Review open tenders tab and submit competitive quotations for Mechanical Seal MS-240 and Pump Bearing PB-118.',
      dataUsed: 'ABC Industrial Supplies Ltd internal inventory and Demo Oil & Gas Company published RFQs.',
      confidence: 'High',
    };

    setActiveQA(matched);
    setChatHistory([matched, ...chatHistory]);
    setCustomQuery('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E0F4FA] dark:bg-sky-950/60 border border-[#65C7E5] flex items-center justify-center text-[#087EA4] dark:text-sky-300">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#123B63] dark:text-white tracking-tight flex items-center gap-2">
              <span>NEXORA Supplier Intelligence AI Assistant</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E0F4FA] text-[#087EA4] border border-[#65C7E5]">
                Supplier Model v3.8
              </span>
            </h1>
            <p className="text-xs text-[#64748B] dark:text-slate-400 mt-0.5">
              Grounded commercial and inventory reasoning trained on ABC Industrial Supplies Ltd stock and tender data.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Questions Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#123B63] dark:text-white uppercase tracking-wider text-[11px]">
            Preloaded Operational Queries
          </span>
          <span className="text-[#64748B] dark:text-slate-400 text-[11px]">Click any query to evaluate grounded response</span>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PRELOADED_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectQuestion(q)}
              className={`p-3 rounded-xl border text-left text-xs font-semibold transition-all cursor-pointer flex items-start gap-2 ${
                activeQA.question === q.question
                  ? 'bg-[#E0F4FA] text-[#087EA4] border-[#65C7E5] shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800 text-[#123B63] dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-[#0B78B5]'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-[#0B78B5] shrink-0 mt-0.5" />
              <span className="line-clamp-2">{q.question}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Structured AI Response Box */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-bold text-[#64748B] dark:text-slate-400">Current Query:</span>
            <span className="font-bold text-[#123B63] dark:text-white text-sm">&ldquo;{activeQA.question}&rdquo;</span>
          </div>
          <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-[#32B86A]/20 text-[#123B63] dark:text-[#32B86A] border border-[#32B86A]/40 flex items-center gap-1">
            <CheckCircle className="w-3 h-3 text-[#32B86A]" />
            <span>CONFIDENCE: {activeQA.confidence}</span>
          </span>
        </div>

        <div className="space-y-4 text-xs">
          {/* WHAT WAS FOUND */}
          <div className="space-y-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-black uppercase text-[#0B78B5] tracking-wider block">
              1. WHAT WAS FOUND
            </span>
            <p className="text-[#123B63] dark:text-slate-200 font-medium leading-relaxed">
              {activeQA.found}
            </p>
          </div>

          {/* WHY IT MATTERS */}
          <div className="space-y-1 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 tracking-wider block">
              2. WHY IT MATTERS
            </span>
            <p className="text-[#334155] dark:text-slate-300 leading-relaxed">
              {activeQA.why}
            </p>
          </div>

          {/* RECOMMENDATION */}
          <div className="space-y-1 p-3.5 rounded-xl bg-[#E0F4FA] dark:bg-sky-950/40 border border-[#65C7E5] dark:border-sky-800">
            <span className="text-[10px] font-black uppercase text-[#087EA4] dark:text-sky-300 tracking-wider block">
              3. ACTIONABLE RECOMMENDATION
            </span>
            <p className="text-[#123B63] dark:text-white font-bold leading-relaxed">
              {activeQA.recommendation}
            </p>
          </div>

          {/* DATA USED */}
          <div className="flex items-center gap-2 text-[11px] text-[#64748B] dark:text-slate-400 pt-1">
            <Database className="w-3.5 h-3.5 text-[#00A6A6]" />
            <span>
              <strong className="text-[#123B63] dark:text-slate-300">Data Used:</strong> {activeQA.dataUsed}
            </span>
          </div>
        </div>
      </div>

      {/* Freeform Prompt Input */}
      <form onSubmit={handleCustomSubmit} className="flex gap-2">
        <input
          type="text"
          placeholder="Ask anything regarding your tenders, stock levels, orders, or lead times..."
          value={customQuery}
          onChange={(e) => setCustomQuery(e.target.value)}
          className="flex-1 p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-[#123B63] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#0B78B5]"
        />
        <button
          type="submit"
          className="px-5 py-3 rounded-xl bg-[#0B78B5] hover:bg-[#09669B] text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask Assistant</span>
        </button>
      </form>
    </div>
  );
};
