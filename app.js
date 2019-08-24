
const express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  //Task = require('./api/models/todoListModel'), //created model loading here
  bodyParser = require('body-parser'),
  cookiesession = require('cookie-session');

app.use(cookiesession({
  name: "SASS Tagging Session",
  keys: ["AKey"],

  maxAge: 10 * 1000
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/ImSearchRoutes'); //importing route
routes(app); //register the route

app.listen(port);

console.log('Started SASS Image API on port ' + port);