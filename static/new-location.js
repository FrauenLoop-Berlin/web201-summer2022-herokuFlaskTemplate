let markers = [];
let map = null;

function initAutocomplete(esriConfig,Map, MapView, Search) {
  map = new Map({
    basemap: "arcgis-topographic" // Basemap layer service
  });

  view = new MapView({
      map: map,
      center: [13.4050, 52.5200], // Longitude, latitude. We start at the center of Berlin
      zoom: 13, // Zoom level
      maxZoom: 18,
      minZoom: 5,
      container: "viewDiv" // Div element
  });  
  
  const searchWidget = new Search({
      view: view
  });

  // Listen for the event fired when the user selects a prediction
  searchWidget.on("select-result", function(event){
      console.log("Select result selected", event);
      updateFormCoordinates(event.result.extent.center.latitude, event.result.extent.center.longitude);
  });
  
  view.ui.add(searchWidget, {
    position: "top-right"
  });
}

function placeMarker(latLng) {
    // Clear out the old markers. We want at most one marker in the map at any given time
    markers.forEach((marker) => {
        marker.setMap(null);
    });
    markers = [];

    // Send the latitude and longitude of the found location 
    // into the Form hidden fields, so this data can reach the backend:
    updateFormCoordinates(latLng.lat(), latLng.lng());

    const icon = {
        url: "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/geocode-71.png",
    };
  
    // Create a marker for this place.
    let newMarker = new google.maps.Marker({
        map,
        icon,
        position: latLng,
        draggable: true // this is a way to allow the user to re-position the marker if they wish
    })  
      
    // Because we created a draggable marker,
    // we need to define what happens after the user drags / repositions
    // the marker
    google.maps.event.addListener(newMarker, 'dragend', function (evt) {
        // If the user drags the marker,
        // the Form coordinates need to be updated
        updateFormCoordinates(evt.latLng.lat().toFixed(6), evt.latLng.lng().toFixed(6));
        map.panTo(evt.latLng);
    });

    // We add newMarker to the markers list
    // so it can be cleared before a new marker can be added
    // (remember we want to ensure only a single marker in the map)
    markers.push(
        newMarker
    );
    
    // Move the map center to this coordinate
    map.panTo(latLng);    
}

function updateFormCoordinates(newLat, newLng) {
    console.log('Updating form coordinates to: '+newLat+' '+newLng);
    document.getElementById('coord_latitude').value = newLat;
    document.getElementById('coord_longitude').value = newLng;
}  