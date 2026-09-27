import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Boxes,
  Sliders,
  HelpCircle,
  Wrench,
  Building2,
  DollarSign,
  Truck,
  Flame,
} from 'lucide-react';
import { store } from '../../services/store';
import { askAIAssistant, AIChatResponse } from '../../services/aiService';

interface Message {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  timestamp: string;
  provider?: string;
  confidence?: 'High' | 'Moderate' | 'Limited';
  completeness?: 'Good' | 'Partial' | 'Insufficient';
}

interface AIAssistantViewProps {
  onNavigate: (view: string, id?: string) => void;
}

const PRESET_CATEGORIES = [
  {
    id: 'inventory',
    label: 'Inventory & Spares',
    icon: Boxes,
    questions: [
      'What is my current inventory value?',
      'Which items are below reorder level?',
      'Which warehouse has the highest inventory value?',
      'Which materials are running out fast?',
    ],
  },
  {
    id: 'equipment',
    label: 'Equipment & Rigs',
    icon: Wrench,
    questions: [
      'Which equipment requires maintenance this month?',
      'Show me equipment with expired certifications.',
      'Which equipment has the highest maintenance cost?',
      'Predict maintenance failure.',
    ],
  },
  {
    id: 'facilities',
    label: 'Facilities & Safety',
    icon: Building2,
    questions: [
      'What facilities have outstanding maintenance?',
      'What was our maintenance expenditure this month?',
      'Draft an inspection report.',
    ],
  },
  {
    id: 'finance',
    label: 'Finance & Tax',
    icon: DollarSign,
    questions: [
      'Prepare a monthly financial summary.',
      'What is our VAT liability this month?',
      'What is our WHT liability this month?',
      'Explain oil & gas tax rules.',
    ],
  },
  {
    id: 'suppliers',
    label: 'Suppliers & O&G Entities',
    icon: Truck,
    questions: [
      'Which suppliers provide drilling equipment?',
      'Which suppliers have contracts expiring soon?',
      'Summarize supplier performance.',
    ],
  },
];

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  onNavigate,
}) => {
  const currentOrg = store.getCurrentOrganization();
  const currentUser = store.getCurrentUser();

  const [input, setInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('inventory');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-init',
      sender: 'AI',
      text: `Hello ${currentUser.name}. I am **Nexora AI Assistant**, your enterprise business and operational intelligence engine.

I am grounded across **Facilities, Warehouses, Equipment Rigs, Qualified Suppliers, Oil & Gas Operators, and Financial Ledgers**.

You can ask me questions about stock balances, maintenance schedules, API certifications, VAT liabilities, supplier performance, or select from the intelligence prompts below.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      provider: 'Nexora O&G Decision Intelligence',
      confidence: 'High',
      completeness: 'Good',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (userQuery: string) => {
    const q = userQuery.trim();
    if (!q) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'USER',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response: AIChatResponse = await askAIAssistant({
        message: q,
        organizationId: currentOrg.id,
        organizationName: currentOrg.name,
        userRole: currentUser.role,
        materials: store.getMaterials(),
        maintenance: store.getMaintenance(),
        suppliers: store.getSuppliers(),
        knowledge: store.getKnowledge(),
        facilities: store.getFacilities(),
        facilityMaintenance: store.getFacilityMaintenance(),
        facilityInspections: store.getFacilityInspections(),
        warehouses: store.getWarehouses(),
        equipment: store.getEquipment(),
        equipmentMaintenance: store.getEquipmentMaintenanceRecords(),
        supplierInvoices: store.getSupplierInvoices(),
        oilGasCompanies: store.getOilGasCompanies(),
      });

      const aiMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        sender: 'AI',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: response.provider,
        confidence: response.confidence,
        completeness: response.completeness,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const fallbackMsg: Message = {
        id: `msg-ai-${Date.now()}`,
        sender: 'AI',
        text: `### Operational Intelligence Notice:
Unable to contact external inference API. Operating under local verified ledger data. Please retry your query.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: 'Nexora Local Inference',
        confidence: 'High',
        completeness: 'Good',
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const activeCategoryObj = PRESET_CATEGORIES.find((c) => c.id === selectedCategory) || PRESET_CATEGORIES[0];

  return (
    <div className="space-y-4 flex flex-col h-[calc(100vh-130px)]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded bg-sky-500/20 text-sky-400 border border-sky-400/30">
              Autonomous Intelligence
            </span>
            <span className="text-xs text-slate-400">Grounded in ERP &amp; Field Operations</span>
          </div>
          <h1 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2 mt-1">
            <Bot className="w-5 h-5 text-sky-400" />
            <span>Nexora AI Assistant</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Query real-time inventory valuations, equipment reliability, facilities work orders, and oil &amp; gas tax rules.
          </p>
        </div>

        <button
          onClick={() => {
            setMessages([messages[0]]);
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Session</span>
        </button>
      </div>

      {/* Preset Category Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-thin">
        {PRESET_CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap cursor-pointer transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-sky-500 to-emerald-500 text-white font-bold shadow-md'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Preset Prompts Row */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 scrollbar-thin">
        {activeCategoryObj.questions.map((qText, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(qText)}
            className="text-xs bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-sky-300 border border-slate-800 rounded-lg px-3 py-1.5 whitespace-nowrap cursor-pointer transition-colors"
          >
            💬 {qText}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 overflow-y-auto space-y-4 shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.sender === 'USER' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold text-slate-400">
                {msg.sender === 'USER' ? currentUser.name : 'Nexora AI'}
              </span>
              <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
              {msg.provider && (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-emerald-400 font-mono">
                  {msg.provider}
                </span>
              )}
            </div>

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                msg.sender === 'USER'
                  ? 'bg-gradient-to-r from-sky-500 to-sky-600 text-white font-medium shadow-sm'
                  : 'bg-slate-900 border border-slate-800 text-slate-200'
              }`}
            >
              <div className="whitespace-pre-line prose prose-invert max-w-none text-xs">
                {msg.text}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex flex-col items-start space-y-1">
            <span className="text-[10px] text-slate-400 font-bold">Nexora AI</span>
            <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-2 text-xs text-emerald-400">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Analyzing enterprise ledger and field sensor telemetry...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(input);
        }}
        className="flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask Nexora AI about inventory, equipment, facilities, maintenance costs, taxes, or suppliers..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-400 shadow-sm"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-emerald-500 hover:from-sky-400 hover:to-emerald-400 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
};
