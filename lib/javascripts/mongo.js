// var bcrypt = require('bcrypt');
var mongoose = require("mongoose");
mongoose.connect(process.env.MONGOLAB_URI);
mongoose.set('debug', true);

var userSchema = new mongoose.Schema({
    username: String,
    password: String
  });

var favoritesSchema = new mongoose.Schema({
    title: String,
    description: String,
    time: String,
    address: String,
    category: String,
    userIds: []
  });

var users =  mongoose.model("users", userSchema);
var favorites =  mongoose.model("favorites", favoritesSchema);


module.exports = {

  removeFavorite: function(req) {
    return users.findOne({username: req.session.username}).then(function(user){
      return favorites.findOneAndUpdate({_id: req.params.id},
                                          {$pop: {userIds: user._id}})
      });

  },

  findMeInEvents: function(data){
    var array = [];
    return favorites.find().then(function (allFavorites){
      for(var i = 0; i < allFavorites.length; i++){
        console.log(allFavorites[i].userIds.length);
        for(var j = 0; j < allFavorites[i].userIds.length; j++){
          if(data._id.toString() === allFavorites[i].userIds[j].toString()){
            array.push(allFavorites[i]._id);
          }
        }
      }
      return favorites.find({_id: {$in: array}});
    });

  },

  findEvents: function(){
    return favorites.find();
  },

  findMe: function (req) {
    return users.findOne({username: req.session.username});
  },

  newAccount: function(data, res, req) {
    var hash = bcrypt.hashSync(data.password, 8);
    return users.findOne({username: req.body.username}).then(function(newdata){
      console.log(newdata);
      var errors = [];
        if(newdata){
          errors.push("This username has already been used");
          res.render('funfinder/create-account', {errors: errors});
        }
        else {
          return users.create({username: data.username,
                        password: hash}).then(function(){
                          req.session.username = req.body.username;
                          res.redirect('/')
                        });
        }

    });
  },

  login: function(data, res, req) {
    return users.findOne({username: data.username}).then(function(dbdata){
      if(dbdata);
      var crypt = bcrypt.compareSync(data.password, dbdata.password);
        if(crypt) {
          req.session.username = req.body.username;
          res.redirect('/');
      } else {
          var errors = [];
          errors.push("Unable to find username/password combination");
          res.render('funfinder/login', {errors: errors});
        }
    });
  },

  insertFav: function(req, info){
    return users.findOne({username: req.session.username}).then(function(user){
      return favorites.findOneAndUpdate({title: info.title},
                              {title: info.title,
                               description: info.description,
                               time: info.time,
                               address: info.address,
                               category: info.category,
                               $addToSet: {userIds: user._id}},
                                {"upsert": true})
    });
  }
};
