/*New map*/
var pilatMap = L.map('map').setView([51.505, -0.09], 13);

/*Add OpenStreetMap layer*/
var pilatOSMLayer = L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: 'To defined OSM',
    opacity: 0.5,
}).addTo(pilatMap);

/*Add geojson layer*/
$.getJSON("./geojson/map_pilat_geojson.json", function(data) {
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

    pilatMap.fitBounds(geojsonPilatBounds.getBounds());
    geojsonPilatBounds.addTo(pilatMap);

    //Add PilatLayer layer
    var pilatOSMLayer = L.TileLayer.boundaryCanvas('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        boundary: latLngGeom,
        opacity: 1,
        maxZoom: 18
    }).addTo(pilatMap);

});

/*Highlight a feature when event on marker*/
function highlightFeature(e) {
    var marker = e.target;
    info.update(marker.options.title)
}

/*Reset event on marker*/
function resetHighlight(e) {
    info.update();
}


var info = L.control();

info.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function(props) {
    if (props) {
        this._div.innerHTML = '<h4>Point of interest</h4>' + props;
    }
    else{
         this._div.innerHTML = '<h4>Point of interest</h4><br>';
    }
};

info.addTo(pilatMap);




/*Add geojson layer for markers*/
$.getJSON("./geojson/POI_geojson.json", function(data) {
    var geojsonPilatPOI = L.geoJson(data, {

        // Return custom markers
        pointToLayer: function(feature, latlng) {
            return L.marker(latlng, {
                title: feature.properties.name
            }).on({
                mouseover: highlightFeature,
                mouseout: resetHighlight
            });;
        },

        // Bind popup to layers for each feature
        onEachFeature: function(feature, layer) {
            //layer.bindPopup(feature.properties.name);
        }
    });

    geojsonPilatPOI.addTo(pilatMap);

});
