/**
 * Utilities function
 */
define(['underscore', 'backbone', 'jquery'], function (_, Backbone, $) {

    var Util = {};

    Util.convertStatusToString = function (status) {

        switch(status){
            case 1:
                return "UNKNOWN";
            case 2:
                return "IN_THE_ROOM";
            case 3:
                return "IN_A_TABLE";
            case 4:
                return "IN_A_FULL_TABLE";
        }


    }

    return Util;
});