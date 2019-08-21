
import express from 'express';
import db from './db/db';
import bodyParser from 'body-parser';

var finder = require('findit')(process.argv[2] || '.');
var path = require('path');

// Set up the express app
const app = express();


// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/api/v1/todos', (req, res) => {
    if(!req.body.title) {
      return res.status(400).send({
        success: 'false',
        message: 'title is required'
      });
    } else if(!req.body.description) {
      return res.status(400).send({
        success: 'false',
        message: 'description is required'
      });
    }
   const todo = {
     id: db.length + 1,
     title: req.body.title,
     description: req.body.description
   }
   db.push(todo);
   return res.status(201).send({
     success: 'true',
     message: 'todo added successfully',
     todo
   })
});

// get all todos
app.get('/api/v1/todos', (req, res) => {
  res.status(200).send({
    test: req.body.title,
    success: 'true',
    message: 'todos retrieved successfully',
    todos: db
  })

});

// send an image
app.get('/api/v1/image', (req, res) => {
  res.set("Number","0");
  res.status(200).sendFile(path.join(__dirname,"/MatchData/Untagged/2019ohcl_qf3m1/0.jpg"));
  
});

/*app.get('/api/test',(req, res) => {
  async 
}) */

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});
