const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcrypt')

const userSchema=mongoose.Schema(
    {
        name:{
            type:String,
            require:[true,'A user must have a Name'],
            trim:true
        },
        email:{
            type:String,
            require:true,
            unique:true,
            lower:true,
            validate:[validator.isEmail,'Please Provide a valid email']
        },
        photo:String,
        password:{
            type:String,
            require:true,
            minlength:8,
            select:false
        },
        confirm_password:{
            type:String,
            require:true,
            minlength:8,
            validate:{
                validator:function(ele){
                    return ele===this.password
                }
            }
        },
        changed_password:Date
    }
)

userSchema.pre('save',async function(next){
    if(!this.isModified('password')) return next()

    this.password=await bcrypt.hash(this.password,12)
    this.confirm_password=undefined
    next()
})

//INSTANCE METHOD
userSchema.methods.correctPassword=async function(candidatepassword,userpassword) {
    return await bcrypt.compare(candidatepassword,userpassword)
}

userSchema.methods.changedPasswordAfterTime= function(JWTTIMESTAMP){
    if(this.changed_password){
        const changedTimeStamp=parseInt(this.changed_password.getTime() /1000)
        console.log(changedTimeStamp,JWTTIMESTAMP)
        return changedTimeStamp>JWTTIMESTAMP
    }
    return false
}


const Users=mongoose.model('User',userSchema)



module.exports=Users