const express = require("express");
const router = express.Router();
const bookingController = require("../controllers/bookingController");

router.post("/bookings", bookingController.createBooking);

router.get("/bookings/user/:userId", bookingController.getBookingsByUser);

router.get("/bookings/:id", bookingController.getBookingById);

router.post("/bookings/:id/cancel", bookingController.cancelBooking);

router.get("/events/:id/availability", bookingController.checkAvailability);

router.post("/events/:id/calculate-price", bookingController.calculatePrice);

module.exports = router;
