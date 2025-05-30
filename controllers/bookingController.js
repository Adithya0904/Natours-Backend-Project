const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tour=require('D:\\Backend\\4-natours\\starter\\Models\\tourModel.js')
const User=require('D:\\Backend\\4-natours\\starter\\Models\\userModel.js')
const Booking = require('D:\\Backend\\4-natours\\starter\\Models\\bookingModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('D:\\Backend\\4-natours\\starter\\controllers\\handlerFactory');

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  // console.log(tour);

  // 2) Create checkout session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    
    mode: 'payment',
    // success_url: `${req.protocol}://${req.get('host')}/`,
    success_url: `${req.protocol}://${req.get('host')}/my-tours/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data:{
            unit_amount: tour.price * 100,
            currency: 'usd',
            product_data:{
                name: `${tour.name} Tour`,
                description: tour.summary,
                images: [`https://127.0.0.1:3000/img/tours/${tour.imageCover}`],
            },
        },
        quantity: 1,
      }
    ]
  });

  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
    // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
    const { tour, user, price } = req.query;
  
    if (!tour && !user && !price) return next();
    await Booking.create({ tour, user, price });
  
    res.redirect(req.originalUrl.split('?')[0]);
  });
  
exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);