const helmet=require('helmet')
const express=require('express')
const morgan=require('morgan')
const rateLimit=require('express-rate-limit')
const mongoSanitize=require('express-mongo-sanitize')
const xss=require('xss-clean')
const hpp=require('hpp')
const cookieparser=require("cookie-parser")

const errorController=require('D:\\Backend\\4-natours\\starter\\controllers\\errorController.js')
// const AppError=require('D:\\Backend\\4-natours\\starter\\utils\\apifeatures.js')
const viewRouter=require('./routes/view/viewRoutes')
const tourRouter=require('./routes/tour/tourRoutes')
const userRouter=require('./routes/user/userRoutes')
const reviewRouter=require('./routes/review/reviewRoutes')
const AppError = require('./utils/appError')
const path=require('path')
const { title } = require('process')
const bookingRouter = require('./routes/booking/bookingRoutes');
const bookingController = require('./controllers/bookingController');
//Express here is a function which upon calling will add a bunch of methods to the const app variable.
const app=express()

// This tells Express to use pug as the view engine
app.set('view engine', 'pug')
// This specifies the directory where your Pug templates are stored
app.set('views', path.join(__dirname,'views'))

//STATIC
app.use(express.static(path.join(__dirname,'public')))

// 1] GLOBAL MIDDLEWARE 

//SET SECURITY HTTP HEADERS
app.use(helmet.contentSecurityPolicy({
    directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://cdnjs.cloudflare.com", "https://js.stripe.com/v3/"],
        connectSrc: ["'self'", "ws://127.0.0.1:*"],
        frameSrc: ["'self'", "https://js.stripe.com"],
        // Add other directives as needed
    },
}));

//DEVELOPMENT LOGGING
app.use(morgan('dev'))

const limiter=rateLimit({
    max:100,
    windowAlgo: 60*60*1000 /*This means a user can make 100 requests in an Hour.
    If he exceeds that then he have to wait for an hour*/,
    message:" Too many request from this IP, please try again in an hour"
})

//RATE LIMITER MIDDLEWARE!!!!!
app.use("/api",limiter)

//BODY PARSING, READING DATA FROM THE BODY INTO req.body
app.use(express.json())
//This middleware is essential for handling form submissions and other URL-encoded data.
app.use(express.urlencoded({extended:true,limit:'10kb'}))
app.use(cookieparser())

//SANITIZATION!!
app.use(mongoSanitize())
app.use(xss())
app.use(hpp({
    whitelist: [
        'duration','ratingsQuantity','ratingsAverage','maxGroupSize','difficulty','price'
    ]
}))

app.use((req,res,next)=>{
    req.requestTime= new Date().toISOString()
    // console.log(req.cookies)
    next()
})

//ROUTE MIDDLEWARE

app.use('/',viewRouter)
app.use('/api/v1/tours',tourRouter)
app.use('/api/v1/users',userRouter)
app.use('/api/v1/review',reviewRouter)
app.use('/api/v1/bookings', bookingRouter);

app.use('*',(req,res,next)=>{
    next(new AppError(`Cant find ${req.originalUrl} on this server.`,404))
})

app.use(errorController)


module.exports=app
