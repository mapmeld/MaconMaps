var currentTab = "osmgoogle";
function switchTo(id){
	document.getElementById(currentTab).style.display = "none";
	document.getElementById(currentTab + "tab").className = "";
	document.getElementById(id).style.display = "block";
	document.getElementById(id + "tab").className = "active";
	currentTab = id;
}