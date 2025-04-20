const catchAsync=require('D:\\Backend\\4-natours\\starter\\utils\\catchAsync.js')
const AppError = require('../utils/appError')
const ApiFeatures=require('D:\\Backend\\4-natours\\starter\\utils\\apifeatures.js')

exports.createOne=(Model)=>
    catchAsync(async (req,res)=>{
    const newDoc=await Model.create(req.body)
    res.status(200).json({
            status:'success',
            data:{newDoc}
        })
})

exports.getAll=(Model)=>
    catchAsync(async (req,res)=>{
        let filter={}
        //Nested Routes!!
        if(req.params.tourId) filter={tour:req.params.tourId}
        //EXECUTE A QUERY
        const features=new ApiFeatures(Model.find(filter),req.query)
                            .filter()
                            .sort()
                            .limitFields()
                            .pagination()
        
        const doc=await features.query
    
        // const tours= await Tour.find()
        res.status(200).json({
            status:'success',
            requested:req.requestTime,
            result:doc.length,
            data:{
                doc
            }
        })
    })

exports.getOne=(Model,Populate)=>
    catchAsync(async (req,res,next)=>{
        let query=Model.findById(req.params.id)
        if(Populate) query=Model.findById(req.params.id).populate(Populate)
        const doc=await query

        if (!doc){
            return next(new AppError('No doc with that id',404))
        }
        res.status(200).json({
            status:'success',
            data:{
                doc
            }
        })
    })

exports.updateOne=(Model)=>
    catchAsync(async (req,res,next)=>{
        const doc=await Model.findByIdAndUpdate(req.params.id,req.body,{
            new:true,
            runValidators:true
        })

        if (!doc){
            return next(new AppError('No doc with that id',404))
        }
    
        res.status(200).json({
            status:"success",
            data:{
                doc
            }
        })
    })

exports.deleteOne=(Model)=>
    catchAsync(async (req,res,next)=>{
    
    const doc=await Model.findByIdAndDelete(req.params.id)
    if (!doc){
        return next(new AppError('No document with that id',404))
    }
        res.status(200).json({
            status:"success",
            message:"Data Deleted!!"
        })
})