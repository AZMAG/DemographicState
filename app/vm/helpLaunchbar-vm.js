/**
* Launches the Main Map Help Window.
*
*
*/

(function () {

    "use strict";

    define([
        'dojo/dom-construct',
        'dojo/text!app/views/mainHelp-view.html',
        'app/vm/email-vm',
        'dojo/text!app/views/helplaunchbar-view.html',
        'app/vm/help-vm'
    ],
        function (dc, helpView, emailVM, view, helpVM) {

            var launchBar = new function () {

                var self = this;

                self.windowTitle = "MAG Demographic Viewer Help";

                self.init = function (relatedElement, relation) {
                    dc.place(view, relatedElement, relation);
                };//end init

                self.openHelp = function () {
                    helpVM.openWindow(helpView);

                    emailVM.init();
                    kendo.bind($("#mainHelpWindow"), emailVM);
                    return false;
                };

            };//end launchBar

            return launchBar;

        } // end function
    )

} ());
