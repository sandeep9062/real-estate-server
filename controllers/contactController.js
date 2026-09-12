import mongoose from "mongoose";
import Contact from "../models/Contact.js";
import { notifyContactFormEmails } from "../utils/transactionalEmails.js";

// @desc    Create a new contact message
// @route   POST /api/v1/contact
// @access  Public
export const createContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message, recaptchaToken } = req.body;

    const newContact = new Contact({
      name,
      email,
      phone,
      subject,
      message,
    });

    await newContact.save();

    notifyContactFormEmails(newContact).catch((err) =>
      console.warn("Contact form emails skipped:", err.message),
    );

    res.status(201).json({
      success: true,
      message: "Your message has been sent successfully!",
      data: newContact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

export const getAllContact = async (req, res) => {
  try {
    const Contacts = await Contact.find({});
    res.status(200).json(Contacts);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

const ALLOWED_CONTACT_STATUSES = ["new", "read", "archived"];

// @desc    Update a contact message (e.g. mark as read / archived)
// @route   PUT /api/v1/contacts/:id
// @access  Private/Admin
export const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact id",
      });
    }

    if (status === undefined || !ALLOWED_CONTACT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Allowed: ${ALLOWED_CONTACT_STATUSES.join(
          ", ",
        )}`,
      });
    }

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true },
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact updated successfully",
      data: contact,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};

// @desc    Delete a contact message
// @route   DELETE /api/v1/contacts/:id
// @access  Private/Admin
export const deleteContact = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact id",
      });
    }

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: "Contact message not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Contact deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server Error",
      error: error.message,
    });
  }
};
