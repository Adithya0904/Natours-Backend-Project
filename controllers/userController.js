const User=require('D:\\Backend\\4-natours\\starter\\Models\\userModel.js')
const multer = require('multer');
const sharp = require('sharp');
const catchAsync=require('D:\\Backend\\4-natours\\starter\\utils\\catchAsync.js')
const AppError=require('D:\\Backend\\4-natours\\starter\\utils\\appError.js')
const factory=require('D:\\Backend\\4-natours\\starter\\controllers\\handlerFactory.js')
const Users = require('D:\\Backend\\4-natours\\starter\\Models\\userModel.js')

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users');
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1];
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//     }
// });

const multerStorage = multer.memoryStorage()

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

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

    next();
});

exports.uploadUserPhoto = upload.single('photo');

const filteredobj=(body,...allowedfields)=>{
    const newobj={}
    Object.keys(body).forEach(ele=>{
        if (allowedfields.includes(ele)){
            newobj[ele]=body[ele]
        }
    })
    return newobj
}

exports.getUsers=factory.getAll(User)

exports.getme=(req,res,next)=>{
    req.params.id=req.user.id
    next()
}

exports.updateUserData=catchAsync(async(req,res,next)=>{
    // console.log(req.file)
    const filteredbody=filteredobj(req.body,'name')
    if (req.file) filteredbody.photo=req.file.filename
    const updateData=await User.findByIdAndUpdate(req.user.id,filteredbody,{
        new: true,
        runValidators: true
    })

    res.status(200).json({
        ststus: "success",
        data: updateData
    })
})

exports.deleteUser=catchAsync(async(req,res,wait)=>{
    const deleteuser=await User.findByIdAndUpdate(req.user.id,{active: false})

    res.status(204).json({
        status:"success",
        message: "User successfully deleted!!"
    })
})

exports.getUser=factory.getOne(User)
exports.updateUser=factory.updateOne(User)
exports.delUser=factory.deleteOne(User)