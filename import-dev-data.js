const fs=require('fs')
const detenv=require('dotenv')
const mongoose=require('mongoose')
detenv.config({path: './config.env'})
const tours=JSON.parse(fs.readFileSync('D:\\Backend\\4-natours\\starter\\dev-data\\data\\tours.json','utf-8'))
const users=JSON.parse(fs.readFileSync('D:\\Backend\\4-natours\\starter\\dev-data\\data\\users.json','utf-8'))
const reviews=JSON.parse(fs.readFileSync('D:\\Backend\\4-natours\\starter\\dev-data\\data\\reviews.json','utf-8'))
const Tour=require('D:\\Backend\\4-natours\\starter\\Models\\tourModel.js')
const User=require('D:\\Backend\\4-natours\\starter\\Models\\userModel.js')
const Review=require('D:\\Backend\\4-natours\\starter\\Models\\reviewModel.js')

const DB=process.env.DATABASE

//CONNECTING DATABASE
mongoose.connect(DB,{
    useNewUrlParser:true,
    useCreateIndex:true,
    useFindAndModify:false
}).then(()=> console.log('DB connection successfully'))

const importData=async()=>{
    try{
        await Tour.create(tours)
        await User.create(users,{ validateBeforeSave: false})
        await Review.create(reviews)
        console.log("DATA CREATED SUCCESSFULLY")
    }catch(err){
        console.log(err)
    }
    process.exit()
}
const deleteData=async()=>{
    try{
        await Tour.deleteMany()
        await User.deleteMany()
        await Review.deleteMany()
        console.log("DATA DELETED SUCCESSFULLY")
        process.exit()
    }catch(err){
        console.log(err)
    }
}

console.log(process.argv)

if(process.argv[2]=='--delete'){
    deleteData()
}else{
    importData()
}