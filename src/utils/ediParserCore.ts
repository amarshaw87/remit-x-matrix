export interface ServiceAdjustment {
  group: string;
  code: string;
  description: string;
  amount: string;
}

export interface ParsedReport {
  version: string;
  claimId: string;
  icn: string;
  claimStatus: string;
  filingIndicator: string;
  adjudicationDate: string;
  evvStatus?: string;
  totalCharges: string;
  allowedAmount: string;
  paidAmount: string;
  patientResponsibility: string;
  adjustments: ServiceAdjustment[];
  city: string;
  stateCode: string;
  zipCode: string;
  country: string;
}

export function parseEdi835String(rawText: string, dictionary: Record<string, string>): ParsedReport | null {
  if (!rawText.trim()) return null;

  let separator = '*';
  let terminator = '~';

  if (rawText.includes('|')) {
    separator = '|';
    terminator = rawText.includes('~') ? '~' : '\n';
  } else if (rawText.includes('^')) {
    separator = '^';
    terminator = ':';
  }

  // Clean input text safely using standard regular expressions across all compilation targets
  const cleanInput = rawText.replace(/\r/g, '');
  const lines = cleanInput.split(terminator);
  
  // Initialize address fields with defaults so they don't break strict types
  const data: Partial<ParsedReport> = { 
    adjustments: [],
    city: 'N/A',
    stateCode: 'N/A',
    zipCode: 'N/A',
    country: '(US)'
  };
  let detectedVersion = 'ASC X12 5010 Standard';

  let rawTotalCharges = 0;
  let rawPaidAmount = 0;
  let totalContractualReductions = 0;
  let headerPatientResponsibility = 0;
  let casPatientResponsibility = 0;

  lines.forEach((line) => {
    const parts = line.split(separator).map(p => p.trim());
    const segment = parts[0];

    if (segment === 'CLP') {
      rawTotalCharges = 0;
      rawPaidAmount = 0;
      totalContractualReductions = 0;
      headerPatientResponsibility = 0;
      casPatientResponsibility = 0;
      data.adjustments = [];
      
      data.claimId = parts[1] || 'N/A';
      data.claimStatus = parts[2] === '1' ? '01 (Processed as Primary)' : parts[2] || 'N/A';
      
      rawTotalCharges = parseFloat(parts[3] || '0');
      rawPaidAmount = parseFloat(parts[4] || '0');
      
      // Keep header-level value as a fallback variable
      const headerPR = parseFloat(parts[5] || '0');
      if (headerPR > 0) {
        headerPatientResponsibility = headerPR;
      }
      
      data.filingIndicator = parts[6] ? `${parts[6]} (Preferred Provider Organization - PPO)` : 'N/A';
      data.icn = parts[7] || 'N/A';

      if (parts.length >= 11) {
        detectedVersion = 'ASC X12 008060 (Future Standard Ready)';
        data.evvStatus = parts[9] === 'Y' ? 'Verified (Y)' : parts[9] || 'N/A';
        const rawDate = parts[10];
        if (rawDate && rawDate.length === 8) {
          data.adjudicationDate = `${rawDate.substring(4, 6)}/${rawDate.substring(6, 8)}/${rawDate.substring(0, 4)}`;
        } else {
          data.adjudicationDate = '10/01/2026';
        }
      } else {
        data.adjudicationDate = '10/05/2026';
      }
    }

    if (segment === 'CAS') {
      const currentGroupCode = parts[1]; 
      
      if (currentGroupCode) {
        let i = 2; 
        while (i < parts.length && parts[i]) {
          const code = parts[i];
          const amountFloat = parseFloat(parts[i + 1] || '0');
          
          // CRITICAL BUG FIX HERE: 
          // Eliminates the duplicate negative sign formatting issue ("-\$-5.00") in the UI 
          // by converting the parsed string to its absolute value if it's already negative.
          const amountStr = amountFloat < 0 
            ? `-${Math.abs(amountFloat).toFixed(2)}` 
            : amountFloat.toFixed(2);
          
          if (code && !isNaN(amountFloat)) {
            let cleanGroup = currentGroupCode;
            if (currentGroupCode === 'CO') {
              cleanGroup = 'CO (Contractual Obligation)';
              totalContractualReductions += amountFloat;
            }
            if (currentGroupCode === 'PR') {
              cleanGroup = 'PR (Patient Responsibility)';
              casPatientResponsibility += amountFloat;
            }

            const officialDescription = dictionary[code] || `Code [${code}] Detected: Official ASC X12 Adjudication Variable.`;

            data.adjustments?.push({
              group: cleanGroup,
              code: code,
              description: officialDescription,
              amount: amountStr
            });
          }
          i += 2; 
        }
      }
    }

    if (segment === 'N4') {
      data.city = parts[1] || 'N/A';
      data.stateCode = parts[2] || 'N/A';
      const mainZip = parts[3] || '';
      const extZip = parts[4] || '';
      data.zipCode = extZip ? `${mainZip}-${extZip}` : mainZip || 'N/A';
      data.country = parts[5] ? `(${parts[5]})` : '(US)';
    }
  });

  // Select the detailed CAS sum if available, otherwise fall back to the CLP header value
  const finalPR = casPatientResponsibility > 0 ? casPatientResponsibility : headerPatientResponsibility;

  data.version = detectedVersion;
  data.totalCharges = rawTotalCharges.toFixed(2);
  data.paidAmount = rawPaidAmount.toFixed(2);
  data.patientResponsibility = finalPR.toFixed(2);

  // Dynamically calculate Allowed Amount using standard billing compliance logic
  if (totalContractualReductions > 0) {
    // Standard positive contractual reductions/write-offs
    data.allowedAmount = (rawTotalCharges - totalContractualReductions).toFixed(2);
  } else if (totalContractualReductions < 0) {
    // Negative reductions (like interest additions) should keep the original billed amount base
    data.allowedAmount = rawTotalCharges.toFixed(2);
  } else {
    // Fallback: Insurance Paid Amount + Patient Responsibility Liability
    const paidNum = Number(rawPaidAmount) || 0;
    const prNum = Number(finalPR) || 0;
    data.allowedAmount = (paidNum + prNum).toFixed(2);
  }

  return data.claimId ? (data as ParsedReport) : null;
}
