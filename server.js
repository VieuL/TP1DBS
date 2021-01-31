const express = require('express');

//to access form data
let bodyParser = require('body-parser');

//used to reduce response body
let compression = require('compression');

//to access server directories
let path = require('path');

//to access the database stored in MongoDB
let mongoose = require('mongoose');

//session allows to store data such as user data
let session = require('express-session');

//sessions are stored into MongoDB
let MongoStore = require('connect-mongo')(session);

let cors = require('cors');

const app = express();

//Used for Jsonwebtoken (in login)
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

//connects to the MongoDB database
mongoose.connect('mongodb://localhost:27017/auth', { useNewUrlParser: true, useUnifiedTopology: true }, (err)=> {

  if (err) {

    throw err;

  }
  else {

    console.log("Connected to the database");

  }

});

// Passport Setup
const User = require('./models/user');

//setting session
app.use(session({

  resave: true,
  saveUninitialized: true,
  secret: 'mySecretKey',
  store: new MongoStore({ url: 'mongodb://localhost:27017/auth', autoReconnect: true})

}));

var opts = {}
opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
opts.secretOrKey = "My so secret sentence";

passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
  User.findById(jwt_payload.id)
  .then((user) => {
    if (user) {
      return done(null, user);
    } else {
      return done(null, false);
    }

  }, (err) => {
    return done(err, false);
  });
}));

app.use(passport.initialize());

//compress response body for better performance
app.use(compression());

//disable headers indicating pages are coming from an Express server
app.disable('x-powered-by');

//used to fetch the data from forms on HTTP POST
app.use(bodyParser.urlencoded({
  extended : true
}));

app.use(bodyParser.json());

app.use(cors());

app.get('/', (req, res) => {
  res.send('Homepage');
});

app.get("/about", (req, res) => {
  res.send("About");
})

let routes = require("./routes");

app.use(routes);

app.listen(4000);
console.log('App server running on port 4000');
