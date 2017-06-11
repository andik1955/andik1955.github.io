window.onload = function() {
    // WMTS-Layer basemap.at - Quelle: http://www.basemap.at/wmts/1.0.0/WMTSCapabilities.xml
    var layers = {
        osm: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            subdomains: ['a', 'b', 'c'],
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap Contributors</a> <br> &copy; <a href="http://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units">EuroGeographics bezüglich der Verwaltungsgrenzen</a>'
        }),
        hikeBike: L.tileLayer('http://{s}.tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap Contributors</a> <br> &copy; <a href="http://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units">EuroGeographics bezüglich der Verwaltungsgrenzen</a>'
        }),
        hikeBikeHillshade: L.tileLayer('http://{s}.tiles.wmflabs.org/hillshading/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap Contributors</a> <br> &copy; <a href="http://ec.europa.eu/eurostat/web/gisco/geodata/reference-data/administrative-units-statistical-units">EuroGeographics bezüglich der Verwaltungsgrenzen</a>'
        }),
    };

    // Karte definieren
    var map = L.map('map', {
        layers: [layers.hikeBike],
        center: [46.15972, 13.011111],
        zoom: 9,
        zoomControl: true
    });

    // Maßstab hinzufügen
    L.control.scale({
        maxWidth: 200,
        metric: true,
        imperial: false
    }).addTo(map);

    //add fullscreen Button
    L.control.fullscreen({
        position: 'topleft', // change the position of the button can be topleft, topright, bottomright or bottomleft, defaut topleft
        title: 'Vollbildmodus an/aus', // change the title of the button, default Full Screen
        forceSeparateButton: true, // force seperate button to detach from zoom buttons, default false
        forcePseudoFullscreen: true, // force use of pseudo full screen even if full screen API is available, default false
    }).addTo(map);

    // add sidebar
    var sidebar = L.control.sidebar('sidebar', {
        closeButton: true,
        position: 'right'
    });
    
    // add sidebar control
    map.addControl(sidebar);


    //cluster group for alberghi
    var cluster_group = L.markerClusterGroup();


    // alberghi diffusi
    var punkteSpaziergang = L.geoJSON(window.alberghi, {
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng);
        },
        onEachFeature: function(feature, layer) {
            var allInfo = '<h3>Name des Gasthofs</h3>';
            allInfo += layer.feature.properties.denominazione;
            allInfo += '<div>' + "<a href='" + layer.feature.properties.sito + "'>Weitere Informationen</a>" + '</div>';
            layer.bindPopup(allInfo);
            return allInfo;
        }

    }).addTo(cluster_group);

    // add cluster to map
    map.addLayer(cluster_group);

    // leaflet-hash aktivieren
    var hash = new L.Hash(map);

    // variable to control fullscreen-state
    var fs = false;
    
    // events are fired when entering or exiting fullscreen.
    map.on('enterFullscreen', function() {
        console.log('entered fullscreen');
        fs = true;
        //sidebar.show();
        console.log(fs);
    });
    
    // events fired when exiting fullscreen
    map.on('exitFullscreen', function() {
        console.log('exited fullscreen');
        fs = false;
        sidebar.hide();
        console.log(fs);
    });

    // GeoJSON Daten der Provinzen einfuegen
    var subregions = L.geoJSON(window.subregion, {

    }).bindPopup(function(layer) {
        var allInfo = '<h3>Provinz ' + layer.feature.properties.Name + '</h3>';
        document.getElementById("regname").innerHTML = layer.feature.properties.Name;
        document.getElementById("capname").innerHTML = window.provinfo[layer.feature.properties.Name].capital;
        document.getElementById("bev").innerHTML = window.provinfo[layer.feature.properties.Name].bevprov;
        document.getElementById("description").innerHTML = window.provinfo[layer.feature.properties.Name].info;
        document.getElementById("info").innerHTML = "";
        document.getElementById("regname2").innerHTML = layer.feature.properties.Name;
        document.getElementById("capname2").innerHTML = window.provinfo[layer.feature.properties.Name].capital;
        document.getElementById("bev2").innerHTML = window.provinfo[layer.feature.properties.Name].bevprov;
        document.getElementById("description2").innerHTML = window.provinfo[layer.feature.properties.Name].info;
        return allInfo;
    }).addTo(map);
    
    // add sidebar according to fullscreen state "fs"
    subregions.on('click',  function() {
            if (fs == true) {
                sidebar.show();
            } else {
                sidebar.hide();
            }
            
        } 
    );

    // hide sidebar when clicking outside of subregions/rest of map
    map.on('click', function() {
        sidebar.hide();
    })



    //Provinz Friaul hinzufuegen
    var overview = L.geoJSON(window.overview, {
        style: function(feature) {
            return {
                color: 'red'
            };
        }
    });
    
    // Urbanisierungsgrad hinzufuegen
    var urban = L.geoJSON(window.urbanization, {
        style: function(feature) {
            if (feature.properties.DGURBA_CLA == 3){
                return { color: 'red' };
            } else if (feature.properties.DGURBA_CLA == 2) {
                return { color: 'green' };
            } else if (feature.properties.DGURBA_CLA == 1) {
                return { color: 'yellow'};
            }
        }
    });
    
    
    //legend for urbanization
    var legend = L.control({position: 'bottomright'});
    
    function getColor(d) {
        return d == 3  ? 'red' :
               d == 2  ? 'green' :
               d == 1  ? 'yellow' :
                          '#FFEDA0';
    }
        
    
    
    legend.onAdd = function (map) {

    var div = L.DomUtil.create('div', 'info legend'),
            grades = [1, 2, 3],
            label = "Urbanisierungsgrad";

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i]) + '"></i> ' +  label  + " " + grades[i] + '<br>' ;
        }

        return div;
    };

    legend.addTo(map);

    //eigenen Nordpfeil hinzufuegen
    var north = L.control({
        position: "bottomleft"
    });
    north.onAdd = function(map) {
        var div = L.DomUtil.create("div", "info legend");
        div.innerHTML = '<img width=20 src="icons/northarrow_darkgrey.png">';
        return div;
    }
    north.addTo(map);

    // WMTS-Layer Auswahl hinzufügen
    var layerControl = L.control.layers({
        "OpenStreetMap": layers.osm,
        "Hike & Bike": layers.hikeBike,
        "Hillshade": layers.hikeBikeHillshade,
    }, {
        "Region Friaul": overview,
        "Provinzen": subregions,
        "Gasthöfe": cluster_group,
        "Urbanisierungsgrad": urban,
    }).addTo(map);

    map.fitBounds(subregions.getBounds());
};