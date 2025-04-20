const catchAsync=require('D:\\Backend\\4-natours\\starter\\utils\\catchAsync.js')
const AppError=require('D:\\Backend\\4-natours\\starter\\utils\\appError.js')
const Tour=require('D:\\Backend\\4-natours\\starter\\Models\\tourModel.js')
const User=require('D:\\Backend\\4-natours\\starter\\Models\\userModel.js')
const Booking=require('D:\\Backend\\4-natours\\starter\\Models\\bookingModel.js')

exports.getOverview=catchAsync(async(req,res,next)=>{
    // 1. Get tour data from collection
    const tours=await Tour.find()

    // 2. Build template

    // 3. Render the template using tour data from 1.
    res.status(200).render('overview',{
        title:"All Tours",
        tours
    })
})

exports.getTour=catchAsync(async(req,res,next)=>{
    const tour=await Tour.findOne({slug:req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user'
    })

    if(!tour){
        return next(new AppError("There is no tour with that name",404))
    }

    res.status(200).render('tour',{
        title: `${tour.name}`,
        tour
    })
})

exports.getLoginForm=catchAsync(async(req,res)=>{
    // const user=await 
    res.status(200).render('login',{
        title:"Log into your account"
    })
})

exports.getAccount=(req,res)=>{
    res.status(200).render('account',{
        title:"Your account"
    })
}

exports.updateUserData=catchAsync(async(req,res,next)=>{
    console.log(req.body)
    const Updateuser=await User.findByIdAndUpdate(req.user.id,{
        name:req.body.name,
        email:req.body.email
    },{
        new:true,
        runValidator:true
    })
    res.status(200).render('account',{
        title:"Your account",
        // Rendering the updated user in the page!!
        user:Updateuser
    })
})

exports.getMyTours = catchAsync(async (req, res, next) => {
    // 1) Find all bookings
    const bookings = await Booking.find({ user: req.user.id });
  
    // 2) Find tours with the returned IDs
    const tourIDs = bookings.map(el => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });
  
    res.status(200).render('overview', {
      title: 'My Tours',
      tours
    });
  });