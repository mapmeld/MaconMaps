/*jshint laxcomma:true */

/**
 * Module dependencies.
 */
var auth = require('./auth')
    , express = require('express')
    , mongoose = require('mongoose')
    , mongoose_auth = require('mongoose-auth')
    , mongoStore = require('connect-mongo')(express)
    , routes = require('./routes')
    , middleware = require('./middleware')
    , CartoDB = require('./cartodb/lib/cartodb')
    , http = require('http')
    ;

var HOUR_IN_MILLISECONDS = 3600000;
var session_store;

var init = exports.init = function (config) {
  
  var db_uri = process.env.MONGOLAB_URI || process.env.MONGODB_URI || config.default_db_uri;

  mongoose.connect(db_uri);
  session_store = new mongoStore({url: db_uri});

  var app = express.createServer();

  app.configure(function(){
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.set('view options', { pretty: true });

    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    app.use(express.session({secret: 'top secret', store: session_store,
      cookie: {maxAge: HOUR_IN_MILLISECONDS}}));
    app.use(mongoose_auth.middleware());
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
    res.render('neighbordiff');
  });

  client = new CartoDB({ user: "mapmeld", api_key: "a7f9c9a3ca871072545cc433be20c76aee0f9994"});

  app.get('/changetable', function(req, res){
    client.on('data', function(data){
      try{
        res.send(data);
      }
      catch(e){ /* catch extra-header errors? */ }
    });
    client.query("update collegeplusintown SET status = '" + req.query['status'] + "' WHERE cartodb_id = " + req.query['id']);
  });
  
  app.get('/placesearch', function(req, res){
    var address = req.query['address'];
    if(req.query['address'].toLowerCase.indexOf("macon") == -1){
      address += ",Macon,GA";
    }
    http.get('http://geocoder.us/service/csv/geocode?address=' + encodeURIComponent(address), function(res){
      res.setHeader('Content-Type', 'application/json');
      res.send('"' + res.body + '"');
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

  app.get('/auth', middleware.require_auth_browser, routes.index);
  app.post('/auth/add_comment',middleware.require_auth_browser, routes.add_comment);
  
  // redirect all non-existent URLs to doesnotexist
  app.get('*', function onNonexistentURL(req,res) {
    res.render('doesnotexist',404);
  });

  mongoose_auth.helpExpress(app);

  return app;
};

// Don't run if require()'d
if (!module.parent) {
  var config = require('./config');
  var app = init(config);
  app.listen(process.env.PORT || 3000);
  console.info("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
}