# 📟 Remit-X-Matrix Engine

An enterprise-grade, client-side EDI 835 Electronic Remittance Advice sandbox decoder built with **Vue 3, TypeScript, and Plain CSS**. This high-velocity data parsing system is engineered to handle legacy **5010** and future **008060** claims data streams in a premium obsidian dark mode workstation layout.

---

## 💡 The Operational Logic & System Design (The "Why")

In the US Healthcare Revenue Cycle Management (RCM) pipeline, when an insurance carrier (Payer) issues payments or denials, they transmit an official digital receipt called an **EDI 835** or **Electronic Remittance Advice (ERA)**. 

These files arrive in highly encrypted, dense, and legacy X12 text blocks. Frontline billing specialists and freshers are routinely forced to manually cross-reference these strings against thick payer companion guides to understand why a claim was adjusted or denied. 

**Remit-X-Matrix** serves as an interactive sandbox terminal that instantly decodes unstructured insurance remittance data paths. It translates cryptic HIPAA reason codes into clear, plain English and maps out operational metrics on the fly—greatly reducing data entry anxiety and onboarding friction for back-office teams.

---

## 🎯 Core Features & System Blueprint

* **Dynamic Delimiter Ingestion:** The engine automatically reads the structural pattern of the input text, adapting to **Asterisks (`*`)**, **Pipes (`|`)**, or **Carets (`^`)** instantly without manual setup tweaks.
* **Dual-Version Validation Framework:** Seamlessly evaluates classic 9-element **5010** string matrices while providing native forward compatibility for 11-element **008060** formats, extracting trailing Electronic Visit Verification (EVV) data streams.
* **Privacy-First Memory Handshake:** Built entirely client-side. The application operates strictly within transient browser memory—implementing zero logging footprints and zero database retention. Clicking the reset tool flushes all parameters back to zero instantly.
* **The Smart Billing Directive:** The UI reads the incoming adjustment group parameters to automatically generate clear operational rules:
  * 🛑 **Group CO (Contractual Obligation):** Warns the agent that the hospital cannot bill the patient, routing the account to the Appeal queue.
  * 🟠 **Group PR (Patient Responsibility):** Alerts the agent that the balance has shifted to the individual, prompting a patient statement print run.

---

## 🛠️ Project Directory Topology

```text
src/
├── assets/
│   └── carcDictionary.json    # Master lookup listing containing active HIPAA reason codes
├── utils/
│   └── ediParserCore.ts       # Pure TypeScript algorithmic split and parsing engine
├── App.vue                    # Parent frame orchestrating obsidian styling & reactive state
└── main.ts                    # Vue 3 system bootstrap entry point
```

---

## ⚙️ Visual Design: The Obsidian Shift

This workspace implements a dedicated **Left-Aligned Terminal Design** layout to give it a distinct visual brand compared to the center-aligned layout of the Prior Auth engine project.
* **Canvas Dark Background:** `#030712` (Deep obsidian canvas frame).
* **Module Framework Blocks:** `#0f172a` (Sleek slate blocks creating a layered component elevation).
* **High-Visibility Anchors:** Electric neon cyan/blue indicators providing a bright focal track on deep background surfaces.

---

## 🚀 Execution & Local Deployment Commands

To run this engine locally:

```bash
# 1. Install dependencies
npm install

# 2. Start the Vite development server
npm run dev
```

---

## ⚖️ License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 👨‍💻 Designed & Developed by

**Amar Shaw**  
*Prior Authorization & RCM Specialist • Full-Stack Software Developer*  

Transforming US Healthcare Operational Friction into High-Velocity Web Automation.
