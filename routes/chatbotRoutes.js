import express from "express";
import Lead from "../models/ClientLead.js";
import { chatbotSteps } from "../chatbot/chatbotFlow.js";
import { generateAgentSummary } from "../chatbot/generateSummary.js";

const chatbotRouter = express.Router();

let sessions = {}; // In-memory session store

chatbotRouter.post("/", async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessions[sessionId]) {
    sessions[sessionId] = { step: 0, data: {} };
    const greetings = ["hi", "hello", "hey", "hlo"];
    if (greetings.includes(message.toLowerCase())) {
      const responses = [
        "Hello! How can I assist you with your property search today?",
        "Hi there! What can I help you find?",
        "Hey! I'm here to help you find the perfect property. What are you looking for?",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      return res.json({
        reply: randomResponse,
      });
    }
    return res.json({
      reply: chatbotSteps[0].question,
    });
  }

  let session = sessions[sessionId];
  let currentStep = chatbotSteps[session.step];

  // Validate step to prevent out-of-bounds access
  if (!currentStep) {
    delete sessions[sessionId]; // Clear broken session
    return res.json({
      reply: "Sorry, something went wrong. Let's start over.",
    });
  }

  // Email validation
  if (currentStep.key === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(message)) {
      return res.json({
        reply: "That email address doesn't look right. Please enter a valid email.",
      });
    }
  }

  // Phone validation
  if (currentStep.key === "phone") {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(message)) {
      return res.json({
        reply: "Please enter a valid 10-digit mobile number.",
      });
    }
  }

  // Save answer
  if (currentStep.key === "amenities") {
    session.data[currentStep.key] = message.split(",").map((a) => a.trim());
  } else if (
    currentStep.key === "preApprovedLoan" ||
    currentStep.key === "needLoanAssistance" ||
    currentStep.key === "reraOnly" ||
    currentStep.key === "consentGiven"
  ) {
    session.data[currentStep.key] = message.toLowerCase().includes("yes");
  } else {
    session.data[currentStep.key] = message;
  }

  session.step++;

  // Completed?
  if (session.step >= chatbotSteps.length) {
    const agentSummary = generateAgentSummary(session.data);

    const lead = new Lead({
      ...session.data,
      agentSummary,
      source: "Chatbot",
    });

    await lead.save();

    delete sessions[sessionId];

    return res.json({
      reply:
        "Thank you! Your details are submitted. Our property expert will contact you shortly.",
      agentSummary,
      completed: true,
    });
  }

  // Ask next question
  return res.json({
    reply: chatbotSteps[session.step].question,
  });
});

export default chatbotRouter;
