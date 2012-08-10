var map, parcelPoly, zonePoly, parcelMarker, infoWindow;
function init(){
  map = new google.maps.Map($("map"), {
    center: new google.maps.LatLng( 32.83895, -83.62913 ),
    zoom: 15,
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    streetViewControl: false,
    panControl: false,
    zoomControl: true
  });
  infoWindow = new google.maps.InfoWindow();
  parcelMarker = new google.maps.Marker({
    map: map,
    draggable: true,
    position: new google.maps.LatLng( 32.83895, -83.62913 )
  });
  google.maps.event.addListener(parcelMarker, "dragend", function(){
    if(parcelPoly){
      parcelPoly.setMap(null);
    }
    if(zonePoly){
      zonePoly.setMap(null);
    }
    var s = document.createElement("script");
    s.type = "text/javascript";
    //s.src = "http://gis.co.bibb.ga.us/arcgisbibb/rest/services/AG4LG/TaxParcelQuery/MapServer/0/query?f=json&where=&returnGeometry=true&spatialRel=esriSpatialRelWithin&geometry={x:" + parcelMarker.getPosition().lng() + ",y:" + parcelMarker.getPosition().lat() + "}&geometryType=esriGeometryPoint&inSR=4326&outSR=4326&callback=gotParcel";
    document.body.appendChild(s);
  });
  
  setTimeout(function(){
    var cfalogo = document.createElement("img");
    cfalogo.src="images/cfa_grayscale.png";
    cfalogo.style.position="absolute";
    cfalogo.style.bottom="34px";
    cfalogo.style.left="5px";
    cfalogo.width="120";
    $("map").appendChild(cfalogo);
  }, 500);
}
function searchAddress(){
  if(parcelPoly){
    parcelPoly.setMap(null);
  }
  if(zonePoly){
    zonePoly.setMap(null);
  }
  var address = $("placesearch").value;
  if(address.toLowerCase().indexOf(",") > -1){
    address = address.split(",")[0];
  }
  var s = document.createElement("script");
  s.type = "text/javascript";
  //s.src = "http://gis.co.bibb.ga.us/arcgisbibb/rest/services/AG4LG/TaxParcelQuery/MapServer/find?f=json&searchText=" + address + "&contains=true&returnGeometry=true&layers=0&searchFields=PARCELID%2CSITEADDRESS%2CCNVYNAME&callback=gotParcel&sr=4326";
  document.body.appendChild(s);
}
var zoneLink = {
	"SC": "CH5PECODI.html",
	"A": "CH6RIDI.html",
	"RR": "CH7URREDI.html",
	"R-1AAA": "CH8AAAINMIREDI.html",
	"R-1AAAA": "CH8AAAINMIREDI.html",
	"R-1AA": "CH9A-SMIREDI.html",
	"R-1A": "CH9A-SMIREDI.html",
	"R-1": "CH9A-SMIREDI.html",
	"R-2A": "CH10-TMIREDI.html",
	"R-2": "CH10-TMIREDI.html",
	"R-3": "CH11-MREDI.html",
	"C-1": "CH12-NCODI.html",
	"C-2": "CH13-GCODI.html",
	"CBD-1": "CH13AC-CBUDI.html",
	"CBD-2": "CH13BC-CBUDI.html",
	"C-4": "CH14-HCODI.html",
	"C-5": "CH15-NCOCEDI.html",
	"M-1": "CH16-WLIINDI.html",
	"M-2": "CH17-HINDI.html",
	"M-3": "CH18-HINDI.html",
	"PDR": "CH19PDPDPDPLADEDI.html",
	"PDC": "CH19PDPDPDPLADEDI.html",
	"PDI": "CH19PDPDPDPLADEDI.html",
	"PDE": "CH19PDPDPDPLADEDI.html",
	"RESERVED": "CH20RE.html",
	"AH1": "CH20AAHRPHADIERSM.html",
	"AH2": "CH20BAHRPHADIIDGEREAI.html",
	"AH3": "CH20CAHRPHADIOBAIFOBA.html",
	"HR-1": "CH21HCHISZODI.html",
	"HR-2": "CH21HCHISZODI.html",
	"HR-3": "CH21HCHISZODI.html",
	"HC": "CH21HCHISZODI.html",
	"HPD": "CH21HCHISZODI.html",
	"HPD-BH": "CH21AHIPLDEDIEAHIH.html",
	"MHR": "CH22AMANHOREDI.html",
	"RP": "CH22BIVPRDI.html"
};
function gotZone(zone){
  var rings = zone.features[0].geometry.rings;
  var printpoly = [ ];
  for(var ring=0; ring<rings.length; ring++){
    printpoly.push([ ]);
    for(var pt=0; pt<rings[ring].length; pt++){
      printpoly[ring].push( new google.maps.LatLng( rings[ring][pt][1], rings[ring][pt][0] ) );
    }
  }
  zonePoly = new google.maps.Polygon({
    map: map,
    paths: printpoly,
    strokeColor: "#f00",
    strokeOpacity: 0.8,
    fillOpacity: 0
  });
}
function gotParcel(parcels){
  var xmin = 10000;
  var ymin = 10000;
  var xmax = -10000;
  var ymax = -10000;

  var parcel;
  if(typeof parcels.results === "undefined"){
    parcel = parcels.features[0];
  }
  else{
    parcel = parcels.results[0];
  }
  
  var rings = parcel.geometry.rings;
  var printpoly = [ ];
  for(var ring=0; ring<rings.length; ring++){
    printpoly.push([ ]);
    for(var pt=0; pt<rings[ring].length; pt++){
      xmin = Math.min(rings[ring][pt][0], xmin);
      xmax = Math.max(rings[ring][pt][0], xmax);
      ymin = Math.min(rings[ring][pt][1], ymin);
      ymax = Math.max(rings[ring][pt][1], ymax);

      printpoly[ring].push( new google.maps.LatLng( rings[ring][pt][1], rings[ring][pt][0] ) );
    }
  }
  parcelPoly = new google.maps.Polygon({
    map: map,
    paths: printpoly,
    strokeColor: "#00f",
    strokeOpacity: 0.8,
    fillColor: "#aaf",
    fillOpacity: 0.2
  });
  
  // move the map and draggable marker
  parcelMarker.setPosition(new google.maps.LatLng( ((ymin + ymax)/2), ((xmin + xmax)/2) ));
  map.panTo(new google.maps.LatLng( ((ymin + ymax)/2), ((xmin + xmax)/2) ));
  
  // get zoning polygon, too
  var s = document.createElement("script");
  s.type = "text/javascript";
  //s.src = 'http://gis.co.bibb.ga.us/ArcGISBibb/rest/services/AG4LG/Zoning2/MapServer/1/query?text=&geometry={y:' + ((ymin + ymax)/2) + ',x:' + ((xmin + xmax)/2) + '}&geometryType=esriGeometryPoint&inSR=4326&spatialRel=esriSpatialRelWithin&relationParam=&objectIds=&where=&time=&returnCountOnly=false&returnIdsOnly=false&returnGeometry=true&maxAllowableOffset=&outSR=4326&outFields=&f=pjson&callback=gotZone';
  document.body.appendChild(s);
  
  // add key parcel attributes
  var printAttributes;
  if(typeof parcel.attributes["Owner Name"] === "undefined"){
    printAttributes = [ "pz_zoning", "SITEADDRESS", "OWNERNME1", "taxm_acre", "sale_date" ];  
  }
  else{
    printAttributes = [ "pz_zoning", "Site Address", "Owner Name", "Taxable Acreage", "Last Sale Date" ];
  }
  var myAttributes = "";
  for(var a=0; a<printAttributes.length; a++){
    myAttributes += "<li>";
    if(printAttributes[a] == "pz_zoning"){
      myAttributes += "<strong>Zoning:</strong> <a href='http://library.municode.com/HTML/11190/level1/" + zoneLink[parcel.attributes["pz_zoning"]] + "' target='_blank'>" + parcel.attributes[printAttributes[a]] + " Zoning Info</a>";    
    }
    else{
      myAttributes += "<strong>" + printAttributes[a] + ":</strong> " + parcel.attributes[printAttributes[a]];
    }
    myAttributes += "</li>";
  }

  // Show Information
  //var iContent = "<h3>Information</h3><ul id='parcelInfo'><li><a href='http://www.co.bibb.ga.us/TaxAssessors/PropertyCard/PropertyCard.asp?P=" + (parcel.attributes["PARCELID"] || parcel.attributes["Parcel Identification Number"]) + "' target='_blank'>Parcel Tax Record</a></li>" + myAttributes + "</ul>";
  //infoWindow.setContent(iContent);
  //infoWindow.open(map,parcelMarker);
}
function $(id){
  return document.getElementById(id);
}