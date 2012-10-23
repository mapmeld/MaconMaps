var currentTab = "osmgoogle";
function switchTo(id){
	document.getElementById(currentTab).className = "";
	document.getElementById(id).className = "active";
	currentTab = id;
}