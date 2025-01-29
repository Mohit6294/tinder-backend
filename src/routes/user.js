const express = require('express');
const { userAuth } = require('../middleware/auth');
const ConnectionRequest = require('../models/ConnectionRequest');
const User = require('../models/User');
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

router.get("/feed", userAuth, async (req, res) =>{
  
  try{
    //find all connections

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * 10;
    const loggedInUser = req.user;
    const connectionRequests = await ConnectionRequest.find({
      $or:[
        {
          fromUserId: loggedInUser._id,
        },
        {
          toUserId: loggedInUser._id,
        }
      ]
    });

    const requestIds = new Set();
    connectionRequests.forEach(key=> {
      requestIds.add(key.fromUserId.toString());
      requestIds.add(key.toUserId.toString());
    });
    console.log(requestIds);
    
    const user = await User.find({
      $and :[
        {
          _id: {
            $nin: Array.from(requestIds)
          }
        },
        {
          _id:{
            $ne: loggedInUser._id
          }
        }
      ]
    })
    .select(["firstName","lastName","age","description","photoUrl"])
    .skip(skip)
    .limit(limit);

    res.json({
      user
    })
  }catch(error){
    res.status(400).json({
      message: `Error ${error.message}`
    })
  }
});

module.exports = router;