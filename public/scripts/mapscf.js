var map, infoWindow;
var iContent, surveyContent, parcel2Content;
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
  
  // add mapquest layer, in case county layer fails
  var tileURL = "http://otile1.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png";
  var attribution = "Map data &copy; 2012 OpenStreetMap contributors, Tiles by MapQuest";
  var baseMapLayer = new L.TileLayer(tileURL, {maxZoom: 18, attribution: attribution});
  map.addLayer(baseMapLayer);
  
  // add county's buildings map
  //var bibbLayer = new L.TileLayer("/countymap?z={z}&x={x}&y={y}", {maxZoom: 19, attribution: "Bibb County GIS"});
  //map.addLayer(bibbLayer);
  
  // add houses Fusion Tables map
  var housesLayer = new L.TileLayer("https://mts1.googleapis.com/mapslt?hl=en-US&lyrs=ft%3A3074075|gmc%3Agoogle-fusiontables|sc%3Acol2|sg%3A|uit%3AAIGcsfMhwEGZ1LFG0Q1olPKwLvY9woIQQQ&x={x}&y={y}&z={z}&w=256&h=256&source=apiv3", {maxZoom: 19, attribution: "Housing data Macon ECD"});
  map.addLayer(housesLayer);
  infoWindow = new L.Popup();

  // add SeeClickFix reports
  var s = document.createElement('script');
  s.type = 'text/javascript';
  s.src = 'http://seeclickfix.com/api/issues.json?at=Macon,+GA&callback=loadSCF';
  document.body.appendChild(s);
}
function loadSCF(reports){
  for(var r=0;r<reports.length;r++){
    mapReport(reports[r]);
  }
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
function mapReport(report){
  var reportMarker = new L.Marker( new L.LatLng( report.lat, report.lng ) );
  map.addLayer(reportMarker);
  reportMarker.on('click', function(e){
    // reset content strings
    parcel2Content = "";
    surveyContent = "";

    activeMarker = reportMarker;
    iContent = "<h4>SeeClickFix: " + report.address.split(' Macon, GA')[0] + "</h4><small>" + report.description + "</small><br/>Status: " + report.status + "<br/>Updated " + report.updated_at;
    infoWindow.setContent(iContent);
    infoWindow.setLatLng( new L.LatLng(report.lat, report.lng) );
    map.openPopup(infoWindow);

    var s = document.createElement("script");
    s.type = "text/javascript";
    var address = report.address.split(' Macon, GA')[0];
    address = address.replace("Street","st").replace("street","st");
    address = address.replace("Avenue","ave").replace("avenue","ave");
    address = address.replace("Drive","dr").replace("drive","dr");
    address = address.replace("Road","rd").replace("road","rd");
    //s.src = "http://gis.co.bibb.ga.us/arcgisbibb/rest/services/AG4LG/TaxParcelQuery/MapServer/find?f=json&searchText=" + address + "&contains=true&returnGeometry=true&layers=0&searchFields=PARCELID%2CSITEADDRESS%2CCNVYNAME&callback=gotParcel&sr=4326";
    //document.body.appendChild(s);
    
    jQuery.getJSON("/searchdb?streetname=" + address.toUpperCase(),function(b){
      surveyContent = "<h4>2008 Survey</h4>";
      if(b.rows.length == 0){
        surveyContent += "No Results";
      }
      else{
        for(var i=0;i<b.rows.length;i++){
		  surveyContent += "<a href='/statusone.html?id=" + b.rows[i].id + "'>" + b.rows[i].id.split(',')[0] + "</a><br/>";
        }
      }
      infoWindow.setContent( iContent + surveyContent + parcel2Content );
      map.openPopup(infoWindow);
    });
    
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
  
  /* var rings = parcel.geometry.rings;
  var printpoly = [ ];
  for(var ring=0; ring<rings.length; ring++){
    printpoly.push([ ]);
    for(var pt=0; pt<rings[ring].length; pt++){
      xmin = Math.min(rings[ring][pt][0], xmin);
      xmax = Math.max(rings[ring][pt][0], xmax);
      ymin = Math.min(rings[ring][pt][1], ymin);
      ymax = Math.max(rings[ring][pt][1], ymax);

      printpoly[ring].push( new L.LatLng( rings[ring][pt][1], rings[ring][pt][0] ) );
    }
  }
  parcelPoly = new L.Polygon( printpoly, {
    color: "#00f",
    opacity: 0.8,
    fillColor: "#aaf",
    fillOpacity: 0.2
  }); */
  
  // move the map and draggable marker
  // map.panTo(new L.LatLng( ((ymin + ymax)/2), ((xmin + xmax)/2) ));
  
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
  /* parcel2Content = "<h3>County</h3><ul id='parcelInfo'><li><a href='http://www.co.bibb.ga.us/TaxAssessors/PropertyCard/PropertyCard.asp?P=" + (parcel.attributes["PARCELID"] || parcel.attributes["Parcel Identification Number"]) + "' target='_blank'>Parcel Tax Record</a></li>" + myAttributes + "</ul><a href='#' onclick='seePhoto(\"" + (parcel.attributes["PARCELID"] || parcel.attributes["Parcel Identification Number"]) + "\")'>SEE PHOTO</a>";
  infoWindow.setContent(iContent + surveyContent + parcel2Content );
  map.openPopup(infoWindow); */
}
function seePhoto(parcelid){
  infoWindow.setContent("<img src='/getparcelimg?P=" + parcelid + "' width='280'/>");
}
function replaceAll(src,oldr,newr){
	while(src.indexOf(oldr) > -1){
		src = src.replace(oldr,newr);
	}
	return src;
}
function gup(nm){nm=nm.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");var rxS="[\\?&]"+nm+"=([^&#]*)";var rx=new RegExp(rxS);var rs=rx.exec(window.location.href);if(!rs){return null;}else{return rs[1];}}