/**
* Launches the Legend Window.
*
* @class Panel
*/

(function () {

    "use strict";

    define([
        'dojo/dom-construct',
        'dojo/topic'
    ],
        function (dc, tp) {

            var launchBar = new function () {

                var self = this;

                self.windowTitle = "Legend";

                self.init = function (relatedElement, relation) {
                    dc.place("<span id=\"leglaunchbar\" title=\"Legend\"><a id=\"launchLegend\" class=\"nav\" role=\"button\" href=\"#\" data-bind=\"click: openLegend\">Legend</a></span>", relatedElement, relation);
                };//end init

                self.openLegend = function () {
                    if ($("#legendWindowDiv").is(':hidden')) {
                        tp.publish('legendStateO', { name: 'Open' });
                    } else {
                        tp.publish('legendStateC', { name: 'Close'});
                    }
                    return false;
                };//end openLegend

            };//end

            return launchBar;
        }
    )
} ());