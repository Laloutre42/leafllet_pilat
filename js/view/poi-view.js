define(['backbone', 'resthub', 'hbs!template/poi'],
    function(Backbone, Resthub, poiTemplate) {

        var PoiView = Resthub.View.extend({

            /**
             * Template
             */
            template: poiTemplate,

            /**
             * Events
             */
            events: {
                'change .poiFilter': 'addOrRemovePoi'
            },

            /**
             * Initialize
             * @param options
             */
            initialize: function(attributes) {

                // Events aggregator object
                this.vent = attributes.vent;
                                
                this.render();
            },

            /**
             * Add or remove specified POI on the map
             * @param event
             */
            addOrRemovePoi: function(event) {
                this.vent.trigger("addOrRemovePoi", event.target.value);
            }

        });

        return PoiView;
    });
