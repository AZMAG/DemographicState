"use strict";
define([
        "mag/config/initConfig",
        "mag/maps/maps-utils",
        "esri/widgets/BasemapToggle/BasemapToggleViewModel",
        "dojo/topic",
        "dojo/domReady!"
    ],
    function (
        initConfig,
        mapsutils,
        BasemapToggleViewModel,
        tp
        ) {
        tp.subscribe("widget-locate-loaded", function () {

            //Basemap
            const basemapId = "basemapToggle";

            let toggleVM = new BasemapToggleViewModel({
                view: mapsutils.view,
                nextBasemap: "hybrid"
            });

            mapsutils.view.ui.add(basemapId, "bottom-right");
            let $toggleSelector = $("#" + basemapId);
            let toggled = true;

            function ToggleBasemap() {
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

            if (initConfig.checkBasemap('gray') === false) {
                    ToggleBasemap();
            }
            tp.publish("widget-basemapToggle-loaded");
        });
    });
