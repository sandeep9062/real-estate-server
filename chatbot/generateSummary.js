export function generateAgentSummary(data) {
  return `
Client Name: ${data.fullName}
Email: ${data.email}
Phone: ${data.phone}

Location Preference: ${data.location}
Property Type: ${data.propertyType}
Bedrooms: ${data.bedrooms}
Budget: ${data.budget}

Carpet Area: ${data.carpetAreaMin} - ${data.carpetAreaMax} sq.ft
Amenities: ${data.amenities}

Income: ${data.income}
Pre-approved Loan: ${data.preApprovedLoan ? "Yes" : "No"}
Loan Assistance Needed: ${data.needLoanAssistance ? "Yes" : "No"}

Purpose: ${data.purchasePurpose}
Buying Timeline: ${data.timeline}
RERA Only: ${data.reraOnly ? "Yes" : "No"}

Callback Time: ${data.callbackTime}
Message: ${data.message}

Summary for Agent:
- Suggest properties within ₹${data.budget}
- Focus on ${data.propertyType} options in ${data.location}
- ${data.bedrooms} BHK with ${data.amenities}
- Loan help required: ${data.needLoanAssistance ? "Yes" : "No"}
- Buying timeline: ${data.timeline}
  `;
}
