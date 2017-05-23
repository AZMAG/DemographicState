/**
 * Launches the Contacts Window.
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

            var launchContactBar = new function() {

                var self = this;

                self.windowTitle = "Contacts";

                self.init = function(relatedElement, relation) {
                    dc.place("<span id=\"contactLaunchbar\" title=\"Contacts\"><a id=\"launchContacts\" class=\"nav\" role=\"button\" href=\"#\" data-bind=\"click: openContacts\">Contacts</a></span>", relatedElement, relation);
                }; //end init

                self.openContacts = function() {
                    if ($("#contactsWindowDiv").is(":hidden")) {
                        tp.publish("contStateO", {
                            name: "Open"
                        });
                    } else {
                        tp.publish("contStateC", {
                            name: "Close"
                        });
                    }
                }; // end openContacts

            }; //end

            return launchContactBar;
        }
    );
}());