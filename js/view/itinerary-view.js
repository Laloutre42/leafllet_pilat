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

        });

        return ItineraryView;
    });
