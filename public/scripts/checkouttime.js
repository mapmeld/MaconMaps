var years = {},
  yearlist = [],
  year_links = [],
  set_time_period;
  
var codeToTime = function(yearCode){
  console.log(yearCode);
  yearCode -= 2000;
  var year = 1997 + Math.floor(yearCode / 12);
  var month = yearCode % 12;
  var monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return monthNames[month] + " " + year;
};

function getURLParameter(name) {
    return decodeURIComponent((new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search)||[,""])[1].replace(/\+/g, '%20'))||null;
}

$(document).ready(function(){

var timeline = document.getElementById('timeline'),
  controls = document.getElementById('controls');

var minlat = 1000;
var maxlat = -1000;
var minlng = 1000;
var maxlng = -1000;

  // create map with College Hill highlighted ( generalize in future versions )
  var map = mapbox.map('map');
  map.ui.zoomer.add();
  map.addLayer(mapbox.layer().id('mapmeld.map-ofpv1ci4'));

  var markerLayer = mapbox.markers.layer()
    // start with all markers hidden
    .filter(function(f) { return false })
    .url('/timeline-at.geojson?customgeo=' + getURLParameter("customgeo"), function(err, features) {
      // callback once GeoJSON is loaded

      set_time_period = function(y) {
        return function() {
          $("#mydate").html( codeToTime(y) );
          markerLayer.filter(function(f) {
            return (f.properties.startyr <= y && f.properties.endyr >= y);
          });
          return false;
        };
      };

      for (var i = 0; i < features.length; i++) {
        years[features[i].properties.year] = true;
        minlat = Math.min(minlat, features[i].geometry.coordinates[1]);
        maxlat = Math.max(maxlat, features[i].geometry.coordinates[1]);
        minlng = Math.min(minlng, features[i].geometry.coordinates[0]);
        maxlng = Math.max(maxlng, features[i].geometry.coordinates[0]);        
      }
      map.setExtent(new MM.Extent(maxlat, minlng, minlat, maxlng));

      for (var y in years) {
        yearlist.push(y);
      }
      yearlist.sort();

      for (var i = 0; i < yearlist.length; i++) {
        var a = timeline.appendChild(document.createElement('a'));
        a.innerHTML = codeToTime(yearlist[i]) + ' ';
        a.id = 'y' + yearlist[i];
        a.href = '#';
        a.onclick = set_time_period(yearlist[i]);
      }

      var play = controls.appendChild(document.createElement('a')),
        stop = controls.appendChild(document.createElement('a')),
        playStep;
    
      var myd = document.createElement("strong");
      myd.id = "mydate";
      myd.style.fontSize = "16pt";
      myd.style.marginLeft = "50px";
      myd.innerHTML = "Jan 1997";
      controls.appendChild( myd );
      $("#loading").css({ display: "none" });

      stop.innerHTML = '<a class="btn btn-inverse"><i class="icon-stop icon-white"></i> Stop</a>';
      play.innerHTML = '<a class="btn btn-success"><i class="icon-play-circle icon-white"></i> Play</a>';

      play.onclick = function() {
        var step = $("#filter").slider('value');
        // Every quarter-second (250 ms) increment the time period
        // When the end is reached, call clearInterval to stop the animation.
        playStep = window.setInterval(function() {
          if (step < $("#filter").slider('option', 'max')) {
            set_time_period(step)();
            $("#filter").slider('value', step);
            step++;
          }
          else {
            window.clearInterval(playStep);
          }
        }, 500);
      };

      stop.onclick = function() {
        window.clearInterval(playStep);
      };

      set_time_period(2000)();
  });

  map.addLayer(markerLayer);
  
  // generalize code to fit all markers
  map.zoom(15).center({ lat: 32.837026, lon:  -83.6457823 });

  // make a jQuery slider to view code enforcement case timeline
  $("#filter").slider({
    orientation: "horizontal",
    range: "min",
    min: 2000,
    max: 2185,
    value: 2000,
    slide: function (event, ui) {
      set_time_period(ui.value)();
    }
  });

});

// Analytics
  var _gaq = _gaq || [];
  _gaq.push(['_setAccount', 'UA-35749214-1']);
  _gaq.push(['_trackPageview']);

  (function() {
    var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();