var data = JSON.parse(document.getElementsByClassName('hidden')[0].innerHTML);
var events = data;
var title = document.getElementsByClassName('title')[0];
var description = document.getElementsByClassName('description')[0];
var startTime = document.getElementsByClassName('start-time')[0];
var venueAddress = document.getElementsByClassName('venue-address')[0];
var latitude = document.getElementsByClassName('latitude')[0];
var longitude = document.getElementsByClassName('longitude')[0];
// var mainImage = document.getElementsByClassName('main-image')[0];
var website = document.getElementsByClassName('website')[0];
var exploreButton = document.getElementById('button grad transition');
var len = events.length;
var duplicateCheck = [];
var favs = {};

var randomizer = function (events, len) {
  var randomInterest = Math.floor(Math.random() * len);
  var randomCat = Math.floor(Math.random() * 4);
  var randomEvent = Math.floor(Math.random() * 9);
  var num = String(randomInterest) + String(randomCat) + String(randomEvent);
  var trigger = 0;
  for (var i = 0; i < duplicateCheck.length; i++) {
    if(duplicateCheck[i] === num){
      console.log(duplicateCheck[i], num);
      trigger ++;
    }
  }

  var specificEvent = events[randomInterest].categories[randomCat];

  if(trigger === 0 && specificEvent.titles[randomEvent]) {
    duplicateCheck.push(num);
    title.innerHTML = specificEvent.titles[randomEvent];
    description.innerHTML = specificEvent.description[randomEvent];
    startTime.innerHTML = specificEvent.startTime[randomEvent];
    venueAddress.innerHTML = specificEvent.venueAddress[randomEvent] + '<br>' + events[randomInterest].city + '</br>';
    console.log(events[randomInterest].categories[randomCat]);
    latitude.innerHTML = specificEvent.latitude[randomEvent];
    longitude.innerHTML = specificEvent.longitude[randomEvent];
    website.href = specificEvent.website[randomEvent];
    website.innerHTML = specificEvent.titles[randomEvent];
    var category = events[randomInterest].name.charAt(0).toUpperCase() + events[randomInterest].name.slice(1);
    // mainImage.style = 'background-image:' + specificEvent.mainImage[randomEvent].medium.url + ';';

    console.log(typeof specificEvent.website[randomEvent]);
    console.log(specificEvent.venueAddress[randomEvent])

    favs = {title: specificEvent.titles[randomEvent], description:   specificEvent.description[randomEvent].replace("http://","" ).replace("www", ""),
            time: specificEvent.startTime[randomEvent], address: specificEvent.venueAddress[randomEvent],
            category: category};
    // Google Maps
    function initialize() {
      var myLatlng = new google.maps.LatLng(latitude.innerHTML,longitude.innerHTML);

      var mapOptions = {
        center:  myLatlng,
        zoom: 15
      }
      var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

      var marker = new google.maps.Marker({
          position:  myLatlng,
          map: map,
          title: 'Hello World!'
      });
    }

    //test to see if this func fixes second load map issue
    //can't check, does not work locally or pushing to heroku for me -- ashley
    // $timeout(function() {
    //   google.maps.events.trigger(map, 'resize');
    // });

    console.log(duplicateCheck.length)
    if(duplicateCheck.length === 1) {
      google.maps.event.addDomListener(window, 'load', initialize);
      return favs;
    } else {
      google.maps.event.addDomListener(exploreButton, 'click', initialize);
      return favs
    }

  } else  {
    console.log(trigger);
    trigger = 0;
    randomizer(events, len);
  }
}

randomizer(events, len);


exploreButton.addEventListener('click', function () {
  randomizer(events, len);

});
