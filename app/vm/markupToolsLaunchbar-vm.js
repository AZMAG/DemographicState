/**
* Launches the Markup Tools Window.
*
* @class Panel
*/

(function () {

    "use strict";

    define([
        "dojo/dom-construct",
        "dojo/topic",
    ],
        function (dc, tp) {

            var launchBar = new function () {

                var self = this;

                self.windowTitle = "Markup Tools";

                self.init = function (relatedElement, relation) {
                    dc.place("<span id=\"mtlaunchbar\" title=\"Markup Tools\" style=\"height: inherit; float: right\"><a id=\"launchMarkupTools\" class=\"nav\" role=\"button\" href=\"#\" data-bind=\"click: openMarkupTools\">Markup Tools</a></span>", relatedElement, relation);
                };//end init

                self.openMarkupTools = function () {
                    if ($("#markupToolsLauncher").is(":hidden")) {
                        tp.publish("MarkupToolsStateO", { name: "Open" });
                    } else {
                        tp.publish("MarkupToolsStateC", { name: "Close" });
                    }
                };//end openMarkupTools

            };//end

            return launchBar;
        }
    );
} ());