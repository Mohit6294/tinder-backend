const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/User");
const {isSaveAllowed, validateSignupData} = require("./utils/validation");
const bcrypt = require('bcrypt');

app.use(express.json());
/**
 * Api to register the user
 */
app.post("/signup", async (req, res) => {
  //console.log(req.body)
  //creating new instance of model(creating a document) User


  try {
    //validate all the fields of signup request should be present in the body
    isSaveAllowed(req);

    //validate the signup request data
    validateSignupData(req);
    const {firstName, lastName, emailId, password} = req.body;

    //encrypt the password 

    const encyrptedPasword =await bcrypt.hash(password,10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: encyrptedPasword
    });
    await user.save();
    res.send("User Added Successfully");
  } catch (err) {
    res.status(400).send("Error while saving user: " + err.message);
  }
});

/**
 * find user by emailId
 */
app.get("/user", async (req, res) => {
  const emailId = req.body.emailId;
  try {
    const user = await User.find({ emailId: emailId });
    if (user.length === 0) {
      res.status(404).send(`User not found with emailId  ${emailId}`);
    } else {
      res.send(user);
    }
  } catch (err) {
    res.status(500).send("Something Went Wrong");
  }
});

/**
 * feed api, to get all the users
 */
app.get("/feed", async (req, res) => {
  try {
    const users = await User.find();
    res.send(users);
  } catch (err) {
    res.status(500).send("Something Went Wrong");
  }
});

/**
 * delete user api
 */
app.delete("/user", async (req, res) => {
  try {
    const userId = req.body.userId;
    await User.findByIdAndDelete(userId);
    //await User.findByIdAndDelete({_id: userId})
    res.status(200).send("User deleted Successfully");
  } catch (err) {
    res.status(500).send("Something went wrong");
  }
});

/**
 * update user api
 */
app.patch("/user/:userId", async (req, res) => {
  try {
    const updateOptions = [
      "age",
      "photoUrl",
      "description",
      "skills",
    ];

    const isUpdateAllowed = Object.keys(req.body).every((key) =>
      updateOptions.includes(key)
    );
    if (!isUpdateAllowed) {
      throw new Error("Update not allowed , please check the field");
    }
    const userId = req.params?.userId;
    const data = req.body;
    const user = await User.findByIdAndUpdate(userId, data, {
      returnDocument: "after",
      runValidators: true,
    });
    res.send(`user with id : ${userId} updated Succesffully`);
  } catch (err) {
    res.status(500).send("Something went wrong" + err.message);
  }
});

/**
 * connect the database and create a server with listening port
 */
connectDB()
  .then(() => {
    console.log("Database connection established...");
    app.listen(5000, () => {
      console.log("listnening the port on 5000");
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected");
  });

/*
app.get("/getUserData", (req, res) => {
  //Logic of DB Call and get User data
  try{
  throw new Error("Random error thrown here");
  res.send("User Data Sent");
  }catch(err){
    res.status(500).send("Some Error occured");
  }
})

app.use("/", (err, req, res, next) => {
  if(err){
    // Log your error message
    res.status(500).send("Someting, went wrong");
  }
})
/*
const {adminAuth, userAuth } = require('./middleware/auth');

app.use("/admin", adminAuth);

app.post("/user/login", (req, res) => {
  res.send("User logged in Succesfully");
})

app.get("/user/data",userAuth, (req, res) => {
  res.send("User Data Sent");
} )



app.get("/admin/getAllData", (req, res, next) =>{
  res.send("send all Data");
});

app.delete("/admin/deleteUser", (req, res) => {
  //Logic of deleting the data
  res.send("Deleted the user");
})

/*
app.get(
  "/user",
  (req, res, next) => {
    console.log("Handling the route user !!");
    next();
    
  }
);

app.get(
  "/user",
  (req, res, next) => {
    console.log("handling the route handler");
    res.send("2nd Route Handler");
  }
)

/*
app.use(
  "/user",
  [(req, res, next) => {
    // Route Handler
    //res.send("route Handler 1")
    console.log("Handling the route user !!");
    //res.send("Resonse !");
    next(); 
    //res.send("REsponse 1!");
    
  },
  (req, res, next) => {
    //route handler 2
    console.log("Handling the route user 2");
    next();
    //res.send("2nd Response !");
  },
  (req, res) => {
    console.log("Handling the route user 3");
    res.send("3rd Response !")
  }]
);
*/
/*
//this will only handle get call to /user
app.get("/user/:userId",(req,res) => {
  console.log(req.params)
  console.log(req.query);
  
  res.send({firstname:"Mohit",lastname:"Bhadani"});
})

app.post("/user",(req, res) => {
  //saving to database 
  res.send("Data saved to Db Successfully");
})

app.delete("/user",(req, res) => {
  //delete user
  res.send("user deleted succesfully")
})

// this will match all the http method api calls to /test 
app.use('/test', (req, res) => {
  res.send('response from test page');
});

*/
