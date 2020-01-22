"use strict";
define([
        "../maps/maps-utils",
        "esri/widgets/Home/HomeViewModel",
        "dojo/topic",
        "dojo/domReady!"
],  function (
    mapsutils,
    HomeViewModel,
    tp) {
        tp.subscribe("widget-zoom-loaded", function () {
            const homeId = "homeWidget";
            let homeVM = new HomeViewModel({
                view: mapsutils.view
            });

            mapsutils.view.ui.add(homeId, "bottom-right");

            $("#" + homeId).click(function() {
                homeVM.go();
            });
            tp.publish("widget-home-loaded");
        });
    });