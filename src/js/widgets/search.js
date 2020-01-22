"use strict";
define([
    "../maps/maps-utils",
    "esri/widgets/Search",
    "esri/tasks/Locator",
    "esri/Map",
    "esri/views/MapView",
    "esri/geometry/Extent",
    "dojo/topic"
], function (
    mapsutils,
    Search,
    Locator,
    Map,
    MapView,
    Extent,
    tp
) {
    tp.subscribe("widget-print-loaded", function () {

        let search = new Search({
            view: mapsutils.view,
            includeDefaultSources: false,
            sources: [{
                locator: new Locator({
                    url: "https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer"
                }),
                singleLineFieldName: 'SingleLine',
                outFields: ["Addr_type"],
                autoNavigate: true,
                searchExtent: new Extent({
                    xmin: -114.68,
                    ymin: 31.29,
                    xmax: -109.06,
                    ymax: 36.99
                }),
                placeholder: '302 N 1st Ave, Phoenix, AZ'
            }]
        });


        //https://community.esri.com/thread/216034-search-widgetin-onfocusout-in-47-causes-error-when-used-with-jquery
        //This is a temporary workaround that prevents an error caused by ESRI's JS Api when used with Jquery.
        const handler = search.on('search-focus', event => {
            handler.remove();
            let $searchDiv = $(".esri-search");
            const input = $searchDiv.find('.esri-search__input')[0];
            if (input) {
                input.onfocusout = null;
            }
        });

        mapsutils.view.ui.add(search, "bottom-right");
        tp.publish("widget-search-loaded");
    });
});
