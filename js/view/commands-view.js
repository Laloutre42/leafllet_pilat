define(['backbone', 'resthub', 'hbs!template/commands', 'view/itinerary-view', 'view/poi-view'],
    function(Backbone, Resthub, commandsTemplate, ItineraryView, PoiView) {

        var CommandsView = Resthub.View.extend({

            /**
             * Template
             */
            template: commandsTemplate,

            /**
             * Events
             */
            events: {},

            /**
             * Initialize
             * @param options
             */
            initialize: function(attributes) {

                // Events aggregator object
                this.vent = attributes.vent;
                                
                // Render the view and the sub view
                this.render();
                new PoiView({ root: $('#poi'), vent: this.vent});     
                new ItineraryView({ root: $('#itinerary'), vent: this.vent});     

            }

        });

        return CommandsView;
    });
