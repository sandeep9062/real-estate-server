import express from "express";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { checkAdmin, protect } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/multer.js";
import { getUsers } from "../controllers/userController.js";
import Booking from "../models/Booking.js";

const router = express.Router();

// ✅ Register Route
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Enter full details" });
    }

    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    user = new User({ name, email, password });
    await user.save();

    const payload = { user: { id: user._id, role: user.role } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
      (error, token) => {
        if (error) throw error;

        res.status(201).json({
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            image: user.image,
            favProperties: user.favProperties || [],
            bookedVisits: user.bookedVisits || [],
            ownedProperties: user.ownedProperties || [],
          },
          token,
        });
      }
    );
  } catch (error) {
    //console.error("Register error:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Login Route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }

    const payload = { user: { id: user._id, role: user.role } };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
      (err, token) => {
        if (err) {
          console.error("JWT Signing Error:", err);
          return res.status(500).json({ message: "Token generation failed" });
        }

        return res.status(200).json({
          user: {
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            image: user.image,
            favProperties: user.favProperties || [],
            bookedVisits: user.bookedVisits || [],
            ownedProperties: user.ownedProperties || [],
          },
          token,
        });
      }
    );
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Profile Update Route (with image upload)
router.put(
  "/profile-update",
  protect,
  upload.single("image"),
  async (req, res) => {
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
  }
);

// ✅ Get logged-in user's profile
router.get("/profile", protect, async (req, res) => {
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
});

// ✅ Get all favourite properties of a user
router.get("/favourites", protect, async (req, res) => {
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
});

// ✅ Get all bookings of a user
router.get("/bookings", protect, async (req, res) => {
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
});

// ✅ Get user by ID
router.get("/:id", async (req, res) => {
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
});

// ✅ Create a new user
router.post("/", async (req, res) => {
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
});

// ✅ Get all users
router.get("/", protect, checkAdmin, getUsers);

// ✅ Update user by ID
router.put("/:id", protect, async (req, res) => {
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
});

// ✅ Add/Remove Favourite Route
router.post("/toFav/:propId", protect, async (req, res) => {
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
});

// ✅ Book a property visit
router.post("/bookings", protect, async (req, res) => {
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
});

// ✅ Cancel a property visit
router.delete("/bookings/:propertyId", protect, async (req, res) => {
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
});

// ✅ Delete user by ID
router.delete("/:id", protect, checkAdmin, async (req, res) => {
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
});
export default router;
