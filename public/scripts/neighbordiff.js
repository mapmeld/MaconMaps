function init(){
  var map = new L.Map('map');
  var toner = 'http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png',
  var tonerAttrib = 'Map data &copy; 2012 OpenStreetMap contributors, Tiles &copy; 2012 Stamen Design',
  var tonerLayer = new L.TileLayer(toner, {maxZoom: 18, attribution: tonerAttrib});
  map.addLayer(tonerLayer);
  
  var cartodb_leaflet = new L.CartoDBLayer({
    map: map,
    user_name:'mapmeld',
    table_name: 'collegeplusintown',
    query: "SELECT * FROM collegeplusintown",
    tile_style: "#collegeplusintown{polygon-fill:orange}",
    interactivity: "cartodb_id, magnitude",
    featureClick: function(ev, latlng, pos, data){
      console.log(data)
    },
    featureOver: function(){},
    featureOut: function(){},
    auto_bound: true
  });
  map.addLayer(cartodb_leaflet);
  
}