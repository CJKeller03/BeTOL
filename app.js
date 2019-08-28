// Set express up
const express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  bodyParser = require('body-parser'),
  cookiesession = require('cookie-session');

// Enable cookie sessions
app.use(cookiesession({
  name: "SASS Tagging Session",
  keys: ["AKey"],
  maxAge: 10 * 1000
}));

// Assign every new user a pseudorandom session id
app.use((req,res,next) => {
  if (req.session.isNew) {
    req.session.Id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };
  next()
})

// Enable bodyparser to parse json responses
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Force express to use the custom search routes for endpoint routing
const routes = require('./api/routes/ImSearchRoutes'); //importing route
routes(app); //register the route

// Start the server
app.listen(port);
console.log('Started SASS Image API on port ' + port);