import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";

export const generatePropertyPDF = async (propertyData) => {
  try {
    // 1. Path to your HTML template
    const templatePath = path.resolve("./views/brochureTemplate.ejs");

    // 2. Validate property data
    if (!propertyData) {
      throw new Error("Property data is required");
    }

    // 3. Sanitize and prepare property data
    const sanitizedProperty = {
      ...propertyData,
      // Ensure required fields exist
      _id: propertyData._id || "PROPERTY001",
      title: propertyData.title || "Property Listing",
      description: propertyData.description || "Property details coming soon.",
      price: propertyData.price || 0,
      area: propertyData.area || { value: 0, unit: "sq ft" },
      facilities: propertyData.facilities || { bedrooms: 0 },
      facing: propertyData.facing || "Open",
      availability: propertyData.availability || "Available",
      image: propertyData.image || [],
      user: propertyData.user || { email: "contact@propertybulbul.com" },
    };

    // 4. Render HTML with Property Data
    const html = await ejs.renderFile(templatePath, {
      property: sanitizedProperty,
    });

    // 5. Launch Puppeteer to "Print" the PDF
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=IsolateOrigins,site-per-process",
        "--disable-features=BlockInsecurePrivateNetworkRequests",
      ],
    });

    const page = await browser.newPage();

    // Set viewport for consistent rendering
    await page.setViewport({ width: 800, height: 1200 });

    // Set user agent to ensure proper rendering
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    );

    // Handle image loading errors
    await page.setRequestInterception(true);
    page.on("request", (request) => {
      if (request.resourceType() === "image") {
        // Allow all image requests
        request.continue();
      } else {
        request.continue();
      }
    });

    await page.setContent(html, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });

    // Wait a bit more for images to load, but don't wait indefinitely
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
    });

    await browser.close();
    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};
