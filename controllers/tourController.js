const multer = require('multer');
const sharp = require('sharp');
const fs=require('fs')
const Tour=require('D:\\Backend\\4-natours\\starter\\Models\\tourModel.js')
const { group } = require('console')
const catchAsync=require('D:\\Backend\\4-natours\\starter\\utils\\catchAsync.js')
const AppError = require('../utils/appError')
const factory=require('D:\\Backend\\4-natours\\starter\\controllers\\handlerFactory.js')

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images.', 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter
});

exports.uploadTourImages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 }
]);

exports.resizeTourImages=async(req,res,next)=>{
    // console.log(req.files)
    if (!req.files.imageCover || !req.files.images) return next();

    // 1) Cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333)
      .toFormat('jpeg')
      .jpeg({ quality: 90 })
      .toFile(`public/img/tours/${req.body.imageCover}`);

    // 2) Images
    req.body.images = [];

    await Promise.all(
        req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({ quality: 90 })
            .toFile(`public/img/tours/${filename}`);

        req.body.images.push(filename);
        })
    );

    next()
}

exports.aliasTopTour=(req,res,next)=>{
    req.query.limit='5',
    req.query.sort='-ratingsAverage,price',
    req.query.fields='name,price,ratingsAverage,summary,difficulty'
    next()
}

exports.getAllTours=factory.getAll(Tour) 

exports.getTour=factory.getOne(Tour,"reviews")

exports.createTour= factory.createOne(Tour)

exports.updateTour=factory.updateOne(Tour)

exports.delTour=factory.deleteOne(Tour)

exports.getTourStats=catchAsync(async (req,res)=>{
    const stats=await Tour.aggregate([
        {
            $match:{ratingsAverage:{$gte:4.5}}
        },
        {
            $group:{
                _id:"$difficulty",
                numTour:{$sum:1},
                totalQuantities:{$sum:"$ratingsQuantity"},
                averageRatings:{$avg:"$ratingsAverage"},
                avgPrice:{$avg:"$price"},
                minPrice:{$min:"$price"},
                maxPrice:{$max:"$price"},
            }
        },
        {
            $sort:{avgPrice:-1}
        },
        // {
        //     $match:{_id:{$ne:'easy'}}
        // }
    ])
    res.status(200).json({
        status:"success",
        data:{
            stats
        }
    })

})

exports.getMonthlyPlan=catchAsync(async (req,res)=>{
    const year=req.params.year*1

        const plan=await Tour.aggregate([
            {
                $unwind:'$startDates'
            },
            {
                $match:{
                    startDates:{
                        $gte: new Date(`${year}-01-01`),
                        $lte: new Date(`${year}-12-31`)
                    }
                }
            },
            {
                $group:{
                    _id:{$month:'$startDates'},
                    numTourStarts:{$sum:1},
                    tours:{$push:'$name'}
                }
            },
            {
                $addFields:{month:'$_id'}
            },
            {
                $sort:{numTourStarts:-1}
            },
            {
                $limit:5
            },
            {
                $project:{
                    _id:0
                }
            }
        ])
        res.status(200).json({
            status:"success",
            data:{
                plan
            }
        })
})

exports.getToursWithin=catchAsync(async(req,res,next)=>{
    const {distance,latlng,unit}= req.params
    const [lat,lng]=latlng.split(',')

    if(!lat && !lng){
        next(new AppError("Please provide latitude and longitude in the format lat,lng!!",400))
    }
    //to find the radius we have to dicide distance with radius of the earth!!
    const radius=unit==="km" ? distance/6378.1 : distance/3963.2 

    const tours=await Tour.find({
        startLocation:{
            $geoWithin:{
                $centerSphere:[[lng,lat],radius]}}})

    res.status(200).json({
        status:"success",
        ntours:tours.length,
        data:{
            data:tours
        }
    })
})

exports.getTourDistance=catchAsync(async(req,res,next)=>{
    const {latlng,unit}= req.params
    const [lat,lng]=latlng.split(',')

    const multiplier=unit==='km'? 0.001 : 0.000621371
    if(!lat && !lng){
        next(new AppError("Please provide latitude and longitude in the format lat,lng!!",400))
    }
   
    const distances=await Tour.aggregate([
        {
            $geoNear:
            {
                near:
                {
                    type: 'Point',
                    coordinates: [lng*1 , lat*1]
                },
                distanceField: 'distance',
                distanceMultiplier:multiplier
            }
        },
        {
            $project:
            {
                distance: 1,
                name: 1
            }
        }
])

    res.status(200).json({
        status:"success",
        ntours:distances.length,
        data:{
            data:distances
        }
    })
})