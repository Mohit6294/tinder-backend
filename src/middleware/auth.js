 /**
  * middleware for admin authentication
  */
 const adminAuth = (req, res, next) => {
  //Logic of checking if the request is authorized
  const token = "xyz";
  const isAdminAuthorized = token === "xyz";
  console.log("Admin auth is logged");
  
  if(isAdminAuthorized){
    next();
  }
  else{
    res.status(401).send("User is not authorized");
  }
};

/**
 * Middleware for user authentication
 */
const userAuth = (req, res, next) => {
  //Logic of checking if the request is authorized
  const token = "xyz";
  const isAdminAuthorized = token === "xyz";
  console.log("Admin auth is logged");
  
  if(isAdminAuthorized){
    next();
  }
  else{
    res.status(401).send("User is not authorized");
  }
};

module.exports = {
  adminAuth,
  userAuth,
};

