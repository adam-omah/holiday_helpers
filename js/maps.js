var map, places, infoWindow;
var markers = [];
var autocomplete;
var MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
var hostnameRegexp = new RegExp('^https?://.+?/');



function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 3,
    center: { lat: 37.1, lng: -95.7 },
    mapTypeControl: false,
    panControl: false,
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
  console.log(selectedType);
  clearResults();
  clearMarkers();
  search();
}

// When the user selects a city, get the place details for the city and
// zoom the map in on the city.
function onPlaceChanged() {
  var place = autocomplete.getPlace();
  if (place.geometry) {
    map.panTo(place.geometry.location);
    map.setZoom(15);
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
  console.log(selectedType);
  var search = {
    bounds: map.getBounds(),
    types: [selectedType]
  };

  places.nearbySearch(search, function(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
      clearResults();
      clearMarkers();
      // Create a marker for each hotel found, and
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
        // If the user clicks a hotel marker, show the details of that hotel
        // in an info window.
        markers[i].placeResult = results[i];
        google.maps.event.addListener(markers[i], 'click', showInfoWindow);
        setTimeout(dropMarker(i), i * 100);
        addResult(results[i], i);
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

// places markers, adds results to a table.

function dropMarker(i) {
  return function() {
    markers[i].setMap(map);
  };
}

function addResult(result, i) {
  var results = document.getElementById('results');
  var markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
  var markerIcon = MARKER_PATH + markerLetter + '.png';

  var tr = document.createElement('tr');
  tr.style.backgroundColor = (i % 2 === 0 ? '#F0F0F0' : '#FFFFFF');
  tr.onclick = function() {
    google.maps.event.trigger(markers[i], 'click');
  };

  var iconTd = document.createElement('td');
  var nameTd = document.createElement('td');
  var icon = document.createElement('img');
  icon.src = markerIcon;
  icon.setAttribute('class', 'placeIcon');
  icon.setAttribute('className', 'placeIcon');
  var name = document.createTextNode(result.name);
  iconTd.appendChild(icon);
  nameTd.appendChild(name);
  tr.appendChild(iconTd);
  tr.appendChild(nameTd);
  results.appendChild(tr);
}

function clearResults() {
  var results = document.getElementById('results');
  while (results.childNodes[0]) {
    results.removeChild(results.childNodes[0]);
  }
}

// Get the place details for a hotel. Show the information in an info window,
// anchored on the marker for the hotel that the user selected.
function showInfoWindow() {
  var marker = this;
  places.getDetails({ placeId: marker.placeResult.place_id },
    function(place, status) {
      if (status !== google.maps.places.PlacesServiceStatus.OK) {
        return;
      }
      infoWindow.open(map, marker);
      buildIWContent(place);
      removePhotos(place);
      showPhotos(place);
    });
}

function removePhotos(place) {
  var photos1 = document.getElementById("photo");
  var photos2 = document.getElementById("photo2");
  var photos3 = document.getElementById("photo3");
  var photos4 = document.getElementById("photo4");

  if (photos1.hasChildNodes()) {
    photos1.removeChild(photos1.firstChild);
  }
  if (photos2.hasChildNodes()) {
    photos2.removeChild(photos2.firstChild);
  }
  if (photos3.hasChildNodes()) {
    photos3.removeChild(photos3.firstChild);
  }
  if (photos4.hasChildNodes()) {
    photos4.removeChild(photos4.firstChild);
  }
}

function showPhotos(place) {
  // place photo, logging to test. Adds photo to photo section on clicked item.

  var photos1 = document.getElementById("photo");
  var photos2 = document.getElementById("photo2");
  var photos3 = document.getElementById("photo3");
  var photos4 = document.getElementById("photo4");

  var photo = place.photos[0].getUrl({ 'maxWidth': 350, 'maxHeight': 350 });
  var photo2 = place.photos[1].getUrl({ 'maxWidth': 350, 'maxHeight': 350 });
  var photo3 = place.photos[2].getUrl({ 'maxWidth': 350, 'maxHeight': 350 });
  var photo4 = place.photos[3].getUrl({ 'maxWidth': 350, 'maxHeight': 350 });
  var photoinfo1 = place.photos[0].html_attributions;
  var photoinfo2 = place.photos[1].html_attributions;
  var photoinfo3 = place.photos[2].html_attributions;
  var photoinfo4 = place.photos[3].html_attributions;

  console.log(photo);
  console.log(photoinfo1);
  console.log(typeof "photoinfo1");
  console.log(typeof "photo");


  var img = document.createElement("IMG");
  img.src = photo;

  photos1.appendChild(img);
  console.log(img);
  document.getElementById("photoinfo").innerHTML = photoinfo1;


  var img2 = document.createElement("IMG");
  img2.src = photo2;
  photos2.appendChild(img2);
  console.log(img2);
  document.getElementById("photoinfo2").innerHTML = photoinfo2;


  var img3 = document.createElement("IMG");
  img3.src = photo3;
  photos3.appendChild(img3);
  console.log(img3);
  document.getElementById("photoinfo3").innerHTML = photoinfo3;


  var img4 = document.createElement("IMG");
  img4.src = photo4;
  photos4.appendChild(img4);
  console.log(img4);
  document.getElementById("photoinfo4").innerHTML = photoinfo4;
}


// Load the place information into the HTML elements used by the info window.
function buildIWContent(place) {
  document.getElementById('iw-icon').innerHTML = '<img class="typeIcon" ' +
    'src="' + place.icon + '"/>';
  document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
    '">' + place.name + '</a></b>';
  document.getElementById('iw-address').textContent = place.vicinity;

  if (place.formatted_phone_number) {
    document.getElementById('iw-phone-row').style.display = '';
    document.getElementById('iw-phone').textContent =
      place.formatted_phone_number;
  }
  else {
    document.getElementById('iw-phone-row').style.display = 'none';
  }

  // Assign a five-star rating to the hotel, using a black star ('&#10029;')
  // to indicate the rating the hotel has earned, and a white star ('&#10025;')
  // for the rating points not achieved.


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
