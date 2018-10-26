require([
        "esri/widgets/BasemapToggle/BasemapToggleViewModel",
        'esri/widgets/Locate',
        'esri/widgets/Locate/LocateViewModel',
        'dojo/topic',
        'dojo/domReady!'
    ],
    function (BasemapToggleViewModel, Locate, LocateViewModel, tp) {

        tp.subscribe("map-loaded", setupWidgets);

        function setupWidgets() {}
    });
