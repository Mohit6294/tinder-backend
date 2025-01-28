const express = require('express');
const {userAuth} =  require('../middleware/auth');
const User = require("../models/User");
const ConnectionRequest = require("../models/ConnectionRequest");

const router = express.Router();

router.post("/request/:status/:toUserId", userAuth, async (req, res) =>{
  try{
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    if(!["ignored","interested"].includes(status)){
      throw new Error("please enter valid status");
    }

    const user = await User.find({
      _id: toUserId
    });
    if(!user){
      throw new Error("This User doesn't exist");
    }

    const isExistingConnectionRequestExist = await ConnectionRequest.find({
      $or :[
        {
          fromUserId: fromUserId,
          toUserId: toUserId,
        },
        {
          fromUserId: toUserId,
          toUserId: fromUserId,
        }
      ]
    });

    console.log(isExistingConnectionRequestExist);
    

    if(isExistingConnectionRequestExist.length > 0 ){
      throw new Error(`Connection is already exist between ${fromUserId} and ${toUserId}`);
    }

    const connectionRequest = new ConnectionRequest({
      fromUserId: fromUserId,
      toUserId: toUserId,
      status: status
    });

    const request = await connectionRequest.save();
    
    res.send({
      message: `${req.user.firstName} mark ${status} ${user.firstName} profile`,
      data: request
    });

  }catch(error){
    res.status(400).send("Error Sending Connection Request ."+error.message);
  }
});

module.exports = router;