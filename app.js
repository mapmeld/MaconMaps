/*jshint laxcomma:true */

/**
 * Module dependencies.
 */
var express = require('express')
    , mongoose = require('mongoose')
    //, auth = require('./auth')
    //, mongoose_auth = require('mongoose-auth')
    //, mongoStore = require('connect-mongo')(express)
    , routes = require('./routes')
    , middleware = require('./middleware')
    , CartoDB = require('./cartodb/lib/cartodb')
    , request = require('request')
    , specialpoint = require('./specialpoint')
    , timepoint = require('./timepoint')
    , customgeo = require('./customgeo')
    ;

var HOUR_IN_MILLISECONDS = 3600000;
//var session_store;

var init = exports.init = function (config) {
  
  var db_uri = process.env.MONGOLAB_URI || process.env.MONGODB_URI || config.default_db_uri;

  mongoose.connect(db_uri);
  //session_store = new mongoStore({url: db_uri});

  var app = express.createServer();

  app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', { pretty: true });

    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    //app.use(express.session({secret: 'top secret', store: session_store,
    //  cookie: {maxAge: HOUR_IN_MILLISECONDS}}));
    //app.use(mongoose_auth.middleware());
    app.use(express.static(__dirname + '/public'));
    app.use(app.router);

  });

  app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  });

  app.configure('production', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: false}));
  });
  
  
  // Routes
  app.get('/', function(req, res){
    res.render('mapsevent');
  });
  
  app.get('/collegehill', function(req, res){
    res.render('neighbordiff');
  });
  
  app.get('/lynmore', function(req, res){
    res.render('lynmore');
  });

  app.get('/promise', function(req, res){
    res.render('promise');
  });

function replaceAll(src, oldr, newr){
  while(src.indexOf(oldr) > -1){
    src = src.replace(oldr, newr);
  }
  return src;
}

  client = new CartoDB({ user: "mapmeld", api_key: "a7f9c9a3ca871072545cc433be20c76aee0f9994"});

  app.get('/detailtable', function(req, res){
    var tablename = req.query['table'] || "collegeplusintown";
    var name = replaceAll(req.query['name'],"'","\\'");
    var detail = replaceAll(req.query['detail'],"'","\\'");
    client.on('data', function(data){ });
    client.query("UPDATE " + tablename + " SET (name,description) = ('" + name + "','" + detail + "') WHERE cartodb_id = " + req.query['id']);
    res.send({});
  });

  app.get('/changetable', function(req, res){
    var tablename = req.query['table'] || "collegeplusintown";
    if(req.query['marker'] == 'newpoint'){
      // CartoDB SQL API needs a properly-formatted MultiPolygon
      //client.query("insert into " + tablename + " (status, the_geom) values ('new', ST_SetSRID(ST_MultiPolygon(((" + req.query['ll'].replace(',',' ') + "))),4326))");
      
      // until then, use MongoDB
      var latlngarray = req.query['ll'].split(',');
      latlngarray[0] *= 1;
      latlngarray[1] *= 1;
      pt = new specialpoint.SpecialPoint({
        status: 'new',
        tablematch: tablename,
        ll: latlngarray,
        name: req.query['name'],
        description: req.query['detail']
      });
      pt.save(function(err){
        res.send(err || 'success');
      });
    }
    else{
      client.on('data', function(data){ });
      client.query("update " + tablename + " SET status = '" + req.query['status'] + "' WHERE cartodb_id = " + req.query['id']);
      res.send({});
    }
  });
  
  app.get('/placesearch', function(req, res){
    var address = req.query['address'];
    if(req.query['address'].toLowerCase().indexOf("macon") == -1){
      address += ",Macon,GA";
    }
    var requestOptions = {
      'uri': 'http://geocoder.us/service/csv/geocode?address=' + encodeURIComponent(address)
    };
    
    request(requestOptions, function (err, response, body) {
      res.send({ position: body });
    });
  });
  
  app.get('/storedbuildings', function(req, res){
    var tablename = req.query['table'] || "collegeplusintown";
    specialpoint.SpecialPoint.find({ tablematch: tablename }).exec(function(err, buildings){
      res.send(buildings);
    });
  });
  
  app.get('/storedbuildings/edit', function(req, res){
    specialpoint.SpecialPoint.findOne({'_id': req.query['id']}, function(err, pt){
      if(pt){
        pt.name = req.query['name'];
        pt.description = req.query['detail'];
        pt.save(function(err){
          res.send(err || 'success');
        });
      }
      else{
        res.send('no marker');
      }
    });
  });
  
  app.get('/tokml.kml', function(req, res){
    // returns all changed polygons from the CartoDB table
    var tablename = req.query['table'] || 'collegeplusintown';
    var username = req.query['user'] || 'mapmeld';
    var wherecondition = '%20WHERE%20status%20!=\'Unchanged\'';
    if(req.query['where'] && req.query['where'] == "all"){
      wherecondition = '';
    }
    var requestOptions = {
      'uri': 'http://' + username + '.cartodb.com/api/v2/sql?format=GeoJSON&q=SELECT%20name,description,status,the_geom%20FROM%20' + tablename + wherecondition
    };
    request(requestOptions, function (err, response, body) {
      
      // return special points from this map, too
      specialpoint.SpecialPoint.find({ tablematch: tablename }).exec(function(err, points){
        var features = JSON.parse(body).features;
        res.setHeader('Content-Type', 'application/kml');
        var describe = function(description){
          if((typeof description === 'undefined') || (!description)){
            return "";
          }
          // allow link:http://example.com
          while(description.indexOf("link:") > -1){
            description = description.split("link:");
            if(description[1].indexOf(" ") > -1){
              description[1] = "<a href='" + description[1].split(" ")[0] + "'>" + description[1].split(" ")[0] + "</a> " + description[1].split(" ")[1];
            }
            else{
              description[1] = "<a href='" + description[1] + "'>" + description[1] + "</a>";
            }
            description = description.join("link:");
            description = description.replace("link:","");
          }
          // allow photo:http://example.com/image.jpg
          while(description.indexOf("photo:") > -1){
            description = description.split("photo:");
            if(description[1].indexOf(" ") > -1){
              description[1] = "<br/><img src='" + description[1].split(" ")[0] + "' width='250'/><br/>" + description[1].split(" ")[1];
            }
            else{
              description[1] = "<br/><img src='" + description[1] + "' width='250'/>";
            }
            description = description.join("photo:");
            description = description.replace("photo:","");
          }
          return description;
        };
        
        var kmlintro = '<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://www.opengis.net/kml/2.2" xmlns:gx="http://www.google.com/kml/ext/2.2" xmlns:kml="http://www.opengis.net/kml/2.2" xmlns:atom="http://www.w3.org/2005/Atom">\n<Document>\n	<name>NeighborDiff API</name>\n	<Folder id="KMLAPI">\n		<name>NeighborDiff API Download</name>\n';
        var kmlstyles = '<Style id="Renovated">\n<PolyStyle>\n<color>cc00ff00</color>\n<fill>1</fill>\n</PolyStyle>\n</Style>\n';
        kmlstyles += '<Style id="Demolished">\n<PolyStyle>\n<color>cc0000ff</color>\n<fill>1</fill>\n</PolyStyle>\n</Style>\n';
        kmlstyles += '<Style id="Moved">\n<PolyStyle>\n<color>ccff0000</color>\n<fill>1</fill>\n</PolyStyle>\n</Style>\n';
        kmlstyles += '<Style id="Unchanged">\n<PolyStyle>\n<color>cc0088ff</color>\n<fill>1</fill>\n</PolyStyle>\n</Style>\n';
        var kmldocs = '';
        var kmlend = '	</Folder>\n</Document>\n</kml>';
        for(var f=0;f<features.length;f++){
          kmldocs += '<Placemark>\n';
          if(features[f].properties.name){
            kmldocs += '	<name>' + features[f].properties.name + '</name>\n';
          }
          if(features[f].properties.description){
            kmldocs += '	<description><![CDATA[<div>' + describe(features[f].properties.description) + '</div>]]></description>\n';
          }
          if(features[f].properties.status == "Demolished"){
            kmldocs += '	<styleUrl>#Demolished</styleUrl>\n';
          }
          else if(features[f].properties.status == "Renovated"){
            kmldocs += '	<styleUrl>#Renovated</styleUrl>\n';
          }
          else if(features[f].properties.status == "Unchanged"){
            kmldocs += '	<styleUrl>#Unchanged</styleUrl>\n';
          }
          else if(features[f].properties.status == "Moved"){
            kmldocs += '	<styleUrl>#Moved</styleUrl>\n';
          }
          kmldocs += '	<Polygon>\n';
          kmldocs += '		<extrude>1</extrude>\n';
          kmldocs += '		<altitudeMode>clampToGround</altitudeMode>\n';
          kmldocs += '		<outerBoundaryIs><LinearRing><coordinates>\n';
          for(var pt=0;pt<features[f].geometry.coordinates[0][0].length;pt++){
            kmldocs += features[f].geometry.coordinates[0][0][pt][0] + ',' + features[f].geometry.coordinates[0][0][pt][1] + ',0 ';
          }
          kmldocs += '		</coordinates></LinearRing></outerBoundaryIs>\n';
          kmldocs += '	</Polygon>\n';
          kmldocs += '</Placemark>\n';
        }
        for(var p=0;p<points.length;p++){
          if(points[p].name || points[p].description){
            kmldocs += '<Placemark>\n';
            if(points[p].name){
              kmldocs += '	<name>' + points[p].name + '</name>\n';
            }
            if(points[p].description){
              kmldocs += '	<description><![CDATA[<div>' + describe(points[p].description) + '</div>]]></description>\n';
            }
            //console.log(points[p].ll);
            kmldocs += '	<Point>\n		<coordinates>' + points[p].ll[0] + "," + points[p].ll[1] + ',0</coordinates>\n	</Point>\n';
            kmldocs += '</Placemark>\n';
          }
    	}
        res.send(kmlintro + kmlstyles + kmldocs + kmlend);
      });
    });
  });
  
  app.get('/event', function(req, res){
    res.render('mapsevent');
  });
  
  app.get('/copter', function(req, res){
    res.render('copter');
  });
  
  app.get('/census', function(req, res){
    res.render('census');
  });

  app.get('/censusceiling', function(req, res){
    res.render('censusgender');
  });
  
  app.get('/paper', function(req, res){
    res.render('mapshome');
  });
  
  app.get('/houses', function(req, res){
    res.render('houses');
  });
  
  app.get('/getparcelimg', function(req, res){
    /* var pid = req.query["P"];
    var requestOptions = {
      'uri': "http://www.co.bibb.ga.us/TaxAssessors/PropertyCard/PropertyCard.asp?P=" + pid
    };
    request(requestOptions, function (err, response, body) {
      if(body.indexOf("images.asp?Photo=") > -1){
        var imgurl = "http://www.co.bibb.ga.us/wingappictures/";
        body = body.split("images.asp?Photo=")[1];
        body = body.split('&')[0];
        imgurl += body + "/" + body + ".jpg";
        res.redirect(imgurl);
      }
    }); */
  });
  
  app.get('/searchdb', function(req, res){
    //houseobj = [{"address_id":85102959,"address_long":"2113 perdido street","case_district":null,"created_at":"2012-04-17T19:06:43Z","geopin":41030850,"house_num":"2113","id":89391,"official":true,"parcel_id":"104104907-0000","point":"POINT (-90.08607222086655 29.956817832319636)","status":"ACTIVE","street_full_name":null,"street_id":null,"street_name":"PERDIDO","street_type":"ST","updated_at":"2012-04-17T19:06:43Z","x":3675794.39123,"y":531938.286072,"most_recent_status_preview":{"type":"Hearing","date":"April  4, 2012"}},{"address_id":85102958,"address_long":"2117 perdido street","case_district":null,"created_at":"2012-04-17T19:06:43Z","geopin":41030851,"house_num":"2117","id":89390,"official":true,"parcel_id":"104104906-0000","point":"POINT (-90.08615780435524 29.956855768116412)","status":"ACTIVE","street_full_name":null,"street_id":null,"street_name":"PERDIDO","street_type":"ST","updated_at":"2012-04-17T19:06:43Z","x":3675767.14106,"y":531951.785976,"most_recent_status_preview":{"type":"Hearing","date":"March  7, 2012"}},{"address_id":85102956,"address_long":"2121 perdido street","case_district":null,"created_at":"2012-04-17T19:06:43Z","geopin":41030852,"house_num":"2121","id":89388,"official":true,"parcel_id":"104104905-0000","point":"POINT (-90.08624146971519 29.956889217404825)","status":"ACTIVE","street_full_name":null,"street_id":null,"street_name":"PERDIDO","street_type":"ST","updated_at":"2012-04-17T19:06:43Z","x":3675740.51603,"y":531963.661048,"most_recent_status_preview":{"type":"Inspection","date":"January 23, 2012"}},{"address_id":85105330,"address_long":"2125 perdido street","case_district":null,"created_at":"2012-04-17T19:06:51Z","geopin":41030853,"house_num":"2125","id":91331,"official":true,"parcel_id":"104104904-0000","point":"POINT (-90.08631996066069 29.956926054519645)","status":"ACTIVE","street_full_name":null,"street_id":null,"street_name":"PERDIDO","street_type":"ST","updated_at":"2012-04-17T19:06:51Z","x":3675715.5161,"y":531976.785912,"most_recent_status_preview":{"type":"Hearing","date":"March  7, 2012"}},{"address_id":85104701,"address_long":"3023 perdido street","case_district":null,"created_at":"2012-04-17T19:06:49Z","geopin":41036764,"house_num":"3023","id":90764,"official":true,"parcel_id":"104106508-0000","point":"POINT (-90.09672890100006 29.96178550298456)","status":"ACTIVE","street_full_name":null,"street_id":null,"street_name":"PERDIDO","street_type":"ST","updated_at":"2012-04-17T19:06:49Z","x":3672400.45459,"y":533708.145914,"most_recent_status_preview":{"type":"Inspection","date":"November  3, 2011"}}];
    // http://nickd.iriscouch.com:5984/housing/_design/streetname/_view/streetname?startkey="adamsave"&endkey="adamsave0"
    var street = req.query["streetname"];
    street = street.toLowerCase();
    if(street.indexOf("-") > -1){
      street = street.substring( street.indexOf("-") + 1 );
    }
    while(street.indexOf(" ") > -1){
      street = street.replace(" ","");
    }
    for(var c=0;c<street.length;c++){
      if(isNaN(1*street[c])){
        street = street.substring(c);
        break;
      }
    }

    var sendurl = 'http://nickd.iriscouch.com:5984/housing/_design/streetname/_view/streetname?startkey=' + encodeURIComponent( '"' + street + '"') + '&endkey=' + encodeURIComponent( '"' + street + '0"' );

    var requestOptions = {
      'uri': sendurl,
    };
    request(requestOptions, function (err, response, body) {
      res.send(body);
    });
  });
  
  app.get('/scf', function(req, res){
    res.render('scf');
  });
  
  app.get('/countymap', function(req, res){
    /* var x = req.query['x'] * 1.0;
    var y = req.query['y'] * 1.0;
    var z = req.query['z'] * 1.0;
    var maxExtent = {
      "left": -20037508.34,
      "right": 20037508.34,
      "top": 20037508.34,
      "bottom": -20037508.34
    }
    var wmsExtent = { };
    var b = 78271.516953125 / Math.pow( 2, (z - 1) );
    wmsExtent["left"] = b * 256 * x + maxExtent["left"]
    wmsExtent["right"] = b * 256 * (x+1) + maxExtent["left"]
    wmsExtent["top"] = b * -256 * y + maxExtent["top"]
    wmsExtent["bottom"] = b * -256 * (y+1) + maxExtent["top"]
    res.redirect("http://gis.co.bibb.ga.us/ArcGISBibb/rest/services/AG4LG/ParcelPublicAccess/MapServer/export?bbox=" + wmsExtent["left"] + "," + wmsExtent["bottom"] + "," + wmsExtent["right"] + "," + wmsExtent["top"] + "&bboxSR=102113&layers=&layerdefs=&size=256,256&imageSR=&format=png&transparent=false&dpi=&time=&layerTimeOptions=&f=image") */
  });
  
  app.get('/scfbyaddress', function(req, res){
    var address = req.query['address'];
    if(address.toLowerCase().indexOf("macon") == -1){
      address += ", Macon, GA";
    }
    var osmurl = 'http://geocoder.us/service/csv/geocode?address=' + escape(address);
    var requestOptions = {
      'uri': osmurl,
      'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)'
    };
    request(requestOptions, function (err, response, body) {
      var r = body.split(",");
      var lat = r[0];
      var lng = r[1];
      //res.redirect(osmurl);
      res.redirect('/scf?address=' + req.query['address'].split(',')[0] + '&latlng=' + lat + "," + lng);
    });
  });
  
  app.get('/mapbyaddress', function(req, res){
    var address = req.query['address'];
    if(address.toLowerCase().indexOf("macon") == -1){
      address += ", Macon, GA";
    }
    var osmurl = 'http://geocoder.us/service/csv/geocode?address=' + escape(address);
    var requestOptions = {
      'uri': osmurl,
      'User-Agent': 'Mozilla/4.0 (compatible; MSIE 7.0; Windows NT 6.0)'
    };
    request(requestOptions, function (err, response, body) {
      var r = body.split(",");
      var lat = r[0];
      var lng = r[1];
      //res.redirect(osmurl);
      res.redirect('/houses?address=' + req.query['address'].split(',')[0] + '&latlng=' + lat + "," + lng);
    });
  });

  app.get('/zoning', function(req, res){
    res.render('zoning');
  });
  
  app.post('/customgeo', function(req, res){
    var shape = new customgeo.CustomGeo({
      latlngs: req.body.pts.split("|")
    });
    shape.save(function (err){
      res.send({ id: shape._id });
    });
  });
  app.get('/timeline', function(req, res){
    // show timeline
    res.render('checkouttime');
  });
  app.post('/timeline', function(req, res){
    // load this point into MongoDB
    pt = new timepoint.TimePoint({
      start: req.body['start'],
      end: req.body['end'],
      // use [ lng , lat ] format to be consistent with GeoJSON
      ll: [ req.body['lng'] * 1.0, req.body['lat'] * 1.0 ]
    });
    pt.save(function(err){
      res.send(err || 'success');
    });
  });
  
  app.get('/timeline-maker', function(req, res){
    // show timeline editor (not yet designed)
    res.render('checkouttimemaker');
  });
  
  var processTimepoints = function(timepoints, req, res){
    if(req.url.indexOf('kml') > -1){
      // time-enabled KML output
      var kmlintro = '<?xml version="1.0" encoding="UTF-8"?>\n<kml xmlns="http://earth.google.com/kml/2.2">\n	<Document>\n		<name>Time-Enabled Code Enforcement KML</name>\n		<description>Rounded locations of code enforcement cases 1997-2012</description>\n		<Style id="dot-icon">\n			<scale>0.6</scale>\n			<IconStyle>\n        <Icon>\n          <href>http://homestatus.herokuapp.com/images/macon-marker-02.png</href>\n        </Icon>\n      </IconStyle>\n    </Style>\n    <Style>\n      <ListStyle>\n        <listItemType>checkHideChildren</listItemType>\n      </ListStyle>\n    </Style>\n';
      var kmlpts = '';
      for(var t=0; t<timepoints.length; t++){
        var latitude = timepoints[t].ll[1];
        var longitude = timepoints[t].ll[0];
        var convertToDate = function(timecode){
          timecode -= 2000;
          year = 1997 + Math.floor( timecode / 12 );
          timecode -= (year - 1997) * 12;
          month = 1 + timecode;
          if(month < 10){
            month = "0" + month;
          }
          return year + "-" + month;
        };
        var startstamp = convertToDate( timepoints[t].start );
        var endstamp = convertToDate( timepoints[t].end );
        kmlpts += '	<Placemark>\n		<TimeSpan>\n';
        kmlpts += '			<begin>' + startstamp + '</begin>\n';
        kmlpts += '			<end>' + endstamp + '</end>\n';
        kmlpts += '		</TimeSpan>\n		<styleUrl>#dot-icon</styleUrl>\n		<Point>\n';
        kmlpts += '			<coordinates>' + longitude + ',' + latitude + '</coordinates>\n';
        kmlpts += '		</Point>\n	</Placemark>\n';
      }
      var kmlout = '  </Document>\n</kml>';
      res.setHeader('Content-Type', 'application/kml');
      res.send(kmlintro + kmlpts + kmlout);
    }
    else{
      // GeoJSON output
      for(var t=0; t<timepoints.length; t++){
        timepoints[t] = {
          "geometry": {
            "coordinates": [ timepoints[t].ll[0], timepoints[t].ll[1] ]
          },
          "properties": {
            "startyr": timepoints[t].start,
            "endyr": timepoints[t].end
          }
        };
      }
      res.send({ "type":"FeatureCollection", "features": timepoints });
    }
  };
  
  app.get('/timeline-at*', function(req, res){
    if(req.query['customgeo'] && req.query['customgeo'] != ""){
      // do a query to return GeoJSON inside a custom polygon
      customgeo.CustomGeo.findById("", function(err, geo){
        if(err){
          res.send(err);
          return;
        }
        var poly = geo.split("|");
        for(var pt=0;pt<poly.length;pt++){
          poly[pt] = poly[pt].split(",");
        }
        timepoint.TimePoint.find({ ll: { "$within": { "$polygon": poly } } }).limit(5000).exec(function(err, timepoints){
          if(err){
            res.send(err);
            return;
          }
          processTimepoints(timepoints, req, res);
        });
      });
    }
    else{
      // do a query to return GeoJSON timeline near a point
      timepoint.TimePoint.find({ ll: { "$nearSphere": [  req.query["lng"] || -83.645782, req.query['lat'] || 32.837026 ], "$maxDistance": 0.01 } }).limit(5000).exec(function(err, timepoints){
        // convert all timepoints into GeoJSON format
        if(err){
          res.send(err);
          return;
        }
        processTimepoints(timepoints, req, res);
      });
    }
  });

  app.get('/auth', middleware.require_auth_browser, routes.index);
  app.post('/auth/add_comment',middleware.require_auth_browser, routes.add_comment);
  
  // redirect all non-existent URLs to doesnotexist
  app.get('*', function onNonexistentURL(req,res) {
    res.render('doesnotexist',404);
  });

  //mongoose_auth.helpExpress(app);

  return app;
};

// Don't run if require()'d
if (!module.parent) {
  var config = require('./config');
  var app = init(config);
  app.listen(process.env.PORT || 3000);
  console.info("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}