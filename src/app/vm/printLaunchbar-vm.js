/**
 * Launches the Print Map Window.
 *
 *
 */
(function() {

    "use strict";

    define([
            "dojo/dom-construct",
            "dojo/topic"
        ],
        function(dc, tp) {

            var launchPrint = new function() {

                var self = this;

                self.windowTitle = "Print Map";

                self.init = function(relatedElement, relation) {
                    dc.place("<span id=\"printlaunchbar\" title=\"Print Map\"><a id=\"launchPrint\" class=\"nav\" role=\"button\" href=\"#\" data-bind=\"click: openPrint\">Print Map</a></span>", relatedElement, relation);
                }; //end init

                self.openPrint = function() {
                    if ($("#printWindow").is(":hidden")) {
                        tp.publish("printStateO", {
                            name: "Open"
                        });
                    } else {
                        tp.publish("printStateC", {
                            name: "Close"
                        });
                    }
                    return false;
                }; // end openPrint

            }; //end

            return launchPrint;
        }
    );
}());