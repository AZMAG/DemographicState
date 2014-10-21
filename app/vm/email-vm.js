/**
* Launches the email Window.
*
*/

(function () {

    "use strict";

    define([

    ],

        function () {

            var emailWin = new function () {
                /**
                 * Store reference to module this object.
                 *
                 * @property self
                 * @type {*}
                 */

                var self = this;

                self.init = function () {

                };//end init

                self.openEmailwin = function () {
                    var emailURL = appConfig.jasonemail;

                    // used to center popup in dual-screen computers
                    // Fixes dual-screen position               Most browsers      Firefox
                    var dualScreenLeft = window.screenLeft != undefined ? window.screenLeft : screen.left;
                    var dualScreenTop = window.screenTop != undefined ? window.screenTop : screen.top;
                    var w = 600;
                    var h = 660;
                    var width = window.innerWidth ? window.innerWidth : document.documentElement.clientWidth ? document.documentElement.clientWidth : screen.width;
                    var height = window.innerHeight ? window.innerHeight : document.documentElement.clientHeight ? document.documentElement.clientHeight : screen.height;

                    var left = ((width / 2) - (w / 2)) + dualScreenLeft;
                    var top = ((height / 2) - (h / 2)) + dualScreenTop;

                    var newWindow = window.open(emailURL, "", "resizable=no,location=no,menubar=no,status=no,toolbar=no,fullscreen=no,dependent=no,directories=no,copyhistory=no,scrollbars=no, width=" + w + ", height=" + h + ", top=" + top + ", left=" + left);

                    // Puts focus on the newWindow
                    if (window.focus) {
                        newWindow.focus();
                    }
                };

            }; //end emailWin

            return emailWin;

        } //end function

    );

} ());

