"use strict";
require([
        "esri/widgets/BasemapToggle/BasemapToggleViewModel",
        "dojo/topic",
        "dojo/domReady!"
    ],
<<<<<<< HEAD
    function(BasemapToggleViewModel, tp) {
        tp.subscribe("map-loaded", function() {
=======
    function (BasemapToggleViewModel, tp) {
        tp.subscribe("widget-locate-loaded", function () {
>>>>>>> Jack-Develop-Branch

            //Basemap
            const basemapId = "basemapToggle";

            let toggleVM = new BasemapToggleViewModel({
                view: app.view,
                nextBasemap: "hybrid"
            });

            app.view.ui.add(basemapId, "bottom-right");
            let $toggleSelector = $("#" + basemapId);
            let toggled = true;

<<<<<<< HEAD
            $("#" + basemapId).click(function() {
=======
            function ToggleBasemap() {
>>>>>>> Jack-Develop-Branch
                if (toggled) {
                    $toggleSelector.attr("title", "Map");
                } else {
                    $toggleSelector.attr("title", "Satellite");
                }
                toggled = !toggled;
                toggleVM.toggle();
            }

            $toggleSelector.click(function () {
                ToggleBasemap();
            });
<<<<<<< HEAD
        });
    }
);
=======

            if (app.initConfig && app.initConfig.basemap) {
                if (app.initConfig.basemap !== "gray") {
                    ToggleBasemap();
                }
            }
            tp.publish("widget-basemapToggle-loaded");
        });
    });
>>>>>>> Jack-Develop-Branch
