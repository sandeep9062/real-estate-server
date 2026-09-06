import User from "../models/User.js";
import Property from "../models/Property.js";
import Booking from "../models/Booking.js";
import VisitReview from "../models/VisitReview.js";
import { createNotification } from "./notificationController.js";
import {
  notifyBookingCreatedEmails,
  notifyVisitCancelledEmails,
} from "../utils/transactionalEmails.js";
import mongoose from "mongoose";
import { transformPropertyCoordinates } from "../utils/propertyFilter.js";

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin

export const getUsers = async (req, res) => {
  const users = await User.find({});

  // Attach property count for each user
  const userIds = users.map((u) => u._id);
  const propertyCounts = await Property.aggregate([
    { $match: { user: { $in: userIds }, deletedAt: null } },
    { $group: { _id: "$user", count: { $sum: 1 } } },
  ]);
  const countMap = {};
  for (const entry of propertyCounts) {
    countMap[entry._id.toString()] = entry.count;
  }

  const usersWithCount = users.map((u) => {
    const obj = u.toObject();
    obj.propertyCount = countMap[u._id.toString()] || 0;
    return obj;
  });

  res.json(usersWithCount);
};

// Helper function to check if a string is a valid MongoDB ObjectId
const isValidObjectId = (id) => {
  return (
    mongoose.Types.ObjectId.isValid(id) &&
    new mongoose.Types.ObjectId(id).toString() === id
  );
};

export const getUser = async (req, res) => {
  try {
    const userId = req.params.id;

    let user;

    // Find in the main users collection if it's a valid ObjectId
    if (isValidObjectId(userId)) {
      user = await User.findById(userId)
        .select("-password")
        .populate({
          path: "bookedVisits",
          populate: { path: "property" },
        });
    }

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Align field name with frontend expectation
    const responseUser = user.toObject ? user.toObject() : user;
    res.json(responseUser);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const createUser = async (req, res) => {
  const { name, email, phone, role } = req.body;

  try {
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({ name, email, phone, role });
    await user.save();

    res.status(201).json(user);
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateUser = async (req, res) => {
  const { name, email, phone, role, isActive } = req.body;

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.role = role || user.role;
    user.isActive = isActive === undefined ? user.isActive : isActive;

    const updatedUser = await user.save();

    res.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteUser = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const user = await User.findById(req.params.id).session(session);

    if (!user) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: "User not found" });
    }

    // 1️⃣ Find all properties listed by this user — union of the direct
    // `user` ref and any legacy ids present in the user's `ownedProperties`
    // array, so nothing listed by him is ever orphaned.
    const ownedByRef = await Property.find({ user: user._id })
      .select("_id")
      .session(session);

    const propertyIds = [
      ...new Set(
        [
          ...ownedByRef.map((p) => p._id),
          ...((user.ownedProperties || []).map((p) => p._id || p)),
        ].map((id) => id.toString()),
      ),
    ];

    if (propertyIds.length) {
      // Remove these properties from ALL users' favourites
      await User.updateMany(
        { favProperties: { $in: propertyIds } },
        { $pull: { favProperties: { $in: propertyIds } } },
        { session },
      );

      // Find bookings related to these properties, then delete them
      const bookings = await Booking.find(
        { property: { $in: propertyIds } },
        { _id: 1 },
      ).session(session);
      const bookingIds = bookings.map((b) => b._id);

      await Booking.deleteMany(
        { property: { $in: propertyIds } },
        { session },
      );
      await VisitReview.deleteMany(
        { property: { $in: propertyIds } },
        { session },
      );

      // Remove deleted bookings from users' bookedVisits
      if (bookingIds.length) {
        await User.updateMany(
          { bookedVisits: { $in: bookingIds } },
          { $pull: { bookedVisits: { $in: bookingIds } } },
          { session },
        );
      }
    }

    // 2️⃣ Permanently delete all properties registered by the user
    if (propertyIds.length) {
      await Property.deleteMany({ _id: { $in: propertyIds } }, { session });
    }

    // 3️⃣ Delete the user (ownedProperties refs go away with the user)
    await user.deleteOne({ session });

    await session.commitTransaction();
    session.endSession();

    res.json({
      success: true,
      id: user._id,
      deletedProperties: propertyIds.length,
      message:
        propertyIds.length > 0
          ? `User removed along with ${propertyIds.length} registered propert${propertyIds.length === 1 ? "y" : "ies"}`
          : "User removed",
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error("Error deleting user:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateProfile = async (req, res) => {
  const { name, email, phone } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const imageUrl = req.file ? req.file.path : user.image || "";

    user.name = name || user.name;
    user.email = email || user.email;
    user.phone = phone || user.phone;
    user.image = imageUrl;

    const updatedUser = await user.save();

    return res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      image: updatedUser.image,
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

export const userProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const responseUser = {
      ...user.toObject(),
      bookedVisits: user.bookedVisits || [],
    };
    res.json({ user: responseUser, message: "User Data" });
  } catch (error) {
    console.error("Profile fetch error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const userFavourites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favProperties");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.favProperties);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const toggleFavourite = async (req, res) => {
  const { propId } = req.params;
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  try {
    const alreadyFavourited = user.favProperties.some(
      (id) => id.toString() === propId,
    );

    if (alreadyFavourited) {
      user.favProperties = user.favProperties.filter(
        (id) => id.toString() !== propId,
      );
    } else {
      user.favProperties.push(propId);
    }

    await user.save();
    const populatedUser = await User.findById(req.user._id).populate(
      "favProperties",
    );
    res.status(200).json(populatedUser);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const userBookings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "bookedVisits",
      populate: {
        path: "property",
        model: "Property",
      },
    });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user.bookedVisits);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const bookVisit = async (req, res) => {
  try {
    const { propertyId, date } = req.body;
    if (!propertyId || !date) {
      return res
        .status(400)
        .json({ message: "propertyId and date are required" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get property details for notification
    const Property = (await import("../models/Property.js")).default;
    const property = await Property.findById(propertyId);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // Create a new booking
    const newBooking = new Booking({
      user: req.user._id,
      property: propertyId,
      date,
    });
    await newBooking.save();

    // Add booking to user's bookedVisits
    user.bookedVisits.push(newBooking._id);
    await user.save();

    // Create notification for property owner
    if (property.user.toString() !== req.user._id.toString()) {
      try {
        await createNotification({
          userId: property.user,
          title: `New Visit Booking`,
          message: `${user.name} has booked a visit for your property "${property.title}" on ${new Date(date).toLocaleDateString()}`,
          type: "success",
          category: "booking",
          priority: "high",
          metadata: {
            bookingId: newBooking._id,
            propertyId: property._id,
            userId: user._id,
            visitDate: date,
          },
          actionUrl: `/dashboard/bookings/${newBooking._id}`,
        });
      } catch (notificationError) {
        console.error("Error creating owner notification:", notificationError);
      }
    }

    // Create notification for admins
    try {
      const adminUsers = await User.find({ role: "admin" });

      for (const admin of adminUsers) {
        await createNotification({
          userId: admin._id,
          title: `New Booking Received`,
          message: `New visit booking for "${property.title}" by ${user.name} for ${new Date(date).toLocaleDateString()}`,
          type: "info",
          category: "booking",
          priority: "medium",
          metadata: {
            bookingId: newBooking._id,
            propertyId: property._id,
            userId: user._id,
            visitDate: date,
          },
          actionUrl: `/dashboard/bookings/${newBooking._id}`,
        });
      }
    } catch (notificationError) {
      console.error("Error creating admin notifications:", notificationError);
    }

    const visitDateStr = new Date(date).toLocaleDateString();
    notifyBookingCreatedEmails({
      visitorEmail: user.email,
      visitorName: user.name,
      visitorUserId: user._id.toString(),
      visitDateStr,
      propertyTitle: property.title,
      bookingId: newBooking._id.toString(),
      ownerUserId: property.user?.toString?.(),
    }).catch((err) =>
      console.warn("Booking notification emails skipped:", err.message),
    );

    const populatedUser = await User.findById(req.user._id)
      .populate("bookedVisits")
      .select("-password");
    return res.status(200).json(populatedUser);
  } catch (error) {
    console.error("Book visit error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getRecentlyViewed = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("recentlyViewedProperties")
      .populate({
        path: "recentlyViewedProperties",
        match: { isActive: true, deletedAt: null },
        populate: {
          path: "user",
          select: "phone name",
        },
      })
      .lean();

    const list = (user?.recentlyViewedProperties || [])
      .filter(Boolean)
      .map((p) => transformPropertyCoordinates({ ...p }));

    res.json(list);
  } catch (error) {
    console.error("getRecentlyViewed error:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const cancelVisit = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const booking = await Booking.findOne({
      user: userId,
      property: propertyId,
    }).populate({ path: "property", select: "title user" });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const visitDateStr = new Date(booking.date).toLocaleDateString();
    const propertyTitle = booking.property?.title || "Property";
    const ownerUserId = booking.property?.user?.toString?.();

    // Remove the booking reference from user's bookedVisits
    await User.findByIdAndUpdate(userId, {
      $pull: { bookedVisits: booking._id },
    });

    await booking.deleteOne();

    notifyVisitCancelledEmails({
      visitorEmail: user.email,
      visitorName: user.name,
      visitorUserId: userId.toString(),
      ownerUserId,
      propertyTitle,
      visitDateStr,
    }).catch((err) =>
      console.warn("Visit cancellation emails skipped:", err.message),
    );

    // Return the populated user
    const populatedUser = await User.findById(userId)
      .populate({
        path: "bookedVisits",
        populate: { path: "property" },
      })
      .select("-password");

    return res.status(200).json(populatedUser);
  } catch (error) {
    console.error("Cancel booking error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
