const mongoose=require('mongoose')
const slugify=require('slugify')
const validator=require('validator')
const User=require('D:\\Backend\\4-natours\\starter\\Models\\userModel.js')

//Specifing the Data of the DataBase
const tourSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true, " A tour must have a name!!"],
        unique:true,
        trim:true,
        maxlength:[40,"A Tour Name must have less or equal 40 charecters"],
        minlength:[10,"A Tour Name must have greater or equal 10 charecters"],
        // validate:[validator.isAlpha,"Tour name must only contain characters"]
    },
    duration:{
        type:Number,
        required:[true, " A tour must have a durations!!"]
    },
    maxGroupSize:{
        type:Number,
        required:[true, " A tour must have a maxGroupSize!!"]
    },
    difficulty:{
        type:String,
        required:[true, " A tour must have a difficulty!!"],
        enum:{
            values:['easy','medium','difficult','ultra'],
            message:'Difficulty is either:easy,medium, difficult or ultra'
        }
    },
    ratingsAverage:{
        type:Number,
        default:4.5,
        min:[1," Review should be grater or equal to 1"],
        max:[5," Review should be less or equal to 5"],
        set: val=>Math.round(val*10)/10
    },
    ratingsQuantity:{
        type:Number,
        default:0
    },
    price:{
        type:Number,
        required:[true, " A tour must have a price!!"]
    },
    priceDiscount: {
        type: Number,
        //USER DEFINED FUNCTION
        validate: {
            validator: function(val) {
                // `this` refers to the current document
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be less than the regular price'
        }
    },
    summary:{
        type:String,
        trim:true,
        required:[true, " A tour must have a summary!!"]
    },
    description:{
        type:String,
        trim:true,
    },
    imageCover:{
        type:String,
        required:[true, " A tour must have a cover image!!"]
    },
    slug:String,
    images:[String],
    createdAt:{
        type:Date,
        default:Date.now(),
        //TO HIDE THE SENSETIVE DATA WE USE SELECT=false
        select:false
    },
    startDates:[Date],
    secret:{
        type:Boolean,
        default:false
    },

// The `startLocation` schema defines the starting location of a route or event.
// Fields:
/*- `type`: Specifies the geometry type of the location, 
defaulting to "Point" and restricted to only "Point" using `enum`.*/
    startLocation:{
        type:{
            type: String,
            default: "Point",
            enum: ['Point']
        },
        coordinates:[Number],
        address: String,
        description: String
    },
// The `locations` schema defines a list of locations along a route or journey.
// Each location object includes:
/* - `type`: Specifies the geometry type of the location, 
defaulting to "Point" and restricted to only "Point" using `enum`.*/
    locations:[
        {
            type:{
                type: String,
                default: "Point",
                enum: ['Point']
            },
            coordinates:[Number],
            address: String,
            description: String,
            day:Number

        }
    ],
    guides:[{
        type:mongoose.Schema.ObjectId,
        ref: "User"
    }]
},
    {
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    }
)

//INDEXATION: To improve performance and to Saveup memory usage!!
tourSchema.index({price: 1, ratingsAverage: -1})
tourSchema.index({slug: 1})
tourSchema.index({startLocation: '2dsphere'})

//MONGOOSE MIDDLEWARE 
//this bellow middleware only works for .save() and .create()
tourSchema.pre('save',function(next){
    this.slug=slugify(this.name,{lower:true})
    next()
})

//VIRTUAL 
tourSchema.virtual('durationWeeks').get(function() {
    return this.duration / 7;
});

tourSchema.virtual('reviews',{
    ref:'Review',
    foreignField:'tour',
    localField:'_id'
})

tourSchema.pre(/^find/,function(next){
    this.populate({
        path:'guides',
        select:"-__v"
    })
    next()
})

//EMBEDDED METHOD
// tourSchema.pre('save',async function(next){
//     const guidesPromise=this.guides.map(async id=>await User.findById(id))
//     this.guides=await Promise.all(guidesPromise)
//     next()
// })

//ALL THE STRINGS THAT STARTS WITH FIND: ^find
tourSchema.pre(/^find/,function(next){
    this.find({secret:{$ne:true}})
    this.start=Date.now()
    next()
})
tourSchema.post(/^find/,function(doc,next){
    console.log(`Query took ${Date.now()-this.start} millisecond to get execute!!`)
    next()
})

//AGGREGATION MIDDLEWARE
// tourSchema.pre('aggregate',function(next){
//     this.pipeline().unshift({$match:{secret:{$ne:true}}})
//     next()
// })

//Creating DataBase Model
const Tour=mongoose.model('Tour',tourSchema)

module.exports=Tour