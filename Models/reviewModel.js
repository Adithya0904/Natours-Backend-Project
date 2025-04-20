const mongoose=require('mongoose')
const Tour=require('D:\\Backend\\4-natours\\starter\\Models\\tourModel.js')

const reviewSchema=new mongoose.Schema({
    review:{
        type:String,
        required: [true,'Review cannot be empty!!']
    },
    rating:{
        type:Number,
        min:1,
        max:5
    },
    createdAt:{
        type:Date,
        default:Date.now()
    },
    tour:{
        type:mongoose.Schema.ObjectId,
        ref:"Tour",
        // required:[true,'Review must belong to a tour!!']
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        // required:[true,'Review must belong to a user!!']
    }
},
{
    toJSON:{virtuals:true},
    toObject:{virtuals:true}
})

// this indexing is done to make sure that for each tour a user can give a single review
reviewSchema.index({tour:1, user: 1},{unique: true})

reviewSchema.pre(/^find/,function(next){
    this.populate({
        path:'user',
        select:"-__v -email -role"
    })
    next()
})

reviewSchema.statics.calcAverageRatings=async function(tourId){
    const stats=await this.aggregate([
        {
            $match:{tour:tourId}
        },
        {
            $group:{
                _id:'$tour',
                nRatings:{$sum: 1},
                avgRatings:{$avg:'$rating'}
            }
        }
    ])
    // [ { _id: 67553244a0998f020cda73ce, nRatings: 1, avgRatings: 4 } ]
   if(stats.length>0){
    await Tour.findByIdAndUpdate(tourId,{
        ratingsQuantity: stats[0].nRatings,
        ratingsAverage: stats[0].avgRatings
       })
   }else{
    await Tour.findByIdAndUpdate(tourId,{
        ratingsQuantity: 0,
        ratingsAverage: 0
       })
   }
}

//This middleware is used to find the stats of ratingsAverage 
reviewSchema.post('save',function(){
    /* this.constructor is used to call the model
    (ie. its like calling Review.calAverageRatings from reviewControler)*/
    this.constructor.calcAverageRatings(this.tour)
})

/*Pre-hook: Fetches the document being modified
 (e.g., updated or deleted) using findOne() before the operation executes and logs it.*/
reviewSchema.pre(/^findOneAnd/,async function(next){
    this.r=await this.findOne()
    console.log(this.r)
    next()
})

/*Post-hook: After the operation,
 it recalculates average ratings for the associated tour using a static method 
 calcAverageRatings on the model.*/
reviewSchema.post(/^findOneAnd/,async function(){
    await this.r.constructor.calcAverageRatings(this.r.tour)
})

const Review=mongoose.model('Review',reviewSchema)

module.exports=Review