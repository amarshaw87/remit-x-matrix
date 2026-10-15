# 📟 Remit-X-Matrix Engine

An enterprise-grade, client-side **EDI 835 Electronic Remittance Advice sandbox decoder** built with Vue 3, TypeScript, and Plain CSS [INDEX]. This high-velocity data parsing system is engineered to handle legacy **5010** and future **008060** claims data streams in a premium obsidian dark mode workstation layout [INDEX].

---

### 💡 The Operational Logic & System Design (The "Why")
In the US Healthcare Revenue Cycle Management (RCM) pipeline, when an insurance carrier (Payer) issues payments or denials, they transmit an official digital receipt called an **EDI 835** or **Electronic Remittance Advice (ERA)** [INDEX].

These files arrive in dense, highly formatted, legacy X12 text blocks. Frontline billing specialists and modern development teams are routinely forced to manually cross-reference these strings against thick payer companion guides to understand why a claim was adjusted or denied [INDEX].

**Remit-X-Matrix** serves as an interactive sandbox terminal that instantly decodes unstructured insurance remittance data paths [INDEX]. It translates cryptic HIPAA reason codes into clear, plain English and maps out complex operational metrics on the fly—greatly reducing data entry anxiety and onboarding friction for back-office teams [INDEX].

---

### 🎯 Core Features & System Blueprint
*   **Dynamic Delimiter Ingestion:** The engine automatically reads the structural pattern of the input text, adapting to Asterisks (`*`), Pipes (`|`), or Carets (`^`) instantly without manual setup tweaks [INDEX].
*   **Dual-Version Validation Framework:** Seamlessly evaluates classic 9-element 5010 string matrices while providing native forward compatibility for 11-element 008060 formats, extracting trailing Electronic Visit Verification (EVV) data streams [INDEX].
*   **Sequential Multi-Claim Batch Parsing:** Upgraded to natively process multiple sequential `CLP` segment blocks within a single file run, stacking individual detail reports concurrently on canvas without structural data collisions or overrides [INDEX].
*   **Universal Real-Time Reconciliation Guard:** Features a mathematical audit loop (` Billed = Paid + PR + Non-PR Adjustments`) that checks ledger accuracy to the penny [INDEX]. It instantly triggers a high-visibility **Red Conformance Discrepancy Banner** for micro-rounding errors or missing baseline parameters [INDEX].
*   **Negative Adjustment & Incentive Safe:** Built with customized sanitization regular expressions (`/[^0-9.-]/g`) that safely preserve negative symbols, enabling accurate ledger mapping of downward carrier modifications, prompt-pay bonuses, or late-interest additions.
*   **Privacy-First Memory Handshake:** Built entirely client-side [INDEX]. The application operates strictly within transient browser memory—implementing zero logging footprints and zero database retention to remain inherently **HIPAA-secure** [INDEX]. Clicking the reset tool flushes all parameters back to zero instantly [INDEX].
*   **The Smart Billing Directive:** The UI reads incoming adjustment group parameters to automatically compute enterprise compliance rules across three distinct risk thresholds [INDEX]:
    *   🔴 **Group PI (Payer Initiated Reduction):** High-velocity warning flags alert the specialist to internal pre-certification failures [INDEX]. Legally blocks patient statement indexing, automatically routing the claim to the Prior-Authorization Appeal lane [INDEX].
    *   🔵 **Group PR (Patient Responsibility):** Verifies explicit individual fiscal liability, safely prompting automated itemized patient balance billing statements and collection cycles [INDEX].
    *   🟡 **Group CO (Contractual Obligation):** Restricts the hospital from balance-billing the client based on pre-negotiated provider network fee schedules, instructing immediate ledger write-offs [INDEX].

---

### 🧪 Live Operational Case Testing Sandbox
To run live sanity tests inside your gateway workspace console, paste these standardized, balanced healthcare compliance data tracks:

#### Case A: Multi-Claim Batch Processing (Tests sequential array allocation)
```text
CLP*CLAIM-BATCH-A*1*100.00*80.00*20.00*12*111222333~
CAS*PR*1*20.00~
CLP*CLAIM-BATCH-B*1*500.00*400.00*100.00*12*444555666~
CAS*PR*1*100.00~
```

#### Case B: Late-Payment Payer Interest Addition (Tests negative incentive handling)
```text
CLP*CLMINTEREST*1*100.00*105.00*0.00*12*555666777~
CAS*CO*225*-5.00~
```

#### Case C: 100% Payer Denial (Tests Administrative Appeal Lane Routing)
```text
CLP*CLMDENIED*1*500.00*0.00*0.00*12*999888777~
CAS*PI*197*500.00~
```

---

### 🛠️ Project Directory Topology
```text
├── package.json         # Node metadata, deployment script overrides, and dependencies
├── tsconfig.json        # TypeScript strict rules and JSON module resolution
├── vite.config.ts       # Vite build configurations and path alias mappings
└── src/
    ├── assets/
    │   └── carcDictionary.json  # Master lookup database containing active HIPAA reason codes
    ├── utils/
    │   └── ediParserCore.ts     # Pure TypeScript algorithmic split and array parsing engine
    ├── App.vue                  # Parent frame orchestrating obsidian styling & reactive loops
    └── main.ts                  # Vue 3 system bootstrap entry point
```

---

### ⚙️ Visual Design: The Obsidian Shift
This workspace implements a dedicated **Left-Aligned Terminal Design layout** to give it a distinct visual brand compared to standard data frameworks [INDEX].

*   **Canvas Dark Background:** `#030712` (Deep obsidian canvas frame) [INDEX].
*   **Module Framework Blocks:** `#0f172a` (Sleek slate blocks creating a layered component elevation) [INDEX].
*   **High-Visibility Anchors:** Electric neon cyan, blue, and crimson indicators providing a bright focal track on deep background surfaces [INDEX].

---

### 🚀 Execution & Local Deployment Commands
To run this engine locally:

```bash
# 1. Install workspace dependencies
npm install

# 2. Start the Vite local reactive environment server
npm run dev

# 3. Assemble and optimize the codebase into production static assets
npm run build
```

---

### ⚖️ License
Distributed under the MIT License. See `LICENSE` for more information.

---

### 👨‍💻 Designed & Developed by
**Amar Shaw**
*Prior Authorization & RCM Specialist • Full-Stack Software Developer*

*Transforming US Healthcare Operational Friction into High-Velocity Web Automation.*
