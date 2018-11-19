function addReminder() {
    return `
    <div class="formTitle"><h1>Create a Reminder</h1></div>
        <form class="form" action="/createreminder" method="POST">
            <div class="placeholder">
                <label>Public:
                <input type="checkbox" name="is_public" checked="true"/>
                </label>
                <label>Latitude: 
                <div class="form-row">
                    <input type="text" name="latitude" data-lat/>
                </div>
                </label>
                <label>Longitude:
                <div class="form-row">
                    <input type="text" name="longitude" data-lon/>
                </div>
                </label>
                <label>Reminder: 
                <div class="form-row">
                    <input type="text" name="reminder"/>
                </div>
                </label>
                <button>Submit</button>
            </div>
        </form>
        <a href ="/list"> List of GeoMindrs</a><br>
        <a href ="/home"> Go to GeoMindr Menu</a>
        <script>
            let lats;
            let longs;
            if (navigator.geolocation) {       
                navigator.geolocation.getCurrentPosition(function(location) {
                    lats = location.coords.latitude;
                    longs = location.coords.longitude;
                    console.log("Your Lat/Lon: " + lats + "/" + longs);
                    document.querySelector('[data-lat]').value = lats;
                    document.querySelector('[data-lon]').value = longs;
                })}
        </script>
        
        `;
}

module.exports = addReminder;
