	// _map.map = L.map('map', { zoomControl: false }).setView([_options.cities[_options.selected.city][1], _options.cities[_options.selected.city][2]], _options.cities[_options.selected.city][3]);

	var randloc = randomProperty(_options.cities);
	_map.map = L.map('map', { zoomControl: false }).setView([randloc[1],randloc[2]], 12);

	L.control.zoom({position: 'topright'}).addTo(_map.map);
	L.control.scale().addTo(_map.map);


	_map.map.createPane('base');
	_map.map.getPane('base').style.zIndex = 100;
	_map.map.createPane('ct');
	_map.map.getPane('ct').style.zIndex = 200;
	_map.map.createPane('labels');
	_map.map.getPane('labels').style.zIndex = 300;

	var basemap = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png', {
		attribution: '<a href="https://www.openstreetmap.org/copyright">OSM</a>, <a href="https://carto.com/attributions">CARTO</a>',
		subdomains: 'abcd',
		minZoom: 0,
		maxZoom: 20,
		ext: 'png',
		pane: 'base'
	});

	var imagery = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
		attribution: '<a href="https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9">Esri</a>',
		pane: 'base'
	});

	var labels = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_only_labels/{z}/{x}/{y}{r}.png', {
		attribution: '<a href="http://stamen.com">Stamen Design</a>',
		subdomains: 'abcd',
		minZoom: 0,
		maxZoom: 20,
		ext: 'png',
		pane: 'labels'
	});

	var myStyle = {
	    "color": "#fff",
	    "weight": 1,
	    "opacity": 0.5,
	    "fillColor": "#666",
	    "fillOpacity": 0.1
	};

	var selected = {
	    "color": "#000",
	    "weight": 0,
	    "opacity": 1,
	    "fillColor": "#FF0",
	    "fillOpacity": 0.9
	};

	var baseMaps = {
	    "Default Map": basemap,
	    "Satellite": imagery
	};

	var overlayMaps = {
	    // "Geometry": _geojsonLayer,
	    "Labels": labels
	};


	// resetMap();


	function resetMap() {
		if (_geojsonLayer)
			_map.map.removeLayer(_geojsonLayer);
		// document.getElementById('legend').innerHTML = '<b>Legend</b>';
		getQuantiles();
		_geojsonLayer = new L.GeoJSON.AJAX("maplayers/"+_options.selected.city+"_"+_options.selected.resolution+".geojson", {
			style: myStyle, 
			onEachFeature: onEachFeature,
			pane: 'ct'
		}).addTo(_map.map);  

	}

	basemap.addTo(_map.map);
	// _geojsonLayer.addTo(_map.map);
	labels.addTo(_map.map);




	L.control.layers(baseMaps, overlayMaps).addTo(_map.map);

	function onEachFeature(feature, layer) {
	    layer.bindTooltip('Click to select');
	    layer.setStyle({fillColor: myStyle});
	    layer.on('click', function (e) {
	      layer.bindTooltip(feature.properties.id);
	      _options.selected.id = feature.properties.id;
	      var xhttp = new XMLHttpRequest();
	      xhttp.onreadystatechange = function() {
		    if (this.readyState == 4 && this.status == 200) {
		        _durations = JSON.parse(this.responseText);
		        calcPercentages	(_durations);
		        _map.changeMapColors();
		        getDurationHistogramOID();
		        getTimeOID();
		    }
		  };
	      xhttp.open("GET", "handlers/getDuration.php?city="+_options.selected.city+"&spatial="+_options.selected.resolution+"&id="+feature.properties.id+"&od="+_options.selected.od, true);
		  xhttp.send();
	    });

	}

function calcPercentages(dur) {
	dur = dur[_options.selected.vehicletype];
	var sum = 0;
	for(i in dur) {
		sum += parseInt(dur[i].count);
	}
	_options.selected.percentage = Math.round(sum/_options.selected.trips*1000)/10;
	// document.getElementById('stats_dynamic').innerHTML = perc+"%";
}

_map.changeMapColors = function() {

	if (_durations[_options.selected.vehicletype] && _options.selected.id) {
		_geojsonLayer.setStyle(myStyle);
		// Loop through each Census Tract in the GeoJSON ct.geojson layer
		_geojsonLayer.eachLayer(function(layer) {
			layer.nodata = false;
			
			layer.setTooltipContent("<i>No data</i>");
			if (layer.feature.properties.id == _options.selected.id) {
				layer.setStyle(selected);
				layer.setTooltipContent(makeToolTip(_durations[_options.selected.vehicletype][layer.feature.properties.id], layer.feature.properties.id));
			}
			else if (_durations[_options.selected.vehicletype][layer.feature.properties.id]) {
				layer.setStyle({fillColor :buildColors(_durations[_options.selected.vehicletype][layer.feature.properties.id].median), color:'#fff', weight:1, opacity: 0.7, fillOpacity: 0.7});
				layer.setTooltipContent(makeToolTip(_durations[_options.selected.vehicletype][layer.feature.properties.id], layer.feature.properties.id));
			}
			
		});
	}
}

function getQuantiles() {
	document.getElementById('legend').innerHTML = "<b>Legend</b>";
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		    _colorbreaks = JSON.parse(this.responseText);
		    for(i in _colorbreaks) {
		    	var a = "<div style='color:"+_options.legendtext[i]+";font-size:8pt;padding:2px;width:90px;text-align:center;margin:2px;background-color:"+_options.colorpalettes[_options.selected.palette][i]+"'>< "+convertStoMs(_colorbreaks[i])+"</div>";
		    	document.getElementById('legend').innerHTML += a;
		    }
		}
	};
	xhttp.open("GET", "handlers/getQuantiles.php?city="+_options.selected.city+"&spatial="+_options.selected.resolution+"&temporal="+_temporal, true);
	xhttp.send()
}

// Given a value between 0 and 1, return a color.  Equal Interval breaks (currently)
function buildColors(dur) {
	med = parseInt(dur);

	for(var i=0;i < _colorbreaks.length;i++) {
		if (med < _colorbreaks[i]) {
			return _options.colorpalettes[_options.selected.palette][i];
		}
	}
	
}



// Make the tooltip that is used when mousing over census tracts on the map
function makeToolTip(dur, did) {
	var content = "";
	if (dur) {
		content += "<b>"+_options.selected.vehicletype[0].toUpperCase() + "-" + _options.selected.vehicletype.substring(1,_options.selected.vehicletype.length) +"</b><hr/>From region "+_options.selected.id+" to region "+did+"<hr/>Median duration: "+convertStoMs(parseInt(dur.median));	
		content += "<br/>Mean duration: "+convertStoMs(parseInt(dur.avg));
		content += "<br/>Number of Trips: "+dur.count;
	} else {
		content += "<i>No Data</i>";
	}

	return content;
}

function convertStoMs(seconds) {
	let minutes = Math.floor(seconds / 60);
	let extraSeconds = seconds % 60;
	// minutes = minutes < 10 ? "0" + minutes : minutes;
	extraSeconds = extraSeconds< 10 ? "0" + extraSeconds : extraSeconds;
	return (minutes + "m " + Math.round(extraSeconds) + "s");
}