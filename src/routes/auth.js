const express = require('express');
const { isSaveAllowed, validateSignupData } = require("../utils/validation");
const bcrypt = require("bcrypt");
const User = require("../models/User");

const router = express.Router();

/**
 * Api to register the user
 */
router.post("/signup", async (req, res) => {
  //console.log(req.body)
  //creating new instance of model(creating a document) User

  try {
    //validate all the fields of signup request should be present in the body
    isSaveAllowed(req);

    //validate the signup request data
    validateSignupData(req);
    const { firstName, lastName, emailId, password } = req.body;

    //encrypt the password

    const encyrptedPasword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: encyrptedPasword,
    });
    await user.save();
    res.send("User Added Successfully");
  } catch (err) {
    res.status(400).send("Error while saving user: " + err.message);
  }
});


/**
 * Login Api to allow user to login into the application.
 */
router.post("/login", async (req, res) => {
  const { emailId, password } = req.body;
  try {
    const user = await User.findOne({ emailId: emailId });

    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isPasswordMatch =await user.validatePassword(password);
    if (!isPasswordMatch) {
      throw new Error("Invalid Credentials");
    } else {
      //create a jwt token
      const token = await user.getJWT();
      res.cookie("token", token,{
        expires: new Date(Date.now() + 6 * 60 * 60 * 1000 ) // 6 hour validity
      });
      res.send("Login Succesffully");
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

/**
 * Api to logout the logged in user
 */
router.post("/logout", async (req, res) =>{
  res.cookie('token', null, {
    expires: new Date(Date.now())
  });
  res.send(`Logged out Successfully`);
});


module.exports = router;