var map;

$(document).ready(function(){
  // make a Leaflet map
  map = new L.Map('map', { zoomControl: false, panControl: false });
  L.control.pan().addTo(map);
  L.control.zoom().addTo(map);
  var toner = 'http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png';
  var tonerAttrib = 'Map data &copy; 2012 OpenStreetMap contributors, Tiles &copy; 2012 Stamen Design';
  terrainLayer = new L.TileLayer(toner, {maxZoom: 18, attribution: tonerAttrib});
  map.addLayer(terrainLayer);
  map.setView(new L.LatLng(32.828881, -83.652627), 14);
  
  // add a sample neighborhood area and make it editable
  var wll = [ new L.LatLng(32.828881, -83.652627), new L.LatLng(32.824881, -83.652627), new L.LatLng(32.828881, -83.648627) ];
  var footprint = new L.Polygon( wll, { color: "#00f", fillOpacity: 0.3, opacity: 0.65 } );
  footprint.editing.enable();
  map.addLayer(footprint);

  // make a jQuery slider to view code enforcement case timeline
  $("#filter").slider({
    orientation: "horizontal",
    range: "min",
    min: 2000,
    max: 2185,
    value: 2000,
    slide: function (event, ui) {
      set_time_period(ui.value)();
    }
  });

});