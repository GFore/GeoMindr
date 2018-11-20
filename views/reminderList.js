function reminderToItem(reminderObject) {
    return `
        <li
            data-username="${reminderObject.username}"
            data-reminder="${reminderObject.reminder}"
            data-lat="${reminderObject.latitude}"
            data-lon="${reminderObject.longitude}"
        >
            ${reminderObject.reminder} <button><a href='/mylist/${reminderObject.id}/edit'>Edit</a></button> | <button onclick="youSure()"><a href='/delete/${reminderObject.id}'>Delete</a></button>
        </li>                                               
    `;
}

function reminderList(arrayOfReminders) {
    const reminderItems = arrayOfReminders.map(reminderToItem).join('');
    return `
        <ul>
            ${reminderItems}
        </ul>
        <div id="map"></div>
        <a href ="/create"> Add GeoMindr</a><br>
        <a href ="/home"> Go to GeoMindr Menu</a>
        
        <script src="scripts.js"></script>
        <script async defer 
            src="https://maps.googleapis.com/maps/api/js?key=AIzaSyATg8I-7sRcc4jlqUhTAxWDOv8gHanaLXA&callback=initPubMap"></script>
        <script>function youSure() {
    confirm("Are you sure you want to delete this GeoMindr?");
}</script>
    `;
}
module.exports = reminderList;
