const fs=require('fs')
const Tour=require('D:\\Backend\\4-natours\\starter\\Models\\tourModel.js')

exports.aliasTopTour=(req,res,next)=>{
    req.query.limit='5',
    req.query.sort='-ratingsAverage,price',
    req.query.fields='name,price,ratingsAverage,summary,difficulty'
    next()
}


exports.getAllTours= async (req,res)=>{
    try{
    //BUILD A QUERY

    // 1) Filtering 

    let queryObject={...req.query}
    const excludekeys=['page','sort','limit','fields']
    excludekeys.forEach(ele=>delete queryObject[ele])
    console.log(queryObject)
    
    
    // 2) Advanced Filtering

    let querystr=JSON.stringify(queryObject)
    console.log(querystr)
    querystr=querystr.replace(/\b(gte|gt|lt|lte)\b/g,match=>`$${match}`)
    console.log(querystr)
    queryObject=JSON.parse(querystr)
    console.log(querystr)
    let query=Tour.find(queryObject)
    
    // 3) Sort 
 
    if(req.query.sort){
        let querySort=req.query.sort.split(',').join(' ')
        console.log(querySort)
        query=query.sort(querySort)
    }

    // if(query=={}){
    //     query=Tour.find()
    // }

    //4) Limited Fields Selection

    if(req.query.fields){
        const fields=req.query.fields.split(',').join(" ")
        query=query.select(fields)
    }else{
        //THIS QUERY HERE EXCLUDES THE OBJECT __v
        query=query.select('-__v')
    }

    //5) Pagination
    
    const page=req.query.page*1||1
    console.log(page)
    const limits=req.query.limit*1||100
    console.log(limits)
    const skips=(page-1)*limits
    console.log(skips)

    //if page=3 and limit=10, then skip=20 documents to move to page 3
    query=query.skip(skips).limit(limits)

    if(req.query.page){
        const numTours=await Tour.countDocuments()
        if(skips>=numTours){
            throw new Error("THIS PAGE DOES NOT EXIST!!")
        }
    }
    
    //EXECUTE A QUERY
    const tours=await query
    // const tours= await Tour.find()
    res.status(200).json({
        status:'success',
        requested:req.requestTime,
        result:tours.length,
        data:{
            tours
        }
    })
    }catch(err){
        res.status(404).json({
            status:"failed",
            message:err
        })
    }
}

exports.getTour=async (req,res)=>{
    try{
    const tour=await Tour.findById(req.params.id)
    res.status(200).json({
        status:'success',
        data:{
            tour
        }
    })
    }catch(err){
        res.status(404).json({
            status:"failed",
            message:err
        })
    }
}

exports.createTour= async (req,res)=>{
    // console.log(req.body)
    try{
    const newTour=await Tour.create(req.body)
    res.status(200).json({
            status:'success',
            data:{newTour}
        })
    }catch(err){
        res.status(400).json({
            status:'failed',
            message: err
        })
    }
}

exports.updateTour=async (req,res)=>{
    try{
    const tour=await Tour.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true
    })
    res.status(200).json({
        status:"success",
        data:{
            tour
        }
    })
    }catch(err){
        res.status(200).json({
            status:"failed",
            message:err
        })
    }
}

exports.delTour=async (req,res)=>{
  
    try{
        await Tour.findByIdAndDelete(req.params.id)
        res.status(200).json({
            status:"success",
            message:"Data Deleted!!"
        })
        }catch(err){
            res.status(200).json({
                status:"failed",
                message:err
            })
        }
}