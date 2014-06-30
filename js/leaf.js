var VILLAGE = "Village";
var POINT_HAUT = "Point haut";

/*New map*/
var pilatMap = L.map('map').setView([51.505, -0.09], 13);
//mapProviderUrl = 'http://{s}.tile.thunderforest.com/cycle/{z}/{x}/{y}.png';
var mapProviderUrl = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
//mapProviderUrl = 'http://[abc].tile.thunderforest.com/outdoors/${z}/${x}/${y}.png'

/*Markers on map*/
var pilatMarkers = [];

/*Add OpenStreetMap layer*/
var pilatOSMLayer = L.tileLayer(mapProviderUrl, {
    attribution: 'To defined OSM',
    opacity: 0.5,
}).addTo(pilatMap);

/*Add geojson layer*/
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

    pilatMap.fitBounds(geojsonPilatBounds.getBounds());
    geojsonPilatBounds.addTo(pilatMap);

    //Add PilatLayer layer
    var pilatOSMLayer = L.TileLayer.boundaryCanvas(mapProviderUrl, {
        boundary: latLngGeom,
        opacity: 1,
        maxZoom: 18
    }).addTo(pilatMap);

});

/*Highlight a feature when event on marker*/

function highlightFeature(e) {
    info.update(e.target.feature.properties)
}

/*Reset event on marker*/

function resetHighlight(e) {
    info.update();
}

/*Zoom on feature event on marker*/

function zoomOnFeature(e) {

    var marker = e.target;

    // Remove events
    $.each(pilatMarkers, function(key, value) {
        value.off('mouseover', highlightFeature);
        value.off('mouseout', resetHighlight);
        value.off('click', zoomOnFeature);
    });

    // Increase control size 
    $('.info').addClass("zoom");
    info.update(marker.feature.properties, true);
}

/*Dezoom on feature event on marker*/

function deZoomOnFeature(e) {

    // Add events
    $.each(pilatMarkers, function(key, value) {
        value.on('mouseover', highlightFeature);
        value.on('mouseout', resetHighlight);
        value.on('click', zoomOnFeature);
    });

    // Decrease control size 
    $('.info').removeClass("zoom");
    info.update();
}

var info = L.control();

info.onAdd = function(map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

// method that we will use to update the control based on feature properties passed
info.update = function(props, large) {

    var htmlContent = '';

    if (props) {
        htmlContent += '<h4>' + props.type;

        if (large) {
            htmlContent += "<span id='infoClosedButton'>CLOSED</span>";
        }
        htmlContent += "</h4><h5>" + props.name + "</h5>";

        // Display content depends of the feature type
        if (props.type === VILLAGE) {
            htmlContent += "<span class='field'>Habitants</span>: " + props.habitants + "<br><span class='field'>Web</span>: " + "<a href='" + props.site_web + "'>" + props.site_web + "</a>";
        }
        if (props.type === POINT_HAUT) {
            htmlContent += "<span class='field'>Altitude</span>: " + props.altitude + "m <br><img src='" + props.image + "'>";
        }


    } else {
        htmlContent += '<h4>Point of interest</h4>';
    }

    $('.info').html(htmlContent);

    if (large) {
        // Attached dezoom to close button
        $('#infoClosedButton').one("click", deZoomOnFeature);
    }

};

info.addTo(pilatMap);

/*Add geojson layer for markers*/
$.getJSON("./geojson/POI.geo.json", function(data) {
    var geojsonPilatPOI = L.geoJson(data, {

        // Return custom markers
        pointToLayer: function(feature, latlng) {

            // Icon depends of feature
            var icon;
            if (feature.properties.type === VILLAGE) {
                icon = L.icon({
                    iconUrl: '/leaf/img/icon/smallcity.png'
                });
            }
            if (feature.properties.type === POINT_HAUT) {
                icon = L.icon({
                    iconUrl: '/leaf/img/icon/peak.png'
                });
            }

            var marker = L.marker(latlng, {
                title: feature.properties.name,
                icon: icon
            }).on({
                mouseover: highlightFeature,
                mouseout: resetHighlight,
                click: zoomOnFeature
            });;
            pilatMarkers.push(marker);
            return marker;
        },

        // Bind popup to layers for each feature
        onEachFeature: function(feature, layer) {
            //layer.bindPopup(feature.properties.name);
        }
    });

    geojsonPilatPOI.addTo(pilatMap);

});
