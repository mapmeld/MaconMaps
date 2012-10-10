var years = {},
  yearlist = [],
  year_links = [],
  set_time_period;
  
var codeToTime = function(yearCode){
  yearCode -= 2000;
  var year = 1997 + (yearCode - (yearCode % 12)) / 12;
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

  // create map with College Hill highlighted ( generalize in future versions )
  var map = mapbox.map('map');
  map.addLayer(mapbox.layer().id('mapmeld.map-uyl6ixjz'));

  var markerLayer = mapbox.markers.layer()
    // start with all markers disabled
    .filter(function() { return false })
    .url('/timeline-at.geojson?customgeo=' + getURLParameter("customgeo"), function(err, features) {
      // callback once GeoJSON is loaded

      set_time_period = function(y) {
        return function() {
          $("#mydate").html( codeToTime(y) );
          var active = document.getElementsByClassName('year-active');
          if (active.length) {
            active[0].className = '';
          }
          if( document.getElementById('y' + y) ){
            document.getElementById('y' + y).className = 'year-active';
          }
          markerLayer.filter(function(f) {
            return (f.properties.startyr <= y && f.properties.endyr >= y);
          });
          return false;
        };
      };

      for (var i = 0; i < features.length; i++) {
        years[features[i].properties.year] = true;
      }

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
        var step = $("#filter").slider('value') - 2000;
        // Every quarter-second (250 ms) increment the time period
        // When the end is reached, call clearInterval to stop the animation.
        playStep = window.setInterval(function() {
          if (step < yearlist.length) {
            set_time_period(yearlist[step])();
            $("#filter").slider('value', yearlist[step]);
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
  
  // generalize code to fit all markers, not a specific lat / lon
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