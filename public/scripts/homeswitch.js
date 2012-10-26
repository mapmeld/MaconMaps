var currentTab = "osmgoogle";
var currentMap = "mapquest";
function switchTo(id){
	document.getElementById(currentTab).style.display = "none";
	document.getElementById(currentTab + "tab").className = "";
	document.getElementById(id).style.display = "inline";
	document.getElementById(id + "tab").className = "active";
	currentTab = id;
}
function setTile(id){
	document.getElementById(currentMap + "tab").className = "span3";
	document.getElementById(id + "tab").className = "active span3";
	var mapurls = document.getElementsByClassName(currentMap + "url");
	for(var m=0;m<mapurls.length;m++){
	  mapurls[m].style.display = "none";
	}
	currentMap = id;
	var mapurls = document.getElementsByClassName(currentMap + "url");
	for(var m=0;m<mapurls.length;m++){
	  mapurls[m].style.display = "block";
	}
}