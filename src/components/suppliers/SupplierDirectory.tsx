import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Award,
  Clock,
  ShieldCheck,
  Star,
  ExternalLink,
  ChevronRight,
  ArrowRightLeft,
  X,
  Building2,
  FileSpreadsheet,
  DollarSign,
  Briefcase,
  Layers,
} from 'lucide-react';
import { store } from '../../services/store';
import { Supplier, SupplierInvoice } from '../../types';
import { OilGasCompanyDirectory } from './OilGasCompanyDirectory';
import { formatUGX, formatUSD } from '../../utils/currency';

interface SupplierDirectoryProps {
  onSelectSupplier?: (supplierId: string) => void;
}

export const SupplierDirectory: React.FC<SupplierDirectoryProps> = ({
  onSelectSupplier,
}) => {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'companies' | 'invoices'>('suppliers');
  const [currency, setCurrency] = useState<'UGX' | 'USD'>('UGX');
  const [searchTerm, setSearchTerm] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [comparingSuppliers, setComparingSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierDetail, setSelectedSupplierDetail] = useState<Supplier | null>(null);

  // Invoices Modal
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false);

  const suppliers = store.getSuppliers();
  const invoices = store.getSupplierInvoices();

  // 9-Step Onboarding Wizard Form State (Section 35)
  const [wizardData, setWizardData] = useState({
    name: '',
    legalName: '',
    registrationNumber: '',
    taxId: '',
    country: 'Uganda',
    city: 'Kampala',
    address: 'Plot 44 Industrial Area',
    contactPerson: '',
    email: '',
    phone: '+256 ',
    categories: ['Rotating Equipment Spares', 'Valves & Actuation'],
    capabilities: 'Stockist and authorized service center for API mechanical seals',
    certifications: ['API 682', 'ISO 9001:2015'],
    nsdRegistered: true,
    nsdNumber: 'NSD-2026-0912',
    leadTimeDays: 7,
  });

  const handleNextStep = () => {
    if (wizardStep < 9) {
      setWizardStep(wizardStep + 1);
    } else {
      // Submit new supplier
      store.addSupplier({
        name: wizardData.name || 'New Regional Supplier',
        registrationNumber: wizardData.nsdNumber || 'NSD-2026-0912',
        country: wizardData.country,
        region: 'Albertine Graben',
        district: 'Hoima',
        city: wizardData.city,
        physicalAddress: wizardData.address,
        email: wizardData.email || 'sales@supplier.co.ug',
        phone: wizardData.phone,
        website: 'https://supplier.co.ug',
        about: 'Specialized regional stockist and technical service center.',
        businessType: 'Stockist & Distributor',
        yearEstablished: 2018,
        experienceYears: 8,
        capabilities: [wizardData.capabilities],
        operatingAreas: ['Uganda', 'Kenya', 'Tanzania'],
        certifications: [
          { name: 'API 682', issuer: 'American Petroleum Institute', validUntil: '2028-12-31', verified: true },
          { name: 'ISO 9001:2015', issuer: 'DNV', validUntil: '2027-06-30', verified: true },
        ],
        materialsProvided: wizardData.categories,
        onTimeDeliveryRate: 95,
        leadTimeDays: Number(wizardData.leadTimeDays),
        readinessScore: 92,
        totalOrdersCompleted: 14,
        activeOrders: 1,
        simulated: false,
      });
      setShowWizard(false);
      setWizardStep(1);
    }
  };

  const toggleCompare = (supp: Supplier) => {
    if (comparingSuppliers.some((s) => s.id === supp.id)) {
      setComparingSuppliers(comparingSuppliers.filter((s) => s.id !== supp.id));
    } else if (comparingSuppliers.length < 3) {
      setComparingSuppliers([...comparingSuppliers, supp]);
    } else {
      alert('You can compare a maximum of 3 suppliers simultaneously.');
    }
  };

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.materialsProvided.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Module Navigation Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === 'suppliers'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          Qualified Suppliers & Vendors ({suppliers.length})
        </button>
        <button
          onClick={() => setActiveTab('companies')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === 'companies'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Oil & Gas Companies Database
        </button>
        <button
          onClick={() => setActiveTab('invoices')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 cursor-pointer transition-colors flex items-center gap-2 ${
            activeTab === 'invoices'
              ? 'border-amber-400 text-amber-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Supplier Invoices & Ledger ({invoices.length})
        </button>
      </div>

      {activeTab === 'companies' && <OilGasCompanyDirectory />}

      {activeTab === 'invoices' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                Supplier Invoices & Financial Settlement
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Track supplier bills, purchase order matchings, VAT withholding, and disbursement statuses.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-slate-950 border border-slate-700 rounded-lg p-1 text-xs font-semibold">
                <button
                  onClick={() => setCurrency('UGX')}
                  className={`px-3 py-1 rounded cursor-pointer ${
                    currency === 'UGX' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  UGX
                </button>
                <button
                  onClick={() => setCurrency('USD')}
                  className={`px-3 py-1 rounded cursor-pointer ${
                    currency === 'USD' ? 'bg-amber-500 text-slate-950' : 'text-slate-400'
                  }`}
                >
                  USD
                </button>
              </div>
              <button
                onClick={() => setIsNewInvoiceModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow"
              >
                <Plus className="w-4 h-4" />
                Log Invoice
              </button>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Invoice Number</th>
                    <th className="px-4 py-3">Supplier Name</th>
                    <th className="px-4 py-3">PO Reference</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3">Amount ({currency})</th>
                    <th className="px-4 py-3">Payment Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-100">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3 font-medium text-slate-200">{inv.supplierName}</td>
                      <td className="px-4 py-3 font-mono text-amber-400">{inv.poNumber || 'PO-2026-0041'}</td>
                      <td className="px-4 py-3 font-mono text-slate-400">{inv.dueDate}</td>
                      <td className="px-4 py-3 font-semibold text-slate-100">
                        {currency === 'UGX' ? formatUGX(inv.amountUGX) : formatUSD(inv.amountUSD)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            inv.status === 'Paid'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : inv.status === 'Approved'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : inv.status === 'Overdue'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <select
                          value={inv.status}
                          onChange={(e) =>
                            store.updateSupplierInvoiceStatus(inv.id, e.target.value as any)
                          }
                          className="bg-slate-950 border border-slate-800 rounded px-2 py-0.5 text-[11px] text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                        >
                          <option value="PENDING">PENDING</option>
                          <option value="APPROVED">APPROVED</option>
                          <option value="PAID">PAID</option>
                          <option value="OVERDUE">OVERDUE</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'suppliers' && (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <Truck className="w-5 h-5 text-amber-400" />
                <span>Qualified Supplier Directory &amp; Compliance Network</span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Verified oil &amp; gas vendors, National Supplier Database (NSD) status, and historical on-time delivery benchmarks.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {comparingSuppliers.length > 0 && (
                <button
                  onClick={() => setComparingSuppliers([])}
                  className="text-xs text-slate-400 hover:text-white px-2 py-1"
                >
                  Clear Comparison ({comparingSuppliers.length})
                </button>
              )}
              <button
                onClick={() => { setWizardStep(1); setShowWizard(true); }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-md shadow-amber-950 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ 9-Step Supplier Onboarding</span>
              </button>
            </div>
          </div>

      {/* Search Bar */}
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search vendor name, country, category (e.g. API 682, Kampala)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <div className="text-slate-400 text-xs">
          Showing <strong>{filteredSuppliers.length}</strong> Qualified Vendors
        </div>
      </div>

      {/* Comparison Drawer (if active) */}
      {comparingSuppliers.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-amber-500/40 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" />
              <span>Multi-Variable Supplier Comparison</span>
            </h3>
            <button onClick={() => setComparingSuppliers([])} className="text-slate-400 hover:text-white">✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {comparingSuppliers.map((supp) => (
              <div key={supp.id} className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <div className="font-bold text-white text-sm">{supp.name}</div>
                <div className="text-[11px] text-slate-400">{supp.city}, {supp.country}</div>
                <div className="py-2 border-y border-slate-800 space-y-1 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Lead Time:</span>
                    <strong className="text-amber-400">{supp.leadTimeDays} Days</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">On-Time Rate:</span>
                    <strong className="text-emerald-400">{supp.onTimeDeliveryRate}%</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Readiness:</span>
                    <strong className="text-white">{supp.readinessScore}/100</strong>
                  </div>
                </div>
                <div className="text-[10px] text-slate-300">
                  Certs: {supp.certifications.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suppliers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supp) => {
          const isComparing = comparingSuppliers.some((s) => s.id === supp.id);

          return (
            <div
              key={supp.id}
              className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-base">{supp.name}</h3>
                    <p className="text-xs text-slate-400">{supp.city}, {supp.country}</p>
                  </div>
                  {supp.registrationNumber && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{supp.registrationNumber.startsWith('NSD') ? 'NSD Verified' : 'Registered'}</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800/80 text-center font-mono text-xs">
                  <div className="p-2 rounded-lg bg-slate-950/60">
                    <span className="text-[10px] text-slate-500 block uppercase">Lead Time</span>
                    <span className="font-bold text-amber-400">{supp.leadTimeDays}d</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60">
                    <span className="text-[10px] text-slate-500 block uppercase">On-Time</span>
                    <span className="font-bold text-emerald-400">{supp.onTimeDeliveryRate}%</span>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-950/60">
                    <span className="text-[10px] text-slate-500 block uppercase">Readiness</span>
                    <span className="font-bold text-white">{supp.readinessScore}</span>
                  </div>
                </div>

                <div className="text-xs space-y-1.5">
                  <div className="text-slate-400">
                    <span className="font-semibold text-slate-300">Capabilities:</span> {supp.capabilities.join(', ')}
                  </div>
                  <div className="text-slate-400">
                    <span className="font-semibold text-slate-300">Certifications:</span>{' '}
                    <span className="text-amber-300 font-medium">
                      {supp.certifications.map((c) => c.name).join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <button
                  onClick={() => toggleCompare(supp)}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                    isComparing
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {isComparing ? '✓ Comparing' : '+ Compare'}
                </button>

                <div className="text-right text-[11px] text-slate-400">
                  {supp.email}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 9-Step Supplier Onboarding Wizard Modal (Section 35) */}
      {showWizard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">Step {wizardStep} of 9</span>
                <h3 className="text-base font-bold text-white">
                  {wizardStep === 1 && 'Basic Company Information'}
                  {wizardStep === 2 && 'National Supplier Database (NSD) Registration'}
                  {wizardStep === 3 && 'Material Categories & Classification'}
                  {wizardStep === 4 && 'Technical & Manufacturing Capabilities'}
                  {wizardStep === 5 && 'Quality & Standards Certifications'}
                  {wizardStep === 6 && 'Geographic Locations & Warehouses'}
                  {wizardStep === 7 && 'Delivery & Lead Time Capabilities'}
                  {wizardStep === 8 && 'Pricing & Commercial Terms Framework'}
                  {wizardStep === 9 && 'Review & Final Verification'}
                </h3>
              </div>
              <button onClick={() => setShowWizard(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            {/* Step Content */}
            <div className="py-2 text-xs text-slate-300 space-y-3">
              {wizardStep === 1 && (
                <>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Company Trading Name *</label>
                    <input
                      type="text"
                      value={wizardData.name}
                      onChange={(e) => setWizardData({ ...wizardData, name: e.target.value })}
                      placeholder="e.g. Nile Basin Mechanical Seals Ltd"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Contact Email *</label>
                    <input
                      type="email"
                      value={wizardData.email}
                      onChange={(e) => setWizardData({ ...wizardData, email: e.target.value })}
                      placeholder="e.g. tenders@nilebasin.co.ug"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                    />
                  </div>
                </>
              )}

              {wizardStep === 2 && (
                <>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="nsd"
                      checked={wizardData.nsdRegistered}
                      onChange={(e) => setWizardData({ ...wizardData, nsdRegistered: e.target.checked })}
                      className="w-4 h-4 rounded bg-slate-800 text-amber-500"
                    />
                    <label htmlFor="nsd" className="font-semibold text-slate-200">Registered on PAU National Supplier Database (NSD)</label>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">NSD Certificate Number</label>
                    <input
                      type="text"
                      value={wizardData.nsdNumber}
                      onChange={(e) => setWizardData({ ...wizardData, nsdNumber: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                    />
                  </div>
                </>
              )}

              {wizardStep === 3 && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Material Categories</label>
                  <p className="text-slate-400 mb-2">Rotating Equipment Spares, Valves, Mechanical Seals, Filtration, Instrumentation.</p>
                  <div className="p-2.5 bg-slate-800 rounded-lg text-slate-200">
                    Selected: {wizardData.categories.join(', ')}
                  </div>
                </div>
              )}

              {wizardStep === 4 && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Capabilities Description</label>
                  <textarea
                    rows={3}
                    value={wizardData.capabilities}
                    onChange={(e) => setWizardData({ ...wizardData, capabilities: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              )}

              {wizardStep === 5 && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Verified Certifications</label>
                  <p className="text-slate-400 mb-2">API 682, ISO 9001:2015, ISO 14001, API Spec Q1.</p>
                  <div className="p-2.5 bg-slate-800 rounded-lg text-slate-200">
                    {wizardData.certifications.join(', ')}
                  </div>
                </div>
              )}

              {wizardStep === 6 && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Stock Warehouse Location</label>
                  <input
                    type="text"
                    value={wizardData.city + ', ' + wizardData.country}
                    onChange={(e) => setWizardData({ ...wizardData, city: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                  />
                </div>
              )}

              {wizardStep === 7 && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Standard Delivery Turnaround (Days)</label>
                  <input
                    type="number"
                    min="1"
                    value={wizardData.leadTimeDays}
                    onChange={(e) => setWizardData({ ...wizardData, leadTimeDays: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-mono"
                  />
                </div>
              )}

              {wizardStep === 8 && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Standard Commercial Terms</label>
                  <p className="text-slate-400">Net 30 Days, Delivery Duty Paid (DDP) to designated field receiving gate.</p>
                </div>
              )}

              {wizardStep === 9 && (
                <div className="space-y-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="font-bold text-white">{wizardData.name || 'New Regional Supplier'}</div>
                  <div className="text-slate-400">Lead Time: {wizardData.leadTimeDays} Days • NSD: {wizardData.nsdNumber}</div>
                  <div className="text-emerald-400 font-semibold">Ready to activate vendor in NEXORA network.</div>
                </div>
              )}
            </div>

            {/* Wizard Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              {wizardStep > 1 ? (
                <button
                  onClick={() => setWizardStep(wizardStep - 1)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Back
                </button>
              ) : <div />}

              <button
                onClick={handleNextStep}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer shadow-md shadow-amber-950"
              >
                {wizardStep === 9 ? 'Complete Onboarding' : 'Next Step'}
              </button>
            </div>
          </div>
        </div>
      )}
      </>
    )}

      {/* LOG INVOICE MODAL */}
      {isNewInvoiceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-amber-400" />
                Log Supplier Invoice
              </h3>
              <button
                onClick={() => setIsNewInvoiceModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const fd = new FormData(e.currentTarget);
                const amtUGX = Number(fd.get('amountUGX') || 0);
                const amtUSD = Number(fd.get('amountUSD') || amtUGX / 3750);
                const suppId = String(fd.get('supplierId'));
                const s = suppliers.find((x) => x.id === suppId);

                store.addSupplierInvoice({
                  supplierId: suppId,
                  supplierName: s ? s.name : 'Oilfield Vendor',
                  organizationId: 'org-demo-oil-gas',
                  invoiceNumber: String(fd.get('invoiceNumber')),
                  poNumber: String(fd.get('poNumber')),
                  amountUGX: amtUGX,
                  amountUSD: amtUSD,
                  currency: 'UGX',
                  status: 'Pending',
                  issueDate: new Date().toISOString().slice(0, 10),
                  dueDate: String(fd.get('dueDate')),
                  vatAmountUGX: amtUGX * 0.18,
                  withholdingTaxUGX: amtUGX * 0.06,
                });
                setIsNewInvoiceModalOpen(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-400 font-medium mb-1">Invoice Number *</label>
                <input
                  name="invoiceNumber"
                  required
                  placeholder="INV-2026-0982"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Supplier *</label>
                <select
                  name="supplierId"
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-medium mb-1">PO Reference</label>
                  <input
                    name="poNumber"
                    placeholder="PO-2026-0041"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-medium mb-1">Due Date *</label>
                  <input
                    type="date"
                    name="dueDate"
                    required
                    defaultValue="2026-10-31"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-medium mb-1">Invoice Amount (UGX) *</label>
                <input
                  type="number"
                  name="amountUGX"
                  required
                  placeholder="38000000"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-mono"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewInvoiceModalOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold"
                >
                  Record Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
