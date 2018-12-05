require([
    "dojo/parser",
    "app/maps/maps",
    "app/",
    "dojo/topic",
    "dojo/domReady!"
],
    function (parser, mapsVm, tp) {
        parser.parse()


        // $.getJSON(app.config.mainUrl + '/?f=json', function (data) {
        //     for (var i = 0; i < data.layers.length; i++) {
        //         var layer = data.layers[i];
        //         for (var j = 0; j < app.config.layers.length; j++) {
        //             var conf = app.config.layers[j];
        //             if ('Census10_' + conf.layerName === layer.name) {
        //                 conf["censusIndex"] = layer.id;
        //             } else if ('ACS_' + conf.layerName === layer.name) {
        //                 conf["ACSIndex"] = layer.id;
        //             }
        //             app.config.layerDef[conf.id] = conf;
        //         }
        //     }
        // });
    }
)
