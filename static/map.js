let map;
let view;
let graphicsLayer;

let cGraphic; // this is ugly, the class Graphic gets passed to initMap and I want to make it global...
let cCircle;

let markers;

let geocoder;

let queryCenter; 
let queryZoom;

//When the user clicks on a marker, it will become
// the selected one:
var selectedMarker = null;

function initMap(esriConfig, Map, MapView, Graphic, GraphicsLayer, reactiveUtils, Circle) {
  console.log('InitMap')

  // I will use these later to create elements in the map 
  cGraphic = Graphic;
  cCircle = Circle;

  map = new Map({
    basemap: "arcgis-topographic" // Basemap layer service
  });

  graphicsLayer = new GraphicsLayer();
  map.add(graphicsLayer);

  view = new MapView({
    map: map,
    center: [13.4050, 52.5200], // Longitude, latitude. We start at the center of Berlin
    zoom: 13, // Zoom level
    maxZoom: 18,
    minZoom: 5,
    container: "viewDiv" // Div element
  });
 
  // Watch view's stationary property for becoming true.
  reactiveUtils.when(() => view.stationary === true, () => {
      if (view.extent) {
        refreshMarkers();
      }
  });

}

var radiusToZoomLevel = [
  2600000, // zoom: 0
  2600000, // zoom: 1
  2600000, // zoom: 2
  2600000, // zoom: 3
  2600000, // zoom: 4
  1600000, // zoom: 5 
  800000, // zoom: 6
  400000, // zoom: 7
  200000, // zoom: 8
  100000, // zoom: 9
  51000, // zoom: 10
  26000, // zoom: 11
  13000, // zoom: 12
  6500, // zoom: 13
  3250, // zoom: 14
  1595, // zoom: 15
  800, // zoom: 16
  405, // zoom: 17
  200, // zoom: 18
];

function refreshMarkers() {
  console.log("refreshing markers")

  //Update query center and zoom so we know in referenec to what
  //we queried for markers the last time and can decide if a re-query is needed
  queryCenter = [view.center.latitude, view.center.longitude];
  queryZoom = view.zoom;

  // This attempts to adjust the radiusToZoomLevel to the size of the screen so we
  // search in a radius at least as big as of what is visible on the map right now
  let mapSizeProportional = Math.max(...view.size)/1000;
  let actualRadius = Math.round(radiusToZoomLevel[queryZoom] * mapSizeProportional);

  // If we had already some markers in the map, we need to clear them
  clearMarkers();

  // This will helpt to understand the radius of search, its for debug only
  //createCircle(queryCenter,actualRadius, queryZoom);

  // we call the backend to get the list of markers
  var params = {
    "lat" : queryCenter[0], 
    "lng" : queryCenter[1], 
    "radius" : actualRadius
  }
  var url = "/api/get_items_in_radius?" + dictToURI(params) 
  loadJSON(url, function(response) {
    // Parse JSON string into object
      var response_JSON = JSON.parse(response);
      console.log(response_JSON);

      if (!response_JSON.success) {
          // something failed in the backed serching for the items
          console.log("/api/get_items_in_radius call FAILED!")
          return
      }  

      // place new markers in the map
      placeItemsInMap(response_JSON.results)
   });
}

function placeItemsInMap(items) {
  // Add some markers to the map.
  // Note: The code uses the JavaScript Array.prototype.map() method to
  // create an array of markers based on the given "items" array.
  // The map() method here has nothing to do with the Maps API.
  markers = items.map(function(item, i) {    
      const point = { //Create a point
          type: "point",
          longitude: item.location.lng,
          latitude: item.location.lat
      };
      const simpleMarkerSymbol = {
          type: "simple-marker",
          color: [226, 119, 40],  // Orange
          outline: {
              color: [255, 255, 255], // White
              width: 1
          }
      };
      const pointGraphic = new cGraphic({
          geometry: point,
          symbol: simpleMarkerSymbol,
          popupTemplate: {
            title: item.description,
            content: "Here we could put more information about this item",
            actions: [{
              title: "View Details",
              id: "view",
              param: item.id // this is an additional attribute I added to be able to know the item id and costruct the detail page url on click
            }]
          }
      });
      graphicsLayer.add(pointGraphic);

      return pointGraphic;
  });

  // this handles the click on "View Details"
  view.popup.on("trigger-action", (event) => {
    if (event.action.id === "view") {
      window.open("/detail?id="+event.action.param,"_top")
    }
  });  

  // console.log(markers);
  // console.log(markers.length);
}

function clearMarkers() {
  graphicsLayer.removeAll();
}

function createCircle(latLng,radius, zoomLevel) {
  console.log("MAP SIZE: "+view.size);
  console.log("ZOOM LEVEL: "+zoomLevel);
  console.log("Radius: "+radius);

  const circleGeometry = new cCircle({
    center: [ latLng[1], latLng[0] ],
    geodesic: true,
    numberOfPoints: 100,
    radius: radius,
    radiusUnit: "meters"
  });
  
  graphicsLayer.add(new cGraphic({
    geometry: circleGeometry,
    symbol: {
      type: "simple-fill",
      style: "none",
      outline: {
        width: 3,
        color: "red"
      }
    }
  }));
}  

function loadJSON(url, callback) {   
  var xobj = new XMLHttpRequest();
  
  xobj.overrideMimeType("application/json");
  xobj.open('GET', url, true); 
  xobj.onreadystatechange = function () {
        if (xobj.readyState == 4 && xobj.status == "200") {
          // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
          callback(xobj.responseText);
        }
        //TODO: what to do in case of failures?
  };
  xobj.send(null);  
}

function dictToURI(dict) {
  var str = [];
  for(var p in dict){
     str.push(encodeURIComponent(p) + "=" + encodeURIComponent(dict[p]));
  }
  return str.join("&");
}