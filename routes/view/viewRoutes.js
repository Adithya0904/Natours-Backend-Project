const express=require('express')
const router=express.Router()
const viewController=require('D:\\Backend\\4-natours\\starter\\controllers\\viewController.js')
const authController=require('D:\\Backend\\4-natours\\starter\\controllers\\authController.js')
const bookingController = require('D:\\Backend\\4-natours\\starter\\controllers\\bookingController.js');


router.get('/',authController.isLoggedIn,viewController.getOverview)

router.get('/tour/:slug',authController.isLoggedIn,viewController.getTour)

router.get('/login',viewController.getLoginForm)

router.get('/me',authController.protect,viewController.getAccount)

router.post('/submit-user-data',authController.protect,viewController.updateUserData)

router.get(
    '/my-tours',
    bookingController.createBookingCheckout,
    authController.protect,
    viewController.getMyTours
  );

module.exports=router