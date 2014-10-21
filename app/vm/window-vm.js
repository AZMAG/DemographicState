/**
 * Simple class demonstrating use of Kendo window control.
 *
 * @class window-vm
 */

(function () {

    "use strict";

    define([
        "dojo/dom-construct",
        "vendor/kendo/web/js/jquery.min",
        "vendor/kendo/web/js/kendo.web.min"
    ],
        function (dc) {

            var WindowVM = new function () {

                /**
                 * Store reference to module this object.
                 *
                 * @property self
                 * @type {*}
                 */
                var self = this;

                /**
                 * Initialize the class.
                 *
                 * @method init
                 */
                self.init = function () {
                    // Create a new div inside the display dive from index.html.
                    var node = dc.create("div", {id: "tempWindow"}, "display", "first");

                    // Turn the div into a Kendo window.
                    var chartWindow = $("#tempWindow").kendoWindow({
                        width: "505px",
                        height: "315px",
                        title: "Temp Window",
                        actions: ["Help", "Minimize", "Close"],
                        modal: false,
                        visible: false
                    }).data("kendoWindow");

                    // Set up click event on custom help button.
                    var helpButton = chartWindow.wrapper.find(".k-i-help");
                    helpButton.click(function () {
                        $("#tempWindow").data("kendoWindow").content("<strong>Help Clicked!</strong>");
                    });

                }; // end init

                /**
                 * Open the window and place it in the center of the browser.
                 *
                 * @method openWindow
                 */
                self.openWindow = function () {
                    var win = $("#tempWindow").data("kendoWindow");
                    win.center();
                    win.open();
                };
            };

            return WindowVM;
        }
    );
} ());