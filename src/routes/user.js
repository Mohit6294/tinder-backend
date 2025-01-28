const express = require('express');
const { userAuth } = require('../middleware/auth');
const ConnectionRequest = require('../models/ConnectionRequest');
const router = express.Router();

router.get('/user/request/recieved',userAuth, async (req, res) =>{
  try{
    const loggedInUser = req.user;
    const data =await  ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: 'interested'
    }).populate("fromUserId",["firstName","lastName","skills","photoUrl","description"]);
    res.json({
      message:'Fetched data successfully',
      data
    })
  }catch(error){
    res.status(400).send('Error : '+error.message);
  }
});

router.get('/user/connections', userAuth, async (req, res) =>{
  try{
     const loggedInUser = req.user;
     const connectionRequests = await ConnectionRequest.find({
      $or:[
        {
          fromUserId: loggedInUser,
          status:"accepted",
        },
        {
          toUserId: loggedInUser,
          status:"accepted",
        }
      ]
     }).populate("fromUserId",["firstName","lastName","age","gender","photoUrl","description"])
     .populate("toUserId",["firstName","lastName","age","gender","photoUrl","description"]);

     const data = connectionRequests.map(key=>{
      if(key.fromUserId._id.toString() === loggedInUser._id.toString()){
        return key.toUserId;
      }else{
        return key.fromUserId;
      }
     });

     res.json({
      data
     })
  }catch(error){
    res.status(400).json({
      message: `Error : ${error.message}`
    })
  }
})



module.exports = router;