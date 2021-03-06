var map, footprint;

$(document).ready(function(){
  // make a Leaflet map
  map = new L.Map('map', { zoomControl: false, panControl: false });
  L.control.pan().addTo(map);
  L.control.zoom().addTo(map);
  //var toner = 'http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png';
  //var tonerAttrib = 'Map data &copy; 2012 OpenStreetMap contributors, Tiles &copy; 2012 Stamen Design';

var toner = 'http://otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg';
var tonerAttrib = 'Map data &copy; 2012 OpenStreetMap contributors, Tiles by MapQuest';
  terrainLayer = new L.TileLayer(toner, {maxZoom: 18, attribution: tonerAttrib});
  map.addLayer(terrainLayer);
  map.setView(new L.LatLng(32.828881, -83.652627), 14);
  
  // add a sample neighborhood area and make it editable
  var wll = [ new L.LatLng(32.828881, -83.652627), new L.LatLng(32.820881, -83.652627), new L.LatLng(32.826, -83.646) ];
  footprint = new L.Polygon( wll, { color: "#00f", fillOpacity: 0.3, opacity: 0.65 } );
  footprint.editing.enable();
  footprint.on('edit', function(e){
    $("#movetime").css({ color: "#000" });
    $(".aftermove").removeClass("aftermove");
  });
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

function llserial(latlngs){
  var llstr = [ ];
  for(var i=0;i<latlngs.length;i++){
    llstr.push(latlngs[i].lat.toFixed(6) + "," + latlngs[i].lng.toFixed(6));
  }
  return llstr.join("|");
}

function postGeo(format){
  var poly = llserial(footprint.getLatLngs());
  $.post("/customgeo", { pts: poly }, function(data){
    if(format == "html"){
      window.location = "/timeline?customgeo=" + data.id;
    }
    else if(format == "geojson"){
      window.location = "/timeline-at.geojson?customgeo=" + data.id;
    }
    else if(format == "kml"){
      window.location = "/timeline-at.kml?customgeo=" + data.id;
    }
  });
}

// Analytics
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-35749214-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();