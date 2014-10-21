/**
* Launches the Legal Window.
*
*
*/

(function () {

    "use strict";

    define([
        "dojo/dom-construct",
        "dojo/topic",
        "dojo/text!app/views/legal-view.html",
        "app/vm/email-vm",
    ],
        function (dc, tp, legalView, emailVM) {

            var legal = new function () {

                var self = this;

                self.windowTitle = "Legal Disclaimer";

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

                self.init = function () {

                    // Place the HTML from the view into the main application after the map div.
                    dc.place(legalView, "map", "after");

                    $("#legalWindow").kendoWindow({
                        width: self.newWindowWidth,
                        height: self.newWindowHeight,
                        title: self.windowTitle,
                        actions: ["Close"],
                        modal: true,
                        visible: false,
                        resizable: false
                    }).data("kendoWindow");

                    emailVM.init();
                    kendo.bind($("#legalWindow"), emailVM);



                }; //end init
//****************************************************************
                /**
                 * Open the window and initialize the contents.
                 *
                 * @method openWindow
                 * @param {string} content - the content to display in the window.
                 */
                self.openLegalwin = function () {
                    var win = $("#legalWindow").data("kendoWindow");
                        win.center();
                        win.open();
                };

            }; //end legalWindow

            return legal;

        } // end function
    );

} ());