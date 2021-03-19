//global constants
const express = require("express");
 mongoose = require("mongoose");
 passport = require("passport");
 bodyParser = require("body-parser");
 LocalStrategy = require("passport-local"),
 passportLocalMongoose = require("passport-local-mongoose");
 User = require("./models/user.js"); //user model object 
 UserData = require("./models/userdata.js"); //userdata model object
 timestamps = require('./public/scripts/timestamps.js'); 
 emailverification = require('./public/scripts/emailverification.js');
 flash = require('connect-flash');
 fatAPI = new (require('fatsecret'))('9bb1a96ff4e541079791cb0180c7543c', 'aed331e5d62f4a08b2c30cb10ba67dc7');
  
 

 
 
//global variables
var app = express();


//middleware
//==========================================================
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect("mongodb+srv://abc:test123@cluster0.7bifm.mongodb.net/Cluster0?retryWrites=true&w=majority");


app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.static("node_modules"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(flash());





app.use(
  require("express-session")({
    secret: "session secret code",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//=====================
// ROUTES
//=====================

// Showing home page
app.get("/", function (req, res) {
  res.render("home");
});

// Showing dashboard page
app.get("/dashboard", isLoggedIn, function (req, res) {

  UserData.findById(req.user._id, 
    function (err,docs) {
      if (err) {
        throw new Error("Not found");
      }
      res.render("dashboard", { data: docs, username: req.user.username });
  });  

});


app.get("/search", async function(req,res){

  await fatAPI
  .method('foods.search', {
    search_expression: req.body.foodinput,
    max_results: 10
  })
  .then(function(results) {
    console.log(results.foods);
  })
  .catch(err => console.error(err));

  
});





//push data to the database
app.post("/dashboard", isLoggedIn, function (req, res) {
  var userid = req.user._id;
  var glucoselevel = req.body.glucoselevel;
  var timestamp = timestamps.maketimestamp(new Date()); 

  UserData.findByIdAndUpdate(userid,{$push: {
    //add data to push to database
    glucoselevels:glucoselevel,
    timestamps:timestamp

    } },
    { new: true },
    function (err,docs){
      if (err) {
        console.log(err);
        }
        console.log("Result: ", docs);
        res.render("dashboard", { data: docs, username: req.user.username });
  });

});





// Showing register form
app.get("/register", function (req, res) {
  res.render("register");
});

// Handling user signup
app.post("/register", function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var firstname = req.body.firstname;
  var lastname = req.body.lastname;
  var email = req.body.email;
  var age = parseInt(req.body.age);
  var diabetic = req.body.diabetic === "true";
  
  UserData.exists({email: email}).then(answer => {
    if (answer == false){
      
      User.register(
        new User({username: username}),password, 
        function (err, user) {
          if (err) {
            console.log(err);
            res.render("register",{error: err});
          } else {
            passport.authenticate("local")(req, res, function () {
    
              var Data = new UserData({
                _id: req.user._id,
                firstname: firstname,
                lastname: lastname, 
                email: email,  
                glucoselevels: [], 
                timestamps: [],
                age: age,
                diabetic: diabetic
              })
              Data.save();
              res.render("login");
    
            });
          }
        }
      );
    }

    else{
      res.render("register",{error: "Email is taken."});
    }

  })
  

  
});

//Showing login form
app.get("/login", function (req, res) {
  res.render('login', {error: req.flash('error')});
});

//Handling user login
app.post('/login', passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }), 
function(req, res) {
  res.redirect('/dashboard');
});


//Handling user logout
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}



var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});
