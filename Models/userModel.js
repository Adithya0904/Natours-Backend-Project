const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto=require('crypto');
const { type } = require('os');

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A user must have a Name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'A user must have an email'],
      unique: true,
      lowercase: true,
      validate: [validator.isEmail, 'Please provide a valid email'],
    },
    photo: {
      type:String,
      default:"default.jpeg"
    },
    role:{
      type:String,
      enum:['user','guide','lead-guide','admin'],
      default:'user',
      require:true
    },
    password: {
      type: String,
      required: [true, 'A user must have a password'],
      minlength: 8,
      select: false, // Prevents password from being returned in queries
    },
    confirm_password:{
        type:String,
        require:true,
        minlength:8,
        validate:{
            validator:function(curVal){
                return curVal===this.password
            },
            message:"Incorrect confirm-password"
        }
    },
    changed_password: {
      type:Date
    },
    passwordResetToken:String,
    passwordResetExpire:Date,
    newpassword:String,
    confirm_newpassword:String,
    active:{
      type: Boolean,
      default: true,
      select: false
    }
  }
);

// Middleware: Hash password before saving
userSchema.pre('save', async function (next) {
  // Only hash the password if it was modified
  if (!this.isModified('password')) return next();

  // Hash password with cost of 12
  this.password = await bcrypt.hash(this.password, 12);

  // Remove confirm_password field
  this.confirm_password = undefined;
  next();
});

// Middleware: Hash password before saving
userSchema.pre('save',function(next){
  if (!this.isModified('password') || this.isNew) return next();

  this.changed_password=Date.now()-1000
  next()
})

// Middleware: finds the users which are not active and hides them before saving to database!!
userSchema.pre(/^find/,function(next){
  // This will display only the user data which are active!!
  this.find({active:{$ne:false}})
  next()
})

// Instance method: Check if passwords match
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Instance method: Check if password was changed after the token was issued
userSchema.methods.changedPasswordAfterTime = function (JWTTIMESTAMP) {
  if (this.changed_password) {
    const changedTimeStamp = parseInt(this.changed_password.getTime() / 1000, 10);
    return changedTimeStamp > JWTTIMESTAMP;
  }

  // Password was not changed
  return false;
};

userSchema.methods.createPasswordResetToken=function(){
  const resetToken=crypto.randomBytes(32).toString('hex')

  this.passwordResetToken=crypto.createHash('sha256').update(resetToken).digest('hex')

  console.log("reset_token,hashed_token")
  console.log({resetToken},this.passwordResetToken)

  this.passwordResetExpire=Date.now() + 10 * 60000

  return resetToken
}

const Users = mongoose.model('User', userSchema);

module.exports = Users;
