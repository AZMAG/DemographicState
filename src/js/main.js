require([
        "esri/Map",
        "esri/views/MapView",
        "dojo/topic",
        "dojo/domReady!"
    ],
    function (Map, MapView, tp) {

        app.map = new Map({
            basemap: "gray"
        });

        app.view = new MapView({
            container: "viewDiv",
            map: app.map,
            extent: app.config.initExtent,
            constraints: {
                rotationEnabled: false,
                minZoom: 7,
                snapToZoom: false
            },
            ui: {
                components: []
            }
        });

        app.view.when(function () {
            $.getJSON(app.config.mainUrl + '/?f=json', function (data) {
                for (var i = 0; i < data.layers.length; i++) {
                    var layer = data.layers[i];
                    for (var j = 0; j < app.config.layers.length; j++) {
                        var conf = app.config.layers[j];
                        if ('Census10_' + conf.layerName === layer.name) {
                            conf["censusIndex"] = layer.id;
                        } else if ('ACS_' + conf.layerName === layer.name) {
                            conf["ACSIndex"] = layer.id;
                        }
                        app.config.layerDef[conf.id] = conf;
                    }
                }
                tp.publish("map-loaded");
            });
        });
    });
