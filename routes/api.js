const express = require('express');
const router = express.Router();
var mongoose = require('mongoose'), Schema = mongoose.Schema;
var messageSchema = new Schema({username: String, message: String});
var Message = mongoose.model('Message', messageSchema);
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/messenger');

const app = require('express')();
var http = require('http').Server(app);
/*var io = require('socket.io')(http);

io.on('connection', function (socket) {

  console.log('user connected');

  socket.on('disconnect', function () {
    console.log('user disconnected');
  });

  socket.on('all-message', function (message) {
    io.emit('message', {type: 'new-message', text: message});
// Function above that stores the message in the database
    databaseStore(message)
  });

});*/

function databaseStore(message) {
  var storeData = { chatMessage: message, timestamp: new Date().getTime() }
  db.collection('chatroom-chats').save(storeData, function(err, result) {
    if (err) return console.log(err)
    console.log('saved to database')
})
}
/*
mongoose.connect('mongodb://localhost/messenger', {useMongoClient: true})
  .then(function () {
    require('./db-init')(express)
  })
  .catch(function (err) {
    console.error(err)
  });
*/

// declare axios for making http requests
const axios = require('axios');
const API = 'https://jsonplaceholder.typicode.com';

/*/!* GET api listing. *!/
router.get('/', function (req, res) {

  Message.find({}, function (err, docs) {
    if (err) {
      res.status(504).json(err);
    } else {
      /!*for (var i = 0; i < res.length; i++) {
        console.log('username:', res[i].username);
      }*!/
      res.status(200).send(docs);
    }
  });
});


// Get all posts
router.post('/posts', function (req, res) {
  // Get posts from the mock api
  // This should ideally be replaced with a service that connects to MongoDB
  /!*axios.get(API + '/posts')
    .then(function (posts) {
      res.status(200).json(posts.data);
    })
    .catch(function (error) {
      res.status(500).send(error)
    });*!/
  var userMessage = new Message({username: req.body.username, message: req.body.message});
  userMessage.save(function (err) {
    if (err) {
      console.log('error');
      res.status(504).json(err);
    } else {
      console.log(userMessage);
      res.status(200).send(userMessage);
    }
  });
});
module.exports = router;*/

/*

require('mongoose').model('User');

var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = {
  createUsers: function (req, res) {
    var person = req.body;
    new User({ name: person.name, age: person.age, email: person.email })
      .save(function (err) {
        if (err) {
          res.status(504);
          res.end(err);
        } else {
          console.log('user saved');
          res.end();
        }
      });
  },
  seeResults: function (req, res, next) {
    User.find({}, function (err, docs) {
      if (err) {
        res.status(504);
        res.end(err);
      } else {
        for (var i = 0; i < docs.length; i++) {
          console.log('user:', docs[i].name);
        }
        res.end(JSON.stringify(docs));
      }
    });
  },
  delete: function( req, res, next) {
    console.log(req.params.id);
    User.find({ _id: req.params.id}, function(err) {
      if(err) {
        req.status(504);
        req.end();
        console.log(err);
      }
    }).remove(function (err) {
      console.log(err);
      if (err) {
        res.end(err);
      } else {
        res.end();
      }
    });
  }
}*/
