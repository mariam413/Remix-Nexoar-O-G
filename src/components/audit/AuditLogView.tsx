import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  Calendar,
  Shield,
  Layers,
  FileText,
} from 'lucide-react';
import { store } from '../../services/store';

export const AuditLogView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const auditLogs = store.getAuditLogs();

  const filteredLogs = auditLogs.filter((log) => {
    const matchesSearch =
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesType = typeFilter === 'all' || log.entityType === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-amber-400" />
            <span>Immutable Compliance &amp; Operational Audit Trail</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Tamper-evident chronological record of inventory adjustments, procurement commitments, and risk recalculations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded bg-slate-800 text-slate-300 font-mono border border-slate-700">
            {filteredLogs.length} Events Logged
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search action, officer name, justification..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 cursor-pointer focus:outline-none"
        >
          <option value="all">All Entity Domains</option>
          <option value="Material">Material &amp; Stock</option>
          <option value="Order">Purchase Orders</option>
          <option value="ProcurementRequest">Tender Requests</option>
          <option value="Offer">Supplier Proposals</option>
          <option value="MaintenanceRequirement">Maintenance Tasks</option>
          <option value="Supplier">Supplier Network</option>
        </select>
      </div>

      {/* Audit Table */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 border-b border-slate-800 text-[10px] uppercase text-slate-400 tracking-wider">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Authorized Officer</th>
                <th className="py-3 px-3">Action Executed</th>
                <th className="py-3 px-3">Entity Domain</th>
                <th className="py-3 px-3">Audit Details / State Delta</th>
                <th className="py-3 px-4">Operational Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-slate-200">{log.userName}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-amber-300">{log.action}</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono border border-slate-700">
                      {log.entityType}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-300">
                    {log.oldValue && <span className="text-slate-500 line-through mr-1.5">{log.oldValue}</span>}
                    <span className="font-bold text-white">{log.newValue || log.entityId}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 truncate max-w-xs">
                    {log.reason || 'Standard operational update'}
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
