var express = require('express');
var router = express.Router();
var categorize = require('./../lib/javascripts/categories.js');
var mongo = require('../lib/javascripts/mongo.js');

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.username){
    mongo.findMe(req).then(function(user){
      res.render('index', {user: user});
    })
  } else {
    res.render('index');
  }
});

router.get('/favorites', function (req, res, next) {
  if(req.session.username){

    mongo.findEvents().then(function(events){
      mongo.findMe(req).then(function(profile){
        mongo.findMeInEvents(profile).then(function(profile){
          res.render('favorites', {user: req.session.username, profile: profile, events: events})
        })
      });
    })
  } else {
    res.redirect('/');
  }

});

router.post('/favorites', function(req, res, next){
  var info = (JSON.parse(req.body.data));
  console.log(info + ">>>>>>>>>>>>>>> post");
  mongo.insertFav(req, info);
})
// Events Page
router.get('/events', function (req, res, next) {

  categorize.apiCall(JSON.stringify(req.query), function (info) {
    // console.log(info);
    res.render('events', {events: JSON.stringify(info), user: req.session.username});
  });
});

router.get('/logout', function(req, res, next){
  req.session = null;
  res.redirect('/');
})

router.get('/login', function (req, res, next) {
  res.render('funfinder/login');
});

router.post('/login', function(req, res, next){
  var errors = [];
  if(req.body.username === ""){
    errors.push("Username cannot be left blank");
  }
  if(req.body.password === ""){
    errors.push("Password cannot be left blank");
  }
  if(errors.length === 0){
    req.body.username = req.body.username.toLowerCase();
    mongo.login(req.body, res, req).then(function(){
    });
  }
  else {
    res.render('funfinder/login', {errors: errors, data: req.body});
  }
});

router.get('/create-account', function(req, res, next) {
  res.render('funfinder/create-account');
});

router.post('/create-account', function(req, res, next) {
  var errors = [];
  if(req.body.username === ""){
    errors.push("Username cannot be left blank");
  }
  if(req.body.password === ""){
    errors.push("Password cannot be left blank");
  }
  if(req.body.confirm === ""){
    errors.push("You must confirm your password");
  }
  if(req.body.password.length < 6){
    errors.push("Your password must be at least 6 characters long");
  }
  if(req.body.password != req.body.confirm){
    errors.push("Your passwords do not match, please re-enter them carefully")
  }
  if(errors.length === 0){
    req.body.username = req.body.username.toLowerCase();
    mongo.newAccount(req.body, res, req);
  } else {
    res.render('funfinder/create-account', {errors: errors, data: req.body})
  }
});

router.post('/remove/:id', function(req, res, next){
  mongo.removeFavorite(req).then(function(){
    res.redirect('/favorites')
  })
})


module.exports = router;
