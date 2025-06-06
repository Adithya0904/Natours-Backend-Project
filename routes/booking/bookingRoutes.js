const express = require('express');
const bookingController = require('D:\\Backend\\4-natours\\starter\\controllers\\bookingController.js');
const authController = require('D:\\Backend\\4-natours\\starter\\controllers\\authController.js');

const router = express.Router();

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingController.getCheckoutSession);

router.use(authController.restrict('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingController.getAllBookings)
  .post(bookingController.createBooking);

router
  .route('/:id')
  .get(bookingController.getBooking)
  .patch(bookingController.updateBooking)
  .delete(bookingController.deleteBooking);

module.exports = router;
