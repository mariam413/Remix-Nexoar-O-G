import React, { useState } from 'react';
import {
  Building2,
  Search,
  Filter,
  Globe,
  Mail,
  Phone,
  Briefcase,
  ChevronRight,
  ExternalLink,
  Award,
  Layers,
  FileText,
  DollarSign,
  Plus,
  X,
  MapPin,
} from 'lucide-react';
import { OilGasCompany, OilGasCompanyType, OilGasSegment } from '../../types';
import { store } from '../../services/store';
import { formatUGX, formatUSD } from '../../utils/currency';

const COMPANY_TYPES: { id: string; label: string }[] = [
  { id: 'ALL', label: 'All Company Types' },
  { id: 'IOC', label: 'IOC (International Oil Co.)' },
  { id: 'NOC', label: 'NOC (National Oil Co.)' },
  { id: 'EPC Contractor', label: 'EPC Contractor' },
  { id: 'Oilfield Services', label: 'Oilfield Services' },
  { id: 'Pipeline Company', label: 'Pipeline Operator' },
  { id: 'Refinery', label: 'Refinery & Petrochemical' },
  { id: 'Local Supplier', label: 'Local Ugandan Supplier' },
  { id: 'Equipment Supplier', label: 'OEM Equipment Supplier' },
];

export const OilGasCompanyDirectory: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');
  const [currency, setCurrency] = useState<'UGX' | 'USD'>('UGX');
  const [viewingCompany, setViewingCompany] = useState<OilGasCompany | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const companies = store.getOilGasCompanies();

  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.headquarters.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.projects.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesType = selectedType === 'ALL' || (c.type || c.companyType) === selectedType;
    const matchesSegment = selectedSegment === 'ALL' || (c.segment || c.oilGasSegment) === selectedSegment;

    return matchesSearch && matchesType && matchesSegment;
  });

  const handleCreateCompany = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const compType = (formData.get('type') as OilGasCompanyType) || 'Local Supplier';
    const compSegment = (formData.get('segment') as OilGasSegment) || 'Midstream';

    store.addOilGasCompany({
      name: String(formData.get('name')),
      country: String(formData.get('country') || 'Uganda'),
      companyType: compType,
      type: compType,
      headquarters: String(formData.get('headquarters') || 'Kampala, Uganda'),
      website: String(formData.get('website') || 'https://example.com'),
      contactPerson: String(formData.get('contactPerson') || ''),
      contactEmail: String(formData.get('contactEmail') || ''),
      contactPhone: String(formData.get('contactPhone') || ''),
      oilGasSegment: compSegment,
      segment: compSegment,
      assets: String(formData.get('assets') || 'Processing and drilling assets')
        .split(',')
        .map((s) => s.trim()),
      projects: String(formData.get('projects') || 'Lake Albert Development')
        .split(',')
        .map((s) => s.trim()),
      facilitiesCount: 1,
      equipmentCount: 10,
      suppliersCount: 5,
      activeContracts: ['Framework Agreement 2026'],
      procurementOpportunities: [
        {
          id: `opp-${Date.now()}`,
          title: 'Supply of Specialized Pipeline Valves & Fittings',
          category: 'Valves & Fittings',
          estimatedValueUGX: 4500000000,
          estimatedValueUSD: 1200000,
          valueUGX: 4500000000,
          valueUSD: 1200000,
          deadline: '2026-11-30',
          status: 'Open',
        },
      ],
      notes: String(formData.get('notes') || ''),
    });

    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Hydrocarbon Ecosystem
            </span>
            <span className="text-xs text-slate-400">Lake Albert Basin & EACOP Stakeholders</span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight mt-1 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-amber-400" />
            Oil & Gas Companies Database
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Directory of IOCs, NOCs, EPC contractors, oilfield service corporations, and tender opportunities.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Currency Toggle */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-1 text-xs font-semibold">
            <button
              onClick={() => setCurrency('UGX')}
              className={`px-3 py-1 rounded cursor-pointer transition-colors ${
                currency === 'UGX' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              UGX
            </button>
            <button
              onClick={() => setCurrency('USD')}
              className={`px-3 py-1 rounded cursor-pointer transition-colors ${
                currency === 'USD' ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              USD
            </button>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs transition-all shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Register Company
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search by company name, headquarters, project (e.g. Tilenga, Kingfisher, EACOP)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              {COMPANY_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Segment:</span>
            <select
              value={selectedSegment}
              onChange={(e) => setSelectedSegment(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">All Segments</option>
              <option value="Upstream">Upstream</option>
              <option value="Midstream">Midstream</option>
              <option value="Downstream">Downstream</option>
            </select>
          </div>
        </div>
      </div>

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCompanies.map((comp) => {
          const totalOppValueUGX = comp.procurementOpportunities.reduce(
            (sum, o) => sum + (o.estimatedValueUGX || o.valueUGX || 0),
            0
          );
          const totalOppValueUSD = comp.procurementOpportunities.reduce(
            (sum, o) => sum + (o.estimatedValueUSD || o.valueUSD || 0),
            0
          );

          return (
            <div
              key={comp.id}
              className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-slate-700 transition-all flex flex-col justify-between shadow-sm group"
            >
              <div>
                <div className="p-4 border-b border-slate-800/80 bg-slate-950/40">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          {comp.companyType || comp.type}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">{comp.country}</span>
                      </div>
                      <h3 className="font-bold text-white text-base mt-1 group-hover:text-amber-300 transition-colors">
                        {comp.name}
                      </h3>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      {comp.oilGasSegment || comp.segment}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {comp.headquarters}
                  </p>
                </div>

                <div className="p-4 space-y-3 text-xs">
                  {/* Projects & Assets */}
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                      Active Projects & Assets
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {comp.projects.map((proj, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-slate-800 text-slate-200 text-[10px] font-medium"
                        >
                          {proj}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Procurement Opportunities Highlight */}
                  {comp.procurementOpportunities.length > 0 && (
                    <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {comp.procurementOpportunities.length} Active Tender(s)
                        </span>
                        <span className="font-bold font-mono text-emerald-300">
                          {currency === 'UGX' ? formatUGX(totalOppValueUGX) : formatUSD(totalOppValueUSD)}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300 truncate">
                        {comp.procurementOpportunities[0].title}
                      </p>
                    </div>
                  )}

                  {/* Contact Summary */}
                  <div className="space-y-1 text-slate-300 text-[11px] pt-1">
                    <p>
                      <span className="text-slate-500">Contact:</span>{' '}
                      <span className="text-slate-200">{comp.contactPerson || 'Vendor Relations'}</span>
                    </p>
                    <p>
                      <span className="text-slate-500">Email:</span>{' '}
                      <span className="font-mono text-slate-300">{comp.contactEmail}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-950/70 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setViewingCompany(comp)}
                  className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
                >
                  View Profile & Opportunities
                </button>
                {comp.website && (
                  <a
                    href={comp.website}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-amber-400 flex items-center gap-1 text-xs"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Website
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* VIEW COMPANY DOSSIER MODAL */}
      {viewingCompany && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {viewingCompany.companyType || viewingCompany.type}
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    {viewingCompany.oilGasSegment || viewingCompany.segment}
                  </span>
                  <span className="text-xs text-slate-400">{viewingCompany.country}</span>
                </div>
                <h3 className="font-bold text-xl text-white mt-1">{viewingCompany.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  Headquarters: {viewingCompany.headquarters}
                </p>
              </div>
              <button
                onClick={() => setViewingCompany(null)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <h4 className="font-bold text-slate-300 mb-1.5 uppercase text-[10px] tracking-wider">
                  Key Assets & Concessions
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {viewingCompany.assets.map((asset, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                    >
                      {asset}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-300 mb-1.5 uppercase text-[10px] tracking-wider">
                  Major Oil & Gas Projects
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {viewingCompany.projects.map((proj, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200"
                    >
                      {proj}
                    </span>
                  ))}
                </div>
              </div>

              {/* Procurement Opportunities List */}
              <div>
                <h4 className="font-bold text-slate-200 mb-2 uppercase text-[10px] tracking-wider flex items-center justify-between">
                  <span>Procurement & Subcontract Opportunities</span>
                  <span className="text-emerald-400 font-mono">
                    {viewingCompany.procurementOpportunities.length} Available
                  </span>
                </h4>
                <div className="space-y-2">
                  {viewingCompany.procurementOpportunities.map((opp, idx) => (
                    <div
                      key={opp.id || `opp-${idx}`}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-slate-100">{opp.title}</div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                          <span>Category: {opp.category || 'Supplies & Services'}</span>
                          <span>•</span>
                          <span>Deadline: {opp.deadline}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-bold text-emerald-400 block font-mono">
                          {currency === 'UGX'
                            ? formatUGX(opp.estimatedValueUGX || opp.valueUGX)
                            : formatUSD(opp.estimatedValueUSD || opp.valueUSD)}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                          {opp.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {viewingCompany.notes && (
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <span className="font-semibold text-slate-400 block mb-1">Corporate Notes</span>
                  <p className="text-slate-300 leading-relaxed">{viewingCompany.notes}</p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setViewingCompany(null)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTER COMPANY MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-400" />
                <h3 className="font-bold text-base text-white">Register Oil & Gas Entity</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCompany} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-medium mb-1">Company Name *</label>
                <input
                  name="name"
                  required
                  placeholder="e.g. Uganda National Oil Company (UNOC)"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Company Type *</label>
                  <select
                    name="type"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="IOC">IOC</option>
                    <option value="NOC">NOC</option>
                    <option value="EPC Contractor">EPC Contractor</option>
                    <option value="Oilfield Services">Oilfield Services</option>
                    <option value="Pipeline Company">Pipeline Company</option>
                    <option value="Refinery">Refinery</option>
                    <option value="Equipment Supplier">Equipment Supplier</option>
                    <option value="Local Supplier">Local Supplier</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Oil & Gas Segment</label>
                  <select
                    name="segment"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="Upstream">Upstream</option>
                    <option value="Midstream">Midstream</option>
                    <option value="Downstream">Downstream</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Country</label>
                  <input
                    name="country"
                    defaultValue="Uganda"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Headquarters</label>
                  <input
                    name="headquarters"
                    placeholder="Kampala, Uganda"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Contact Person</label>
                  <input
                    name="contactPerson"
                    placeholder="Eng. Sarah Namubiru"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-medium mb-1">Contact Email</label>
                  <input
                    name="contactEmail"
                    placeholder="contracts@unoc.co.ug"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Active Projects (comma separated)</label>
                <input
                  name="projects"
                  placeholder="Tilenga Upstream, EACOP, Kabaale Refinery"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Assets (comma separated)</label>
                <input
                  name="assets"
                  placeholder="Block 1 & 2 Concessions, Pipeline Junction"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Register Entity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
