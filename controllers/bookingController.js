import Booking from '../models/Booking.js';
import Property from '../models/Property.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';
import { notifyBookingStatusEmail } from '../utils/transactionalEmails.js';

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
    const isAdmin = req.user.role === 'admin';

    // Find the booking - admins can delete any booking, users can only delete their own
    const booking = await Booking.findOne({ 
      _id: id, 
      ...(isAdmin ? {} : { user: userId }) 
    });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Remove the booking
    await booking.deleteOne();

    // Pull the booking reference from the user's bookedVisits array
    await User.findByIdAndUpdate(booking.user._id, {
      $pull: { bookedVisits: booking._id },
    });

    res.json({ message: "Booking removed" });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

// @desc    Update a booking's status
// @route   PATCH /api/bookings/:id/status
// @access  Private/Admin
const updateBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const booking = await Booking.findById(id).populate('user', 'name email').populate('property', 'title');

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    const oldStatus = booking.status;
    booking.status = status;
    await booking.save();

    // Create notification for admins when booking status changes
    if (oldStatus !== status) {
      try {
        // Get all admin users
        const adminUsers = await User.find({ role: 'admin' });

        for (const admin of adminUsers) {
          await createNotification({
            userId: admin._id,
            title: `Booking Status Updated`,
            message: `Booking for "${booking.property.title}" by ${booking.user.name} has been ${status}`,
            type: status === 'confirmed' ? 'success' : status === 'cancelled' ? 'warning' : 'info',
            category: 'booking',
            priority: 'medium',
            metadata: {
              bookingId: booking._id,
              propertyId: booking.property._id,
              userId: booking.user._id,
              oldStatus,
              newStatus: status,
            },
            actionUrl: `/dashboard/bookings/${booking._id}`,
          });
        }
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the booking update if notification creation fails
      }

      const visitDateStr = new Date(booking.date).toLocaleDateString();
      notifyBookingStatusEmail({
        userEmail: booking.user.email,
        userName: booking.user.name,
        propertyTitle: booking.property.title,
        status: booking.status,
        visitDateStr,
      }).catch((err) =>
        console.warn('Booking status email skipped:', err.message),
      );
    }

    res.json({ message: "Booking status updated successfully", booking });
  } catch (error) {
    console.error("Error updating booking status:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export { getAllBookings, getBookingById, deleteBooking, updateBookingStatus };

const BOOKING_STATUSES = ['Pending', 'Confirmed', 'Completed', 'Cancelled'];

// @desc    Get all visit bookings made on the logged-in landlord's properties
// @route   GET /api/bookings/owner
// @access  Private (landlord/admin)
const getMyPropertyBookings = async (req, res) => {
  try {
    // Support searching by userID query param (for admin or specific user view)
    // Default to the logged-in user's ID
    const ownerId = req.query.userID || req.user._id;

    const ownedProperties = await Property.find({ user: ownerId }).select('_id');
    const propertyIds = ownedProperties.map((p) => p._id);

    if (propertyIds.length === 0) {
      return res.json([]);
    }

    const bookings = await Booking.find({ property: { $in: propertyIds } })
      .populate('user', 'name email phone')
      .populate({
        path: 'property',
        select: 'title slug image deal price location postedBy',
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    console.error('Error fetching property bookings:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Landlord/admin updates the status of a visit booked on their own property
// @route   PATCH /api/bookings/:id/owner-status
// @access  Private (property owner or admin)
const updateOwnerBookingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!BOOKING_STATUSES.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value.' });
    }

    const booking = await Booking.findById(id).populate('user', 'name email').populate('property', 'title user');

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const ownerId = booking.property?.user ? String(booking.property.user) : '';
    if (ownerId !== String(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this booking.' });
    }

    const oldStatus = booking.status;
    if (oldStatus === status) {
      return res.json({ message: 'Status unchanged', booking });
    }

    booking.status = status;
    await booking.save();

    // Notify the visitor (best-effort — never fail the update on this)
    try {
      await createNotification({
        userId: booking.user._id,
        title: `Visit ${status.toLowerCase()}`,
        message: `Your visit for "${booking.property.title}" was ${status.toLowerCase()} by the landlord.`,
        type: status === 'Confirmed' ? 'success' : status === 'Cancelled' ? 'warning' : 'info',
        category: 'booking',
        priority: 'medium',
        metadata: {
          bookingId: booking._id,
          propertyId: booking.property._id,
          oldStatus,
          newStatus: status,
        },
        actionUrl: '/bookings',
      });
    } catch (notificationError) {
      console.error('Error creating notification:', notificationError);
    }

    const visitDateStr = new Date(booking.date).toLocaleDateString();
    notifyBookingStatusEmail({
      userEmail: booking.user.email,
      userName: booking.user.name,
      propertyTitle: booking.property.title,
      status: booking.status,
      visitDateStr,
    }).catch((err) => console.warn('Booking status email skipped:', err.message));

    res.json({ message: 'Booking status updated successfully', booking });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export { getMyPropertyBookings, updateOwnerBookingStatus };
