// Database configuration using mongoose
const mongoose = require("mongoose");

const connectDB = async () => {
  await mongoose.connect(
    "mongodb+srv://bhadanimohit1997:MlL93GcOYUU5axG5@mohitbhadani.ovt72.mongodb.net/devTinder"
  );
};




module.exports = connectDB;