var currentTab = "osmgoogle";
var currentMap = "mapquest";
function switchTo(id){
	document.getElementById(currentTab).style.display = "none";
	document.getElementById(currentTab + "tab").className = "";
	document.getElementById(id).style.display = "block";
	document.getElementById(id + "tab").className = "active";
	currentTab = id;
}
function setTile(id){
	document.getElementById(currentMap + "tab").className = "none";
	document.getElementById(id + "tab").className = "active";
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