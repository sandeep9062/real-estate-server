import User from "../models/User.js";
import Booking from "../models/Booking.js";
// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin

export const getUsers = async (req, res) => {
  const users = await User.find({});
  res.json(users);
};

export const getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "bookedVisits",
        populate: { path: "property" },
      });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Align field name with frontend expectation
    const responseUser = {
      ...user.toObject(),
    };
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
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await user.deleteOne();

    res.json({ message: "User removed" });
  } catch (error) {
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

    const imageUrl = req.file ? req.file.path : user.image;

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
    res.status(500).json({ message: "Server Error" });
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
      (id) => id.toString() === propId
    );

    if (alreadyFavourited) {
      user.favProperties = user.favProperties.filter(
        (id) => id.toString() !== propId
      );
    } else {
      user.favProperties.push(propId);
    }

    await user.save();
    const populatedUser = await User.findById(req.user._id).populate(
      "favProperties"
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

    const populatedUser = await User.findById(req.user._id)
      .populate("bookedVisits")
      .select("-password");
    return res.status(200).json(populatedUser);
  } catch (error) {
    console.error("Book visit error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const cancelVisit = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const user = await User.findById(req.user._id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.bookedVisits = (user.bookedVisits || []).filter(
      (b) => String(b?.id) !== String(propertyId)
    );

    const updated = await user.save();
    const responseUser = {
      ...updated.toObject(),
      bookedVisits: updated.bookedVisits || [],
    };
    return res.status(200).json(responseUser);
  } catch (error) {
    console.error("Cancel booking error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
};
