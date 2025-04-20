const express=require('express')
const tourController=require('D:\\Backend\\4-natours\\starter\\controllers\\tourController.js')
const authController=require('D:\\Backend\\4-natours\\starter\\controllers\\authController.js')
const reviewRouter=require("D:\\Backend\\4-natours\\starter\\routes\\review\\reviewRoutes.js")
const router=express.Router()

// router.param('id',tourController.checkid)

router.use('/:tourId/review',reviewRouter)

//handelling multiple middleware
router
.route('/top-5-tours')
.get(tourController.aliasTopTour,tourController.getAllTours)

router.route("/tour-stats").get(tourController.getTourStats)
router.route("/tour-date/:year").get(authController.protect,authController.restrict("admin","lead-guide"),tourController.getMonthlyPlan)

//GeoSpacial Route
router.route('/tours-within/:distance/center/:latlng/unit/:unit').get(tourController.getToursWithin)
router.route('/distance/:latlng/unit/:unit').get(tourController.getTourDistance)

router
.route('/')
.get(tourController.getAllTours)
.post(authController.protect,authController.restrict("admin","lead-guide"),tourController.createTour)

router
.route('/:id')
.get(tourController.getTour)
.patch(
    authController.protect,
    authController.restrict("admin","lead-guide"),
    tourController.uploadTourImages,
    tourController.resizeTourImages,
    tourController.updateTour
)
.delete(authController.protect,authController.restrict("admin","lead-guide"),tourController.delTour)

module.exports=router;