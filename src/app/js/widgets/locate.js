"use strict";
require([
        "esri/widgets/Locate/LocateViewModel",
        "dojo/topic",
        "dojo/domReady!"
    ],
<<<<<<< HEAD
    function(LocateViewModel, tp) {
        tp.subscribe("map-loaded", function() {
=======
    function (LocateViewModel, tp) {
        tp.subscribe("widget-home-loaded", function () {
>>>>>>> Jack-Develop-Branch
            //Locate
            const locateId = "locateWidget";
            let locateVM = new LocateViewModel({
                view: app.view
            });

            app.view.ui.add(locateId, "bottom-right");

            $("#" + locateId).click(function() {
                locateVM.locate().then(function() {
                    // <!-- comments:uncomment // -->
                    // ga("send", "event", "Click", "Geo Location Click", "geolocationButton");
                    // <!-- endcomments -->
                });
            });
<<<<<<< HEAD
        });
    }
);
=======

            tp.publish("widget-locate-loaded");
        });
    });
>>>>>>> Jack-Develop-Branch
