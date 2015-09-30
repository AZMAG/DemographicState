/**
 * Generic help window for launching content-specific help.
 *
 * @class help-vm
 */

(function() {

    "use strict";

    define([
            "dojo/dom-construct",
            "dojo/dom",
            "dojo/text!app/views/help-view.html",
            "dojo/text!app/views/legal-view.html",
            "app/vm/legal-vm",
            "dojo/text!app/views/subscribe-view.html",
            "app/vm/subscribe-vm"
        ],
        function(dc, dom, view, legalView, legalVM, subscribeView, subscribeVM) {

            var HelpVM = new function() {

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
                self.windowTitle = "Help";

                self.winWidth = document.documentElement.clientWidth;
                self.winHeight = document.documentElement.clientHeight;
                //console.log("Height: " + self.winHeight + " & " + "Width: " + self.winWidth);

                self.newWindowWidth = self.winWidth;

                if (self.winWidth <= 668) {
                    self.newWindowWidth = "480px";
                    self.newWindowHeight = "325px";
                } else if (self.winWidth <= 800) {
                    self.newWindowWidth = "500px";
                    self.newWindowHeight = "400px";
                } else if (self.winWidth <= 992) {
                    self.newWindowWidth = "550px";
                    self.newWindowHeight = "400px";
                } else {
                    self.newWindowWidth = "550px";
                    self.newWindowHeight = "400px";
                }

                /**
                 * Initialize the class.
                 *
                 * @method init
                 */
                self.init = function() {
                    // Place the HTML from the view into the main application after the map div.
                    dc.place(view, "mapContainer", "after");

                    $("#helpWindow").kendoWindow({
                        width: self.newWindowWidth,
                        height: self.newWindowHeight,
                        title: "",
                        actions: ["Close"],
                        modal: true,
                        visible: false
                    });

                }; //end init
                //****************************************************************
                /**
                 * Open the window and initialize the contents.
                 *
                 * @method openWindow
                 * @param {string} content - the content to display in the window.
                 */
                self.openWindow = function(content) {
                    var win = $("#helpWindow").data("kendoWindow");
                    win.content(content);
                    win.center();
                    win.open();

                    // added for tabs in main window help. vw
                    $("#tabstrip").kendoTabStrip({
                        animation: {
                            open: {
                                effects: "fadeIn"
                            }
                        }
                    });

                    // adds version number and date to main help menu
                    // configured in main config file
                    $("#version").html(appConfig.Version);

                    $("#EmailList").bind("click", function() {
                        subscribeVM.openWindow(subscribeView);
                    });

                    $("#legal").bind("click", function() {
                        legalVM.openLegalwin(legalView);
                    });

                };

            }; // end HelpVM

            return HelpVM;
        } // end function
    );

}());