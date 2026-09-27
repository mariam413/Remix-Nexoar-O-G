import React from 'react';
import {
  Building2,
  MapPin,
  Mail,
  Phone,
  Globe,
  FileCheck,
  Award,
  Warehouse,
  ShieldCheck,
  CheckCircle,
  Clock,
  Download,
  ExternalLink,
  Layers,
  Truck,
} from 'lucide-react';

export const CompanyProfileTab: React.FC = () => {
  const nsdDocuments = [
    {
      title: 'Supplier Registration Status: Verified Demo',
      reference: 'PAU/NSD/2026/0442-SIM',
      type: 'National Supplier Database (NSD) Joint Qualification System',
      issuedDate: '15 Jan 2026',
      expiryDate: '14 Jan 2027',
      status: 'VERIFIED DEMO',
    },
    {
      title: 'Business Registration Certificate: Demo Document',
      reference: 'URSB-B-80020019283-DEMO',
      type: 'Certificate of Incorporation (Uganda Registration Services Bureau)',
      issuedDate: '12 Feb 2018',
      expiryDate: 'Perpetual',
      status: 'VERIFIED DEMO',
    },
    {
      title: 'Tax Registration & Clearance: Demo Document',
      reference: 'URA-TIN-1009827361-DEMO',
      type: 'Uganda Revenue Authority Electronic Tax Clearance Certificate',
      issuedDate: '01 Jul 2026',
      expiryDate: '30 Jun 2027',
      status: 'VERIFIED DEMO',
    },
    {
      title: 'Goods In Transit Insurance: Demo Document',
      reference: 'JUB-GIT-2026-0914-DEMO',
      type: 'Comprehensive Marine & Inland Transit Heavy Equipment Policy',
      issuedDate: '01 Jan 2026',
      expiryDate: '31 Dec 2026',
      status: 'VERIFIED DEMO',
    },
    {
      title: 'Quality Management Certificate: Demo Document',
      reference: 'ISO-9001-2015-QMS-4410',
      type: 'ISO 9001:2015 Industrial Spares Warehousing & Logistics',
      issuedDate: '20 Mar 2024',
      expiryDate: '19 Mar 2027',
      status: 'VERIFIED DEMO',
    },
    {
      title: 'Oil & Gas Sector Category Registration: Demo Record',
      reference: 'PAU-CAT-E-04-ROTATING',
      type: 'Rotating Equipment, Mechanical Seals, High Pressure Valves & Instrumentation',
      issuedDate: '10 Feb 2026',
      expiryDate: '09 Feb 2027',
      status: 'VERIFIED DEMO',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#E0F4FA] dark:bg-sky-950/60 border border-[#65C7E5] flex items-center justify-center font-black text-2xl text-[#087EA4] dark:text-sky-300 shrink-0">
              ABC
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-[#123B63] dark:text-white tracking-tight">
                  ABC Industrial Supplies Ltd
                </h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>NSD Registered (Verified Demo)</span>
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase">
                  Simulated Demo Record
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-slate-400 mt-1">
                Industrial Equipment &amp; Spare Parts Supplier • Albertine Graben &amp; Kampala Regional Supply Network
              </p>
            </div>
          </div>
        </div>

        <p className="text-xs text-[#334155] dark:text-slate-300 mt-4 leading-relaxed p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
          &ldquo;ABC Industrial Supplies Ltd is a simulated demonstration supplier specializing in industrial spare parts, rotating equipment components, valves, instrumentation and maintenance materials.&rdquo;
        </p>
      </div>

      {/* Grid: Company Details & Service Areas */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Company & Contact Information */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#123B63] dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Building2 className="w-4 h-4 text-[#0B78B5]" />
            <span>Company &amp; Contact Details</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#64748B] block text-[11px]">Primary Headquarters &amp; Warehouse</span>
                <span className="font-bold text-[#123B63] dark:text-white">Plot 42, 6th Street Industrial Area, Kampala, Uganda</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#64748B] block text-[11px]">Tender &amp; Quotation Inquiries</span>
                <span className="font-bold text-[#0B78B5]">procurement@abcindustrial.example</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Phone className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#64748B] block text-[11px]">Direct Operations Hotline</span>
                <span className="font-bold text-[#123B63] dark:text-white">+256 700 000 000</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Globe className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#64748B] block text-[11px]">Company Web Portal</span>
                <span className="font-bold text-[#0B78B5]">demo.abcindustrial.example</span>
              </div>
            </div>
          </div>
        </div>

        {/* Business Categories & Warehouses */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-[#123B63] dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Warehouse className="w-4 h-4 text-[#00A6A6]" />
            <span>Warehouses &amp; Logistics Infrastructure</span>
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#123B63] dark:text-white">Kampala Central Depot</span>
                <span className="text-[10px] font-bold text-[#32B86A] bg-emerald-100 px-2 py-0.5 rounded">1,200 sq.m</span>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1">
                6th Street Industrial Area • Temperature-controlled elastomer seal lockers, heavy crane offloading bay, clean nitrogen test bench.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#123B63] dark:text-white">Hoima Field Staging Yard</span>
                <span className="text-[10px] font-bold text-[#087EA4] bg-sky-100 px-2 py-0.5 rounded">800 sq.m</span>
              </div>
              <p className="text-[11px] text-[#64748B] dark:text-slate-400 mt-1">
                Kaiso-Tonya Road Junction • 4-hour hot-shot rapid response delivery corridor to Kingfisher CPF and Tilenga Wellpads.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* NSD & Compliance Documents Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-[#123B63] dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#32B86A]" />
              <span>National Supplier Database (NSD) &amp; Compliance Certificates</span>
            </h2>
            <p className="text-xs text-[#64748B] dark:text-slate-400">
              Regulatory compliance dossiers certified for upstream petroleum sector operations in Uganda.
            </p>
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-100 text-amber-900 border border-amber-300 uppercase">
            SIMULATED DEMO DOCUMENTS
          </span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {nsdDocuments.map((doc, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2 hover:border-[#65C7E5] transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {doc.status}
                </span>
                <span className="font-mono text-[10px] text-[#64748B] dark:text-slate-400">{doc.reference}</span>
              </div>

              <div className="font-bold text-[#123B63] dark:text-white text-xs">
                {doc.title}
              </div>

              <p className="text-[11px] text-[#334155] dark:text-slate-300 leading-relaxed">
                {doc.type}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-[#64748B] dark:text-slate-400">
                <span>Validity: {doc.issuedDate} &rarr; {doc.expiryDate}</span>
                <span className="text-[#0B78B5] font-bold flex items-center gap-1 cursor-pointer">
                  <Download className="w-3 h-3" />
                  <span>PDF</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
