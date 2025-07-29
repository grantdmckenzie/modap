//getTime();
//getDurationHistogram();
//getStats();

var _chart1data = null;
var _chart2data = null;
var _charts = {};
_charts.time = null;
_charts.duration = null;
_charts.times = null;
_charts.durations = null;

function getTime() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		    times = JSON.parse(this.responseText);
		    _charts.times = times;
		    _options.vts = {};
		    for(var key in times) {
		    	_options.vts[key] = key[0].toUpperCase() + '-' + key.substring(1,key.length);
		    }

		    loadVTs();
		    setTimeChart(_options.selected.vehicletype);
		    document.getElementById('vehicletype').innerHTML = _options.vts[_options.selected.vehicletype];
		}
	};
	xhttp.open("GET", "handlers/getTime.php?city="+_options.selected.city, true);
	xhttp.send()
}

function setTimeChart(vt) {
  const xValues = [...Array(24).keys()];
  if (typeof(_charts.time) != "undefined" && _charts.time != null) {
   _charts.time.destroy();
	 }
 //_chart1 = new Chart("tempchart", {
  _chart1data = {
   type: "line",
   data: {
    labels: xValues,
    datasets: [{
      label: "Region Weekdays",
      data: [],
      borderWidth: 3,
      borderColor: "#0043E8",
      fill: false,
      spanGaps: false
    },{
      label: "Region Weekends",
      data: [],
      borderWidth: 3,
      borderColor: "#2CBA00",
      fill: false,
      spanGaps: false
    },{
    	label: "All Weekdays",
      data: _charts.times[vt][1],
      borderColor: "#BECCE3",
      borderWidth: 4,
      fill: false,
      spanGaps: false
    },{
      label: "All Weekends",
      data: _charts.times[vt][0],
      borderColor: "#C3E3BE",
      borderWidth: 4,
      fill: false,
      spanGaps: false
    }]
  },
  options: {
    scales: {
      yAxes: [{
       scaleLabel: {
         display: true,
         labelString: 'Percent of Trips'
       }
      }],
      xAxes: [{
       scaleLabel: {
         display: true,
         labelString: 'Hours of the Day'
       }
     }]
    },
     legend: {
        display: true,
        position: 'bottom',
        align: 'center',
        labels: {fontSize:11}
     }
       
  }
}
//});
var ctx = document.getElementById('tempchart').getContext('2d');
_charts.time = new Chart(ctx, _chart1data);
_charts.time.update();
}

function getMapFromChart(dataset, hour) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		    _durations = JSON.parse(this.responseText);
		    _map.changeMapColors();
		}
	};
	xhttp.open("GET", "handlers/getTimeSpecific.php?city="+_options.selected.city+"&hr="+hour+"&wknd="+dataset+"&oid="+_options.selected.id, true);
	xhttp.send()
}


function getTimeOID() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		    times = JSON.parse(this.responseText);
		    _charts.time.data.datasets[0].data = times[1];
		    _charts.time.data.datasets[1].data = times[0];
		    _charts.time.update();
		}
	};
	xhttp.open("GET", "handlers/getTimesOID.php?city="+_options.selected.city+"&resolution="+_options.selected.resolution+"&id="+_options.selected.id+"&vt="+_options.selected.vehicletype+"&od="+_options.selected.od, true);
	xhttp.send()
}

function getStats() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		    stats = JSON.parse(this.responseText);
		    _options.selected.trips = stats.count;
		    _options.selected.tripstats = stats;
		    setStats(_options.selected.vehicletype);
		}
	};
	xhttp.open("GET", "handlers/getStats.php?city="+_options.selected.city, true);
	xhttp.send()
}

function setStats(vt) {

    document.getElementById('stats_trips').innerHTML = stats.counts[vt].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    document.getElementById('stats_median').innerHTML = convertStoMs(stats.durations[vt]);
    // document.getElementById('dates').innerHTML = stats.from + " - " + stats.to;
    //document.getElementById('operator').innerHTML = stats.operator;
}


function getDurationHistogram() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		    _charts.durations = JSON.parse(this.responseText);
		    setDurationChart(_options.selected.vehicletype);
		}
	};
	xhttp.open("GET", "handlers/getDurationHistogram.php?city="+_options.selected.city, true);
	xhttp.send()
}

function setDurationChart(vt) {
			const xValues = Object.keys(_charts.durations[vt]);
		    if (typeof(_charts.duration) != "undefined" && _charts.duration != null) {
            _charts.duration.destroy();
        	 }
        	_chart2data = {
			  type: "bar",
			  data: {
			    labels: xValues,
			    datasets: [{
			      label: "Selected Region",
			      data: [],
			      borderWidth: 1,
			      borderColor: "#B74EF0",
			      backgroundColor: "#B74EF0",
			      fill: false,
			      spanGaps: false
			    },{
			      label: "All Trips",
			      data: Object.values(_charts.durations[vt]),
			      borderWidth: 1,
			      borderColor: "#DBBDEB",
			      backgroundColor: "#DBBDEB",
			      fill: false,
			      spanGaps: false
			    }]
			  },
			  options: {
			    scales: {
			      yAxes: [{
			       scaleLabel: {
			         display: true,
			         labelString: 'Percentage of Trips'
			       }
			      }],
			      xAxes: [{
			       scaleLabel: {
			         display: true,
			         labelString: 'Duration Bins (5 mins)'
			       }
			     }]
			    },
              legend: {
                 display: true,
                 position: 'bottom',
                 align: 'center',
                 labels: {fontSize:11}
              }
                
			  }
			} //);
			var ctx = document.getElementById('durationchart').getContext('2d');
			_charts.duration = new Chart(ctx, _chart2data);
         _charts.duration.update();
}


function getDurationHistogramOID() {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
		    times = JSON.parse(this.responseText);
		    _charts.duration.data.datasets[0].data = Object.values(times);
		    _charts.duration.update();
		}
	};
	xhttp.open("GET", "handlers/getDurationHistogramOID.php?city="+_options.selected.city+"&resolution="+_options.selected.resolution+"&id="+_options.selected.id+"&od="+_options.selected.od+"&vt="+_options.selected.vehicletype, true);
	xhttp.send()
}