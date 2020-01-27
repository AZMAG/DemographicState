"use strict";
define([
        "../maps/maps-utils",
        "esri/widgets/Locate/LocateViewModel",
        "dojo/topic",
        "dojo/domReady!"
    ],
    function (
        mapsutils,
        LocateViewModel,
        tp) {
        tp.subscribe("widget-home-loaded", function () {
            //Locate
            const locateId = "locateWidget";
            let locateVM = new LocateViewModel({
                view: mapsutils.view
            });

            mapsutils.view.ui.add(locateId, "bottom-right");

            $("#" + locateId).click(function () {
                locateVM.locate().then(function () {
                    // <!-- comments:uncomment // -->
                    // ga("send", "event", "Click", "Geo Location Click", "geolocationButton");
                    // <!-- endcomments -->
                });
            });

            tp.publish("widget-locate-loaded");
        });
    });
