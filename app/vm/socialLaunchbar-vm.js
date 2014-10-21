/**
* Launches the Share/Social Window.
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

                self.windowTitle = "Share";

                self.init = function (relatedElement, relation) {
                    dc.place("<span id=\"sharelaunchbar\" title=\"Share\"><a id=\"launchShare\" class=\"nav\" role=\"button\" href=\"#\" data-bind=\"click: openShare\">Share</a></span>", relatedElement, relation);
                };// end init

                self.openShare = function () {
                    if ($("#shareWindowDiv").is(":hidden")) {
                        tp.publish("shareStateO", { name: "Open" });
                    } else {
                        tp.publish("shareStateC", { name: "Close"});
                    }
                };// end openShare

            };//end

            return launchBar;
        }
    );
}());