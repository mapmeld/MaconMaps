var map;
function init(){
  // set up the page
  if(gup("address")){
    document.getElementById("address").innerHTML = replaceAll(gup("address"),"%20"," ");
  }

  // create a Leaflet Map pointed to this address
  var latlng = new L.LatLng(32.833303,-83.623637);
  if(gup("latlng")){
    latlng = new L.LatLng(gup("latlng").split(",")[0], gup("latlng").split(",")[1]);
  }
  map = new L.Map("map");
  map.setView(latlng, 16)
  
  // add county's buildings map
  //var bibbLayer = new L.TileLayer("/countymap?z={z}&x={x}&y={y}", {maxZoom: 19, attribution: "Bibb County GIS"});
  //map.addLayer(bibbLayer);
  
  var tileURL = "http://otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png";
  var attribution = "Map data &copy; 2012 OpenStreetMap contributors, Tiles by MapQuest";
  var baseMapLayer = new L.TileLayer(tileURL, {maxZoom: 18, attribution: attribution});
  map.addLayer(baseMapLayer);
  
  // add houses Fusion Tables map
  var housesLayer = new L.TileLayer("https://mts1.googleapis.com/mapslt?hl=en-US&lyrs=ft%3A3074075|gmc%3Agoogle-fusiontables|sc%3Acol2|sg%3A|uit%3AAIGcsfMhwEGZ1LFG0Q1olPKwLvY9woIQQQ&x={x}&y={y}&z={z}&w=256&h=256&source=apiv3", {maxZoom: 19, attribution: "Housing data Macon ECD"});
  map.addLayer(housesLayer);
}
function replaceAll(src,oldr,newr){
	while(src.indexOf(oldr) > -1){
		src = src.replace(oldr,newr);
	}
	return src;
}
function gup(nm){nm=nm.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");var rxS="[\\?&]"+nm+"=([^&#]*)";var rx=new RegExp(rxS);var rs=rx.exec(window.location.href);if(!rs){return null;}else{return rs[1];}}