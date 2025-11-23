import express from 'express';
import { getAllBookings, getBookingById, deleteBooking } from '../controllers/bookingController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', getAllBookings);
router.get('/:id', getBookingById);
router.delete('/:id', protect, deleteBooking);

export default router;
