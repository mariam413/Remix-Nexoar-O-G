import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  Plus,
  FileText,
  Tag,
  Calendar,
  Lock,
  ExternalLink,
} from 'lucide-react';
import { store } from '../../services/store';

export const CompanyKnowledgeView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const knowledge = store.getKnowledge();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Procurement Policy' as const,
    content: '',
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addKnowledgeItem({
      organizationId: store.getCurrentOrganization().id,
      title: formData.title,
      category: formData.category,
      content: formData.content,
      createdBy: store.getCurrentUser().name,
    });
    setShowAddModal(false);
  };

  const filteredItems = knowledge.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <span>Corporate Operational Knowledge &amp; Standards Base</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Grounding repository for procurement policies, API standards, and National Content regulations.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold shadow-md shadow-amber-950 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Knowledge Article</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-slate-900 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search knowledge articles, API standards, policy..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-amber-500"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-2 cursor-pointer focus:outline-none"
        >
          <option value="all">All Categories</option>
          <option value="Procurement Policy">Procurement Policy</option>
          <option value="Material Specification">Material Specification</option>
          <option value="Supplier Requirement">Supplier Requirement</option>
          <option value="Technical Note">Technical Note</option>
          <option value="Maintenance Procedure">Maintenance Procedure</option>
        </select>
      </div>

      {/* Articles Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredItems.map((item) => (
          <div key={item.id} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-amber-300 border border-slate-700">
                  {item.category}
                </span>
                <span className="text-[10px] text-slate-500">
                  {new Date(item.updatedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
              <h3 className="font-bold text-white text-base">{item.title}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">{item.content}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-semibold text-slate-300">Category: {item.category}</span>
              <span>By: {item.createdBy}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Article Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-amber-400" />
                <span>Add Knowledge Base Article</span>
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Mechanical Seal API 682 Verification Protocol"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                >
                  <option value="Procurement Policy">Procurement Policy</option>
                  <option value="Material Specification">Material Specification</option>
                  <option value="Supplier Requirement">Supplier Requirement</option>
                  <option value="Technical Note">Technical Note</option>
                  <option value="Maintenance Procedure">Maintenance Procedure</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Knowledge Content *</label>
                <textarea
                  rows={4}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Document policy rules, engineering specifications, or compliance standards..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer"
                >
                  Publish Article
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
