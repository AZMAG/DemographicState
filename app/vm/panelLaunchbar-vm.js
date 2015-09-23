/**
* Launches the Reports Window.
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

                self.windowTitle = "Reports";

                self.init = function (relatedElement, relation) {
                    dc.place("<span id=\"rplaunchbar\" title=\"Reports\"><a id=\"launchReports\" class=\"nav\" role=\"button\" href=\"#\" data-bind=\"click: openReports\">Reports</a></span>", relatedElement, relation);
                };//end init

                self.openReports = function () {
                    if ($("#reportLauncher").is(':hidden')) {
                        tp.publish('panelStateO', { name: 'Open' });
                    } else {
                        tp.publish('panelStateC', { name: 'Close' });
                    }
                    return false;
                };//end openReports

            };//end

            return launchBar;
        }
    )
} ());