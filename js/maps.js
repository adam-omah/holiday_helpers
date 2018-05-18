var map, places, infoWindow;
var markers = [];
var exmarkers = [];
var autocomplete;
var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
var hostnameRegexp = new RegExp('^https?://.+?/');


function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 3,
    center: { lat: 37.1, lng: -95.7 },
    mapTypeControl: false,
    zoomControl: false,
    streetViewControl: false
  });

  infoWindow = new google.maps.InfoWindow({
    content: document.getElementById('info-content')
  });

  // Create the autocomplete object and associate it with the UI input control.
  // Restrict the search to to place type "cities".
  autocomplete = new google.maps.places.Autocomplete(
    /** @type {!HTMLInputElement} */
    (
      document.getElementById('autocomplete')), {
      types: ['(cities)'],
    });
  places = new google.maps.places.PlacesService(map);

  autocomplete.addListener('place_changed', onPlaceChanged);


  // Add a DOM event listener to react when the user selects a new type of recommendations.
  document.getElementById('selecttype').addEventListener(
    'change', typeChanged);

}

function typeChanged() {
  var selectedType = document.getElementById('selecttype').value;
  clearMarkers();
  search();
}

// When the user selects a city, get the place details for the city and
// zoom the map in on the city.
function onPlaceChanged() {
  var place = autocomplete.getPlace();
  if (place.geometry) {
    clearExMarkers();
    map.panTo(place.geometry.location);
    map.setZoom(15);
    document.getElementById('controls2').style.display = "inline-block";
    document.getElementById('controls1').style.display = "flex";
    document.getElementById('initialwindow').style.display = "none";
    document.getElementById('rec-title').style.display = "inline-block";
    search();

  }
  else {
    document.getElementById('autocomplete').placeholder = 'Enter a city';
  }
}


// Search for hotels in the selected city, within the viewport of the map. (Original Function)
// Edited to Search For selected type from dropdown menu.*****
function search() {
  var selectedType = document.getElementById('selecttype').value;
  var search = {
    bounds: map.getBounds(),
    types: [selectedType]
  };

  places.nearbySearch(search, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      clearMarkers();
      showRecomendations(results);

      // Create a marker for each amenity found, and
      // assign a letter of the alphabetic to each marker icon.
      for (var i = 0; i < results.length; i++) {
        var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
        var markerIcon = MARKER_PATH + markerLetter + '.png';
        // Use marker animation to drop the icons incrementally on the map.
        markers[i] = new google.maps.Marker({
          position: results[i].geometry.location,
          animation: google.maps.Animation.DROP,
          icon: markerIcon
        });
        // If the user clicks a marker, show the details of that marker
        // in an info window.
        markers[i].placeResult = results[i];
        google.maps.event.addListener(markers[i], 'click', showInfo);
        setTimeout(dropMarker(i), i * 100);
      }
    }
  });
}

function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    if (markers[i]) {
      markers[i].setMap(null);
    }
  }
  markers = [];
}

function clearExMarkers() {
  for (var i = 0; i < exmarkers.length; i++) {
    if (exmarkers[i]) {
      exmarkers[i].setMap(null);
    }
  }
  exmarkers = [];
}

// places markers, adds results to a table.

function dropMarker(i) {
  return function() {
    markers[i].setMap(map);
  };
}

function dropExMarker(i) {
  return function() {
    exmarkers[i].setMap(map);
  };
}


// Get the place details for a place marker. Show the information in an info window,
// anchored on the marker that the user selected.
// Populates Photo's area when Marker is clicked if photos are present.
function showInfo() {
  var marker = this;
  places.getDetails({ placeId: marker.placeResult.place_id },
    function(place, status) {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        return;
      }
      infoWindow.open(map, marker);
      document.getElementById('info-section').style.display = "block";
      document.getElementById('map').style.width = "74vw";
      document.getElementById('info-section-place').style.display = "block";
      buildIWContent(place);
      showPhotos(place);
      buildISContent(place);
    });
}




// Load the place information into the HTML elements used by the info window.
function buildIWContent(place) {
  document.getElementById('iw-icon').innerHTML = '<img class="typeIcon" ' +
    'src="' + place.icon + '"/>';
  document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
    '" target = "_blank" >' + place.name + '</a></b>';
  document.getElementById('iw-address').textContent = place.vicinity;

  if (place.formatted_phone_number) {
    document.getElementById('iw-phone-row').style.display = '';
    document.getElementById('iw-phone').textContent =
      place.formatted_phone_number;
  }
  else {
    document.getElementById('iw-phone-row').style.display = 'none';
  }


  if (place.rating) {
    var ratingHtml = '';
    for (var i = 0; i < 5; i++) {
      if (place.rating < (i + 0.5)) {
        ratingHtml += '&#10025;';
      }
      else {
        ratingHtml += '&#10029;';
      }
      document.getElementById('iw-rating-row').style.display = '';
      document.getElementById('iw-rating').innerHTML = ratingHtml;
    }
  }
  else {
    document.getElementById('iw-rating-row').style.display = 'none';
  }

  // The regexp isolates the first part of the URL (domain plus subdomain)
  // to give a short URL for displaying in the info window.
  if (place.website) {
    var fullUrl = place.website;
    var website = hostnameRegexp.exec(place.website);
    if (website === null) {
      website = 'http://' + place.website + '/';
      fullUrl = website;
    }
    document.getElementById('iw-website-row').style.display = '';
    document.getElementById('iw-website').textContent = website;
  }
  else {
    document.getElementById('iw-website-row').style.display = 'none';
  }
}


function showRecomendations(results) {
  var i = 0;
  var c = 0;
  var d = 0;
  var x = 0;
  var e = 0;

  document.getElementById('photo-row').style.display = "flex";
  for (i = 0; i < results.length; i++) {
    if (results === undefined) { break; }
    if (results.photos === 1) { break; }
    if (results[i].photos) {
      if (results[i].photos === undefined) { continue; }
      if (results[i].rating === undefined) { continue; }
      if (results[i].rating < 4) { continue; }
      if (c == 4) { break; };
      places.getDetails({ placeId: results[i].place_id },
        function(place, status) {
          if (status !== google.maps.places.PlacesServiceStatus.OK) {
            return;
          }
          document.getElementById('rec-sec-icon' + d).innerHTML = '<img class="typeIcon" ' +
            'src="' + place.icon + '"/>';
          document.getElementById('rec-sec-url' + d).innerHTML = '<b><a href="' + place.url +
            '" target = "_blank" >' + place.name + '</a></b>';
          document.getElementById('rec-sec-address' + d).textContent = place.vicinity;

          if (place.formatted_phone_number) {
            document.getElementById('rec-sec-phone-row' + d).style.display = '';
            document.getElementById('rec-sec-phone' + d).textContent =
              place.formatted_phone_number;
          }
          else {
            document.getElementById('rec-sec-phone-row' + d).style.display = 'none';
          }

          for (x = 0; x < 3; x++) {
            if (place.photos[x] === undefined) { continue; }
            document.getElementById("recphoto" + d + x).src = place.photos[x].getUrl({ 'maxWidth': 350, 'maxHeight': 350 });
            document.getElementById("recphotoa" + d + x).href = place.photos[x].getUrl({ 'maxWidth': 350, 'maxHeight': 350 });
            if (x < 1) {
              document.getElementById("recphotob0" + d + x).src = place.photos[x].getUrl({ 'maxWidth': 350, 'maxHeight': 350 });
              document.getElementById("recphotob" + d + x).href = place.photos[x].getUrl({ 'maxWidth': 350, 'maxHeight': 350 });
            }
          }

          if (place.rating) {
            var ratingHtml = '';
            for (var i = 0; i < 5; i++) {
              if (place.rating < (i + 0.5)) {
                ratingHtml += '&#10025;';
              }
              else {
                ratingHtml += '&#10029;';
              }
              document.getElementById('rec-sec-rating-row' + d).style.display = '';
              document.getElementById('rec-sec-rating' + d).innerHTML = ratingHtml;
            }
          }
          else {
            document.getElementById('rec-sec-rating-row' + d).style.display = 'none';
          }

          // The regexp isolates the first part of the URL (domain plus subdomain)
          // to give a short URL for displaying in the info window.
          if (place.website) {
            var fullUrl = place.website;
            var website = hostnameRegexp.exec(place.website);
            if (website === null) {
              website = 'http://' + place.website + '/';
              fullUrl = website;
            }
            document.getElementById('rec-sec-website-row' + d).style.display = '';
            document.getElementById('rec-sec-websitetext' + d).textContent = fullUrl;
            document.getElementById("rec-sec-website" + d).href = place.website;
          }
          else {
            document.getElementById('rec-sec-website-row' + d).style.display = 'none';
          }
          d++;
        });
      c++;
    }
  }
  if (c < 3) {
    for (e = 0; e < results.length; e++) {
      if (results === undefined) { break; }
        if (c == 4) { break; }
        places.getDetails({ placeId: results[e].place_id },
          function(place, status) {
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
              return;
            }
            document.getElementById('rec-sec-icon' + d).innerHTML = '<img class="typeIcon" ' +
              'src="' + place.icon + '"/>';
            document.getElementById('rec-sec-url' + d).innerHTML = '<b><a href="' + place.url +
              '" target = "_blank" >' + place.name + '</a></b>';
            document.getElementById('rec-sec-address' + d).textContent = place.vicinity;

            if (place.formatted_phone_number) {
              document.getElementById('rec-sec-phone-row' + d).style.display = '';
              document.getElementById('rec-sec-phone' + d).textContent =
                place.formatted_phone_number;
            }
            else {
              document.getElementById('rec-sec-phone-row' + d).style.display = 'none';
            }
            if (place.photos){
            for (x = 0; x < 3; x++) {
              if (place.photos[x] === undefined) { continue; }
              document.getElementById("recphoto" + d + x).src = place.photos[x].getUrl({ 'maxWidth': 350, 'maxHeight': 350 });
              document.getElementById("recphotoa" + d + x).href = place.photos[x].getUrl({ 'maxWidth': 350, 'maxHeight': 350 });
              if (x < 1) {
                document.getElementById("recphotob0" + d + x).src = place.photos[x].getUrl({ 'maxWidth': 350, 'maxHeight': 350 });
                document.getElementById("recphotob" + d + x).href = place.photos[x].getUrl({ 'maxWidth': 350, 'maxHeight': 350 });
              }
            }
            }

            if (place.rating) {
              var ratingHtml = '';
              for (var i = 0; i < 5; i++) {
                if (place.rating < (i + 0.5)) {
                  ratingHtml += '&#10025;';
                }
                else {
                  ratingHtml += '&#10029;';
                }
                document.getElementById('rec-sec-rating-row' + d).style.display = '';
                document.getElementById('rec-sec-rating' + d).innerHTML = ratingHtml;
              }
            }
            else {
              document.getElementById('rec-sec-rating-row' + d).style.display = 'none';
            }

            // The regexp isolates the first part of the URL (domain plus subdomain)
            // to give a short URL for displaying in the info window.
            if (place.website) {
              var fullUrl = place.website;
              var website = hostnameRegexp.exec(place.website);
              if (website === null) {
                website = 'http://' + place.website + '/';
                fullUrl = website;
              }
              document.getElementById('rec-sec-website-row' + d).style.display = '';
              document.getElementById('rec-sec-websitetext' + d).textContent = fullUrl;
              document.getElementById("rec-sec-website" + d).href = place.website;
            }
            else {
              document.getElementById('rec-sec-website-row' + d).style.display = 'none';
            }
            d++;
          });
        c++;
    }
  }
}

function showPhotos(place) {
  // place photo, logging to test. Adds photo to photo section on clicked item.
  if (place.photos) {
    var i = 0;
    for (i = 0; i < 4; i++) {
      if (place.photos[i] === undefined) { continue; }
      document.getElementById("photo" + i).src = place.photos[i].getUrl({ 'maxWidth': 350, 'maxHeight': 350 });
      document.getElementById("photoa" + i).href = place.photos[i].getUrl({ 'maxWidth': 350, 'maxHeight': 350 });
      document.getElementById('photo-section0').style.display = "block";
      if (i < 1) {
        document.getElementById("photob0" + i).src = place.photos[i].getUrl({ 'maxWidth': 350, 'maxHeight': 350 });
        document.getElementById("photob" + i).href = place.photos[i].getUrl({ 'maxWidth': 350, 'maxHeight': 350 });
      }
    }
  }
  else {
    for (i = 0; i < 4; i++) {
      document.getElementById("photo" + i).src = "https://holiday-helper-adamomah.c9users.io/assests/hhbg1.png";
    }
  }
}

function searchForLodging() {
  if (document.getElementById('lodgingsearch').checked && document.getElementById('restaurantsearch').checked) {
    clearExMarkers();
    document.getElementById("restaurantsearch").checked = false;
    var search = {
      bounds: map.getBounds(),
      types: ['lodging']
    };

    places.nearbySearch(search, function(results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {

        // Create a marker for each amenity found
        for (var i = 0; i < results.length; i++) {
          var markerIcon = 'assests/Hotels.png';
          // Use marker animation to drop the icons incrementally on the map.
          exmarkers[i] = new google.maps.Marker({
            position: results[i].geometry.location,
            animation: google.maps.Animation.DROP,
            icon: markerIcon
          });
          exmarkers[i].placeResult = results[i];
          google.maps.event.addListener(exmarkers[i], 'click', showInfo);
          setTimeout(dropExMarker(i), i * 100);
        }
      }
    });
  }
  else if (document.getElementById('lodgingsearch').checked) {
    var search = {
      bounds: map.getBounds(),
      types: ['lodging']
    };

    places.nearbySearch(search, function(results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {

        // Create a marker for each amenity found
        for (var i = 0; i < results.length; i++) {
          var markerIcon = 'assests/Hotels.png';
          // Use marker animation to drop the icons incrementally on the map.
          exmarkers[i] = new google.maps.Marker({
            position: results[i].geometry.location,
            animation: google.maps.Animation.DROP,
            icon: markerIcon
          });
          exmarkers[i].placeResult = results[i];
          google.maps.event.addListener(exmarkers[i], 'click', showInfo);
          setTimeout(dropExMarker(i), i * 100);
        }
      }
    });
  }
  else {
    clearExMarkers();
  }

}

function searchForFood() {
  if (document.getElementById('restaurantsearch').checked && document.getElementById('lodgingsearch').checked) {
    clearExMarkers();
    document.getElementById("lodgingsearch").checked = false;
    var search = {
      bounds: map.getBounds(),
      types: ['restaurant']
    };

    places.nearbySearch(search, function(results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {

        // Create a marker for each Restaurant found
        for (var i = 0; i < results.length; i++) {
          var markerIcon = 'assests/Restaurants.png';
          // Use marker animation to drop the icons incrementally on the map.
          exmarkers[i] = new google.maps.Marker({
            position: results[i].geometry.location,
            animation: google.maps.Animation.DROP,
            icon: markerIcon
          });
          exmarkers[i].placeResult = results[i];
          google.maps.event.addListener(exmarkers[i], 'click', showInfo);
          setTimeout(dropExMarker(i), i * 100);
        }
      }
    });
  }
  else if (document.getElementById('restaurantsearch').checked) {
    var search = {
      bounds: map.getBounds(),
      types: ['restaurant']
    };

    places.nearbySearch(search, function(results, status) {
      if (status === google.maps.places.PlacesServiceStatus.OK) {

        // Create a marker for each Restaurant found
        for (var i = 0; i < results.length; i++) {
          var markerIcon = 'assests/Restaurants.png';
          // Use marker animation to drop the icons incrementally on the map.
          exmarkers[i] = new google.maps.Marker({
            position: results[i].geometry.location,
            animation: google.maps.Animation.DROP,
            icon: markerIcon
          });
          exmarkers[i].placeResult = results[i];
          google.maps.event.addListener(exmarkers[i], 'click', showInfo);
          setTimeout(dropExMarker(i), i * 100);
        }
      }
    });
  }
  else {
    clearExMarkers();
  }
}


function buildISContent(place) {
  document.getElementById('is-icon').innerHTML = '<img class="typeIcon" ' +
    'src="' + place.icon + '"/>';
  document.getElementById('is-url').innerHTML = '<b><a href="' + place.url +
    '" target = "_blank" >' + place.name + '</a></b>';
  document.getElementById('is-address').textContent = place.vicinity;

  if (place.formatted_phone_number) {
    document.getElementById('is-phone-row').style.display = '';
    document.getElementById('is-phone').textContent =
      place.formatted_phone_number;
  }
  else {
    document.getElementById('is-phone-row').style.display = 'none';
  }


  if (place.rating) {
    var ratingHtml = '';
    for (var i = 0; i < 5; i++) {
      if (place.rating < (i + 0.5)) {
        ratingHtml += '&#10025;';
      }
      else {
        ratingHtml += '&#10029;';
      }
      document.getElementById('is-rating-row').style.display = '';
      document.getElementById('is-rating').innerHTML = ratingHtml;
    }
  }
  else {
    document.getElementById('is-rating-row').style.display = 'none';
  }

  // The regexp isolates the first part of the URL (domain plus subdomain)
  // to give a short URL for displaying in the info window.
  if (place.website) {
    var fullUrl = place.website;
    var website = hostnameRegexp.exec(place.website);
    if (website === null) {
      website = 'http://' + place.website + '/';
      fullUrl = website;
    }
    document.getElementById('is-website-row').style.display = '';
    document.getElementById('is-website').href = place.website;
    document.getElementById('is-websitetext').textContent = website;
  }
  else {
    document.getElementById('is-website-row').style.display = 'none';
  }
}
