
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

app.use((req,res,next) => {
  if (req.session.isNew) {
    req.session.Id = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  };
  next()
})

/*
app.use(function (req, res, next) {
  req.session.nowInMinutes = Math.floor(Date.now() / 60e3)
  next()
})
*/

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var routes = require('./api/routes/ImSearchRoutes'); //importing route
routes(app); //register the route

app.listen(port);

console.log('Started SASS Image API on port ' + port);