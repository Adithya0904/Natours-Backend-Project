const AppError = require('../utils/appError')
const Review=require('D:\\Backend\\4-natours\\starter\\Models\\reviewModel.js')
const factory=require('D:\\Backend\\4-natours\\starter\\controllers\\handlerFactory.js')

exports.getAllReviews=factory.getAll(Review)

exports.getReview=factory.getOne(Review)

exports.setTourUserIds=(req,res,next)=>{
    if(!req.body.tour) req.body.tour=req.params.tourId
    if(!req.body.user) req.body.user=req.user.id
    next()
}

exports.createReview=factory.createOne(Review)

exports.updateReview=factory.updateOne(Review)

exports.deleteReview=factory.deleteOne(Review)