import Contact from '../models/Contact.js';

// @desc    Create a new contact message
// @route   POST /api/v1/contact
// @access  Public
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
    });

    await newContact.save();

    res.status(201).json({
      success: true,
      message: 'Your message has been sent successfully!',
      data: newContact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message,
    });
  }
};
