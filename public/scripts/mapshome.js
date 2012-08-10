function init(){
	if(gup("latlng")){
		var lat = gup("latlng").split(",")[0];
		var lng = gup("latlng").split(",")[1];
		var map = document.createElement("img");
		var coords = {
			minx: lng * 1.0 - 0.00254,
			miny: lat * 1.0 - 0.00135,
			maxx: lng * 1.0 + 0.00254,
			maxy: lat * 1.0 + 0.00135
		};
		//map.src = "http://gis.co.bibb.ga.us/ArcGISBibb/rest/services/AG4LG/ParcelPublicAccess/MapServer/export?bbox=" + coords.minx + "," + coords.miny + "," + coords.maxx + "," + coords.maxy + "&bboxSR=4326&layers=&layerdefs=&size=480,300&imageSR=&format=png&transparent=false&dpi=&time=&layerTimeOptions=&f=image";
		map.className = "center";
		map.height = 300;
		map.width = 480;
		document.body.appendChild(map);
		var address = document.createElement("h3");
		address.innerHTML = replaceAll(gup("address"),'%20',' ');
		document.body.appendChild(address);
	}
	else{
		var frm = document.createElement("form");
		frm.action = "/mapbyaddress"
		frm.method = "GET";
		frm.innerHTML = "<input type='text' name='address'/><br/><input type='submit' value='Map It'/>";
		document.body.appendChild(frm);
	}
}
function replaceAll(src,oldr,newr){
	while(src.indexOf(oldr) > -1){
		src = src.replace(oldr,newr);
	}
	return src;
}
function gup(nm){nm=nm.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");var rxS="[\\?&]"+nm+"=([^&#]*)";var rx=new RegExp(rxS);var rs=rx.exec(window.location.href);if(!rs){return null;}else{return rs[1];}}
function getWMS(x, y, z){
	var maxExtent = {
		left: -20037508.34,
		right: 20037508.34,
		top: 20037508.34,
		bottom: -20037508.34
	}
	var wmsExtent = { };
	var b = 78271.516953125 / Math.pow(2, z - 1);
	wmsExtent.left = b * 256 * x + maxExtent.left;
	wmsExtent.right = b * 256 * (x+1) + maxExtent.left;
	wmsExtent.top = b * -256 * y + maxExtent.top;
	wmsExtent.bottom = b * -256 * (y+1) + maxExtent.top;
	//return "http://gis.co.bibb.ga.us/ArcGISBibb/rest/services/AG4LG/ParcelPublicAccess/MapServer/export?bbox=" + wmsExtent.left + "," + wmsExtent.bottom + "," + wmsExtent.right + "," + wmsExtent.top + "&bboxSR=102113&layers=&layerdefs=&size=256,256&imageSR=&format=png&transparent=false&dpi=&time=&layerTimeOptions=&f=image";
}