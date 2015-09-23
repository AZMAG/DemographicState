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
                    window.open(emailURL, '', 'resizable=no,location=no,menubar=no,scrollbars=no,status=no,toolbar=no,fullscreen=no,dependent=no,width=600px,height=660px');
                };

            }; //end emailWin

            return emailWin;

        } //end function

    )

} ());

