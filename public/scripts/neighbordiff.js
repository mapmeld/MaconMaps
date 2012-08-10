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
    tile_style: "#collegeplusintown{polygon-fill:orange;polygon-opacity:0.3;}",
    interactivity: "cartodb_id",
    featureClick: function(ev, latlng, pos, data){
      console.log(data);
      building_pop.setLatLng(latlng).setContent("<h3>ID: " + data.cartodb_id + "</h3>" + addDropdown(data));
      map.openPopup(building_pop);
    },
    //featureOver: function(){},
    //featureOut: function(){},
    auto_bound: true
  });
  map.addLayer(cartodb_leaflet);
  
  var bing_key = "Arc0Uekwc6xUCJJgDA6Kv__AL_rvEh4Hcpj4nkyUmGTIx-SxMd52PPmsqKbvI_ce";
  satLayer = new L.TileLayer.Bing(bing_key, 'AerialWithLabels', {minZoom:10, maxZoom:19});
}
function setMap(lyr){
  if(lyr == "street"){
    map.addLayer(terrainLayer);
    map.removeLayer(satLayer);
    $("#streetlayer").addClass("active");
    $("#satlayer").removeClass("active");
  }
  else if(lyr == "sat"){
    map.addLayer(satLayer);
    map.removeLayer(terrainLayer);
    $("#streetlayer").removeClass("active");
    $("#satlayer").addClass("active");
  }
}
function addDropdown(givendata){
  var full = '<select onchange="setStatus(\'' + givendata.cartodb_id + '\',this.value);"><option>Unchanged</option><option>Demolished</option><option>Renovated</option><option>Moved</option></select><br/>';
  full = full.replace('<option>' + 'Unchanged','<option selected="selected">' + 'Unchanged');
  return full;
}
function setStatus(id, status){
  console.log(id + " set to " + status);
  $.ajax({
    type: "PUT",
    url: "https://mapmeld.cartodb.com/api/v1/tables/collegeplusintown/records/" + id
    data: {
      column_id: "descriptio",
      row_id: id,
      descriptio: "fixed",
      api_key: "adb5827e4edcbffeac2de4fa7ba520e70b5332da"
    },
    dataType: "application/x-www-form-urlencoded"
  });
  $.ajax({
    type: "PUT",
    url: "https://mapmeld.cartodb.com/api/v2/sql?q=" + encodeURIComponent("UPDATE collegeplusintown SET descriptio = 'test' WHERE cartodb_id = ") + id + "&api_key=9d0714868c51936503f1ee1f9ec27306e2030660",
    data: {
      q: encodeURIComponent("UPDATE collegeplusintown SET descriptio = 'test' WHERE cartodb_id = " + id),
      api_key: "9d0714868c51936503f1ee1f9ec27306e2030660"
    },
    dataType: "application/x-www-form-urlencoded"
  });
  function(data){
    console.log(data);
  });
}