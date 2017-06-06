window.onload = function() {
        // WMTS-Layer basemap.at - Quelle: http://www.basemap.at/wmts/1.0.0/WMTSCapabilities.xml
        var layers = {
            osm: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                subdomains: ['a', 'b', 'c'],
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            })
        };

        // Karte definieren
        var map = L.map('map', {
            layers: [layers.osm],
            center : [46.15972, 13.011111],
            zoom : 9
        });

        // Maßstab hinzufügen
        L.control.scale({
            maxWidth: 200,
            metric: true,
            imperial: false
        }).addTo(map);
		
		
        // leaflet-hash aktivieren
        //var hash = new L.Hash(map);

        
        // GeoJSON Daten der Friaul Uebersicht einfuegen
        var subregions = L.geoJSON(window.subregion, {
            filter: function(feature) {
                if (feature.geometry.type == "Polygon") {
                    return true
                };
            }
        }).bindPopup(function(layer) {
            var allInfo = '<h3>Name der Region:</h3>';
            allInfo += '<div>' + layer.feature.properties.Name + '</div>';
            return allInfo;
        }).addTo(map);
        
        // WMTS-Layer Auswahl hinzufügen
        var layerControl = L.control.layers({
            "OpenStreetMap": layers.osm},
            {
            "Administrative Boundary": subregions
			 }).addTo(map);
             
        map.fitBounds(subregions.getBounds());
};
