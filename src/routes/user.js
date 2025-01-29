const express = require('express');
const { userAuth,verifyAdminRole } = require('../middleware/auth');
const ConnectionRequest = require('../models/ConnectionRequest');
const User = require('../models/User');
const router = express.Router();
const mongoose = require("mongoose");

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

router.delete("/user/:userId", userAuth, verifyAdminRole, async (req,res) =>{
  const session = await mongoose.startSession(); // Start a session
  session.startTransaction(); // Begin a transaction
  try{
    const userId = req.params.userId;
    if(!userId){
      return res.status(400).json({
        message: `Please Enter valid ${userId}`
      });
    }

    
    //Before deleting User  we need to remove this user from all connections
    const findConnectionsIds = await ConnectionRequest.find({
      $or:[
        {
          fromUserId: userId
        },
        {
          toUserId: userId
        }
      ]
    }).select("_id");



    const connectionIdsSet = new Set();


    findConnectionsIds.forEach(key =>{
      connectionIdsSet.add(key);
    });

    connectionIdsSet.forEach(async (data)=>{
      await ConnectionRequest.deleteOne({
        _id: data
      })
    })
    const user = await User.findByIdAndDelete({ _id: userId });

    // Commit transaction (finalize changes)
    await session.commitTransaction();
    session.endSession();

    res.json({
      message: `${user} deleted Successfully`,
    })

  }catch(error){
    await session.abortTransaction(); // Rollback changes if any error occurs
    session.endSession();
    res.status(400).json({
      message: `Error occurred during deleting :: ${error.message}`
    })
  }
});

module.exports = router;