'use strict';
var express = require('express');
var router = express.Router();
var tweetBank = require('../tweetBank');
var client = require('../db');

module.exports = function makeRouterWithSockets (io) {

//client.query('SELECT name, content FROM tweets, users WHERE tweets.userid = users.id', function (err, data) {/** ... */});



  // a reusable function
  function respondWithAllTweets (req, res, next){
    client.query('SELECT name, content, pictureurl, tweets.id FROM tweets, users WHERE tweets.userid = users.id', function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });
  }

  // here we basically treet the root view and tweets view as identical
  router.get('/', respondWithAllTweets);
  router.get('/tweets', respondWithAllTweets);

  // single-user page
  router.get('/users/:username', function(req, res, next){
    client.query('SELECT name, content, pictureurl, tweets.id FROM tweets, users WHERE tweets.userid = users.id AND name = $1',[req.params.username] , function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });
  });

  // single-tweet page
  router.get('/tweets/:id', function(req, res, next){
    client.query('SELECT name, content, pictureurl, tweets.id FROM tweets, users WHERE tweets.userid = users.id AND tweets.id = $1',[req.params.id], function (err, result) {
      if (err) return next(err); // pass errors to Express
      var tweets = result.rows;
      res.render('index', { title: 'Twitter.js', tweets: tweets, showForm: true });
    });
  });



  // create a new tweet
  router.post('/tweets', function(req, res, next){
    client.query('SELECT id FROM users WHERE name = $1', [req.body.name], function (err, result) {
      if (err) return next(err);
      console.log(result);
      if (result.rows[0]) {
        client.query('INSERT INTO tweets (userid, content) VALUES ($1, $2)', [result.rows[0].id, req.body.content], function (err, data) {
          if (err) return next(err);
          //io.sockets.emit('new_tweet', newTweet);
          res.redirect('/');
        });
      }
      else {
        client.query('SELECT COUNT(id) as num FROM users', function (err2, result2) {
          if (err2) return next(err2);
          var count = Number(result2.rows[0].num);
          client.query('INSERT INTO users (id, name) VALUES ($1, $2)', [count + 1, req.body.name], function (err3, data) {
            if (err3) return next(err3);
          });
          client.query('INSERT INTO tweets (userid, content) VALUES ($1, $2)', [count + 1, req.body.content], function (err4, data) {
          if (err4) return next(err);
          //io.sockets.emit('new_tweet', newTweet);
          res.redirect('/');
        });
      });
    }

    });


  });

  // // replaced this hard-coded route with general static routing in app.js
  // router.get('/stylesheets/style.css', function(req, res, next){
  //   res.sendFile('/stylesheets/style.css', { root: __dirname + '/../public/' });
  // });

  return router;
}
