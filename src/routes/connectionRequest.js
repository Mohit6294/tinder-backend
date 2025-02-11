const express = require("express");
const { userAuth } = require("../middleware/auth");
const User = require("../models/User");
const ConnectionRequest = require("../models/ConnectionRequest");
const sendEmail = require("../utils/sendEmail");

const router = express.Router();

router.post("/request/send/:status/:toUserId", userAuth, async (req, res) => {
  try {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    if (!["ignored", "interested"].includes(status)) {
      throw new Error("please enter valid status");
    }

    const user = await User.find({
      _id: toUserId,
    });
    if (!user) {
      throw new Error("This User doesn't exist");
    }

    const isExistingConnectionRequestExist = await ConnectionRequest.find({
      $or: [
        {
          fromUserId: fromUserId,
          toUserId: toUserId,
        },
        {
          fromUserId: toUserId,
          toUserId: fromUserId,
        },
      ],
    });

    console.log(isExistingConnectionRequestExist);

    if (isExistingConnectionRequestExist.length > 0) {
      throw new Error(
        `Connection is already exist between ${fromUserId} and ${toUserId}`
      );
    }

    const connectionRequest = new ConnectionRequest({
      fromUserId: fromUserId,
      toUserId: toUserId,
      status: status,
    });

    const request = await connectionRequest.save();

    
    const re = await sendEmail.run();
    console.log(re);
    res.send({
      message: `${req.user.firstName} mark ${status} ${user.firstName} profile`,
      data: request,
    });
  } catch (error) {
    res.status(400).send("Error Sending Connection Request ." + error.message);
  }
});

router.post("/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      //validate the status = should be [accepted, rejected] (allowed status)
      console.log("Relslsl");
      
      const allowedStatus = ["accepted", "rejected"];
      const { status, requestId } = req.params;
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({
          message: `Status is not Allowed`,
        });
      }
      const loggedInUser = req.user;
      //check the logged in user should be toUser(who is responsible for accpeting/rejecting the request)
      //current status should be in interested state
      //check if request Id is valid or not
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      });
      console.log(connectionRequest);
      
      if (!connectionRequest) {
        return res.status(400).json({
          message: `${requestId} is not Valid`,
        });
      }
      connectionRequest.status = status;
      const data = await connectionRequest.save();
      res.json({
        message:`status changed succesffully for requestId ${requestId}`,
        data
      })
    } catch (error) {
      res.status(400).send("Error :" + error.message);
    }
  }
);

module.exports = router;
