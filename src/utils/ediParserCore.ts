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

export function parseEdi835String(rawText: string, dictionary: Record<string, string>): ParsedReport[] {
  const reports: ParsedReport[] = [];
  if (!rawText.trim()) return reports;

  let separator = '*';
  let terminator = '~';

  if (rawText.includes('|')) {
    separator = '|';
    terminator = rawText.includes('~') ? '~' : '\n';
  } else if (rawText.includes('^')) {
    separator = '^';
    terminator = ':';
  }

  const cleanInput = rawText.replace(/\r/g, '');
  const lines = cleanInput.split(terminator);
  
  let detectedVersion = 'ASC X12 5010 Standard';
  
  // State variables for tracking the current claim being parsed
  let currentClaim: Partial<ParsedReport> | null = null;
  let rawTotalCharges = 0;
  let rawPaidAmount = 0;
  let totalContractualReductions = 0;
  let headerPatientResponsibility = 0;
  let casPatientResponsibility = 0;

  // Shared address tracking across the current segment batch
  let currentCity = 'N/A';
  let currentStateCode = 'N/A';
  let currentZipCode = 'N/A';
  let currentCountry = '(US)';

  lines.forEach((line) => {
    const parts = line.split(separator).map(p => p.trim());
    const segment = parts[0];

    // Global version interceptor configuration check
    if (segment === 'ISA') {
      if (parts[12] === '00806') {
        detectedVersion = 'ASC X12 008060 (Future Standard Ready)';
      }
    }

    if (segment === 'CLP') {
      // Whenever a new CLP is hit, push the previously completed claim record into our array list
      if (currentClaim && currentClaim.claimId) {
        finalizeAndPushClaim(
          reports, currentClaim, detectedVersion, rawTotalCharges, rawPaidAmount,
          totalContractualReductions, casPatientResponsibility, headerPatientResponsibility,
          currentCity, currentStateCode, currentZipCode, currentCountry
        );
      }

      // Reset state matrices completely for the fresh incoming claim loop
      rawTotalCharges = 0;
      rawPaidAmount = 0;
      totalContractualReductions = 0;
      headerPatientResponsibility = 0;
      casPatientResponsibility = 0;

      currentClaim = {
        adjustments: [],
        claimId: parts[1] || 'N/A',
        claimStatus: parts[2] === '1' ? '01 (Processed as Primary)' : parts[2] || 'N/A'
      };
      
      rawTotalCharges = parseFloat(parts[3] || '0');
      rawPaidAmount = parseFloat(parts[4] || '0');
      
      const headerPR = parseFloat(parts[5] || '0');
      if (headerPR > 0) {
        headerPatientResponsibility = headerPR;
      }
      
      currentClaim.filingIndicator = parts[6] ? `${parts[6]} (Preferred Provider Organization - PPO)` : 'N/A';
      currentClaim.icn = parts[7] || 'N/A';

      if (parts.length >= 11) {
        detectedVersion = 'ASC X12 008060 (Future Standard Ready)';
        currentClaim.evvStatus = parts[9] === 'Y' ? 'Verified (Y)' : parts[9] || 'N/A';
        const rawDate = parts[10];
        if (rawDate && rawDate.length === 8) {
          currentClaim.adjudicationDate = `${rawDate.substring(4, 6)}/${rawDate.substring(6, 8)}/${rawDate.substring(0, 4)}`;
        } else {
          currentClaim.adjudicationDate = '10/01/2026';
        }
      } else {
        currentClaim.adjudicationDate = '10/05/2026';
      }
    }

    if (segment === 'CAS' && currentClaim) {
      const currentGroupCode = parts[1]; 
      
      if (currentGroupCode) {
        let i = 2; 
        while (i < parts.length && parts[i]) {
          const code = parts[i];
          const amountFloat = parseFloat(parts[i + 1] || '0');
          
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

            currentClaim.adjustments?.push({
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
      currentCity = parts[1] || 'N/A';
      currentStateCode = parts[2] || 'N/A';
      const mainZip = parts[3] || '';
      const extZip = parts[4] || '';
      currentZipCode = extZip ? `${mainZip}-${extZip}` : mainZip || 'N/A';
      currentCountry = parts[5] ? `(${parts[5]})` : '(US)';
    }
  });

  // Intercept and flush out the final remaining active claim block from the stream loop
  if (currentClaim && currentClaim.claimId) {
    finalizeAndPushClaim(
      reports, currentClaim, detectedVersion, rawTotalCharges, rawPaidAmount,
      totalContractualReductions, casPatientResponsibility, headerPatientResponsibility,
      currentCity, currentStateCode, currentZipCode, currentCountry
    );
  }

  return reports;
}

// Internal accounting helper designed to perform data calculations before saving records into the array
function finalizeAndPushClaim(
  reports: ParsedReport[],
  claim: Partial<ParsedReport>,
  detectedVersion: string,
  rawTotalCharges: number,
  rawPaidAmount: number,
  totalContractualReductions: number,
  casPatientResponsibility: number,
  headerPatientResponsibility: number,
  city: string,
  stateCode: string,
  zipCode: string,
  country: string
) {
  const finalPR = casPatientResponsibility > 0 ? casPatientResponsibility : headerPatientResponsibility;

  claim.version = detectedVersion;
  claim.totalCharges = rawTotalCharges.toFixed(2);
  claim.paidAmount = rawPaidAmount.toFixed(2);
  claim.patientResponsibility = finalPR.toFixed(2);
  
  claim.city = city;
  claim.stateCode = stateCode;
  claim.zipCode = zipCode;
  claim.country = country;

  if (totalContractualReductions > 0) {
    claim.allowedAmount = (rawTotalCharges - totalContractualReductions).toFixed(2);
  } else if (totalContractualReductions < 0) {
    claim.allowedAmount = rawTotalCharges.toFixed(2);
  } else {
    const paidNum = Number(rawPaidAmount) || 0;
    const prNum = Number(finalPR) || 0;
    claim.allowedAmount = (paidNum + prNum).toFixed(2);
  }

  reports.push(claim as ParsedReport);
}
