const express = require('express');
const {userAuth} =  require('../middleware/auth');

const router = express.Router();

router.post("/sendConnectionRequest",userAuth, async (req, res) =>{
  try{
    const user = req.user;
    res.send(user.firstName +  " Sending Connection Request");

  }catch(error){
    res.status(400).send("Error Sending Connection Request ."+error.message);
  }
});

module.exports = router;