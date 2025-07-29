/* =====================================

	@author: Grant McKenzie
	@date: October 2023
	@project: Micromobility Travel Times
	@description: Control over page elements

======================================= */

// See options when you click a drop down
document.getElementById('cityname').onclick = function() {
  document.getElementById("citydd").classList.toggle("show");
}
document.getElementById('resolutionname').onclick = function() {
  document.getElementById("resolutiondd").classList.toggle("show");
}
document.getElementById('odname').onclick = function() {
  document.getElementById("oddd").classList.toggle("show");
}
document.getElementById('vehicletype').onclick = function() {
  document.getElementById("vehicledd").classList.toggle("show");
}
document.getElementById('dialog-close').onclick = function() {
  document.getElementById("dialog").style.display = 'none';
  document.getElementById("dialog-wrapper").style.display = 'none';
}
document.getElementById('dialog-wrapper').onclick = function() {
  document.getElementById("dialog").style.display = 'none';
  document.getElementById("dialog-wrapper").style.display = 'none';
}
document.getElementById('source').onclick = function() {
	var s = _options.selected.tripstats;
	var sumcount = sumValues(s.counts);
	var scootercount = s.counts.escooter.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	var bikecount = s.counts.ebicycle > 0 ? s.counts.ebicycle.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : 0;
	
	_content.sourcedetails = "<p>For the city of "+(s.city.charAt(0).toUpperCase() + s.city.slice(1))+" a total of "+sumcount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " trips using vehicles from the "+s.operator+" operator were recorded between " + s.from + " and " + s.to;
	_content.sourcedetails += " Of these trips, " + scootercount + " ("+(Math.round((s.counts.escooter/sumcount)*1000)/10)+"%) were taken on an e-scooter with a median duration of " + convertStoMs(s.durations.escooter) + ".";
	_content.sourcedetails += bikecount != 0 ? " E-bicycle trips totalled " + bikecount + " trips ("+(Math.round((s.counts.ebicycle/sumcount)*1000)/10)+"%) with a median duration of " + convertStoMs(s.durations.ebicycle) + "." : "";
	_content.sourcedetails += "</p><p>Data were accessed via the operator's public API and trips were identified based on when and where a vehicle disappeared from the live list of available vehicles, to when it reappeared. Trips were recorded to the nearest minute.</p> <p>More information on how trips were generated is outlined in the following paper: McKenzie, G. (Forthcoming) MODAP: A Multi-City Open Data & Analytics Platform for Micromobility Research. <i>Proceedings of the 13th International Conference on Geographic Information Science (GIScience 2025).</i> Leibniz International Proceedings in Informatics (LIPIcs). Schloss Dagstuhl-Leibniz-Zentrum für Informatik. (August 26-29, 2025; Christchurch, New Zealand)</p>";
	document.getElementById("dialog-title").innerHTML = 'Source Information';
	document.getElementById("dialog-content").innerHTML = _content.sourcedetails;
  document.getElementById("dialog").style.display = 'block';
  document.getElementById("dialog-wrapper").style.display = 'block';
}

const sumValues = obj => Object.values(obj).reduce((a, b) => a + b, 0);


// Change the legend palette when you click it
document.getElementById('legend').onclick = function() {
	_options.selected.palette += 1;
	if (_options.selected.palette == _options.colorpalettes.length)
		_options.selected.palette = 0;
	_map.changeMapColors();
	getQuantiles();
}

// Down load data
document.getElementById('download').onclick = function() {
	// window.open("data/mm-travel-times_"+_options.selected.city+"_"+_resolution+".zip", "_blank");
	document.getElementById('dialog-content').innerHTML = "<p>Trip data aggregated to the three geographies are provided through the links below.</p><p>"
	document.getElementById('dialog-content').innerHTML += "Administrative: <a target='_blank' href='downloads/MODAP_"+capfirst(_options.selected.city)+"_DISTRICTS.zip'>MODAP_"+capfirst(_options.selected.city)+"_DISTRICTS.zip</a><br/>";
	document.getElementById('dialog-content').innerHTML += "1000 metre hexagons: <a target='_blank' href='downloads/MODAP_"+capfirst(_options.selected.city)+"_HEX1000m.zip'>MODAP_"+capfirst(_options.selected.city)+"_HEX1000m.zip</a><br/>";
	document.getElementById('dialog-content').innerHTML += "500 metre hexagons: <a target='_blank' href='downloads/MODAP_"+capfirst(_options.selected.city)+"_HEX500m.zip'>MODAP_"+capfirst(_options.selected.city)+"_HEX500m.zip</a>";
	document.getElementById('dialog-content').innerHTML += "</p><p>If you use these data, please cite:</p><p>McKenzie, G. (2025) MODAP: A Multi-City Open Data & Analytics Platform for Micromobility Research. <i>Proceedings of the 13th International Conference on Geographic Information Science (GIScience 2025).</i> Leibniz International Proceedings in Informatics (LIPIcs). Schloss Dagstuhl-Leibniz-Zentrum für Informatik. 346. 6. (August 26-29, 2025; Christchurch, New Zealand)</p>";

	document.getElementById('dialog').style.display = 'block';
}

function capfirst(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}


// Change the city
function setCity(city) {
	_options.selected.city = city
	document.getElementById('cityname').innerHTML = _options.cities[city][0];
	_map.map.setView([_options.cities[city][1], _options.cities[city][2]], _options.cities[city][3]);
	document.querySelectorAll('.labels').forEach(el => el.style.display = 'block');
	document.getElementById('download_wrapper').style.display = 'block';
	document.getElementById('resolutionname').style.display = 'block';
	document.getElementById('odname').style.display = 'block';
	document.getElementById('vehicletype').style.display = 'block';
	resetMap();
	getTime();
	getDurationHistogram();
	getStats();
}

function setResolution(res) {
	_options.selected.resolution = res;
	document.getElementById('resolutionname').innerHTML = _options.spatial[res];
	resetMap();
}

function setVT(vt) {
	_options.selected.vehicletype = vt;
	document.getElementById('vehicletype').innerHTML = _options.vts[vt];
	setTimeChart(vt);
	setDurationChart(vt);
	setStats(vt);
	resetMap();
}

function setOD(od) {
	_options.selected.od = od;
	document.getElementById('odname').innerHTML = _options.ods[od];
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		    _durations = JSON.parse(this.responseText);
		    _map.changeMapColors();
		    getDurationHistogramOID();
		    getTimeOID();
		}
	};
	xhttp.open("GET", "handlers/getDuration.php?wknd="+_wknd+"&hr="+_hour+"&city="+_options.selected.city+"&spatial="+_options.selected.resolution+"&temporal="+_temporal+"&id="+_options.selected.id+"&od="+_options.selected.od, true);
	xhttp.send()
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


function randomProperty(obj) {
    var keys = Object.keys(obj);
    return obj[keys[ keys.length * Math.random() << 0]];
};	
