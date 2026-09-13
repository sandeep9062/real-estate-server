import Enquiry from "../models/enquiry.js";

export const createEnquiry = async (req, res) => {
  try {
    // unncomment it if you want that same user cannot post-requirement twice.

    //console.log(req.body);

    //const { email, phone } = req.body;

    // const existingEnquiry = await Enquiry.findOne({
    //   $or: [{ email }, { phone }],
    // });

    // if (existingEnquiry) {
    //   return res.status(409).json({
    //     error: "An enquiry with this email or phone number already exists.",
    //   });
    // }

    const enquiry = new Enquiry(req.body);
    await enquiry.save();

    res.status(201).json({ message: "Enquiry submitted successfully!" });
  } catch (error) {
    console.error("Error saving enquiry:", error);
    res.status(500).json({ error: "Server error. Please try again later." });
  }
};

export const getAllEnquiries = async (req, res) => {
  try {
    // Whitelisted query filters used by the admin dashboard toolbar
    // (deal / type / availability / furnishing).
    const { deal, type, availability, furnishing } = req.query;
    const filter = {};
    if (deal) filter.deal = deal;
    if (type) filter.type = type;
    if (availability) filter.availability = availability;
    if (furnishing) filter.furnishing = furnishing;

    const enquiries = await Enquiry.find(filter).sort({ createdAt: -1 });
    res.status(200).json(enquiries);
  } catch (error) {
    console.error("Error fetching enquiries:", error);
    res.status(500).json({ error: "Failed to fetch enquiries." });
  }
};
