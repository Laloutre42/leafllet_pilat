define(['backbone', 'resthub', 'leaflet', 'boundaryCanvas', 'hbs!template/map', 'view/control-view'],
    function(Backbone, Resthub, Leaflet, BoundaryCanvas, mapTemplate, ControlView) {

        var MapView = Resthub.View.extend({

            /**
             * Template
             */
            template: mapTemplate,

            /**
             * Events
             */
            events: {},

            /**
             * Constants
             */
            constants: {
                VILLAGE: "Village",
                POINT_HAUT: "Point haut"
            },

            /**
             * Initialize
             * @param attributes
             */
            initialize: function(attributes) {

                mapView = this;

                // Events aggregator object
                this.vent = attributes.vent;

                _.bindAll(this, "addOrRemovePoi");
                _.bindAll(this, "addTrace");
                _.bindAll(this, "removeTrace");
                _.bindAll(this, "deZoomOnFeature");
                this.vent.on("addOrRemovePoi", this.addOrRemovePoi);
                this.vent.on("addTrace", this.addTrace);
                this.vent.on("removeTrace", this.removeTrace);
                this.vent.on("deZoomOnFeature", this.deZoomOnFeature);

                // Render the view and the sub view
                this.render();
                this.$el.append(new ControlView({
                    vent: this.vent
                }));

                // Pilat POI layer
                this.geojsonPilatPoiLayer;
                // Trace
                this.geojsonTrace;

                // New map
                this.pilatMap = L.map('map').setView([51.505, -0.09], 13);

                // Map provider url
                mapProviderUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
                //mapProviderUrl = 'http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png';                
                //mapProviderUrl = 'http://[abc].tile.thunderforest.com/outdoors/${z}/${x}/${y}.png'

                // All Markers
                this.pilatMarkers = [];
                // Markers shown on map
                this.poiShowOnMap = [];

                // Add OpenStreetMap layer
                L.tileLayer(mapProviderUrl, {
                    attribution: 'To defined OSM',
                    opacity: 0.5,
                }).addTo(this.pilatMap);

                // Draw the boundaries of Pilat Parc
                this.addPilatBoundariesGeojsonLayer();
                this.addPilatPOIGeojsonLayer();

                this.vent.trigger("createControl", this.pilatMap);
            },

            /**
             * Draw the boundaries of Pilat Parc and add this layer to the map
             */
            addPilatBoundariesGeojsonLayer: function() {

                $.getJSON("./geojson/map_pilat.geo.json", function(data) {
                    var geojsonPilatBounds = L.geoJson(data, {

                        // Add style to Pilat layer 
                        style: {
                            color: '#8A0808',
                            fill: false,
                            weight: 0.8,
                            opacity: 0.8,
                            dashArray: '6',
                        },

                        onEachFeature: function(feature, layer) {

                            layer.bindPopup(feature.properties.name);

                            // Map geojson data to get Pilat boundaries
                            latLngGeom = [];
                            for (r = 0; r < feature.geometry.coordinates[0].length; r++) {
                                latLngGeom.push(new L.LatLng(feature.geometry.coordinates[0][r][1], feature.geometry.coordinates[0][r][0]));
                            }
                        }
                    });

                    mapView.pilatMap.fitBounds(geojsonPilatBounds.getBounds());
                    geojsonPilatBounds.addTo(mapView.pilatMap);

                    //Add PilatLayer layer
                    L.TileLayer.boundaryCanvas(mapProviderUrl, {
                        boundary: latLngGeom,
                        opacity: 1,
                        maxZoom: 18
                    }).addTo(mapView.pilatMap);

                });

            },

            /** 
             * Load markers POI, make a layer and add it to the map
             */
            addPilatPOIGeojsonLayer: function() {

                $.getJSON("./geojson/POI.geo.json", function(data) {
                    this.geojsonPilatPoiLayer = L.geoJson(data, {

                        // Return custom markers
                        pointToLayer: function(feature, latlng) {

                            // Icon depends of feature
                            var icon;
                            if (feature.properties.type === mapView.constants.VILLAGE) {
                                icon = L.icon({
                                    iconUrl: '/img/icon/smallcity.png',
                                    iconSize: [32, 37],
                                    iconAnchor: [16, 37],
                                });
                            }
                            if (feature.properties.type === mapView.constants.POINT_HAUT) {
                                icon = L.icon({
                                    iconUrl: '/img/icon/peak.png',
                                    iconSize: [32, 37],
                                    iconAnchor: [16, 37],
                                });
                            }

                            var marker = L.marker(latlng, {
                                title: feature.properties.name,
                                icon: icon
                            }).on({
                                mouseover: mapView.highlightFeature,
                                mouseout: mapView.resetHighlight,
                                click: mapView.zoomOnFeature
                            });
                            mapView.pilatMarkers.push(marker);
                            return marker;
                        },

                        // Bind popup to layers for each feature
                        onEachFeature: function(feature, layer) {
                            //layer.bindPopup(feature.properties.name);
                        }
                    });

                });
            },

            /**
             * Add or remove POI on the map, depending of the user choise (radio buttons)
             * @param category - The category of the POI
             */
            addOrRemovePoi: function(category) {

                if ($.inArray(category, this.poiShowOnMap) > -1) {
                    this.poiShowOnMap.splice($.inArray(category, this.poiShowOnMap), 1);
                } else {
                    this.poiShowOnMap.push(category);
                }

                if (this.pilatMap.hasLayer(this.geojsonPilatPoiLayer)) {
                    this.pilatMap.removeLayer(this.geojsonPilatPoiLayer);
                }

                this.geojsonPilatPoiLayer = new L.featureGroup();

                // Add markers
                _.each(this.pilatMarkers, function(element) {
                    if ($.inArray(element.feature.properties.category, this.poiShowOnMap) > -1) {
                        this.geojsonPilatPoiLayer.addLayer(element);
                    }
                }, this);

                this.geojsonPilatPoiLayer.addTo(this.pilatMap);
            },

            /** 
             * Highlight a feature when event on marker
             * @param event
             */
            highlightFeature: function(event) {
                mapView.vent.trigger("update", mapView.constants, event.target.feature.properties);
            },

            /** 
             * Reset event on marker
             * @param event
             */
            resetHighlight: function(event) {
                mapView.vent.trigger("update", mapView.constants);
            },

            /**
             * Zoom on feature event on marker
             * @param event
             */
            zoomOnFeature: function(event) {

                var marker = event.target;

                // Remove events
                _.each(mapView.pilatMarkers, function(element) {
                    element.off('mouseover', this.highlightFeature);
                    element.off('mouseout', this.resetHighlight);
                    element.off('click', this.zoomOnFeature);
                }, mapView);

                // Increase control size 
                mapView.vent.trigger("update", mapView.constants, marker.feature.properties, true);
            },

            /**
             * Dezoom feature event on marker
             * @param event
             */
            deZoomOnFeature: function(event) {

                // Add events
                _.each(mapView.pilatMarkers, function(element) {
                    element.on('mouseover', this.highlightFeature);
                    element.on('mouseout', this.resetHighlight);
                    element.on('click', this.zoomOnFeature);
                }, mapView);

                mapView.vent.trigger("update", mapView.constants);
            },

            /**
             * Add trace on the map
             * @param name - The name of the trace
             */
            addTrace: function(name) {

                // Remove previous trace
                if (mapView.pilatMap.hasLayer(mapView.geojsonTrace)) {
                    mapView.pilatMap.removeLayer(mapView.geojsonTrace);
                }

                $.getJSON("./geojson/trace/entreLoireEtArdeche.geo.json", function(data) {
                    mapView.geojsonTrace = L.geoJson(data, {

                        // Add style to Pilat layer 
                        style: {
                            color: 'blue',
                            fill: false,
                            weight: 2,
                            opacity: 1
                        },

                        pointToLayer: function(feature, latlng) {

                            // Icon depends of feature
                            var icon;
                            if (feature.properties.type === mapView.constants.VILLAGE) {
                                icon = L.icon({
                                    iconUrl: '/img/icon/smallcity.png',
                                    iconSize: [32, 37],
                                    iconAnchor: [16, 37],
                                });
                            }
                            if (feature.properties.type === mapView.constants.POINT_HAUT) {
                                icon = L.icon({
                                    iconUrl: '/img/icon/peak.png',
                                    iconSize: [32, 37],
                                    iconAnchor: [16, 37],
                                });
                            }

                            var marker = L.marker(latlng, {
                                title: feature.properties.name,
                                icon: icon
                            }).on({
                                mouseover: mapView.highlightFeature,
                                mouseout: mapView.resetHighlight,
                                click: mapView.zoomOnFeature
                            });
                            mapView.pilatMarkers.push(marker);
                            return marker;
                        },
                    });

                    // Fit bounds and add geojson
                    mapView.pilatMap.fitBounds(mapView.geojsonTrace.getBounds());
                    mapView.geojsonTrace.addTo(mapView.pilatMap);

                });
            },

            /**
             * Remove trace on the map
             */
            removeTrace: function() {

                // Remove previous trace
                if (mapView.pilatMap.hasLayer(mapView.geojsonTrace)) {
                    mapView.pilatMap.removeLayer(mapView.geojsonTrace);
                }
            }


        });

        return MapView;
    });
