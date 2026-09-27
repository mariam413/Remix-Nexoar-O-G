import React, { useState } from 'react';
import {
  Shield,
  ShieldAlert,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Cpu,
  Boxes,
  Truck,
  CheckCircle,
  Building2,
  Lock,
  ChevronRight,
  Database,
  Sliders,
} from 'lucide-react';
import { store } from '../../services/store';
import { NexoraLogo } from '../common/NexoraLogo';

interface LandingPageProps {
  onEnterDemo: (roleUserId?: string) => void;
  onOpenDemoGuide: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onEnterDemo,
  onOpenDemoGuide,
}) => {
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [modalType, setModalType] = useState<'BUYER' | 'SUPPLIER' | 'ADMIN'>('BUYER');

  const openLoginModal = (type: 'BUYER' | 'SUPPLIER' | 'ADMIN') => {
    setModalType(type);
    setShowRoleModal(true);
  };

  const handleSelectRole = (userId: string) => {
    store.setCurrentUser(userId);
    setShowRoleModal(false);
    onEnterDemo(userId);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white transition-colors">
      {/* Top Notification Bar */}
      <div className="bg-gradient-to-r from-sky-500/10 via-emerald-500/10 to-sky-500/10 border-b border-sky-400/20 px-4 py-2 text-center text-xs text-sky-700 dark:text-sky-300 flex items-center justify-center gap-3">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-bold tracking-wide">NEXORA PROTOTYPE DEMONSTRATION PLATFORM</span>
        <span className="text-sky-500/40">•</span>
        <span className="text-slate-600 dark:text-sky-200/80">Theme: Light Blue, White &amp; Light Green • Critical spares &amp; procurement intelligence</span>
        <button
          onClick={onOpenDemoGuide}
          className="ml-2 underline font-bold text-sky-600 dark:text-sky-400 hover:text-emerald-500 cursor-pointer"
        >
          View 22-Step Script
        </button>
      </div>

      {/* Main Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NexoraLogo size="lg" />
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => openLoginModal('BUYER')}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors cursor-pointer"
            >
              Company Login
            </button>
            <button
              onClick={() => openLoginModal('SUPPLIER')}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors cursor-pointer"
            >
              Supplier Login
            </button>
            <button
              onClick={() => openLoginModal('ADMIN')}
              className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-2 transition-colors cursor-pointer hidden sm:block"
            >
              Admin
            </button>
            <button
              onClick={() => handleSelectRole('user-org-admin')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-white font-bold text-xs shadow-lg shadow-sky-500/20 transition-all cursor-pointer"
            >
              <span>Enter Demo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 border-b border-slate-800">
        {/* Real Industrial Operations Photography Scrim */}
        <div className="absolute inset-0 z-0 opacity-25 dark:opacity-20 pointer-events-none">
          <img
            src="/images/hero_refinery_operations_1790284558080.jpg"
            alt="NEXORA Refinery and Terminal Operations"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center filter saturate-120"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/95 to-slate-950 z-0" />
        
        <div className="max-w-6xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-sky-400/30 text-xs font-semibold text-sky-500 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Industrial Multi-Tenant Decision Intelligence Layer</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-sky-600 dark:text-sky-400 tracking-tight leading-tight max-w-4xl mx-auto">
            AI-Powered Critical Materials &amp; Procurement Intelligence
          </h1>

          <p className="mt-4 text-xl sm:text-2xl font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-emerald-400 to-sky-400 max-w-2xl mx-auto font-light">
            “Predict the spare. Secure the supply. Protect production.”
          </p>

          <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
            NEXORA connects materials, inventory, maintenance, procurement, and supplier information to identify supply risks before they cause unscheduled shutdowns.
          </p>

          {/* Action CTAs */}
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => handleSelectRole('user-org-admin')}
              className="px-8 py-4 rounded-xl bg-gradient-to-r from-sky-500 via-sky-400 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 text-slate-950 font-extrabold text-sm shadow-xl shadow-sky-500/25 flex items-center gap-3 transition-all cursor-pointer"
            >
              <span>Launch Live Operator Demo</span>
              <ArrowRight className="w-4 h-4 text-slate-950" />
            </button>
            <button
              onClick={() => openLoginModal('SUPPLIER')}
              className="px-8 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-semibold text-sm flex items-center gap-3 transition-all cursor-pointer"
            >
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Explore Supplier Portal</span>
            </button>
            <button
              onClick={onOpenDemoGuide}
              className="px-6 py-4 rounded-xl bg-slate-900/60 hover:bg-slate-900 text-sky-400 border border-sky-400/30 font-semibold text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>View 22-Step Demo Script</span>
            </button>
          </div>

          {/* Core Product Differentiation Callout */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto text-left text-xs">
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-sky-500 tracking-wider">Deterministic Engine</span>
              <p className="mt-1 font-semibold text-slate-200">Mathematical Risk</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Safety buffers, lead time urgency, shortfall projections.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Explainable AI</span>
              <p className="mt-1 font-semibold text-slate-200">Gemini 3.8 Flash</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Context-grounded reasoning without hallucinated inventories.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Signature Simulator</span>
              <p className="mt-1 font-semibold text-slate-200">NEXORA What-If</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Model supplier delays &amp; surge demand in a sandbox.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-emerald-500 tracking-wider">Closed-Loop Flow</span>
              <p className="mt-1 font-semibold text-slate-200">PO to Stock Receipt</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Full immutable transaction audit with live stock replenishment.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Operational Graphics & Domain Showcase Section */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/20 text-xs font-semibold text-sky-500 mb-2">
            <span>Critical Asset &amp; Infrastructure Telemetry</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-sky-600 dark:text-sky-400">
            Industrial Integrity Across Every Energy Node
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto mt-2">
            Real-time synchronization between offshore-onshore extraction, high-pressure equipment turbomachinery, and regional spare logistics.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1: Command & Control Center */}
          <div className="group rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-sky-400/50 transition-all flex flex-col shadow-lg">
            <div className="relative h-48 overflow-hidden bg-slate-800">
              <img
                src="/images/operations_control_center_1790284578169.jpg"
                alt="Digital Operations Control Center"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-900/90 border border-sky-400/40 text-[10px] font-bold text-sky-400 tracking-wider uppercase">
                Operations Center
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-sky-600 dark:text-sky-300">24/7 Digital Control Command</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Real-time multi-facility telemetry monitoring Kingfisher, Tilenga, and CPF-1 extraction nodes with automated shortage detection.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-500 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Zero unplanned downtime protocol</span>
              </div>
            </div>
          </div>

          {/* Card 2: Precision Turbomachinery & Choke Valves */}
          <div className="group rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-sky-400/50 transition-all flex flex-col shadow-lg">
            <div className="relative h-48 overflow-hidden bg-slate-800">
              <img
                src="/images/equipment_subsea_valve_1790284568008.jpg"
                alt="High-Pressure Turbomachinery and Choke Valve"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-900/90 border border-emerald-400/40 text-[10px] font-bold text-emerald-400 tracking-wider uppercase">
                Tier-1 Equipment
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-sky-600 dark:text-sky-300">Subsea Choke &amp; Valve Health</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Precision maintenance records, API 682 seal wear telemetry, and mechanical failure prediction before safety buffers collapse.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-sky-400 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Automated safety buffer verification</span>
              </div>
            </div>
          </div>

          {/* Card 3: Automated Materials Logistics Warehouse */}
          <div className="group rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden hover:border-sky-400/50 transition-all flex flex-col shadow-lg">
            <div className="relative h-48 overflow-hidden bg-slate-800">
              <img
                src="/images/warehouse_spares_depot_1790284590984.jpg"
                alt="Automated Heavy Materials Warehouse"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
              <div className="absolute top-3 left-3 px-2 py-0.5 rounded bg-slate-900/90 border border-sky-400/40 text-[10px] font-bold text-sky-400 tracking-wider uppercase">
                Central Spares Depot
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-sky-600 dark:text-sky-300">Multi-Warehouse Spares Depot</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  Multi-tier bin location tracking, FIFO &amp; weighted-average valuation, and rapid dispatch across East African operational corridors.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-emerald-500 font-semibold flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Closed-loop stock replenishment</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Core Product Pillars (PREDICT, CONNECT, DECIDE) */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-xs font-bold uppercase tracking-widest text-sky-400">Core Value Architecture</h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-sky-600 dark:text-sky-400 mt-1">From Reactive Purchasing to Predictive Readiness</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-400/50 transition-all flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 mb-6">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">01. PREDICT</span>
            <h3 className="text-xl font-bold text-sky-600 dark:text-sky-300 mt-2 mb-3">Identify Potential Shortages</h3>
            <p className="text-sm text-slate-300 leading-relaxed flex-1">
              Connect upcoming scheduled maintenance with warehouse inventory and lead times. Spot critical buffer breaches weeks before equipment shutdowns.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Safety buffer deficit detection</span>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-400/50 transition-all flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center text-emerald-400 mb-6">
              <Truck className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">02. CONNECT</span>
            <h3 className="text-xl font-bold text-sky-600 dark:text-sky-300 mt-2 mb-3">Target Qualified Suppliers</h3>
            <p className="text-sm text-slate-300 leading-relaxed flex-1">
              Transparently evaluate suppliers based on verified certifications (API 682, ISO 9001), local stock availability, and historical on-time delivery.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Multi-variable supplier matching</span>
            </div>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900 border border-slate-800 hover:border-sky-400/50 transition-all flex flex-col">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-400/30 flex items-center justify-center text-sky-400 mb-6">
              <Cpu className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">03. DECIDE</span>
            <h3 className="text-xl font-bold text-sky-600 dark:text-sky-300 mt-2 mb-3">Explainable AI Decision Support</h3>
            <p className="text-sm text-slate-300 leading-relaxed flex-1">
              Every recommendation explains What Was Found, Why It Matters, and Recommended Actions with explicit confidence ratings and data completeness.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs text-slate-400 flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Human-in-the-loop governance</span>
            </div>
          </div>
        </div>
      </section>

      {/* Multi-Tenant Ecosystem: Three Primary Workspaces (Requirements 2, 3, 4) */}
      <section className="py-20 bg-slate-900/60 border-y border-slate-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00AFC7]">
              Multi-Tenant Architecture
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
              One Unified Ecosystem. Three Dedicated Experiences.
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl mx-auto mt-2">
              NEXORA is not a single standalone tool. It is an enterprise multi-tenant platform connecting operators, vetted suppliers, and platform administrators with strict data isolation.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* 1. Company Workspace */}
            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 hover:border-[#0878C9]/60 transition-all flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#0878C9]/10 text-[#0878C9] flex items-center justify-center border border-[#0878C9]/30">
                  <Building2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-[#0878C9]">
                  Experience A
                </span>
                <h3 className="text-xl font-bold text-white">Company Workspace</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  For E&amp;P Operators and Joint Ventures. Real-time executive operations briefings, facility surveillance, materials catalogs, What-If simulation, and automated purchase requisitioning.
                </p>
                <div className="pt-2 text-xs space-y-2 text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#35C759]" />
                    <span>Isolated private tenant repository</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#35C759]" />
                    <span>Zero cross-operator visibility</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#35C759]" />
                    <span>Autonomous lead-time risk scoring</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openLoginModal('BUYER')}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#0878C9] hover:bg-[#0661a3] text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Enter Company Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* 2. Supplier Workspace */}
            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 hover:border-[#35C759]/60 transition-all flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#35C759]/10 text-[#35C759] flex items-center justify-center border border-[#35C759]/30">
                  <Truck className="w-6 h-6" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-[#35C759]">
                  Experience B
                </span>
                <h3 className="text-xl font-bold text-white">Supplier Workspace</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  For NSD Qualified Vendors and Stockists. Real-time access to live tender opportunities (RFQs), spares inventory catalogue publishing, quote submissions, and dispatch tracking.
                </p>
                <div className="pt-2 text-xs space-y-2 text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#35C759]" />
                    <span>NSD verified credentials</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#35C759]" />
                    <span>Direct RFQ tender opportunity pipeline</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#35C759]" />
                    <span>Confidential pricing boundary</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openLoginModal('SUPPLIER')}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#35C759] hover:bg-[#289e58] text-slate-950 font-black text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Enter Supplier Workspace</span>
                <ArrowRight className="w-4 h-4 text-slate-950" />
              </button>
            </div>

            {/* 3. NEXORA Control Center */}
            <div className="p-7 rounded-2xl bg-slate-900 border border-slate-800 hover:border-[#00AFC7]/60 transition-all flex flex-col justify-between shadow-xl">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#00AFC7]/10 text-[#00AFC7] flex items-center justify-center border border-[#00AFC7]/30">
                  <Shield className="w-6 h-6" />
                </div>
                <span className="text-xs font-black uppercase tracking-wider text-[#00AFC7]">
                  Experience C
                </span>
                <h3 className="text-xl font-bold text-white">NEXORA Control Center</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  For NEXORA Platform Administrators. Supervise subscriber tenant organizations, manage SaaS plans, inspect MRR revenue analytics, and configure the Gemini 3.8 AI engine.
                </p>
                <div className="pt-2 text-xs space-y-2 text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#35C759]" />
                    <span>Platform-wide ecosystem telemetry</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#35C759]" />
                    <span>SaaS subscription &amp; MRR governance</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#35C759]" />
                    <span>Server-side AI proxy security</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => openLoginModal('ADMIN')}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-[#061A2E] hover:bg-[#0B243D] text-white border border-[#1D4968] text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Open NEXORA Control Center</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Subscription Pricing Architecture (Requirements 10 & 13) */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-widest text-[#0878C9]">
            Enterprise SaaS Licensing
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-white mt-1">
            Predictable Subscription Tiers for Energy Operations
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mx-auto mt-2">
            Scalable from independent single-site operations to sovereign petroleum mega-projects.
          </p>
        </div>

        <div className="grid md:grid-cols-4 gap-4">
          {[
            {
              name: 'ESSENTIAL',
              price: '$2,900',
              period: '/ month',
              desc: 'Core spares surveillance for independent field contractors',
              users: '5 Users',
              sites: '2 Facilities',
              skus: '350 Materials',
              ai: 'Basic Stock Triggers',
            },
            {
              name: 'PROFESSIONAL',
              price: '$8,200',
              period: '/ month',
              desc: 'Predictive intelligence & fast-track supplier matching for E&P producers',
              users: '25 Users',
              sites: '8 Facilities',
              skus: '2,500 Materials',
              ai: 'What-If Simulator & Predictive Risk',
            },
            {
              name: 'ENTERPRISE',
              price: '$18,500',
              period: '/ month',
              badge: 'Most Popular',
              desc: 'Autonomous multi-basin supply chain protection for major operators',
              users: 'Unlimited Users',
              sites: 'Unlimited Sites',
              skus: 'Unlimited Materials',
              ai: 'Full Autonomous Procurement + SAP / Maximo',
            },
            {
              name: 'CUSTOM / ENTERPRISE+',
              price: '$35,000',
              period: '/ month',
              desc: 'Dedicated national petroleum cloud & sovereign joint venture infrastructure',
              users: 'Unlimited Dedicated',
              sites: 'Unlimited National',
              skus: 'Unlimited National',
              ai: 'Dedicated On-Site Engineering & Instant SLA',
            },
          ].map((plan, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-slate-900 border flex flex-col justify-between transition-all ${
                plan.badge
                  ? 'border-[#0878C9] ring-2 ring-[#0878C9]/30 shadow-2xl'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#0878C9]">
                    NEXORA {plan.name}
                  </span>
                  {plan.badge && (
                    <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-[#0878C9] text-white">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-3xl font-black text-white tabular-nums font-mono">
                    {plan.price}
                  </span>
                  <span className="text-xs text-slate-400 font-medium"> {plan.period}</span>
                </div>

                <p className="text-xs text-slate-400 min-h-[36px]">{plan.desc}</p>

                <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#35C759]" />
                    <span>{plan.users}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#35C759]" />
                    <span>{plan.sites}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#35C759]" />
                    <span>{plan.skus}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-[#00AFC7]" />
                    <span>{plan.ai}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => handleSelectRole('user-org-admin')}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                Evaluate Tier
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Role Selection Modal */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-sky-600 dark:text-sky-300">
                  {modalType === 'BUYER' ? 'Select Company User Role' : modalType === 'SUPPLIER' ? 'Select Supplier Account' : 'Platform Super Admin'}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Multi-tenant isolation ensures data isolation across organizations.
                </p>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="text-slate-400 hover:text-white text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-2">
              {modalType === 'BUYER' && (
                <>
                  <button
                    onClick={() => handleSelectRole('user-org-admin')}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-bold text-sm text-sky-600 dark:text-sky-300">Sarah Nalwanga</div>
                      <div className="text-xs text-amber-400 font-medium">Organization Admin (Demo Oil &amp; Gas Co)</div>
                      <div className="text-[11px] text-slate-400 mt-1">Full control over facilities, materials, inventory, and risk configuration.</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleSelectRole('user-procurement')}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-bold text-sm text-sky-600 dark:text-sky-300">David Okello</div>
                      <div className="text-xs text-emerald-400 font-medium">Procurement Officer</div>
                      <div className="text-[11px] text-slate-400 mt-1">Issue tender requests, compare supplier offers, confirm purchase orders.</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleSelectRole('user-inventory')}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-bold text-sm text-sky-600 dark:text-sky-300">Robert Mugabe</div>
                      <div className="text-xs text-blue-400 font-medium">Inventory Officer</div>
                      <div className="text-[11px] text-slate-400 mt-1">Record physical usage, stock additions, warehouse transfers, and receipts.</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleSelectRole('user-maintenance')}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-bold text-sm text-sky-600 dark:text-sky-300">Eng. Patrick Kato</div>
                      <div className="text-xs text-amber-400 font-medium">Maintenance Officer</div>
                      <div className="text-[11px] text-slate-400 mt-1">Schedule equipment work orders, define material specs, track readiness.</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleSelectRole('user-mgmt')}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-bold text-sm text-sky-600 dark:text-sky-300">Diana Tumwine</div>
                      <div className="text-xs text-purple-400 font-medium">Management / Executive Viewer</div>
                      <div className="text-[11px] text-slate-400 mt-1">High-level risk heatmaps, AI intelligence briefings, and supplier audit.</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                </>
              )}

              {modalType === 'SUPPLIER' && (
                <>
                  <button
                    onClick={() => handleSelectRole('user-supplier-abc')}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-bold text-sm text-sky-600 dark:text-sky-300">James Mukasa</div>
                      <div className="text-xs text-teal-400 font-medium">ABC Industrial Supplies Ltd (Supplier Admin)</div>
                      <div className="text-[11px] text-slate-400 mt-1">Review tender opportunities, submit priced offers, dispatch orders.</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleSelectRole('user-supplier-eams')}
                    className="w-full text-left p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-bold text-sm text-sky-600 dark:text-sky-300">Grace Kyomugisha</div>
                      <div className="text-xs text-teal-400 font-medium">East Africa Mechanical Solutions (Supplier Rep)</div>
                      <div className="text-[11px] text-slate-400 mt-1">Local regional stockist with fast 7-day turnaround capabilities.</div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-400" />
                  </button>
                </>
              )}

              {modalType === 'ADMIN' && (
                <button
                  onClick={() => handleSelectRole('user-super-admin')}
                  className="w-full text-left p-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div>
                    <div className="font-bold text-sm text-sky-600 dark:text-sky-300">Marcus Vance</div>
                    <div className="text-xs text-rose-400 font-medium">NEXORA Platform Super Admin</div>
                    <div className="text-[11px] text-slate-400 mt-1">Manage tenant organizations, platform AI configuration, and system telemetry.</div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800/80 py-8 bg-slate-950 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">NEXORA O&G</span>
            <span>•</span>
            <span>AI-Powered Critical Materials &amp; Procurement Intelligence</span>
          </div>
          <div>
            Prototype Demonstration data. Fictional simulated assets for evaluation purposes.
          </div>
        </div>
      </footer>
    </div>
  );
};
