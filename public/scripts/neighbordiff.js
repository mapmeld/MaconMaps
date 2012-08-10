var map, building_pop;
function init(){
  map = new L.Map('map');
  var toner = 'http://{s}.tile.stamen.com/terrain-lines/{z}/{x}/{y}.png';
  var tonerAttrib = 'Map data &copy; 2012 OpenStreetMap contributors, Tiles &copy; 2012 Stamen Design';
  var tonerLayer = new L.TileLayer(toner, {maxZoom: 18, attribution: tonerAttrib});
  map.addLayer(tonerLayer);
  map.setView(new L.LatLng(32.83895, -83.62913), 15);
  
  building_pop = new L.Popup();
  
  var cartodb_leaflet = new L.CartoDBLayer({
    map: map,
    user_name:'mapmeld',
    table_name: 'collegeplusintown',
    query: "SELECT * FROM collegeplusintown",
    tile_style: "#collegeplusintown{polygon-fill:orange}",
    interactivity: "cartodb_id",
    featureClick: function(ev, latlng, pos, data){
      console.log(data);
      building_pop.setLatLng(latlng).setContent("ID: " + data.cartodb_id);
      map.openPopup(building_pop);
    },
    //featureOver: function(){},
    //featureOut: function(){},
    auto_bound: true
  });
  map.addLayer(cartodb_leaflet);
  
}