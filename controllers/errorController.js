const AppError=require('D:\\Backend\\4-natours\\starter\\utils\\apifeatures.js')

const handleCastErrorDB=(err)=>{
    message=`The input ${err.path} : ${err.value}!!`
    console.log(message)
    return new AppError(message,400)
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    console.log(value);
  
const message = `Duplicate field value: ${value}. Please use another value!`;
return new AppError(message, 400);
};

const handleValidationErrorDB = err => {
const errors = Object.values(err.errors).map(el => el.message);

const message = `Invalid input data. ${errors.join('. ')}`;
return new AppError(message, 400);
};

const handleJWTError = () =>
new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
new AppError('Your token has expired! Please log in again.', 401);


const sendDevErr=(err,req,res)=>{
    //API
    if(req.originalUrl.startsWith('/api')){
        res.status(err.statuscode).json({
            status:err.status,
            error:err,
            message:err.message,
            stack:err.stack
        })
    }else{
        //
        res.status(err.statusCode).render('error',{
            title: "Something went wrong!",
            msg: err.message
        })
    }

}

const sendProErr=(err,res)=>{

    if(err.isOperational){
        res.status(err.statusCode).json({
            status:err.status,
            message:err.message
        })
    }
    else{
        res.status(500).json({
            status:'error',
            message:'SOMETHING WENT WRONG'
        })
    }
}



module.exports=((err,req,res,next)=>{
    err.statuscode=err.statuscode||500
    err.status=err.status||'error'

    if(process.env.NODE_ENV==="development"){
        sendDevErr(err,req,res)
    }
    else if(process.env.NODE_ENV==="production"){
        // console.log(err.name)
        let error={
            message: err.message,
            name: err.name,
            stack: err.stack,
            path:err.path,
            value:err.value,
            ...err
        }
        console.log(error.name)
        if (error.name === 'CastError') error = handleCastErrorDB(error);
        if (error.code === 11000) error = handleDuplicateFieldsDB(error);
        if (error.name === 'ValidationError')
        error = handleValidationErrorDB(error);
        if (error.name === 'JsonWebTokenError') error = handleJWTError();
        if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

        sendErrorProd(error, res);
    }
    
    
})