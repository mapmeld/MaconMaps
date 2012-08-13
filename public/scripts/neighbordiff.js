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
    tile_style: "collegeplusintown{polygon-fill:orange;polygon-opacity:0.3;} collegeplusintown[status='Demolished']{polygon-fill:red;} collegeplusintown[status='Renovated']{polygon-fill:green;} collegeplusintown[status='Moved']{polygon-fill:blue;}",
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
  satLayer = new L.TileLayer.Bing(bing_key, 'Aerial', {minZoom:10, maxZoom:19});
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
  $.getJSON("/changetable?id=" + id + "&status=" + status, function(data){
    console.log(data);
  });
}
function checkForEnter(e){
  if(e.keyCode == 22){
    searchForAddress();
  }
}
function searchForAddress(){
  var address = $("#placesearch").val();
  $.getJSON("/placesearch?address=" + address, function(data){
    map.setView(new L.LatLng(data.split(',')[0], data.split(',')[1]), 17);
  };
}