"use strict";
require([
        "esri/widgets/Home/HomeViewModel",
        "dojo/topic",
        "dojo/domReady!"
    ],
    function (HomeViewModel, tp) {
        tp.subscribe("widget-zoom-loaded", function () {
            const homeId = "homeWidget";
            let homeVM = new HomeViewModel({
                view: app.view
            });

            app.view.ui.add(homeId, "bottom-right");

            $("#" + homeId).click(function() {
                homeVM.go();
            });
            tp.publish("widget-home-loaded");
        });
    });
