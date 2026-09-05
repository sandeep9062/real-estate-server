import express from 'express';
import { getAllBookings, getBookingById, deleteBooking, updateBookingStatus, getMyPropertyBookings, updateOwnerBookingStatus } from '../controllers/bookingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllBookings);
// NOTE: must be registered before "/:id" so "owner" isn't treated as an id
router.get('/owner', protect, getMyPropertyBookings);
router.get('/:id', getBookingById);
router.delete('/:id', protect, deleteBooking);
router.patch('/:id/status', protect, updateBookingStatus);
router.patch('/:id/owner-status', protect, updateOwnerBookingStatus);

export default router;
