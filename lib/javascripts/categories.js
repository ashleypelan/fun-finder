var unirest = require('unirest');
var baseURL = 'http://api.eventful.com/json/events/search?app_key=' + process.env.EVENTFUL_KEY + '&keywords=';
var underscore = require('underscore.string');

function Category (name, array) {
  var titles = [];
  var description = [];
  var startTime = [];
  var stopTime = [];
  var venue = [];
  var venueAddress = [];
  var latitude = [];
  var longitude = [];
  var website = [];
  // var mainImage = [];

  for (var i = 0; i < array.length; i++) {
    titles.push(array[i].title);
    if(array[i].description === '' || array[i].description === null || array[i].description === undefined || array[i].description === " ") {
      description.push('Sorry, there is no description available fo this event.at');
    } else {
      description.push(underscore.stripTags(underscore.unescapeHTML(array[i].description)));
    }
    startTime.push((array[i].start_time).date("DDDD MMMM DD, YYYY @ H:mm A"));
    stopTime.push(array[i].stop_time);
    venue.push(array[i].venue);
    venueAddress.push(array[i].venue_address);
    latitude.push(array[i].latitude);
    longitude.push(array[i].longitude);
    website.push(array[i].url)
    // mainImage.push(array[i].image);
  }

  this.name = name;
  this.titles = titles;
  this.description = description;
  this.startTime = startTime;
  this.stopTime = stopTime;
  this.venue = venue;
  this.venueAddress = venueAddress;
  this.latitude = latitude;
  this.longitude = longitude;
  this.website = website;
  // this.mainImage = mainImage;
  // console.log('**** mainImage *****', this.mainImage);
}

function Interest(name, city) {
  this.name = name;
  this.city = city;
}

Interest.prototype.API = function (categories, output, interest, city, cb, counter) {
  var info = [];
  unirest.get(baseURL + categories[0] + '&location=' + city +'&date=Future',
  function (data) {
    var response = JSON.parse(data.body);
    info.push(new Category(categories[0], response.events.event));

    unirest.get(baseURL + categories[1] + '&location=' + city + '&date=Future',
    function (data2) {
      var response2 = JSON.parse(data2.body);
      info.push(new Category(categories[1], response2.events.event));

      unirest.get(baseURL + categories[2] + '&location=' + city + '&date=Future',
      function (data3) {
        var response3 = JSON.parse(data3.body);
        info.push(new Category(categories[2], response3.events.event));

        unirest.get(baseURL + categories[3] + '&location=' + city + '&date=Future',
        function (data4) {
          var response4 = JSON.parse(data4.body);
          info.push(new Category(categories[3], response4.events.event));

          // console.log(info);
          counter(info, output, interest, cb);
        });
      });
    });
  });
}

var trigger = 0;
var counter = function (info, output, interest, cb) {
  // console.log(interest);
  for (var i = 0; i < output.length; i++) {
    if(output[i].name === interest) {
      output[i].categories = info;
    }
  }
  trigger ++;
  if (trigger === output.length) {
    trigger = 0;
    cb(output);
  }
}

var filterCategories = function (input, cb) {
  var outdoors = ['outdoors_recreation', 'animals', 'sports', 'festivals_parades'];
  var nightLife = ['comedy', 'film', 'food', 'singles_social'];
  var family = ['learning', 'family_fun_kids', 'attractions', 'community'];
  var arts = ['music', 'books', 'art', 'performing_arts'];
  // var free = [];
  var categories = {outdoors: outdoors, nightLife: nightLife, family: family, arts: arts};
  var city = input.split(/,/g)[0].replace(/[{}:"',&]/g, '').replace('city', '');
  var userSelections = input.split(/,/g);
  userSelections.splice(0, 1);
  var interests = userSelections.join(',').replace(/[{}:"',&]/g, '').split('on');
  var len = interests.length -1;
  interests.splice(len, 1);
  var output = [];

  interests.forEach(function (int, n) {
    output.push(new Interest(int, city));
    output[n].API(categories[int], output, int, city, cb, counter);
  });
}

module.exports = {
  apiCall: filterCategories
}
