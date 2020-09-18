const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const path = require("path");
const bodyParser = require('body-parser');
const fs = require('file-system');
require('dotenv').config()

const app = express();
var cors = require('cors')
const PORT = (process.env.PORT || 3000);

const pickupRoutes = require("./routes/pickupRoutes");
const signinRoutes = require("./routes/signinRoutes");
const storeInfoRoutes = require("./routes/storeInfoRoutes");
const adminRoutes = require("./routes/adminRoutes");

mongoose.connect(process.env.MONGODB_URI, {
  // make pool sive an enviromental variable?  
  poolSize: process.env.MONGO_POOLSIZE,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
  useCreateIndex: true,
  sslValidate: false,
  sslCA: fs.readFileSync('./database-scripts/rds-combined-ca-bundle.pem')
})
  .then(() => {
    console.log("Mongoose is connected");
  })
  .catch((error) => {
  console.log("Mongoose Connection Error: ", error);
});

// mongoose.connection.on("connected", () => {
//   console.log("Mongoose is connected");
// });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// If the request is not comming from a browser we need an API key for security
function isAccessGranted (req, res, next) {
  // console.log(req.headers)
  if (!app.locals.origin){
    if (req.headers.apikey) {
      if(req.headers.apikey == process.env.API_KEY) {
        next();
      } else {
        res.status(401).send("Error: Invalid Token");
      }
    } else {
      res.status(401).send("Error: Missing Token");
    }  
  } else {
    next();
  }
}

// Handle CORS - Can add URLs to be whitelisted below as needed.
var whitelist = ['http://localhost:8080', 'http://localhost:3000', 'http://127.0.0.1:8080', 'http://127.0.0.1:3000', 'https://curbside-demo.shawscottapps.com', 'https://curbside-dev.shawscottapps.com', 'http://omcprtnr003z.rsys2.net']


var corsOptions = {
  origin: function (origin, callback) {
      if (whitelist.indexOf(origin) !== -1 || !origin ) {
        app.locals.origin = origin
        callback(null, true)
      } else {
        callback(new Error('Not allowed by CORS'))
      }
  }
}

// HTTP request logger
app.use(morgan("tiny"));

// Body parser
app.use(bodyParser.json());

app.use("/api", cors(corsOptions), isAccessGranted, pickupRoutes);
app.use("/api", cors(corsOptions), isAccessGranted, signinRoutes);
app.use("/api", cors(corsOptions), isAccessGranted, storeInfoRoutes);
app.use("/api", cors(corsOptions), isAccessGranted, adminRoutes);

console.log("running in ", process.env.NODE_ENV)

// Serve up a verification token for load testing 
app.get('/loaderio-1cee83e488a3fa704972071ebb305300', function(req, res) {
  res.send('loaderio-1cee83e488a3fa704972071ebb305300') 
 });


if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'docker') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
// Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
   // res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
  });
}

app.listen(PORT, console.log(`Server is starting at ${PORT}`));

// Disable both timeouts to prevent ed error (104: Connection reset by peer)
// const server = app.listen(PORT, console.log(`Server is starting at ${PORT}`));
// server.keepAliveTimeout = 0;
// server.headersTimeout = 0;
