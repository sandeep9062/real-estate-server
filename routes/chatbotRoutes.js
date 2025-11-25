import express from "express";
import Lead from "../models/ClientLead.js";
import { chatbotFlow } from "../chatbot/chatbotFlow.js";
import {
  generateAgentSummary,
  generateUserSummary,
} from "../chatbot/generateSummary.js";

const chatbotRouter = express.Router();

let sessions = {}; // In-memory session store

chatbotRouter.post("/", async (req, res) => {
  const { sessionId, message } = req.body;

  if (!sessions[sessionId]) {
    sessions[sessionId] = { currentStepKey: chatbotFlow.start, data: {} };
    const greetings = ["hi", "hello", "hey", "hlo"];
    if (greetings.includes(message.toLowerCase())) {
      const responses = [
        "Hello! How can I assist you with your property search today?",
        "Hi there! What can I help you find?",
        "Hey! I'm here to help you find the perfect property. What are you looking for?",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      const firstStep = chatbotFlow.steps[chatbotFlow.start];
      return res.json({
        reply: `${randomResponse} ${firstStep.question}`,
      });
    }
    const firstStep = chatbotFlow.steps[chatbotFlow.start];
    return res.json({
      reply: firstStep.question,
    });
  }

  let session = sessions[sessionId];
  let currentStep = chatbotFlow.steps[session.currentStepKey];

  // Allow user to restart conversation
  if (message.toLowerCase() === "restart") {
    sessions[sessionId] = { currentStepKey: chatbotFlow.start, data: {} };
    return res.json({
      reply: chatbotFlow.steps[chatbotFlow.start].question,
    });
  }

  if (!currentStep) {
    delete sessions[sessionId];
    return res.json({
      reply: "Sorry, something went wrong. Let's restart the conversation.",
    });
  }

  // Validation logic
  if (currentStep.key === "email") {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(message)) {
      return res.json({
        reply: "That email address doesn't look right. Please enter a valid email.",
      });
    }
  }

  if (currentStep.key === "phone") {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(message)) {
      return res.json({
        reply: "Please enter a valid 10-digit mobile number.",
      });
    }
  }

  // Validation for fullName
  if (currentStep.key === "fullName") {
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!message || !nameRegex.test(message)) {
      return res.json({
        reply: currentStep.invalidInput || chatbotFlow.invalidInput.question,
      });
    }
  }

  // Save the answer (but not for the summary step itself)
  let isYes = message.toLowerCase().includes("yes");
  if (currentStep.key !== "summary") {
    if (currentStep.key === "amenities") {
      session.data[currentStep.key] = message.split(",").map((a) => a.trim());
    } else if (
      ["preApprovedLoan", "needLoanAssistance", "reraOnly", "consentGiven"].includes(
        currentStep.key
      )
    ) {
      session.data[currentStep.key] = isYes;
    } else {
      session.data[currentStep.key] = message;
    }
  }

  // Determine the next step
  let nextStepKey;
  if (currentStep.branches) {
    const normalizedMessage = message.toLowerCase();
    if (normalizedMessage.includes("yes")) {
      nextStepKey = currentStep.branches.yes;
    } else if (normalizedMessage.includes("no")) {
      nextStepKey = currentStep.branches.no;
    } else {
      // Handle invalid input for branching questions
      return res.json({
        reply: chatbotFlow.invalidInput.question,
      });
    }
  } else {
    nextStepKey = currentStep.next;
  }
  session.currentStepKey = nextStepKey;

  // Check if conversation is finished
  if (nextStepKey === "end") {
    const agentSummary = generateAgentSummary(session.data);
    const lead = new Lead({
      ...session.data,
      agentSummary,
      source: "Chatbot",
    });
    await lead.save();
    delete sessions[sessionId];

    return res.json({
      reply: "Thank you! Your details are submitted. Our property expert will contact you shortly.",
      agentSummary,
      completed: true,
    });
  }

  const nextStep = chatbotFlow.steps[nextStepKey];

  // If the next step is the summary, generate and send it
  if (nextStepKey === "summary") {
    const userSummary = generateUserSummary(session.data);
    return res.json({
      reply: userSummary,
    });
  }

  // Otherwise, ask the next question
  return res.json({
    reply: nextStep.question,
  });
});

export default chatbotRouter;
