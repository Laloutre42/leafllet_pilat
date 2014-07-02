define(['backbone', 'resthub', 'hbs!template/commands'],
    function(Backbone, Resthub, commandsTemplate) {

        var CommandsView = Resthub.View.extend({

            /**
             * Template
             */
            template: commandsTemplate,

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

        return CommandsView;
    });
