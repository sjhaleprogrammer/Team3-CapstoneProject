//global constants
const express = require("express");
const { MongooseDocument } = require("mongoose");
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
 i18n = require('i18n');
 cookieParser = require('cookie-parser');

 
 
 
 
//global variables
var app = express();


//middleware
//==========================================================
mongoose.set("useNewUrlParser", true);
mongoose.set("useFindAndModify", false);
mongoose.set("useCreateIndex", true);
mongoose.set("useUnifiedTopology", true);
mongoose.connect("mongodb+srv://abc:test123@cluster0.7bifm.mongodb.net/Cluster0?retryWrites=true&w=majority");


i18n.configure({
  locales: ['en', 'es'], 
  cookie: 'lang',
  directory: __dirname + '/locales'
});


app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(express.static("node_modules"));
app.use(express.static(__dirname + "/dist"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(i18n.init);
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

var dashboardPhrasesToTranslate = ["high_value","low_value", "time", "blood_glucose_chart", "glucose"];
for (i = 1; i <= 20; i++){
  dashboardPhrasesToTranslate.push("low" + i.toString());
};
for (j = 1; j <= 19; j++){
  dashboardPhrasesToTranslate.push("normal" + j.toString());
};
for (k = 1; k <= 20; k++){
  dashboardPhrasesToTranslate.push("high" + k.toString());
};
dashboardPhrasesToTranslate.push("notifTitle");

// Showing dashboard page
app.get("/dashboard", isLoggedIn, function (req, res) {

  
  var translatedArray = dashboardPhrasesToTranslate.map(translate);
  
  if (req.session.firsttime == true){
    UserData.findById(req.user._id, 
      function (err,docs) {
        if (err) {
          throw new Error("Not found");
        }
        res.render("dashboard", { translatedPhrases: translatedArray, data: docs, username: req.user.username, firsttime: true});
    });  

    req.session.firsttime = false;

  }
  else {
    UserData.findById(req.user._id, 
      function (err,docs) {
        if (err) {
          throw new Error("Not found");
        }
        res.render("dashboard", { translatedPhrases: translatedArray, data: docs, username: req.user.username, firsttime: false});
    });  

  }
  
  function translate(phrase){
    return res.__(phrase);
  }

});

app.get("/setLocale/:locale", function(req, res) {
  res.cookie('lang', req.params.locale, {maxAge: 1000*60*60*24*365*5});   // Cookie expires after 5 years
  res.redirect('back');
});







//push data to the database
app.post("/dashboard", isLoggedIn, function (req, res) {
  var date = new Date();
  
  var userid = req.user._id;
  var currentDate = date.getFullYear() + "-" + ('0' + (date.getMonth() + 1)).slice(-2) + "-" + ('0' + date.getDate()).slice(-2);
  var glucoselevel = req.body.glucoselevel;
  var timestamp = timestamps.maketimestamp(new Date()); 
  var carb = req.body.carbs;
  var translatedArray = dashboardPhrasesToTranslate.map(translate);

  UserData.findOneAndUpdate(
    {
      '_id': userid,
      'dates.date': {$ne: currentDate}
    },
    {$addToSet: {
      dates: {
        date: currentDate,
      }
    }},
    function(err) {
      console.log(err);
    }
  );

  UserData.findOneAndUpdate(
    {
      '_id': userid,
      'dates.date': currentDate
    },
    {$push: {
    //add data to push to database
      'dates.$.glucosedata': {
        glucoselevels : glucoselevel,
        timestamps : timestamp,
        carbs : carb,
      }
    
    } },
    { 
      new: true,
    },
    function (err,docs){
      if (err) {
        console.log(err);
        }
        console.log("Result: ", docs);
        res.render("dashboard", {translatedPhrases: translatedArray, data: docs, username: req.user.username, firsttime: false });
  });

  function translate(phrase){
    return res.__(phrase);
  }

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
                dates: [],
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
  req.session.firsttime = true;
  res.redirect('/dashboard');
});


//Handling user logout
app.get("/logout", function (req, res) {
  req.logout();
  res.redirect("/");
});

// app.post("/translations", function(req, res) {
//   var translated = req.body['translateThis'].map(translate);
//   res.send(translated);
//   console.log(translated);

//   function translate(phrase){
//     return res.__(phrase);
//   }
// });

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
}


//Showing about page
app.get("/about", function (req, res) {
  res.render('about');
});

//Showing faq page
app.get("/faq", function (req, res) {
  res.render('faq');
});





var port = process.env.PORT || 3000;
app.listen(port, function () {
  console.log("Server Has Started!");
});
