define(['backbone', 'resthub', 'hbs!template/itinerary'],
    function(Backbone, Resthub, itineraryTemplate) {

        var ItineraryView = Resthub.View.extend({

            /**
             * Template
             */
            template: itineraryTemplate,

            /**
             * Events
             */
            events: {
                'show.bs.collapse .panel-collapse': 'addTrace',
                'hide.bs.collapse .panel-collapse': 'removeTrace'
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
             * Add trace and POI on the map
             * @param event
             */
            addTrace: function(event) {
                this.vent.trigger("addTrace", event.target.value);
            },

            /**
             * Remove trace and POI on the map
             * @param event
             */
            removeTrace: function(event) {
                this.vent.trigger("removeTrace");
            }                            

        });

        return ItineraryView;
    });
