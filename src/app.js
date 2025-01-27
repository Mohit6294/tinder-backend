const express = require("express");
const app = express();
const connectDB = require("./config/database");
const User = require("./models/User");
const { isSaveAllowed, validateSignupData } = require("./utils/validation");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const {userAuth} =  require('./middleware/auth');

app.use(express.json());
app.use(cookieParser());
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
    const { firstName, lastName, emailId, password } = req.body;

    //encrypt the password

    const encyrptedPasword = await bcrypt.hash(password, 10);
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: encyrptedPasword,
    });
    await user.save();
    res.send("User Added Successfully");
  } catch (err) {
    res.status(400).send("Error while saving user: " + err.message);
  }
});

/**
 * Login Api to allow user to login into the application.
 */

app.post("/login", async (req, res) => {
  const { emailId, password } = req.body;
  try {
    const user = await User.findOne({ emailId: emailId });

    if (!user) {
      throw new Error("Invalid Credentials");
    }
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new Error("Invalid Credentials");
    } else {
      //create a jwt token
      const token = await jwt.sign({ _id: user._id }, "Mohit@Dev.com",{
        expiresIn: '7d'
      });
      res.cookie("token", token,{
        expires: new Date(Date.now() + 6 * 60 * 60 * 1000 ) // 6 hour validity
      });
      res.send("Login Succesffully");
    }
  } catch (err) {
    res.status(400).send(err.message);
  }
});

app.get("/profile",userAuth, async (req, res) => {
  try {
    const user = req.user;
    res.send(user);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.post("/sendConnectionRequest",userAuth, async (req, res) =>{
  try{
    const user = req.user;
    res.send(user.firstName +  " Sending Connection Request");

  }catch(error){
    res.status(400).send("Error Sending Connection Request ."+error.message);
  }
})





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
