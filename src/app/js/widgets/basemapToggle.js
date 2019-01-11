"use strict";
require([
        'esri/widgets/BasemapToggle/BasemapToggleViewModel',
        'dojo/topic',
        'dojo/domReady!'
    ],
    function(BasemapToggleViewModel, tp) {
        tp.subscribe("map-loaded", function() {

            //Basemap
            const basemapId = "basemapToggle";

            let toggleVM = new BasemapToggleViewModel({
                view: app.view,
                nextBasemap: 'hybrid'
            });

            app.view.ui.add(basemapId, 'bottom-right');
            let toggled = true;

            $("#" + basemapId).click(function() {
                if (toggled) {
                    $(this).attr("title", "Map");
                } else {
                    $(this).attr("title", "Satellite");
                }
                toggled = !toggled;
                toggleVM.toggle();
            });
        });
    }
);