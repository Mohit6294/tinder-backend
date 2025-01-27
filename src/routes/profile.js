const express = require('express');
const {userAuth} =  require('../middleware/auth');
const {validateEditProfileData} = require('../utils/validation');

const router = express.Router();

/**
 * to get the user profile details
 */
router.get("/profile/view",userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

/**
 * to update the user profile details
 */
router.patch("/profile/edit", userAuth, async (req, res) => {
  try{
    
    const isUpdateAllowed = validateEditProfileData(req);
    if(!isUpdateAllowed){
      throw new Error("Invalid Edit Request");
    }

    const loggedInUser = req.user;
    
    Object.keys(req.body).map(key => loggedInUser[key] = req.body[key]);
    await loggedInUser.save();
    res.json({
      message:`${loggedInUser.firstName} profile updated Successfully`,
      data: loggedInUser
    })

  }catch(error){
    res.status(400).send(`Error : ${error.message}`);
  }
});

router.patch('/profile/password',userAuth, async (req, res) =>{
  try{
    const isPasswordUpdateAllowed = validateUpdatedPasswordData(req);
    const loggedInUser = req.user;
    //TODO: validate the user and allow updated
    res.send('password updated successfully')
  }catch(error){
    res.status(400).send("Error: "+error.message);
  }
})

module.exports = router;