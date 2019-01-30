"use strict";
require([
        "esri/widgets/Home/HomeViewModel",
        "dojo/topic",
        "dojo/domReady!"
    ],
<<<<<<< HEAD
    function(HomeViewModel, tp) {
        tp.subscribe("map-loaded", function() {
=======
    function (HomeViewModel, tp) {
        tp.subscribe("widget-zoom-loaded", function () {
>>>>>>> Jack-Develop-Branch
            const homeId = "homeWidget";
            let homeVM = new HomeViewModel({
                view: app.view
            });

            app.view.ui.add(homeId, "bottom-right");

            $("#" + homeId).click(function() {
                homeVM.go();
            });
<<<<<<< HEAD
        });
    }
);
=======
            tp.publish("widget-home-loaded");
        });
    });
>>>>>>> Jack-Develop-Branch
