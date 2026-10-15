<template>
  <div class="dark-workspace">
    <!-- MASTER BRANDING IDENTITY HEADER (STRICT LEFT-ALIGN) -->
    <header class="branding-header">
      <div class="badge-row">
        <span class="enterprise-badge">
          <span class="pulse-dot"></span>
          ENTERPRISE RCM PIPELINE v1.0
        </span>
      </div>
      
      <h1 class="project-title">📟 REMIT-X-MATRIX ENGINE</h1>
      
      <div class="developer-profile">
        <p class="dev-name">
          Designed by <span class="text-glow">Amar Shaw</span> • Blending US Healthcare Operational Logic with Full-Stack Automation
        </p>
        <p class="dev-role">Prior Authorization & RCM Specialist • Full-Stack Software Developer</p>
      </div>
      <p class="tagline">Enterprise-Grade Client-Side 5010 / 008060 Dynamic Reverse Engineering Gateway</p>
    </header>

    <!-- INGESTION CONSOLE BOX CONTROL PANEL -->
    <section class="console-box">
      <label class="console-label">Ingest Raw EDI 835 Remittance Stream Data:</label>
      <textarea 
        v-model="rawEdi" 
        class="console-input"
        placeholder="Paste raw text string here... (e.g. CLP*CLM-5045*1*2450.00*1850.00*150.00*12*1122334455*1*Y*20261001~)"
      ></textarea>
      
      <div class="action-row">
        <button @click="handleDecode" class="btn btn-primary">Decode & Analyze Parameters →</button>
        <button @click="handleReset" class="btn btn-secondary">Reset System Panel 🔄</button>
      </div>
    </section>

    <!-- REPORT WORKSTATION CANVAS DISPLAY -->
    <article v-if="report" class="manifest-card">
      <div class="report-header">
        <h2>📑 REMITTANCE ADVICE DETAIL REPORT</h2>
        <span class="spec-indicator">{{ report.version }}</span>
      </div>

      <!-- SECTION A: METADATA IDENTITY MAP -->
      <div class="section-block">
        <h3 class="section-title">🔹 CLAIM IDENTIFICATION</h3>
        <ul class="meta-list">
          <li><strong>Patient Account / Claim ID:</strong> <span class="highlight">{{ report.claimId }}</span></li>
          <li><strong>Payer Claim Control Number (ICN):</strong> <span>{{ report.icn }}</span></li>
          <li><strong>Claim Status Indicator:</strong> <span>{{ report.claimStatus }}</span></li>
          <li><strong>Filing Plan Indicator:</strong> <span>{{ report.filingIndicator }}</span></li>
          <li><strong>Adjudication Process Date:</strong> <span>{{ report.adjudicationDate }}</span></li>
          <li v-if="report.evvStatus"><strong>EVV Compliance Matrix:</strong> <span class="neon-cyan">{{ report.evvStatus }}</span></li>
        </ul>
      </div>

      <!-- DATA INTEGRITY ERROR BANNER PROACTIVE CHECK -->
      <div v-if="!validationStatus.isValid" class="validation-error-banner">
        <span class="validation-error-title">⚠️ REMIT-X CONFORMANCE DISCREPANCY</span>
        <p class="validation-error-desc">
          {{ validationStatus.errorMessage }}
        </p>
      </div>

      <!-- SECTION B: FINANCIAL ACCOUNTING GRID -->
      <div class="section-block">
        <h3 class="section-title">🔹 FINANCIAL SUMMARY</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Financial Ledger Category</th>
              <th>Calculated Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Total Submitted Institutional Charges</td>
              <td class="amt-neutral">${{ report.totalCharges }}</td>
            </tr>
            <tr>
              <td>Contractual Allowed Amount</td>
              <td class="amt-neutral">${{ report.allowedAmount }}</td>
            </tr>
            <tr>
              <td>Provider Remitted Paid Amount</td>
              <td class="amt-paid">${{ report.paidAmount }}</td>
            </tr>
            <tr>
              <td>Residual Patient Responsibility Liability</td>
              <td class="amt-patient">${{ report.patientResponsibility }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- SECTION C: TRANS-ADJUDICATION CODES CHECK -->
      <div class="section-block">
        <h3 class="section-title">🔹 ADJUDICATION & ADJUSTMENT DETAILS</h3>
        <table class="data-table">
          <thead>
            <tr>
              <th>Group</th>
              <th>CARC</th>
              <th>Plain English Diagnostic Translation</th>
              <th>Adjustment Impact</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(adj, index) in report.adjustments" :key="index">
              <td><strong>{{ adj.group }}</strong></td>
              <td><span class="code-tag">{{ adj.code }}</span></td>
              <td class="desc-text">{{ adj.description }}</td>
              <td class="amt-risk">{{ parseFloat(adj.amount) < 0 ? `-$${Math.abs(parseFloat(adj.amount)).toFixed(2)}` : `$${adj.amount}` }}</td>
            </tr>
          </tbody>
        </table>

        <!-- REVENUE LOGIC DIRECTIVE NOTICE ALERT WORKFLOW -->
        <div v-if="report.adjustments.length > 0" class="directive-box" :class="directiveClass">
          <p v-if="triageResult === 'PI_DENIAL'">
            ⚠️ <strong>Administrative Rejection Rule Triggered:</strong> The presence of a Payer Initiated Reduction (PI) indicator confirms an internal pre-certification failure. <strong>DO NOT invoice the patient statement ledger.</strong> Route this file immediately to your internal clinical coordination or retro-authorization lane for immediate provider appeal.
          </p>
          <p v-else-if="triageResult === 'PR_LIABILITY'">
            💵 <strong>Patient Fiscal Transfer Verified:</strong> The Patient Responsibility (PR) parameters indicate the payer has legally transferred transactional liability to the individual. You may safely generate itemized patient balance billing statements and dispatch to collection tracking paths.
          </p>
          <p v-else>
            💡 <strong>Contractual Adjustment Profile:</strong> The Contractual Obligation (CO) group code means the provider is contractually restricted from billing the individual for this variance. Adjust accounts receivable parameters to record this balance as a contractual write-off discount.
          </p>
        </div>
      </div>

      <!-- SECTION D: SPATIAL DATA -->
      <div class="section-block">
        <h3 class="section-title">🔹 ENTITY LOCATION PROFILE</h3>
        <p class="geo-text">
          • <strong>Clearinghouse Dispatch Point Address:</strong> {{ formattedAddress }}
        </p>
      </div>
    </article>
  </div>
</template>
<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import carcDictionaryData from './assets/carcDictionary.json';
import { parseEdi835String, ParsedReport } from './utils/ediParserCore';

// Strongly-typed system validation structures
interface ClaimValidation {
  isValid: boolean;
  variance: number;
  errorMessage: string;
}

export default defineComponent({
  name: 'App',
  setup() {
    const rawEdi = ref<string>('');
    const report = ref<ParsedReport | null>(null);
    const dictionary = ref<Record<string, string>>(carcDictionaryData);

    const handleDecode = () => {
      report.value = parseEdi835String(rawEdi.value, dictionary.value);
    };

    const handleReset = () => {
      rawEdi.value = '';
      report.value = null;
    };
    // Real-time financial variance verification loop
    const validationStatus = computed<ClaimValidation>(() => {
      if (!report.value) return { isValid: true, variance: 0, errorMessage: '' };
      
      const submitted = parseFloat(report.value.totalCharges?.toString().replace(/[^0-9.]/g, '')) || 0;
      const paid = parseFloat(report.value.paidAmount?.toString().replace(/[^0-9.]/g, '')) || 0;
      const patient = parseFloat(report.value.patientResponsibility?.toString().replace(/[^0-9.]/g, '')) || 0;
      
      const adjustmentsSum = report.value.adjustments?.reduce((sum, adj) => {
        return sum + (parseFloat(adj.amount?.toString().replace(/[^0-9.]/g, '')) || 0);
      }, 0) || 0;

      const expectedTotal = paid + patient + adjustmentsSum;
      const variance = submitted - expectedTotal;

      if (Math.abs(variance) > 0.01) {
        return {
          isValid: false,
          variance: variance,
          errorMessage: `Financial Ledger Balancing Variance Flagged: Unexplained discrepancy of $${variance.toFixed(2)} discovered. Total accounted variables ($${paid.toFixed(2)} paid + $${patient.toFixed(2)} liability) fail to reconcile against the total submitted value ($${submitted.toFixed(2)}).`
        };
      }
      return { isValid: true, variance: 0, errorMessage: '' };
    });
    // Advanced dynamic triage router evaluation loop
    const triageResult = computed(() => {
      if (!report.value || report.value.adjustments.length === 0) return 'CO_WRITE_OFF';
      const adjustments = report.value.adjustments;
      
      const hasPiRejection = adjustments.some(adj => adj.group.includes('PI') || adj.group.startsWith('PI'));
      if (hasPiRejection) return 'PI_DENIAL';
      
      const hasPrLiability = adjustments.some(adj => adj.group.includes('PR') || adj.group.startsWith('PR'));
      if (hasPrLiability) return 'PR_LIABILITY';
      
      return 'CO_WRITE_OFF';
    });

    const directiveClass = computed(() => {
      const type = triageResult.value;
      if (type === 'PI_DENIAL') return 'directive-pi';
      if (type === 'PR_LIABILITY') return 'directive-pr';
      return 'directive-co';
    });

    // Fixed string formatting logic resolving the missing comma spacing constraint
    const formattedAddress = computed(() => {
      if (!report.value) return 'Not Provided in EDI Stream';
      const { city, stateCode, zipCode, country } = report.value;
      if (!city && !stateCode && !zipCode) return 'Not Provided in EDI Stream';
      
      const cleanCity = city?.trim() || 'N/A';
      const cleanState = stateCode?.trim() || 'N/A';
      const cleanZip = zipCode?.trim() || 'N/A';
      const cleanCountry = country?.trim() || 'US';

      return `${cleanCity}, ${cleanState}, ${cleanZip} (${cleanCountry})`;
    });

    return {
      rawEdi,
      report,
      handleDecode,
      handleReset,
      validationStatus,
      triageResult,
      directiveClass,
      formattedAddress
    };
  }
});
</script>
<style scoped>
/* OBSIDIAN PITCH BLACK STYLES FOR WORKSTATION SURFACE */
.dark-workspace {
  background-color: #030712;
  color: #f3f4f6;
  min-height: 100vh;
  padding: 40px 20px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  box-sizing: border-box;
}

.branding-header {
  text-align: left;
  max-width: 850px;
  margin: 0 auto 35px auto;
}

.badge-row {
  display: flex;
  justify-content: flex-start;
  margin-bottom: 16px;
}

.enterprise-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background-color: #0f172a;
  border: 1px solid #1e3a8a;
  border-radius: 9999px;
  padding: 6px 16px;
  font-family: "Courier New", Courier, monospace;
  font-size: 11px;
  font-weight: bold;
  color: #60a5fa;
  letter-spacing: 1px;
  box-shadow: 0 0 15px rgba(30, 58, 138, 0.4);
}

.pulse-dot {
  width: 7px;
  height: 7px;
  background-color: #3b82f6;
  border-radius: 50%;
  box-shadow: 0 0 8px #3b82f6;
}

.project-title {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 800;
  color: #ffffff;
  letter-spacing: -0.5px;
}

.developer-profile { line-height: 1.6; }
.dev-name { margin: 0; font-size: 14.5px; color: #9ca3af; }
.text-glow { color: #ffffff; font-weight: 600; }
.dev-role { margin: 4px 0 0 0; font-size: 12.5px; color: #4b5563; }
.tagline { margin: 12px 0 0 0; font-size: 13px; color: #374151; }

.console-box {
  background-color: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 8px;
  padding: 20px;
  max-width: 850px;
  margin: 0 auto 30px auto;
  text-align: left;
}

.console-label { display: block; font-weight: bold; font-size: 14px; margin-bottom: 10px; color: #cbd5e1; }

.console-input {
  width: 100%;
  min-height: 110px;
  background-color: #020617;
  color: #38bdf8;
  border: 1px solid #334155;
  border-radius: 6px;
  padding: 12px;
  font-family: "Courier New", Courier, monospace;
  font-size: 13.5px;
  box-sizing: border-box;
  resize: vertical;
}

.action-row { display: flex; gap: 15px; margin-top: 15px; }

.btn {
  padding: 10px 22px;
  font-weight: bold;
  font-size: 13.5px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.btn-primary { background-color: #0284c7; color: #ffffff; }
.btn-primary:hover { background-color: #0369a1; }
.btn-secondary { background-color: #334155; color: #cbd5e1; }
.btn-secondary:hover { background-color: #475569; }

.manifest-card {
  background-color: #0f172a;
  border: 2px solid #0284c7;
  border-radius: 8px;
  padding: 25px;
  max-width: 850px;
  margin: 0 auto;
  text-align: left;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #1e293b;
  padding-bottom: 12px;
  margin-bottom: 20px;
}

.report-header h2 { margin: 0; font-size: 18px; color: #38bdf8; }
.spec-indicator { font-size: 12px; font-weight: bold; background-color: #0369a1; color: #ffffff; padding: 4px 10px; border-radius: 20px; }
.section-block { margin-bottom: 25px; }
.section-title { color: #0284c7; font-size: 14px; margin: 0 0 10px 0; letter-spacing: 0.5px; }

.meta-list { list-style-type: none; padding: 0; margin: 0; line-height: 1.8; font-size: 14px; }
.meta-list li { color: #cbd5e1; border-bottom: 1px dashed #1e293b; padding: 6px 0; }
.highlight { color: #f8fafc; font-weight: bold; }
.neon-cyan { color: #22d3ee; font-weight: bold; }

/* ERROR COMPLIANCE RECONCILIATION STYLE PACK */
.validation-error-banner {
  background-color: rgba(239, 68, 68, 0.12); 
  border-left: 4px solid #ef4444; 
  padding: 15px; 
  margin-bottom: 25px; 
  border-radius: 4px;
}
.validation-error-title {
  color: #f87171; 
  font-weight: bold; 
  display: block; 
  margin-bottom: 5px; 
  font-size: 14px;
  letter-spacing: 0.3px;
}
.validation-error-desc {
  color: #fca5a5; 
  margin: 0; 
  font-size: 13.5px; 
  line-height: 1.5;
}

.data-table { width: 100%; border-collapse: collapse; font-size: 13.5px; margin-top: 5px; }
.data-table th { background-color: #1e293b; color: #94a3b8; text-align: left; padding: 10px; border: 1px solid #334155; }
.data-table td { padding: 10px; border: 1px solid #1e293b; color: #cbd5e1; }
.data-table tbody tr:hover { background-color: #1e3a8a; }

.amt-neutral { font-weight: bold; color: #f1f5f9; }
.amt-paid { font-weight: bold; color: #4ade80; }
.amt-patient { font-weight: bold; color: #f97316; }
.amt-risk { font-weight: bold; color: #f87171; }
.code-tag { background-color: #312e81; color: #818cf8; padding: 2px 6px; border-radius: 4px; font-weight: bold; }
.desc-text { color: #94a3b8; font-size: 13px; }

.directive-box { margin-top: 15px; padding: 15px; border-radius: 4px; font-size: 13.5px; line-height: 1.6; }
.directive-box.directive-pi { background-color: #2d1013; border-left: 4px solid #ef4444; color: #fca5a5; }
.directive-box.directive-pr { background-color: #0c1a30; border-left: 4px solid #3b82f6; color: #93c5fd; }
.directive-box.directive-co { background-color: #251c0c; border-left: 4px solid #f59e0b; color: #fef08a; }
.geo-text { font-size: 13.5px; color: #cbd5e1; margin: 0; }
</style>
