"use strict";
require([
    "esri/widgets/Search",
    "esri/tasks/Locator",
    "esri/Map",
    "esri/views/MapView",
    "dojo/topic"
], function (
    Search, Locator, Map, MapView, tp
) {
    tp.subscribe("widget-basemapToggle-loaded", function () {
        var search = new Search({
            view: app.view
        });
        app.view.ui.add(search, "bottom-right");
        tp.publish("widget-search-loaded");
    });
});
