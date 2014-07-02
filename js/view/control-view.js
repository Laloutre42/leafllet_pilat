define(['backbone', 'resthub', 'hbs!template/control'],
    function(Backbone, Resthub, controlTemplate) {

        var ControlView = Resthub.View.extend({

            /**
             * Template
             */
            template: controlTemplate,

            /**
             * Events
             */
            events: {
                //'change .poiFilter': 'addOrRemovePoi'
            },

            /**
             * Initialize
             * @param options
             */
            initialize: function(attributes) {

                controlView = this;                

                // Events aggregator object
                this.vent = attributes.vent;

                _.bindAll(this, "createControl");
                _.bindAll(this, "update");
                this.vent.on("createControl", this.createControl);
                this.vent.on("update", this.update);

                this.render();
            },

            /**
             * Add or remove specified POI on the map
             * @param event
             */
            createControl: function(pilatMap) {

                // Create control
                CustomControl = L.Control.extend({
                    options: {
                        position: 'topright'
                    },

                    onAdd: function(map) {
                        // create the control container with a particular class name
                        var container = L.DomUtil.create('div', 'info');

                        // ... initialize other DOM elements, add listeners, etc.
                        controlView.update();

                        return container;
                    }
                });

                // Add to map 
                info = new CustomControl()
                pilatMap.addControl(info);
            },

            // method that we will use to update the control based on feature properties passed
            update: function(constants, props, large) {

                var htmlContent = '';

                if (props) {
                    htmlContent += '<h4>' + props.type;

                    if (large) {
                        htmlContent += "<span id='infoClosedButton'>CLOSE</span>";
                    }
                    htmlContent += "</h4><h5>" + props.name + "</h5>";

                    // Display content depends of the feature type
                    if (props.type === constants.VILLAGE) {
                        htmlContent += "<span class='field'>Habitants</span>: " + props.habitants + "<br><span class='field'>Web</span>: " + "<a href='" + props.site_web + "'>" + props.site_web + "</a>";
                    }
                    if (props.type === constants.POINT_HAUT) {
                        htmlContent += "<span class='field'>Altitude</span>: " + props.altitude + "m <br><img src='" + props.image + "'>";
                    }


                } else {
                    htmlContent += '<h4>Point of interest</h4>';
                }

                $('.info').html(htmlContent);

                if (large) {
                    // Increase control size 
                    $('.info').addClass("zoom");
                    // Attached dezoom to close button
                    $('#infoClosedButton').one("click", controlView.deZoomOnFeature);
                } else {
                    // Decrease control size 
                    if ($('.info').hasClass("zoom")) {
                        $('.info').removeClass("zoom");
                    }
                }

            },

            /**
             * Dezoom feature event on marker
             * @param event
             */

            deZoomOnFeature: function(event) {
                mapView.vent.trigger("deZoomOnFeature"); 
            }            

        });

        return ControlView;
    });
