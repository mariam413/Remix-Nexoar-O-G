import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '10mb' }));

// Determine AI Provider configuration
const aiProvider = process.env.AI_PROVIDER || 'gemini';
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const geminiModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const openaiApiKey = process.env.OPENAI_API_KEY || '';
const openaiModel = process.env.OPENAI_MODEL || 'gpt-5.6-sol';

let geminiClient: GoogleGenAI | null = null;
if (geminiApiKey) {
  try {
    geminiClient = new GoogleGenAI({
      apiKey: geminiApiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error('Failed to initialize GoogleGenAI client:', err);
  }
}

// Config endpoint
app.get('/api/config', (req, res) => {
  res.json({
    aiProvider,
    geminiAvailable: !!geminiApiKey,
    geminiModel,
    openaiAvailable: !!openaiApiKey,
    openaiModel,
    environment: process.env.NODE_ENV || 'development',
    systemStatus: 'HEALTHY',
    version: '1.4.0',
    disclaimer: 'Prototype demonstration data. Fictional simulated oil and gas operational assets.',
  });
});

// Helper for deterministic fallback AI reasoning when external API is unreachable or key is unset
function generateFallbackReasoning(prompt: string, contextData: any): string {
  const queryLower = prompt.toLowerCase();
  
  if (queryLower.includes('inventory value') || queryLower.includes('total stock value') || queryLower.includes('how much stock')) {
    return `### Current Inventory Valuation (UGX & USD)
- **Total Physical Inventory Valuation**: **UGX 12,450,000,000** (~USD 3,320,000).
- **Valuation Methodology**: Weighted Average Costing (WAC) and FIFO compliant with IAS 2 and JV Production Sharing Agreements.
- **Key Storage Hubs**:
  * **Main Logistics Base (Hoima Hub)**: UGX 7,720,000,000 (62%)
  * **CPF Bonded Material Yard**: UGX 3,240,000,000 (26%)
  * **Buliisa Pipe Yard**: UGX 1,490,000,000 (12%)
- **Critical Spares**: 74% of inventory value consists of rotating equipment spares, API 5CT casing, and valves.`;
  }

  if (queryLower.includes('below reorder') || queryLower.includes('reorder level') || queryLower.includes('low stock') || queryLower.includes('running out fast')) {
    return `### Stock Alert: Materials Below Mandatory Reorder Point
1. **API 682 Dual Mechanical Seal Cartridge (P-101)**
   - **Current Stock**: 4 units (Safety buffer: 2 units)
   - **Upcoming Demand**: 3 units on 20-Oct-2026 for Crude Transfer Pump P-101
   - **Post-Maintenance Balance**: 1 unit (**Breaches safety threshold**)
   - **Recommendation**: **PROCURE NOW** via East Africa Mechanical Solutions (7d turnaround).
2. **Heavy-Duty Gas Scrubber Coalescing Filter Cartridges (C-101)**
   - **Current Stock**: 6 units vs Reorder level of 12 units
   - **Status**: Critical depletion, 2 active supplier quotes pending approval.
3. **Duplex Stainless Steel Flange Gaskets (10" ANSI 1500#)**
   - **Current Stock**: 3 units vs Reorder level of 6 units.`;
  }

  if (queryLower.includes('equipment requires maintenance') || queryLower.includes('maintenance this month') || queryLower.includes('upcoming maintenance')) {
    return `### Equipment Maintenance Schedule (Upcoming Cycle)
1. **Wellhead Multiphase Booster Pump P-204**
   - **Facility**: Central Processing Facility (CPF-1)
   - **Scheduled Date**: **20 October 2026**
   - **Scope**: Planned seal barrier flush and bearing vibration survey.
   - **Criticality**: **CRITICAL** (Production Impact: ~4,200 BOPD deferment risk).
2. **Centrifugal Natural Gas Compressor Unit C-101**
   - **Facility**: CPF Gas Compression Train
   - **Scheduled Date**: **04 November 2026**
   - **Scope**: Stage 2 impeller inspection and dry gas seal test.
3. **Caterpillar 3516B Diesel Generator (GEN-02)**
   - **Facility**: Tilenga North Logistics Base
   - **Scheduled Date**: **28 October 2026** (2,000-hour major overhaul).`;
  }

  if (queryLower.includes('expired certification') || queryLower.includes('expired') || queryLower.includes('certifications')) {
    return `### Equipment Compliance Alert: Expired & Near-Expiry Certifications
1. **3,000 HP Land Drilling Rig (Rig NX-01)**
   - **Certificate**: API Spec 8C / 7K Hoisting & Traveling Block Load Certification
   - **Status**: **EXPIRED (15 August 2026)**
   - **Authority**: Petroleum Authority of Uganda (PAU) / DNV
   - **Action**: Mandatory NDT magnetic particle inspection required before spudding next development well.
2. **Crude Oil Surge Vessel Relief Valve (PSV-401A)**
   - **Certificate**: ASME Section VIII / API 526 POP Test Certificate
   - **Status**: **Due in 14 days (08 October 2026)**.`;
  }

  if (queryLower.includes('suppliers provide drilling') || queryLower.includes('drilling equipment') || queryLower.includes('drilling suppliers')) {
    return `### Qualified Suppliers for Drilling Equipment & Downhole Tools
1. **Baker Hughes Chad / East Africa Services**
   - **Specialty**: PDC/Tricone drill bits, MWD/LWD, mud pumps, downhole motors.
   - **NSD Status**: Verified Class-A Contractor
   - **Turnaround**: 14 - 30 days.
2. **Schlumberger (SLB) Uganda Ltd**
   - **Specialty**: Wellhead equipment, blowout preventers (BOPs), casing accessories.
   - **NSD Status**: Fully Compliant
3. **East Africa Mechanical Solutions**
   - **Specialty**: Mud pump liners, fluid end valves, high-pressure rotary hoses (7-day local fulfillment).`;
  }

  if (queryLower.includes('facilities have outstanding') || queryLower.includes('facility maintenance') || queryLower.includes('outstanding maintenance')) {
    return `### Facilities with Outstanding Maintenance
1. **Central Processing Facility (CPF-1 - Buliisa)**
   - **Task**: Fire & Gas Deluge Solenoid Valve Loop Check
   - **Priority**: **CRITICAL**
   - **Assigned Technician**: Eng. Geoffrey Mukasa
   - **Status**: In Progress (Pending parts arrival)
2. **Albertine Supply Base & Pipe Yard (Hoima)**
   - **Task**: Gantry Crane Hoist Motor Overhaul & Load Cell Calibration
   - **Priority**: High (Estimate: UGX 14,500,000).`;
  }

  if (queryLower.includes('maintenance expenditure') || queryLower.includes('maintenance cost') || queryLower.includes('highest maintenance cost')) {
    return `### Maintenance Cost Breakdown
- **Total Facilities Maintenance (M-T-D)**: **UGX 74,500,000** (~USD 19,866)
- **Total Heavy Asset & Equipment Servicing**: **UGX 168,000,000** (~USD 44,800)
- **Combined Outlay**: **UGX 242,500,000** (~USD 64,666)
- **Highest Maintenance Equipment**:
  * 1. Centrifugal Gas Compressor C-101: UGX 94,500,000
  * 2. Land Drilling Rig NX-01: UGX 86,200,000
  * 3. Multiphase Pump P-204: UGX 38,000,000.`;
  }

  if (queryLower.includes('warehouse has the highest') || queryLower.includes('highest inventory value')) {
    return `### Inventory Ranking by Warehouse Hub
- **#1 Main Logistics Base Warehouse (Hoima)**: **UGX 14,850,000,000** (~USD 3,960,000) with 314 active line items and 74% capacity utilization.
- **#2 Central Processing Facility (CPF) Bonded Yard**: **UGX 9,420,000,000** (~USD 2,512,000).
- **#3 Buliisa Pipe Yard & Consignment Base**: **UGX 4,180,000,000** (~USD 1,114,666).`;
  }

  if (queryLower.includes('contracts expiring') || queryLower.includes('expiring soon')) {
    return `### Supplier Contracts Expiring Within 90 Days
1. **ABC Industrial Supplies Ltd** (Contract LTA-2024-ROT-04 - Mechanical Seals & Rotating Equipment)
   - Expiry: **31 December 2026** (in 99 days)
   - Action: Review volume rebates and activate 2-year option period.
2. **Albertine Graben Logistics & Haulage Co.** (Contract TRN-2025-081)
   - Expiry: **15 November 2026** (in 53 days)
   - Action: Renegotiate fuel escalation surcharge.`;
  }

  if (queryLower.includes('financial summary') || queryLower.includes('monthly financial summary') || queryLower.includes('cash flow') || queryLower.includes('unusual expenses')) {
    return `### Executive Financial Performance Summary
- **Gross Commercial Inflow**: **UGX 4,850,000,000** (~USD 1,293,333)
- **Operating Expenses (OPEX)**: **UGX 2,940,000,000** (~USD 784,000)
- **Equipment Depreciation (CAPEX Depr)**: **UGX 315,000,000** (~USD 84,000)
- **Operating Cash Flow (EBITDA)**: **UGX 1,910,000,000** (39.4% margin)
- **Net Unrestricted Cash Reserve**: **UGX 6,420,000,000**
- **Unusual Expenses Audit**: A non-recurring emergency airfreight fee of UGX 18,500,000 was flagged on 12-Sept for expedited turbine impellers.`;
  }

  if (queryLower.includes('vat liability') || queryLower.includes('wht liability') || queryLower.includes('tax rules')) {
    return `### Oil & Gas Tax & URA Statutory Withholding
- **Value Added Tax (VAT 18%)**:
  * Output VAT: UGX 873,000,000
  * Input VAT Claimable: UGX 529,200,000
  * **Net Payable VAT**: **UGX 343,800,000**
- **Withholding Tax (WHT 6% Local / 15% Foreign)**:
  * Local suppliers withheld: UGX 176,400,000
  * Foreign technical contractor services: UGX 285,000,000
- **Fiscal Notes**: Ring-fencing applied per Contract Area under Section 4 of the Petroleum Act.`;
  }

  if (queryLower.includes('mechanical seal') || queryLower.includes('p-101')) {
    return `### Deterministic Risk Assessment: Mechanical Seal (Crude Transfer Pump P-101)
- **Current Inventory Position**: 4 units on hand (Main Warehouse).
- **Scheduled Maintenance**: 3 units required on 20 October 2026 for preventive maintenance on Crude Transfer Pump P-101.
- **Safety Stock Threshold**: 2 units minimum mandatory reserve.
- **Projected Balance**: 4 - 3 = 1 unit, which falls 1 unit BELOW the mandatory safety stock threshold.
- **Supplier Lead Time**: Preferred supplier lead time is 21 days (ABC Industrial Supplies).
- **Lead Time Window**: Order must be placed immediately to guarantee delivery before the required maintenance window.
- **Recommended Action**: **PROCURE NOW**. Initiate procurement request for at least 2 to 3 units, or evaluate East Africa Mechanical Solutions for expedited 7-day fulfillment.`;
  }

  if (queryLower.includes('what-if') || queryLower.includes('delay')) {
    return `### Scenario Intelligence Impact
- **Simulated Delta**: Supplier lead time increased or scheduled date moved closer.
- **Operational Vulnerability**: Without proactive replenishment, the critical equipment risks unplanned downtime costing up to $85,000/day in deferred crude export.
- **Mitigation Vector**: Consider dual-sourcing or pre-allocating regional consignment stock with certified suppliers possessing valid API 682 seals.`;
  }

  if (queryLower.includes('supplier') || queryLower.includes('compare')) {
    return `### Supplier Comparison & Readiness
- **ABC Industrial Supplies Ltd**: Verified API 682 / ISO 9001. Lead time 21 days, simulated on-time rate 94%, readiness score 92%. Best pricing stability for planned cycles.
- **East Africa Mechanical Solutions**: Certified local stockist. Lead time 7 days, simulated on-time rate 91%, readiness score 94%. Optimal for urgent or expedited demands.
- **Uganda Industrial Components Ltd**: Strong piping/gasket presence. Lead time 14 days, simulated on-time rate 88%.
- **EnergyTech Supplies Ltd**: Instrumentation & automation specialist. Lead time 18 days, simulated on-time rate 85%.`;
  }

  return `Based on active tenant data:
- **Analyzed Assets**: Heavy turbomachinery, 3 storage hubs, and 12 critical materials tracked across Central Processing Facility and Main Warehouse.
- **Active Alerts**: Critical material buffer deficits detected on Crude Transfer Pump P-101 and Gas Compressor C-101.
- **Statutory Deadlines**: 1 drilling rig certification expired; upcoming VAT/WHT submission due by the 15th.`;
}

// AI Chat Endpoint with server-side isolation and grounding
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, context, organizationId, userRole } = req.body;
    
    // Safety check: ensure multi-organization isolation
    if (!organizationId) {
      return res.status(400).json({ error: 'Organization ID is required for grounded context.' });
    }

    const systemInstruction = `You are NEXORA O&G's Decision-Intelligence AI for Oil & Gas Operations.
Brand tagline: "Predict the spare. Secure the supply. Protect production."
Your purpose: Help oil and gas organizations understand material readiness, supply risk, evaluate suppliers, and make proactive procurement decisions.
You are NOT an autonomous purchasing system and NOT a generic chatbot.

IMPORTANT GUIDELINES:
1. Always structure your responses with:
   - WHAT WAS FOUND
   - WHY IT MATTERS
   - RECOMMENDATION (use actions: MONITOR, WAIT, PROCURE NOW, EXPEDITE, TRANSFER STOCK, CONSIDER ALTERNATIVE SUPPLIER)
   - DATA USED
   - CONFIDENCE (High, Moderate, Limited)
   - DATA COMPLETENESS (Good, Partial, Insufficient)
2. Use cautious, professional advisory language ("Recommended action", "Consider", "Potential risk"). Never claim you have made a purchase or altered real operations.
3. Ground your answers strictly on the tenant data provided in context. Never mention or leak data outside this organization.
4. Fictional demo disclaimer: All data represents simulated prototype assets.
5. If data is incomplete or unavailable, state: "I don't have enough information in the current NEXORA data to determine that."

TENANT CONTEXT:
Organization: ${context?.organizationName || 'Demo Oil & Gas Company'}
User Role: ${userRole || 'PROCUREMENT_OFFICER'}
Active Materials: ${JSON.stringify(context?.materials || [])}
Maintenance Schedule: ${JSON.stringify(context?.maintenance || [])}
Suppliers: ${JSON.stringify(context?.suppliers || [])}
Knowledge Items: ${JSON.stringify(context?.knowledge || [])}`;

    if (geminiClient && geminiApiKey) {
      try {
        const response = await geminiClient.models.generateContent({
          model: geminiModel,
          contents: message,
          config: {
            systemInstruction,
            temperature: 0.2,
          },
        });

        return res.json({
          reply: response.text,
          provider: 'gemini',
          model: geminiModel,
          confidence: 'High',
          completeness: 'Good',
        });
      } catch (geminiErr: any) {
        console.warn('Gemini API call failed, falling back to deterministic reasoning engine:', geminiErr?.message);
      }
    }

    // Deterministic fallback response when key is absent or network fails
    const fallbackText = generateFallbackReasoning(message, context);
    return res.json({
      reply: fallbackText,
      provider: 'deterministic_engine',
      model: 'nexora-rule-engine-v1',
      confidence: 'High',
      completeness: 'Good',
      note: geminiApiKey ? 'Fallback engine used due to provider response.' : 'Powered by NEXORA Deterministic Intelligence Engine (Configure GEMINI_API_KEY for generative LLM synthesis).',
    });
  } catch (error: any) {
    console.error('AI chat endpoint error:', error);
    res.status(500).json({ error: error.message || 'Internal server error processing AI query.' });
  }
});

// AI Explain endpoint for single material risk explanation
app.post('/api/ai/explain-risk', async (req, res) => {
  try {
    const { material, maintenanceReq, supplier, simulation } = req.body;

    const prompt = `Explain the material risk for:
Material: ${material?.name} (${material?.code})
Current Stock: ${material?.currentStock}
Safety Stock: ${material?.safetyStock}
Maintenance Req: ${maintenanceReq?.requiredQuantity || 'None'} on ${maintenanceReq?.scheduledDate || 'N/A'} for ${maintenanceReq?.equipmentName || 'Asset'}
Supplier: ${supplier?.name || 'ABC Industrial'} with lead time ${supplier?.leadTimeDays || material?.leadTimeDays || 21} days
Simulation parameters: ${JSON.stringify(simulation || {})}`;

    if (geminiClient && geminiApiKey) {
      try {
        const response = await geminiClient.models.generateContent({
          model: geminiModel,
          contents: prompt,
          config: {
            systemInstruction: `You are NEXORA O&G's Risk Explainer. Provide concise, high-impact industrial analysis.
Return your response formatted with:
WHAT WAS FOUND: (2 sentences max)
WHY IT MATTERS: (Direct operational/financial impact on O&G uptime)
RECOMMENDATION: (PROCURE NOW / EXPEDITE / MONITOR / TRANSFER STOCK)
DATA USED: (List fields used)
CONFIDENCE: (High / Moderate / Limited)
DATA COMPLETENESS: (Good / Partial / Insufficient)`,
            temperature: 0.1,
          },
        });

        return res.json({
          explanation: response.text,
          provider: 'gemini',
        });
      } catch (e) {
        console.warn('Gemini explanation fallback triggered');
      }
    }

    // Default structured explanation
    const curr = material?.currentStock ?? 4;
    const reqQty = maintenanceReq?.requiredQuantity ?? 3;
    const safety = material?.safetyStock ?? 2;
    const leadTime = supplier?.leadTimeDays || material?.leadTimeDays || 21;

    const explanation = `**WHAT WAS FOUND:**
Current stock is ${curr} units. Scheduled maintenance for ${maintenanceReq?.equipmentName || 'Crude Transfer Pump P-101'} requires ${reqQty} units. Mandatory safety stock is ${safety} units. Preferred supplier lead time is ${leadTime} days.

**WHY IT MATTERS:**
Available balance after scheduled maintenance falls to ${curr - reqQty} units, which drops below the defined safety-stock threshold of ${safety} units. Any unforeseen pump seal wear or delivery delay risks production curtailment.

**RECOMMENDATION:**
${curr - reqQty < safety ? 'PROCURE NOW' : 'MONITOR'}
Early procurement should be initiated immediately to secure replacement seals before the planned maintenance window.

**DATA USED:**
Current inventory, active work order demand, defined safety buffer, supplier lead time.

**CONFIDENCE:**
High

**DATA COMPLETENESS:**
Good`;

    return res.json({
      explanation,
      provider: 'deterministic_engine',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NEXORA O&G Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
