const detenv=require('dotenv')
const mongoose=require('mongoose')

process.on('uncaughtException',err=>{
    console.log(err)
    console.log('UNCAUGHT EXCEPTION!!')
    process.exit(1)
})

detenv.config({path: './config.env'})

const app=require('./app')

const DB=process.env.DATABASE

//CONNECTING DATABASE
mongoose.connect(DB,{
    useNewUrlParser:true,
    // useCreateIndex:true,
    // useFindAndModify:false,
    useUnifiedTopology: true,
}).then(()=> console.log('DB connection successfully'))

mongoose.set('strictQuery', true); // Optional but recommended for future compatibility

// console.log(app.get('env'))
// console.log(process.env)

const port=process.env.PORT || 3000
const server=app.listen(port,()=>{
    console.log(`App running on port ${port}.....`)
})

process.on('unhandledRejection',err=>{
    // console.log(err.message)
    console.log(err)
    console.log('UNHANDLED REJECTION!!💀')
    server.close(()=>{
        process.exit(1)
    })
})
