import htmlPdf from "html-pdf-node";
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

    // 5. Configure PDF options
    const options = {
      format: "A4",
      printBackground: true,
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
    };

    // 6. Generate PDF from HTML
    const file = { content: html };
    const pdfBuffer = await htmlPdf.generatePdf(file, options);

    return pdfBuffer;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
};
