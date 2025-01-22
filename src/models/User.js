const mongoose =  require("mongoose");

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
  },
  password: {
    type: String,
    required: true,
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
    type: String
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
  }
  
},{
  timestamps: true
});

const User = mongoose.model("User", userSchema);
module.exports = User;