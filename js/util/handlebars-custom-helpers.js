/**
 * Set of custom handlebars helpers
 */
define(['handlebars-orig', 'moment', 'util', 'underscore-string'], function (Handlebars, moment, Util) {

    /**
     * Display a user in the list
     * Json properties are name, status, sessionId
     */
    Handlebars.registerHelper('displayUser', function () {

        return new Handlebars.SafeString(
            "<tr><td>" + this.name + "</td><td>" + Util.convertStatusToString(this.status) + "</td><td>" + this.sessionId + "</td></tr>"
        );
    });

    /**
     * Display a table in the grid
     * Json properties are id, playersDisplayed
     */
    Handlebars.registerHelper('displayTableInGrid', function (id, model) {

        var result = "<tr><td class='vert-align'>" + this.id + "</td>";

        _.each(this.players, function (elem, index){
            result += '<td class="vert-align">';

            // A player is in the table
            if (!elem.botUser){
                result += "<p><label>" + elem.name + "</label></p>";
                result += '<p><img src="/css/images/custom/unknown.jpg" alt="unknown" class="img-thumbnail"></p>';
                if (id == model.id){
                    result += "<p><button id='leaveTable' class='form-control btn btn-warning btn-xs' data-id=" + id + " >Leave</button></p>";
                }
                result += "</div>"
            }
            // No player in the table
            else{
                if (model.connectedInATable){
                    result += "<p>Waiting</p>"
                }
                else{
                    result += "<p><button id='joinTable' class='form-control btn btn-warning btn-xs' data-id=" + id + " data-position=" + index + ">Join</button></p>";
                }
            }
        });
        result += "</td></tr>";

        return new Handlebars.SafeString(result);
    });

    return Handlebars;

});
