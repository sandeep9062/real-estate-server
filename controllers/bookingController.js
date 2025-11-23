import Booking from '../models/Booking.js';
import User from '../models/User.js';

// @desc    Get all bookings
// @route   GET /api/bookings
// @access  Private/Admin
const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('user', 'name email').populate('property', 'title');
    res.json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Get a booking by ID
// @route   GET /api/bookings/:id
// @access  Private/Admin
const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id).populate('user', 'name email').populate('property', 'title');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({
      ...booking.toObject(),
      userName: booking.user.name,
      userEmail: booking.user.email,
      propertyTitle: booking.property.title,
    });
  } catch (error) {
    console.error('Error fetching booking details:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
// @access  Private/Admin
const deleteBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const booking = await Booking.findOne({ property: id, user: userId });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Remove the booking
    await booking.deleteOne();

    // Pull the booking reference from the user's bookedVisits array
    await User.findByIdAndUpdate(userId, {
      $pull: { bookedVisits: booking._id },
    });

    res.json({ message: "Booking removed" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export { getAllBookings, getBookingById, deleteBooking };
