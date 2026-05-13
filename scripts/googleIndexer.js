const { google } = require("googleapis");
const key = require("./service-account.json"); // Aapki downloaded key

const jwtClient = new google.auth.JWT(
  key.client_email,
  null,
  key.private_key,
  ["https://www.googleapis.com/auth/indexing"],
  null,
);

const indexUrl = async (url) => {
  try {
    await jwtClient.authorize();
    const options = {
      url: "https://indexing.googleapis.com/v3/urlNotifications:publish",
      method: "POST",
      auth: jwtClient,
      body: JSON.stringify({
        url: url,
        type: "URL_UPDATED", // Naya page ya updated page ke liye
      }),
    };

    const res = await google.indexing("v3").urlNotifications.publish(options);
    console.log(`🚀 Success: ${url} index request sent.`);
  } catch (error) {
    console.error(`❌ Error indexing ${url}:`, error.message);
  }
};

// Example: Bulk Indexing array
const urlsToIndex = [
  "https://www.propertybulbul.com/property/123",
  "https://www.propertybulbul.com/journal/safety-in-tricity",
  // Yahan apne wo 211 URLs ki list dal sakte ho
];

urlsToIndex.forEach((url) => indexUrl(url));
