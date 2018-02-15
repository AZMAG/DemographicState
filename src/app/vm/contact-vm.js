/**
 * Print div used to print maps
 *
 * @class print-vm
 */
(function() {

    "use strict";

    define([
            "dojo",
            "dojo/dom-construct",
            "dojo/topic",
            "dojo/text!app/views/contacts-view.html"
        ],
        function(dj, dc, tp, view) {


            var contactVM = new function() {

                var self = this;
                self.windowTitle = "Contacts";

                self.winWidth = document.documentElement.clientWidth;

                self.init = function() {
                    dc.place(view, "mapContainer", "after");

                    tp.subscribe("contStateO", function() {
                        self.openWindow();
                    });
                    tp.subscribe("contStateC", function() {
                        self.closeWindow();
                    });

                    var contWindow = $("#contactsWindowDiv").kendoWindow({
                        width: "650px",
                        height: "600px",
                        title: self.windowTitle,
                        actions: ["Minimize", "Close"],
                        modal: true,
                        visible: false,
                        resizable: false
                    }).data("kendoWindow").center();

                }; //end init

                /**
                Method for opening the window.

                @method openWindow
                **/
                self.openWindow = function() {
                    // show the window
                    var win = $("#contactsWindowDiv").data("kendoWindow");
                    win.restore();
                    win.center();
                    win.open();
                    ga('send', 'event', 'Click', 'Opened Window', 'Contact Window');
                };

                self.closeWindow = function() {
                    var win = $("#contactsWindowDiv").data("kendoWindow");
                    win.close();
                };

            }; //end contactsVM

            return contactVM;

        } //end function
    );
}());