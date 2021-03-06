

let map;

function getLocation(cb) {              // gets user location using geolocation api
    let lats;
    let longs;
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function (location) {
            lats = location.coords.latitude;
            longs = location.coords.longitude;
            console.log("Your Lat/Lon: " + lats + "/" + longs);
            cb({ 'myLat': lats, 'myLon': longs });
        })
    } else {
        let lats_longs = new google.maps.LatLng(33.8486179, -84.3731044);
        lats = lats_longs.lat();
        longs = lats_longs.lng();
        console.log("Test Lat/Lon: " + lats + "/" + longs);
        cb({ 'myLat': lats, 'myLon': longs });
    }
}

function initMap() {                    // initial paint of the Google map centered on user
    getLocation(function (myLatLon) {
        let myGPS = { lat: parseFloat(myLatLon.myLat), lng: parseFloat(myLatLon.myLon) };
        // let map = new google.maps.Map(document.getElementById('map'), {
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 18,
            center: myGPS
        });

        // Create a marker and set its position.
        marker = new google.maps.Marker({
            // map: map,
            position: myGPS,
            map: map,
            title: 'Your location',
            draggable: true
        });
        google.maps.event.addListener(marker, 'dragend', function (event) {
            markerLocation();
        });

        google.maps.event.addListener(map, 'click', function (event) {
            //Get the location that the user clicked.
            marker.setPosition(event.latLng);

            //Get the marker's location.
            markerLocation();
        });
    })
}

function markerLocation() {
    //Get location.
    var currentLocation = marker.getPosition();
    //Add lat and lng values to a field that we can save.
    // console.log("LAT:", currentLocation.lat()); //latitude
    // console.log("LON:", currentLocation.lng()); //longitude
    document.querySelector('[data-lat]').value = parseFloat(currentLocation.lat());
    document.querySelector('[data-lon]').value = parseFloat(currentLocation.lng());
}


function initPubMap() {                    // initial paint of the Google map centered on user
    getLocation(function (myLatLon) {
        let myGPS = { lat: parseFloat(myLatLon.myLat), lng: parseFloat(myLatLon.myLon) };
        // let map = new google.maps.Map(document.getElementById('map'), {
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 11,
            center: myGPS
        });

        let markerArray = getMarkers();
        // Create a marker and set its position.
        markerArray.forEach(geoMindr => {
            let latlon = new google.maps.LatLng(geoMindr.lat, geoMindr.lon);
            let marker = new google.maps.Marker({
                position: { lat: latlon.lat(), lng: latlon.lng() },
                map: map,
                title: `${geoMindr.username}: ${geoMindr.reminder}`,
            });
        })
    })
}

function getMarkers() {
    let td = document.querySelectorAll('[data-username]');
    td = [...td];
    td = td.map(x => x.dataset)
    return td;
}


function initUpdateMap() {
    // paint the Google map centered on the reminder being updated
    let lats = Number(document.querySelector('[data-lat]').value);
    let longs = Number(document.querySelector('[data-lon]').value);
    let lats_longs = new google.maps.LatLng(lats, longs);
    let myGPS = { lat: lats_longs.lat(), lng: lats_longs.lng() };

    // let map = new google.maps.Map(document.getElementById('map'), {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: myGPS
    });

    // Create a marker and set its position.
    marker = new google.maps.Marker({
        position: myGPS,
        map: map,
        title: document.querySelector('[data-reminder]').value,
        draggable: true
    });

    google.maps.event.addListener(marker, 'dragend', function (event) {
        markerLocation();
    });

    google.maps.event.addListener(map, 'click', function (event) {
        //Get the location that the user clicked.
        marker.setPosition(event.latLng);

        //Get the marker's location.
        markerLocation();
    });

}

function getMarkers() {
    let td = document.querySelectorAll('[data-username]');
    td = [...td];
    td = td.map(x => x.dataset)
    return td;
}


var marker = false;
var geoMarker;
getLocation(function (myLatLon) {
    const inpLat = document.querySelector('[data-lat]');
    const inpLon = document.querySelector('[data-lon]');

    if (inpLat != null) {
        inpLat.value = parseFloat(myLatLon.myLat);
        inpLon.value = parseFloat(myLatLon.myLon);
    }
});
function youSure(id) {
    var accept = confirm("Are you sure you want to delete this GeoMindr?");
    if (accept) { document.open(`/delete/${id}`) }
}

function focusReminder(remLat, remLon) {
    let myGPS = { lat: remLat, lng: remLon };

    geoMarker = new google.maps.Marker({
        position: myGPS,
        map: map,
        icon: {url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"}
    });
}

function blurReminder(remLat, remLon) {
    let myGPS = { lat: remLat, lng: remLon };
    geoMarker = new google.maps.Marker({
        position: myGPS,
        map: map
    });
}