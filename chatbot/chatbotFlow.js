export const chatbotFlow = {
  start: "fullName",
  invalidInput: {
    question: "I'm sorry, I didn't understand that. Could you please rephrase?",
  },
  steps: {
    fullName: {
      question: "To start, could you please share your full name?",
      key: "fullName",
      next: "email",
      invalidInput: "Please enter a valid name using only alphabetic characters.",
    },
    email: {
      question: "Thanks! What's the best email address to reach you at?",
      key: "email",
      next: "phone",
    },
    phone: {
      question: "And your phone number, please?",
      key: "phone",
      next: "location",
    },
    location: {
      question: "Great! Which city or neighborhood are you interested in?",
      key: "location",
      next: "propertyType",
    },
    propertyType: {
      question: "What type of property are you dreaming of? (e.g., Flat, Villa, Plot)",
      key: "propertyType",
      next: "bedrooms",
    },
    bedrooms: {
      question: "How many bedrooms are you looking for? (e.g., 1, 2, 3+ BHK)",
      key: "bedrooms",
      next: "budget",
    },
    budget: {
      question: "What's your approximate budget for the new property?",
      key: "budget",
      next: "carpetAreaMin",
    },
    carpetAreaMin: {
      question: "What's the minimum carpet area you need (in sq ft)?",
      key: "carpetAreaMin",
      next: "carpetAreaMax",
    },
    carpetAreaMax: {
      question: "And what's the maximum carpet area you'd consider?",
      key: "carpetAreaMax",
      next: "amenities",
    },
    amenities: {
      question: "Are there any specific amenities you'd love to have? (e.g., pool, gym, parking)",
      key: "amenities",
      next: "income",
    },
    income: {
      question: "To help with financing options, could you share your monthly income range?",
      key: "income",
      next: "preApprovedLoan",
    },
    preApprovedLoan: {
      question: "Have you already been pre-approved for a home loan? (yes/no)",
      key: "preApprovedLoan",
      branches: {
        yes: "purchasePurpose",
        no: "needLoanAssistance",
      },
    },
    needLoanAssistance: {
      question: "Would you like some assistance with securing a home loan? (yes/no)",
      key: "needLoanAssistance",
      next: "purchasePurpose",
    },
    purchasePurpose: {
      question: "Is this property for investment or for your own use?",
      key: "purchasePurpose",
      next: "timeline",
    },
    timeline: {
      question: "How soon are you looking to make a purchase? (e.g., immediately, in 3 months)",
      key: "timeline",
      next: "reraOnly",
    },
    reraOnly: {
      question: "Should we focus exclusively on RERA-approved projects for you? (yes/no)",
      key: "reraOnly",
      next: "callbackTime",
    },
    callbackTime: {
      question: "What would be a good time for our property advisor to give you a call?",
      key: "callbackTime",
      next: "message",
    },
    message: {
      question: "Is there anything else you'd like to add or any specific requirements?",
      key: "message",
      next: "consentGiven",
    },
    consentGiven: {
      question: "Finally, do you consent to sharing your details with our property advisor? (yes/no)",
      key: "consentGiven",
      next: "summary",
    },
    summary: {
      question: "Here is a summary of your details. Please confirm if everything is correct. (yes/no)",
      key: "summary",
      branches: {
        yes: "end",
        no: "restart",
      },
    },
  },
};
