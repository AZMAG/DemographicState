/**
 * Generic subscribe window for launching content-specific subscribe.
 *
 * @class subscribe-vm
 */

(function() {

    "use strict";

    define([
            "dojo/dom-construct",
            "dojo/dom",
            "dojo/text!app/views/subscribe-view.html",
        ],
        function(dc, dom, view) {

            var SubscribeVM = new function() {

                /**
                 * Store reference to module this object.
                 *
                 * @property self
                 * @type {*}
                 */
                var self = this;

                /**
                 * Base title for the window.
                 *
                 * @property windowTitle
                 * @type {string}
                 */
                self.windowTitle = "Subscribe";

                self.winWidth = document.documentElement.clientWidth;
                self.winHeight = document.documentElement.clientHeight;

                self.newWindowWidth = self.winWidth;

                if (self.winWidth <= 668) {
                    self.newWindowWidth = "280px";
                    self.newWindowHeight = "125px";
                } else if (self.winWidth <= 800) {
                    self.newWindowWidth = "300px";
                    self.newWindowHeight = "200px";
                } else if (self.winWidth <= 992) {
                    self.newWindowWidth = "350px";
                    self.newWindowHeight = "200px";
                } else {
                    self.newWindowWidth = "350px";
                    self.newWindowHeight = "200px";
                }

                /**
                 * Initialize the class.
                 *
                 * @method init
                 */
                self.init = function() {
                    // Place the HTML from the view into the main application after the map div.
                    dc.place(view, "mapContainer", "after");

                    $("#subscribeWindow").kendoWindow({
                        width: self.newWindowWidth,
                        height: self.newWindowHeight,
                        title: self.windowTitle,
                        actions: ["Close"],
                        modal: true,
                        visible: false,
                        resizable: false
                    }).data("kendoWindow");

                }; //end init
                //****************************************************************
                /**
                 * Open the window and initialize the contents.
                 *
                 * @method openWindow
                 * @param {string} content - the content to display in the window.
                 */
                self.openWindow = function(content) {
                    var win = $("#subscribeWindow").data("kendoWindow");
                    win.content(content);
                    win.center();
                    win.open();

                    $("#btnSubscribe").bind("click", function() {
                        win.close();
                    });
                };



            }; // end SubscribeVM

            return SubscribeVM;
        } // end function
    );

}());