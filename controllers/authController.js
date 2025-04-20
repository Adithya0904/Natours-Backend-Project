const crypto=require('crypto')
const {promisify}=require('util')
const jwt=require('jsonwebtoken')
const User=require('D:\\Backend\\4-natours\\starter\\Models\\userModel.js')
const catchAsync=require('D:\\Backend\\4-natours\\starter\\utils\\catchAsync.js')
const AppError=require('D:\\Backend\\4-natours\\starter\\utils\\appError.js')
const SendEmail=require('D:\\Backend\\4-natours\\starter\\utils\\email.js')
const { token } = require('morgan')
const sendEmail = require('../utils/email')
const Email = require('../utils/email')
// const cookie=require('cookie')


const signtoken=(user)=>{
    return jwt.sign({ id:user._id },process.env.JWT_SECRET,{ 
        expiresIn: process.env.JWT_EXPIRE
    })
}

const createSendToken=(user,statusCode, res)=>{
    const token=signtoken(user)

    const cookieoption={
        expires: new Date(
            Date.now()+ 90 *24*60*60*1000
        ),
        httpOnly: true
    }
    
    if (process.env.NODE_ENV!="developement") cookieoption.secure=true
    res.cookie('jwt',token,cookieoption)

    res.status(statusCode).json({
        status:"success",
        token,
        data:{
            user
        }
    })
}

exports.signup=catchAsync(async(req,res,next)=>{

    const newuser=await User.create({
        name:req.body.name,
        email:req.body.email,
        password:req.body.password,
        confirmPassword:req.body.confirm_password,
        role:req.body.role,
        changedPassword:req.body.changed_password
    })

    const url=`${req.protocol}://${req.get("host")}/me`
    await new Email(newuser,url).sendWelcome()

    // const token=signtoken(newuser)
    createSendToken(newuser,201,res)
    // res.status(201).json({
    //     status:'success',
    //     token,
    //     data:{
    //         user:newuser
    //     }
    // })
})

exports.login=catchAsync(async(req,res,next)=>{
    email=req.body.email,
    password=req.body.password

    //1) check if user email and password exists
    if(!email || !password){
        return next(new AppError('A user should provide a email and a password!!',400))
    }

    //2) check if users exists and password is correct
    const user= await User.findOne({
        email:email,
    }).select('+password') //EXPLICITLY SELECT PASSWORD FROM DATABASE

    //here in the code .correctPassword is an instance function located in userModel!!
    if(!user || !(await user.correctPassword(password,user.password))){
        return next(new AppError("Incorrect email or password!!",400))
    }
    
    // console.log(user)

    // const token=signtoken(user)
    createSendToken(user,200,res)
    // res.status(200).json({
    //     status:'success',
    //     token
    // })

})

exports.protect=catchAsync(async(req,res,next)=>{
    // 1. Getting token and check if its there
        let token
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token=req.headers.authorization.split(" ")[1]
        }else if(req.cookies.jwt){
            token=req.cookies.jwt
        }
        if(!token){
            return next(new AppError("You are not logged in! Please log in to get access!!",401))
        }
    // 2. Verification token
        const decoded= await promisify(jwt.verify)(token,process.env.JWT_SECRET)
        //checks if token is valid and also checks if token has not expired!!

        // console.log(decoded)

    // 3. Check if user still exists
        const currentUser=await User.findById(decoded.id)
        if(!currentUser){
            next(new AppError("The user belonging to the token dosent exist!!",401))
        }
    // 4. Check if user changed password after the token was issued
        if(currentUser.changedPasswordAfterTime(decoded.iat)){
            next(new AppError("Your password has recently changed!Please LOGIN again!!"))
        }    

    req.user=currentUser
    res.locals.user=currentUser
    next()
})

exports.loggOut=(req,res)=>{
    res.cookie("jwt","loggout",{
        expires:new Date(Date.now()+1*1000),
        httpOnly:true
    })
    res.status(200).json({status:"success"})
}

exports.isLoggedIn=(async(req,res,next)=>{
    if(req.cookies.jwt){
            try{
                const decoded= await promisify(jwt.verify)(req.cookies.jwt,process.env.JWT_SECRET)
                // console.log(decoded)

                // 3. Check if user still exists
                const currentUser=await User.findById(decoded.id)
                if(!currentUser){
                    res.redirect('/login')
                }
                // 4. Check if user changed password after the token was issued
                if(currentUser.changedPasswordAfterTime(decoded.iat)){
                    res.redirect('/login')
                }    
                res.locals.user=currentUser //This line will make sure that the userdata is available for the templates(pug)
                return next()
            }catch(err){
                return next()
            }
    }
    res.redirect('/login')
})

//restrict middleware is used to restrict the common users from deleting any tours!!
//Permission GRANTED only for ADMIN!!
exports.restrict=(...roles)=>{
    return(req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return next(new AppError("You do not have permission to perform this action!!",403))
        }
        next()
    }

}

//FORGOT PASSWORD AND RESET PASSWORD

exports.forgotPassword=catchAsync(async(req,res,next)=>{
    //1. Get user based on posted email
    const user=await User.findOne({email:req.body.email})
    if(!user){
        return next(new AppError('There is no user with email address!!',404))
    }

    //2. Generate the random reset token
    const resetToken=user.createPasswordResetToken();
    await user.save()

    const resetURL=`${req.protocol}://${req.get('host')}/api/v1/user/resetpassword/${resetToken}`

    // console.log(resetURL)

    // const message=`Forgot password? Submit a patch request with your new password
    //                 and passwordConfirm to:${resetURL}.\n 
    //                 If you didn'n forgot the password then please ignore the email!!`
    try{
        await new Email(user,resetURL).sendPasswordReset()
        // await sendEmail({
        //     email:user.email,
        //     subject:"Your password reset token(Valid for 10 min)",
        //     message
        // })
    
        res.status(200).json({
            status:"success",
            message:"Token sent to email!!"
        })
    } catch(err){
        user.passwordResetToken=undefined
        user.passwordResetExpire=undefined
        await user.save()

        return next(new AppError("Error occured during sending the email!!",500))
    }
    
})

exports.resetPassword=catchAsync(async(req,res,next)=>{
    // 1. Get user based on the token
    const hashedToken=crypto.createHash('sha256').update(req.params.token).digest('hex')
    console.log(req.params.token)
    console.log(hashedToken)

    // 2. If token has not expired, and there is user, set the new password
        const user=await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpire: {$gt:Date.now()}
        })

        console.log(user)

        if(!user){
            return next(new AppError("Token not found or has expired!!",400))
        }

        user.password=req.body.password
        user.confirm_password=req.body.confirm_password
        user.passwordResetToken=undefined
        user.passwordResetExpire=undefined
        await user.save()

    // 3. Update chagedpassword property for the user
    // 4. Log the user in, send JWT
        // const token=signtoken(user)
        createSendToken(user,200,res)
        // res.status(200).json({
        //     status:'success',
        //     token
        // })
})

exports.updatePassword=catchAsync(async (req,res,next)=>{
        password=req.body.password
    // 1. Get User from the collection

        // const user= await User.findOne({
        //     email: req.body.email,
        // }).select('+password')

        const user=await User.findById(req.user.id).select('+password')
        
    // 2. Check if Posted current password is correct
        if(!(await user.correctPassword(password,user.password))){
            return next(new AppError("Incorrect user password!!",400))
        }

    // 3. if so, update password
        user.password=req.body.newpassword
        user.confirm_password=req.body.confirm_newpassword
        await user.save()
    // 4. log user in, send JWT
        // const token=signtoken(user)
        createSendToken(user,200,res)
        // res.status(200).json({
        //     status:'success',
        //     token
        // })
})