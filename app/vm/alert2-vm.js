/**
 * used to launch warning window
 *
 * @class warning-vm
 */

(function () {

    "use strict";

    define([
        "dojo/dom-construct",
        "dojo/topic",
        "dojo/text!app/views/alert2-view.html"
    ],

        function (dc, tp, view) {

            var alert2VM = new function () {

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
                    dc.place(view, "map", "after");

                    $("#alert2Window").kendoWindow({
                        width: "300px",
                        height: "200px",
                        title: "",
                        actions: ["Close"],
                        modal: true,
                        visible: false,
                        resizable: false
                    }).data("kendoWindow");

                }; // end init
//****************************************************************
                /**
                Method for opening the window.

                @method openWindow
                **/
                self.openWindow = function () {
                    var win = $("#alert2Window").data("kendoWindow");
                    win.center();
                    win.open();
                };

              }; // end AlertVM

            return alert2VM;

      } // end function
    );
} ());