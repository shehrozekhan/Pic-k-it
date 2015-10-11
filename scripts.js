/*** Just for animation ***/
function scrollToDiv(mapDiv, callback){
    var animation = {scrollTop: $(mapDiv).offset().top};
    $('html,body').animate(animation, 'slow', 'swing', function() {
        if (typeof callback == 'function') {
            callback();
        }
        callback = null;
    });
}

/*** SETTING UP GOOGLE MAP ***/
var map;

function addMapContent() {
	$('#map-content').html('');
	var text = '<div id="map-title">Discover What\'s Trending</div>';
	var mapDiv = '<div id="map"></div>';
	var button = '<a href="#" id="discover" class="btn blue">our pic(k)s</a>'

	$('#map-content').append(text);
	$('#map-content').append(mapDiv);
	$('#map-content').append(button);

	$('#discover').click(function() {
		scrollToDiv('#insta-photos');
	});
}

function addMarkers(map, lat, lng) {
	var image = {
		url: 'flag.png',
		origin: new google.maps.Point(0, 0),
    	// The anchor for this image is the base of the flagpole at (0, 32).
    	anchor: new google.maps.Point(0, 32)
	};

	// Creating markers for instargam photo locations
	marker = new google.maps.Marker({
		map: map,
		position: {lat: lat, lng: lng},
		icon: image
	});
}

function initializeMap(lat, lng) {
	addMapContent();

	var mapCanvas = document.getElementById('map');
    var mapOptions = {
    	center: new google.maps.LatLng(lat, lng),
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.HYBRID
    }
    map = new google.maps.Map(mapCanvas, mapOptions);

    // Creating a marker on the map for the input location
    marker = new google.maps.Marker({
    	map: map,
    	animation: google.maps.Animation.DROP,
    	position: {lat: lat, lng: lng}
  	});
  	// Making the marker bounce
  	marker.setAnimation(google.maps.Animation.BOUNCE);

  	var circle = new google.maps.Circle({
  		map: map,
  		radius: 1500,
  		fillColor: '#00AA00'
	});
	circle.bindTo('center', marker, 'position');
	
	scrollToDiv('#map-content');

}
/*** MAP READY TO ROLL ***/


/*** RETRIEVING AND DISPLAYING INSTAGRAM PHOTOS ***/
function displayInstaPhotos(imgURL, message) {
	var thePics = '<div class="frame"><img src="' + imgURL + '"/>' + '<p>@' + message + '</p></div>';
	$('#insta-photos').append(thePics);
}

function getInstaPhotos(lat, lng){
	var instaKey = '5614425b292c4da88d79b47fbfb022af';		
	var instaURL = 'https://api.instagram.com/v1/media/search?lat=' + lat + '&lng=' + lng + '&radius=1500&client_id=' + instaKey;

	$.ajax({
		url: instaURL,
		type: 'GET',
		dataType: 'jsonp',
		error: function(err) {
			console.log("Can't retrive photos.");
			console.log(err);
		},
		success: function(data) {
			console.log("I'm working!");
			var instaData = data.data;
			
			if(instaData.length === 0) {
				alert("Couldn't fetch photos. Enter new location.");
			}

			console.log(instaData);

			// For multiple searches
			$('#insta-photos').remove();
			var instaDiv = '<div id="insta-photos"></div>';
			$('#main-container').append(instaDiv);

			for(var i=0; i<instaData.length; i++) {
				var imageURL = instaData[i].images.low_resolution.url;
				var place = instaData[i].location.name;
				
				displayInstaPhotos(imageURL, place);

				// Adding additional markers for pic locations
				var locLat = instaData[i].location.latitude;
				var locLng = instaData[i].location.longitude;
				addMarkers(map, locLat, locLng);
			}
		}
	})
}
/*** PHOTOS ARE SET TO GO ***/


/*** GET LAT/LONG FROM USER ***/
function getCoord(location) {
	var tempString = 'Discovering ' + location + '...';
	$('#content').html(tempString);

	var geocodeURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + location + '&key=AIzaSyBiUElG8RIzkjCq22A22UZEUAY-MpsaUQE';
	
	$.ajax({
		url: geocodeURL,
		type: 'GET',
		dataType: 'json', 
		error: function(data) {
			console.log("We got problems.");
			console.log(data);
		},
		success: function(data) {
			if(data.results.length === 0) {
				alert("Could not find location.")
			}
			// Obtaining and parsing the spearate coordinates
			var searchResult = data.results[0].geometry.location;
			var lat = searchResult.lat;
			var lng = searchResult.lng;

			initializeMap(lat, lng);
			getInstaPhotos(lat, lng);
		}
	});
}

/*** ALL SET ***/
$(document).ready(function() {
	$('#explore').click(function() {
		var location = $('#input-loc').val();
		getCoord(location);
	});

	$('#try-it').click(function() {
		scrollToDiv('#banner');
		alert('Pic(k) a place to explore!');
	});

	$(window).scroll(function() {
		if ( $(window).scrollTop() > 1500 ) {
			$('a.back-to-top').fadeIn('slow');
		} else {
			$('a.back-to-top').fadeOut('slow');
		}
	});

	$('a.back-to-top').click(function() {
		$('body, html').animate({
			scrollTop: 0
		}, 700);
		return false;
	});
})
