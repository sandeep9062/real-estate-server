import { Client as workflowClient } from "@upstash/workflow";

export const workflowClient = new workflowClient({
  baseUrl: process.env.QSTASH_URL,

  token: process.env.QSTASH_TOKEN,
});
