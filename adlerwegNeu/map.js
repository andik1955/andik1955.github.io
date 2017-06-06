window.onload = function() {
        // WMTS-Layer basemap.at - Quelle: http://www.basemap.at/wmts/1.0.0/WMTSCapabilities.xml
        var layers = {
            geolandbasemap: L.tileLayer("https://{s}.wien.gv.at/basemap/geolandbasemap/normal/google3857/{z}/{y}/{x}.png", {
                subdomains: ['maps', 'maps1', 'maps2', 'maps3', 'maps4'],
                attribution: 'Datenquelle: <a href="http://www.basemap.at/">basemap.at</a>'
            }),
            bmapgrau: L.tileLayer("https://{s}.wien.gv.at/basemap/bmapgrau/normal/google3857/{z}/{y}/{x}.png", {
                subdomains: ['maps', 'maps1', 'maps2', 'maps3', 'maps4'],
                attribution: 'Datenquelle: <a href="http://www.basemap.at/">basemap.at</a>'
            }),
            bmapoverlay: L.tileLayer("https://{s}.wien.gv.at/basemap/bmapoverlay/normal/google3857/{z}/{y}/{x}.png", {
                subdomains: ['maps', 'maps1', 'maps2', 'maps3', 'maps4'],
                attribution: 'Datenquelle: <a href="http://www.basemap.at/">basemap.at</a>'
            }),
            bmaphidpi: L.tileLayer("https://{s}.wien.gv.at/basemap/bmaphidpi/normal/google3857/{z}/{y}/{x}.jpeg", {
                subdomains: ['maps', 'maps1', 'maps2', 'maps3', 'maps4'],
                attribution: 'Datenquelle: <a href="http://www.basemap.at/">basemap.at</a>'
            }),
            bmaporthofoto30cm: L.tileLayer("https://{s}.wien.gv.at/basemap/bmaporthofoto30cm/normal/google3857/{z}/{y}/{x}.jpeg", {
                subdomains: ['maps', 'maps1', 'maps2', 'maps3', 'maps4'],
                attribution: 'Datenquelle: <a href="http://www.basemap.at/">basemap.at</a>'
            }),
            osm: L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                subdomains: ['a', 'b', 'c'],
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            })
        };

        // Karte definieren
        var map = L.map('map', {
            layers: [layers.geolandbasemap],
            center : [47.654, 13.370],
            zoom : 8
        });

        // Maßstab hinzufügen
        L.control.scale({
            maxWidth: 200,
            metric: true,
            imperial: false
        }).addTo(map);

		 // Höhenprofil control hinzufügen
        var profileControl = L.control.elevation({
            position : 'bottomright',
            theme : 'purple-theme'
        });
        profileControl.addTo(map);
		
		function loadTrack(track) {
			// GPX Track laden
			var kurztext = window.ETAPPENINFO[track].Kurztext;
			var streckenbeschreibung = window.ETAPPENINFO[track].Streckenbeschreibung;
			gpxTrack = omnivore.gpx('data/' + track).addTo(map);
			
			document.getElementById("Kurztext").innerHTML = kurztext;
			document.getElementById("Streckenbeschreibung").innerHTML = streckenbeschreibung;
			
			// nach erfolgreichem Laden Popup hinzufügen, Ausschnitt setzen und Höhenprofil erzeugen
			gpxTrack.on('ready', function () {
				// Popup hinzufügen
				var markup = '<h3>Adlerweg-Etappe 15: Solsteinhaus – Leutasch</h3>';
				markup += '<p>Mitten durchs Karwendel führt diese Etappe und verläuft über die Eppzirler Scharte in das Leutaschtal und weiter zu den 24 Weilern der Gemeinde Leutasch. Dabei werden Almgebiete, Mischwälder und die Gießenbachklamm durchquert.</p>'
				markup += '<li>Ausgangspunkt: Solsteinhaus</li>';
				markup += '<li>Endpunkt: Leutasch/Ahrn</li>';
				markup += '<li>Höhenmeter bergauf: 870</li>';
				markup += '<li>Höhenmeter bergab: 1530</li>';
				markup += '<li>Höchster Punkt: 2110</li>';
				markup += '<li>Schwierigkeitsgrad: mittelschwierig</li>';
				markup += '<li>Streckenlänge (in km): 20</li>';
				markup += '<li>Gehzeit (in Stunden): 6,5</li>';
				markup += '<li>Einkehrmöglichkeiten: Solsteinhaus, Eppzirleralm</li>';
				markup += '<li><a href="http://www.tirol.at/reisefuehrer/sport/wandern/wandertouren/a-adlerweg-etappe-15-solsteinhaus-leutasch">Weitere Informationen</a></li>';
				gpxTrack.bindPopup(markup, { maxWidth : 450 });

				// Ausschnitt setzen
				map.fitBounds(gpxTrack.getBounds());

				// Höhenprofil erzeugen und Koordinaten der Punkte holen
				profileControl.clear();
				gpxTrack.eachLayer(function (layer) {
					profileControl.addData(layer.feature);
					
					//console.log(layer.feature.geometry.coordinates)
					var pts = layer.feature.geometry.coordinates;
					
					for (var i = 1; i < pts.length; i += 1) {
						//console.log(pts[i]);   //aktueller Punkt
						//console.log(pts[i-1]);   //vorheriger Punkt
						
						//Entfernung bestimmen
						var dist = map.distance (
							[pts[i][1], pts[i][0]],
							[pts[i-1][1], pts[i-1][0]]
						).toFixed(0);    	// Kommastellen weg
						//console.log(dist);
						
						var delta = pts[i][2] - pts[i-1][2];
						//console.log(delta, "Höhenmeter auf",dist ,"m Strecke");    //Höhenunterschied
						
						var rad = Math.atan(delta/dist);
						var deg = (rad * (180 / Math.PI)).toFixed(1);
						//console.log(deg);
						
						//var rot = ['#ffffb2','#fed976','#feb24c','#fd8d3c','#f03b20','#bd0026']; // http://colorbrewer2.org/#type=sequential&scheme=Reds&n=6
						//var gruen = ['#ffffcc','#d9f0a3','#addd8e','#78c679','#31a354','#006837'];
						var farbe;
						switch(true) { // checks if condition is true, not for certain values of a variable
							case (deg >= 20) :  farbe = "#bd0026"; break;
							case (deg >= 15) :  farbe = "#f03b20"; break;
							case (deg >= 10) :  farbe = "#fd8d3c"; break;
							case (deg >= 5) :  farbe = "#feb24c"; break;
							case (deg >= 1) :  farbe = "#fed976"; break;
							case (deg >= -1) :  farbe = "yellow"; break;
							case (deg >= -5) :  farbe = "#d9f0a3"; break;
							case (deg >=-10) :  farbe = "#addd8e"; break;
							case (deg >=-15) :  farbe = "#78c679"; break;
							case (deg >= -20) :  farbe = "#31a354"; break;
							case (deg < -20) :  farbe = "#006837"; break;
							}
						
							//console.log(deg, farbe);
															
						var pointA = new L.LatLng(pts[i][1], pts[i][0]);
						var pointB = new L.LatLng(pts[i-1][1], pts[i-1][0]);
						var pointList = [pointA, pointB];
						var firstpolyline = new L.Polyline(pointList, {
						 color: farbe,
						 weight: 6,
						 opacity: 1.0,
						 smoothFactor: 1

						});
					
						firstpolyline.addTo(map);
					}
				});
			});
		
		} // end function
        // leaflet-hash aktivieren
        var hash = new L.Hash(map);
		
/*
		var huts = L.icon({
			iconUrl: 'icons/hut.png',
			iconAnchor: [16, 37]		
		});
		L.featureGroup([
			L.marker ([47.30805, 11.28811], { title: "Solsteinhaus", icon: huts } ),
			L.marker ([47.33112, 11.26743], { title: "Eppzirleralm", icon: huts} )
		]).addTo(map);
*/	
/*
		var start = L.icon({
			iconUrl: 'icons/hiking.png',
			iconAnchor: [16, 37]
		});
		L.marker([47.30805210, 11.28814900], { title: "Start Etappe 15", icon: start}).addTo(map);
		
		var end = L.icon({
			iconUrl: 'icons/finish.png',
			iconAnchor: [16, 37]
		});
		L.marker([47.36996990, 11.14378990], { title: "Ziel Etappe 15", icon: end}).addTo(map);
*/
        // WMTS-Layer Auswahl hinzufügen
        var layerControl = L.control.layers({
            "basemap.at - STANDARD": layers.geolandbasemap,
            "basemap.at - GRAU": layers.bmapgrau,
            "basemap.at - OVERLAY": layers.bmapoverlay,
            "basemap.at - HIGH-DPI": layers.bmaphidpi,
            "basemap.at - ORTHOFOTO": layers.bmaporthofoto30cm,
            "OpenStreetMap": layers.osm,
			 },
			 {
            //"Adlerweg Etappe 15" : gpxTrack
        }
		).addTo(map);
	loadTrack("AdlerwegEtappe01.gpx");
	
	
	//einzelne Etappen wählen
	var etappenSelektor = document.getElementById ("etappen");
		//console.log("Selektor", etappenSelektor);
		etappenSelektor.onchange = function (evt) {
		console.log("Change event: ", evt);
		console.log("GPX Track laden: ", etappenSelektor[etappenSelektor.selectedIndex].value);
		//var fileName = etappenSelektor[etappenSelektor.selectedIndex].value;
		//fileName = fileName.substr(0, 16); 
		//console.log(fileName);
		//var info = window.ETAPPENINFO[fileName];
		//console.log(info.Titel);
		loadTrack(etappenSelektor[etappenSelektor.selectedIndex].value);
		}
};
