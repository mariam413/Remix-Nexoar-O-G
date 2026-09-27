import React, { useState } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  X,
  CheckCircle,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { store } from '../../services/store';
import { NexoraLogo } from '../common/NexoraLogo';

interface GuidedDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: string, id?: string) => void;
}

interface TourStep {
  step: number;
  title: string;
  targetView: string;
  roleToSet?: string;
  script: string;
  actionGuide: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    step: 1,
    title: 'Welcome & System Architecture Overview',
    targetView: 'landing',
    script: 'Welcome to NEXORA O&G — an enterprise intelligence platform engineered for oil & gas operators to predict critical spare shortages, eliminate unplanned facility downtime, and optimize procurement lead times.',
    actionGuide: 'Review the executive hero, core value pillars, and architecture overview on the public landing page.',
  },
  {
    step: 2,
    title: 'Multi-Tenant Data Isolation',
    targetView: 'dashboard',
    script: 'NEXORA provides strict multi-tenant boundaries. Operating companies (Albertine Rift Energy, Nile Delta Basin) operate in complete isolation from qualified vendors.',
    actionGuide: 'Notice the Organization selector in the header bar. You can switch between oil companies and supplier portals instantly.',
  },
  {
    step: 3,
    title: 'Role-Based Access Control (RBAC)',
    targetView: 'dashboard',
    script: 'Six defined operational roles ensure separation of duties: Enterprise Admin, Procurement Officer, Inventory Controller, Maintenance Engineer, Qualified Supplier, and Auditor.',
    actionGuide: 'Switch your active persona using the Role dropdown in the header to observe navigation adapting.',
  },
  {
    step: 4,
    title: 'Executive Dashboard & Critical Alerts',
    targetView: 'dashboard',
    script: 'The operational dashboard features a dedicated Critical Alerts command center at the top that highlights materials with predicted supply chain delays based on AI intelligence, corridor transit friction, and turnaround maintenance deadlines.',
    actionGuide: 'Review the Critical Alerts section at the top of the dashboard: inspect +9d predicted delay forecasts, corridor bottlenecks, negative schedule buffers, and launch one-click What-If simulations.',
  },
  {
    step: 5,
    title: 'Critical Materials Registry',
    targetView: 'materials',
    script: 'Our catalog tracks engineering specifications, API standards, lead times, safety stocks, and real-time deterministic risk ratings.',
    actionGuide: 'Examine the table. Filter by Criticality or Search for "API 682".',
  },
  {
    step: 6,
    title: 'Mechanical Seal P-101 Deep Inspection',
    targetView: 'materials',
    script: 'Here is our hero material: Mechanical Seal Cartridge for Crude Transfer Pump P-101. It has 4 units on hand, with 2 units required as mandatory safety stock.',
    actionGuide: 'Click on Mechanical Seal P-101 to open the detailed modal inspection card.',
  },
  {
    step: 7,
    title: 'Record Material Usage (Field Consumption)',
    targetView: 'inventory',
    script: 'Simulate emergency field consumption. When maintenance pulls spares from the warehouse, NEXORA records the transaction into an immutable ledger.',
    actionGuide: 'Click "+ Record Stock Movement", select Issue, and draw 1 or 2 units to see stock drop.',
  },
  {
    step: 8,
    title: 'Real-Time Deterministic Risk Recalculation',
    targetView: 'dashboard',
    script: 'Notice the immediate change: the deterministic risk engine recalculates safety buffers against upcoming work orders and escalates the risk to CRITICAL without delay.',
    actionGuide: 'Observe the risk badge update to CRITICAL and the recommendation change to PROCURE NOW.',
  },
  {
    step: 9,
    title: 'Maintenance Schedule & Spares Readiness',
    targetView: 'maintenance',
    script: 'NEXORA bridges maintenance engineering and warehouse supply. Work Order WO-2026-4401 scheduled for 20 Oct requires 3 seals for the crude transfer pump overhaul.',
    actionGuide: 'Check the Readiness column: the status displays AT RISK / DEFICIT because available stock cannot cover both the job and safety buffer.',
  },
  {
    step: 10,
    title: 'Link Equipment to Spares',
    targetView: 'maintenance',
    script: 'Engineers can schedule new preventive or turnaround maintenance, directly linking required bill-of-materials and expected lead times.',
    actionGuide: 'Click "+ Schedule Maintenance" to inspect how work orders bind to critical materials.',
  },
  {
    step: 11,
    title: 'AI Operational Decision Intelligence',
    targetView: 'intelligence',
    script: 'NEXORA synthesizes stock positions, work order dates, and vendor transit times into five categories of actionable intelligence.',
    actionGuide: 'Browse through Material Risk, Procurement Recommendations, and Supplier Vulnerability tabs.',
  },
  {
    step: 12,
    title: 'Standardized Explainable AI Breakdown',
    targetView: 'intelligence',
    script: 'Every AI decision provides five verifiable facets: What Was Found, Why It Matters, Recommendation, Data Used, and Confidence Level.',
    actionGuide: 'Expand the Mathematical Model on Mechanical Seal P-101 to see the exact buffer equations.',
  },
  {
    step: 13,
    title: 'What-If Scenario Sandbox',
    targetView: 'whatif',
    script: 'This is NEXORA’s signature differentiator. Operators can model disruptions before they impact production.',
    actionGuide: 'Explore the sandbox: baseline stock is 4 units with 3 units committed to the 20 Oct overhaul.',
  },
  {
    step: 14,
    title: 'Simulate Supply Disruption & Surge',
    targetView: 'whatif',
    script: 'Move the Supplier Delivery Delay slider to +10 days or simulate an unexpected demand surge of +2 units.',
    actionGuide: 'Watch the dynamic Before vs After cards update live, calculating projected stockouts and $65,000/day downtime exposure.',
  },
  {
    step: 15,
    title: 'Evaluate Automated Mitigations',
    targetView: 'whatif',
    script: 'The engine evaluates mitigations: 1) Fast-track through East Africa Mechanical Solutions (7-day local stock), or 2) Inter-depot buffer transfer.',
    actionGuide: 'Toggle "Test Mitigation: Transfer +2 Spares from Base" to see the deficit resolved.',
  },
  {
    step: 16,
    title: 'Issue Procurement Tender Request (PR)',
    targetView: 'procurement',
    script: 'One click launches a tender request with full engineering specifications (API 682 Plan 53A) and mandatory QA certifications.',
    actionGuide: 'Review PR-2026-0881 or click "+ Issue Procurement Request".',
  },
  {
    step: 17,
    title: 'Switch to Supplier Portal Persona',
    targetView: 'supplier_portal',
    roleToSet: 'SUPPLIER',
    script: 'We now switch to the perspective of East Africa Mechanical Solutions, a verified local stockist in Kampala with API 682 certified seals.',
    actionGuide: 'Inspect the vendor dashboard, browse open tender opportunities, and examine catalog pricing.',
  },
  {
    step: 18,
    title: 'Submit Competitive Supplier Proposal',
    targetView: 'supplier_portal',
    script: 'The supplier submits a formal quote: 2 units at $4,800/unit with a guaranteed 7-day turnaround from local ex-stock.',
    actionGuide: 'Click "Submit Priced Offer" on the open tender to generate a competitive bid.',
  },
  {
    step: 19,
    title: 'Evaluate Offers & Confirm Purchase Order',
    targetView: 'procurement',
    roleToSet: 'PROCUREMENT',
    script: 'Returning to the Operator Procurement Officer view, the AI matching engine highlights East Africa Mechanical Solutions as the best lead-time match.',
    actionGuide: 'Click "Accept Offer & Confirm PO" to officially award the contract and generate Purchase Order PO-2026-1044.',
  },
  {
    step: 20,
    title: 'Purchase Order Milestone Timeline',
    targetView: 'orders',
    script: 'Trace the PO across seven verifiable stages: Tender Created, Offer Submitted, PO Issued, Staging, In Transit, Delivered, and Checked-in.',
    actionGuide: 'Review the visual order tracking timeline and tracking reference details.',
  },
  {
    step: 21,
    title: 'Closed-Loop Stock Check-In & Risk Resolution',
    targetView: 'orders',
    script: 'When the consignment arrives at the central gate, warehouse officers confirm receipt. This automatically increments physical inventory and closes the risk loop.',
    actionGuide: 'Click "Confirm Receipt & Replenish Stock", then return to the Dashboard to see the risk return to READY.',
  },
  {
    step: 22,
    title: 'Grounded Conversational AI & Wrap-Up',
    targetView: 'ai_assistant',
    script: 'Interact with NEXORA’s conversational AI assistant, grounded in real-time inventory, work orders, and qualified supplier metrics with zero hallucinations.',
    actionGuide: 'Click any quick question (e.g., "Why is Mechanical Seal at high risk?") to experience live reasoning.',
  },
];

export const GuidedDemoModal: React.FC<GuidedDemoModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[currentStepIndex];

  const handleGoToStep = (index: number) => {
    setCurrentStepIndex(index);
    const step = TOUR_STEPS[index];
    if (step.roleToSet) {
      const users = store.getState().users;
      const targetUser = users.find((u) => u.role === step.roleToSet);
      if (targetUser) {
        store.setCurrentUser(targetUser.id);
      }
    }
    onNavigate(step.targetView);
  };

  const handleNext = () => {
    if (currentStepIndex < TOUR_STEPS.length - 1) {
      handleGoToStep(currentStepIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      handleGoToStep(currentStepIndex - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-sky-400/40 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <NexoraLogo size="sm" variant="compact" />
            <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />
            <div>
              <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">
                Interactive Walkthrough Script • Step {currentStep.step} of {TOUR_STEPS.length}
              </span>
              <h2 className="text-base font-extrabold text-white">{currentStep.title}</h2>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-sky-500 to-emerald-500 h-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / TOUR_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Script Content */}
        <div className="space-y-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
            <span className="text-[10px] font-bold uppercase text-emerald-400 tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Recommended Presenter Script</span>
            </span>
            <p className="text-slate-200 text-sm leading-relaxed italic">
              "{currentStep.script}"
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800 space-y-1">
            <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
              Key Action to Perform
            </span>
            <p className="text-slate-300 font-medium">
              👉 {currentStep.actionGuide}
            </p>
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            onClick={handlePrev}
            disabled={currentStepIndex === 0}
            className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Step</span>
          </button>

          <button
            onClick={() => {
              onNavigate(currentStep.targetView);
              onClose();
            }}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-xs font-bold border border-sky-400/30 cursor-pointer"
          >
            Jump to Screen
          </button>

          <button
            onClick={handleNext}
            disabled={currentStepIndex === TOUR_STEPS.length - 1}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white text-xs font-extrabold shadow-md shadow-sky-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
