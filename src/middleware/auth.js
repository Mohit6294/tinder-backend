const jwt = require("jsonwebtoken");
const User = require("../models/User");
const logger = require("../config/logger");

/**
 * Middleware for user authentication
 */
const userAuth = async (req, res, next) => {
  try {
    //getting the token from the cookies
    const { token } = req.cookies;
    if (!token) {
      logger.error("error occurred due to invalid token ");
      throw new Error("User is not Valid");
    }
    const decodedObject = await jwt.verify(token,process.env.JWT_SECRET_KEY);
    const { _id } = decodedObject;
    const user = await User.findById(_id);
    if (!user) {
      logger.error(`User is not valid`);
      throw new Error("User is not Valid!!");
    }
    logger.info("User is Authenticated Successfully");
    req.user = user;
    next();
  } catch (err) {
    logger.error("Error "+err.message);
    res.status(400).send("Error:" + err.message);
  }
};


const verifyAdminRole = async (req, res,next) =>{
  try{
    const user = req.user;
    if(user.roles.includes('ADMIN')){
      next();
    }else{
      logger.error(`Not a valid User`);
      throw new Error('Not a valid user');
    }
  }catch(error){
    logger.error(`You don't have permission`);
    res.status(403).json({
      message: `you don't have required permission`
    })
  }
}

module.exports = {
  userAuth,
  verifyAdminRole
};
