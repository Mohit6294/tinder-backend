const mongoose =  require("mongoose");
var validator = require('validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const userSchema =new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: 4,
    maxLength: 50
  },
  lastName: {
    type: String
  },
  emailId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate(value){
      if(!validator.isEmail(value)){
        throw new Error("EmailID is not valid :"+ value);
      }
    }
  },
  password: {
    type: String,
    required: true,
    validate(value){
      if(!validator.isStrongPassword(value)){
        throw new Error("Password is not Strong :"+ value);
      }
    }
  },
  age: {
    type: Number,
    min: 18,
    max: 60,
    
  },
  gender: {
    type: String,
    validate(value){
      if(!["male","female","other"].includes(value)){
        throw new Error("gender is not valid");
      }
    }
  },
  photoUrl:{
    type: String,
    validate(value) {
      if(!validator.isURL(value)){
        throw new Error("Photo Url is not valid :"+value);
      }
    }
  },
  description: {
    type: String,
    default: "This is a default description",
  },
  skills:{
    type: [String],
    validate(value){
      if(value.length > 10){
        throw new Error("Skills should be less than 10");
      }
    }
  },
  roles:{
    type: [String],
    enum: {
        values: ["USER","ADMIN"],
         message: '{VALUE} is not supported'
    },
    default: "USER"

  }
  
},{
  timestamps: true
});

userSchema.methods.getJWT = async function(){
  const user = this;
  const token =  await jwt.sign({ _id: user._id }, "Mohit@Dev.com",{
    expiresIn: '7d'
  });
  return token;
}

userSchema.methods.validatePassword = async function(passwordInputByUser) {
  const user = this;
  const isPassowrdValid = await bcrypt.compare(passwordInputByUser, user.password);
  return isPassowrdValid;
}

const User = mongoose.model("User", userSchema);
module.exports = User;