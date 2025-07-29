/* =====================================

	@author: Grant McKenzie
	@date: October 2023
	@project: Micromobility Travel Times
	@description: Main.js

======================================= */

	var _map = {};
	var _options = {};
	var _data = {};

	var _geojsonLayer = null;
	var _durations = null;
	var _city = null;
	var _resolution = null;
	var _temporal = 'duration';
	var _colorbreaks = null;
	var _hour = 0;
	var _wknd = 0;
	var _chart1 = null;
	var _chart2 = null;
	var _od = 'oid';
	var _content = {};
	
	// Defaults
	_options.selected = {};
	_options.selected.id = null;
	_options.selected.palette = 0;
	_options.selected.city = 'berlin';
	_options.selected.resolution = 'osm';
	_options.selected.od = 'oid';
	_options.selected.vehicletype = 'escooter';

	// Options
	_options.colorpalettes = [];
	_options.colorpalettes[0] = ['#000004','#180f3e','#440f76','#721f81','#9e2f7f','#cd3f71','#f1605d','#fd9567','#fec98d','#fcfdbf'];
	_options.colorpalettes[1] = ['#440154','#472878','#3e4a89','#31688e','#25838e','#1e9e89','#35b779','#6cce59','#b5de2c','#fbfd6c'];
	_options.colorpalettes[2] = ['#000','#222','#444','#666','#888','#aaa','#bbb','#ccc','#ddd','#eee'];
	_options.colorpalettes[3] = ['#033200','#004529','#006837','#238443','#41ab5d','#78c679','#addd8e','#d9f0a3','#f7fcb9','#ffffe5'];
	_options.legendtext = ['#fff','#fff','#fff','#fff','#fff','#fff','#000','#000','#000','#000'];

	_options.cities = {};
	_options.cities['berlin'] = ['Berlin, Germany',52.51, 13.35, 12];
	//_options.cities['budapest'] = ['Budapest, Hungary',47.49, 19.05, 12];
	// _options.cities['dubai'] = ['Dubai, UAE',25.16, 55.22, 12];
	_options.cities['helsinki'] = ['Helsinki, Finland',60.19, 24.95, 12];
	_options.cities['london'] = ['London, United Kingdom',51.50, -0.170, 12];
	// _options.cities['milan'] = ['Milan, Italy',45.47, 9.19, 12];
	//_options.cities['oslo'] = ['Oslo, Norway',59.91, 10.77, 12];
	_options.cities['paris'] = ['Paris, France',48.86, 2.34, 12];
	//_options.cities['stockholm'] = ['Stockholm, Sweden',59.32, 18.06, 12];
	//_options.cities['vienna'] = ['Vienna, Austria',48.21, 16.37, 12];	
	_options.cities['washington'] = ['Washington DC, USA',38.90, -77.028, 12];
	_options.cities['wellington'] = ['Wellington, New Zealand',-41.27, 174.76, 12];
	// _options.cities['copenhagen'] = ['Copenhagen, DK',55.68, 12.53, 12];
	// _options.cities['zurich'] = ['Z&uuml;rich, Switzerland',47.38, 8.54, 12];	
	

	_options.spatial = {};
	_options.spatial['osm'] = 'Administrative';
	_options.spatial['hex500'] = 'Hexagons - 500m';
	_options.spatial['hex1000'] = 'Hexagons - 1000m';

	_options.ods = {};
	_options.ods['oid'] = 'Origins';
	_options.ods['did'] = 'Destinations';

	_options.vts = {};
	_options.selected.tripstats = {};

	_content.sourcedetails = "";

	// Load the Dropdowns
	for(i in _options.cities) {
		document.getElementById('citydd').innerHTML += '<a href="#"  onclick="setCity(\''+i+'\');">'+_options.cities[i][0]+'</a>';
	}
	for(i in _options.spatial) {
		document.getElementById('resolutiondd').innerHTML += '<a href="#" onclick="setResolution(\''+i+'\');">'+_options.spatial[i]+'</a>';
	}

	for(i in _options.ods) {
		document.getElementById('oddd').innerHTML += '<a href="#" onclick="setOD(\''+i+'\');">'+_options.ods[i]+'</a>';
	}
	
	function loadVTs() {
		document.getElementById('vehicledd').innerHTML = "";
		for(i in _options.vts) {
			document.getElementById('vehicledd').innerHTML += '<a href="#" onclick="setVT(\''+i+'\');">'+_options.vts[i]+'</a>';
		}
	}
