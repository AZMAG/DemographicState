/**
 * used to launch warning window
 *
 * @class warning-vm
 */

(function () {

    "use strict";

    define([
        'dojo/dom-construct',
        'dojo/topic',
        'dojo/text!app/views/alert1-view.html'
    ],

        function (dc, tp, view) {

            var alert1VM = new function () {

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
                   // Place the HTML from the view into the main application after the map div.
                    //dc.place(view, "map", "after");
                    dc.place(view, "mapContainer", "after");

                    $("#alert1Window").kendoWindow({
                        width: "300px",
                        height: "265px",
                        title: "",
                        actions: ["Close"],
                        modal: true,
                        visible: false,
                        resizable: false
                    }).data("kendoWindow");

                    // Wire up the click event buttons
                    $("#warningCancel").click(function () {
                        self.closeWindow();
                        tp.publish("AlertCancel", { msg: "Cancel" });
                    });

                    $("#warningYes").click(function () {
                        self.closeWindow();
                        tp.publish("AlertYes", { msg: "Yes" });
                    });

                } // end init
//****************************************************************
                /**
                Method for opening the window.

                @method openWindow
                **/
                self.openWindow = function () {
                    var win = $("#alert1Window").data("kendoWindow");
                    win.center();
                    win.open();
                };

                /**
                 Method for closing the window.

                 @method closeWindow
                 **/
                self.closeWindow = function () {
                    var win = $("#alert1Window").data("kendoWindow");
                    win.close();
                };

              }; // end AlertVM

            return alert1VM;

      } // end function
    )
} ());