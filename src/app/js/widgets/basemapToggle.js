require([
        'esri/widgets/BasemapToggle/BasemapToggleViewModel',
        'dojo/topic',
        'dojo/domReady!'
    ],
    function (BasemapToggleViewModel, tp) {
        tp.subscribe("widget-locate-loaded", function () {

            //Basemap
            const basemapId = "basemapToggle";

            let toggleVM = new BasemapToggleViewModel({
                view: app.view,
                nextBasemap: 'hybrid'
            });

            app.view.ui.add(basemapId, 'bottom-right');
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

            if (app.initConfig && app.initConfig.basemap) {
                if (app.initConfig.basemap !== 'gray') {
                    ToggleBasemap();
                }
            }
            tp.publish('widget-basemapToggle-loaded');
        })
    })
