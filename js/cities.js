


/* When the user clicks on the button, 
toggle between hiding and showing the dropdown content */
function cityclick() {
  document.getElementById("citydd").classList.toggle("show");
}
function resolutionclick() {
  document.getElementById("resolutiondd").classList.toggle("show");
}
function temporalclick() {
  document.getElementById("temporaldd").classList.toggle("show");
}
function odclick() {
  document.getElementById("oddd").classList.toggle("show");
}


// Close the dropdown if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn')) {
    var dropdowns = document.getElementsByClassName("dropdown-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}


function setCity(city) {
	_city = city
	document.getElementById('cityname').innerHTML = _cities[city][0];
	_map.setView([_cities[city][1], _cities[city][2]], _cities[city][3])
	resetMap();
	getTime();
	getDurationHistogram();
}

function setResolution(res) {
	_resolution = res;
	document.getElementById('resolutionname').innerHTML = _spatial[res];
	resetMap();
}

function setTemporal(temp) {
	_temporal = temp;
	document.getElementById('temporalname').innerHTML = _temporals[temp];
	if (temp == 'hrwknd') {
		document.getElementById('hoursdd_wrapper').style.display = "block";
		document.getElementById('wknddd_wrapper').style.display = "block";
	} else {
		document.getElementById('hoursdd_wrapper').style.display = "none";
		document.getElementById('wknddd_wrapper').style.display = "none";
	}
	resetMap();
}

function setOD(od) {
	_od = od;
	document.getElementById('odname').innerHTML = _ods[od];
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		    _durations = JSON.parse(this.responseText);
		    changeMapColors();
		    getDurationHistogramOID();
		    //getTimeOID();
		}
	};
	xhttp.open("GET", "handlers/getDuration.php?wknd="+_wknd+"&hr="+_hour+"&city="+_city+"&spatial="+_resolution+"&temporal="+_temporal+"&id="+_selectedid+"&od="+_od, true);
	xhttp.send()
}

function doDownload() {
	window.open("data/mm-travel-times_"+_city+"_"+_resolution+".zip", "_blank");
}

function changePalette() {
	var len = _colorpalette.length;
	_palette += 1;
	if (_palette == len)
		_palette = 0;
	changeMapColors();
	getQuantiles();
}
