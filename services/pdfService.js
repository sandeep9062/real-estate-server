import puppeteer from "puppeteer";
import ejs from "ejs";
import path from "path";

export const generatePropertyPDF = async (propertyData) => {
  // 1. Path to your HTML template
  const templatePath = path.resolve("./views/brochureTemplate.ejs");

  // 2. Render HTML with Property Data
  const html = await ejs.renderFile(templatePath, { property: propertyData });

  // 3. Launch Puppeteer to "Print" the PDF
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.setContent(html, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
  });

  await browser.close();
  return pdfBuffer;
};
