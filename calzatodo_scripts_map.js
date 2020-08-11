// ---------------------------- //
var map = null;
var infoWindow = null;
var markers=[];

var max_width;
if ( window.matchMedia('(min-width: 769px)').matches ) {
  max_width = 550;
}else{
  max_width = 250;
}

window.onload = loadScript;
function loadScript() {
  var script = document.createElement('script');
  script.type = 'text/javascript';
  script.src = 'http://maps.googleapis.com/maps/api/js?key=AIzaSyDO0X7Ospvg_c77-xQ2gulFg3fgyMZQMMs&sensor=false' + '&callback=initialize';
  document.body.appendChild(script);                       
  //deleteGoogleMapMessage();
  getStores();


  // set Accordion
  jQuery(".CitySelector .customSelect .OptionsSelect").html("");
  jQuery.each( getAllData().colombia.cities, function( cityName, value ) {
      //console.log( value.stores );
      //console.log( value );
      jQuery(".CitySelector .customSelect .OptionsSelect").append('<li rel="'+cityName+'">'+cityName+'</li>');
      jQuery.each( value.stores, function( storeName, value ) {
        //console.log( storeName );
        console.log( value );
        if ( !jQuery(".accordionTiendas ."+value.class)[0] ) {
          jQuery(".accordionTiendas").append('<div class="itemAccordion '+value.class+'" rel="'+cityName+'" lat="'+value.lat+'" lng="'+value.lng+'"><div class="headle"><div class="rel"><div class="center">'+storeName+'</div></div></div><div class="body"><p><div>Tienda:</div>'+storeName+'</p><p><div>Horario:</div><div>'+value.schedules+'</div></p></div></div>');
        }
      });
  });


  jQuery(".accordionTiendas .itemAccordion").live('click', function(){
    console.log("Click en ciudad");
    var store_name = "San Pedro Sula";
    var lat = jQuery(this).attr("lat");
    var lng = jQuery(this).attr("lng");

    // gMap = new google.maps.Map(document.getElementById('map-canvas')); 
    map.setZoom(13);      // This will trigger a zoom_changed on the map
    map.setCenter(new google.maps.LatLng(Number(lat), Number(lng)));
    map.setMapTypeId(google.maps.MapTypeId.ROADMAP);
  });

};

function initialize() {
  
  map = initializeMap();
  deleteGoogleMapMessage();
  
  ciudad = getParametroUrl( "ciudad" );
  pais = getParametroUrl ( "pais" );

  markerFound = false;
  if( ciudad != "" && ( pais == null || pais == "") ){
    // Solo para Colombia se envia como parametro la ciudad
    markerFound = addMarkersOfCity( ciudad, "colombia", map);
  }
  else if( ciudad != null && ciudad != "" &&  pais != null && pais != "" ){
    // Solo para Colombia se envia como parametro la ciudad
    markerFound = addMarkersOfCity( ciudad, pais, map);
  }
  else if( pais != "" && ( ciudad == null || ciudad == "") ){
    // Se ubican las tiendas del pais
    markerFound = getMarkersByCountry(pais);
  }
  if( !markerFound ){
    // Por defecto se ubican las tiendas de colombia
    getMarkersByCountry("colombia");
  }
  
  google.maps.event.addListenerOnce(map, 'tilesloaded', function(){deleteGoogleMapMessage();});
  google.maps.event.addListenerOnce(map, 'idle', function(){
    deleteGoogleMapMessage();
  });
};

function deleteGoogleMapMessage(){  
  firstGmnoPrint = $(".gmnoprint").first();
  nextfirstGmnoPrint = firstGmnoPrint.next();
  nextfirstGmnoPrint.remove();
};
function getParametroUrl( paramName ){
  paramName = paramName.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+paramName+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var href = window.location.href;
  href = href.replace(/&amp;/g, '&');
  var results = regex.exec( href );
  if( results == null ){
    return "";
  }
  else{
    return decodeURIComponent(results[1]);
  }
};
var map;

function initializeMap(){
  var mapOptions = {
    center: new google.maps.LatLng(5.0138889,-72.7857438),
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP 
  };
    mapholder = document.getElementById('map-canvas')
    mapholder.style.height = '600px';
    map = new google.maps.Map(document.getElementById("map-canvas"),
    mapOptions);
  return map; 
};


function getStores(){
  data = getAllData();
  values = [];
  var UL = jQuery('<ul/>')
  var opt = jQuery('<option>').val('Pais').text('Pais');
  jQuery('#pais').append(opt);
  jQuery.each(data, function(countryName, countryVal) {
    
    var opt2 = jQuery('<option>').val(countryName).text(countryName);
    jQuery('#pais').append(opt2);
    jQuery.each(countryVal.cities, function(cityName, cityVal) {
      
      jQuery.each(cityVal.stores, function(storeName, storeVal) {
        storeObj = new Object();
        storeObj["id"] = storeName;
        storeObjValue = new Object();
        storeObjValue["type"] = "Store";
        storeObjValue["country"] = countryName;
        storeObjValue["city"] = cityName;
        storeObj["value"] = storeObjValue;
        storeObj["label"] = storeName;
        
        values.push(storeObj);
        var LI = $('<li/>').text(storeName).attr('id', storeName).attr('rel', cityName + ',' + countryName).addClass(cityName).addClass('ciudad');
        UL.append(LI);
      });
    });
  });
  jQuery(".stores_ul").append(UL);
  jQuery('select#pais').val('colombia').trigger('change');
  //console.log(values);
}

function getCities(pais){
  data = getAllData();
  values = [];
  var UL = $('<ul/>')
  jQuery.each(data, function(countryName, countryVal) {
    
    jQuery.each(countryVal.cities, function(cityName, cityVal) {
      
        if(countryName == pais){
          values.push(cityName);
        }
    });
    
  });
  jQuery('#ciudad').html('');
  var opt = jQuery('<option>').val('ciudad').text('Ciudad');
  jQuery('#ciudad').append(opt);
  jQuery.each(values, function( index, value ) {
    var opt2 = jQuery('<option>').val(value).text(value);
    jQuery('#ciudad').append(opt2);
  });
}

function setStoreMap(store, atrtibutes){
  data = atrtibutes.split(',');
  city = data[0];
  country = data[1];
  addMarkersOfStore(store, city, country, map);
}

function getMarkersByCountry(country){
  data = getAllData();
  objCountry = data[country];
  if(objCountry != null)
  {
    jQuery.each(objCountry.cities, function(cityName, city) {
      jQuery.each(city.stores, function(storeName, store) {
        latLng = new google.maps.LatLng( store.lat, store.lng), 
        title = storeName;
        var marker = addMarker(latLng, title, map);
        google.maps.event.addListener(marker, 'click', function() {     
          map.setCenter(latLng);
          if(infoWindow){
            infoWindow.close();
            infoWindow = null;
          }
          infoWindow = new google.maps.InfoWindow({
            content: getContentString(store, storeName, cityName, country), maxWidth: max_width
          });
          infoWindow.open(map,marker);
          setSelectedStore(store, storeName, cityName, country);
        });
      });
    });
    
    countryLatLng = new google.maps.LatLng( objCountry.lat, objCountry.lng);
    map.setCenter(countryLatLng);
    map.setZoom(5);
    return true;
  }
  else{
    return false;
  }
};

function addMarkersOfCity(cityName, country, map){
  clearSelectedStore();
  data  = getAllData();
  city = data[country].cities[cityName];
  if( city != null ){
    // Se recorren todas las tiendas de la ciudad
    jQuery.each(city.stores, function(storeName, store) {
      latLng = new google.maps.LatLng( store.lat, store.lng), 
      title = storeName;
      var marker = addMarker(latLng,title, map);
      google.maps.event.addListener(marker, 'click', function() {
        map.setCenter(latLng);
        if(infoWindow){
          infoWindow.close();
          infoWindow = null;
        }
        infoWindow = new google.maps.InfoWindow({
          content: getContentString(store, storeName, cityName, country), maxWidth: max_width
        });
        infoWindow.open(map,marker);
        setSelectedStore(store, storeName, cityName, country);
      });
    });
    
    // Se fija el centro en la ciudad y se hace un zoom menos profundo
    //cityLatLng = getCityLocation( cityName, country, cityLocationCallBack );
    cityLatLng = new google.maps.LatLng( city.lat, city.lng);
    map.setCenter(cityLatLng);
    map.setZoom(15);
    
    return true;
  }
  else {
    return false;
  }
};

function cityLocationCallBack(location){
  return location;
};

function addMarkersOfStore(store, city, country, map){
  data  = getAllData();
  stores = data[country].cities[city].stores;
  storeObj = stores[store];
  latLng = new google.maps.LatLng( storeObj.lat, storeObj.lng), 
  title = store;
  marker = addMarker(latLng,title, map);
  map.setCenter(latLng);
  map.setZoom(16);
  setSelectedStore(storeObj, title, city, country);
  google.maps.event.addListener(marker, 'click', function() {
    map.setCenter(latLng);
    if(infoWindow){
      infoWindow.close();
      infoWindow = null;
    }
    infoWindow = new google.maps.InfoWindow({
      content: getContentString(storeObj, title, city, country), maxWidth: max_width
    });
    infoWindow.open(map,marker);
    setSelectedStore(storeObj, title, city, country);
  });
};

function getContentString(store, storeName, city, country){
  var contentString = '<div id="content" class="modalStores">'+
            '<div id="siteNotice">'+
            '</div>'+
            '<h2 id="firstHeading" class="firstHeading">'+ storeName +'</h2>'+
            '<div id="bodyContent">'+
            '<p class="ciudad-icono"><strong>Ciudad: </strong> ' + city + '</p>' +       
            (store.address != null && $.trim(store.address) != "" 
              ? '<p><strong>Dirección: </strong> ' + store.address + '</p>' 
              : '') +
            (store.schedules != null && $.trim(store.schedules) != ""
              ? '<p><strong>Horarios: </strong> ' + store.schedules + '</p>'
              : '') +
            '</div>'+
            '</div>';
   return contentString;
};

function clearSelectedStore(){
  jQuery("#storeContent").empty();
};
function setSelectedStore(store, storeName, city, country){ 
  contentString = getContentString(store, storeName, city, country);  
  jQuery("#storeContent").empty();
  jQuery("#storeContent").append(contentString);
};

function markerImage(){
  return "https://calzatodocol.vteximg.com.br/arquivos/locator.png";
};

// Add a marker to the map and push to the array.
function addMarker(latLng, title, map) {
  var marker = new google.maps.Marker({
    position: latLng,
    map: map,
  title: title,
  icon : markerImage()
  });
  markers.push(marker);
  return marker;
}

// Sets the map on all markers in the array.
function setAllMap(map) {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(map);
  }
}

// Shows any markers currently in the array.
function showMarkers() {
  setAllMap(map);
}

function getAllData(){
  var data = {
    "colombia":{
      "lat": 5.0138889,
      "lng": -72.7857438,
      "cities":{
        "APARTADO":{
          "lat": 7.8828032,
          "lng": -76.6422022,
          "stores":{
            "Centro Comercial Nuestro Uraba":{
              "lat": 7.8725934,
              "lng": -76.6365156,
              "address":" Local 137-139",
              "schedules":"Lunes - Sábado de 11:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m. <br/><br/> Como llegar: se da una vuelta",
              "class": "tienda_1"
            },
          }
        },
        "ARMENIA":{
          "lat": 4.5280646,
          "lng": -75.7161019,
          "stores":{
            "Centro Comercial Portal del Quindío":{
              "lat": 4.558569,
              "lng": -75.6578874,
              "address":" Local 44",
              "schedules":"Lunes - Sábado de 11:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_2"
            },
            "Centro Comercial Unicentro Armenia":{
              "lat": 4.5404857,
              "lng": -75.6679693,
              "address":"Local 260-261",
              "schedules":"Lunes - Sábado de 11:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_3"
            },
          }
        },
        "BARRANCABERMEJA":{
          "lat": 7.0598098,
          "lng": -73.8865148,
          "stores":{
            "Centro Comercial San silvestre":{
              "lat": 7.0673304,
              "lng": -73.8603122,
              "address":" Local 115",
              "schedules":"Lunes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 10:00 a.m. a 08:00 p.m.",
              "class": "tienda_4"
            },
          }
        },
        "BARRANQUILLA":{
          "lat": 10.9839725,
          "lng": -74.8880588,
          "stores":{
            "BARRANQUILLA SAO 53":{
              "lat": 10.9969495,
              "lng": -74.8064061,
              "address":"Calle 53 # 46 - 38",
              "schedules":"Lunes - Sábado de 08:00 a.m. a 09:30 p.m. / Domingo - Festivos de 08:00 a.m. a 09:00 p.m.",
              "class": "tienda_5"
            },
            "Carrera 41 # 34 - 01":{
              "lat": 10.9800119,
              "lng": -74.7806319,
              "address":"Carrera 41 # 34 - 01",
              "schedules":"Lunes - Sábado de 08:30 a.m. a 07:00 p.m. / Domingo - Festivos de 09:30 a.m. a 01:30 p.m.",
              "class": "tienda_6"
            },
            "Carrera 43 # 34 - 01":{
              "lat": 10.9812298,
              "lng": -74.7804215,
              "address":"Carrera 43 # 34 - 01",
              "schedules":"Lunes - Sábado de 08:30 a.m. a 07:00 p.m. / Domingo - Festivos de 09:30 a.m. a 01:30 p.m.",
              "class": "tienda_7"
            },
            "Carrera 43 # 34 - 63":{
              "lat": 10.9812714,
              "lng": -74.7809693,
              "address":"Carrera 43 # 34 - 63",
              "schedules":"Lunes - Sábado de 08:30 a.m. a 07:00 p.m. / Domingo - Festivos de 09:30 a.m. a 01:30 p.m.",
              "class": "tienda_8"
            },
            "Centro Comercial Metropolitano":{
              "lat": 10.923838,
              "lng": -74.7981321,
              "address":"Local 201",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 09:00 p.m. / Domingo - Festivos de 10:00 a.m. a 09:00 p.m.",
              "class": "tienda_9"
            },
            "Centro Comercial Panorama":{
              "lat": 10.9453815,
              "lng": -74.7873854,
              "address":"Local 5965",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 09:00 p.m. / Domingo - Festivos de 10:00 a.m. a 09:00 p.m.",
              "class": "tienda_10"
            },
            "Centro Comercial Plaza del sol":{
              "lat": 10.9268217,
              "lng": -74.7825553,
              "address":"Local 139-140",
              "schedules":"Lunes - Miércoles de 10:00 a.m. a 08:00 p.m. / Jueves - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 10:00 a.m. a 08:30 p.m.",
              "class": "tienda_11"
            },
            "Centro Comercial Portal del Prado":{
              "lat": 10.9897092,
              "lng": -74.7907434,
              "address":"Local 154",
              "schedules":"Lunes - Jueves de 10:00 a.m. a 08:00 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_12"
            },
            "Centro Comercial Unico":{
              "lat": 10.9888343,
              "lng": -74.8145809,
              "address":"Local 27-28",
              "schedules":"Lunes - Jueves de 09:30 a.m. a 08:00 p.m. / Viernes - Sábado de 09:30 a.m. a 09:00 p.m. / Domingo - Festivos de 10:00 a.m. a 08:00 p.m.",
              "class": "tienda_13"
            },
            "Centro Comercial Villa Country":{
              "lat": 11.0043616,
              "lng": -74.8087842,
              "address":"Local 208 Piso 2",
              "schedules":"Lunes - Jueves de 10:00 a.m. a 08:00 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 07:00 p.m.",
              "class": "tienda_14"
            },
            "Centro Comercial Viva":{
              "lat": 11.0092313,
              "lng": -74.8224465,
              "address":"Local 330",
              "schedules":"Lunes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_15"
            },
            "Exito Panorama":{
              "lat": 10.9453815,
              "lng": -74.7873854,
              "address":"Local 59/ Calle 30 # 8 - Esquina",
              "schedules":"Lunes - Festivos de 08:00 a.m. a 09:00 p.m.",
              "class": "tienda_16"
            },
            "Sao Hipódromo":{
              "lat": 10.9438921,
              "lng": -74.7983553,
              "address":"Sección De Calzado/ Calle 30 # 29 - 101",
              "schedules":"Lunes - Festivos de 08:00 a.m. a 09:00 p.m.",
              "class": "tienda_17"
            },
            "Sao Macarena":{
              "lat": 10.9537386,
              "lng": -74.8101689,
              "address":"Seccion Calzado/ Calle 47 # 9D",
              "schedules":"Lunes - Festivos de 08:00 a.m. a 09:00 p.m.",
              "class": "tienda_18"
            },
            "Sao Tercer Nivel":{
              "lat": 11.0051591,
              "lng": -74.8288572,
              "address":"Seccion De Calzado/ Calle 93 # 46 - 99",
              "schedules":"Lunes - Festivos de 08:00 a.m. a 09:00 p.m.",
              "class": "tienda_19"
            },

          }
        },
        "BELLO":{
          "lat": 6.3319642,
          "lng": -75.5879613,
          "stores":{
            "BELLO TANIA":{
              "lat": 6.333976,
              "lng": -73.8603122,
              "address":" Local 115",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 07:30 p.m. / Domingo - Festivos de 09:00 a.m. a 03:00 p.m.",
              "class": "tienda_20"
            },
            "C.C. Puerta del Norte Local 189":{
              "lat": 6.339408,
              "lng": -75.5452478,
              "address":" Local 189",
              "schedules":"Lunes - Jueves de 11:00 a.m. a 08:00 p.m. / Viernes - Sábado de 11:00 a.m. a 09:00 p.m. / Domingo - Festivos de 12:00 p.m. a 08:00 p.m.",
              "class": "tienda_21"
            },
            "C.C. Puerta del Norte Local 93":{
              "lat": 6.339408,
              "lng": -75.5452478,
              "address":"Local 93",
              "schedules":"Lunes - Jueves de 11:00 a.m. a 08:00 p.m. / Viernes - Sábado de 11:00 a.m. a 09:00 p.m. / Domingo - Festivos de 12:00 p.m. a 08:00 p.m.",
              "class": "tienda_22"
            },
          }
        },
        "BOGOTA":{
          "lat": 4.6486259,
          "lng": -74.2478966,
          "stores":{
            "Barrio Toberín":{
              "lat": 4.7445093,
              "lng": -74.0456737,
              "address":"Calle 164 # 19B - 26",
              "schedules":"Lunes - Sábado de 10:00 a.m. a 07:00 p.m. / Domingo - Festivos de 9:30 a.m. a 06:30 p.m.",
              "class": "tienda_23"
            },
            "Éxito Occidente":{
              "lat": 4.7209783,
              "lng": -74.1247957,
              "address":"Éxito Local 2091",
              "schedules":"Lunes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 10:00 a.m. a 08:00 p.m.",
              "class": "tienda_24"
            },
            "Centro Comercial Av Chile":{
              "lat": 4.6572401,
              "lng": -74.0598337,
              "address":"Local 104",
              "schedules":"Lunes - Jueves de 10:00 a.m. a 08:00 p.m. / Viernes y Sábado de 10:00 a.m. a 08:30 p.m. / Domingo - Festivos de 11:00 a.m. a 06:00 p.m.",
              "class": "tienda_25"
            },
            "Centro Comercial Boulevar":{
              "lat": 4.7124216,
              "lng": -74.0737661,
              "address":"Local 215",
              "schedules":"Lunes - Jueves de 10:30 a.m. a 08:30 p.m. /  Viernes ySábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_26"
            },
            "Centro Comercial Cafam Floresta":{
              "lat": 4.6865205,
              "lng": -74.076267,
              "address":"Local 2062D",
              "schedules":"Lunes - Miércoles de 10:00 a.m. a 08:00 p.m. / Jueves - Sábado de 10:00 a.m. a 08:30 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_27"
            },
            "Centro Comercial Calima":{
              "lat": 4.6181201,
              "lng": -74.0879671,
              "address":"Local A62",
              "schedules":"Lunes - Jueves de 10:00 a.m. a 08:00 p.m. / Viernes  y sabado de 10:00 a.m. a 09:00 p.m. / Domingos y festivos 11:00 a.m a 8:00 p.m.",
              "class": "tienda_28"
            },
            "Centro Comercial Centro Mayor":{
              "lat": 4.5921339,
              "lng": -74.1260522,
              "address":"Local 2068",
              "schedules":"Lunes - Jueves de 10:30 a.m. a 08:30 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_29"
            },
            "Centro Comercial Centro Suba":{
              "lat": 4.7374672,
              "lng": -74.0881638,
              "address":"Local 5-107",
              "schedules":"Lunes - Jueves de 10:30 a.m. a 08:30 p.m. /  Viernes ySábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_30"
            },
            "Centro Comercial Diverplaza":{
              "lat": 4.7005834,
              "lng": -74.1172557,
              "address":"Local 258",
              "schedules":"Lunes - Jueves de 10:30 a.m. a 08:30 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_31"
            },
            "Centro Comercial Gran Estación":{
              "lat": 4.6469863,
              "lng": -74.1046819,
              "address":"Local 1-14",
              "schedules":"Lunes - Jueves de 10:30 a.m. a 08:30 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_32"
            },
            "Centro Comercial Hayuelos":{
              "lat": 4.6638545,
              "lng": -74.1329011,
              "address":"Local 174",
              "schedules":"Lunes - Jueves de 10:30 a.m. a 08:30 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_33"
            },
            "Centro Comercial Imperial Plaza":{
              "lat": 4.7501159,
              "lng": -74.0976414,
              "address":"Local 123",
              "schedules":"Lunes - Jueves de 10:30 a.m. a 08:30 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_34"
            },
            "Centro Comercial Metrópolis":{
              "lat": 4.6802736,
              "lng": -74.0841621,
              "address":"Local 173",
              "schedules":"Lunes - Jueves de 10:00 a.m. a 08:00 p.m. / Viernes y Sabado de 10:00 a.m. a 08:30 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_35"
            },
            "Centro Comercial Multiplaza la Felicidad":{
              "lat": 4.6519408,
              "lng": -74.1278939,
              "address":"Local B-159",
              "schedules":"Lunes - Jueves de 10:30 a.m. a 08:30 p.m. /  Viernes ySábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_36"
            },
            "Centro Comercial Palatino":{
              "lat": 4.7156071,
              "lng": -74.0314751,
              "address":"Local 206",
              "schedules":"Lunes - Jueves de 10:00 a.m. a 08:00 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 10:30 a.m. a 07:30 p.m.",
              "class": "tienda_37"
            },
            "Centro Comercial Plaza de las Américas":{
              "lat": 4.6189377,
              "lng": -74.1365344,
              "address":"Local 1130",
              "schedules":"Lunes - Jueves de 10:30 a.m. a 08:30 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_38"
            },
            "Centro Comercial Plaza de las Américas":{
              "lat": 4.6189377,
              "lng": -74.1365344,
              "address":"Local 1508",
              "schedules":"Lunes - Jueves de 10:30 a.m. a 08:30 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_39"
            },
            "Centro Comercial Plaza de las Américas":{
              "lat": 4.6185338,
              "lng": -74.1363789,
              "address":"Sao Sección Calzado",
              "schedules":"Lunes - Festivos de 08:00 a.m. a 09:00 p.m.",
              "class": "tienda_40"
            },
            "Centro Comercial Portal de la 80":{
              "lat": 4.7140817,
              "lng": -74.119016,
              "address":"Sao Local 257",
              "schedules":"Lunes - Festivos de 08:00 a.m. a 09:00 p.m.",
              "class": "tienda_41"
            },
            "Centro Comercial Santafé":{
              "lat": 4.7624969,
              "lng": -74.047924,
              "address":"Local 186 Plaza Brasil",
              "schedules":"Lunes - Jueves de 10:00 a.m. a 08:30 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_42"
            },
          }
        },
        "BUCARAMANGA":{
          "lat": 7.1192899,
          "lng": -73.1679978,
          "stores":{
            "Calle 36 # 16 - 04":{
              "lat": 7.1180708,
              "lng": -73.1277227,
              "address":"Calle 36 # 16 - 04",
              "schedules":"Lunes - Jueves de 08:30 a.m. a 07:30 p.m. / Viernes - Sábado de 08:30 a.m. a 08:00 p.m. / Domingo - Festivos de 09:00 a.m. a 02:00 p.m.",
              "class": "tienda_43"
            },
            "Centro Comercial Cabecera Primera Etapa":{
              "lat": 7.1151432,
              "lng": -73.1117105,
              "address":"Local 11",
              "schedules":"Lunes - Jueves de 09:00 a.m. a 08:00 p.m. / Viernes - Sábado de 09:00 a.m. a 08:30 p.m. / Domingo - Festivos de 09:00 a.m. a 02:00 p.m.",
              "class": "tienda_44"
            },
            "Centro Comercial Cacique":{
              "lat": 7.0985833,
              "lng": -73.109171,
              "address":"Local 187",
              "schedules":"Lunes - Jueves de 09:30 a.m. a 08:30 p.m. / Viernes - Sábado de 09:30 a.m. a 09:00 p.m. / Domingo - Festivos de 10:00 a.m. a 08:00 p.m.",
              "class": "tienda_45"
            },
            "Centro Comercial Cañaveral":{
              "lat": 7.0707587,
              "lng": -73.1067912,
              "address":"Local 125",
              "schedules":"Lunes - Jueves de 09:30 a.m. a 08:00 p.m. / Viernes - Sábado de 09:30 a.m. a 09:00 p.m. / Domingo - Festivos de 10:00 a.m. a 08:00 p.m.",
              "class": "tienda_46"
            },
            "Centro Comercial La Florida":{
              "lat": 7.0694313,
              "lng": -73.107156,
              "address":"Local 216-217",
              "schedules":"Lunes - Festivos de 10:00 a.m. a 08:00 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m.",
              "class": "tienda_47"
            },
            "Centro Comercial Megamall":{
              "lat": 7.1299814,
              "lng": -73.1146847,
              "address":"Local 42",
              "schedules":"Lunes - Jueves de 09:30 a.m. a 08:30 p.m. / Viernes - Sábado de 09:30 a.m. a 09:00 p.m. / Domingo - Festivos de 10:00 a.m. a 08:00 p.m.",
              "class": "tienda_48"
            },
          }
        },
        "BUENAVENTURA":{
          "lat": 3.8757474,
          "lng": -77.0582218,
          "stores":{
            "Centro Comercial Viva Buenaventura":{
              "lat": 3.8680381,
              "lng": -76.9995377,
              "address":"Local 101",
              "schedules":"Lunes - Sábado de 09:30 a.m. a 08:00 p.m. / Domingo - Festivos de 10:00 a.m. a 08:00 p.m.",
              "class": "tienda_49"
            },
            "Edificio Alomia":{
              "lat": 3.8889517,
              "lng": -77.0784977,
              "address":"Calle 3 # 3 - 87",
              "schedules":"Lunes - Sábado de 09:00a.m. a 07:30 p.m. / Domingo - Festivos de 09:00 a.m. a 01:00 p.m.",
              "class": "tienda_50"
            },
            "Edificio Santa Elena":{
              "lat": 3.8889653,
              "lng": -77.0798047,
              "address":"Local 104/ Calle 2 # 3 - 20",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 07:30 p.m. / Domingo - Festivos de 09:00 a.m. a 01:00 p.m.",
              "class": "tienda_51"
            },
            "La 14 Sexto Nivel":{
              "lat": 3.8834231,
              "lng": -77.0294876,
              "address":"Seccion Calzado Local 1/ Avenida Simon Bolivar Calle 6 # 41 - 01",
              "schedules":"Lunes - Sábado de 08:00 a.m. a 09:00 p.m. / Domingo - Festivos de 09:00 a.m. a 07:00 p.m.",
              "class": "tienda_52"
            },
          }
        },
        "BUGA":{
          "lat": 3.8991844,
          "lng": -76.3345817,
          "stores":{
            "Calle 8 # 13 - 24":{
              "lat": 3.9008855,
              "lng": -76.3027432,
              "address":"Calle 8 # 13 - 24",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 07:00 p.m. / Domingo - Festivos de 09:00 a.m. a 01:00 p.m.",
              "class": "tienda_53"
            },
            "Carrera 13 # 7 - 79":{
              "lat": 3.9000816,
              "lng": -76.3027427,
              "address":"Carrera 13 # 7 - 79",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 07:00 p.m. / Domingo - Festivos de 09:00 a.m. a 01:00 p.m.",
              "class": "tienda_54"
            },
          }
        },

        "CALI":{
          "lat": 3.395397,
          "lng": -76.6657535,
          "stores":{
            "Calle 12 # 8 - 13": {
              "lat": 3.4489419,
              "lng": -76.5332886,
              "address": "Calle 12 # 8 - 13",
              "schedules": "Lunes - Sábado de 08:30 a.m. a 07:30 p.m. / Domingo - Festivos de 09:30 a.m. a 01:30 p.m.",
              "class": "tienda_55"
            },
            "Calle 13 # 7 - 74": {
              "lat": 3.4497411,
              "lng": -76.5329194,
              "address": "Calle 13 # 7 - 74",
              "schedules": "Lunes - Sábado de 08:30 a.m. a 07:00 p.m. / Domingo - Festivos de 09:00 a.m. a 02:00 p.m.",
              "class": "tienda_56"
            },  
            "Calle 14 # 7 - 39": {
              "lat": 3.4504673,
              "lng": -76.5314671,
              "address": "Calle 14 # 7 - 39",
              "schedules": "Lunes - Sábado de 08:30 a.m. a 07:00 p.m. / Domingo - Festivos de 09:00 a.m. a 02:00 p.m.",
              "class": "tienda_57"
            },
            "Calle 15 # 7 - 100": {
              "lat": 3.4503525,
              "lng": -76.5306467,
              "address": "Calle 15 # 7 - 100",
              "schedules": "Lunes - Sábado de 08:30 a.m. a 07:00 p.m. / Domingo - Festivos de 09:00 a.m. a 01:30 p.m. los domingos se abren en temporadas",
              "class": "tienda_58"
            },
            "Carrera 7 # 23 - 77": {
              "lat": 3.4542391,
              "lng": -76.5229436,
              "address": "Carrera 7 # 23 - 77",
              "schedules": "Lunes - Sábado de 08:00 a.m. a 06:30 p.m. / Domingo - Festivos de 09:00 a.m. a 01:00 p.m. solo en temporada",
              "class": "tienda_59"
            },
            "Carrera 7 # 23 - 99": {
              "lat": 3.4542723,
              "lng": -76.5227605,
              "address": "Carrera 7 # 23 - 99",
              "schedules": "Lunes - Sábado de 08:00 a.m. a 06:30 p.m. / Domingo - Festivos de 09:00 a.m. a 01:00 p.m. los domingos y festivos es hasta la 1:00 pm",
              "class": "tienda_60"
            },
            "Centro Comercial Chipichape": {
              "lat": 3.4759803,
              "lng": -76.5300196,
              "address": "Local 216 - 217",
              "schedules": "Lunes - Jueves de 10:00 a.m. a 08:00 p.m. / Viernes de 10:00 a.m. a 08:30 p.m. / Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_61"
            },
            "Centro Comercial Cosmocentro Local 125": {
              "lat": 3.4516521,
              "lng": -76.5341741,
              "address": "Local 125",
              "schedules": "Lunes - Jueves de 09:30 a.m. a 08:00 p.m. / Viernes - Sábado de 09:30 a.m. a 08:30 p.m. / Domingo - Festivos de 10:30 a.m. a 07:30 p.m.",
              "class": "tienda_62"
            },
            "Centro Comercial Cosmocentro Local 129": {
              "lat": 3.4516521,
              "lng": -76.5341741,
              "address": "Local 129",
              "schedules": "Lunes - Jueves de 09:30 a.m. a 08:00 p.m. / Viernes - Sábado de 09:30 a.m. a 08:30 p.m. / Domingo - Festivos de 10:30 a.m. a 07:30 p.m.",
              "class": "tienda_63"
            },
            "Centro Comercial Cosmocentro Local 18": {
              "lat": 3.4516521,
              "lng": -76.5341741,
              "address": "Local 18 Segundo Piso",
              "schedules": "Lunes - Jueves de 10:00 a.m. a 08:00 p.m. / Viernes - Sábado de 10:00 a.m. a 08:30 p.m. / Domingo - Festivos de 10:30 a.m. a 07:30 p.m.",
              "class": "tienda_64"
            },
            "Centro Comercial Cosmocentro Sótano la 14": {
              "lat": 3.4516521,
              "lng": -76.5341741,
              "address": "Sótano la 14",
              "schedules": "Lunes - Festivos de 09:00 a.m. a 09:00 p.m.",
              "class": "tienda_65"
            },
            "Centro Comercial Jardín Plaza": {
              "lat": 3.3691941,
              "lng": -76.5301496,
              "address": "Bloque 10 Local 104",
              "schedules": "Lunes - Viernes de 10:00 a.m. a 08:00 p.m. / Sábado de 10:00 a.m. a 08:30 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_66"
            },
            "Centro Comercial la 14 Calima 2do nivel": {
              "lat": 3.4853958,
              "lng": -76.5003207,
              "address": "2do nivel",
              "schedules": "Lunes - Festivos de 09:00 a.m. a 09:00 p.m.",
              "class": "tienda_67"
            },
            "Centro Comercial la 14 Calima Local 122": {
              "lat": 3.4853958,
              "lng": -76.5003207,
              "address": "Local 122",
              "schedules": "Lunes - Sábado de 09:30 a.m. a 08:30 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m. los sabados es hasta las 9pm",
              "class": "tienda_68"
            },
            "Centro Comercial La 14 Pasoancho": {
              "lat": 3.3851995,
              "lng": -76.5422962,
              "address": "Centro Comercial La 14 Pasoancho",
              "schedules": "Lunes - Festivos de 09:00 a.m. a 09:00 p.m.",
              "class": "tienda_69"
            },
            "Centro Comercial Palmetto": {
              "lat": 3.412957,
              "lng": -76.5431223,
              "address": "Local 127 - 128",
              "schedules": "Lunes - Sábado de 10:00 a.m. a 08:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_70"
            },
            "Centro Comercial Pasarela": {
              "lat": 3.4661944,
              "lng": -76.5296697,
              "address": "Local 101",
              "schedules": "Lunes - Sábado de 09:00 a.m. a 07:00 p.m.",
              "class": "tienda_71"
            },
            "Centro Comercial Unicentro Local 175": {
              "lat": 3.4663685,
              "lng": -76.5975223,
              "address": "Local 175",
              "schedules": "Lunes - Viernes de 09:30 a.m. a 08:30 p.m. / Sábado de 09:30 a.m. a 09:00 p.m. / Domingo - Festivos de 10:00 a.m. a 08:00 p.m.",
              "class": "tienda_72"
            },
            "Centro Comercial Unicentro Local 241": {
              "lat": 3.4663685,
              "lng": -76.5975223,
              "address": "Local 241",
              "schedules": "Lunes - Viernes de 09:30 a.m. a 08:30 p.m. / Sábado de 09:30 a.m. a 09:00 p.m. / Domingo - Festivos de 10:00 a.m. a 08:00 p.m.",
              "class": "tienda_73"
            },
            "Centro Comercial Unicentro Local 19": {
              "lat": 3.4663685,
              "lng": -76.5975223,
              "address": "Local 1516",
              "schedules": "Lunes - Festivos de 10:00 a.m. a 08:00 p.m. / Viernes de 10:00 a.m. a 08:30 p.m. / Sábado de 10:00 a.m. a 09:00 p.m.",
              "class": "tienda_74"
            },
            "Centro Comercial Unicentro Local 19": {
              "lat": 3.4663685,
              "lng": -76.5975223,
              "address": "Local 1516",
              "schedules": "Lunes - Festivos de 10:00 a.m. a 08:00 p.m. / Viernes de 10:00 a.m. a 08:30 p.m. / Sábado de 10:00 a.m. a 09:00 p.m.",
              "class": "tienda_75"
            },
            "Centro Comercial Unicentro Local 242": {
              "lat": 3.4663685,
              "lng": -76.5975223,
              "address": "Local 242",
              "schedules": "Lunes - Festivos de 10:00 a.m. a 08:00 p.m. / Viernes de 10:00 a.m. a 08:30 p.m. / Sábado de 10:00 a.m. a 09:00 p.m.",
              "class": "tienda_76"
            },
            "Centro Comercial Valle Lili": {
              "lat": 3.3727669,
              "lng": -76.5319849,
              "address": "Centro Comercial Valle Lili Local 14",
              "schedules": "Lunes - Jueves de 10:00 a.m. a 08:00 p.m. / Viernes - Sábado de 10:00 a.m. a 08:30 p.m. / Domingo - Festivos de 11:00 a.m. a 07:00 p.m.",
              "class": "tienda_77"
            },
            "Exito Simon Bolivar": {
              "lat": 3.4278576,
              "lng": -76.5024411,
              "address": "Local 123/ Calle 54 # 28D - 137",
              "schedules": "Lunes - Festivos de 10:00 a.m. a 08:00 p.m.",
              "class": "tienda_78"
            },
            "La 14 Sexto Nivel": {
              "lat": 3.4533374,
              "lng": -76.5325167,
              "address": "Carrera 4 # 14 - 46",
              "schedules": "Lunes - Sábado de 08:00 a.m. a 08:00 p.m. / Domingo - Festivos de 09:00 a.m. a 02:00 p.m.",
              "class": "tienda_79"
            },
            "Pasaje Monserrate": {
              "lat": 3.4510332,
              "lng": -76.5332695,
              "address": "Local 21 - 22/ Calle 14 # 7 - 75",
              "schedules": "Lunes - Sábado de 08:00 a.m. a 08:00 p.m. / Domingo - Festivos de 09:00 a.m. a 02:00 p.m.",
              "class": "tienda_80"
            },
          }
        },
        "CARTAGENA":{
          "lat": 10.40036,
          "lng": -75.5785667,
          "stores":{
            "Calle 1ra De Badillo # 35 - 47 ":{
              "lat": 10.4242628,
              "lng": -75.55318332,
              "address":"Calle 1ra De Badillo # 35 - 47",
              "schedules":"Lunes - Sábado de 08:30 a.m. a 07:30 p.m. / Domingo - Festivos de 10:00 a.m. a 02:00 p.m.",
              "class": "tienda_81"
            },
            "Centro Comercial Bocagrande":{
              "lat": 10.4069934,
              "lng": -75.5631251,
              "address":"Local 124",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 08:00 p.m. / Domingo - Festivos de 10:00 a.m. a 06:00 p.m.",
              "class": "tienda_82"
            },
            "Centro Comercial Caribe Plaza":{
              "lat": 10.3921284,
              "lng": -75.5179421,
              "address":"Local 165-166",
              "schedules":"Lunes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 10:00 a.m. a 08:00 p.m.",
              "class": "tienda_83"
            },
            "Centro Comercial la Plazuela":{
              "lat": 10.3920406,
              "lng": -75.485111,
              "address":"Local 140-141-142",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 08:30 p.m. / Domingo - Festivos de 10:00 a.m. a 07:00 p.m.",
              "class": "tienda_84"
            },
            "Centro Comercial Paseo la Castellana":{
              "lat": 10.3935091,
              "lng": -75.4894783,
              "address":"Local 1213",
              "schedules":"Lunes - Sábado de 09:30 a.m. a 09:00 p.m. / Domingo - Festivos de 10:00 a.m. a 07:00 p.m.",
              "class": "tienda_85"
            },
            "Exito Matuna":{
              "lat": 10.4248024,
              "lng": -75.5494115,
              "address":"Avenida Venezuela Calle 35 # 9 - 41",
              "schedules":"Lunes - Sábado de 08:00 a.m. a 09:00 p.m. / Domingo - Festivos de 08:00 a.m. a 08:00 p.m.",
              "class": "tienda_86"
            },
            "Exito Seccion Calzado":{
              "lat": 10.4025876,
              "lng": -75.4980705,
              "address":"Avenida Pedro Heredia # 79 - 75",
              "schedules":"Lunes - Festivos de 08:00 a.m. a 09:00 p.m.",
              "class": "tienda_87"
            },
          }
        },
        "CARTAGO":{
          "lat": 4.7461031,
          "lng": -75.9629653,
          "stores":{
            "Centro Comercial Nuestro Cartago":{
              "lat": 4.7572214,
              "lng": -75.9355824,
              "address":"Local 0157",
              "schedules":"    Lunes - Jueves de 10:00 a.m. a 08:00 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo de 11:00 a.m. a 08:00 p.m. / Festivos de 10:00 a.m. a 8:00 p.m.",
              "class": "tienda_88"
            },
          }
        },
        "CHIA":{
          "lat": 4.8648005,
          "lng": -74.0684276,
          "stores":{
            "Centro Comercial Chia":{
              "lat": 4.8648856,
              "lng": -74.0684276,
              "address":"Local 112-114",
              "schedules":"    Lunes - Jueves de 10:00 a.m. a 08:00 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo de 11:00 a.m. a 08:00 p.m. / Festivos de 10:00 a.m. a 8:00 p.m.",
              "class": "tienda_89"
            },
            "Centro Comercial Fontanar":{
              "lat": 4.8838849,
              "lng": -74.0373393,
              "address":"Local 245",
              "schedules":"Lunes - Jueves  10:30 a.m. a 08:30 p.m. /Viernes y  Sábado de 10:00 a.m. a 09:00 p.m./ Domingos y Festivos de 10:00 a.m a 8:00 p.m.",
              "class": "tienda_90"
            },
          }
        },
        "CHINCHINÁ":{
          "lat": 4.9860645,
          "lng": -75.6241862,
          "stores":{
            "Carrera 8 # 10 - 08":{
              "lat": 4.9835973,
              "lng": -75.6078693,
              "address":"Carrera 8 # 10 - 08",
              "schedules":"Lunes - Viernes de 09:00 a.m. a 07:00 p.m. Sábado 09:00 a.m. a 07:30 a.m. / Domingo - Festivos de 09:30 a.m. a 01:30 p.m.",
              "class": "tienda_91"
            },
          }
        },
        "CUCUTA":{
          "lat": 7.9089243,
          "lng": -72.5744618,
          "stores":{
            "Centro Comercial Jardin Plaza":{
              "lat": 7.9200105,
              "lng": -72.482196,
              "address":"Local 68A",
              "schedules":"Lunes a jueves de 10:00 am a 8: oo pm/viernes y sabado de 10:00 am a 9:00 pm / Domingo y festivos de 10:00 am a 8:00 pm.",
              "class": "tienda_92"
            },
            "Centro Comercial Unicentro":{
              "lat": 7.9168459,
              "lng": -72.4957464,
              "address":"Local 177-178",
              "schedules":"Lunes - Jueves de 09:30 a.m. a 08:00 p.m. / Viernes - Sábado de 09:30 a.m. a 09:00 p.m. / Domingo - Festivos de 10:00 a.m. a 08:00 p.m.",
              "class": "tienda_93"
            },
            "Centro Comercial Ventura Plaza":{
              "lat": 7.8880989,
              "lng": -72.4987985,
              "address":"Local 209",
              "schedules":"Lunes - Jueves de 09:30 a.m. a 08:00 p.m. / Viernes - Sábado de 09:30 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_94"
            },
            "Exito San Mateo":{
              "lat": 7.8828482,
              "lng": -72.4906897,
              "address":"Avenida Demetrio Mendoza Redoma",
              "schedules":"Lunes - Festivos de 08:00 a.m. a 09:30 p.m.",
              "class": "tienda_95"
            },
          }
        },
        "DOSQUEBRADAS":{
          "lat": 4.8363266,
          "lng": -75.7149712,
          "stores":{
            "Centro Comercial Unico":{
              "lat": 4.8288836,
              "lng": -75.6803396,
              "address":"Local 13",
              "schedules":"Lunes - Festivos de 10:00 a.m. a 08:00 p.m. / Sábado de 10:00 a.m. a 08:30 p.m.",
              "class": "tienda_96"
            },
          }
        },
        "ENVIGADO":{
          "lat": 6.1663544,
          "lng": -75.5994392,
          "stores":{
            "Calle 36 Sur # 43 - 09":{
              "lat": 6.1712587,
              "lng": -75.5894785,
              "address":"Calle 36 Sur # 43 - 09",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 07:00 p.m. / Domingo de 10:00 a.m. a 04:00 p.m.",
              "class": "tienda_97"
            },
            "Carrera 43 # 35 Sur - 54":{
              "lat": 6.1719969,
              "lng": -75.5889099,
              "address":"Carrera 43 # 35 Sur - 54",
              "schedules":"Lunes - Jueves de 09:00 a.m. a 07:00 p.m. / Viernes - Sábado de 09:00 a.m. a 07:30 p.m. / Domingo de 09:00 a.m. a 03:00 p.m.",
              "class": "tienda_98"
            },
            "Centro Comercial Viva Envigado":{
              "lat": 6.1752011,
              "lng": -75.594568,
              "address":"Local 228",
              "schedules":"Lunes - Sabado de 10:00 a.m. a 09:00 p.m. / Domingo de 11:00 a.m. a 08:00 p.m. / Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_99"
            },
          }
        },
        "IBAGUE":{
          "lat": 4.4124574,
          "lng": -75.2568188,
          "stores":{
            "Carrera 3 # 13 - 01":{
              "lat": 4.4431219,
              "lng": -75.2418617,
              "address":"Carrera 3 # 13 - 01",
              "schedules":"Lunes - Viernes de 09:00 a.m. a 07:30 p.m. / Sábado de 09:00 a.m. a 08:00 p.m. / Domingo - Festivos de 10:00 a.m. a 02:00 p.m.",
              "class": "tienda_100"
            },
            "Centro Comercial La estación":{
              "lat": 4.446124,
              "lng": -75.2075619,
              "address":"Local 139",
              "schedules":"Lunes - Sábado de 10:00 a.m. a 08:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_101"
            },
            "Centro Comercial La Estación Sao Ibague":{
              "lat": 4.4457255,
              "lng": -75.2061397,
              "address":"Centro Comercial La Estación Sao Ibague",
              "schedules":"Lunes - Sábado de 08:00 a.m. a 10:00 p.m. / Domingo - Festivos de 09:00 a.m. a 09:30 p.m.",
              "class": "tienda_102"
            },
          }
        },
        "IPIALES":{
          "lat": 0.8262219,
          "lng": -77.6550351,
          "stores":{
            "Centro Comercial Nuestro Cartago":{
              "lat": 0.8299607,
              "lng": -77.6383705,
              "address":"Avenida Panamaricana Carrera 1 # 12 - 128",
              "schedules":"Lunes - Martes de 09:00 a.m. a 07:00 p.m. / Miércoles - Sábado de 09:00 a.m. a 08:00 p.m. / Domingo - Festivos de 10:00 a.m. a 06:00 p.m.",
              "class": "tienda_103"
            },
            "Carrera 6 # 12 - 79":{
              "lat": 0.8246258,
              "lng": -77.6402248,
              "address":"Carrera 6 # 12 - 79",
              "schedules":"Lunes - Viernes de 09:00 a.m. a 07:30 p.m. / Sábado de 09:00 a.m. a 08:00 p.m. / Domingo - Festivos de 09:00 a.m. a 01:00 p.m.",
              "class": "tienda_104"
            },
            "Carrera 7 # 12A - 39":{
              "lat": 0.8243303,
              "lng": -77.6404036,
              "address":"Carrera 7 # 12A - 39",
              "schedules":"Lunes - Viernes de 09:00 a.m. a 07:30 p.m. / Sábado de 09:00 a.m. a 08:00 p.m. / Domingo - Festivos de 10:00 a.m. a 02:00 p.m.",
              "class": "tienda_105"
            },
          }
        },
        "ITAGUI":{
          "lat": 6.1753778,
          "lng": -75.6314396,
          "stores":{
            "Carrera 49 # 49 - 09":{
              "lat": 6.1708479,
              "lng": -75.6122279,
              "address":"Carrera 49 # 49 - 09",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 07:00 p.m. / Domingo de 09:00 a.m. a 03:00 p.m.",
              "class": "tienda_106"
            },
            "Carrera 50 # 49 - 63":{
              "lat": 6.1718613,
              "lng": -75.6121673,
              "address":"Carrera 50 # 49 - 63",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 07:00 p.m. / Domingo de 09:00 a.m. a 03:00 p.m.",
              "class": "tienda_107"
            },
            "Éxito Itagui":{
              "lat": 6.1718879,
              "lng": -75.6187334,
              "address":"Carrera 50A # 41 - 42",
              "schedules":"Lunes - Sábado de 08:30 a.m. a 09:00 p.m. / Domingo - Festivos de 09:00 a.m. a 08:00 p.m.",
              "class": "tienda_108"
            },
          }
        },
        "MAGANGUE":{
          "lat": 9.2398158,
          "lng": -74.7766262,
          "stores":{
            "Exito Magangue":{
              "lat": 9.2403665,
              "lng": -74.754955,
              "address":"Locales 22 - 23 - 24/ Calle 16 # 10 - 221B/PUEBLO NUEVO",
              "schedules":"Lunes - Jueves de 09:30 a.m. a 08:00 p.m. / Viernes de 09:30 a.m. a 08:30 p.m. / Sábado de 09:00 a.m. a 09:00 p.m. / Domingo - Festivos de 10:00 a.m. a 06:00 p.m.",
              "class": "tienda_109"
            },
          }
        },
        "MANIZALES":{
          "lat": 5.0687821,
          "lng": -75.5186628,
          "stores":{
            "Carrera 22 # 19":{
              "lat": 5.067622,
              "lng": -75.5211991,
              "address":"Carrera 22 # 19 Esquina",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 08:00 p.m. / Domingo - Festivos de 10:00 a.m. a 02:00 p.m.",
              "class": "tienda_110"
            },
            "Centro Comercial Fundadores":{
              "lat": 5.0693844,
              "lng": -75.5117241,
              "address":"Local 116",
              "schedules":"Lunes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_111"
            },
            "Centro Comercial Mall Plaza":{
              "lat": 5.065109,
              "lng": -75.4906808,
              "address":"Local A2112",
              "schedules":"Lunes - Jueves de 10:00 a.m. a 08:00 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo -  Festivos de 10:00 a.m. a 08:00 p.m. (cuando hay lunes festivo el domingo es de 10:00 a.m. a 9:00 pm.)",
              "class": "tienda_112"
            },
            "Centro Comercial Parque Caldas":{
              "lat": 5.0679938,
              "lng": -75.5150389,
              "address":"Local P31 Nivel 3",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 08:00 p.m. / Domingo - Festivos de 11:00 a.m. a 07:00 p.m.",
              "class": "tienda_113"
            },
          }
        },
        "MEDELLIN":{
          "lat": 6.2690007,
          "lng": -75.7364815,
          "stores":{
            "Carrera 49 # 48 - 56":{
              "lat": 6.2677774,
              "lng": -75.5611792,
              "address":"Carrera 49 # 48 - 56",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 07:00 p.m.",
              "class": "tienda_114"
            },
            "Centro Comercial De Moda Outlet":{
              "lat": 6.2196794,
              "lng": -75.5858088,
              "address":"Local 125",
              "schedules":"Lunes - Jueves de 11:00 a.m. a 07:30 p.m. / Viernes - Sábado de 11:00 a.m. a 08:00 p.m. / Domingo de 11:00 a.m. a 07:00 p.m. / Festivos de 11:00 a.m. a 07:00 p.m.",
              "class": "tienda_115"
            },
            "Centro Comercial El Tesoro":{
              "lat": 6.1965387,
              "lng": -75.5610703,
              "address":"Local 1333",
              "schedules":"Lunes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_116"
            },
            "Centro Comercial Los Molinos":{
              "lat": 6.2329718,
              "lng": -75.606626,
              "address":"Local 1061",
              "schedules":"Lunes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_117"
            },
            "Centro Comercial Palace Bolívar":{
              "lat": 6.2481983,
              "lng": -75.5706667,
              "address":" Local 116",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 07:00 p.m.",
              "class": "tienda_118"
            },
            "Centro Comercial Premium Plaza":{
              "lat": 6.2296926,
              "lng": -75.5725287,
              "address":"Local 1548",
              "schedules":"Lunes - Jueves de 10:00 a.m. a 08:00 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 07:00 p.m.",
              "class": "tienda_119"
            },
            "Centro Comercial San Diego":{
              "lat": 6.2341239,
              "lng": -75.5706545,
              "address":"Local 1170",
              "schedules":"Lunes - Jueves de 10:00 a.m. a 08:00 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo de 11:00 a.m. a 06:00 p.m. / Festivos de 11:00 a.m. a 05:00 p.m.",
              "class": "tienda_120"
            },
            "Centro Comercial Santafe":{
              "lat": 6.1964896,
              "lng": -75.576019,
              "address":"Local 2192",
              "schedules":"Lunes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_121"
            },
            "Centro Comercial Unicentro":{
              "lat": 6.2407804,
              "lng": -75.5892957,
              "address":"Local 295",
              "schedules":"Lunes - Jueves de 10:00 a.m. a 08:00 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 06:30 p.m.",
              "class": "tienda_122"
            },
            "Centro Comercial Viva Laureles":{
              "lat": 6.2461061,
              "lng": -75.6043454,
              "address":"Local 105",
              "schedules":"Lunes - Jueves de 10:00 a.m. a 08:00 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 06:30 p.m.",
              "class": "tienda_123"
            },
          }
        },
        "MONTERIA":{
          "lat": 8.7606317,
          "lng": -75.9169898,
          "stores":{
            "Centro Comercial Buenavista":{
              "lat": 8.7789453,
              "lng": -75.8639427,
              "address":"Local 178-179",
              "schedules":"Lunes - Jueves de 10:00 a.m. a 08:00 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 07:00 p.m.",
              "class": "tienda_124"
            },
            "Sao la 27":{
              "lat": 8.7496867,
              "lng": -75.8819504,
              "address":"Carrera 14 # 27 - 22",
              "schedules":"Lunes - Sábado de 08:00 a.m. a 09:00 p.m. / Domingo - Festivos de 08:00 a.m. a 08:00 p.m.",
              "class": "tienda_125"
            },
          }
        },
        "NEIVA":{
          "lat": 2.9377887,
          "lng": -75.3424298,
          "stores":{
            "Centro Comercial San Pedro Plaza":{
              "lat": 2.9506926,
              "lng": -75.2905742,
              "address":"Local 169",
              "schedules":"Lunes - Jueves de 10:00 a.m. a 08:30 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_126"
            },
            "Centro Comercial Santa Lucia":{
              "lat": 2.934231,
              "lng": -75.2503725,
              "address":"Local N2-07 / N2-09",
              "schedules":"Lunes - Jueves de 10:00 a.m. a 08:30 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_127"
            },
            "Sao Olimpica":{
              "lat": 2.9365983,
              "lng": -75.2912234,
              "address":"Carrera 5 # 19 - 23",
              "schedules":"Lunes - Sábado de 08:00 a.m. a 09:30 p.m. / Domingo - Festivos de 08:00 a.m. a 09:00 p.m.",
              "class": "tienda_128"
            },
          }
        },
        "PALMIRA":{
          "lat": 3.5320986,
          "lng": -76.3304452,
          "stores":{
            "Calle 30 # 26 - 33":{
              "lat": 3.5267383,
              "lng": -76.2996621,
              "address":"Calle 30 # 26 - 33",
              "schedules":"Lunes - Sábado de 08:30 a.m. a 07:00 p.m. / Domingo - Festivos de 09:00 a.m. a 01:00 p.m.",
              "class": "tienda_129"
            },
            "Centro Comercial Llano Grande Almacenes SI":{
              "lat": 3.526765,
              "lng": -76.3062282,
              "address":"sección de Calzado",
              "schedules":"Lunes - Sábado de 10:00 a.m. a 08:00 p.m. / Domingo - Festivos de 10:30 a.m. a 07:00 p.m.",
              "class": "tienda_130"
            },
            "Centro Comercial Llano Grande Local 140":{
              "lat": 3.526765,
              "lng": -76.3062282,
              "address":"Local 140",
              "schedules":"Lunes - Festivos de 10:00 a.m. a 08:00 p.m. / Sábado de 10:00 a.m. a 09:00 p.m.",
              "class": "tienda_131"
            },
            "Centro Comercial Unicentro Palmira":{
              "lat": 3.5268714,
              "lng": -76.3324932,
              "address":"Local 126",
              "schedules":"Lunes - Jueves de 10:00 a.m. a 08:00 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_132"
            },
            "Edificio Local 2":{
              "lat": 3.5278369,
              "lng": -76.3006385,
              "address":"Calle 31 # 27 - 69",
              "schedules":"Lunes - Sábado de 08:30 a.m. a 07:30 p.m. / Domingo - Festivos de 09:00 a.m. a 01:30 p.m.",
              "class": "tienda_133"
            },
          }
        },
        "PASTO":{
          "lat": 1.213611,
          "lng": -77.3122423,
          "stores":{
            "Carrera 24 # 16 - 42":{
              "lat": 1.2132925,
              "lng": -77.2821504,
              "address":"Carrera 24 # 16 - 42",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 07:30 p.m. / Domingo - Festivos de 09:00 a.m. a 01:00 p.m.",
              "class": "tienda_134"
            },
            "Carrera 24 # 16 - 71":{
              "lat": 1.2132925,
              "lng": -77.2821504,
              "address":"Carrera 24 # 16 - 71",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 07:30 p.m. / Domingo - Festivos de 09:00 a.m. a 01:00 p.m.",
              "class": "tienda_135"
            },
            "Centro Comercial Unico":{
              "lat": 1.2165587,
              "lng": -77.2907645,
              "address":"Local 40",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 07:30 p.m. / Domingo - Festivos de 09:00 a.m. a 01:00 p.m.",
              "class": "tienda_136"
            },
          }
        },
        "PEREIRA":{
          "lat": 4.8048592,
          "lng": -74.7766262,
          "stores":{
            "Carrera 8 # 18 - 77":{
              "lat": 4.8137889,
              "lng": -75.6963532,
              "address":"Carrera 8 # 18 - 77",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 08:00 p.m. / Domingo - Festivos de 10:00 a.m. a 02:00 p.m.",
              "class": "tienda_137"
            },
            "Centro Comercial Ciudad Victoria":{
              "lat": 4.8110724,
              "lng": -75.6953063,
              "address":"Local 118",
              "schedules":"Lunes - Viernes de 10:00 a.m. a 08:00 p.m. / Sábado de 10:00 a.m. a 08:30 p.m. / Domingo - Festivos de 11:00 a.m. a 07:00 p.m.",
              "class": "tienda_138"
            },
          }
        },

        "POPAYAN":{
          "lat": 2.4574702,
          "lng": -76.6349538,
          "stores":{
            "Calle 6 # 4 - 94":{
              "lat": 2.4401981,
              "lng": -76.6074395,
              "address":"Calle 6 # 4 - 94",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 07:30 p.m. / Domingo - Festivos de 09:30 a.m. a 01:30 p.m.",
              "class": "tienda_139"
            },
            "Calle 6 # 6 - 65":{
              "lat": 2.4405119,
              "lng": -76.6090415,
              "address":"Calle 6 # 6 - 65",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 07:30 p.m. / Domingo - Festivos de 09:30 a.m. a 01:30 p.m.",
              "class": "tienda_140"
            },
            "Calle Calle 7 # 6 - 02":{
              "lat": 2.4396311,
              "lng": -76.608833,
              "address":"Calle 7 # 6 - 02",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 07:30 p.m. / Domingo - Festivos de 09:30 a.m. a 01:30 p.m.",
              "class": "tienda_141"
            },
            "Carrera 6 # 5 - 82":{
              "lat": 2.4406956,
              "lng": -76.608537,
              "address":"Carrera 6 # 5 - 82",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 07:30 p.m. / Domingo - Festivos de 09:30 a.m. a 01:30 p.m.",
              "class": "tienda_142"
            },
            "Centro Comercial Campanario":{
              "lat": 2.459482,
              "lng": -76.5970164,
              "address":"Local 50 - 51",
              "schedules":"Lunes - Viernes de 10:00 a.m. a 08:00 p.m. / Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_143"
            },
            "Centro Comercial Terra Plaza":{
              "lat": 2.4868135,
              "lng": -76.5625747,
              "address":"Local L-189",
              "schedules":"Lunes a jueves de 10:00 am a 8:00pm/ Viernes-sabado de 10:00am a 9:00pm/ Domingos y festivos de 10:00 a 8:00pm",
              "class": "tienda_144"
            },
            "Exito Panamericano":{
              "lat": 2.4458619,
              "lng": -76.6109657,
              "address":"Local 114A/ Carrera 9 # 6N - 03",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 08:30 p.m. / Domingo - Festivos de 09:00 a.m. a 08:00 p.m.",
              "class": "tienda_145"
            },
          }
        },
        "RIONEGRO":{
          "lat": 6.1448793,
          "lng": -75.3916277,
          "stores":{
            "Carrera 50 # 50 - 20":{
              "lat": 6.1538657,
              "lng": -75.3756625,
              "address":"Carrera 50 # 50 - 20",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 07:00 p.m.",
              "class": "tienda_146"
            },
            "Centro Comercial San Nicolás":{
              "lat": 6.1469754,
              "lng": -75.3805202,
              "address":"Local 1205",
              "schedules":"Lunes - Jueves de 10:00 a.m. a 08:00 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 07:00 p.m.",
              "class": "tienda_147"
            },
          }
        },
        "SABANETA":{
          "lat": 6.1505797,
          "lng": -75.6255748,
          "stores":{
            "Centro Comercial Mayorca":{
              "lat": 6.1608828,
              "lng": -75.6070597,
              "address":"Local 1159",
              "schedules":"Lunes - Jueves de 10:00 a.m. a 08:00 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 07:00 p.m.",
              "class": "tienda_148"
            },
          }
        },
        "SANTA MARTA":{
          "lat": 11.2316073,
          "lng": -74.2174168,
          "stores":{
            "Centro Comercial Buenavista":{
              "lat": 11.2269836,
              "lng": -74.1749041,
              "address":"Local 73-74",
              "schedules":"Lunes - Jueves de 10:00 a.m. a 08:30 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_149"
            },
            "Exito Buenavista":{
              "lat": 11.2269941,
              "lng": -74.1749041,
              "address":"Calle 32 # 29A - 500",
              "schedules":"Lunes - Festivos de 09:00 a.m. a 09:00 p.m. / Viernes - Sábado de 09:00 a.m. a 10:00 p.m.",
              "class": "tienda_150"
            },
            "Super Tienda Sao Santa Marta":{
              "lat": 11.2270304,
              "lng": -74.1902251,
              "address":"Seccion De Calzado / Calle 23 # 7 - 45",
              "schedules":"Lunes - Sábado de 08:00 a.m. a 09:00 p.m. / Domingo - Festivos de 08:00 a.m. a 08:00 p.m.",
              "class": "tienda_151"
            },
          }
        },
        "SANTA ROSA DE CABAL":{
          "lat": 4.8850371,
          "lng": -75.6565292,
          "stores":{
            "Carrera 14 # 13 - 43":{
              "lat": 4.865886,
              "lng": -75.623281,
              "address":"Carrera 14 # 13 - 43",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 07:00 p.m. / Domingo - Festivos de 09:30 a.m. a 01:30 p.m.",
              "class": "tienda_152"
            },
            "Carrera 14 # 13 - 68":{
              "lat": 4.8661097,
              "lng": -75.6231856,
              "address":"Carrera 14 # 13 - 68",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 07:00 p.m. / Domingo - Festivos de 09:30 a.m. a 01:30 p.m.",
              "class": "tienda_153"
            },
          }
        },
        "SINCELEJO":{
          "lat": 9.2922744,
          "lng": -75.4298491,
          "stores":{
            "Centro Comercial Viva Sincelejo":{
              "lat": 9.3029983,
              "lng": -75.3907263,
              "address":"Local 1-34",
              "schedules":"Lunes - Viernes de 10:00 a.m. a 08:00 p.m. / Sábado de 09:30 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 07:00 p.m.",
              "class": "tienda_154"
            },
          }
        },
        "SOLEDAD":{
          "lat": 10.9103496,
          "lng": -74.8256345,
          "stores":{
            "Centro Comercial Nuestro Atlántico":{
              "lat": 10.9055523,
              "lng": -74.8044467,
              "address":" Local 1028",
              "schedules":"Lunes - Viernes de 10:00 a.m. a 08:00 p.m. / Sábado de 09:30 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 07:00 p.m.",
              "class": "tienda_155"
            },
          }
        },
        "TULUA":{
          "lat": 4.0910649,
          "lng": -76.2313007,
          "stores":{
            "Calle 27 # 23 - 49":{
              "lat": 4.0846293,
              "lng": -76.2010587,
              "address":"Calle 27 # 23 - 49",
              "schedules":"Lunes - Sábado de 09:00 a.m. a 07:00 p.m. / Domingo - Festivos de 10:00 a.m. a 01:00 p.m.",
              "class": "tienda_156"
            },
            "Calle 27 # 24 - 26":{
              "lat": 4.0843264,
              "lng": -76.2007948,
              "address":"Calle 27 # 24 - 26",
              "schedules":"Lunes - Sábado de 08:30 a.m. a 07:30 p.m. / Domingo - Festivos de 09:00 a.m. a 02:00 p.m.",
              "class": "tienda_157"
            },
            "Centro Comercial la Herradura":{
              "lat": 4.0837905,
              "lng": -76.2058617,
              "address":"Local M02",
              "schedules":"Lunes - Festivos de 10:00 a.m. a 08:00 p.m.",
              "class": "tienda_158"
            },
            "Supermercado La 14":{
              "lat": 4.0729611,
              "lng": -76.2058617,
              "address":"Carrera 40 # 37 - 51",
              "schedules":"Lunes - Festivos de 09:00 a.m. a 09:00 p.m.",
              "class": "tienda_159"
            },
          }
        },
        "TUNJA":{
          "lat": 5.5393784,
          "lng": -73.3912608,
          "stores":{
            "Centro Comercial Viva Tunja":{
              "lat": 5.5577119,
              "lng": -73.3469209,
              "address":"Local 139",
              "schedules":"Lunes a Sabado de 10:00 am a 9:00 pm/ Domingos y Festivos de 11:00 am a 8:00 pm",
              "class": "tienda_160"
            },
          }
        },
        "VALLEDUPAR":{
          "lat": 10.4645885,
          "lng": -73.2932692,
          "stores":{
            "Centro Comercial Mayales":{
              "lat": 10.4558507,
              "lng": -73.2441445,
              "address":"Local 79-80",
              "schedules":"Lunes - Festivos de 10:00 a.m. a 08:00 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m.",
              "class": "tienda_161"
            },
          }
        },
        "VILLAVICENCIO":{
          "lat": 4.1249257,
          "lng": -73.6791013,
          "stores":{
            "Carrera 30 # 38-14":{
              "lat": 4.1527325,
              "lng": -73.6376523,
              "address":"Carrera 30 # 38-14",
              "schedules":"Lunes - Sabados de 9:00 a.m a 7:00 p.m. / Domingos - Festivos de 10:00 a.m a 6:00 p.m.",
              "class": "tienda_162"
            },
            "Centro Comercial Unicentro ":{
              "lat": 4.1420709,
              "lng": -73.6362033,
              "address":"Local 143",
              "schedules":"Lunes - Jueves de 10:00 a.m. a 08:30 p.m. / Viernes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_163"
            },
            "Centro Comercial Unico":{
              "lat": 4.129213,
              "lng": -73.6251237,
              "address":"Local 16",
              "schedules":"Lunes - Viernes de 10:00 a.m. a 08:30 p.m. / Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 10:00 a.m. a 08:00 p.m.",
              "class": "tienda_164"
            },
            "Centro Comercial Viva Sabana":{
              "lat": 4.1256903,
              "lng": -73.6406113,
              "address":"Local 156A",
              "schedules":"Lunes - Sábado de 10:00 a.m. a 09:00 p.m. / Domingo - Festivos de 11:00 a.m. a 08:00 p.m.",
              "class": "tienda_165"
            },
          }
        },
      }
    }
  };
  return data;
};












if ( jQuery("body").hasClass("tiendas") ) {
  jQuery(document).on('click', '.accordionTiendas .itemAccordion', function(e) {
    e.preventDefault();
    if ( jQuery(this).hasClass("active") ) {
      jQuery(".accordionTiendas .itemAccordion").removeClass("active");
      jQuery(this).removeClass("active");
    } else {
      jQuery(".accordionTiendas .itemAccordion").removeClass("active");
      jQuery(this).addClass("active");
    }
      jQuery('.accordionTiendas').find('.itemAccordion .body').stop().slideUp();
      jQuery(this).find('.body').stop().slideToggle();
  });
  jQuery(document).on("click", ".customSelect", function(event){
    event.preventDefault();
    if ( jQuery(this).hasClass("active") ) {
      jQuery(this).removeClass("active");
    } else {
      jQuery(".customSelect").removeClass("active");
      jQuery(this).addClass("active");
    }
  });
  jQuery(document).on("click", ".customSelect .OptionsSelect li", function(event){
    event.preventDefault();
    var optionSelectedTxt = jQuery(this).text();
    var currentRelField = jQuery(this).attr("rel");
    jQuery(this).closest(".customSelect").find(".labelInside .center").html( optionSelectedTxt );

    jQuery(".accordionTiendas .itemAccordion").each(function(){
      jQuery(this).hide();
      var currentRelFieldAccordion = jQuery(this).attr("rel");
      if ( currentRelFieldAccordion == currentRelField ) {
        jQuery(this).show();
      }
    });

  });
  jQuery(document).click(function(event) {
    //event.preventDefault();
    if (!jQuery(event.target).closest(".customSelect").length) {
      console.log("click afuera");
      jQuery(".customSelect").removeClass("active");
    }else{
      console.log("click adentro");
    }
  });

  // Google maps scripts


    // # Google maps Scripts

} // if home is tiendas

jQuery(document).on("click", "ul.OptionsSelect.slow_3 li", function(event){
  event.preventDefault();
  console.log("ADSAASSFFHFHTYR")
  jQuery(".accordionTiendas").css('display','block');
});