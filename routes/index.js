var express = require('express');
var router = express.Router();
var categorize = require('./../lib/javascripts/categories.js');
var mongo = require('../lib/javascripts/mongo.js');


/* GET home page. */
router.get('/', function(req, res, next) {

  res.render('index', {user: req.session.username});
});
// Events Page
router.get('/events', function (req, res, next) {
  console.log(req.query);
  categorize.apiCall(JSON.stringify(req.query), function (info) {
    // console.log(info);
    res.render('events', {events: JSON.stringify(info)});
  });
});

router.get('/logout', function(req, res, next){
  req.session = null;
  res.redirect('/');
})

router.get('/login', function (req, res, next) {
  res.render('funfinder/login')
})

router.post('/login', function(req, res, next){
  var errors = [];
  if(req.body.username === ""){
    errors.push("Username cannot be left blank")
  }
  if(req.body.password === ""){
    errors.push("Password cannot be left blank")
  }
  if(errors.length === 0){
    mongo.login(req.body, res, req).then(function(){

    })
  }
  else {
    res.render('funfinder/login', {errors: errors})
  }
})

router.get('/create-account', function(req, res, next) {
  res.render('funfinder/create-account')
})

router.post('/create-account', function(req, res, next) {
  var errors = [];
  if(req.body.username === ""){
    errors.push("Username cannot be left blank")
  }
  if(req.body.password === ""){
    errors.push("Password cannot be left blank")
  }
  if(req.body.confirm === ""){
    errors.push("You must confirm your password")
  }
  if(req.body.password.length < 6){
    errors.push("Your password must be at least 6 characters long")
  }
  if(req.body.password != req.body.confirm){
    errors.push("Your passwords do not match, please re-enter them carefully")
  }
  if(errors.length === 0){
    mongo.newAccount(req.body).then(function(){
      req.session.username = req.body.username
      res.redirect('/');
    })
  } else {
    res.render('funfinder/create-account', {errors: errors, data: req.body})
  }
})

module.exports = router;
