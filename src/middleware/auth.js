const jwt = require("jsonwebtoken");
const User = require("../models/User");

/**
 * Middleware for user authentication
 */
const userAuth = async (req, res, next) => {
  try {
    //getting the token from the cookies
    const { token } = req.cookies;
    if (!token) {
      throw new Error("Token is Invalid !!!");
    }
    const decodedObject = await jwt.verify(token, "Mohit@Dev.com");
    const { _id } = decodedObject;
    const user = await User.findById(_id);
    if (!user) {
      throw new Error("User is not Valid!!");
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(400).send("Error:" + err.message);
  }
};

module.exports = {
  userAuth,
};
