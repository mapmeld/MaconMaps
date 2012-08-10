var map, building_pop, terrainLayer, satLayer;
function init(){
  map = new L.Map('map');
  var toner = 'http://{s}.tile.stamen.com/terrain-lines/{z}/{x}/{y}.png';
  var tonerAttrib = 'Map data &copy; 2012 OpenStreetMap contributors, Tiles &copy; 2012 Stamen Design';
  terrainLayer = new L.TileLayer(toner, {maxZoom: 18, attribution: tonerAttrib});
  map.addLayer(terrainLayer);
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
  
  var bing_key = "Arc0Uekwc6xUCJJgDA6Kv__AL_rvEh4Hcpj4nkyUmGTIx-SxMd52PPmsqKbvI_ce";
  satLayer = new L.TileLayer.Bing(bing_key, 'Imagery &copy; Bing Maps', {minZoom:10, maxZoom:19});
}
function setMap(lyr){
  if(lyr == "street"){
    map.addLayer(terrainLayer);
    map.removeLayer(satLayer);
    document.getElementById("streetlayer").className = "active";
    document.getElementById("satlayer").className = "";
  }
  else if(lyr == "sat"){
    map.addLayer(satLayer);
    map.removeLayer(terrainLayer);
    document.getElementById("satlayer").className = "active";
    document.getElementById("streetlayer").className = "";
  }
}