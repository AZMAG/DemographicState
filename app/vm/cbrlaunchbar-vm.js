/**
* Launches the Map Categories Window.
*
* @class CBR
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

                self.windowTitle = "Maps";

                self.init = function (relatedElement, relation) {
                    dc.place("<span id=\"cbrlaunchbar\" title=\"Maps\"><a id=\"launchCBR\" class=\"nav\" role=\"button\" href=\"#\" data-bind=\"click: openCBR\">Maps</a></span>", relatedElement, relation);
                }

                self.openCBR = function () {
                    if ($("#cbrWindow").is(':hidden')){
                        tp.publish('CBRStateO', { name: 'Open' });
                    } else {
                        tp.publish('CBRStateC', { name: 'Close' });
                    }
                    return false;
                };//end openCBR

            };//end

            return launchBar;
        }
    )
} ());