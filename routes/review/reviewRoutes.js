const express=require('express')
const reviewController=require('D:\\Backend\\4-natours\\starter\\controllers\\reviewController.js')
const authController=require('D:\\Backend\\4-natours\\starter\\controllers\\authController.js')
const router=express.Router({mergeParams:true})

router.use(authController.protect)

router
.route('/')
.get(reviewController.getAllReviews)
.post(reviewController.setTourUserIds,reviewController.createReview)

router
.route("/:id")
.get(reviewController.getReview)
.patch(authController.restrict("user","admin"),reviewController.updateReview)
.delete(authController.restrict("admin","user"),reviewController.deleteReview)

module.exports=router