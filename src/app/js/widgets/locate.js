require([
        'esri/widgets/Locate/LocateViewModel',
        'dojo/topic',
        'dojo/domReady!'
    ],
    function (LocateViewModel, tp) {
        tp.subscribe("map-loaded", function () {
            //Locate
            const locateId = "locateWidget";
            let locateVM = new LocateViewModel({
                view: app.view
            });

            app.view.ui.add(locateId, 'bottom-right');

            $("#" + locateId).click(function () {
                locateVM.locate().then(function () {
                    // <!-- comments:uncomment // -->
                    // ga("send", "event", "Click", "Geo Location Click", "geolocationButton");
                    // <!-- endcomments -->
                });
            });
        })
    })
