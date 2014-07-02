define(['backbone', 'bootstrap', 'view/map-view', 'view/commands-view'],
    function (Backbone, Bootstrap, MapView, CommandsView) {

        var AppRouter = Backbone.Router.extend({

            initialize: function () {

                // Start Backbone history
                Backbone.history.start({ pushState: true, root: "/" });
            },

            routes: {
                '': 'home'
            },

            home: function () {

                // This general object is used for event aggregator between views
                this.vent = _.extend({}, Backbone.Events);

                new MapView({ root: $('#mapContainer'), vent: this.vent});              
                new CommandsView({ root: $('#commandsContainer'), vent: this.vent});

            }

        });

        return AppRouter;

    });