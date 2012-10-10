var map, building_pop, terrainLayer, satLayer, cartodb, dragtype, markers, table_name, user_name;
var zoomLayers = {};
if(!console || !console.log){
  console = { log: function(e){ } };
}
function replaceAll(src, oldr, newr){
  while(src.indexOf(oldr) > -1){
    src = src.replace(oldr, newr);
  }
  return src;
}
function gup(nm){nm=nm.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");var rxS="[\\?&]"+nm+"=([^&#]*)";var rx=new RegExp(rxS);var rs=rx.exec(window.location.href);if(!rs){return null;}else{return rs[1];}}
function init(){
  user_name = gup("user") || "mapmeld";
  table_name = gup("table") || "promisebuildings";

  map = new L.Map('map', { zoomControl: false, panControl: false });
  L.control.pan().addTo(map);
  L.control.zoom().addTo(map);

  var toner = 'http://{s}.tile.stamen.com/toner/{z}/{x}/{y}.png';
  var tonerAttrib = 'Map data &copy; 2012 OpenStreetMap contributors, Tiles &copy; 2012 Stamen Design';
  terrainLayer = new L.TileLayer(toner, {maxZoom: 18, attribution: tonerAttrib});
  map.addLayer(terrainLayer);
  map.setView(new L.LatLng(32.828881, -83.652627), 16);
  
  satLayer = new L.BingLayer("Arc0Uekwc6xUCJJgDA6Kv__AL_rvEh4Hcpj4nkyUmGTIx-SxMd52PPmsqKbvI_ce");  
  map.addLayer(satLayer);
  satLayer.setOpacity(0);
  
  building_pop = new L.Popup();
  
  cartodb = new L.CartoDBLayer({
    map: map,
    user_name: user_name,
    table_name: table_name,
    query: "SELECT * FROM " + table_name,
    tile_style: "#" + table_name + "{polygon-fill:orange;polygon-opacity:0.5;} #" + table_name + "[status='Demolished']{polygon-fill:red;} #" + table_name + "[status='Renovated']{polygon-fill:green;} #" + table_name + "[status='Moved']{polygon-fill:blue;}",
    interactivity: "cartodb_id, status, name, description",
    featureClick: function(ev, latlng, pos, data){
      building_pop.setLatLng(latlng).setContent("<input type='hidden' id='selectedid' value='" + data.cartodb_id + "'/><label>Name</label><br/><input id='poly_name' class='x-large' value='" + replaceAll((data.name || ""),"'","\\'") + "'/><br/><label>Add Detail</label><br/><textarea id='poly_detail' rows='6' cols='25'>" + replaceAll(replaceAll((data.description || ""),"<","&lt;"),">","&gt;") + "</textarea><br/><a class='btn' onclick='saveDetail()' style='width:40%;'>Save</a>");
      // + addDropdown(data));
      map.openPopup(building_pop);
    },
    //featureOver: function(){},
    //featureOut: function(){},
    auto_bound: true
  });
  map.addLayer(cartodb);
  
  map.on('zoomend', function(e){
    $.each(zoomLayers, function(zl){
      map.removeLayer(zl);
    });
    zoomLayers = {};
    var position = "&lat=" + map.getCenter().lat.toFixed(6) + "&lng=" + map.getCenter().lng.toFixed(6) + "&z=" + map.getZoom();
    $(".thefinal").attr("href","/collegehill2.html?table=" + table_name + "&user=" + user_name + "&message=true" + position);
    $(".changemap").attr("href","/diffmap.html?table=" + table_name + "&user=" + user_name + "&message=true" + position);
    $(".kitchensink").attr("href","/everything.html?table=" + table_name + "&user=" + user_name + "&message=true" + position);
  });

  // update embed links when map moves or zooms
  map.on('moveend', function(e){
    var position = "&lat=" + map.getCenter().lat.toFixed(6) + "&lng=" + map.getCenter().lng.toFixed(6) + "&z=" + map.getZoom();
    $(".thefinal").attr("href","/collegehill2.html?table=" + table_name + "&user=" + user_name + "&message=true" + position);
    $(".changemap").attr("href","/diffmap.html?table=" + table_name + "&user=" + user_name + "&message=true" + position);
    $(".kitchensink").attr("href","/everything.html?table=" + table_name + "&user=" + user_name + "&message=true" + position);
  });
  
  $(".kmllink").attr("href", "/tokml.kml?table=" + table_name + "&user=" + user_name);
  
  // load special markers from MongoDB
  markers = {};
  $.getJSON('/storedbuildings?table=' + table_name + "&user=" + user_name, function(buildings){
    for(var b=0;b<buildings.length;b++){
      var pt = new L.Marker(new L.LatLng(buildings[b].ll[1], buildings[b].ll[0])).bindPopup("<input type='hidden' id='selectedid' value='stored:" + buildings[b]._id + "'/><label>Name</label><br/><input id='poly_name' class='x-large' value='" + replaceAll((buildings[b].name || ""),"'","\\'") + "'/><br/><label>Add Detail</label><br/><textarea id='poly_detail' rows='6' cols='25'>" + replaceAll(replaceAll((buildings[b].description || ""),"<","&lt;"),">","&gt;") + "</textarea><br/><a class='btn' onclick='saveDetail()' style='width:40%;'>Save</a>");
      map.addLayer(pt);
      markers[ buildings[b]._id ] = pt;
    }
  });
  
  // popup showing embeddable maps
  $('#embedlink').avgrund({			
	width: 500,
	height: 280,
	showClose: true,
	showCloseText: 'x',
	closeByEscape: true,
	closeByDocument: true,
	template: $('#modal').html()
  });
}
function setMap(lyr){
  if(lyr == "street"){
    terrainLayer.setOpacity(1);
    satLayer.setOpacity(0);
    $("#streetlayer").addClass("active");
    $("#satlayer").removeClass("active");
  }
  else if(lyr == "sat"){
    terrainLayer.setOpacity(0);
    satLayer.setOpacity(1);
    $("#streetlayer").removeClass("active");
    $("#satlayer").addClass("active");
  }
}
function addDropdown(givendata){
  var full = '<select onchange="setStatus(\'' + givendata.cartodb_id + '\',this.value);"><option>Unchanged</option><option>Demolished</option><option>Renovated</option><option>Moved</option></select><br/>';
  full = full.replace('<option>' + givendata.status,'<option selected="selected">' + givendata.status);
  return full;
}
function setStatus(id, status){
  console.log(id + " set to " + status);
  $.getJSON("/changetable?table=" + table_name + "&user=" + user_name + "&id=" + id + "&status=" + status, function(data){ });
  $.getJSON("http://" + user_name + ".cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT%20the_geom%20FROM%20" + table_name + "%20WHERE%20cartodb_id=" + id).done(function(poly){
    // until zoom changes and tiles are refreshed, show polygon
    L.geoJson(poly, {
      style: function (feature) {
        if(status == "Demolished"){
          return {color: "#f00", opacity: 1};
        }
        else if(status == "Renovated"){
          return {color: "#0f0", opacity: 1};
        }
        else if(status == "Moved"){
          return {color: "#00f", opacity: 1};      
        }
        else{
          return {color: "orange", opacity: 1};
        }
      },
      onEachFeature: function(feature, layer){
        layer.bindPopup("You updated this.<br/>Zoom map to update.");
        zoomLayers[ id ] = layer;
      }
    }).addTo(map);
    $.post("/sharegeo", { id: id, status: status, geo: poly }, function(data){
      console.log("sent geo");
      console.log(data);
    });
  });
}
function dragstarted(e){
  dragtype = e.target.id;
}
function allowDrop(e){
  e.preventDefault();
}
function dragended(e){
  e.target.style.opacity = "1";
  allowDrop(e);
}
function dropped(e){
  if(dragtype == "marker_NewBuilding"){
    // find latitude / longitude of drop point
    var dropPoint = map.mouseEventToLatLng(e);
    // add a marker to the visible map
    var dropMarker = new L.Marker( dropPoint );
    map.addLayer(dropMarker);
    // add a marker to the CartoDB table
    $.getJSON("/changetable?table=" + table_name + "&user=" + user_name + "&marker=newpoint&ll=" + dropPoint.lng.toFixed(6) + "," + dropPoint.lat.toFixed(6), function(data){ console.log(data) });
  }
  else{
    // fake a click to change status of building at drop point
    cartodb.interaction.screen_feature({ x: e.clientX || e.pageX, y: e.clientY || e.pageY }, function(f){
      var id = f.cartodb_id;
      dragtype = dragtype.replace("marker_", "");
      setStatus(id, dragtype);
      dragtype = null;
    });
  }
  allowDrop(e);
}
function checkForEnter(e){
  if(e.keyCode == 13){
    searchAddress();
  }
}
function searchAddress(){
  var address = $("#placesearch").val();
  $.getJSON("/placesearch?address=" + address, function(data){
    map.setView(new L.LatLng(data.position.split(',')[0], data.position.split(',')[1]), 17);
  });
}
function saveDetail(){
  // popup save
  var id = $('#selectedid').val();
  var name = $('#poly_name').val();
  var detail = $('#poly_detail').val();
  if(id.indexOf("stored:") > -1){
    // editing a stored point
    id = id.replace("stored:","");
    $.getJSON("/storedbuildings/edit?id=" + id + "&name=" + encodeURIComponent(name) + "&detail=" + encodeURIComponent(detail), function(data){ });
    markers[ id ].unbindPopup();
    markers[ id ].bindPopup("<input type='hidden' id='selectedid' value='stored:" + id + "'/><label>Name</label><br/><input id='poly_name' class='x-large' value='" + name + "'/><br/><label>Add Detail</label><br/><textarea id='poly_detail' rows='6' cols='25'>" + detail + "</textarea><br/><a class='btn' onclick='saveDetail()' style='width:40%;'>Save</a>");
  }
  else{
    $.getJSON("/detailtable?table=" + table_name + "&user=" + user_name + "&id=" + id + "&name=" + encodeURIComponent(name) + "&detail=" + encodeURIComponent(detail), function(data){ });
    $.getJSON("http://" + user_name + ".cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT%20the_geom%20FROM%20" + table_name + "%20WHERE%20cartodb_id=" + id).done(function(poly){
      // until zoom changes and tiles are refreshed, show polygon with this name and description
      L.geoJson(poly, {
        style: function (feature) {
          if(status == "Demolished"){
            return {color: "#f00", opacity: 1};
          }
          else if(status == "Renovated"){
            return {color: "#0f0", opacity: 1};
          }
          else if(status == "Moved"){
            return {color: "#00f", opacity: 1};      
          }
          else{
            return {color: "orange", opacity: 1};
          }
        },
        onEachFeature: function(feature, layer){
          layer.bindPopup("<label><em>Name: </em></label><strong>" + replaceAll(replaceAll(name,"<","&lt;"),">","&gt;") + "</strong><br/><label><em>Description: </em></label><strong>" + replaceAll(replaceAll(detail,"<","&lt;"),">","&gt;") + "</strong>");
          zoomLayers[id] = layer;
        }
      }).addTo(map);
      /*$.post("/sharegeo", { id: id, status: status, geo: poly }, function(data){
        console.log("sent geo");
        console.log(data);
      });*/
    });
  }
  map.closePopup();
}

// socket.io experiment
var socket = io.connect(window.location.hostname);
socket.on('geoupdate', function(data){
  if(zoomLayers[data.id]){
    // change status of a vector: zoomLayers[data.id].setColor(status) ?
  }
  else{
    // add data.geo as if it were updated by this browser
    L.geoJson(data.geo, {
      style: function (feature) {
        if(data.status == "Demolished"){
          return {color: "#f00", opacity: 1};
        }
        else if(data.status == "Renovated"){
          return {color: "#0f0", opacity: 1};
        }
        else if(data.status == "Moved"){
          return {color: "#00f", opacity: 1};      
        }
        else{
          return {color: "orange", opacity: 1};
        }
      },
      onEachFeature: function(feature, layer){
        layer.bindPopup("<label><em>Name: </em></label><strong>" + replaceAll(replaceAll(name,"<","&lt;"),">","&gt;") + "</strong><br/><label><em>Description: </em></label><strong>" + replaceAll(replaceAll(detail,"<","&lt;"),">","&gt;") + "</strong>");
        zoomLayers[id] = layer;
      }
    }).addTo(map);
  }
  console.log("rcvd geo");
  console.log(data);
});