import { google } from "googleapis";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const key = require("./service-account.json");

const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ["https://www.googleapis.com/auth/indexing"],
  null,
);

const indexing = google.indexing("v3");

const indexUrl = async (url) => {
  try {
    const options = {
      url: "https://indexing.googleapis.com/v3/urlNotifications:publish",
      method: "POST",
      auth: jwtClient,
      body: JSON.stringify({
        url: url,
        type: "URL_UPDATED",
      }),
    };

    await indexing.urlNotifications.publish(options);
    console.log(`🚀 Success: ${url}`);
  } catch (error) {
    console.error(`❌ Error indexing ${url}:`, error.message);
  }
};

// Logic to handle bulk indexing with a small delay
const bulkIndex = async (urls) => {
  await jwtClient.authorize();
  console.log("🔑 Google API Authorized. Starting Bulk Indexing...");

  for (const url of urls) {
    await indexUrl(url);
    // 500ms delay to prevent hitting rate limits too fast
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("✅ All indexing requests processed.");
};

const urlsToIndex = [
  "https://www.propertybulbul.com/property/123",
  "https://www.propertybulbul.com/journal/safety-in-tricity",
  // 211 URLs list here
];

bulkIndex(urlsToIndex);
