const validator = require('validator');
const validateSignupData = (req) => {
  const {firstName, lastName, emailId, password} = req.body;

  if(!firstName || !lastName){
    throw new Error("Name is not valid");
  }else if(firstName.length <4 || firstName.length > 50){
    throw new Error("firstname should be between 4-50 character"+firstName);
  }else if(!validator.isEmail(emailId)){
    throw new Error("Email is not valid"+emailId)
  }else if(!validator.isStrongPassword(password)){
    throw new Error("Password should be strong");
  }
};

const isSaveAllowed = (req) => {
  const userOptions = [
    "firstName",
    "lastName",
    "emailId",
    "password",
    "age",
    "gender",
    "photoUrl",
    "description",
    "skills",
  ];

  const isSaveAllowed = Object.keys(req.body).every((key) =>
    userOptions.includes(key)
  );
  if (!isSaveAllowed) {
    throw new Error("Save not allowed , please check the field");
  }
};

module.exports = {
  validateSignupData,
  isSaveAllowed,
}
